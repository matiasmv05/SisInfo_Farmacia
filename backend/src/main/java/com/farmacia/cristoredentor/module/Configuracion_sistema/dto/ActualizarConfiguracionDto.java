package com.farmacia.cristoredentor.module.Configuracion_sistema.dto;

import java.math.BigDecimal;

public class ActualizarConfiguracionDto {
    private BigDecimal valor;

    private String descripcion;

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
