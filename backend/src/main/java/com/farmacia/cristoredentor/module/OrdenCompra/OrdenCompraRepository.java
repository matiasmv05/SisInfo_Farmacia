package com.farmacia.cristoredentor.module.OrdenCompra;

import com.farmacia.cristoredentor.Entity.OrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Long> {
}
