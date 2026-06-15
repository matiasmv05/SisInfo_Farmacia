package com.farmacia.cristoredentor.module.Producto;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Enum.CategoriaProducto;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.ClasificacionAbc.ClasificacionAbcDetalleRepository;
import com.farmacia.cristoredentor.module.Lote.LoteRepository;
import com.farmacia.cristoredentor.module.Producto.dto.ProductoDetalleDTO;
import com.farmacia.cristoredentor.module.Producto.dto.ProductoRequestDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@Service
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepo;
    private final ModelMapper modelMapper;
    private final LoteRepository loteRepo; 
    private final ClasificacionAbcDetalleRepository abcDetalleRepo;


    public ProductoService(ProductoRepository productoRepo,
                           ModelMapper modelMapper ,  
                           LoteRepository loteRepo    ,
                           ClasificacionAbcDetalleRepository abcDetalleRepo
                        ) {
        this.productoRepo = productoRepo;
        this.modelMapper = modelMapper;
        this.loteRepo = loteRepo;
        this.abcDetalleRepo = abcDetalleRepo;
    }

    // Crear
    public ProductoDetalleDTO crearProducto(ProductoRequestDTO dto) {
        validarProducto(dto);
        validarPrecios(dto);
        validarStocks(dto);


        Producto producto = Producto.builder()
                            .nombre(dto.getNombre())
                            .categoria(dto.getCategoria())
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
        Integer page, Integer limit, String nombre, CategoriaProducto categoria, com.farmacia.cristoredentor.Enum.ClasificacionABC clasificacionAbc) {

    Pageable pageable = PageRequest.of(page, limit, Sort.by("nombre").ascending());
    Page<Producto> resultado = productoRepo.findByFiltros(nombre, categoria, clasificacionAbc, pageable);

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

        producto.setNombre(dto.getNombre());
        producto.setCategoria(dto.getCategoria());
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

    public void reaplicarClasificacionAbc(Integer productoId) {
    Producto producto = productoRepo.findById(productoId)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Producto no encontrado: " + productoId));

    abcDetalleRepo
        .findUltimoAbcByProducto(productoId)
        .ifPresent(detalle ->
            producto.setClasificacionAbc(detalle.getClasificacion())
        );

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
    dto.setCategoria(p.getCategoria());
    dto.setClasificacionAbc(
        p.getClasificacionAbc() != null 
            ? p.getClasificacionAbc().name() 
            : null
    );
    return dto;
}

private void validarProducto(ProductoRequestDTO dto){

    if(productoRepo.existeProductoDuplicado(dto.getNombre(), dto.getConcentracion(), dto.getPresentacion())){
         throw new BusinessException(
                "Existe el mismo producto en el inventario");
    }
}

    public void guardar(Producto producto) {
        productoRepo.save(producto);
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