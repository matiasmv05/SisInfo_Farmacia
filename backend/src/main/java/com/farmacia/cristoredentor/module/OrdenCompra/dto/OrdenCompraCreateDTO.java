package com.farmacia.cristoredentor.module.OrdenCompra.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

import com.farmacia.cristoredentor.module.OrdenCompraDetalle.dto.OrdenCompraDetalleCreateDTO;

public class OrdenCompraCreateDTO {
    @NotNull
    private Long proveedorId;

    @NotNull
    private Long usuarioId;

    private String notas;

    @NotEmpty
    private List<OrdenCompraDetalleCreateDTO> detalles;

    public Long getProveedorId() { return proveedorId; }
    public void setProveedorId(Long proveedorId) { this.proveedorId = proveedorId; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
    public List<OrdenCompraDetalleCreateDTO> getDetalles() { return detalles; }
    public void setDetalles(List<OrdenCompraDetalleCreateDTO> detalles) { this.detalles = detalles; }
}
