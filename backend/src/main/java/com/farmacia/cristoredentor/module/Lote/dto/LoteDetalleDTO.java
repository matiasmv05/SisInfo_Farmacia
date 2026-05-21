package com.farmacia.cristoredentor.module.Lote.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

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
    private Instant fechaRegistro;
    private Instant fechaBaja;
    private String  motivoBaja;
}