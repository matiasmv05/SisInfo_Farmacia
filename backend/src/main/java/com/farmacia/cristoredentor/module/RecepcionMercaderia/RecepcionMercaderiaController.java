package com.farmacia.cristoredentor.module.RecepcionMercaderia;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.module.RecepcionMercaderia.dto.CrearRecepcionDto;
import com.farmacia.cristoredentor.module.RecepcionMercaderia.dto.RecepcionMercaderiaResponseDto;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/recepciones")
@Validated
public class RecepcionMercaderiaController {

    private final RecepcionMercaderiaService service;

    public RecepcionMercaderiaController(RecepcionMercaderiaService service) {
        this.service = service;
    }

    // POST /api/recepciones
        @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @PostMapping
    public ResponseEntity<RecepcionMercaderiaResponseDto> registrar(
            @Valid @RequestBody CrearRecepcionDto dto,
            Authentication auth) {

        Integer usuarioId = (Integer) auth.getPrincipal();
        
        RecepcionMercaderiaResponseDto response = service.registrar(dto, usuarioId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET /api/recepciones/{id}
    
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping("/{id}")
    public ResponseEntity<RecepcionMercaderiaResponseDto> obtenerPorId(
            @PathVariable Integer id) {

        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    // GET /api/recepciones?ordenCompraId=1&page=0&limit=20
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")    
    @GetMapping
    public ResponseEntity<PaginatedResponseDto<RecepcionMercaderiaResponseDto>> listarPorOrden(
            @RequestParam Integer ordenCompraId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer limit) {

        return ResponseEntity.ok(service.listarPorOrden(ordenCompraId, page, limit));
    }
}