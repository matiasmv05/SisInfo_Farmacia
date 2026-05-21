package com.farmacia.cristoredentor.module.Usuario.dto;

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
public class loginUsuarioDto {

    @Email
    private String email;
  
    private String passwordHash;

  
    
}
