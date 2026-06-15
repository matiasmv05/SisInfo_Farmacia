package com.farmacia.cristoredentor.module.ProductoProveedor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.module.ProductoProveedor.dto.ProductoProveedorDetalleDTO;
import com.farmacia.cristoredentor.module.ProductoProveedor.dto.ProductoProveedorRequestDTO;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/productos/{productoId}/proveedores")
public class ProductoProveedorController {

    private final ProductoProveedorService service;

    public ProductoProveedorController(ProductoProveedorService service) {
        this.service = service;
    }

    // POST /api/productos/{productoId}/proveedores
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping
    public ResponseEntity<ProductoProveedorDetalleDTO> asignar(
            @PathVariable Integer productoId,
            @Valid @RequestBody ProductoProveedorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.asignarProveedor(productoId, dto));
    }

    // GET /api/productos/{productoId}/proveedores
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")   
    @GetMapping
    public ResponseEntity<List<ProductoProveedorDetalleDTO>> listar(
            @PathVariable Integer productoId) {
        return ResponseEntity.ok(service.listarPorProducto(productoId));
    }

    // PATCH /api/productos/{productoId}/proveedores/{proveedorId}/principal
        @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{proveedorId}/principal")
    public ResponseEntity<ProductoProveedorDetalleDTO> cambiarPrincipal(
            @PathVariable Integer productoId,
            @PathVariable Integer proveedorId) {
        return ResponseEntity.ok(service.cambiarPrincipal(productoId, proveedorId));
    }

    // DELETE /api/productos/{productoId}/proveedores/{proveedorId}
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{proveedorId}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Integer productoId,
            @PathVariable Integer proveedorId) {
        service.eliminarProveedor(productoId, proveedorId);
        return ResponseEntity.noContent().build();
    }
}