package com.farmacia.cristoredentor.module.ClasificacionAbc.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ValorInventarioProductoDTO {
    private final Integer productoId;
    private final BigDecimal valorInventario;
}