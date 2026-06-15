package com.farmacia.cristoredentor.module.OrdenCompra;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.module.OrdenCompra.dto.actualizarItemCostoDto;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.crearOrdenCompraDto;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.ordenCompraItemRequestDto;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.ordenCompraResponseDto;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ordenes-compra")
public class ordenCompraController {

    private final ordenCompraService service;

    public ordenCompraController(ordenCompraService service) {
        this.service = service;
    }

    // POST /api/ordenes-compra?usuarioId=1
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @PostMapping
    public ResponseEntity<ordenCompraResponseDto> crear(
            @Valid @RequestBody crearOrdenCompraDto dto,
            Authentication authentication) {

        Integer usuarioId = (Integer) authentication.getPrincipal();

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(service.crearOrden(dto, usuarioId));
    }

    // GET /api/ordenes-compra/{id}
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping("/{id}")
    public ResponseEntity<ordenCompraResponseDto> obtenerPorId(
            @PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    // GET /api/ordenes-compra?estado=borrador&page=0&limit=20
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping
    public ResponseEntity<PaginatedResponseDto<ordenCompraResponseDto>> listar(
            @RequestParam(required = false)    String  estado,
            @RequestParam(defaultValue = "0")  Integer page,
            @RequestParam(defaultValue = "20") Integer limit) {
        return ResponseEntity.ok(service.listar(estado, page, limit));
    }

    // GET /api/ordenes-compra/proveedor/{proveedorId}?page=0&limit=20
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping("/proveedor/{proveedorId}")
    public ResponseEntity<PaginatedResponseDto<ordenCompraResponseDto>> listarPorProveedor(
            @PathVariable Integer proveedorId,
            @RequestParam(defaultValue = "0")  Integer page,
            @RequestParam(defaultValue = "20") Integer limit) {
        return ResponseEntity.ok(service.listarPorProveedor(proveedorId, page, limit));
    }

    // GET /api/ordenes-compra/producto/{productoId}/en-transito
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping("/producto/{productoId}/en-transito")
    public ResponseEntity<java.util.Map<String, Long>> obtenerStockEnTransito(
            @PathVariable Integer productoId) {
        return ResponseEntity.ok(service.obtenerStockEnTransito(productoId));
    }

    // POST /api/ordenes-compra/{id}/items
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @PostMapping("/{id}/items")
    public ResponseEntity<ordenCompraResponseDto> agregarItem(
            @PathVariable Integer id,
            @Valid @RequestBody ordenCompraItemRequestDto dto) {
        return ResponseEntity.ok(service.agregarItem(id, dto));
    }

    // DELETE /api/ordenes-compra/{id}/items/{detalleId}
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}/items/{detalleId}")
    public ResponseEntity<ordenCompraResponseDto> eliminarItem(
            @PathVariable Integer id,
            @PathVariable Integer detalleId) {
        return ResponseEntity.ok(service.eliminarItem(id, detalleId));
    }

    // PATCH /api/ordenes-compra/{id}/items/{detalleId}/costo
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PatchMapping("/{id}/items/{detalleId}/costo")
    public ResponseEntity<ordenCompraResponseDto> actualizarCosto(
            @PathVariable Integer id,
            @PathVariable Integer detalleId,
            @Valid @RequestBody actualizarItemCostoDto dto) {
        return ResponseEntity.ok(service.actualizarCostoItem(id, detalleId, dto));
    }

    // PATCH /api/ordenes-compra/{id}/emitir
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @PatchMapping("/{id}/emitir")
    public ResponseEntity<ordenCompraResponseDto> emitir(@PathVariable Integer id) {
        return ResponseEntity.ok(service.emitir(id));
    }

    // PATCH /api/ordenes-compra/{id}/cancelar
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @PatchMapping("/{id}/cancelar")
    public ResponseEntity<ordenCompraResponseDto> cancelar(@PathVariable Integer id) {
        return ResponseEntity.ok(service.cancelar(id));
    }
}