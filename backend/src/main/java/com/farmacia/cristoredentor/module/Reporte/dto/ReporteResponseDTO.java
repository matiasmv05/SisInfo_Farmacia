package com.farmacia.cristoredentor.module.Reporte.dto;

import java.time.Instant;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResponseDTO {
    private Integer id;
    private String tipoReporte;
    private LocalDate fechaInicioPeriodo;
    private LocalDate fechaFinPeriodo;
    private String parametrosJson;
    private String nombreUsuario;
    private Instant fechaExportacion;
}