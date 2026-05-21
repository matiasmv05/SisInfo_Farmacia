package com.farmacia.cristoredentor.module.ClasificacionAbc;

import com.farmacia.cristoredentor.Entity.ClasificacionAbcDetalle;
import com.farmacia.cristoredentor.Entity.ClasificacionAbcHistorial;
import com.farmacia.cristoredentor.Entity.Lote;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcDetalleDTO;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcHistorialDTO;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcRequestDTO;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;
import com.farmacia.cristoredentor.module.Configuracion_sistema.configuracionSistemaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.farmacia.cristoredentor.Enum.ClasificacionABC;
import com.farmacia.cristoredentor.Enum.EstadoLote;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ValorInventarioProductoDTO;

@Service
@Transactional(readOnly = true)
public class ClasificacionAbcService {

    private final ClasificacionAbcHistorialRepository historialRepo;
    private final ClasificacionAbcDetalleRepository   detalleRepo;
    private final ProductoRepository                  productoRepo;
    private final usuarioRepository                   usuarioRepo;
    private final configuracionSistemaRepository      configuracionRepo;

    public ClasificacionAbcService(
            ClasificacionAbcHistorialRepository historialRepo,
            ClasificacionAbcDetalleRepository detalleRepo,
            ProductoRepository productoRepo,
            usuarioRepository usuarioRepo,
            configuracionSistemaRepository configuracionRepo) {
        this.historialRepo     = historialRepo;
        this.detalleRepo       = detalleRepo;
        this.productoRepo      = productoRepo;
        this.usuarioRepo       = usuarioRepo;
        this.configuracionRepo = configuracionRepo;
    }

    // -------------------------------------------------------------------------
    // Scheduler nocturno — 2am todos los días
    // -------------------------------------------------------------------------

    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void calcularAbcAutomatico() {
        usuarioRepo.findById(1)
            .ifPresent(u -> ejecutarCalculo(u, "Cálculo automático nocturno"));
    }

    // -------------------------------------------------------------------------
    // Disparo manual
    // -------------------------------------------------------------------------

    @Transactional
    public ClasificacionAbcHistorialDTO calcularManual(
            Integer usuarioId, ClasificacionAbcRequestDTO dto) {

        Usuario usuario = usuarioRepo.findById(usuarioId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Usuario no encontrado: " + usuarioId));

        return ejecutarCalculo(usuario, dto.getObservaciones());
    }

    // -------------------------------------------------------------------------
    // Lógica central
    // -------------------------------------------------------------------------

    @Transactional
    public ClasificacionAbcHistorialDTO ejecutarCalculo(
            Usuario usuario, String observaciones) {

        BigDecimal umbralA = configuracionRepo.findById("abc_umbral_a")
            .map(c -> c.getValor())
            .orElse(BigDecimal.valueOf(80));

        BigDecimal umbralB = configuracionRepo.findById("abc_umbral_b")
            .map(c -> c.getValor())
            .orElse(BigDecimal.valueOf(95));

        // Historial incompleto — si falla a mitad queda completado = false
        ClasificacionAbcHistorial historial = ClasificacionAbcHistorial.builder()
            .usuario(usuario)
            .totalProductos(0)
            .completado(false)
            .observaciones(observaciones)
            .build();
        historial = historialRepo.save(historial);

       List<ValorInventarioProductoDTO> valores = detalleRepo.calcularValorInventarioPorProducto(EstadoLote.activo);

        if (valores.isEmpty()) {
            historialRepo.delete(historial);
            throw new BusinessException(
                "No hay lotes activos para calcular ABC");
        }

        BigDecimal total = valores.stream()
            .map(ValorInventarioProductoDTO::getValorInventario)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ClasificacionAbcDetalle> detalles = new ArrayList<>();
        BigDecimal acumulado = BigDecimal.ZERO;

        for (ValorInventarioProductoDTO fila : valores) {
            BigDecimal valorProducto = fila.getValorInventario();

            BigDecimal pctIndividual = valorProducto
                .multiply(BigDecimal.valueOf(100))
                .divide(total, 3, RoundingMode.HALF_UP);

            acumulado = acumulado.add(pctIndividual);

            ClasificacionABC clasificacion;
            if (acumulado.compareTo(umbralA) <= 0) {
                clasificacion = ClasificacionABC.A;
            } else if (acumulado.compareTo(umbralB) <= 0) {
                clasificacion = ClasificacionABC.B;
            } else {
                clasificacion = ClasificacionABC.C;
            }

            Producto producto = productoRepo.getReferenceById(
                fila.getProductoId());

            detalles.add(ClasificacionAbcDetalle.builder()
                .historial(historial)
                .producto(producto)
                .valorInventario(valorProducto)
                .porcentajeIndividual(pctIndividual)
                .porcentajeAcumulado(acumulado.min(BigDecimal.valueOf(100)))
                .clasificacion(clasificacion)
                .build());

            productoRepo.actualizarClasificacionAbc(
                fila.getProductoId(), clasificacion);
        }

        detalleRepo.saveAll(detalles);

        historial.setTotalProductos(detalles.size());
        historial.setValorTotalInv(total);
        historial.setCompletado(true);
        historialRepo.save(historial);

        return toHistorialDTO(historial, detalles);
    }

    // -------------------------------------------------------------------------
    // Consultas
    // -------------------------------------------------------------------------

    public ClasificacionAbcHistorialDTO obtenerUltimoCalculo() {
        ClasificacionAbcHistorial historial = historialRepo
            .findTopByCompletadoTrueOrderByFechaCalculoDesc()
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "No hay cálculos ABC completados"));

        List<ClasificacionAbcDetalle> detalles = detalleRepo
            .findByHistorialIdOrderByPorcentajeAcumuladoAsc(historial.getId());

        return toHistorialDTO(historial, detalles);
    }

    public PaginatedResponseDto<ClasificacionAbcHistorialDTO> listarHistorial(
            Integer page, Integer limit) {

        Pageable pageable = PageRequest.of(page, limit,
            Sort.by("fechaCalculo").descending());

        Page<ClasificacionAbcHistorial> resultado =
            historialRepo.findByCompletadoTrue(pageable);

        List<ClasificacionAbcHistorialDTO> data = resultado.getContent()
            .stream()
            .map(h -> toHistorialDTO(h, Collections.emptyList()))
            .toList();

        return new PaginatedResponseDto<>(data, page, limit,
            (int) resultado.getTotalElements());
    }

    public ClasificacionAbcHistorialDTO obtenerHistorialPorId(Integer id) {
        ClasificacionAbcHistorial historial = historialRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Historial ABC no encontrado: " + id));

        List<ClasificacionAbcDetalle> detalles = detalleRepo
            .findByHistorialIdOrderByPorcentajeAcumuladoAsc(id);

        return toHistorialDTO(historial, detalles);
    }

    // -------------------------------------------------------------------------
    // Privados
    // -------------------------------------------------------------------------

    private ClasificacionAbcHistorialDTO toHistorialDTO(
            ClasificacionAbcHistorial h,
            List<ClasificacionAbcDetalle> detalles) {

        List<ClasificacionAbcDetalleDTO> detalleDTOs = detalles.stream()
            .map(d -> ClasificacionAbcDetalleDTO.builder()
                .productoId(d.getProducto().getId())
                .productoNombre(d.getProducto().getNombre())
                .laboratorio(d.getProducto().getLaboratorio())
                .valorInventario(d.getValorInventario())
                .porcentajeIndividual(d.getPorcentajeIndividual())
                .porcentajeAcumulado(d.getPorcentajeAcumulado())
                .clasificacion(d.getClasificacion().name())
                .build())
            .toList();

        return ClasificacionAbcHistorialDTO.builder()
            .id(h.getId())
            .fechaCalculo(h.getFechaCalculo())
            .usuarioNombre(h.getUsuario().getNombreCompleto())
            .totalProductos(h.getTotalProductos())
            .valorTotalInv(h.getValorTotalInv())
            .observaciones(h.getObservaciones())
            .completado(h.isCompletado())
            .detalles(detalleDTOs)
            .build();
    }
}