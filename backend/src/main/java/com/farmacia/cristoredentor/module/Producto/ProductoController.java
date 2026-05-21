package com.farmacia.cristoredentor.module.Producto;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.module.Producto.dto.ProductoDetalleDTO;
import com.farmacia.cristoredentor.module.Producto.dto.ProductoRequestDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final ProductoService service;

    public ProductoController(ProductoService service) {
        this.service = service;
    }

    // POST /api/productos
    @PostMapping
    public ResponseEntity<ProductoDetalleDTO> crear(
            @Valid @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crearProducto(dto));
    }

    // GET /api/productos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDetalleDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    // GET /api/productos?page=0&limit=20&nombre=amox&categoriaId=1
    @GetMapping
    public ResponseEntity<PaginatedResponseDto<ProductoDetalleDTO>> listar(
            @RequestParam(defaultValue = "0")  Integer page,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(required = false)    String nombre,
            @RequestParam(required = false)    Integer categoriaId) {
        return ResponseEntity.ok(service.listarPaginado(page, limit));
    }

    // GET /api/productos/stock-critico?page=0&limit=20
    @GetMapping("/stock-critico")
    public ResponseEntity<PaginatedResponseDto<ProductoDetalleDTO>> stockCritico(
            @RequestParam(defaultValue = "0")  Integer page,
            @RequestParam(defaultValue = "20") Integer limit) {
        return ResponseEntity.ok(service.listarStockCritico(page, limit));
    }

    // PUT /api/productos/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ProductoDetalleDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.ok(service.actualizarProducto(id, dto));
    }

    // DELETE /api/productos/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        service.desactivarProducto(id);
        return ResponseEntity.noContent().build();
    }
}