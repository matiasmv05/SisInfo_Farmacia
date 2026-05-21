// crearOrdenCompraDto.java
package com.farmacia.cristoredentor.module.OrdenCompra.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class crearOrdenCompraDto {

    @NotNull(message = "El proveedor es obligatorio")
    private Integer proveedorId;

    @Size(max = 500, message = "Las notas no pueden superar 500 caracteres")
    private String notas;

    @NotEmpty(message = "La orden debe tener al menos un ítem")
    @Valid
    private List<ordenCompraItemRequestDto> items;
}