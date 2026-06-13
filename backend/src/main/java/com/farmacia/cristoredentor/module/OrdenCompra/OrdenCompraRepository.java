package com.farmacia.cristoredentor.module.OrdenCompra;

<<<<<<< HEAD
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.OrdenCompra;
import com.farmacia.cristoredentor.Enum.EstadoOrden;

@Repository
public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Integer> {

    Page<OrdenCompra> findByEstado(EstadoOrden estado, Pageable pageable);

    Page<OrdenCompra> findByProveedorId(Integer proveedorId, Pageable pageable);

    // Para el módulo de recepción: solo órdenes receptables
    Page<OrdenCompra> findByEstadoIn(List<EstadoOrden> estados, Pageable pageable);

    // Trae la orden con sus detalles y productos en un solo query — evita N+1
    @Query("""
        SELECT o FROM OrdenCompra o
        LEFT JOIN FETCH o.detalles d
        LEFT JOIN FETCH d.producto
        WHERE o.id = :id
        """)
    Optional<OrdenCompra> findByIdConDetalles(@Param("id") Integer id);

    
}
=======
import com.farmacia.cristoredentor.Entity.OrdenCompra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdenCompraRepository extends JpaRepository<OrdenCompra, Long> {
}
>>>>>>> d3f8533c188aaa31d47a986ef4f0881f31e04087
