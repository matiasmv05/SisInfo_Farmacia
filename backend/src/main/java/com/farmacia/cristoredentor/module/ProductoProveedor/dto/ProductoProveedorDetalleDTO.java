package com.farmacia.cristoredentor.module.ProductoProveedor.dto;

import java.time.OffsetDateTime;

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
public class ProductoProveedorDetalleDTO {

    private Integer productoId;
    private String productoNombre;
    private Integer proveedorId;
    private String proveedorNombre;
    private String proveedorContacto;
    private String proveedorTelefono;
    private boolean esPrincipal;
    private OffsetDateTime createdAt;
}