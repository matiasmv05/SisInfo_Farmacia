package com.farmacia.cristoredentor.module.RecepcionDetalle.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class RecepcionDetalleCreateDTO {
    @NotNull
    private Long ordenDetalleId;

    @NotNull
    @Min(1)
    private Integer cantidadRecibida;

    @NotBlank
    private String numeroLote;

    @NotNull
    private LocalDate fechaVencimiento;

    private String observacionItem;

    public Long getOrdenDetalleId() { return ordenDetalleId; }
    public void setOrdenDetalleId(Long ordenDetalleId) { this.ordenDetalleId = ordenDetalleId; }
    public Integer getCantidadRecibida() { return cantidadRecibida; }
    public void setCantidadRecibida(Integer cantidadRecibida) { this.cantidadRecibida = cantidadRecibida; }
    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public String getObservacionItem() { return observacionItem; }
    public void setObservacionItem(String observacionItem) { this.observacionItem = observacionItem; }
}
