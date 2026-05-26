package com.farmacia.cristoredentor.module.Reporte;

import java.time.Instant;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.farmacia.cristoredentor.module.Reporte.dto.ReporteCreateDTO;
import com.farmacia.cristoredentor.module.Reporte.dto.ReporteResponseDTO;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {
    private final ReporteService service;

    public ReporteController(ReporteService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ReporteResponseDTO> crear(@RequestBody ReporteCreateDTO dto) {
        return ResponseEntity.ok(service.crear(dto));
    }

    @GetMapping
    public ResponseEntity<List<ReporteResponseDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReporteResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<ReporteResponseDTO>> obtenerPorUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(service.obtenerPorUsuario(usuarioId));
    }

    @GetMapping("/tipo/{tipoReporte}")
    public ResponseEntity<List<ReporteResponseDTO>> obtenerPorTipo(@PathVariable String tipoReporte) {
        return ResponseEntity.ok(service.obtenerPorTipo(tipoReporte));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<ReporteResponseDTO>> obtenerPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(service.obtenerPorEstado(estado));
    }

    @GetMapping("/fechas")
    public ResponseEntity<List<ReporteResponseDTO>> obtenerPorRangoFechas(
            @RequestParam Instant inicio,
            @RequestParam Instant fin) {
        return ResponseEntity.ok(service.obtenerPorRangoFechas(inicio, fin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
