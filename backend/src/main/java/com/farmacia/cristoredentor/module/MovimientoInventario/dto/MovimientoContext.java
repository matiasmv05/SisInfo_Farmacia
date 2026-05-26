package com.farmacia.cristoredentor.module.MovimientoInventario.dto;

import java.math.BigDecimal;

import com.farmacia.cristoredentor.Entity.Lote;
import com.farmacia.cristoredentor.Enum.TipoMovimiento;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoContext {
    private Integer usuarioId;
    private Integer proveedorId;
    private Integer ordenCompraId;
    private Integer referenciaId;
    private Lote lote;
    private TipoMovimiento tipo;
    private int cantidad;
    private BigDecimal costoUnitario;
    private String motivo;
}