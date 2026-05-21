// MovimientoRequestDTO.java
package com.farmacia.cristoredentor.module.MovimientoInventario.dto;

import java.math.BigDecimal;

import com.farmacia.cristoredentor.Enum.TipoMovimiento;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class MovimientoRequestDTO {

    @NotNull(message = "El lote es obligatorio")
    private Integer loteId;

    @NotNull(message = "El producto es obligatorio")
    private Integer productoId;

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private TipoMovimiento tipoMovimiento;

    @NotNull
    @Min(value = 1, message = "La cantidad debe ser mayor a 0")
    private Integer cantidad;

    private BigDecimal costoUnitario;
    private String motivo;

    @NotNull(message = "El usuario es obligatorio")
    private Integer usuarioId;

    private Integer proveedorId;
    private Integer ordenCompraId;
    private Integer referenciaId;
}