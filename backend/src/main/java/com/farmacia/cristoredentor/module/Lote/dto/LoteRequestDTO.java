package com.farmacia.cristoredentor.module.Lote.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoteRequestDTO {

    @NotNull(message = "El producto es obligatorio")
    private Integer productoId;

    @NotBlank(message = "El número de lote es obligatorio")
    @Size(max = 50, message = "El número de lote no puede superar 50 caracteres")
    private String numeroLote;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a cero")
    private int cantidad;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    @Future(message = "La fecha de vencimiento debe ser futura")
    private LocalDate fechaVencimiento;

    @NotNull(message = "El costo unitario es obligatorio")
    @DecimalMin(value = "0.01", message = "El costo unitario debe ser mayor a cero")
    @Digits(integer = 8, fraction = 2, message = "Formato inválido para costo unitario")
    private BigDecimal costoUnitario;

}