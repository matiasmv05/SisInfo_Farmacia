// LoginResponse.java
package com.farmacia.cristoredentor.module.Auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class LoginResponse {
    private String token;
    private String tipo;          
    private long   expiresIn;     
    private long   userId;
    private String nombre;
    private String email;
    private String rol;
}