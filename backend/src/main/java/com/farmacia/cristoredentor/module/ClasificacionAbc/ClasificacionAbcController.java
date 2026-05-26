package com.farmacia.cristoredentor.module.ClasificacionAbc;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcHistorialDTO;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcRequestDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/clasificacion-abc")
public class ClasificacionAbcController {

    private final ClasificacionAbcService service;

    public ClasificacionAbcController(ClasificacionAbcService service) {
        this.service = service;
    }

    // POST /api/clasificacion-abc/calcular
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/calcular")
    public ResponseEntity<ClasificacionAbcHistorialDTO> calcularManual(
            @Valid @RequestBody ClasificacionAbcRequestDTO dto,
            Authentication authentication) {
        
        Integer usuarioId = (Integer) authentication.getPrincipal();
        return ResponseEntity.ok(service.calcularManual(usuarioId, dto));
    }

    // GET /api/clasificacion-abc/ultimo
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/ultimo")
    public ResponseEntity<ClasificacionAbcHistorialDTO> obtenerUltimo() {
        return ResponseEntity.ok(service.obtenerUltimoCalculo());
    }

    // GET /api/clasificacion-abc/{id}
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping("/{id}")
    public ResponseEntity<ClasificacionAbcHistorialDTO> obtenerPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerHistorialPorId(id));
    }

    // GET /api/clasificacion-abc?page=0&limit=10
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @GetMapping
    public ResponseEntity<PaginatedResponseDto<ClasificacionAbcHistorialDTO>> listarHistorial(
            @RequestParam(defaultValue = "0")  Integer page,
            @RequestParam(defaultValue = "10") Integer limit) {
        return ResponseEntity.ok(service.listarHistorial(page, limit));
    }
}