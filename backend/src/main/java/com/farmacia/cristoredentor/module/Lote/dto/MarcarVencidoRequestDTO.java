package com.farmacia.cristoredentor.module.Lote.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MarcarVencidoRequestDTO {

    @NotBlank(message = "El motivo es obligatorio.")
    @Size(max = 500, message = "El motivo no puede superar los 500 caracteres.")
    private String motivo;

}