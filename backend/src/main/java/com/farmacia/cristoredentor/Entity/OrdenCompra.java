package com.farmacia.cristoredentor.Entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "orden_compra", schema = "farmacia")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdenCompra {

    public enum EstadoOrden {
        borrador,
        emitida,
        recibida,
        recibida_parcial,
        cancelada;

        public boolean puedeTransicionarA(EstadoOrden destino) {
            return switch (this) {
                case borrador         -> destino == emitida || destino == cancelada;
                case emitida          -> destino == recibida
                                      || destino == recibida_parcial
                                      || destino == cancelada;
                case recibida_parcial -> destino == recibida;
                default               -> false;
            };
        }
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoOrden estado = EstadoOrden.borrador;

    @Column(name = "fecha_emision")
    private OffsetDateTime fechaEmision;

    @Column(name = "fecha_recepcion")
    private OffsetDateTime fechaRecepcion;

    @Column(name = "monto_total", precision = 12, scale = 2)
    private BigDecimal montoTotal;

    @Column(length = 500)
    private String notas;

    @OneToMany(
        mappedBy      = "ordenCompra",
        cascade       = CascadeType.ALL,
        orphanRemoval = true,
        fetch         = FetchType.LAZY
    )
    @Builder.Default
    private List<OrdenCompraDetalle> detalles = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // =========================================================================
    // MÉTODOS DE DOMINIO
    // =========================================================================

    public void agregarDetalle(OrdenCompraDetalle detalle) {
        validarEstadoBorrador("agregar ítems");
        detalle.asignarOrden(this);
        this.detalles.add(detalle);
        recalcularMontoTotal();
    }

    public void eliminarDetalle(Integer detalleId) {
        validarEstadoBorrador("eliminar ítems");
        boolean removido = this.detalles
            .removeIf(d -> d.getId() != null && d.getId().equals(detalleId));
        if (!removido) {
            throw new IllegalArgumentException(
                "No se encontró el detalle id=" + detalleId +
                " en la orden id=" + this.id);
        }
        recalcularMontoTotal();
    }

    public void emitir() {
        validarTransicion(EstadoOrden.emitida);
        if (this.detalles.isEmpty()) {
            throw new IllegalStateException(
                "No se puede emitir la orden id=" + this.id + ": sin ítems.");
        }
        boolean haySinCosto = this.detalles.stream()
            .anyMatch(d -> d.getCostoUnitario() == null);
        if (haySinCosto) {
            throw new IllegalStateException(
                "No se puede emitir la orden id=" + this.id +
                ": hay ítems sin costo_unitario.");
        }
        this.estado       = EstadoOrden.emitida;
        this.fechaEmision = OffsetDateTime.now();
    }

    public void cancelar() {
        validarTransicion(EstadoOrden.cancelada);
        this.estado = EstadoOrden.cancelada;
    }

    public void actualizarEstadoRecepcion(EstadoOrden nuevoEstado) {
        validarTransicion(nuevoEstado);
        this.estado = nuevoEstado;
        if (this.fechaRecepcion == null) {
            this.fechaRecepcion = OffsetDateTime.now();
        }
    }

    // =========================================================================
    // Privados
    // =========================================================================

    private void validarTransicion(EstadoOrden destino) {
        if (!this.estado.puedeTransicionarA(destino)) {
            throw new IllegalStateException(
                String.format("Transición inválida en orden id=%d: '%s' → '%s'.",
                    this.id, this.estado, destino));
        }
    }

    private void validarEstadoBorrador(String accion) {
        if (this.estado != EstadoOrden.borrador) {
            throw new IllegalStateException(
                String.format(
                    "No se puede %s en la orden id=%d (estado: %s). " +
                    "Solo permitido en borrador.",
                    accion, this.id, this.estado));
        }
    }

    private void recalcularMontoTotal() {
        this.montoTotal = this.detalles.stream()
            .filter(d -> d.getCostoUnitario() != null)
            .map(d -> d.getCostoUnitario()
                .multiply(BigDecimal.valueOf(d.getCantidadSolicitada())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}