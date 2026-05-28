package com.farmacia.cristoredentor.Entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.farmacia.cristoredentor.Enum.CategoriaProducto;
import com.farmacia.cristoredentor.Enum.ClasificacionABC;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "producto", schema = "farmacia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

   @Enumerated(EnumType.STRING) 
   @Column(name = "categoria")
   private CategoriaProducto categoria;

    @Column(name = "laboratorio", nullable = false, length = 100)
    private String laboratorio;

    @Column(name = "concentracion", length = 50)
    private String concentracion;

    @Column(name = "presentacion", length = 80)
    private String presentacion;

    @Column(name = "precio_costo", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioCosto;

    @Column(name = "precio_venta", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo;

    @Column(name = "stock_maximo")
    private Integer stockMaximo;

    @Enumerated(EnumType.STRING)
    @Column(name = "clasificacion_abc", length = 1)
    private ClasificacionABC clasificacionAbc;

    @Column(name = "stock_total", nullable = false)
    private int stockTotal;

    @Column(name = "dias_minimos_venta")
    private Integer diasMinimosVenta;

    @Column(name = "activo", nullable = false)
    private boolean activo;

      @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
     @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "producto", fetch = FetchType.LAZY)
    private java.util.List<ProductoProveedor> proveedores;
}
