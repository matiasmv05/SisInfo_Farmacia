package com.farmacia.cristoredentor.module.Inventario;

import com.farmacia.cristoredentor.module.Inventario.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
public class InventarioController {

    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    // ==================== SALIDAS ====================

    @PostMapping("/salida")
    public ResponseEntity<SalidaFEFOResponseDTO> registrarSalida(
            @Valid @RequestBody SalidaFEFORequestDTO request,
            @RequestAttribute("usuarioId") Long usuarioId) {

        SalidaFEFOResponseDTO response = inventarioService.registrarSalidaFEFO(request, usuarioId);
        return ResponseEntity.ok(response);
    }

    // ==================== ENTRADAS ====================

    @PostMapping("/entrada-directa")
    public ResponseEntity<Void> registrarEntradaDirecta(
            @Valid @RequestBody EntradaDirectaRequestDTO request,
            @RequestAttribute("usuarioId") Long usuarioId) {

        inventarioService.registrarEntradaDirecta(request, usuarioId);
        return ResponseEntity.ok().build();
    }

    // ==================== AJUSTES ====================

    @PostMapping("/ajuste")
    public ResponseEntity<Void> registrarAjuste(
            @Valid @RequestBody AjusteInventarioRequestDTO request,
            @RequestAttribute("usuarioId") Long usuarioId) {

        inventarioService.registrarAjuste(request, usuarioId);
        return ResponseEntity.ok().build();
    }

    // ==================== CONSULTAS ====================

    @GetMapping("/stock/producto/{productoId}")
    public ResponseEntity<InventarioResponseDTO> obtenerStockPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(inventarioService.obtenerStockPorProducto(productoId));
    }

    @GetMapping("/historial/producto/{productoId}")
    public ResponseEntity<List<InventarioResponseDTO>> obtenerHistorialPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(inventarioService.obtenerHistorialPorProducto(productoId));
    }

    @GetMapping("/historial/lote/{loteId}")
    public ResponseEntity<List<InventarioResponseDTO>> obtenerHistorialPorLote(@PathVariable Long loteId) {
        return ResponseEntity.ok(inventarioService.obtenerHistorialPorLote(loteId));
    }

    @GetMapping("/lotes/producto/{productoId}")
    public ResponseEntity<List<InventarioResponseDTO>> obtenerLotesActivosPorProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(inventarioService.obtenerLotesActivosPorProducto(productoId));
    }

    // ==================== ENDPOINTS DE SISTEMA (protegidos) ====================

    @PostMapping("/tareas/bajar-vencidos")
    public ResponseEntity<Void> ejecutarBajaLotesVencidos(@RequestAttribute("usuarioId") Long usuarioId) {
        inventarioService.ejecutarBajaLotesVencidos(usuarioId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/tareas/generar-alertas")
    public ResponseEntity<Void> ejecutarGeneracionAlertas() {
        inventarioService.ejecutarGeneracionAlertas();
        return ResponseEntity.ok().build();
    }
}