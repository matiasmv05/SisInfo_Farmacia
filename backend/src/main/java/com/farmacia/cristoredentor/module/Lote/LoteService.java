package com.farmacia.cristoredentor.module.Lote;

import com.farmacia.cristoredentor.Entity.Lote;
import com.farmacia.cristoredentor.Enum.EstadoLote;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.Lote.dto.LoteDetalleDTO;
import com.farmacia.cristoredentor.module.Lote.dto.LoteRequestDTO;
import com.farmacia.cristoredentor.module.OrdenCompra.OrdenCompraRepository;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class LoteService {

    private final LoteRepository        loteRepo;
    private final ProductoRepository    productoRepo;
    private final OrdenCompraRepository ordenCompraRepo;
    private final ModelMapper           modelMapper;

    public LoteService(LoteRepository loteRepo,
                       ProductoRepository productoRepo,
                       OrdenCompraRepository ordenCompraRepo,
                       ModelMapper modelMapper) {
        this.loteRepo        = loteRepo;
        this.productoRepo    = productoRepo;
        this.ordenCompraRepo = ordenCompraRepo;
        this.modelMapper     = modelMapper;
    }

    // =========================================================================
    // CREAR — entrada directa (sin orden de compra)
    // =========================================================================

    /**
     * Crea un lote por entrada directa.
     * El trigger fn_sync_stock_total en la DB actualiza producto.stock_total
     * automáticamente al insertar el lote.
     */
    public LoteDetalleDTO crearEntradaDirecta(LoteRequestDTO dto) {
        Producto producto = buscarProductoActivo(dto.getProductoId());
        validarLoteNoDuplicado(dto.getProductoId(), dto.getNumeroLote());

        Lote lote = Lote.builder()
            .producto(producto)
            .numeroLote(dto.getNumeroLote().trim())
            .cantidad(dto.getCantidad())
            .fechaVencimiento(dto.getFechaVencimiento())
            .costoUnitario(dto.getCostoUnitario())
            .estado(EstadoLote.activo)
            // ordenCompra null: es entrada directa, permitido por el schema
            .build();

        return toDetalleDTO(loteRepo.save(lote));
    }

    // =========================================================================
    // LEER
    // =========================================================================

    @Transactional(readOnly = true)
    public LoteDetalleDTO obtenerPorId(Integer id) {
        return toDetalleDTO(buscarLote(id));
    }

    @Transactional(readOnly = true)
    public PaginatedResponseDto<LoteDetalleDTO> listarPorProducto(
            Integer productoId, Integer page, Integer limit) {

        // Validar que el producto exista antes de paginar
        buscarProductoActivo(productoId);

        Pageable pageable = PageRequest.of(page, limit,
            Sort.by("fechaVencimiento").ascending());
        Page<Lote> resultado = loteRepo.findByProductoId(productoId, pageable);

        List<LoteDetalleDTO> data = resultado.getContent()
            .stream()
            .map(this::toDetalleDTO)
            .toList();

        return new PaginatedResponseDto<>(data, page, limit,
            (int) resultado.getTotalElements());
    }

    @Transactional(readOnly = true)
    public PaginatedResponseDto<LoteDetalleDTO> listarPorEstado(
            String estadoParam, Integer page, Integer limit) {

        EstadoLote estado = parsearEstado(estadoParam);
        Pageable pageable = PageRequest.of(page, limit,
            Sort.by("fechaVencimiento").ascending());
        Page<Lote> resultado = loteRepo.findByEstado(estado, pageable);

        List<LoteDetalleDTO> data = resultado.getContent()
            .stream()
            .map(this::toDetalleDTO)
            .toList();

        return new PaginatedResponseDto<>(data, page, limit,
            (int) resultado.getTotalElements());
    }

    // =========================================================================
    // MARCAR VENCIDO
    // =========================================================================

    /**
     * Marca un lote como vencido con su motivo.
     * Delega la lógica de estado en el método de dominio de la entidad.
     * El trigger fn_sync_stock_total descuenta el stock del producto automáticamente.
     */
    public LoteDetalleDTO marcarVencido(Integer id, String motivo) {
        Lote lote = buscarLote(id);
        lote.setMotivoBaja(motivo); // lanza IllegalStateException si ya es VENCIDO
        return toDetalleDTO(loteRepo.save(lote));
    }

    // =========================================================================
    // DESCUENTO FEFO — usado internamente por MovimientoService
    // =========================================================================

    /**
     * Descuenta 'cantidad' unidades del producto usando FEFO.
     * Opera sobre múltiples lotes si es necesario.
     * Retorna los lotes modificados para que MovimientoService registre
     * los movimientos de inventario correspondientes.
     *
     * Este método es package-private: solo lo llama MovimientoService
     * dentro del mismo contexto transaccional.
     *
     * @throws BusinessException si el stock total disponible es insuficiente
     */
    List<Lote> descontarStockFEFO(Integer productoId, int cantidadTotal) {
        List<Lote> lotesFEFO = loteRepo.findActivosByProductoOrdenadosFEFO(
            productoId, EstadoLote.activo);

        int disponible = lotesFEFO.stream()
            .mapToInt(Lote::getCantidad)
            .sum();

        if (disponible < cantidadTotal) {
            throw new BusinessException(
                String.format(
                    "Stock insuficiente para el producto id=%d. " +
                    "Disponible: %d, solicitado: %d.",
                    productoId, disponible, cantidadTotal
                )
            );
        }

        List<Lote> lotesModificados = new java.util.ArrayList<>();
        int restante = cantidadTotal;

        for (Lote lote : lotesFEFO) {
            if (restante == 0) break;

            int aDescontar = Math.min(lote.getCantidad(), restante);
            lote.setCantidad(lote.getCantidad() - aDescontar); // método de dominio de la entidad
            lotesModificados.add(lote);
            restante -= aDescontar;
        }

        // Persistir todos los lotes modificados en una sola operación
        loteRepo.saveAll(lotesModificados);
        return lotesModificados;
    }

    // =========================================================================
    // Métodos internos
    // =========================================================================

    Lote buscarLote(Integer id) {
        return loteRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Lote no encontrado: " + id));
    }

    private Producto buscarProductoActivo(Integer id) {
        // ProductoRepository trabaja con Long, la entidad usa long en el schema
        // Si tu ProductoRepository usa Long, convierte aquí
        return productoRepo.findByIdAndActivoTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Producto activo no encontrado: " + id));
    }

    private void validarLoteNoDuplicado(Integer productoId, String numeroLote) {
        if (loteRepo.existsByProductoIdAndNumeroLote(productoId, numeroLote.trim())) {
            throw new BusinessException(
                String.format(
                    "Ya existe un lote '%s' para el producto id=%d.",
                    numeroLote, productoId
                )
            );
        }
    }

    private EstadoLote parsearEstado(String estado) {
        try {
            return EstadoLote.valueOf(estado.toUpperCase());
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
            lote.getOrdenCompra() != null ? lote.getOrdenCompra().getId() : null
        );
        return dto;
    }
}