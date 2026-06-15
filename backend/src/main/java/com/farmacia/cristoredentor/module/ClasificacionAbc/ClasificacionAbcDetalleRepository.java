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
      AND l.cantidad > 0
      AND l.costoUnitario > 0
    GROUP BY l.producto.id
    HAVING SUM(l.cantidad * l.costoUnitario) > 0
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
    AND m.cantidad > 0
    GROUP BY m.producto.id
    HAVING SUM(m.cantidad) > 0
    ORDER BY SUM(m.cantidad) DESC
    """)
List<ValorInventarioProductoDTO> calcularValorRotacionPorProducto(
    @Param("desde") OffsetDateTime desde);

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
}