package com.farmacia.cristoredentor.module.Lote.dto;

import com.farmacia.cristoredentor.Entity.Lote;

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
public class ResultadoDesconteStock {
    Lote lote;
    int cantidadDescontada;
}