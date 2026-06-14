package com.farmacia.cristoredentor.module.Reporte;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.farmacia.cristoredentor.Entity.ExportacionReporte;

@Repository
public interface ExportacionReporteRepository extends JpaRepository<ExportacionReporte, Integer> {
}
