package com.farmacia.cristoredentor.module.RecepcionMercaderia.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecepcionDetalleResponseDto {

    private Integer id;
    private Integer ordenDetalleId;
    private Integer productoId;
    private String productoNombre;
    private Integer cantidadSolicitada;
    private Integer cantidadRecibida;
    private int totalRecibido;
    private Boolean completo;
    private String numeroLote;
    private LocalDate fechaVencimiento;
    private BigDecimal costoUnitario;
    private String observacionItem;
}