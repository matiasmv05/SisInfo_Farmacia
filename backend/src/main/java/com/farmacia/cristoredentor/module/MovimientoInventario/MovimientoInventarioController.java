package com.farmacia.cristoredentor.module.MovimientoInventario;

import java.util.List;

import org.springframework.http.HttpStatus;
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

import com.farmacia.cristoredentor.module.MovimientoInventario.dto.AjusteRequestDTO;
import com.farmacia.cristoredentor.module.MovimientoInventario.dto.BajaVencimientoRequestDTO;
import com.farmacia.cristoredentor.module.MovimientoInventario.dto.MovimientoDetalleDTO;
import com.farmacia.cristoredentor.module.MovimientoInventario.dto.SalidaRequestDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/movimientos")
public class MovimientoInventarioController {

    private final MovimientoInventarioService service;

    public MovimientoInventarioController(MovimientoInventarioService service) {
        this.service = service;
    }

    // =========================================================================
    // POST /api/movimientos/salida
    // Descuenta stock aplicando lógica FEFO.
    // Puede generar múltiples movimientos si la cantidad abarca varios lotes.
    // Body: SalidaRequestDTO (productoId, cantidad)
    // =========================================================================
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @PostMapping("/salida")
    public ResponseEntity<List<MovimientoDetalleDTO>> salida(
            @Valid @RequestBody SalidaRequestDTO dto,
            Authentication authentication) {

        Integer usuarioId = (Integer) authentication.getPrincipal();

        List<MovimientoDetalleDTO> resultados =
                service.salida(dto.getProductoId(), dto.getCantidad(), usuarioId);

        return ResponseEntity.status(HttpStatus.CREATED).body(resultados);
    }

    // =========================================================================
    // POST /api/movimientos/baja-vencimiento
    // Marca lote como vencido, cantidad → 0, registra baja_vencimiento.
    // Body: BajaVencimientoRequestDTO (loteId, motivo)
    // =========================================================================
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/baja-vencimiento")
    public ResponseEntity<MovimientoDetalleDTO> bajaVencimiento(
            @Valid @RequestBody BajaVencimientoRequestDTO dto,
            Authentication authentication) {

        Integer usuarioId = (Integer) authentication.getPrincipal();
        MovimientoDetalleDTO resultado =
                service.bajaVencimiento(dto.getLoteId(), dto.getMotivo(), usuarioId);

        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }

    // =========================================================================
    // POST /api/movimientos/ajuste-entrada
    // Suma unidades a un lote existente (devolución, corrección física).
    // Body: AjusteRequestDTO (loteId, cantidad, motivo)
    // =========================================================================
   @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/ajuste-entrada")
    public ResponseEntity<MovimientoDetalleDTO> ajusteEntrada(
           @Valid @RequestBody AjusteRequestDTO dto,
            Authentication authentication) {
        
        Integer usuarioId = (Integer) authentication.getPrincipal();
        MovimientoDetalleDTO resultado = service.ajusteEntrada(
                dto.getLoteId(), dto.getCantidad(), dto.getMotivo(),usuarioId );

        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }

    // =========================================================================
    // POST /api/movimientos/ajuste-salida
    // Descuenta unidades de un lote (merma, daño, corrección física).
    // Body: AjusteRequestDTO (loteId, cantidad, motivo)
    // =========================================================================
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PostMapping("/ajuste-salida")
    public ResponseEntity<MovimientoDetalleDTO> ajusteSalida(
            @Valid @RequestBody AjusteRequestDTO dto,
       Authentication authentication) {

        Integer usuarioId = (Integer) authentication.getPrincipal();
        MovimientoDetalleDTO resultado = service.ajusteSalida(
                dto.getLoteId(), dto.getCantidad(), dto.getMotivo(), usuarioId);

        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }

    // =========================================================================
    // GET /api/movimientos/producto/{productoId}?page=0&limit=20
    // Historial paginado de movimientos de un producto, fecha descendente.
    // =========================================================================
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping("/producto/{productoId}")
    public ResponseEntity<PaginatedResponseDto<MovimientoDetalleDTO>> historialPorProducto(
            @PathVariable Integer productoId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int limit) {

        return ResponseEntity.ok(
                service.listarPorProducto(productoId, page, limit));
    }
}