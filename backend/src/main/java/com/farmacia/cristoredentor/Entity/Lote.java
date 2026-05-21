package com.farmacia.cristoredentor.Entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "lote", schema = "farmacia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "numero_lote", nullable = false)
    private String numeroLote;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(name = "costo_unitario", nullable = false)
    private BigDecimal costoUnitario;

    @Column(name = "estado", nullable = false)
    private String estado;

    @ManyToOne
    @JoinColumn(name = "orden_compra_id")
    private OrdenCompra ordenCompra;

    @Column(name = "fecha_registro", nullable = false, insertable = false, updatable = false)
    private Instant fechaRegistro;

    @Column(name = "fecha_baja")
    private Instant fechaBaja;

    @Column(name = "motivo_baja")
    private String motivoBaja;
}