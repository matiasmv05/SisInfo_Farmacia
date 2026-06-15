package com.farmacia.cristoredentor.module.Alerta;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.Alerta;
import com.farmacia.cristoredentor.Enum.TipoAlerta;

@Repository
public interface AlertaRepository extends JpaRepository<Alerta, Integer> {

    // Alertas activas no leídas para el dashboard
    Page<Alerta> findByLeidaFalseOrderByFechaGeneracionDesc(Pageable pageable);

    // Todas las alertas activas sin paginar
    List<Alerta> findByLeidaFalse();

    // Alertas activas por criticidad
    Page<Alerta> findByLeidaFalseAndCriticidadOrderByFechaGeneracionDesc(
        com.farmacia.cristoredentor.Enum.CriticidadAlerta criticidad,
        Pageable pageable);

    // Evitar duplicados: alerta activa del mismo tipo para el mismo lote
    Optional<Alerta> findByTipoAndLoteIdAndLeidaFalse(
        TipoAlerta tipo, Integer loteId);

    // Evitar duplicados: alerta activa de stock_minimo para el mismo producto
    Optional<Alerta> findByTipoAndProductoIdAndLeidaFalse(
        TipoAlerta tipo, Integer productoId);

    // Contar alertas activas por tipo (para el dashboard)
    Integer countByTipoAndLeidaFalse(TipoAlerta tipo);

    // Obtener todas las alertas activas de un tipo específico
    List<Alerta> findByTipoAndLeidaFalseOrderByFechaGeneracionDesc(TipoAlerta tipo);

    // AlertaRepository.java — agregar:
@Modifying
@Query("UPDATE Alerta a SET a.leida = true, a.fechaLectura = :ahora WHERE a.lote.id = :loteId AND a.leida = false")
void cerrarAlertasPorLote(@Param("loteId") Integer loteId, @Param("ahora") OffsetDateTime ahora);
}