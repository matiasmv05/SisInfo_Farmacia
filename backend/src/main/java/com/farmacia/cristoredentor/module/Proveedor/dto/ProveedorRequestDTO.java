// Request — crear proveedor
package com.farmacia.cristoredentor.module.Proveedor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class ProveedorRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
    private String nombre;

    @Size(max = 100)
    private String contactoNombre;

    @Size(max = 30)
    private String telefono;

    @Email(message = "Formato de correo inválido")
    @Size(max = 100)
    private String correo;

    @Size(max = 250)
    private String direccion;
}