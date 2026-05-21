package com.farmacia.cristoredentor.module.Alerta;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.farmacia.cristoredentor.module.Alerta.dto.*;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@RestController
@RequestMapping("/api/alertas")
public class AlertaController {

    private final AlertaService service;

    public AlertaController(AlertaService service) {
        this.service = service;
    }

    // GET /api/alertas?page=0&limit=20
    @GetMapping
    public ResponseEntity<PaginatedResponseDto<AlertaDetalleDTO>> listarActivas(
            @RequestParam(defaultValue = "0")  Integer page,
            @RequestParam(defaultValue = "20") Integer limit) {
        return ResponseEntity.ok(service.listarActivas(page, limit));
    }

    // PATCH /api/alertas/{id}/leida
    @PatchMapping("/{id}/leida")
    public ResponseEntity<AlertaDetalleDTO> marcarLeida(
            @PathVariable Integer id,
            @Valid @RequestBody AlertaMarcarLeidaDTO dto) {
        return ResponseEntity.ok(service.marcarLeida(id, dto));
    }
}