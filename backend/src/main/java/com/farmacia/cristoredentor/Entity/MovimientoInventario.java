package com.farmacia.cristoredentor.Entity;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "movimiento_inventario", schema = "farmacia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "lote_id", nullable = false)
    private Lote lote;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "tipo_movimiento", nullable = false)
    private String tipoMovimiento;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "costo_unitario")
    private BigDecimal costoUnitario;

    @Column(name = "motivo")
    private String motivo;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;

    @ManyToOne
    @JoinColumn(name = "orden_compra_id")
    private OrdenCompra ordenCompra;

    @Column(name = "referencia_id")
    private Long referenciaId;

    @Column(name = "fecha_hora", nullable = false, insertable = false, updatable = false)
    private Instant fechaHora;
}