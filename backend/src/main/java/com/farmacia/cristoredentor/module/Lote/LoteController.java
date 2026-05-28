package com.farmacia.cristoredentor.module.Lote;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.module.Lote.dto.LoteDetalleDTO;
import com.farmacia.cristoredentor.module.Lote.dto.MarcarVencidoRequestDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

@RestController
@RequestMapping("/api/lotes")
@Validated
public class LoteController {

    private final LoteService service;

    public LoteController(LoteService service) {
        this.service = service;
    }

    /**
     * GET /api/lotes/{id}
     * Devuelve el detalle de un lote por su ID.
     */
    
    @GetMapping("/{id}")
     @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    public ResponseEntity<LoteDetalleDTO> obtenerPorId(
            @PathVariable @Min(1) Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    /**
     * GET /api/lotes/producto/{productoId}?page=0&limit=20
     * Lista los lotes de un producto paginados, ordenados por vencimiento ASC.
     */
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<PaginatedResponseDto<LoteDetalleDTO>> listarPorProducto(
            @PathVariable @Min(1) Integer productoId,
            @RequestParam(defaultValue = "0")  @Min(0) Integer page,
            @RequestParam(defaultValue = "20") @Min(1) Integer limit) {
        return ResponseEntity.ok(service.listarPorProducto(productoId, page, limit));
    }

    /**
     * GET /api/lotes?estado=activo&page=0&limit=20
     * Lista lotes filtrados por estado (activo, agotado, vencido).
     */
        @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping
    public ResponseEntity<PaginatedResponseDto<LoteDetalleDTO>> listarPorEstado(
            @RequestParam(defaultValue = "activo") String estado,
            @RequestParam(defaultValue = "0")      @Min(0) Integer page,
            @RequestParam(defaultValue = "20")     @Min(1) Integer limit) {
        return ResponseEntity.ok(service.listarPorEstado(estado, page, limit));
    }

    /**
     * PATCH /api/lotes/{id}/vencido
     * Marca un lote como vencido, poniendo su cantidad a 0.
     * Requiere un motivo obligatorio en el body.
     */
   @PatchMapping("/{id}/vencido")
public ResponseEntity<LoteDetalleDTO> marcarVencido(
        @PathVariable Integer id,                    
        @Valid @RequestBody MarcarVencidoRequestDTO request,
        Authentication authentication) {
    
    return ResponseEntity.ok(service.marcarVencidoComoDTO(id, request.getMotivo())); 
}
}