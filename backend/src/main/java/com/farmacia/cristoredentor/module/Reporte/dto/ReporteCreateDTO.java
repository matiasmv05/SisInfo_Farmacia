package com.farmacia.cristoredentor.module.Reporte.dto;

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
public class ReporteCreateDTO {
    private String tipoReporte;
    private LocalDate fechaInicioPeriodo;
    private LocalDate fechaFinPeriodo;
    private String parametrosJson;
    private Integer usuarioId;
}