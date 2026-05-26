// ordenCompraItemDto.java  — respuesta de cada ítem
package com.farmacia.cristoredentor.module.OrdenCompra.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ordenCompraItemDto {
    private Integer   id;
    private Integer    productoId;
    private String     productoNombre;
    private Integer    cantidadSolicitada;
    private BigDecimal costoUnitario;
    private boolean    completo;
}