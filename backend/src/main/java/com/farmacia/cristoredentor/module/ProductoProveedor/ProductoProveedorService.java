package com.farmacia.cristoredentor.module.ProductoProveedor;

import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Entity.ProductoProveedor;
import com.farmacia.cristoredentor.Entity.Proveedor;

import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.module.ProductoProveedor.dto.*;
import com.farmacia.cristoredentor.module.ProductoProveedor.ProductoProveedorRepository;
import com.farmacia.cristoredentor.module.Proveedor.ProveedorRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoProveedorService{

    private final ProductoProveedorRepository repository;

    private final ProductoRepository productoRepository;

    private final ProveedorRepository proveedorRepository;

    public ProductoProveedorService(
            ProductoProveedorRepository repository,
            ProductoRepository productoRepository,
            ProveedorRepository proveedorRepository) {

        this.repository = repository;
        this.productoRepository = productoRepository;
        this.proveedorRepository = proveedorRepository;
    }

    
    public ProductoProveedorResponseDTO relacionar(
            ProductoProveedorCreateDTO dto) {

        Producto producto =
                productoRepository.findById(
                        dto.getProductoId())
                        .orElseThrow();

        Proveedor proveedor =
                proveedorRepository.findById(
                        dto.getProveedorId())
                        .orElseThrow();

        if (Boolean.TRUE.equals(dto.getEsPrincipal())) {

            ProductoProveedor actualPrincipal =
                    repository
                    .findByProductoAndEsPrincipalTrue(
                            producto);

            if (actualPrincipal != null) {

                actualPrincipal.setEsPrincipal(false);

                repository.save(actualPrincipal);
            }
        }

        ProductoProveedor relacion =
                ProductoProveedor.builder()
                        .producto(producto)
                        .proveedor(proveedor)
                        .esPrincipal(
                                dto.getEsPrincipal())
                        .createdAt(
                                LocalDateTime.now())
                        .build();

        repository.save(relacion);

        return convertirResponse(relacion);
    }

    
    public List<ProductoProveedorResponseDTO>
            listarPorProducto(Long productoId) {

        Producto producto =
                productoRepository.findById(productoId)
                        .orElseThrow();

        return repository.findByProducto(producto)
                .stream()
                .map(this::convertirResponse)
                .collect(Collectors.toList());
    }

    
    public List<ProductoProveedorResponseDTO>
            listarPorProveedor(Long proveedorId) {

        Proveedor proveedor =
                proveedorRepository.findById(proveedorId)
                        .orElseThrow();

        return repository.findByProveedor(proveedor)
                .stream()
                .map(this::convertirResponse)
                .collect(Collectors.toList());
    }

    
    public void eliminarRelacion(Long id) {

        repository.deleteById(id);
    }

    private ProductoProveedorResponseDTO
            convertirResponse(
            ProductoProveedor relacion) {

        return ProductoProveedorResponseDTO
                .builder()
                .id(relacion.getId())
                .productoNombre(
                        relacion.getProducto()
                                .getNombre())
                .proveedorNombre(
                        relacion.getProveedor()
                                .getNombre())
                .esPrincipal(
                        relacion.isEsPrincipal())
                .build();
    }

    
    public List<ProductoProveedorResponseDTO> listar() {
        return repository.findAll()
                .stream()
                .map(this::convertirResponse)
                .collect(Collectors.toList());
    }
}