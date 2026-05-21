package com.farmacia.cristoredentor.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "clasificacion_abc_historial", schema = "farmacia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClasificacionAbcHistorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fecha_calculo", nullable = false, updatable = false)
    private OffsetDateTime fechaCalculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "total_productos", nullable = false)
    private Integer totalProductos;

    @Column(name = "valor_total_inv", precision = 14, scale = 2)
    private BigDecimal valorTotalInv;

    @Column(name = "observaciones", length = 255)
    private String observaciones;

    @Column(name = "completado", nullable = false)
    private boolean completado;

    @OneToMany(mappedBy = "historial", fetch = FetchType.LAZY)
    private List<ClasificacionAbcDetalle> detalles;
}