package com.farmacia.cristoredentor.module.Alerta;

import com.farmacia.cristoredentor.Entity.Alerta;
import com.farmacia.cristoredentor.Enum.TipoAlerta;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AlertaRepository extends JpaRepository<Alerta, Integer> {

    // Alertas activas no leídas para el dashboard
    Page<Alerta> findByLeidaFalseOrderByFechaGeneracionDesc(Pageable pageable);

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
}