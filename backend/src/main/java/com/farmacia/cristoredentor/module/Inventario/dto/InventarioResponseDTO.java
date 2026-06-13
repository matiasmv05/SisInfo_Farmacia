package com.farmacia.cristoredentor.module.Inventario.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Builder
public class InventarioResponseDTO {

    private Long loteId;
    private String numeroLote;
    private Integer cantidad;
    private LocalDate fechaVencimiento;
    private BigDecimal costoUnitario;
    private String estado;

    private Long movimientoId;
    private String tipoMovimiento;
    private Integer cantidadMovimiento;
    private BigDecimal valorMovimiento;
    private Instant fechaHora;
    private String motivo;
    private String usuarioNombre;
    private String proveedorNombre;
}