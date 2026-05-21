package com.farmacia.cristoredentor.Entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name   = "orden_compra_detalle",
    schema = "farmacia",
    uniqueConstraints = @UniqueConstraint(
        name        = "uq_ocd_orden_producto",
        columnNames = {"orden_compra_id", "producto_id"}
    )
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdenCompraDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer  id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orden_compra_id", nullable = false)
    private OrdenCompra ordenCompra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "cantidad_solicitada", nullable = false)
    private Integer cantidadSolicitada;

    @Column(name = "costo_unitario", precision = 10, scale = 2)
    private BigDecimal costoUnitario;

    @Column(name = "cantidad_recibida", nullable = false)
    @Builder.Default
    private Integer cantidadRecibida = 0;

    // =========================================================================
    // MÉTODOS DE DOMINIO
    // =========================================================================

    // Package-private: solo OrdenCompra.agregarDetalle() lo llama
    void asignarOrden(OrdenCompra orden) {
        this.ordenCompra = orden;
    }

    public void setCostoUnitario(BigDecimal costo) {
        if (costo != null && costo.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                "El costo unitario debe ser mayor a cero.");
        }
        this.costoUnitario = costo;
    }

    public void registrarRecepcion(Integer cantidad) {
        if (cantidad <= 0) {
            throw new IllegalArgumentException(
                "La cantidad recibida debe ser mayor a cero.");
        }
        this.cantidadRecibida += cantidad;
    }

    public boolean estaCompleto() {
        return this.cantidadRecibida >= this.cantidadSolicitada;
    }
}