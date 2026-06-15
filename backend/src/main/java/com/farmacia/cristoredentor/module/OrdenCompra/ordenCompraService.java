package com.farmacia.cristoredentor.module.OrdenCompra;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.farmacia.cristoredentor.Entity.OrdenCompra;
import com.farmacia.cristoredentor.Entity.OrdenCompraDetalle;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Entity.Proveedor;
import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.Enum.EstadoOrden;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.actualizarItemCostoDto;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.crearOrdenCompraDto;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.ordenCompraItemDto;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.ordenCompraItemRequestDto;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.ordenCompraResponseDto;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.module.Proveedor.ProveedorRepository;
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@Service
@Transactional
public class ordenCompraService {

    private final OrdenCompraRepository ordenRepo;
    private final ProveedorRepository   proveedorRepo;
    private final ProductoRepository    productoRepo;
    private final usuarioRepository     usuarioRepo;

    public ordenCompraService(OrdenCompraRepository ordenRepo,
                              ProveedorRepository proveedorRepo,
                              ProductoRepository productoRepo,
                              usuarioRepository usuarioRepo) {
        this.ordenRepo     = ordenRepo;
        this.proveedorRepo = proveedorRepo;
        this.productoRepo  = productoRepo;
        this.usuarioRepo   = usuarioRepo;
    }

    // -------------------------------------------------------------------------
    // CREAR — siempre nace en BORRADOR
    // -------------------------------------------------------------------------

    public ordenCompraResponseDto crearOrden(crearOrdenCompraDto dto, Integer usuarioId) {
        Proveedor proveedor = proveedorRepo.findById(dto.getProveedorId())
            .filter(Proveedor::isActivo)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Proveedor activo no encontrado: " + dto.getProveedorId()));

        Usuario usuario = usuarioRepo.findById(usuarioId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Usuario no encontrado: " + usuarioId));

        OrdenCompra orden = OrdenCompra.builder()
            .proveedor(proveedor)
            .usuario(usuario)
            .notas(dto.getNotas())
            .build();

        for (ordenCompraItemRequestDto item : dto.getItems()) {
            Producto producto = buscarProductoActivo(item.getProductoId());
            BigDecimal costo = item.getCostoUnitario() != null ? item.getCostoUnitario() : producto.getPrecioCosto();
            agregarDetalleAOrden(orden, producto, item.getCantidadSolicitada(), costo);
        }

        recalcularMontoTotal(orden);
        return toResponseDto(ordenRepo.save(orden));
    }

    // -------------------------------------------------------------------------
    // AGREGAR ÍTEM — solo en BORRADOR
    // -------------------------------------------------------------------------

    public ordenCompraResponseDto agregarItem(Integer ordenId, ordenCompraItemRequestDto dto) {
        OrdenCompra orden = buscarOrdenConDetalles(ordenId);
        validarEstadoBorrador(orden, "agregar ítems");

        boolean yaExiste = orden.getDetalles().stream()
            .anyMatch(d -> d.getProducto().getId().equals(dto.getProductoId()));
        if (yaExiste) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "El producto id=" + dto.getProductoId() + " ya existe en la orden id=" + ordenId);
        }

        Producto producto = buscarProductoActivo(dto.getProductoId());
        BigDecimal costo = dto.getCostoUnitario() != null ? dto.getCostoUnitario() : producto.getPrecioCosto();
        agregarDetalleAOrden(orden, producto, dto.getCantidadSolicitada(), costo);
        recalcularMontoTotal(orden);
        return toResponseDto(ordenRepo.save(orden));
    }

    // -------------------------------------------------------------------------
    // ELIMINAR ÍTEM — solo en BORRADOR
    // -------------------------------------------------------------------------

    public ordenCompraResponseDto eliminarItem(Integer ordenId, Integer detalleId) {
        OrdenCompra orden = buscarOrdenConDetalles(ordenId);
        validarEstadoBorrador(orden, "eliminar ítems");

        boolean removido = orden.getDetalles()
            .removeIf(d -> d.getId() != null && d.getId().equals(detalleId));

        if (!removido) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Ítem id=" + detalleId + " no encontrado en la orden id=" + ordenId);
        }

        recalcularMontoTotal(orden);
        return toResponseDto(ordenRepo.save(orden));
    }

    // -------------------------------------------------------------------------
    // ACTUALIZAR COSTO — solo en BORRADOR
    // -------------------------------------------------------------------------

    public ordenCompraResponseDto actualizarCostoItem(Integer ordenId,
                                                      Integer detalleId,
                                                      actualizarItemCostoDto dto) {
        OrdenCompra orden = buscarOrdenConDetalles(ordenId);
        validarEstadoBorrador(orden, "modificar costos");

        OrdenCompraDetalle detalle = orden.getDetalles().stream()
            .filter(d -> d.getId().equals(detalleId))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Ítem id=" + detalleId + " no encontrado en la orden id=" + ordenId));

        detalle.setCostoUnitario(dto.getCostoUnitario());
        recalcularMontoTotal(orden);
        return toResponseDto(ordenRepo.save(orden));
    }

    // -------------------------------------------------------------------------
    // EMITIR — BORRADOR → EMITIDA
    // -------------------------------------------------------------------------

    public ordenCompraResponseDto emitir(Integer id) {
        OrdenCompra orden = buscarOrdenConDetalles(id);
        validarTransicion(orden, EstadoOrden.emitida);

        if (orden.getDetalles().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "No se puede emitir la orden id=" + id + ": no tiene ítems.");
        }

        for (OrdenCompraDetalle d : orden.getDetalles()) {
            Producto p = d.getProducto();
            if (d.getCostoUnitario() == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede emitir la orden id=" + id + ": hay ítems sin costo unitario.");
            }
            if (p.getStockMaximo() != null && p.getStockTotal() + d.getCantidadSolicitada() > p.getStockMaximo()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format("No se puede emitir. El producto %s superaría su stock máximo de %d (Actual: %d, Solicitado: %d).",
                        p.getNombre(), p.getStockMaximo(), p.getStockTotal(), d.getCantidadSolicitada()));
            }
        }

        orden.setEstado(EstadoOrden.emitida);
        orden.setFechaEmision(OffsetDateTime.now(ZoneOffset.UTC));
        return toResponseDto(ordenRepo.save(orden));
    }

    // -------------------------------------------------------------------------
    // CANCELAR — BORRADOR o EMITIDA → CANCELADA
    // -------------------------------------------------------------------------

    public ordenCompraResponseDto cancelar(Integer id) {
        OrdenCompra orden = buscarOrden(id);
        validarTransicion(orden, EstadoOrden.cancelada);
        orden.setEstado(EstadoOrden.cancelada);
        return toResponseDto(ordenRepo.save(orden));
    }

    // -------------------------------------------------------------------------
    // LEER
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public ordenCompraResponseDto obtenerPorId(Integer id) {
        return toResponseDto(buscarOrdenConDetalles(id));
    }

    @Transactional(readOnly = true)
    public PaginatedResponseDto<ordenCompraResponseDto> listar(
            String estadoParam, Integer page, Integer limit) {

        Pageable pageable = PageRequest.of(page, limit, Sort.by("createdAt").descending());
        Page<OrdenCompra> resultado;

        if (estadoParam != null && !estadoParam.isBlank()) {
            if (estadoParam.contains(",")) {
                List<EstadoOrden> estados = Arrays.stream(estadoParam.split(","))
                    .map(String::trim)
                    .map(this::parsearEstado)
                    .collect(Collectors.toList());
                resultado = ordenRepo.findByEstadoIn(estados, pageable);
            } else {
                resultado = ordenRepo.findByEstado(parsearEstado(estadoParam.trim()), pageable);
            }
        } else {
            resultado = ordenRepo.findAll(pageable);
        }

        return toPaginatedDto(resultado, page, limit);
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Long> obtenerStockEnTransito(Integer productoId) {
        List<EstadoOrden> estados = Arrays.asList(EstadoOrden.emitida, EstadoOrden.recibida_parcial);
        Long enTransito = ordenRepo.sumarStockEnTransitoPorProducto(productoId, estados);
        
        java.util.Map<String, Long> response = new java.util.HashMap<>();
        response.put("stockEnTransito", enTransito != null ? enTransito : 0L);
        return response;
    }

    @Transactional(readOnly = true)
    public PaginatedResponseDto<ordenCompraResponseDto> listarPorProveedor(
            Integer proveedorId, Integer page, Integer limit) {

        Pageable pageable = PageRequest.of(page, limit, Sort.by("createdAt").descending());
        Page<OrdenCompra> resultado = ordenRepo.findByProveedorId(proveedorId, pageable);
        return toPaginatedDto(resultado, page, limit);
    }

    // -------------------------------------------------------------------------
    // Helpers internos
    // -------------------------------------------------------------------------

    OrdenCompra buscarOrden(Integer id) {
        return ordenRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Orden de compra no encontrada: " + id));
    }

    OrdenCompra buscarOrdenConDetalles(Integer id) {
        return ordenRepo.findByIdConDetalles(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Orden de compra no encontrada: " + id));
    }

    private Producto buscarProductoActivo(Integer id) {
        return productoRepo.findByIdAndActivoTrue(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Producto activo no encontrado: " + id));
    }

    // Centraliza la creación del detalle y el vínculo bidireccional.
    // Sin esto, mappedBy no persiste la FK y Hibernate inserta con orden_compra_id = NULL.
    private void agregarDetalleAOrden(OrdenCompra orden, Producto producto,
                                      Integer cantidad, BigDecimal costo) {
        if (producto.getStockMaximo() != null) {
            if (producto.getStockTotal() + cantidad > producto.getStockMaximo()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    String.format("El producto %s superaría su stock máximo de %d (Actual: %d, Solicitado: %d).",
                        producto.getNombre(), producto.getStockMaximo(), producto.getStockTotal(), cantidad));
            }
        }

        OrdenCompraDetalle detalle = OrdenCompraDetalle.builder()
            .ordenCompra(orden)
            .producto(producto)
            .cantidadSolicitada(cantidad)
            .costoUnitario(costo)
            .build();
        orden.getDetalles().add(detalle);
    }

    // Recalcula monto_total sumando solo ítems con costo definido.
    // Se llama explícitamente después de cada mutación de detalles.
    private void recalcularMontoTotal(OrdenCompra orden) {
        BigDecimal total = orden.getDetalles().stream()
            .filter(d -> d.getCostoUnitario() != null)
            .map(d -> d.getCostoUnitario()
                .multiply(BigDecimal.valueOf(d.getCantidadSolicitada())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        orden.setMontoTotal(total);
    }

    private void validarTransicion(OrdenCompra orden, EstadoOrden destino) {
        if (!orden.getEstado().puedeTransicionarA(destino)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                String.format("Transición inválida en orden id=%d: '%s' → '%s'.",
                    orden.getId(), orden.getEstado(), destino));
        }
    }

    private void validarEstadoBorrador(OrdenCompra orden, String accion) {
        if (orden.getEstado() != EstadoOrden.borrador) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                String.format("No se puede %s en la orden id=%d (estado: %s). " +
                    "Solo permitido en borrador.", accion, orden.getId(), orden.getEstado()));
        }
    }

    private EstadoOrden parsearEstado(String estado) {
    try {
        return EstadoOrden.valueOf(estado.toLowerCase());
    } catch (IllegalArgumentException e) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
            "Estado inválido: '" + estado + "'. " +
            "Valores: borrador, emitida, recibida, recibida_parcial, cancelada");
       
    }
}

    // -------------------------------------------------------------------------
    // Mapeo a DTOs
    // -------------------------------------------------------------------------

    private ordenCompraResponseDto toResponseDto(OrdenCompra o) {
        ordenCompraResponseDto dto = new ordenCompraResponseDto();
        dto.setId(o.getId());
        dto.setProveedorId(o.getProveedor().getId());
        dto.setProveedorNombre(o.getProveedor().getNombre());
        dto.setUsuarioId(o.getUsuario().getId());
        dto.setUsuarioNombre(o.getUsuario().getNombreCompleto());
        dto.setEstado(o.getEstado().name());
        dto.setFechaEmision(o.getFechaEmision());
        dto.setFechaRecepcion(o.getFechaRecepcion());
        dto.setMontoTotal(o.getMontoTotal());
        dto.setNotas(o.getNotas());
        dto.setCreatedAt(o.getCreatedAt());
        dto.setItems(o.getDetalles().stream().map(this::toItemDto).toList());
        return dto;
    }

    private ordenCompraItemDto toItemDto(OrdenCompraDetalle d) {
        ordenCompraItemDto dto = new ordenCompraItemDto();
        dto.setId(d.getId());
        dto.setProductoId(d.getProducto().getId());
        dto.setProductoNombre(d.getProducto().getNombre());
        dto.setCantidadSolicitada(d.getCantidadSolicitada());
        dto.setCostoUnitario(d.getCostoUnitario());
        return dto;
    }

    private PaginatedResponseDto<ordenCompraResponseDto> toPaginatedDto(
            Page<OrdenCompra> page, int pageNum, int limit) {
        List<ordenCompraResponseDto> data = page.getContent()
            .stream()
            .map(this::toResponseDto)
            .toList();
        return new PaginatedResponseDto<>(data, pageNum, limit,
            (int) page.getTotalElements());
    }
}