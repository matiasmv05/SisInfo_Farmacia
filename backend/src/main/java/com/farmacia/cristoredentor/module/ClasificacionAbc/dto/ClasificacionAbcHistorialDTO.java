// ClasificacionAbcHistorialDTO.java
package com.farmacia.cristoredentor.module.ClasificacionAbc.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

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
    private BigDecimal valorTotalInv;
    private String observaciones;
    private boolean completado;
    private List<ClasificacionAbcDetalleDTO> detalles;
}