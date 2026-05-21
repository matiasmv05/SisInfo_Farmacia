package com.farmacia.cristoredentor.module.ClasificacionAbc;

import com.farmacia.cristoredentor.Entity.ClasificacionAbcHistorial;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClasificacionAbcHistorialRepository
        extends JpaRepository<ClasificacionAbcHistorial, Integer> {

    Optional<ClasificacionAbcHistorial> findTopByCompletadoTrueOrderByFechaCalculoDesc();

    // Nombre consistente con lo que llama el Service
    Page<ClasificacionAbcHistorial> findByCompletadoTrue(Pageable pageable);
}