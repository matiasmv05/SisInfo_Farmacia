package com.farmacia.cristoredentor.module.Reporte.dto;

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
    private String nombreReporte;
    private String tipoReporte;
    private String descripcion;
    private Long usuarioId;
    private String rutaArchivo;
    private String formato;
    private String observaciones;
}
