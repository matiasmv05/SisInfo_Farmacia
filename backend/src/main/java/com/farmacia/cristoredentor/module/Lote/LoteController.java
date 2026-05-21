package com.farmacia.cristoredentor.module.Lote;

import com.farmacia.cristoredentor.module.Lote.dto.LoteDetalleDTO;
import com.farmacia.cristoredentor.module.Lote.dto.LoteRequestDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/lotes")
public class LoteController {

    private final LoteService service;

    public LoteController(LoteService service) {
        this.service = service;
    }

    // POST /api/lotes/entrada-directa
    @PostMapping("/entrada-directa")
    public ResponseEntity<LoteDetalleDTO> crearEntradaDirecta(
            @Valid @RequestBody LoteRequestDTO dto) {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(service.crearEntradaDirecta(dto));
    }

    // GET /api/lotes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<LoteDetalleDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    // GET /api/lotes/producto/{productoId}?page=0&limit=20
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<PaginatedResponseDto<LoteDetalleDTO>> listarPorProducto(
            @PathVariable Integer productoId,
            @RequestParam(defaultValue = "0")  Integer page,
            @RequestParam(defaultValue = "20") Integer limit) {
        return ResponseEntity.ok(service.listarPorProducto(productoId, page, limit));
    }

    // GET /api/lotes?estado=activo&page=0&limit=20
    @GetMapping
    public ResponseEntity<PaginatedResponseDto<LoteDetalleDTO>> listarPorEstado(
            @RequestParam(defaultValue = "activo") String estado,
            @RequestParam(defaultValue = "0")      Integer page,
            @RequestParam(defaultValue = "20")     Integer limit) {
        return ResponseEntity.ok(service.listarPorEstado(estado, page, limit));
    }

    // PATCH /api/lotes/{id}/vencido
    // Body: { "motivo": "Caducidad comprobada en inspección" }
    @PatchMapping("/{id}/vencido")
    public ResponseEntity<LoteDetalleDTO> marcarVencido(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body) {

        String motivo = body.get("motivo");
        if (motivo == null || motivo.isBlank()) {
            // Esto no llega al GlobalExceptionHandler — lo validamos aquí
            // porque es un Map simple, no un DTO con @Valid
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(service.marcarVencido(id, motivo));
    }
}