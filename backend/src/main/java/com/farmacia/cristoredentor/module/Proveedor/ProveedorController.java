package com.farmacia.cristoredentor.module.Proveedor;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.module.Proveedor.dto.ProveedorRequestDTO;
import com.farmacia.cristoredentor.module.Proveedor.dto.ProveedorResponseDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    private final ProveedorService service;

    public ProveedorController(ProveedorService service) {
        this.service = service;
    }

    // POST /api/proveedores
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ProveedorResponseDTO> crear(
            @Valid @RequestBody ProveedorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(dto));
    }

    // GET /api/proveedores/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ProveedorResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    // GET /api/proveedores/todos
    @GetMapping("/todos")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<List<ProveedorResponseDTO>> listarTodos() {
        return ResponseEntity.ok(service.listarActivos());
    }

    // GET /api/proveedores?page=0&limit=20&nombre=farma&activo=true
    // Accesible por ADMINISTRADOR y OPERADOR (para crear órdenes)
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    public ResponseEntity<PaginatedResponseDto<ProveedorResponseDTO>> listar(
            @RequestParam(defaultValue = "0")  Integer page,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(required = false)    String nombre,
            @RequestParam(required = false)    Boolean activo) {
        return ResponseEntity.ok(service.listarPaginado(page, limit, nombre, activo));
    }

    // PUT /api/proveedores/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<ProveedorResponseDTO> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ProveedorRequestDTO dto) {
        return ResponseEntity.ok(service.actualizar(id, dto));
    }

    // DELETE /api/proveedores/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        service.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    // PATCH /api/proveedores/{id}/activar
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> activar(@PathVariable Integer id) {
        service.activar(id);
        return ResponseEntity.noContent().build();
    }
}