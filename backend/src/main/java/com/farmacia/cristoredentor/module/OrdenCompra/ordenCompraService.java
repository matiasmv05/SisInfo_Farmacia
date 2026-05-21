package com.farmacia.cristoredentor.module.OrdenCompra;

import java.math.BigDecimal;
import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.farmacia.cristoredentor.Entity.OrdenCompra;
import com.farmacia.cristoredentor.Entity.OrdenCompra.EstadoOrden;
import com.farmacia.cristoredentor.Entity.OrdenCompraDetalle;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Entity.Proveedor;
import com.farmacia.cristoredentor.Entity.Usuario;
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
    private final ModelMapper           modelMapper;

    public ordenCompraService(OrdenCompraRepository ordenRepo,
                              ProveedorRepository proveedorRepo,
                              ProductoRepository productoRepo,
                              usuarioRepository usuarioRepo,
                              ModelMapper modelMapper) {
        this.ordenRepo    = ordenRepo;
        this.proveedorRepo = proveedorRepo;
        this.productoRepo  = productoRepo;
        this.usuarioRepo   = usuarioRepo;
        this.modelMapper   = modelMapper;
    }

    // -------------------------------------------------------------------------
    // CREAR — siempre nace en BORRADOR
    // -------------------------------------------------------------------------

    public ordenCompraResponseDto crearOrden(crearOrdenCompraDto dto, Integer usuarioId) {
        Proveedor proveedor = proveedorRepo.findById(dto.getProveedorId())
            .filter(Proveedor::isActivo)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Proveedor activo no encontrado: " + dto.getProveedorId()));

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

            OrdenCompraDetalle detalle = OrdenCompraDetalle.builder()
                .producto(producto)
                .cantidadSolicitada(item.getCantidadSolicitada())
                .costoUnitario(item.getCostoUnitario())
                .build();

            orden.agregarDetalle(detalle);
        }

        return toResponseDto(ordenRepo.save(orden));
    }

     public ordenCompraResponseDto agregarItem(Integer ordenId,
                                              ordenCompraItemRequestDto dto) {
        OrdenCompra orden = buscarOrdenConDetalles(ordenId);

        boolean yaExiste = orden.getDetalles().stream()
            .anyMatch(d -> d.getProducto().getId() == dto.getProductoId());
        if (yaExiste) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "El producto id=" + dto.getProductoId() + " ya existe en la orden");
        }

        Producto producto = buscarProductoActivo(dto.getProductoId());

        OrdenCompraDetalle detalle = OrdenCompraDetalle.builder()
            .producto(producto)
            .cantidadSolicitada(dto.getCantidadSolicitada())
            .costoUnitario(dto.getCostoUnitario())
            .build();

        orden.agregarDetalle(detalle);
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

        Pageable pageable = PageRequest.of(page, limit,
            Sort.by("createdAt").descending());

        Page<OrdenCompra> resultado = (estadoParam != null && !estadoParam.isBlank())
            ? ordenRepo.findByEstado(parsearEstado(estadoParam), pageable)
            : ordenRepo.findAll(pageable);

        List<ordenCompraResponseDto> data = resultado.getContent()
            .stream()
            .map(this::toResponseDto)
            .toList();

        return new PaginatedResponseDto<>(data, page, limit,
            (int) resultado.getTotalElements());
    }

    @Transactional(readOnly = true)
    public PaginatedResponseDto<ordenCompraResponseDto> listarPorProveedor(
            Integer proveedorId, Integer page, Integer limit) {

        Pageable pageable = PageRequest.of(page, limit,
            Sort.by("createdAt").descending());

        Page<OrdenCompra> resultado = ordenRepo.findByProveedorId(proveedorId, pageable);

        List<ordenCompraResponseDto> data = resultado.getContent()
            .stream()
            .map(this::toResponseDto)
            .toList();

        return new PaginatedResponseDto<>(data, page, limit,
            (int) resultado.getTotalElements());
    }

    // -------------------------------------------------------------------------
    // MODIFICAR BORRADOR
    // -------------------------------------------------------------------------

   

    public ordenCompraResponseDto eliminarItem(Integer ordenId, Integer detalleId) {
        OrdenCompra orden = buscarOrdenConDetalles(ordenId);
        orden.eliminarDetalle(detalleId);
        return toResponseDto(ordenRepo.save(orden));
    }

    public ordenCompraResponseDto actualizarCostoItem(Integer ordenId,
                                                      Integer detalleId,
                                                      actualizarItemCostoDto dto) {
        OrdenCompra orden = buscarOrdenConDetalles(ordenId);

        if (orden.getEstado() != EstadoOrden.borrador) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Solo se puede modificar costos en una orden en borrador");
        }

        OrdenCompraDetalle detalle = orden.getDetalles().stream()
            .filter(d -> d.getId().equals(detalleId))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                "Ítem id=" + detalleId + " no encontrado en la orden id=" + ordenId));

        detalle.setCostoUnitario(dto.getCostoUnitario());
        return toResponseDto(ordenRepo.save(orden));
    }

    // -------------------------------------------------------------------------
    // TRANSICIONES DE ESTADO
    // -------------------------------------------------------------------------

    public ordenCompraResponseDto emitir(Integer id) {
        OrdenCompra orden = buscarOrdenConDetalles(id);
        try {
            orden.emitir();
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
        return toResponseDto(ordenRepo.save(orden));
    }

    public ordenCompraResponseDto cancelar(Integer id) {
        OrdenCompra orden = buscarOrden(id);
        try {
            orden.cancelar();
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
        return toResponseDto(ordenRepo.save(orden));
    }

    // -------------------------------------------------------------------------
    // Métodos internos
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

    private EstadoOrden parsearEstado(String estado) {
        try {
            return EstadoOrden.valueOf(estado.toLowerCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Estado inválido: '" + estado + "'. " +
                "Valores: borrador, emitida, recibida, recibida_parcial, cancelada");
        }
    }

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
        dto.setCantidadRecibida(d.getCantidadRecibida());
        dto.setCompleto(d.estaCompleto());
        return dto;
    }
}