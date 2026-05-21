package com.farmacia.cristoredentor.module.Inventario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AjusteInventarioRequestDTO {

    @NotNull(message = "El ID del lote es obligatorio")
    private Long loteId;

    @NotBlank(message = "El tipo de ajuste es obligatorio")
    private String tipoAjuste; // ajuste_entrada, ajuste_salida, devolucion_cliente, devolucion_proveedor

    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser mayor a cero")
    private Integer cantidad;

    @NotBlank(message = "El motivo es obligatorio")
    private String motivo;

    private Long referenciaId; // Para devolucion_cliente (ID del movimiento de salida original)
}