package com.farmacia.cristoredentor.module.RecepcionMercaderia.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

import com.farmacia.cristoredentor.module.RecepcionDetalle.dto.RecepcionDetalleCreateDTO;

public class RecepcionMercaderiaCreateDTO {
    @NotNull
    private Long ordenCompraId;

    @NotNull
    private Long usuarioId;

    private String observaciones;

    @NotEmpty
    private List<RecepcionDetalleCreateDTO> detalles;

    public Long getOrdenCompraId() { return ordenCompraId; }
    public void setOrdenCompraId(Long ordenCompraId) { this.ordenCompraId = ordenCompraId; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    public List<RecepcionDetalleCreateDTO> getDetalles() { return detalles; }
    public void setDetalles(List<RecepcionDetalleCreateDTO> detalles) { this.detalles = detalles; }
}
