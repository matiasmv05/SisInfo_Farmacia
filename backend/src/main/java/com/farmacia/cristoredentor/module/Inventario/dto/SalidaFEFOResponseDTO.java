package com.farmacia.cristoredentor.module.Inventario.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalidaFEFOResponseDTO {

    private Boolean exitoso;
    private String mensaje;
    private List<LoteDescontadoDTO> lotesDescontados;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoteDescontadoDTO {
        private Long loteId;
        private String numeroLote;
        private Integer cantidadDescontada;
        private Integer cantidadRestante;
    }
}