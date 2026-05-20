package com.farmacia.cristoredentor.module.OrdenCompra.dto;
import com.farmacia.cristoredentor.module.OrdenCompraDetalle.dto.OrdenCompraDetalleResponseDTO;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class OrdenCompraResponseDTO {
    private Long id;
    private Long proveedorId;
    private String proveedorNombre;
    private Long usuarioId;
    private String usuarioNombre;
    private String estado;
    private Instant fechaEmision;
    private Instant fechaRecepcion;
    private BigDecimal montoTotal;
    private String notas;
    private List<OrdenCompraDetalleResponseDTO> detalles;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProveedorId() { return proveedorId; }
    public void setProveedorId(Long proveedorId) { this.proveedorId = proveedorId; }
    public String getProveedorNombre() { return proveedorNombre; }
    public void setProveedorNombre(String proveedorNombre) { this.proveedorNombre = proveedorNombre; }
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    public String getUsuarioNombre() { return usuarioNombre; }
    public void setUsuarioNombre(String usuarioNombre) { this.usuarioNombre = usuarioNombre; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Instant getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(Instant fechaEmision) { this.fechaEmision = fechaEmision; }
    public Instant getFechaRecepcion() { return fechaRecepcion; }
    public void setFechaRecepcion(Instant fechaRecepcion) { this.fechaRecepcion = fechaRecepcion; }
    public BigDecimal getMontoTotal() { return montoTotal; }
    public void setMontoTotal(BigDecimal montoTotal) { this.montoTotal = montoTotal; }
    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
    public List<OrdenCompraDetalleResponseDTO> getDetalles() { return detalles; }
    public void setDetalles(List<OrdenCompraDetalleResponseDTO> detalles) { this.detalles = detalles; }
}
