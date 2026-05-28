// AlertaDetalleDTO.java
package com.farmacia.cristoredentor.module.Alerta.dto;

import com.farmacia.cristoredentor.Enum.CriticidadAlerta;
import com.farmacia.cristoredentor.Enum.TipoAlerta;
import lombok.*;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertaDetalleDTO {
    private Integer id;
    private TipoAlerta tipo;
    private CriticidadAlerta criticidad;
    private String mensaje;
    private Integer productoId;
    private String productoNombre;
    private String productoCategoria;
    private Integer stockActual;
    private Integer stockMinimo;
    private Integer loteId;
    private String loteNumero;
    private boolean leida;
    private String usuarioGestionaNombre;
    private OffsetDateTime fechaGeneracion;
    private OffsetDateTime fechaLectura;
}