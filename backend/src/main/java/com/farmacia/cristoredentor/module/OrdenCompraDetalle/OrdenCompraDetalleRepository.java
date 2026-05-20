package com.farmacia.cristoredentor.module.OrdenCompraDetalle;

import com.farmacia.cristoredentor.Entity.OrdenCompraDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdenCompraDetalleRepository extends JpaRepository<OrdenCompraDetalle, Long> {
}
