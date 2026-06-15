package com.farmacia.cristoredentor.module.MovimientoInventario;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.MovimientoInventario;
import com.farmacia.cristoredentor.Enum.TipoMovimiento;

import java.time.OffsetDateTime;

@Repository
public interface MovimientoInventarioRepository
        extends JpaRepository<MovimientoInventario, Integer> {

    // Por producto paginado
    Page<MovimientoInventario> findByProductoIdOrderByFechaHoraDesc(
        Integer productoId, Pageable pageable);

    // Por lote
    Page<MovimientoInventario> findByLoteIdOrderByFechaHoraDesc(
        Integer loteId, Pageable pageable);

    // Por tipo y rango de fechas
    @Query("""
        SELECT m FROM MovimientoInventario m
        WHERE m.tipoMovimiento = :tipo
        AND m.fechaHora BETWEEN :desde AND :hasta
        ORDER BY m.fechaHora DESC
        """)
    Page<MovimientoInventario> findByTipoYFecha(
        @Param("tipo")  TipoMovimiento tipo,
        @Param("desde") OffsetDateTime desde,
        @Param("hasta") OffsetDateTime hasta,
        Pageable pageable);

    // Para devolución: buscar movimiento de salida original
    @Query("""
        SELECT m FROM MovimientoInventario m
        WHERE m.id = :id
        AND m.tipoMovimiento = com.farmacia.cristoredentor.Enum.TipoMovimiento.salida
        """)
    java.util.Optional<MovimientoInventario> findSalidaById(@Param("id") Integer id);

    @Query("""
        SELECT m FROM MovimientoInventario m
        JOIN FETCH m.producto p
        JOIN FETCH m.lote l
        WHERE m.tipoMovimiento = :tipo
          AND m.fechaHora BETWEEN :desde AND :hasta
        ORDER BY m.fechaHora DESC
        """)
    java.util.List<MovimientoInventario> findByTipoYFechaRange(
        @Param("tipo") TipoMovimiento tipo,
        @Param("desde") OffsetDateTime desde,
        @Param("hasta") OffsetDateTime hasta);
}