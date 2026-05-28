package com.farmacia.cristoredentor.module.Producto.dto;

import java.math.BigDecimal;

import com.farmacia.cristoredentor.Enum.CategoriaProducto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

// DTO para recibir datos al crear o actualizar un producto
public class ProductoRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
    private String nombre;

    @NotNull(message = "La categoría es obligatoria")
    private CategoriaProducto categoria;

    @NotBlank(message = "El laboratorio es obligatorio")
    @Size(max = 100)
    private String laboratorio;

    @Size(max = 50)
    private String concentracion;

    @Size(max = 80)
    private String presentacion;

    @NotNull
    @DecimalMin(value = "0.01", message = "El precio de costo debe ser mayor a 0")
    @Digits(integer= 8, fraction = 2)
    private BigDecimal precioCosto;

    @NotNull
    @DecimalMin(value = "0.01", message = "El precio de venta debe ser mayor a 0")
    @Digits(integer= 8, fraction = 2)
    private BigDecimal precioVenta;

    @NotNull
    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    private Integer stockMinimo;

    @Min(value = 0, message = "El stock máximo no puede ser negativo")
    private Integer stockMaximo;

    @Min(value = 1, message = "Los días mínimos de venta deben ser mayor a 0")
    private Integer diasMinimosVenta;
}