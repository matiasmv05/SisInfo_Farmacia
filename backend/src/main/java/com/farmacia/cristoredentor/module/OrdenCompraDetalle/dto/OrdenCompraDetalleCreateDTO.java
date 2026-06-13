package com.farmacia.cristoredentor.module.OrdenCompraDetalle.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class OrdenCompraDetalleCreateDTO {
    @NotNull
    private Long productoId;

    @NotNull
    @Min(1)
    private Integer cantidadSolicitada;

    @NotNull
    @Min(1)
    private BigDecimal costoUnitario;

    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }
    public Integer getCantidadSolicitada() { return cantidadSolicitada; }
    public void setCantidadSolicitada(Integer cantidadSolicitada) { this.cantidadSolicitada = cantidadSolicitada; }
    public BigDecimal getCostoUnitario() { return costoUnitario; }
    public void setCostoUnitario(BigDecimal costoUnitario) { this.costoUnitario = costoUnitario; }
}
