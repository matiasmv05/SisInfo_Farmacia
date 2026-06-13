package com.farmacia.cristoredentor.module.Inventario;

import com.farmacia.cristoredentor.Entity.*;
import com.farmacia.cristoredentor.module.Inventario.dto.*;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventarioServiceImpl implements InventarioService {

    private final EntityManager entityManager;
    private final LoteRepository loteRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;

    public InventarioServiceImpl(
            EntityManager entityManager,
            LoteRepository loteRepository,
            MovimientoInventarioRepository movimientoRepository,
            ProductoRepository productoRepository) {
        this.entityManager = entityManager;
        this.loteRepository = loteRepository;
        this.movimientoRepository = movimientoRepository;
        this.productoRepository = productoRepository;
    }

    @Override
    @Transactional
    public SalidaFEFOResponseDTO registrarSalidaFEFO(SalidaFEFORequestDTO request, Long usuarioId) {
        // Validar que el producto existe
        Producto producto = productoRepository.findById(request.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + request.getProductoId()));

        // Validar stock disponible
        if (producto.getStockTotal() < request.getCantidad()) {
            throw new RuntimeException(String.format(
                    "Stock insuficiente. Producto: %s, Stock actual: %d, Solicitado: %d",
                    producto.getNombre(), producto.getStockTotal(), request.getCantidad()));
        }

        // Llamar a la función almacenada fn_salida_fefo()
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("farmacia.fn_salida_fefo");

        query.registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(3, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(4, String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(5, Integer.class, ParameterMode.OUT);
        query.registerStoredProcedureParameter(6, String.class, ParameterMode.OUT);

        query.setParameter(1, request.getProductoId().intValue());
        query.setParameter(2, request.getCantidad());
        query.setParameter(3, usuarioId.intValue());
        query.setParameter(4, request.getMotivo() != null ? request.getMotivo() : "Venta mostrador");

        query.execute();

        Integer codigoResultado = (Integer) query.getOutputParameterValue(5);
        String mensajeResultado = (String) query.getOutputParameterValue(6);

        if (codigoResultado != 0) {
            throw new RuntimeException("Error al registrar salida: " + mensajeResultado);
        }

        return SalidaFEFOResponseDTO.builder()
                .exitoso(true)
                .mensaje(mensajeResultado != null ? mensajeResultado : "Salida registrada exitosamente")
                .build();
    }

    @Override
    @Transactional
    public void registrarEntradaDirecta(EntradaDirectaRequestDTO request, Long usuarioId) {
        // Validar producto
        Producto producto = productoRepository.findById(request.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        // Validar que el lote no exista ya
        if (loteRepository.findByProductoIdAndNumeroLote(request.getProductoId(), request.getNumeroLote()).isPresent()) {
            throw new RuntimeException("Ya existe un lote con el número " + request.getNumeroLote() + " para este producto");
        }

        // Validar fecha de vencimiento futura
        if (request.getFechaVencimiento().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException("La fecha de vencimiento no puede ser anterior a la fecha actual");
        }

        // Llamar a fn_entrada_directa()
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("farmacia.fn_entrada_directa");

        query.registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(2, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(3, String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(4, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(5, java.sql.Date.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(6, BigDecimal.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(7, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(8, String.class, ParameterMode.IN);

        query.setParameter(1, request.getProductoId().intValue());
        query.setParameter(2, request.getProveedorId() != null ? request.getProveedorId().intValue() : null);
        query.setParameter(3, request.getNumeroLote());
        query.setParameter(4, request.getCantidad());
        query.setParameter(5, java.sql.Date.valueOf(request.getFechaVencimiento()));
        query.setParameter(6, request.getCostoUnitario());
        query.setParameter(7, usuarioId.intValue());
        query.setParameter(8, request.getMotivo() != null ? request.getMotivo() : "Entrada directa");

        query.execute();

        // Refrescar el producto para obtener el stock actualizado
        entityManager.refresh(producto);
    }

    @Override
    @Transactional
    public void registrarAjuste(AjusteInventarioRequestDTO request, Long usuarioId) {
        // Validar tipo de ajuste
        String tipoValido = request.getTipoAjuste();
        if (!tipoValido.matches("ajuste_entrada|ajuste_salida|devolucion_cliente|devolucion_proveedor")) {
            throw new RuntimeException("Tipo de ajuste inválido: " + tipoValido);
        }

        // Validar que el lote existe
        Lote lote = loteRepository.findById(request.getLoteId())
                .orElseThrow(() -> new RuntimeException("Lote no encontrado: " + request.getLoteId()));

        // Para devolucion_cliente, validar referencia
        if ("devolucion_cliente".equals(tipoValido) && request.getReferenciaId() == null) {
            throw new RuntimeException("devolucion_cliente requiere referenciaId (ID del movimiento de salida original)");
        }

        // Construir motivo completo
        String motivoCompleto = String.format("[%s] %s", tipoValido, request.getMotivo());

        // Llamar a fn_ajuste_inventario()
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("farmacia.fn_ajuste_inventario");

        query.registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(2, String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(3, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(4, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(5, String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(6, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(7, Integer.class, ParameterMode.OUT);

        query.setParameter(1, request.getLoteId().intValue());
        query.setParameter(2, tipoValido);
        query.setParameter(3, request.getCantidad());
        query.setParameter(4, usuarioId.intValue());
        query.setParameter(5, motivoCompleto);
        query.setParameter(6, request.getReferenciaId() != null ? request.getReferenciaId().intValue() : null);

        query.execute();

        Integer movimientoId = (Integer) query.getOutputParameterValue(7);

        if (movimientoId == null || movimientoId == 0) {
            throw new RuntimeException("Error al registrar el ajuste");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public InventarioResponseDTO obtenerStockPorProducto(Long productoId) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        List<Lote> lotesActivos = loteRepository.findLotesActivosFEFO(productoId);

        return InventarioResponseDTO.builder()
                .loteId(null)
                .numeroLote(null)
                .cantidad(producto.getStockTotal())
                .fechaVencimiento(null)
                .costoUnitario(null)
                .estado(null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> obtenerHistorialPorProducto(Long productoId) {
        List<MovimientoInventario> movimientos = movimientoRepository.findByProductoIdOrderByFechaHoraDesc(productoId);

        return movimientos.stream()
                .map(this::convertirMovimientoADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> obtenerHistorialPorLote(Long loteId) {
        List<MovimientoInventario> movimientos = movimientoRepository.findByLoteIdOrderByFechaHoraDesc(loteId);

        return movimientos.stream()
                .map(this::convertirMovimientoADTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> obtenerLotesActivosPorProducto(Long productoId) {
        List<Lote> lotes = loteRepository.findLotesActivosFEFO(productoId);

        return lotes.stream()
                .map(lote -> InventarioResponseDTO.builder()
                        .loteId(lote.getId())
                        .numeroLote(lote.getNumeroLote())
                        .cantidad(lote.getCantidad())
                        .fechaVencimiento(lote.getFechaVencimiento())
                        .costoUnitario(lote.getCostoUnitario())
                        .estado(lote.getEstado())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void ejecutarBajaLotesVencidos(Long usuarioSistemaId) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("farmacia.fn_dar_baja_lotes_vencidos");
        query.registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN);
        query.setParameter(1, usuarioSistemaId.intValue());
        query.execute();
    }

    @Override
    @Transactional
    public void ejecutarGeneracionAlertas() {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("farmacia.fn_generar_alertas");
        query.execute();
    }

    private InventarioResponseDTO convertirMovimientoADTO(MovimientoInventario m) {
        return InventarioResponseDTO.builder()
                .movimientoId(m.getId())
                .tipoMovimiento(m.getTipoMovimiento())
                .cantidadMovimiento(m.getCantidad())
                .valorMovimiento(m.getCantidad() != null && m.getCostoUnitario() != null
                        ? m.getCostoUnitario().multiply(BigDecimal.valueOf(m.getCantidad()))
                        : null)
                .fechaHora(m.getFechaHora())
                .motivo(m.getMotivo())
                .usuarioNombre(m.getUsuario() != null ? m.getUsuario().getNombreCompleto() : null)
                .proveedorNombre(m.getProveedor() != null ? m.getProveedor().getNombre() : null)
                .loteId(m.getLote() != null ? m.getLote().getId() : null)
                .numeroLote(m.getLote() != null ? m.getLote().getNumeroLote() : null)
                .costoUnitario(m.getCostoUnitario())
                .build();
    }
}