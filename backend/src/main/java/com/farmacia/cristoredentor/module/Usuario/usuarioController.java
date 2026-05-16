package com.farmacia.cristoredentor.module.Usuario;

import java.util.List;

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

import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.module.Usuario.dto.ActualizarUsuarioDto;
import com.farmacia.cristoredentor.module.Usuario.dto.crearUsuarioDto;
import com.farmacia.cristoredentor.module.Usuario.dto.loginUsuarioDto;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@RestController
@RequestMapping("/api/usuarios")
public class usuarioController {

    private final usuarioService service;

    public usuarioController(usuarioService service) {
        this.service = service;
    }

    // POST /api/usuarios
    @PostMapping
    public ResponseEntity<Usuario> crear(@RequestBody crearUsuarioDto dto) {
        Usuario creado = service.crearUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // GET /api/usuarios/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerPorId(@PathVariable Long id) {
        Usuario usuario = service.obtenerPorId(id);
        return ResponseEntity.ok(usuario);
    }

    // GET /api/usuarios
    @GetMapping
    public ResponseEntity<?> listarActivos(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer limit) {
        
        // Si se proporcionan parámetros de paginación, retornar datos paginados
        if (page != null || limit != null) {
            PaginatedResponseDto<Usuario> resultado = service.listarActivosPaginado(page, limit);
            return ResponseEntity.ok(resultado);
        }
        
        // Si no hay parámetros de paginación, retornar lista completa (compatibilidad hacia atrás)
        return ResponseEntity.ok(service.listarActivos());
    }

    // PUT /api/usuarios/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(
            @PathVariable Long id,
            @RequestBody ActualizarUsuarioDto dto) {
        Usuario actualizado = service.actualizarUsuario(dto, id);
        return ResponseEntity.ok(actualizado);
    }

    // DELETE /api/usuarios/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        service.desactivarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/usuarios/login
    @PostMapping("/login")
    public ResponseEntity<Usuario> login(@RequestBody loginUsuarioDto dto) {
        Usuario usuario = service.login(dto);
        return ResponseEntity.ok(usuario);
    }
}