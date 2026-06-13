package com.farmacia.cristoredentor.module.Producto;

<<<<<<< HEAD
=======
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.module.Producto.dto.*;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.Entity.Categoria;
import com.farmacia.cristoredentor.module.Categoria.CategoriaRepository;

import org.springframework.stereotype.Service;
>>>>>>> d3f8533c188aaa31d47a986ef4f0881f31e04087
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

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

<<<<<<< HEAD
import com.farmacia.cristoredentor.Entity.Categoria;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.Categoria.CategoriaRepository;
import com.farmacia.cristoredentor.module.Lote.LoteRepository;
import com.farmacia.cristoredentor.module.Producto.dto.ProductoDetalleDTO;
import com.farmacia.cristoredentor.module.Producto.dto.ProductoRequestDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@Service
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepo;
    private final CategoriaRepository categoriaRepo;
    private final ModelMapper modelMapper;
    private final LoteRepository loteRepo; 

    public ProductoService(ProductoRepository productoRepo,
                           CategoriaRepository categoriaRepo,
                           ModelMapper modelMapper ,  
                           LoteRepository loteRepo                     
                        ) {
        this.productoRepo = productoRepo;
        this.categoriaRepo = categoriaRepo;
        this.modelMapper = modelMapper;
        this.loteRepo = loteRepo;
    }

    // Crear
    public ProductoDetalleDTO crearProducto(ProductoRequestDTO dto) {
        validarPrecios(dto);
        validarStocks(dto);

        Categoria categoria = categoriaRepo.findById(dto.getCategoriaId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Categoría no encontrada: " + dto.getCategoriaId()));

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
            .map(p -> toDetalleDTO(p))
            .toList();

        return new PaginatedResponseDto<>(data, page, limit, (int) resultado.getTotalElements());
    }


    @Transactional(readOnly = true)
public PaginatedResponseDto<ProductoDetalleDTO> listarFiltrado(
        Integer page, Integer limit, String nombre, Integer categoriaId) {

    Pageable pageable = PageRequest.of(page, limit, Sort.by("nombre").ascending());
    Page<Producto> resultado = productoRepo.findByFiltros(nombre, categoriaId, pageable);

    List<ProductoDetalleDTO> data = resultado.getContent()
        .stream()
        .map(this::toDetalleDTO)
        .toList();

    return new PaginatedResponseDto<>(data, page, limit, (int) resultado.getTotalElements());
}

    @Transactional(readOnly = true)
    public PaginatedResponseDto<ProductoDetalleDTO> listarStockCritico(Integer page, Integer limit) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by("nombre").ascending());
        Page<Producto> resultado = productoRepo.findProductosStockCritico(pageable);

        List<ProductoDetalleDTO> data = resultado.getContent()
            .stream()
            .map(p -> toDetalleDTO(p))
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

        Categoria categoria = categoriaRepo.findById(dto.getCategoriaId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Categoría no encontrada: " + dto.getCategoriaId()));

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

    if (producto.getStockTotal() > 0) {
        throw new BusinessException(String.format(
            "No se puede desactivar el producto '%s' (id=%d) " +
            "porque tiene %d unidades en stock. " +
            "Registre las salidas o bajas correspondientes antes de desactivarlo.",
            producto.getNombre(), id, producto.getStockTotal()
        ));
    }

    producto.setActivo(false);
    productoRepo.save(producto);
}

     // Activar
    public void activarProducto(Integer id) {
        Producto producto = buscarEntidadDesactiva(id);
        producto.setActivo(true);
        productoRepo.save(producto);
    }

     // ─── Gestión de stock ────────────────────────────────────────────

    public void sincronizarStock(Integer productoId) {
    Producto producto = productoRepo.findByIdWithLock(productoId)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Producto no encontrado: " + productoId));

    int stockReal = loteRepo.calcularStockReal(productoId);
    producto.setStockTotal(stockReal);
    productoRepo.save(producto);
   }

    // -------------------------------------------------------------------------
    // Métodos internos
    // -------------------------------------------------------------------------

    public Producto buscarEntidadActiva(Integer id) {
        return productoRepo.findByIdAndActivoTrue(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Producto no encontrado: " + id));
    }

    public Producto buscarEntidadDesactiva(Integer id) {
        return productoRepo.findByIdAndActivoFalse(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Producto no encontrado: " + id));
    }

   private ProductoDetalleDTO toDetalleDTO(Producto p) {
    ProductoDetalleDTO dto = modelMapper.map(p, ProductoDetalleDTO.class);
    dto.setCategoria(p.getCategoriaid().getNombre());
    dto.setClasificacionAbc(
        p.getClasificacionAbc() != null 
            ? p.getClasificacionAbc().name() 
            : null
    );
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
=======
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

>>>>>>> d3f8533c188aaa31d47a986ef4f0881f31e04087
