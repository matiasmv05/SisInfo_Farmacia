package com.farmacia.cristoredentor.module.MovimientoInventario;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmacia.cristoredentor.Entity.*;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.Lote.LoteRepository;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;
import com.farmacia.cristoredentor.module.Proveedor.ProveedorRepository;
import com.farmacia.cristoredentor.module.OrdenCompra.OrdenCompraRepository;
import com.farmacia.cristoredentor.module.MovimientoInventario.dto.*;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@Transactional
public class MovimientoInventarioService {

    private final MovimientoInventarioRepository repo;
    private final LoteRepository loteRepo;
    private final ProductoRepository productoRepo;
    private final usuarioRepository usuarioRepo;
    private final ProveedorRepository proveedorRepo;
    private final OrdenCompraRepository ordenCompraRepo;

    public MovimientoInventarioService(
            MovimientoInventarioRepository repo,
            LoteRepository loteRepo,
            ProductoRepository productoRepo,
            usuarioRepository usuarioRepo,
            ProveedorRepository proveedorRepo,
            OrdenCompraRepository ordenCompraRepo) {
        this.repo = repo;
        this.loteRepo = loteRepo;
        this.productoRepo = productoRepo;
        this.usuarioRepo = usuarioRepo;
        this.proveedorRepo = proveedorRepo;
        this.ordenCompraRepo = ordenCompraRepo;
    }

    // Registrar movimiento
    public MovimientoDetalleDTO registrar(MovimientoRequestDTO dto) {
        Lote lote = loteRepo.findById(dto.getLoteId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Lote no encontrado: " + dto.getLoteId()));

        Producto producto = productoRepo.findById(dto.getProductoId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Producto no encontrado: " + dto.getProductoId()));

        Usuario usuario = usuarioRepo.findById(dto.getUsuarioId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Usuario no encontrado: " + dto.getUsuarioId()));

        validarReglasPorTipo(dto, lote);

        MovimientoInventario movimiento = MovimientoInventario.builder()
            .lote(lote)
            .producto(producto)
            .tipoMovimiento(dto.getTipoMovimiento())
            .cantidad(dto.getCantidad())
            .costoUnitario(dto.getCostoUnitario())
            .motivo(dto.getMotivo())
            .usuario(usuario)
            .proveedor(dto.getProveedorId() != null
                ? proveedorRepo.getReferenceById(dto.getProveedorId()) : null)
            .ordenCompra(dto.getOrdenCompraId() != null
                ? ordenCompraRepo.getReferenceById(dto.getOrdenCompraId()) : null)
            .referenciaId(dto.getReferenciaId())
            .fechaHora(OffsetDateTime.now())
            .build();

        return toDetalleDTO(repo.save(movimiento));
    }

    // Consultar por producto
    @Transactional(readOnly = true)
    public PaginatedResponseDto<MovimientoDetalleDTO> listarPorProducto(
            Integer productoId, Integer page, Integer limit) {

        Pageable pageable = PageRequest.of(page, limit);
        Page<MovimientoInventario> resultado = repo
            .findByProductoIdOrderByFechaHoraDesc(productoId, pageable);

        List<MovimientoDetalleDTO> data = resultado.getContent()
            .stream()
            .map(this::toDetalleDTO)
            .toList();

        return new PaginatedResponseDto<>(data, page, limit,
            (int) resultado.getTotalElements());
    }

    // -------------------------------------------------------------------------
    // Validaciones por tipo de movimiento
    // -------------------------------------------------------------------------
    private void validarReglasPorTipo(MovimientoRequestDTO dto, Lote lote) {

        switch (dto.getTipoMovimiento()) {

            case entrada -> {
                if (dto.getOrdenCompraId() == null)
                    throw new BusinessException(
                        "Una entrada requiere orden_compra_id");
            }

            case salida -> {
                if (lote.getCantidad() < dto.getCantidad())
                    throw new BusinessException(
                        "Stock insuficiente en lote " + lote.getNumeroLote() +
                        ". Disponible: " + lote.getCantidad());
            }

            case devolucion_cliente -> {
                if (dto.getReferenciaId() == null)
                    throw new BusinessException(
                        "Una devolución de cliente requiere referencia_id " +
                        "del movimiento de salida original");
                repo.findSalidaById(dto.getReferenciaId())
                    .orElseThrow(() -> new BusinessException(
                        "El movimiento de salida referenciado no existe: "
                        + dto.getReferenciaId()));
            }

            case ajuste_entrada, ajuste_salida,
                 devolucion_proveedor, baja_vencimiento -> {
                if (dto.getMotivo() == null || dto.getMotivo().isBlank())
                    throw new BusinessException(
                        "El tipo " + dto.getTipoMovimiento() +
                        " requiere motivo obligatorio");
            }

            default -> { }
        }
    }

    // -------------------------------------------------------------------------
    // Mapper manual
    // -------------------------------------------------------------------------
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
            .referenciaId(m.getReferenciaId())
            .fechaHora(m.getFechaHora())
            .build();
    }
}