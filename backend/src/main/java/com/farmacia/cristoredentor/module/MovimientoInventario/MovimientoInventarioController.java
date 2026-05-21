package com.farmacia.cristoredentor.module.MovimientoInventario;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.farmacia.cristoredentor.module.MovimientoInventario.dto.*;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoInventarioController {

    private final MovimientoInventarioService service;

    public MovimientoInventarioController(MovimientoInventarioService service) {
        this.service = service;
    }

    // POST /api/movimientos
    @PostMapping
    public ResponseEntity<MovimientoDetalleDTO> registrar(
            @Valid @RequestBody MovimientoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.registrar(dto));
    }

    // GET /api/movimientos/producto/{productoId}?page=0&limit=20
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<PaginatedResponseDto<MovimientoDetalleDTO>> listarPorProducto(
            @PathVariable Integer productoId,
            @RequestParam(defaultValue = "0")  Integer page,
            @RequestParam(defaultValue = "20") Integer limit) {
        return ResponseEntity.ok(
            service.listarPorProducto(productoId, page, limit));
    }
}