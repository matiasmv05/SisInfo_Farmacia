package com.farmacia.cristoredentor.module.Configuracion_sistema;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.farmacia.cristoredentor.Entity.Configuracion_sistema;
import com.farmacia.cristoredentor.module.Configuracion_sistema.dto.ActualizarConfiguracionDto;

@RestController
@RequestMapping("/api/configuracion")
public class configuracionSistemaController {

    private final configuracionSistemaService service;

    public configuracionSistemaController(configuracionSistemaService service) {
        this.service = service;
    }

    // GET /api/configuracion
    @GetMapping
    public ResponseEntity<List<Configuracion_sistema>> obtenerTodos() {
        return ResponseEntity.ok(service.obtenerTodos());
    }

    // GET /api/configuracion/{clave}
    @GetMapping("/{clave}")
    public ResponseEntity<Configuracion_sistema> obtenerPorClave(@PathVariable String clave) {
        return ResponseEntity.ok(service.obtenerPorClave(clave));
    }

    // PUT /api/configuracion/{clave}
    @PutMapping("/{clave}")
    public ResponseEntity<Configuracion_sistema> actualizar(
            @PathVariable String clave,
            @RequestBody ActualizarConfiguracionDto dto) {
        return ResponseEntity.ok(service.actualizarValor(clave, dto));
    }

}