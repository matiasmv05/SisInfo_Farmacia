package com.farmacia.cristoredentor.module.RecepcionMercaderia.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecepcionDetalleRequestDto {

    @NotNull(message = "El id del detalle de orden es obligatorio")
    private Integer ordenDetalleId;

    @NotNull(message = "La cantidad recibida es obligatoria")
    @Min(value = 1, message = "La cantidad recibida debe ser mayor a 0")
    private Integer cantidadRecibida;

    @NotBlank(message = "El número de lote es obligatorio")
    private String numeroLote;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    @Future(message = "La fecha de vencimiento debe ser futura")
    private LocalDate fechaVencimiento;

    private String observacionItem;
}