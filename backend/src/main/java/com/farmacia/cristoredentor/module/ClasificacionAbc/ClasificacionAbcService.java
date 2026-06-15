package com.farmacia.cristoredentor.module.ClasificacionAbc;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.farmacia.cristoredentor.Entity.ClasificacionAbcDetalle;
import com.farmacia.cristoredentor.Entity.ClasificacionAbcHistorial;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.Enum.ClasificacionABC;
import com.farmacia.cristoredentor.Enum.UserRole;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcDetalleDTO;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcHistorialDTO;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcRequestDTO;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ValorInventarioProductoDTO;
import com.farmacia.cristoredentor.module.Configuracion_sistema.configuracionSistemaRepository;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(readOnly = true)
@Slf4j
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

 @Scheduled(cron = "0 0 2 1 1,4,7,10 *")
@Transactional
public void calcularAbcAutomatico() {
    Usuario usuario = usuarioRepo
        .findFirstByRolAndActivoTrue(UserRole.ADMINISTRADOR)
        .orElse(null);

    if (usuario == null) {
        log.warn("[ABC Scheduler] No se encontró administrador activo.");
        return;
    }

    try {
        ejecutarCalculo(usuario, "Cálculo automático trimestral");
        log.info("[ABC Scheduler] Cálculo ABC completado exitosamente.");
    } catch (Exception e) {
        log.error("[ABC Scheduler] Error: {}", e.getMessage(), e);
    }
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
        .map(c -> c.getValor()).orElse(BigDecimal.valueOf(80));
    BigDecimal umbralB = configuracionRepo.findById("abc_umbral_b")
        .map(c -> c.getValor()).orElse(BigDecimal.valueOf(95));
    int periodoMeses = configuracionRepo.findById("abc_periodo_meses")
        .map(c -> c.getValor().intValue()).orElse(3);

    OffsetDateTime desde = OffsetDateTime.now().minusMonths(periodoMeses);

    List<ValorInventarioProductoDTO> valores =
        detalleRepo.calcularValorRotacionPorProducto(desde);

    if (valores.isEmpty()) {
        throw new BusinessException(String.format(
            "No hay movimientos de salida en los últimos %d meses para calcular ABC.",
            periodoMeses));
    }

    BigDecimal total = valores.stream()
        .map(ValorInventarioProductoDTO::getValorInventario)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    if (total.compareTo(BigDecimal.ZERO) <= 0) {
    throw new BusinessException(
        "El total de unidades despachadas es cero o negativo. " +
        "Verifique los movimientos de inventario del período.");
    }

    // ─── Calcular detalles en memoria (sin historial aún) ────────────
    List<ClasificacionAbcDetalle> detalles = new ArrayList<>();
    List<Integer> idsConRotacion = new ArrayList<>();
    BigDecimal acumulado = BigDecimal.ZERO;

    for (ValorInventarioProductoDTO fila : valores) {
        BigDecimal valorProducto = fila.getValorInventario();

         if (valorProducto.compareTo(BigDecimal.ZERO) <= 0) {
        log.warn("[ABC] Producto {} omitido — valor no positivo: {}",
            fila.getProductoId(), valorProducto);
        continue;
    }

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

        Producto producto = productoRepo.getReferenceById(fila.getProductoId());
        idsConRotacion.add(fila.getProductoId());

        // ← historial = null por ahora, se asigna después
        detalles.add(ClasificacionAbcDetalle.builder()
            .producto(producto)
            .valorInventario(valorProducto)
            .porcentajeIndividual(pctIndividual)
            .porcentajeAcumulado(acumulado.min(BigDecimal.valueOf(100)))
            .clasificacion(clasificacion)
            .build());

        productoRepo.actualizarClasificacionAbc(fila.getProductoId(), clasificacion);
    }

    // Productos SIN rotación → C automático
    productoRepo.findByActivoTrue().stream()
        .filter(p -> !idsConRotacion.contains(p.getId()))
        .forEach(p -> {
            detalles.add(ClasificacionAbcDetalle.builder()
                .producto(p)
                .valorInventario(BigDecimal.ZERO)
                .porcentajeIndividual(BigDecimal.ZERO)
                .porcentajeAcumulado(BigDecimal.valueOf(100))
                .clasificacion(ClasificacionABC.C)
                .build());
            productoRepo.actualizarClasificacionAbc(p.getId(), ClasificacionABC.C);
        });

    // ─── Guardar historial con datos completos ────────────────────────
    ClasificacionAbcHistorial historial = historialRepo.save(
        ClasificacionAbcHistorial.builder()
            .usuario(usuario)
            .fechaCalculo(OffsetDateTime.now())
            .totalProductos(detalles.size())
            .valorTotalInv(total)
            .completado(true)
            .observaciones(String.format("%s | Período: últimos %d meses (desde %s)",
                observaciones != null ? observaciones : "Cálculo ABC",
                periodoMeses,
                desde.toLocalDate()))
            .build()
    );

    // ─── Asignar historial persistido a cada detalle y guardar ────────
    detalles.forEach(d -> d.setHistorial(historial));
    detalleRepo.saveAll(detalles);

    return toHistorialDTO(historial, detalles);
}


@Async
public void recalcularAbcPostMovimiento() {
    // Buscar cualquier administrador activo como autor del recálculo automático.
    // Si no hay ninguno (caso raro), el recálculo se omite silenciosamente.
    Usuario usuario = usuarioRepo
        .findFirstByRolAndActivoTrue(UserRole.ADMINISTRADOR)
        .orElse(null);
 
    if (usuario == null) {
        log.warn("[ABC Post-Movimiento] No hay administrador activo — recálculo omitido.");
        return;
    }
 
    try {
        ejecutarCalculo(usuario, "Recálculo automático post-movimiento");
        log.info("[ABC Post-Movimiento] Recálculo completado.");
    } catch (BusinessException e) {
        // BusinessException ocurre cuando no hay movimientos en el período.
        // Es un estado válido (farmacia nueva, período de configuración largo).
        // No loguear como error para no contaminar los logs.
        log.debug("[ABC Post-Movimiento] Sin datos suficientes: {}", e.getMessage());
    } catch (Exception e) {
        // Cualquier otro error no debe romper nada — la salida ya fue registrada.
        log.error("[ABC Post-Movimiento] Error inesperado: {}", e.getMessage(), e);
    }
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
                .unidadesDespachadas(d.getValorInventario())
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
            .totalUnidadesDespachadas (h.getValorTotalInv())
            .observaciones(h.getObservaciones())
            .completado(h.isCompletado())
            .detalles(detalleDTOs)
            .build();
    }
}