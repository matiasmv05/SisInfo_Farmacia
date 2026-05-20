package com.farmacia.cristoredentor.module.Producto;

import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.module.Producto.dto.*;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.Entity.Categoria;
import com.farmacia.cristoredentor.module.Categoria.CategoriaRepository;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductoService {
    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    
    public ProductoService(ProductoRepository productoRepository, CategoriaRepository categoriaRepository) {
        this.productoRepository = productoRepository;
        this.categoriaRepository = categoriaRepository;
    }

    
    public ProductoResponseDTO crear(ProductoCreateDTO productoCreateDTO) {
        Categoria categoria = categoriaRepository.findById(productoCreateDTO.getCategoriaId())
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
        
        Producto producto =  Producto.builder()
                .nombre(productoCreateDTO.getNombre())
                .categoria(categoria)
                .laboratorio(productoCreateDTO.getLaboratorio())
                .concentracion(productoCreateDTO.getConcentracion())
                .presentacion(productoCreateDTO.getPresentacion())
                .precioCosto(productoCreateDTO.getPrecioCosto())
                .precioVenta(productoCreateDTO.getPrecioVenta())
                .stockMinimo(productoCreateDTO.getStockMinimo())
                .stockMaximo(productoCreateDTO.getStockMaximo())
                .clasificacionABC("C")
                .stockTotal(0)
                .activo(true)
                .build();

        productoRepository.save(producto);
        
        return convertirResponse(producto);
    }


    public List<ProductoResponseDTO> listar() {
        return productoRepository.findAll().stream()
                .map(this::convertirResponse)
                .collect(Collectors.toList());
    }


    public ProductoResponseDTO obtenerPorId(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        return convertirResponse(producto);
    }

    
    public ProductoResponseDTO actualizar(Long id, ProductoUpdateDTO productoUpdateDTO) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        if (productoUpdateDTO.getNombre() != null) {
            producto.setNombre(productoUpdateDTO.getNombre());
        }
        if (productoUpdateDTO.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(productoUpdateDTO.getCategoriaId())
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            producto.setCategoria(categoria);
        }
        if (productoUpdateDTO.getLaboratorio() != null) {
            producto.setLaboratorio(productoUpdateDTO.getLaboratorio());
        }
        if (productoUpdateDTO.getConcentracion() != null) {
            producto.setConcentracion(productoUpdateDTO.getConcentracion());
        }
        if (productoUpdateDTO.getPresentacion() != null) {
            producto.setPresentacion(productoUpdateDTO.getPresentacion());
        }
        if (productoUpdateDTO.getPrecioCosto() != null) {
            producto.setPrecioCosto(productoUpdateDTO.getPrecioCosto());
        }
        if (productoUpdateDTO.getPrecioVenta() != null) {
            producto.setPrecioVenta(productoUpdateDTO.getPrecioVenta());
        }
        if (productoUpdateDTO.getStockMinimo() != null) {
            producto.setStockMinimo(productoUpdateDTO.getStockMinimo());
        }
        if (productoUpdateDTO.getStockMaximo() != null) {
            producto.setStockMaximo(productoUpdateDTO.getStockMaximo());
        }
        if (productoUpdateDTO.getClasificacionABC() != null) {
            producto.setClasificacionABC(productoUpdateDTO.getClasificacionABC());
        }
        if (productoUpdateDTO.getActivo() != null) {
            producto.setActivo(productoUpdateDTO.getActivo());
        }

        productoRepository.save(producto);
        
        return convertirResponse(producto);
    }

    
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    
    public void clasificarABC() {
        // Lógica para clasificar productos en A, B o C según su rotación 
    }

    private ProductoResponseDTO convertirResponse(Producto producto) {
        return ProductoResponseDTO.builder()
                .id(producto.getId())
                .nombre(producto.getNombre())
                .categoriaNombre(producto.getCategoria().getNombre())
                .laboratorio(producto.getLaboratorio())
                .concentracion(producto.getConcentracion())
                .presentacion(producto.getPresentacion())
                .precioCosto(producto.getPrecioCosto())
                .precioVenta(producto.getPrecioVenta())
                .stockMinimo(producto.getStockMinimo())
                .stockMaximo(producto.getStockMaximo())
                .clasificacionABC(producto.getClasificacionABC())
                .stockTotal(producto.getStockTotal())
                .activo(producto.isActivo())
                .build();
    }
}

