package com.farmacia.cristoredentor.module.Producto.dto;

import java.math.BigDecimal;

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
public class ProductoDetalleDTO {

    private Integer id;
    private String nombre;
    private String categoria;
    private String laboratorio;
    private String presentacion;
    private BigDecimal precioVenta;
    private Integer stockTotal;
    private Integer stockMinimo;
    private String clasificacionAbc;
    private boolean activo;
}