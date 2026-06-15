package com.farmacia.cristoredentor.module.Lote;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmacia.cristoredentor.Entity.Lote;
import com.farmacia.cristoredentor.Entity.OrdenCompra;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Enum.EstadoLote;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.Alerta.AlertaRepository;
import com.farmacia.cristoredentor.module.Lote.dto.LoteDetalleDTO;
import com.farmacia.cristoredentor.module.Lote.dto.LoteRequestDTO;
import com.farmacia.cristoredentor.module.Lote.dto.ResultadoDesconteStock;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@Service
@Transactional
public class LoteService {

    private final AlertaRepository alertaRepository;
    private final LoteRepository loteRepo;
    private final ModelMapper modelMapper;

    public LoteService(LoteRepository loteRepo, ModelMapper modelMapper, AlertaRepository alertaRepository) {
        this.loteRepo = loteRepo;
        this.modelMapper = modelMapper;
        this.alertaRepository = alertaRepository;
    }

    // =========================================================================
    // Métodos package-private — solo los llama MovimientoService
    // =========================================================================

    public Lote crearLote(LoteRequestDTO dto, Producto producto) {
        validarLoteNoDuplicado(producto.getId(), dto.getNumeroLote());

        Lote lote = Lote.builder()
            .producto(producto)
            .numeroLote(dto.getNumeroLote().trim())
            .cantidad(dto.getCantidad())
            .fechaVencimiento(dto.getFechaVencimiento())
            .costoUnitario(dto.getCostoUnitario())
            .estado(EstadoLote.activo)
            .build();

        return loteRepo.save(lote);
        // El producto ya viene validado desde MovimientoService
        // El stock lo actualiza MovimientoService llamando a ProductoService
    }


   /**
     * Descuenta stock siguiendo FEFO (First Expired, First Out).
     *
     * El query usa PESSIMISTIC_WRITE (SELECT FOR UPDATE) para evitar
     * condiciones de carrera cuando dos operaciones concurrentes intentan
     * descontar del mismo producto.
     *
     * El método valida primero el stock apto (considerando diasMinimosVenta)
     * para dar un mensaje de error único y claro antes de mutar cualquier lote.
     */

  public List<ResultadoDesconteStock> descontarStockFEFO(Integer productoId, int cantidadTotal) {
 
        // El lock pesimista está en el repository — bloquea los lotes
        // hasta que esta transacción haga commit o rollback.
        List<Lote> lotesFEFO = loteRepo
            .findActivosByProductoOrdenadosFEFO(productoId, EstadoLote.activo);
 
        // Calcular stock APTO considerando diasMinimosVenta desde el inicio.
        // Así el mensaje de error es siempre coherente con lo que realmente
        // puede despacharse — no hay dos validaciones contradictorias.
        int disponibleApto = calcularDisponibleApto(lotesFEFO);
 
        if (disponibleApto < cantidadTotal) {
            int disponibleTotal = lotesFEFO.stream().mapToInt(Lote::getCantidad).sum();
 
            if (disponibleTotal < cantidadTotal) {
                throw new BusinessException(String.format(
                    "Stock insuficiente para producto id=%d. " +
                    "Disponible: %d, solicitado: %d.",
                    productoId, disponibleTotal, cantidadTotal
                ));
            } else {
                // Hay stock total pero no apto — algunos lotes están en período de restricción
                throw new BusinessException(String.format(
                    "Stock insuficiente para producto id=%d. " +
                    "Hay %d unidades pero solo %d aptas para venta " +
                    "(el resto está dentro del período mínimo antes del vencimiento). " +
                    "Solicitado: %d.",
                    productoId, disponibleTotal, disponibleApto, cantidadTotal
                ));
            }
        }
 
        List<ResultadoDesconteStock> resultados = new ArrayList<>();
        List<Lote> modificados = new ArrayList<>();
        int restante = cantidadTotal;
 
        for (Lote lote : lotesFEFO) {
            if (restante == 0) break;
            if (!esLoteApto(lote)) continue;
 
            int aDescontar = Math.min(lote.getCantidad(), restante);
 
            // ORDEN IMPORTANTE: guardar el resultado ANTES de mutar el lote.
            // ResultadoDesconteStock puede guardar referencia a la entidad lote,
            // así que si mutamos primero, el snapshot de cantidad quedaría incorrecto.
            resultados.add(new ResultadoDesconteStock(lote, aDescontar));
 
            lote.setCantidad(lote.getCantidad() - aDescontar);
            if (lote.getCantidad() == 0) lote.setEstado(EstadoLote.agotado);
            modificados.add(lote);
 
            restante -= aDescontar;
        }
        
 
        loteRepo.saveAll(modificados);
 
        return resultados;
    }

    public Lote crearOActualizarLote(String numeroLote, int cantidad,
        LocalDate fechaVencimiento, BigDecimal costo,
        Producto producto, OrdenCompra orden) {

    return loteRepo.findByProductoIdAndNumeroLote(producto.getId(), numeroLote)
        .map(lote -> {
            lote.setCantidad(lote.getCantidad() + cantidad);
            lote.setCostoUnitario(costo);
            lote.setEstado(EstadoLote.activo);
            return loteRepo.save(lote);
        })
        .orElseGet(() -> {
            Lote nuevo = Lote.builder()
                .producto(producto)
                .numeroLote(numeroLote)
                .cantidad(cantidad)
                .fechaVencimiento(fechaVencimiento)
                .costoUnitario(costo)
                .estado(EstadoLote.activo)
                .ordenCompra(orden)
                .build();
            return loteRepo.save(nuevo);
        });
}


    public ResultadoDesconteStock marcarVencido(Integer loteId, String motivo) {
    Lote lote = buscarLote(loteId);

    if (lote.getEstado() == EstadoLote.vencido) {
        throw new BusinessException("El lote id=" + loteId + " ya está vencido.");
    }

    int cantidadAntes = lote.getCantidad();

    lote.setEstado(EstadoLote.vencido);
    lote.setFechaBaja(OffsetDateTime.now());
    lote.setMotivoBaja(motivo);
    lote.setCantidad(0);
    loteRepo.save(lote);

    return new ResultadoDesconteStock(lote, cantidadAntes);
}
    // =========================================================================
    // Métodos públicos — lectura, los controllers pueden llamarlos
    // =========================================================================

    @Transactional(readOnly = true)
    public LoteDetalleDTO obtenerPorId(Integer id) {
        return toDetalleDTO(buscarLote(id));
    }

    @Transactional(readOnly = true)
    public PaginatedResponseDto<LoteDetalleDTO> listarPorProducto(
            Integer productoId, int page, int limit) {

        Pageable pageable = PageRequest.of(page, limit,
            Sort.by("fechaVencimiento").ascending());
        Page<Lote> resultado = loteRepo.findByProductoId(productoId, pageable);

        return toPaginatedResponse(resultado, page, limit);
    }

    @Transactional(readOnly = true)
    public PaginatedResponseDto<LoteDetalleDTO> listarPorEstado(
            String estadoParam, int page, int limit) {

        EstadoLote estado = parsearEstado(estadoParam);
        Pageable pageable = PageRequest.of(page, limit,
            Sort.by("fechaVencimiento").ascending());
        Page<Lote> resultado = loteRepo.findByEstado(estado, pageable);

        return toPaginatedResponse(resultado, page, limit);
    }


    public Lote buscarLote(Integer id) {
        return loteRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Lote no encontrado: " + id));
    }

    public void guardar(Lote lote){
        loteRepo.save(lote);
    }

    public LoteDetalleDTO marcarVencidoComoDTO(Integer loteId, String motivo) {
    ResultadoDesconteStock resultado = marcarVencido(loteId, motivo);
    alertaRepository.cerrarAlertasPorLote(loteId, OffsetDateTime.now());
    return toDetalleDTO(resultado.getLote());
    }
    // =========================================================================
    // Internos privados
    // =========================================================================

    private int calcularDisponibleApto(List<Lote> lotes) {
        return lotes.stream()
            .filter(lote -> esLoteApto(lote))
            .mapToInt(Lote::getCantidad)
            .sum();
    }


    private boolean esLoteApto(Lote lote) {
    Integer diasMinimos = lote.getProducto().getDiasMinimosVenta();
    if (diasMinimos == null) return true;

    long diasRestantes = ChronoUnit.DAYS.between(
        LocalDate.now(), lote.getFechaVencimiento());

    return diasRestantes >= diasMinimos;
}

    private void validarLoteNoDuplicado(Integer productoId, String numeroLote) {
        if (loteRepo.existsByProductoIdAndNumeroLote(productoId, numeroLote.trim())) {
            throw new BusinessException(String.format(
                "Ya existe un lote '%s' para el producto id=%d.",
                numeroLote, productoId
            ));
        }
    }

    private EstadoLote parsearEstado(String estado) {
        try {
            return EstadoLote.valueOf(estado.toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(
                "Estado inválido: '" + estado + "'. " +
                "Valores permitidos: activo, agotado, vencido."
            );
        }
    }

    private LoteDetalleDTO toDetalleDTO(Lote lote) {
        LoteDetalleDTO dto = modelMapper.map(lote, LoteDetalleDTO.class);
        dto.setProductoId(lote.getProducto().getId());
        dto.setProductoNombre(lote.getProducto().getNombre());
        dto.setOrdenCompraId(
            lote.getOrdenCompra() != null ? lote.getOrdenCompra().getId() : null);
        return dto;
    }

    private PaginatedResponseDto<LoteDetalleDTO> toPaginatedResponse(
            Page<Lote> page, int pageNum, int limit) {

        List<LoteDetalleDTO> data = page.getContent().stream()
            .map(this::toDetalleDTO)
            .toList();

        return new PaginatedResponseDto<>(data, pageNum, limit,
            (int) page.getTotalElements());
    }

    
}
