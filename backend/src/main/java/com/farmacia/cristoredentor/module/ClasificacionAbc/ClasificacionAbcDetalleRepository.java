package com.farmacia.cristoredentor.module.ClasificacionAbc;

import com.farmacia.cristoredentor.Entity.ClasificacionAbcDetalle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.farmacia.cristoredentor.Enum.EstadoLote;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ValorInventarioProductoDTO;

@Repository
public interface ClasificacionAbcDetalleRepository
        extends JpaRepository<ClasificacionAbcDetalle, Integer> {

    @Query("""
        SELECT l.producto.id        AS productoId,
               SUM(l.cantidad * l.costoUnitario) AS valorInventario
        FROM Lote l
        WHERE l.estado = :estado
        GROUP BY l.producto.id
        ORDER BY valorInventario DESC
        """)
    List<ValorInventarioProductoDTO> calcularValorInventarioPorProducto(
        @Param("estado") EstadoLote estado);

    List<ClasificacionAbcDetalle> findByHistorialIdOrderByPorcentajeAcumuladoAsc(
        Integer historialId);
}