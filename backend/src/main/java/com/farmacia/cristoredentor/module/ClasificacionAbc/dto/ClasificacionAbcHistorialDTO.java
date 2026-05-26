// ClasificacionAbcHistorialDTO.java
package com.farmacia.cristoredentor.module.ClasificacionAbc.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

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
public class ClasificacionAbcHistorialDTO {
    private Integer id;
    private OffsetDateTime fechaCalculo;
    private String usuarioNombre;
    private Integer totalProductos;
    private BigDecimal totalUnidadesDespachadas;
    private String observaciones;
    private boolean completado;
    private List<ClasificacionAbcDetalleDTO> detalles;
}