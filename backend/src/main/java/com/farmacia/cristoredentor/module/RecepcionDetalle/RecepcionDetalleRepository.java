package com.farmacia.cristoredentor.module.RecepcionDetalle;

import com.farmacia.cristoredentor.Entity.RecepcionDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecepcionDetalleRepository extends JpaRepository<RecepcionDetalle, Long> {
}
