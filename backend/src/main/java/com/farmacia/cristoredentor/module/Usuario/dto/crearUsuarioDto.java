package com.farmacia.cristoredentor.module.Usuario.dto;


import com.farmacia.cristoredentor.Enum.UserRole;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter         
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class crearUsuarioDto {
    
    private String nombreCompleto;

    private String passwordHash;

    private UserRole rol;
    
    private String telefono;

    @Email
    private String email;

    
    
}
