package com.farmacia.cristoredentor.module.Proveedor.dto;

import java.time.OffsetDateTime;

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
public class ProveedorResponseDTO {

    private Integer id;
    private String nombre;
    private String contactoNombre;
    private String telefono;
    private String correo;
    private String direccion;
    private boolean activo;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}