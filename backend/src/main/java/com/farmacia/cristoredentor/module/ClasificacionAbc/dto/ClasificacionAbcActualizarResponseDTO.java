package com.farmacia.cristoredentor.module.ClasificacionAbc.dto;

import java.time.LocalDateTime;
import java.util.List;
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
public class ClasificacionAbcActualizarResponseDTO {
    private List<ProductoABCResponseDTO> productosA;
    private List<ProductoABCResponseDTO> productosB;
    private List<ProductoABCResponseDTO> productosC;
    private LocalDateTime fechaActualizacion;
    private String tiempoEjecucion;
}
