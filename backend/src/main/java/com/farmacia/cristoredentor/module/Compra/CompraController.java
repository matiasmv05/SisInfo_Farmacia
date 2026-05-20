package com.farmacia.cristoredentor.module.Compra;

import com.farmacia.cristoredentor.module.OrdenCompra.dto.OrdenCompraCreateDTO;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.OrdenCompraResponseDTO;
import com.farmacia.cristoredentor.module.RecepcionDetalle.dto.*;
import com.farmacia.cristoredentor.module.RecepcionMercaderia.dto.RecepcionMercaderiaCreateDTO;
import com.farmacia.cristoredentor.module.RecepcionMercaderia.dto.RecepcionMercaderiaResponseDTO;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/compras")
public class CompraController {

    private final CompraService service;

    public CompraController(CompraService service) {
        this.service = service;
    }

    @PostMapping("/ordenes")
    public ResponseEntity<OrdenCompraResponseDTO> crearOrden(@Valid @RequestBody OrdenCompraCreateDTO dto) {
        return ResponseEntity.ok(service.crearOrden(dto));
    }

    @GetMapping("/ordenes")
    public ResponseEntity<List<OrdenCompraResponseDTO>> listarOrdenes() {
        return ResponseEntity.ok(service.listarOrdenes());
    }

    @GetMapping("/ordenes/{id}")
    public ResponseEntity<OrdenCompraResponseDTO> obtenerOrden(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerOrdenPorId(id));
    }

    @PostMapping("/ordenes/{id}/emitir")
    public ResponseEntity<OrdenCompraResponseDTO> emitirOrden(@PathVariable Long id) {
        return ResponseEntity.ok(service.emitirOrden(id));
    }

    @PostMapping("/recepciones")
    public ResponseEntity<RecepcionMercaderiaResponseDTO> registrarRecepcion(@Valid @RequestBody RecepcionMercaderiaCreateDTO dto) {
        return ResponseEntity.ok(service.registrarRecepcion(dto));
    }

    @GetMapping("/recepciones")
    public ResponseEntity<List<RecepcionMercaderiaResponseDTO>> listarRecepciones() {
        return ResponseEntity.ok(service.listarRecepciones());
    }

    @GetMapping("/recepciones/{id}")
    public ResponseEntity<RecepcionMercaderiaResponseDTO> obtenerRecepcion(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerRecepcionPorId(id));
    }
}
