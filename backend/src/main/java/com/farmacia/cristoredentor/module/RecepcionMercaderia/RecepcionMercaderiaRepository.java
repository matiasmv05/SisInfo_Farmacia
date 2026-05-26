package com.farmacia.cristoredentor.module.RecepcionMercaderia;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.RecepcionMercaderia;

@Repository
public interface RecepcionMercaderiaRepository extends JpaRepository<RecepcionMercaderia, Integer> {

    Page<RecepcionMercaderia> findByOrdenCompraId(Integer ordenCompraId, Pageable pageable);

    // Trae recepción + detalles + ordenDetalle + producto en un solo query
    @Query("""
        SELECT r FROM RecepcionMercaderia r
        LEFT JOIN FETCH r.detalles d
        LEFT JOIN FETCH d.ordenDetalle od
        LEFT JOIN FETCH od.producto
        WHERE r.id = :id
        """)
    Optional<RecepcionMercaderia> findByIdConDetalles(@Param("id") Integer id);
}