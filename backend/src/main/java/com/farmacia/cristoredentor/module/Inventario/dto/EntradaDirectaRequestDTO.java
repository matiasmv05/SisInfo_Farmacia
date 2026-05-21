package com.farmacia.cristoredentor.module.Inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class EntradaDirectaRequestDTO {

    @NotNull(message = "El ID del producto es obligatorio")
    private Long productoId;

    private Long proveedorId;

    @NotBlank(message = "El número de lote es obligatorio")
    private String numeroLote;

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a cero")
    private Integer cantidad;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    private LocalDate fechaVencimiento;

    @NotNull(message = "El costo unitario es obligatorio")
    @Min(value = 1, message = "El costo unitario debe ser mayor a cero")
    private BigDecimal costoUnitario;

    private String motivo;
}