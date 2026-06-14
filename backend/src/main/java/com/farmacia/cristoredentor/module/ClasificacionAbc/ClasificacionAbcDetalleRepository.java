package com.farmacia.cristoredentor.module.ClasificacionAbc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.ClasificacionAbcDetalle;
import com.farmacia.cristoredentor.Enum.EstadoLote;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ValorInventarioProductoDTO;

@Repository
public interface ClasificacionAbcDetalleRepository
        extends JpaRepository<ClasificacionAbcDetalle, Integer> {

  @Query("""
    SELECT new com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ValorInventarioProductoDTO(
        l.producto.id,
        SUM(l.cantidad * l.costoUnitario)
    )
    FROM Lote l
    WHERE l.estado = :estado
    GROUP BY l.producto.id
    ORDER BY SUM(l.cantidad * l.costoUnitario) DESC
    """)
List<ValorInventarioProductoDTO> calcularValorInventarioPorProducto(
    @Param("estado") EstadoLote estado);

@Query("""
    SELECT new com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ValorInventarioProductoDTO(
        m.producto.id,
        CAST(SUM(m.cantidad) AS big_decimal)
    )
    FROM MovimientoInventario m
    WHERE m.tipoMovimiento IN (
        com.farmacia.cristoredentor.Enum.TipoMovimiento.salida,
        com.farmacia.cristoredentor.Enum.TipoMovimiento.ajuste_salida
    )
    AND m.fechaHora >= :desde
    GROUP BY m.producto.id
    ORDER BY SUM(m.cantidad) DESC
    """)
List<ValorInventarioProductoDTO> calcularValorRotacionPorProducto(
    @Param("desde") OffsetDateTime desde
);

    List<ClasificacionAbcDetalle> findByHistorialIdOrderByPorcentajeAcumuladoAsc(
        Integer historialId);

    @Query("""
    SELECT d FROM ClasificacionAbcDetalle d
    WHERE d.producto.id = :productoId
    ORDER BY d.historial.fechaCalculo DESC
    LIMIT 1
    """)
    Optional<ClasificacionAbcDetalle> findUltimoAbcByProducto(
        @Param("productoId") Integer productoId);

    @Query(value = """
        SELECT 
            p.id as productoId,
            COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'salida' THEN m.cantidad ELSE 0 END), 0) as totalVendidas,
            COALESCE(SUM(CASE WHEN m.tipo_movimiento = 'salida' THEN m.cantidad * (p.precio_venta - m.costo_unitario) ELSE 0 END), 0) as gananciaTotal,
            COUNT(m.id) as circulacion
        FROM farmacia.producto p
        LEFT JOIN farmacia.movimiento_inventario m ON p.id = m.producto_id
        WHERE p.activo = true
        GROUP BY p.id
        """, nativeQuery = true)
    List<com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ProductoABCStats> obtenerStatsParaABC();
}