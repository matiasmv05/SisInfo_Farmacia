package com.farmacia.cristoredentor.module.ProductoProveedor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoProveedorRequestDTO {

    @NotNull(message = "El proveedor es obligatorio")
    private Integer proveedorId;

    private boolean esPrincipal;
}
