package com.farmacia.cristoredentor.module.Producto.dto;

import java.math.BigDecimal;
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
public class ProductoResponseDTO {

    private Integer id;
    private String nombre;
    private Integer categoriaId;
    private String categoria;
    private String laboratorio;
    private String concentracion;
    private String presentacion;
    private BigDecimal precioCosto;
    private BigDecimal precioVenta;
    private Integer stockMinimo;
    private Integer stockMaximo;
    private Integer stockTotal;
    private String clasificacionAbc;
    private Integer diasMinimosVenta;
    private boolean activo;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}