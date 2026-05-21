// AlertaMarcarLeidaDTO.java
package com.farmacia.cristoredentor.module.Alerta.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AlertaMarcarLeidaDTO {

    @NotNull(message = "El usuario que gestiona es obligatorio")
    private Integer usuarioGestionaId;
}