package com.farmacia.cristoredentor.module.Reporte;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.ReporteExportado;

@Repository
public interface ReporteRepository extends JpaRepository<ReporteExportado, Long> {
    List<ReporteExportado> findByUsuarioId(Long usuarioId);
    List<ReporteExportado> findByTipoReporte(String tipoReporte);
    List<ReporteExportado> findByFechaInicioPeriodoBetween(LocalDate inicio, LocalDate fin);
}