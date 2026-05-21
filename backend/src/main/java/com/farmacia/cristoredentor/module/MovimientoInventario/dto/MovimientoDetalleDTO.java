// MovimientoDetalleDTO.java
package com.farmacia.cristoredentor.module.MovimientoInventario.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

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
public class MovimientoDetalleDTO {

    private Integer id;
    private Integer loteId;
    private String loteNumero;
    private Integer productoId;
    private String productoNombre;
    private TipoMovimiento tipoMovimiento;
    private Integer cantidad;
    private BigDecimal costoUnitario;
    private String motivo;
    private Integer usuarioId;
    private String usuarioNombre;
    private String proveedorNombre;
    private Integer ordenCompraId;
    private Integer referenciaId;
    private OffsetDateTime fechaHora;
}