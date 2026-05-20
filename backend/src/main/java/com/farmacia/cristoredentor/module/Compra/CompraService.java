package com.farmacia.cristoredentor.module.Compra;

import com.farmacia.cristoredentor.Entity.*;
import com.farmacia.cristoredentor.module.OrdenCompra.OrdenCompraRepository;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.OrdenCompraCreateDTO;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.OrdenCompraResponseDTO;
import com.farmacia.cristoredentor.module.OrdenCompraDetalle.OrdenCompraDetalleRepository;
import com.farmacia.cristoredentor.module.OrdenCompraDetalle.dto.OrdenCompraDetalleCreateDTO;
import com.farmacia.cristoredentor.module.OrdenCompraDetalle.dto.OrdenCompraDetalleResponseDTO;
import com.farmacia.cristoredentor.module.Proveedor.ProveedorRepository;
import com.farmacia.cristoredentor.module.RecepcionDetalle.dto.*;
import com.farmacia.cristoredentor.module.RecepcionMercaderia.RecepcionMercaderiaRepository;
import com.farmacia.cristoredentor.module.RecepcionMercaderia.dto.RecepcionMercaderiaCreateDTO;
import com.farmacia.cristoredentor.module.RecepcionMercaderia.dto.RecepcionMercaderiaResponseDTO;
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;


import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompraService{

    private final OrdenCompraRepository ordenCompraRepository;
    private final RecepcionMercaderiaRepository recepcionMercaderiaRepository;
    private final OrdenCompraDetalleRepository ordenCompraDetalleRepository;
    private final ProductoRepository productoRepository;
    private final ProveedorRepository proveedorRepository;
    private final usuarioRepository usuarioRepository;

    public CompraService(
            OrdenCompraRepository ordenCompraRepository,
            RecepcionMercaderiaRepository recepcionMercaderiaRepository,
            OrdenCompraDetalleRepository ordenCompraDetalleRepository,
            ProductoRepository productoRepository,
            ProveedorRepository proveedorRepository,
            usuarioRepository usuarioRepository) {
        this.ordenCompraRepository = ordenCompraRepository;
        this.recepcionMercaderiaRepository = recepcionMercaderiaRepository;
        this.ordenCompraDetalleRepository = ordenCompraDetalleRepository;
        this.productoRepository = productoRepository;
        this.proveedorRepository = proveedorRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public OrdenCompraResponseDTO crearOrden(OrdenCompraCreateDTO dto) {
        Proveedor proveedor = proveedorRepository.findById(dto.getProveedorId())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        OrdenCompra orden = OrdenCompra.builder()
                .proveedor(proveedor)
                .usuario(usuario)
                .estado("borrador")
                .notas(dto.getNotas())
                .build();

        BigDecimal montoTotal = BigDecimal.ZERO;
        for (OrdenCompraDetalleCreateDTO detalleDTO : dto.getDetalles()) {
            Producto producto = productoRepository.findById(detalleDTO.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
            OrdenCompraDetalle detalle = OrdenCompraDetalle.builder()
                    .ordenCompra(orden)
                    .producto(producto)
                    .cantidadSolicitada(detalleDTO.getCantidadSolicitada())
                    .costoUnitario(detalleDTO.getCostoUnitario())
                    .cantidadRecibida(0)
                    .build();
            orden.getDetalles().add(detalle);
            montoTotal = montoTotal.add(detalleDTO.getCostoUnitario().multiply(BigDecimal.valueOf(detalleDTO.getCantidadSolicitada())));
        }
        orden.setMontoTotal(montoTotal);
        ordenCompraRepository.save(orden);
        return convertirOrdenResponse(orden);
    }

    public List<OrdenCompraResponseDTO> listarOrdenes() {
        return ordenCompraRepository.findAll().stream()
                .map(this::convertirOrdenResponse)
                .collect(Collectors.toList());
    }

    public OrdenCompraResponseDTO obtenerOrdenPorId(Long id) {
        return ordenCompraRepository.findById(id)
                .map(this::convertirOrdenResponse)
                .orElseThrow(() -> new RuntimeException("Orden de compra no encontrada"));
    }

    public OrdenCompraResponseDTO emitirOrden(Long id) {
        OrdenCompra orden = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Orden de compra no encontrada"));

        if (!"borrador".equals(orden.getEstado())) {
            throw new RuntimeException("Solo las órdenes en estado borrador pueden emitirarse");
        }
        if (orden.getMontoTotal() == null || orden.getMontoTotal().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("La orden debe tener un monto total mayor a cero antes de emitir.");
        }

        orden.setEstado("emitida");
        orden.setFechaEmision(Instant.now());
        ordenCompraRepository.save(orden);
        return convertirOrdenResponse(orden);
    }

    public RecepcionMercaderiaResponseDTO registrarRecepcion(RecepcionMercaderiaCreateDTO dto) {
        OrdenCompra orden = ordenCompraRepository.findById(dto.getOrdenCompraId())
                .orElseThrow(() -> new RuntimeException("Orden de compra no encontrada"));
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if ("borrador".equals(orden.getEstado()) || "cancelada".equals(orden.getEstado())) {
            throw new RuntimeException("No se puede recepcionar una orden que no está emitida");
        }

        RecepcionMercaderia recepcion = RecepcionMercaderia.builder()
                .ordenCompra(orden)
                .usuario(usuario)
                .observaciones(dto.getObservaciones())
                .build();

        for (RecepcionDetalleCreateDTO detalleDTO : dto.getDetalles()) {
            OrdenCompraDetalle ordenDetalle = ordenCompraDetalleRepository.findById(detalleDTO.getOrdenDetalleId())
                    .orElseThrow(() -> new RuntimeException("Detalle de orden no encontrado"));
            if (!ordenDetalle.getOrdenCompra().getId().equals(orden.getId())) {
                throw new RuntimeException("El detalle no pertenece a la orden indicada");
            }
            int restan = ordenDetalle.getCantidadSolicitada() - ordenDetalle.getCantidadRecibida();
            if (detalleDTO.getCantidadRecibida() > restan) {
                throw new RuntimeException("La cantidad recepcionada no puede superar la cantidad pendiente");
            }
            ordenDetalle.setCantidadRecibida(ordenDetalle.getCantidadRecibida() + detalleDTO.getCantidadRecibida());
            RecepcionDetalle recepcionDetalle = RecepcionDetalle.builder()
                    .recepcion(recepcion)
                    .ordenDetalle(ordenDetalle)
                    .cantidadRecibida(detalleDTO.getCantidadRecibida())
                    .numeroLote(detalleDTO.getNumeroLote())
                    .fechaVencimiento(detalleDTO.getFechaVencimiento())
                    .observacionItem(detalleDTO.getObservacionItem())
                    .build();
            recepcion.getDetalles().add(recepcionDetalle);
        }

        boolean todosRecibidos = orden.getDetalles().stream()
                .allMatch(d -> d.getCantidadRecibida() != null && d.getCantidadRecibida().intValue() >= d.getCantidadSolicitada());
        if (todosRecibidos) {
            orden.setEstado("recibida");
            orden.setFechaRecepcion(Instant.now());
        } else {
            orden.setEstado("recibida_parcial");
        }

        ordenCompraRepository.save(orden);
        recepcionMercaderiaRepository.save(recepcion);
        return convertirRecepcionResponse(recepcion);
    }

    public List<RecepcionMercaderiaResponseDTO> listarRecepciones() {
        return recepcionMercaderiaRepository.findAll().stream()
                .map(this::convertirRecepcionResponse)
                .collect(Collectors.toList());
    }

    public RecepcionMercaderiaResponseDTO obtenerRecepcionPorId(Long id) {
        return recepcionMercaderiaRepository.findById(id)
                .map(this::convertirRecepcionResponse)
                .orElseThrow(() -> new RuntimeException("Recepción no encontrada"));
    }

    private OrdenCompraResponseDTO convertirOrdenResponse(OrdenCompra orden) {
        OrdenCompraResponseDTO dto = new OrdenCompraResponseDTO();
        dto.setId(orden.getId());
        dto.setProveedorId(orden.getProveedor().getId());
        dto.setProveedorNombre(orden.getProveedor().getNombre());
        dto.setUsuarioId(orden.getUsuario().getId());
        dto.setUsuarioNombre(orden.getUsuario().getNombreCompleto());
        dto.setEstado(orden.getEstado());
        dto.setFechaEmision(orden.getFechaEmision());
        dto.setFechaRecepcion(orden.getFechaRecepcion());
        dto.setMontoTotal(orden.getMontoTotal());
        dto.setNotas(orden.getNotas());
        dto.setDetalles(orden.getDetalles().stream()
                .map(this::convertirDetalleResponse)
                .collect(Collectors.toList()));
        return dto;
    }

    private OrdenCompraDetalleResponseDTO convertirDetalleResponse(OrdenCompraDetalle detalle) {
        OrdenCompraDetalleResponseDTO dto = new OrdenCompraDetalleResponseDTO();
        dto.setId(detalle.getId());
        dto.setProductoId(detalle.getProducto().getId());
        dto.setProductoNombre(detalle.getProducto().getNombre());
        dto.setCantidadSolicitada(detalle.getCantidadSolicitada());
        dto.setCostoUnitario(detalle.getCostoUnitario());
        dto.setCantidadRecibida(detalle.getCantidadRecibida());
        return dto;
    }

    private RecepcionMercaderiaResponseDTO convertirRecepcionResponse(RecepcionMercaderia recepcion) {
        RecepcionMercaderiaResponseDTO dto = new RecepcionMercaderiaResponseDTO();
        dto.setId(recepcion.getId());
        dto.setOrdenCompraId(recepcion.getOrdenCompra().getId());
        dto.setUsuarioNombre(recepcion.getUsuario().getNombreCompleto());
        dto.setFechaHora(recepcion.getFechaHora());
        dto.setObservaciones(recepcion.getObservaciones());
        dto.setDetalles(recepcion.getDetalles().stream()
                .map(this::convertirRecepcionDetalleResponse)
                .collect(Collectors.toList()));
        return dto;
    }

    private RecepcionDetalleResponseDTO convertirRecepcionDetalleResponse(RecepcionDetalle detalle) {
        RecepcionDetalleResponseDTO dto = new RecepcionDetalleResponseDTO();
        dto.setId(detalle.getId());
        dto.setOrdenDetalleId(detalle.getOrdenDetalle().getId());
        dto.setProductoId(detalle.getOrdenDetalle().getProducto().getId());
        dto.setProductoNombre(detalle.getOrdenDetalle().getProducto().getNombre());
        dto.setCantidadRecibida(detalle.getCantidadRecibida());
        dto.setNumeroLote(detalle.getNumeroLote());
        dto.setFechaVencimiento(detalle.getFechaVencimiento());
        dto.setObservacionItem(detalle.getObservacionItem());
        return dto;
    }
}
