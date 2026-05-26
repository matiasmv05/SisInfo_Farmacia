package com.farmacia.cristoredentor.Entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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
    @Builder.Default
    private OffsetDateTime fechaCalculo = OffsetDateTime.now();

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