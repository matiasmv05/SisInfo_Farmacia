package com.farmacia.cristoredentor.module.ProductoProveedor;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Entity.ProductoProveedor;
import com.farmacia.cristoredentor.Entity.ProductoProveedorId;
import com.farmacia.cristoredentor.Entity.Proveedor;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.module.ProductoProveedor.dto.ProductoProveedorDetalleDTO;
import com.farmacia.cristoredentor.module.ProductoProveedor.dto.ProductoProveedorRequestDTO;
import com.farmacia.cristoredentor.module.Proveedor.ProveedorRepository;

@Service
@Transactional
public class ProductoProveedorService {

    private final ProductoProveedorRepository repo;
    private final ProductoRepository productoRepo;
    private final ProveedorRepository proveedorRepo;

    public ProductoProveedorService(ProductoProveedorRepository repo,
                                    ProductoRepository productoRepo,
                                    ProveedorRepository proveedorRepo) {
        this.repo = repo;
        this.productoRepo = productoRepo;
        this.proveedorRepo = proveedorRepo;
    }

    // Asignar proveedor a producto
    public ProductoProveedorDetalleDTO asignarProveedor(
            Integer productoId, ProductoProveedorRequestDTO dto) {

        Producto producto = productoRepo.findByIdAndActivoTrue(productoId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Producto no encontrado: " + productoId));

        Proveedor proveedor = proveedorRepo.findByIdAndActivoTrue(dto.getProveedorId());
        
        if (proveedor == null)
            throw new ResourceNotFoundException(
                "Proveedor no encontrado: " + dto.getProveedorId());

        if (repo.existsByIdProductoIdAndIdProveedorId(productoId, dto.getProveedorId()))
            throw new BusinessException("Este proveedor ya está asignado al producto");

        // Si se marca como principal, quitar el principal anterior
        if (dto.isEsPrincipal())
            quitarPrincipalActual(productoId);

        ProductoProveedor pp = ProductoProveedor.builder()
            .id(new ProductoProveedorId(productoId, dto.getProveedorId()))
            .producto(producto)
            .proveedor(proveedor)
            .esPrincipal(dto.isEsPrincipal())
            .createdAt(OffsetDateTime.now())
            .build();

        repo.save(pp);
        return toDetalleDTO(pp);
    }

    // Listar proveedores de un producto
    @Transactional(readOnly = true)
    public List<ProductoProveedorDetalleDTO> listarPorProducto(Integer productoId) {
        return repo.findByIdProductoId(productoId)
            .stream()
            .map(this::toDetalleDTO)
            .toList();
    }

    // Cambiar proveedor principal
    public ProductoProveedorDetalleDTO cambiarPrincipal(Integer productoId, Integer proveedorId) {
        ProductoProveedor pp = repo.findById(new ProductoProveedorId(productoId, proveedorId))
            .orElseThrow(() -> new ResourceNotFoundException(
                "Relación producto-proveedor no encontrada"));

        quitarPrincipalActual(productoId);
        pp.setEsPrincipal(true);
        return toDetalleDTO(repo.save(pp));
    }

    // Eliminar proveedor de producto
    public void eliminarProveedor(Integer productoId, Integer proveedorId) {
        ProductoProveedorId pk = new ProductoProveedorId(productoId, proveedorId);

        ProductoProveedor pp = repo.findById(pk)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Relación producto-proveedor no encontrada"));

        if (pp.isEsPrincipal())
            throw new BusinessException(
                "No se puede eliminar el proveedor principal. " +
                "Asigne otro proveedor como principal primero.");

        repo.deleteById(pk);
    }

    // -------------------------------------------------------------------------
    // Métodos internos
    // -------------------------------------------------------------------------

    private void quitarPrincipalActual(Integer productoId) {
        repo.findByIdProductoIdAndEsPrincipalTrue(productoId)
            .ifPresent(actual -> {
                actual.setEsPrincipal(false);
                repo.save(actual);
            });
    }

    private ProductoProveedorDetalleDTO toDetalleDTO(ProductoProveedor pp) {
        return ProductoProveedorDetalleDTO.builder()
            .productoId(pp.getId().getProductoId())
            .productoNombre(pp.getProducto().getNombre())
            .proveedorId(pp.getId().getProveedorId())
            .proveedorNombre(pp.getProveedor().getNombre())
            .proveedorContacto(pp.getProveedor().getContactoNombre())
            .proveedorTelefono(pp.getProveedor().getTelefono())
            .esPrincipal(pp.isEsPrincipal())
            .createdAt(pp.getCreatedAt())
            .build();
    }
}