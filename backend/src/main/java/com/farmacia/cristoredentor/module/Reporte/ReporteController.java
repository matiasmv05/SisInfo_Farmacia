package com.farmacia.cristoredentor.module.Reporte;

import java.time.LocalDate;
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

    @GetMapping("/fechas")
    public ResponseEntity<List<ReporteResponseDTO>> obtenerPorRangoFechas(
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fin) {
        return ResponseEntity.ok(service.obtenerPorRangoFechas(inicio, fin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exportar")
    public ResponseEntity<?> exportar(
            @RequestParam String tipo,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            org.springframework.security.core.Authentication authentication) {

        try {
            Integer usuarioId = (Integer) authentication.getPrincipal();
            byte[] pdfBytes = service.exportarReportePdf(tipo, fechaInicio, fechaFin, usuarioId);

            String filename = String.format("reporte_%s_%s.pdf", 
                    tipo.toLowerCase(), 
                    LocalDate.now().toString());

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/pdf")
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .header(org.springframework.http.HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .body(pdfBytes);

        } catch (com.farmacia.cristoredentor.exceptions.BusinessException e) {
            // Retornar mensaje informativo si no existen datos
            return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/json")
                    .body(java.util.Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "application/json")
                    .body(java.util.Map.of("message", "Error interno al generar el reporte: " + e.getMessage()));
        }
    }
}