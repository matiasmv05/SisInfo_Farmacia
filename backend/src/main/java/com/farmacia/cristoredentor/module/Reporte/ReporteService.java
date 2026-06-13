package com.farmacia.cristoredentor.module.Reporte;

import java.time.LocalDate;
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
                .tipoReporte(dto.getTipoReporte())
                .fechaInicioPeriodo(dto.getFechaInicioPeriodo())
                .fechaFinPeriodo(dto.getFechaFinPeriodo())
                .parametrosJson(dto.getParametrosJson())
                .usuario(usuario)
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

    public List<ReporteResponseDTO> obtenerPorRangoFechas(LocalDate inicio, LocalDate fin) {
        return repository.findByFechaInicioPeriodoBetween(inicio, fin).stream()
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
                .tipoReporte(reporte.getTipoReporte())
                .fechaInicioPeriodo(reporte.getFechaInicioPeriodo())
                .fechaFinPeriodo(reporte.getFechaFinPeriodo())
                .parametrosJson(reporte.getParametrosJson())
                .nombreUsuario(reporte.getUsuario().getNombreCompleto())
                .fechaExportacion(reporte.getFechaExportacion())
                .build();
    }
}