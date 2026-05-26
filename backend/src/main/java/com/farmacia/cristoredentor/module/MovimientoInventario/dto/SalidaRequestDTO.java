package com.farmacia.cristoredentor.module.MovimientoInventario.dto;
 
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
 
@Getter
@Setter
public class SalidaRequestDTO {
 
    @NotNull(message = "El productoId es obligatorio")
    private Integer productoId;
 
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;
}
 