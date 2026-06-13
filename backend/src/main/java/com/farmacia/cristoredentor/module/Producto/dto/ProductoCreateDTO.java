package com.farmacia.cristoredentor.module.Producto.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
public class ProductoCreateDTO {
    @NotBlank(message = "El nombre del producto es obligatorio")
    private String nombre;

    @NotNull(message = "La categoría es obligatoria")
    private Long categoriaId;

    @NotBlank(message = "El laboratorio es obligatorio")
    private String laboratorio;

    @NotBlank(message = "La concentración es obligatoria")
    private String concentracion;

    @NotBlank(message = "La presentación es obligatoria")
    private String presentacion;

    @NotNull(message = "El precio de costo es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio de costo debe ser mayor que cero")
    private BigDecimal precioCosto;

    @NotNull(message = "El precio de venta es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio de venta debe ser mayor que cero")
    private BigDecimal precioVenta;

    @NotNull(message = "El stock mínimo es obligatorio")
    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    private Integer stockMinimo;

    @NotNull(message = "El stock máximo es obligatorio")
    @Min(value = 1, message = "El stock máximo debe ser al menos 1")
    private Integer stockMaximo;

    
    private String clasificacionABC;
}