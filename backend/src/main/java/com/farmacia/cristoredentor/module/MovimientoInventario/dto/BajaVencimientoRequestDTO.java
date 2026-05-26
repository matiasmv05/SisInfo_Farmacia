package com.farmacia.cristoredentor.module.MovimientoInventario.dto;
 
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
 
@Getter
@Setter
public class BajaVencimientoRequestDTO {
 
    @NotNull(message = "El loteId es obligatorio")
    private Integer loteId;
 
    @NotBlank(message = "El motivo es obligatorio")
    @Size(max = 200, message = "El motivo no puede superar los 200 caracteres")
    private String motivo;
}