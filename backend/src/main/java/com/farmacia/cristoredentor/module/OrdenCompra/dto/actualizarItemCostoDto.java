// actualizarItemCostoDto.java
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
public class actualizarItemCostoDto {

    @NotNull(message = "El costo unitario es obligatorio")
    @DecimalMin(value = "0.01", message = "El costo debe ser mayor a cero")
    @Digits(integer = 8, fraction = 2, message = "Formato inválido")
    private BigDecimal costoUnitario;
}