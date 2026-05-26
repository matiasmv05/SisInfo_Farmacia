package com.farmacia.cristoredentor.module.Reporte;

import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import com.farmacia.cristoredentor.Entity.ReporteExportado;
import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.module.Reporte.dto.ReporteCreateDTO;
import com.farmacia.cristoredentor.module.Reporte.dto.ReporteResponseDTO;
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReporteService {
    private final ReporteRepository repository;
    private final usuarioRepository usuarioRepository;

    public ReporteResponseDTO crear(ReporteCreateDTO dto) {
        Usuario usuario = usuarioRepository.findById(dto.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        ReporteExportado reporte = ReporteExportado.builder()
                .nombreReporte(dto.getNombreReporte())
                .tipoReporte(dto.getTipoReporte())
                .descripcion(dto.getDescripcion())
                .usuario(usuario)
                .fechaExportacion(Instant.now())
                .rutaArchivo(dto.getRutaArchivo())
                .formato(dto.getFormato())
                .estado("completado")
                .observaciones(dto.getObservaciones())
                .build();

        repository.save(reporte);
        return mapearAResponse(reporte);
    }

    public ReporteResponseDTO obtenerPorId(Long id) {
        ReporteExportado reporte = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
        return mapearAResponse(reporte);
    }

    public List<ReporteResponseDTO> listar() {
        return repository.findAll().stream()
                .map(this::mapearAResponse)
                .toList();
    }

    public List<ReporteResponseDTO> obtenerPorUsuario(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    public List<ReporteResponseDTO> obtenerPorTipo(String tipoReporte) {
        return repository.findByTipoReporte(tipoReporte).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    public List<ReporteResponseDTO> obtenerPorEstado(String estado) {
        return repository.findByEstado(estado).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    public List<ReporteResponseDTO> obtenerPorRangoFechas(Instant inicio, Instant fin) {
        return repository.findByFechaExportacionBetween(inicio, fin).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    public void eliminar(Long id) {
        ReporteExportado reporte = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reporte no encontrado"));
        repository.delete(reporte);
    }

    private ReporteResponseDTO mapearAResponse(ReporteExportado reporte) {
        return ReporteResponseDTO.builder()
                .id(reporte.getId())
                .nombreReporte(reporte.getNombreReporte())
                .tipoReporte(reporte.getTipoReporte())
                .descripcion(reporte.getDescripcion())
                .nombreUsuario(reporte.getUsuario().getNombreCompleto())
                .fechaExportacion(reporte.getFechaExportacion())
                .rutaArchivo(reporte.getRutaArchivo())
                .formato(reporte.getFormato())
                .estado(reporte.getEstado())
                .observaciones(reporte.getObservaciones())
                .createdAt(reporte.getCreatedAt())
                .updatedAt(reporte.getUpdatedAt())
                .build();
    }
}
