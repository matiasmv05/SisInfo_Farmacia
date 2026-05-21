package com.farmacia.cristoredentor.Entity;

import com.farmacia.cristoredentor.Enum.CriticidadAlerta;
import com.farmacia.cristoredentor.Enum.TipoAlerta;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "alerta", schema = "farmacia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alerta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private TipoAlerta tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CriticidadAlerta criticidad;

    @Column(nullable = false, length = 500)
    private String mensaje;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id")
    private Lote lote;

    @Column(nullable = false)
    @Builder.Default
    private boolean leida = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_gestiona_id")
    private Usuario usuarioGestiona;

    @Column(name = "fecha_generacion", nullable = false, updatable = false)
    private OffsetDateTime fechaGeneracion;

    @Column(name = "fecha_lectura")
    private OffsetDateTime fechaLectura;
}