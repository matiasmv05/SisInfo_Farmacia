// ordenCompraResponseDto.java  — respuesta completa de la orden
package com.farmacia.cristoredentor.module.OrdenCompra.dto;

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
public class ordenCompraResponseDto {
    private Integer                  id;
    private Integer                  proveedorId;
    private String                   proveedorNombre;
    private Integer                  usuarioId;
    private String                   usuarioNombre;
    private String                   estado;
    private OffsetDateTime           fechaEmision;
    private OffsetDateTime           fechaRecepcion;
    private BigDecimal               montoTotal;
    private String                   notas;
    private OffsetDateTime           createdAt;
    private List<ordenCompraItemDto> items;
}