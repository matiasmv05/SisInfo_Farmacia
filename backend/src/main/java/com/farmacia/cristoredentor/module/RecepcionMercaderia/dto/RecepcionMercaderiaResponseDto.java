package com.farmacia.cristoredentor.module.RecepcionMercaderia.dto;

import java.time.OffsetDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecepcionMercaderiaResponseDto {

    private Integer id;
    private Integer ordenCompraId;
    private Integer usuarioId;
    private String usuarioNombre;
    private OffsetDateTime fechaHora;
    private String observaciones;
    private List<RecepcionDetalleResponseDto> items;
}