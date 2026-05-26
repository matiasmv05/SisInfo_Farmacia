package com.farmacia.cristoredentor.module.MovimientoInventario;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmacia.cristoredentor.Entity.Lote;
import com.farmacia.cristoredentor.Entity.MovimientoInventario;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.Enum.EstadoLote;
import com.farmacia.cristoredentor.Enum.TipoMovimiento;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.Lote.LoteService;
import com.farmacia.cristoredentor.module.Lote.dto.LoteRequestDTO;
import com.farmacia.cristoredentor.module.Lote.dto.ResultadoDesconteStock;
import com.farmacia.cristoredentor.module.MovimientoInventario.dto.MovimientoContext;
import com.farmacia.cristoredentor.module.MovimientoInventario.dto.MovimientoDetalleDTO;
import com.farmacia.cristoredentor.module.OrdenCompra.OrdenCompraRepository;
import com.farmacia.cristoredentor.module.Producto.ProductoService;
import com.farmacia.cristoredentor.module.Proveedor.ProveedorRepository;
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@Service
@Transactional
public class MovimientoInventarioService {

    private final MovimientoInventarioRepository repo;
    private final LoteService loteService;
    private final ProductoService productoService;
    private final usuarioRepository usuarioRepo;
    private final ProveedorRepository proveedorRepo;
    private final OrdenCompraRepository ordenCompraRepo;

    public MovimientoInventarioService(
            MovimientoInventarioRepository repo,
            LoteService loteService,
            ProductoService productoService,
            usuarioRepository usuarioRepo,
            ProveedorRepository proveedorRepo,
            OrdenCompraRepository ordenCompraRepo) {
        this.repo = repo;
        this.loteService = loteService;
        this.productoService = productoService;
        this.usuarioRepo = usuarioRepo;
        this.proveedorRepo = proveedorRepo;
        this.ordenCompraRepo = ordenCompraRepo;
    }

    // =========================================================================
    // ENTRADA DIRECTA — sin orden de compra
    // =========================================================================
    public MovimientoDetalleDTO entradaDirecta(
            LoteRequestDTO dto, Integer usuarioId) {

        // 1. Validar y obtener producto
        Producto producto = productoService.buscarEntidadActiva(dto.getProductoId());

        // 2. Crear lote
        Lote lote = loteService.crearLote(dto, producto);

        // 3. Actualizar stock
        productoService.sincronizarStock(producto.getId());

        // 4. Registrar trazabilidad
        return persistirMovimiento(MovimientoContext.builder()
        .lote(lote)
        .tipo(TipoMovimiento.entrada_directa)
        .cantidad(lote.getCantidad())
        .costoUnitario(lote.getCostoUnitario())
        .usuarioId(usuarioId)
        .build()
    );
    }

    // =========================================================================
// ENTRADA POR RECEPCIÓN DE ORDEN DE COMPRA
// =========================================================================
public MovimientoDetalleDTO entradaPorRecepcion(
        Lote lote, int cantidad, Integer usuarioId,
        Integer proveedorId, Integer ordenCompraId) {

    productoService.sincronizarStock(lote.getProducto().getId());

    return persistirMovimiento(MovimientoContext.builder()
        .lote(lote)
        .tipo(TipoMovimiento.entrada)  // verificá que este valor exista en tu enum
        .cantidad(cantidad)
        .costoUnitario(lote.getCostoUnitario())
        .usuarioId(usuarioId)
        .proveedorId(proveedorId)
        .ordenCompraId(ordenCompraId)
        .motivo("Recepción de OC-" + ordenCompraId)
        .build()
    );
}

    // =========================================================================
    // SALIDA — descuenta por FEFO automáticamente
    // =========================================================================
   public List<MovimientoDetalleDTO> salida(
        Integer productoId, int cantidad, Integer usuarioId) {

    List<ResultadoDesconteStock> resultados =
        loteService.descontarStockFEFO(productoId, cantidad);

    List<MovimientoDetalleDTO> movimientos = resultados.stream()
        .map(r -> persistirMovimiento(MovimientoContext.builder()
            .lote(r.getLote())
            .tipo(TipoMovimiento.salida)
            .cantidad(r.getCantidadDescontada())
            .costoUnitario(r.getLote().getCostoUnitario())
            .usuarioId(usuarioId)
            .build()
        ))
        .toList();

    productoService.sincronizarStock(productoId); 
    return movimientos;
}

    // =========================================================================
    // BAJA POR VENCIMIENTO
    // =========================================================================
    public MovimientoDetalleDTO bajaVencimiento(
            Integer loteId, String motivo, Integer usuarioId) {

        // 1. Marcar lote vencido — retorna cuánto había antes
        ResultadoDesconteStock resultado = loteService.marcarVencido(loteId, motivo);

        // 2. Descontar del stock solo si había unidades
       productoService.sincronizarStock(
          resultado.getLote().getProducto().getId()
        );

        // 3. Registrar trazabilidad
        return persistirMovimiento(MovimientoContext.builder()
        .lote(resultado.getLote())
        .tipo(TipoMovimiento.baja_vencimiento)
        .cantidad(resultado.getCantidadDescontada())
        .costoUnitario(resultado.getLote().getCostoUnitario())
        .motivo(motivo)
        .usuarioId(usuarioId)
        .build()
        );
    }

    // =========================================================================
    // AJUSTE DE ENTRADA
    // =========================================================================
    public MovimientoDetalleDTO ajusteEntrada(
            Integer loteId, int cantidad, String motivo, Integer usuarioId) {

        Lote lote = loteService.buscarLote(loteId);

        if (lote.getEstado() == EstadoLote.vencido){
        throw new BusinessException("No se puede ajustar un lote vencido.");
        }

        if (lote.getEstado() == EstadoLote.agotado && cantidad > 0) {
    if (lote.getFechaVencimiento().isBefore(LocalDate.now())) {
        throw new BusinessException(
            "No se puede ajustar: el lote id=" + loteId + 
            " está agotado y su fecha de vencimiento ya expiró."
        );
    }
    lote.setEstado(EstadoLote.activo);
}
        lote.setCantidad(lote.getCantidad() + cantidad);
        loteService.guardar(lote);

productoService.sincronizarStock(lote.getProducto().getId());

        return persistirMovimiento(MovimientoContext.builder()
        .lote(lote)
        .tipo(TipoMovimiento.ajuste_entrada)
        .cantidad(cantidad)
        .costoUnitario(lote.getCostoUnitario())
        .motivo(motivo)
        .usuarioId(usuarioId)
        .build()
        );
    }

    // =========================================================================
    // AJUSTE DE SALIDA
    // =========================================================================
    public MovimientoDetalleDTO ajusteSalida(
            Integer loteId, int cantidad, String motivo, Integer usuarioId) {

        Lote lote = loteService.buscarLote(loteId);


        if (lote.getEstado() == EstadoLote.vencido){
            throw new BusinessException(String.format(
                 "Ajuste inválido: el lote id=%d está vencido.",
                   loteId
            ));
        }

        if (lote.getCantidad() < cantidad)
            throw new BusinessException(String.format(
                "Ajuste inválido: lote id=%d tiene %d unidades, " +
                "se intenta ajustar %d.",
                loteId, lote.getCantidad(), cantidad
            ));

        lote.setCantidad(lote.getCantidad() - cantidad);
        if (lote.getCantidad() == 0) lote.setEstado(EstadoLote.agotado);
        loteService.guardar(lote);

         productoService.sincronizarStock(lote.getProducto().getId());

        return persistirMovimiento(MovimientoContext.builder()
        .lote(lote)
        .tipo(TipoMovimiento.ajuste_salida)
        .cantidad(cantidad)
        .costoUnitario(lote.getCostoUnitario())
        .motivo(motivo)
        .usuarioId(usuarioId)
        .build()
        );
    }

    // =========================================================================
    // CONSULTAS
    // =========================================================================
    @Transactional(readOnly = true)
    public PaginatedResponseDto<MovimientoDetalleDTO> listarPorProducto(
            Integer productoId, int page, int limit) {


        Pageable pageable = PageRequest.of(page, limit);
        Page<MovimientoInventario> resultado = repo.findByProductoIdOrderByFechaHoraDesc(productoId, pageable);

        List<MovimientoDetalleDTO> data = resultado.getContent()
            .stream()
            .map(this::toDetalleDTO)
            .toList();

        return new PaginatedResponseDto<>(data, page, limit,
            (int) resultado.getTotalElements());
    }

    // =========================================================================
    // PRIVADOS
    // =========================================================================
   private MovimientoDetalleDTO persistirMovimiento(MovimientoContext ctx) {

    Usuario usuario = usuarioRepo.findById(ctx.getUsuarioId())
        .orElseThrow(() -> new ResourceNotFoundException(
            "Usuario no encontrado: " + ctx.getUsuarioId()));

    MovimientoInventario mov = MovimientoInventario.builder()
        .lote(ctx.getLote())
        .producto(ctx.getLote().getProducto())
        .tipoMovimiento(ctx.getTipo())
        .cantidad(ctx.getCantidad())
        .costoUnitario(ctx.getCostoUnitario())
        .motivo(ctx.getMotivo())
        .usuario(usuario)
        .proveedor(ctx.getProveedorId() != null
            ? proveedorRepo.getReferenceById(ctx.getProveedorId()) : null)
        .ordenCompra(ctx.getOrdenCompraId() != null
            ? ordenCompraRepo.getReferenceById(ctx.getOrdenCompraId()) : null)
        .fechaHora(OffsetDateTime.now())
        .build();

    return toDetalleDTO(repo.save(mov));
}
    private MovimientoDetalleDTO toDetalleDTO(MovimientoInventario m) {
        return MovimientoDetalleDTO.builder()
            .id(m.getId())
            .loteId(m.getLote().getId())
            .loteNumero(m.getLote().getNumeroLote())
            .productoId(m.getProducto().getId())
            .productoNombre(m.getProducto().getNombre())
            .tipoMovimiento(m.getTipoMovimiento())
            .cantidad(m.getCantidad())
            .costoUnitario(m.getCostoUnitario())
            .motivo(m.getMotivo())
            .usuarioId(m.getUsuario().getId())
            .usuarioNombre(m.getUsuario().getNombreCompleto())
            .proveedorNombre(m.getProveedor() != null
                ? m.getProveedor().getNombre() : null)
            .ordenCompraId(m.getOrdenCompra() != null
                ? m.getOrdenCompra().getId() : null)
            .fechaHora(m.getFechaHora())
            .build();
    }
}