package com.farmacia.cristoredentor.module.Alerta;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.module.Alerta.dto.AlertaDetalleDTO;
import com.farmacia.cristoredentor.module.Alerta.dto.AlertaMarcarLeidaDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import jakarta.validation.Valid;

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

    // GET /api/alertas/resumen
    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Integer>> obtenerResumen() {
        return ResponseEntity.ok(service.obtenerResumen());
    }

    // PATCH /api/alertas/{id}/leida
    @PatchMapping("/{id}/leida")
    public ResponseEntity<AlertaDetalleDTO> marcarLeida(
            @PathVariable Integer id,
            @Valid @RequestBody AlertaMarcarLeidaDTO dto) {
        return ResponseEntity.ok(service.marcarLeida(id, dto));
    }

    // POST /api/alertas/generar (DEBUG) — dispara el scheduler manualmente
    @PostMapping("/generar")
    public ResponseEntity<Map<String, String>> generarAlertas() {
        service.generarAlertasAutomaticas();
        return ResponseEntity.ok(Map.of("status", "Alertas generadas exitosamente"));
    }
}