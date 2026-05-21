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

import com.farmacia.cristoredentor.module.Usuario.dto.ActualizarUsuarioDto;
import com.farmacia.cristoredentor.module.Usuario.dto.crearUsuarioDto;
import com.farmacia.cristoredentor.module.Usuario.dto.loginUsuarioDto;
import com.farmacia.cristoredentor.module.Usuario.dto.usuarioRequestDto;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import io.micrometer.common.util.internal.logging.InternalLogger;

  

@RestController
@RequestMapping("/api/usuarios")
public class usuarioController {

    private final usuarioService service;

    public usuarioController(usuarioService service) {
        this.service = service;

    }

    // POST /api/usuarios
    @PostMapping
    public ResponseEntity<usuarioRequestDto> crear(@RequestBody crearUsuarioDto dto) {
        usuarioRequestDto creado = service.crearUsuario(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    // GET /api/usuarios/{id}
    @GetMapping("/{id}")
    public ResponseEntity<usuarioRequestDto> obtenerPorId(@PathVariable Integer id) {
        usuarioRequestDto usuario = service.obtenerPorId_Request(id);
        return ResponseEntity.ok(usuario);
    }

    // GET /api/usuarios
    @GetMapping
public ResponseEntity<List<usuarioRequestDto>> listarActivos() {
    return ResponseEntity.ok(service.listarActivos());
}

    // GET /api/usuarios/paginado?page=0&limit=20
      @GetMapping("/paginado")
public ResponseEntity<PaginatedResponseDto<usuarioRequestDto>> listarActivosPaginado(
        @RequestParam(defaultValue = "0") Integer page,
        @RequestParam(defaultValue = "20") Integer limit) {
    PaginatedResponseDto<usuarioRequestDto> resultado = service.listarActivosPaginado(page, limit);
    
    // Retornamos usando el constructor tradicional
    return ResponseEntity.ok(resultado);
    
}

    // PUT /api/usuarios/{id}
    @PutMapping("/{id}")
    public ResponseEntity<usuarioRequestDto> actualizar(
            @PathVariable Integer id,
            @RequestBody ActualizarUsuarioDto dto) {
        usuarioRequestDto actualizado = service.actualizarUsuario(dto, id);
        return ResponseEntity.ok(actualizado);
    }

    // put /api/usuarios/eliminar/{id}
    @PutMapping("/eliminar/{id}")
    public ResponseEntity<Void> desactivar(@PathVariable Integer id) {
        service.desactivarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/usuarios/login
    @PostMapping("/login")
    public ResponseEntity<usuarioRequestDto> login(@RequestBody loginUsuarioDto dto) {
        usuarioRequestDto usuario = service.login(dto);
        return ResponseEntity.ok(usuario);
    }
}