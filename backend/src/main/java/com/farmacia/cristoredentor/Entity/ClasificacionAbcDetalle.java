package com.farmacia.cristoredentor.Entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import com.farmacia.cristoredentor.Enum.ClasificacionABC;

@Entity
@Table(name = "clasificacion_abc_detalle", schema = "farmacia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClasificacionAbcDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "historial_id", nullable = false)
    private ClasificacionAbcHistorial historial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "valor_inventario", nullable = false, precision = 14, scale = 2)
    private BigDecimal valorInventario;

    @Column(name = "porcentaje_individual", nullable = false, precision = 6, scale = 3)
    private BigDecimal porcentajeIndividual;

    @Column(name = "porcentaje_acumulado", nullable = false, precision = 6, scale = 3)
    private BigDecimal porcentajeAcumulado;

    @Enumerated(EnumType.STRING)
    @Column(name = "clasificacion", nullable = false, length = 1)
    private ClasificacionABC clasificacion;
}