package com.farmacia.cristoredentor.module.Usuario;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.module.Usuario.dto.ActualizarUsuarioDto;
import com.farmacia.cristoredentor.module.Usuario.dto.crearUsuarioDto;
import com.farmacia.cristoredentor.module.Usuario.dto.usuarioRequestDto;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/usuarios")
public class usuarioController {

    private final usuarioService service;

    public usuarioController(usuarioService service) {
        this.service = service;

    }

    // POST /api/usuarios
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<usuarioRequestDto> crear(@Valid @RequestBody crearUsuarioDto dto) {
        usuarioRequestDto creado = service.crearUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // GET /api/usuarios/{id}
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    public ResponseEntity<usuarioRequestDto> obtenerPorId(@PathVariable Integer id) {
        usuarioRequestDto usuario = service.obtenerPorId_Request(id);
        return ResponseEntity.ok(usuario);
    }

    // GET /api/usuarios
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping
    public ResponseEntity<List<usuarioRequestDto>> listarActivos() {
        return ResponseEntity.ok(service.listarActivos());
    }

    // GET /api/usuarios/todos — lista todos (activos e inactivos) para gestión
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/todos")
    public ResponseEntity<List<usuarioRequestDto>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    // GET /api/usuarios/paginado?page=0&limit=20
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping("/paginado")
    public ResponseEntity<PaginatedResponseDto<usuarioRequestDto>> listarActivosPaginado(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer limit) {
        PaginatedResponseDto<usuarioRequestDto> resultado = service.listarActivosPaginado(page, limit);

        // Retornamos usando el constructor tradicional
        return ResponseEntity.ok(resultado);

    }

    // PUT /api/usuarios/{id}
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/{id}")
    public ResponseEntity<usuarioRequestDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ActualizarUsuarioDto dto) {
        usuarioRequestDto actualizado = service.actualizarUsuario(dto, id);
        return ResponseEntity.ok(actualizado);
    }

    // put /api/usuarios/eliminar/{id}
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/eliminar/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        service.desactivarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    // put /api/usuarios/activar/{id}
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/activar/{id}")
    public ResponseEntity<Void> dactivar(@PathVariable Integer id) {
        service.activarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}