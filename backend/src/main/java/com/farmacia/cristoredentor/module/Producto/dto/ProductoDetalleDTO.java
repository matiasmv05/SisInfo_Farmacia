package com.farmacia.cristoredentor.module.Producto.dto;

import java.math.BigDecimal;

import com.farmacia.cristoredentor.Enum.CategoriaProducto;

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
    private CategoriaProducto categoria;
    private String laboratorio;
    private String concentracion;
    private String presentacion;
    private BigDecimal precioCosto;
    private BigDecimal precioVenta;
    private Integer stockTotal;
    private Integer stockMinimo;
    private Integer stockMaximo;
    private Integer diasMinimosVenta;
    private String clasificacionAbc;
    private boolean activo;
}