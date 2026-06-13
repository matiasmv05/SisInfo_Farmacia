package com.farmacia.cristoredentor.module.RecepcionDetalle.dto;

import java.time.LocalDate;

public class RecepcionDetalleResponseDTO {
    private Long id;
    private Long ordenDetalleId;
    private Long productoId;
    private String productoNombre;
    private Integer cantidadRecibida;
    private String numeroLote;
    private LocalDate fechaVencimiento;
    private String observacionItem;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOrdenDetalleId() { return ordenDetalleId; }
    public void setOrdenDetalleId(Long ordenDetalleId) { this.ordenDetalleId = ordenDetalleId; }
    public Long getProductoId() { return productoId; }
    public void setProductoId(Long productoId) { this.productoId = productoId; }
    public String getProductoNombre() { return productoNombre; }
    public void setProductoNombre(String productoNombre) { this.productoNombre = productoNombre; }
    public Integer getCantidadRecibida() { return cantidadRecibida; }
    public void setCantidadRecibida(Integer cantidadRecibida) { this.cantidadRecibida = cantidadRecibida; }
    public String getNumeroLote() { return numeroLote; }
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }
    public LocalDate getFechaVencimiento() { return fechaVencimiento; }
    public void setFechaVencimiento(LocalDate fechaVencimiento) { this.fechaVencimiento = fechaVencimiento; }
    public String getObservacionItem() { return observacionItem; }
    public void setObservacionItem(String observacionItem) { this.observacionItem = observacionItem; }
}
