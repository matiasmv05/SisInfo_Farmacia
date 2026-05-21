// ordenCompraItemRequestDto.java
package com.farmacia.cristoredentor.module.OrdenCompra.dto;

import jakarta.validation.constraints.*;
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
public class ordenCompraItemRequestDto {

    @NotNull(message = "El producto es obligatorio")
    private Integer productoId;

    @NotNull(message = "La cantidad solicitada es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a cero")
    private Integer cantidadSolicitada;

    // Nullable en borrador, obligatorio antes de emitir
    @DecimalMin(value = "0.01", message = "El costo debe ser mayor a cero")
    @Digits(integer = 8, fraction = 2, message = "Formato inválido para costo unitario")
    private BigDecimal costoUnitario;
}