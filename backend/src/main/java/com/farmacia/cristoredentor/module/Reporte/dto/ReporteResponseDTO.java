package com.farmacia.cristoredentor.module.Reporte.dto;

import java.time.Instant;
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
    private Long id;
    private String nombreReporte;
    private String tipoReporte;
    private String descripcion;
    private String nombreUsuario;
    private Instant fechaExportacion;
    private String rutaArchivo;
    private String formato;
    private String estado;
    private String observaciones;
    private Instant createdAt;
    private Instant updatedAt;
}
