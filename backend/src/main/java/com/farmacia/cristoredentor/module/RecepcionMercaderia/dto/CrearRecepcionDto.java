package com.farmacia.cristoredentor.module.RecepcionMercaderia.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CrearRecepcionDto {

    @NotNull(message = "El id de la orden de compra es obligatorio")
    private Integer ordenCompraId;

    private String observaciones;

    @NotEmpty(message = "Debe incluir al menos un ítem en la recepción")
    @Valid
    private List<RecepcionDetalleRequestDto> items;
}