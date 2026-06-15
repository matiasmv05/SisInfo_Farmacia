package com.farmacia.cristoredentor.module.RecepcionMercaderia;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.farmacia.cristoredentor.Entity.Lote;
import com.farmacia.cristoredentor.Entity.OrdenCompra;
import com.farmacia.cristoredentor.Entity.OrdenCompraDetalle;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Entity.RecepcionDetalle;
import com.farmacia.cristoredentor.Entity.RecepcionMercaderia;
import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.Enum.EstadoOrden;
import com.farmacia.cristoredentor.module.Alerta.AlertaService;
import com.farmacia.cristoredentor.module.Lote.LoteService;
import com.farmacia.cristoredentor.module.MovimientoInventario.MovimientoInventarioService;
import com.farmacia.cristoredentor.module.OrdenCompra.OrdenCompraRepository;
import com.farmacia.cristoredentor.module.Producto.ProductoService;
import com.farmacia.cristoredentor.module.RecepcionMercaderia.dto.CrearRecepcionDto;
import com.farmacia.cristoredentor.module.RecepcionMercaderia.dto.RecepcionDetalleRequestDto;
import com.farmacia.cristoredentor.module.RecepcionMercaderia.dto.RecepcionDetalleResponseDto;
import com.farmacia.cristoredentor.module.RecepcionMercaderia.dto.RecepcionMercaderiaResponseDto;
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@Service
@Transactional
public class RecepcionMercaderiaService {

     private final RecepcionMercaderiaRepository recepcionRepo;
    private final OrdenCompraRepository         ordenRepo;
    private final usuarioRepository             usuarioRepo;
    private final LoteService                   loteService;
    private final ProductoService               productoService;
    private final MovimientoInventarioService          movimientoService;
    private final RecepcionDetalleRepository    recepcionDetalleRepo;
    private final AlertaService                 alertaService;

      public RecepcionMercaderiaService(RecepcionMercaderiaRepository recepcionRepo,
                                      OrdenCompraRepository ordenRepo,
                                      usuarioRepository usuarioRepo,
                                      LoteService loteService,
                                      ProductoService productoService,
                                      MovimientoInventarioService movimientoService,
                                     RecepcionDetalleRepository recepcionDetalleRepo,
                                     AlertaService alertaService) {
        this.recepcionRepo    = recepcionRepo;
        this.ordenRepo        = ordenRepo;
        this.usuarioRepo      = usuarioRepo;
        this.loteService      = loteService;
        this.productoService  = productoService;
        this.movimientoService = movimientoService;
        this.recepcionDetalleRepo = recepcionDetalleRepo;
        this.alertaService    = alertaService;
    }

     public RecepcionMercaderiaResponseDto registrar(CrearRecepcionDto dto, Integer usuarioId) {

        // 1. Validar orden
        OrdenCompra orden = ordenRepo.findByIdConDetalles(dto.getOrdenCompraId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Orden de compra no encontrada: " + dto.getOrdenCompraId()));

        if (orden.getEstado() != EstadoOrden.emitida
                && orden.getEstado() != EstadoOrden.recibida_parcial) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                String.format("La orden id=%d tiene estado '%s'. " +
                    "Solo se puede recepcionar en estado 'emitida' o 'recibida_parcial'.",
                    orden.getId(), orden.getEstado()));
        }

        Usuario usuario = usuarioRepo.findById(usuarioId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Usuario no encontrado: " + usuarioId));

        // 2. Validar todos los ítems antes de persistir cualquiera
        for (RecepcionDetalleRequestDto item : dto.getItems()) {
            validarItem(item, orden);
        }

        // 3. Construir cabecera de recepción
        RecepcionMercaderia recepcion = RecepcionMercaderia.builder()
            .ordenCompra(orden)
            .usuario(usuario)
            .observaciones(dto.getObservaciones())
            .build();
        recepcionRepo.save(recepcion); // necesitamos el id para el movimiento

        // 4. Procesar cada ítem 
        for (RecepcionDetalleRequestDto item : dto.getItems()) {
            OrdenCompraDetalle ordenDetalle = buscarOrdenDetalle(orden, item.getOrdenDetalleId());
            Producto producto = ordenDetalle.getProducto();

            // 4a. Crear o actualizar lote
            Lote lote = loteService.crearOActualizarLote(
                item.getNumeroLote().trim(),
                item.getCantidadRecibida(),
                item.getFechaVencimiento(),
                ordenDetalle.getCostoUnitario(),
                producto,
                orden
            );

            // 4b. Registrar movimiento de inventario
            movimientoService.entradaPorRecepcion(
                lote,
                item.getCantidadRecibida(),
                usuarioId,
                 orden.getProveedor().getId(),
                 orden.getId()
            );

            // 4c. Actualizar stock total del producto y precio de costo
            producto.setPrecioCosto(ordenDetalle.getCostoUnitario());
            productoService.guardar(producto);
            productoService.reaplicarClasificacionAbc(producto.getId());

            // 4d. Vincular detalle a la recepción
            RecepcionDetalle detalle = RecepcionDetalle.builder()
                .recepcion(recepcion)
                .ordenDetalle(ordenDetalle)
                .cantidadRecibida(item.getCantidadRecibida())
                .numeroLote(item.getNumeroLote().trim())
                .fechaVencimiento(item.getFechaVencimiento())
                .observacionItem(item.getObservacionItem())
                .build();
            recepcion.getDetalles().add(detalle);
            if (ordenDetalle.getRecepciones() != null) {
                ordenDetalle.getRecepciones().add(detalle);
            }
        }

        // 5. Actualizar estado de la orden
        actualizarEstadoOrden(orden);
        ordenRepo.save(orden);

        // 6. Generar alertas (limpia obsoletas y crea nuevas si es necesario)
        alertaService.generarAlertasAutomaticas();

        return toResponseDto(recepcionRepo.findByIdConDetalles(recepcion.getId())
            .orElseThrow());
    }

     // -------------------------------------------------------------------------
    // Lógica de estado de la orden
    // -------------------------------------------------------------------------

   private void actualizarEstadoOrden(OrdenCompra orden) {
    boolean todosCompletos = orden.getDetalles().stream()
        .allMatch(d -> {
            // Usar el repositorio como fuente de verdad, no la colección en memoria
            int totalRecibido = recepcionDetalleRepo
                .sumCantidadRecibidaByOrdenDetalleId(d.getId());
            return totalRecibido >= d.getCantidadSolicitada();
        });

    boolean algunoRecibido = orden.getDetalles().stream()
        .anyMatch(d -> recepcionDetalleRepo
            .sumCantidadRecibidaByOrdenDetalleId(d.getId()) > 0);

    if (todosCompletos) {
        orden.setEstado(EstadoOrden.recibida);
    } else if (algunoRecibido) {
        orden.setEstado(EstadoOrden.recibida_parcial);
    }

    if (orden.getFechaRecepcion() == null) {
        orden.setFechaRecepcion(OffsetDateTime.now(ZoneOffset.UTC));
    }
}

    // -------------------------------------------------------------------------
    // LEER
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public RecepcionMercaderiaResponseDto obtenerPorId(Integer id) {
        return toResponseDto(buscarConDetalles(id));
    }

    @Transactional(readOnly = true)
    public PaginatedResponseDto<RecepcionMercaderiaResponseDto> listarPorOrden(
            Integer ordenCompraId, Integer page, Integer limit) {

        Pageable pageable = PageRequest.of(page, limit, Sort.by("fechaHora").descending());
        Page<RecepcionMercaderia> resultado = recepcionRepo.findByOrdenCompraId(ordenCompraId, pageable);

        List<RecepcionMercaderiaResponseDto> data = resultado.getContent()
            .stream()
            .map(this::toResponseDto)
            .toList();

        return new PaginatedResponseDto<>(data, page, limit, (int) resultado.getTotalElements());
    }

    // -------------------------------------------------------------------------
    // Helpers internos
    // -------------------------------------------------------------------------

    private RecepcionMercaderia buscarConDetalles(Integer id) {
        return recepcionRepo.findByIdConDetalles(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Recepción no encontrada: " + id));
    }

    private void validarItem(RecepcionDetalleRequestDto item, OrdenCompra orden) {
    OrdenCompraDetalle od = buscarOrdenDetalle(orden, item.getOrdenDetalleId());

    if (item.getCantidadRecibida() <= 0) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "La cantidad recibida debe ser mayor a 0 para el ítem id=" 
            + item.getOrdenDetalleId());
    }
    if (item.getNumeroLote() == null || item.getNumeroLote().isBlank()) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "El número de lote es obligatorio para el ítem id=" 
            + item.getOrdenDetalleId());
    }
    if (item.getFechaVencimiento() == null
            || !item.getFechaVencimiento().isAfter(LocalDate.now())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "La fecha de vencimiento debe ser futura para el ítem id=" 
            + item.getOrdenDetalleId());
    }

    int yaRecibido = recepcionDetalleRepo
        .sumCantidadRecibidaByOrdenDetalleId(od.getId());
    int pendiente = od.getCantidadSolicitada() - yaRecibido;

    if (pendiente <= 0) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            String.format("Ítem id=%d ya completamente recibido " +
                "(solicitado: %d, recibido: %d).",
                od.getId(), od.getCantidadSolicitada(), yaRecibido));
    }

    if (item.getCantidadRecibida() > pendiente) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            String.format("Cantidad a recibir (%d) supera el pendiente (%d) " +
                "para ítem id=%d.",
                item.getCantidadRecibida(), pendiente, od.getId()));
    }
}

    private OrdenCompraDetalle buscarOrdenDetalle(OrdenCompra orden, Integer ordenDetalleId) {
        return orden.getDetalles().stream()
            .filter(d -> d.getId().equals(ordenDetalleId))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "El detalle id=" + ordenDetalleId +
                " no pertenece a la orden id=" + orden.getId()));
    }

    // -------------------------------------------------------------------------
    // Mapeo a DTOs
    // -------------------------------------------------------------------------

     private RecepcionMercaderiaResponseDto toResponseDto(RecepcionMercaderia r) {
        RecepcionMercaderiaResponseDto dto = new RecepcionMercaderiaResponseDto();
        dto.setId(r.getId());
        dto.setOrdenCompraId(r.getOrdenCompra().getId());
        dto.setUsuarioId(r.getUsuario().getId());
        dto.setUsuarioNombre(r.getUsuario().getNombreCompleto());
        dto.setFechaHora(r.getFechaHora());
        dto.setObservaciones(r.getObservaciones());
        dto.setItems(r.getDetalles().stream().map(this::toDetalleDto).toList());
        return dto;
    }

    private RecepcionDetalleResponseDto toDetalleDto(RecepcionDetalle d) {
    OrdenCompraDetalle od = d.getOrdenDetalle();

    // Fuente de verdad: sumar desde recepcion_detalle

    int totalRecibido = recepcionDetalleRepo
            .sumCantidadRecibidaByOrdenDetalleId(od.getId());

    RecepcionDetalleResponseDto dto = new RecepcionDetalleResponseDto();
    dto.setId(d.getId());
    dto.setOrdenDetalleId(od.getId());
    dto.setProductoId(od.getProducto().getId());
    dto.setProductoNombre(od.getProducto().getNombre());
    dto.setCantidadSolicitada(od.getCantidadSolicitada());
    dto.setCantidadRecibida(d.getCantidadRecibida()); // solo esta recepción
    dto.setTotalRecibido(totalRecibido);               // acumulado histórico
    dto.setCompleto(totalRecibido >= od.getCantidadSolicitada());
    dto.setNumeroLote(d.getNumeroLote());
    dto.setFechaVencimiento(d.getFechaVencimiento());
    dto.setCostoUnitario(od.getCostoUnitario());
    dto.setObservacionItem(d.getObservacionItem());
    return dto;
}

}