package com.farmacia.cristoredentor.module.Lote.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoteDetalleDTO {

    private Integer id;
    private Integer productoId;
    private String  productoNombre;
    private String  numeroLote;
    private Integer cantidad;
    private LocalDate fechaVencimiento;
    private BigDecimal costoUnitario;
    private String  estado;
    private Integer ordenCompraId;
    private OffsetDateTime fechaRegistro;
    private Instant fechaBaja;
    private String  motivoBaja;
}