// LoginRequest.java
package com.farmacia.cristoredentor.module.Auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;      // texto plano — el service hashea
}