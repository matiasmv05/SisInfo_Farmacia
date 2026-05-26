package com.farmacia.cristoredentor.module.RecepcionMercaderia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.RecepcionDetalle;

@Repository
public interface RecepcionDetalleRepository extends JpaRepository<RecepcionDetalle, Integer> {

    @Query("SELECT COALESCE(SUM(rd.cantidadRecibida), 0) " +
           "FROM RecepcionDetalle rd " +
           "WHERE rd.ordenDetalle.id = :ordenDetalleId")
    int sumCantidadRecibidaByOrdenDetalleId(@Param("ordenDetalleId") Integer ordenDetalleId);
}