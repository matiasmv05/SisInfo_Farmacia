// ClasificacionAbcDetalleDTO.java
package com.farmacia.cristoredentor.module.ClasificacionAbc.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClasificacionAbcDetalleDTO {
    private Integer productoId;
    private String productoNombre;
    private String laboratorio;
    private BigDecimal unidadesDespachadas;
    private BigDecimal porcentajeIndividual;
    private BigDecimal porcentajeAcumulado;
    private String clasificacion;
}