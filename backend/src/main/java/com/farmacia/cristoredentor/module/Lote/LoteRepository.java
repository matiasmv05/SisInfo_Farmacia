package com.farmacia.cristoredentor.module.Lote;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.Lote;
import com.farmacia.cristoredentor.Enum.EstadoLote;

import jakarta.persistence.LockModeType;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Integer> {

    // Para validar duplicados antes de insertar
    boolean existsByProductoIdAndNumeroLote(Integer productoId, String numeroLote);

    // FEFO: lotes activos de un producto ordenados por vencimiento más próximo
    // Este query es el núcleo del descuento de stock
    @Query("""
        SELECT l FROM Lote l
        WHERE l.producto.id = :productoId
          AND l.estado = :estado
          AND l.cantidad > 0
        ORDER BY l.fechaVencimiento ASC, l.id ASC
        """)
    List<Lote> findActivosByProductoOrdenadosFEFO(
        @Param("productoId") Integer productoId,
        @Param("estado") EstadoLote estado
    );

    // Lotes próximos a vencer (para generación de alertas)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT l FROM Lote l
        WHERE l.estado = 'ACTIVO'
          AND l.cantidad > 0
          AND l.fechaVencimiento <= :fechaLimite
        ORDER BY l.fechaVencimiento ASC
        """)
    List<Lote> findLotesProximosAVencer(@Param("fechaLimite") LocalDate fechaLimite);

    // Listar por producto paginado
    Page<Lote> findByProductoId(Integer productoId, Pageable pageable);

    // Listar por estado paginado
    Page<Lote> findByEstado(EstadoLote estado, Pageable pageable);

    // Buscar lote específico (para recepciones parciales: upsert manual)
    Optional<Lote> findByProductoIdAndNumeroLote(Integer productoId, String numeroLote);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT l FROM Lote l
    JOIN FETCH l.producto p
    WHERE l.estado = com.farmacia.cristoredentor.Enum.EstadoLote.activo
    AND l.cantidad > 0
    AND l.fechaVencimiento <= :fechaLimite
    """)
    List<Lote> findLotesActivosConVencimientoProximo(
    @Param("fechaLimite") LocalDate fechaLimite);

    @Query("SELECT COALESCE(SUM(l.cantidad), 0) FROM Lote l " +
       "WHERE l.producto.id = :productoId AND l.estado = 'activo'")
     int calcularStockReal(@Param("productoId") Integer productoId);

    @Query("""
        SELECT l FROM Lote l
        JOIN FETCH l.producto p
        WHERE l.estado = com.farmacia.cristoredentor.Enum.EstadoLote.activo
          AND l.cantidad > 0
        ORDER BY p.nombre ASC, l.fechaVencimiento ASC
        """)
    List<Lote> findLotesActivosConProducto();
     
}