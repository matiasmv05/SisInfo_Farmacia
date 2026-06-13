package com.farmacia.cristoredentor.module.Inventario;

import com.farmacia.cristoredentor.Entity.MovimientoInventario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    List<MovimientoInventario> findByProductoIdOrderByFechaHoraDesc(Long productoId);

    Page<MovimientoInventario> findByProductoId(Long productoId, Pageable pageable);

    List<MovimientoInventario> findByProductoIdAndFechaHoraBetween(Long productoId, Instant desde, Instant hasta);

    List<MovimientoInventario> findByLoteIdOrderByFechaHoraDesc(Long loteId);

    List<MovimientoInventario> findByTipoMovimientoAndFechaHoraBetween(String tipoMovimiento, Instant desde, Instant hasta);

    @Query("SELECT m FROM MovimientoInventario m WHERE m.producto.id = :productoId AND m.tipoMovimiento = 'salida' ORDER BY m.fechaHora DESC")
    List<MovimientoInventario> findUltimasSalidasByProductoId(@Param("productoId") Long productoId, Pageable pageable);
}