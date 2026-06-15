package com.farmacia.cristoredentor.module.ClasificacionAbc.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoABCResponseDTO {
    private Integer id;
    private String nombre;
    private Long unidadesVendidas;
    private BigDecimal gananciaGenerada;
    private Long circulacion;
    private Double score;
    private String clasificacion;
}
