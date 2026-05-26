package com.farmacia.cristoredentor.module.Categoria.dto;

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
public class CategoriaResponseDTO {
    private Integer id;
    private String nombre;
    private String descripcion;     
    private Boolean activo;
}
