package com.farmacia.cristoredentor.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "recepcion_detalle", schema = "farmacia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecepcionDetalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "recepcion_id", nullable = false)
    private RecepcionMercaderia recepcion;

    @ManyToOne
    @JoinColumn(name = "orden_detalle_id", nullable = false)
    private OrdenCompraDetalle ordenDetalle;

    @Column(name = "cantidad_recibida", nullable = false)
    private Integer cantidadRecibida;

    @Column(name = "numero_lote", nullable = false)
    private String numeroLote;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "observacion_item")
    private String observacionItem;
}
