package com.farmacia.cristoredentor.module.Producto;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmacia.cristoredentor.Entity.Categoria;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.Categoria.CategoriaRepository;
import com.farmacia.cristoredentor.module.Producto.dto.ProductoDetalleDTO;
import com.farmacia.cristoredentor.module.Producto.dto.ProductoRequestDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@Service
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepo;
    private final CategoriaRepository categoriaRepo;
    private final ModelMapper modelMapper;

    public ProductoService(ProductoRepository productoRepo,
                           CategoriaRepository categoriaRepo,
                           ModelMapper modelMapper) {
        this.productoRepo = productoRepo;
        this.categoriaRepo = categoriaRepo;
        this.modelMapper = modelMapper;
    }

    // Crear
    public ProductoDetalleDTO crearProducto(ProductoRequestDTO dto) {
        validarPrecios(dto);
        validarStocks(dto);

        Categoria categoria = categoriaRepo.findById(dto.getCategoriaid())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Categoría no encontrada: " + dto.getCategoriaid()));

        Producto producto = Producto.builder()
                            .nombre(dto.getNombre())
                            .categoriaid(categoria)
                            .laboratorio(dto.getLaboratorio())
                            .concentracion(dto.getConcentracion())
                            .presentacion(dto.getPresentacion())
                            .precioCosto(dto.getPrecioCosto())
                            .precioVenta(dto.getPrecioVenta())
                            .stockMinimo(dto.getStockMinimo())
                            .stockMaximo(dto.getStockMaximo())
                            .diasMinimosVenta(dto.getDiasMinimosVenta())
                            .stockTotal(0) // El stock total se actualiza automáticamente al crear lotes
                            .activo(true)
                            .build();

        Producto guardado = productoRepo.save(producto);
        return toDetalleDTO(guardado);
    }

    // Listar paginado productos
    @Transactional(readOnly = true)
    public PaginatedResponseDto<ProductoDetalleDTO> listarPaginado(Integer page, Integer limit) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by("nombre").ascending());
        Page<Producto> resultado = productoRepo.findByActivoTrue(pageable);

        List<ProductoDetalleDTO> data = resultado.getContent()
            .stream()
            .map(p -> modelMapper.map(p, ProductoDetalleDTO.class))
            .toList();

        return new PaginatedResponseDto<>(data, page, limit, (int) resultado.getTotalElements());
    }

    @Transactional(readOnly = true)
    public PaginatedResponseDto<ProductoDetalleDTO> listarStockCritico(Integer page, Integer limit) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by("nombre").ascending());
        Page<Producto> resultado = productoRepo.findProductosStockCritico(pageable);

        List<ProductoDetalleDTO> data = resultado.getContent()
            .stream()
            .map(p -> modelMapper.map(p, ProductoDetalleDTO.class))
            .toList();

        return new PaginatedResponseDto<>(data, page, limit, (int) resultado.getTotalElements());
    }

    // Obtener detalle por id
    @Transactional(readOnly = true)
    public ProductoDetalleDTO obtenerPorId(Integer id) {
        Producto producto = buscarEntidadActiva(id);
        return toDetalleDTO(producto);
    }

    // Actualizar
    public ProductoDetalleDTO actualizarProducto(Integer id, ProductoRequestDTO dto) {
        validarPrecios(dto);
        validarStocks(dto);

        Producto producto = buscarEntidadActiva(id);

        Categoria categoria = categoriaRepo.findById(dto.getCategoriaid())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Categoría no encontrada: " + dto.getCategoriaid()));

        producto.setNombre(dto.getNombre());
        producto.setCategoriaid(categoria);
        producto.setLaboratorio(dto.getLaboratorio());
        producto.setConcentracion(dto.getConcentracion());
        producto.setPresentacion(dto.getPresentacion());
        producto.setPrecioCosto(dto.getPrecioCosto());
        producto.setPrecioVenta(dto.getPrecioVenta());
        producto.setStockMinimo(dto.getStockMinimo());
        producto.setStockMaximo(dto.getStockMaximo());
        producto.setDiasMinimosVenta(dto.getDiasMinimosVenta());

        return toDetalleDTO(productoRepo.save(producto));
    }

    // Desactivar
    public void desactivarProducto(Integer id) {
        Producto producto = buscarEntidadActiva(id);
        producto.setActivo(false);
        productoRepo.save(producto);
    }

    // -------------------------------------------------------------------------
    // Métodos internos
    // -------------------------------------------------------------------------

    Producto buscarEntidadActiva(Integer id) {
        return productoRepo.findByIdAndActivoTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Producto no encontrado: " + id));
    }

    private ProductoDetalleDTO toDetalleDTO(Producto p) {
        ProductoDetalleDTO dto = modelMapper.map(p, ProductoDetalleDTO.class);
        dto.setCategoria(p.getCategoriaid().getNombre()); 
        return dto;
    }

    private void validarPrecios(ProductoRequestDTO dto) {
        if (dto.getPrecioVenta().compareTo(dto.getPrecioCosto()) < 0)
            throw new BusinessException(
                "El precio de venta no puede ser menor al precio de costo");
    }

    private void validarStocks(ProductoRequestDTO dto) {
        if (dto.getStockMaximo() != null && dto.getStockMaximo() <= dto.getStockMinimo())
            throw new BusinessException(
                "El stock máximo debe ser mayor al stock mínimo");
    }
}