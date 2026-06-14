package com.farmacia.cristoredentor.module.ClasificacionAbc.dto;

import java.math.BigDecimal;

public interface ProductoABCStats {
    Integer getProductoId();
    Long getTotalVendidas();
    BigDecimal getGananciaTotal();
    Long getCirculacion();
}
