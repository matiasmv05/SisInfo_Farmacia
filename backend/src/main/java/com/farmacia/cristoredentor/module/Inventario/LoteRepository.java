package com.farmacia.cristoredentor.module.Inventario;

import com.farmacia.cristoredentor.Entity.Lote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    List<Lote> findByProductoIdAndEstado(Long productoId, String estado);

    List<Lote> findByProductoIdAndEstadoOrderByFechaVencimientoAsc(Long productoId, String estado);

    @Query("SELECT l FROM Lote l WHERE l.producto.id = :productoId AND l.estado = 'activo' AND l.cantidad > 0 ORDER BY l.fechaVencimiento ASC")
    List<Lote> findLotesActivosFEFO(@Param("productoId") Long productoId);

    @Query("SELECT l FROM Lote l WHERE l.estado = 'activo' AND l.fechaVencimiento <= :fechaLimite")
    List<Lote> findLotesPorVencer(@Param("fechaLimite") LocalDate fechaLimite);

    Optional<Lote> findByProductoIdAndNumeroLote(Long productoId, String numeroLote);

    @Query("SELECT SUM(l.cantidad) FROM Lote l WHERE l.producto.id = :productoId AND l.estado = 'activo'")
    Integer sumCantidadActivaByProductoId(@Param("productoId") Long productoId);
}