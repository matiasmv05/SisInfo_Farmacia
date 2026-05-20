package com.farmacia.cristoredentor.module.RecepcionMercaderia.dto;
import com.farmacia.cristoredentor.module.OrdenCompra.dto.OrdenCompraResponseDTO;
import com.farmacia.cristoredentor.module.RecepcionDetalle.dto.RecepcionDetalleResponseDTO;

import java.time.Instant;
import java.util.List;

public class RecepcionMercaderiaResponseDTO {
    private Long id;
    private Long ordenCompraId;
    private String usuarioNombre;
    private Instant fechaHora;
    private String observaciones;
    private List<RecepcionDetalleResponseDTO> detalles;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOrdenCompraId() { return ordenCompraId; }
    public void setOrdenCompraId(Long ordenCompraId) { this.ordenCompraId = ordenCompraId; }
    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }
    public Instant getFechaHora() { return fechaHora; }
    public void setFechaHora(Instant fechaHora) { this.fechaHora = fechaHora; }
    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }
    public List<RecepcionDetalleResponseDTO> getDetalles() { return detalles; }
    public void setDetalles(List<RecepcionDetalleResponseDTO> detalles) { this.detalles = detalles; }
}
