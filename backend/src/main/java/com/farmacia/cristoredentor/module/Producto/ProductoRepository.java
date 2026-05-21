package com.farmacia.cristoredentor.module.Producto;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Enum.ClasificacionABC;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    // Buscar activo por id
    Optional<Producto> findByIdAndActivoTrue(Integer id);

    // Listar activos paginado
    Page<Producto> findByActivoTrue(Pageable pageable);

    // Buscar por nombre (búsqueda parcial, insensible a mayúsculas)
    Page<Producto> findByNombreContainingIgnoreCaseAndActivoTrue(
        String nombre, Pageable pageable);

    // Filtrar por categoría
    Page<Producto> findByCategoriaidAndActivoTrue(Integer categoriaId, Pageable pageable);

    @Modifying
    @Query("UPDATE Producto p SET p.clasificacionAbc = :clasificacion WHERE p.id = :id")
    void actualizarClasificacionAbc(
    @Param("id") Integer id,
    @Param("clasificacion") ClasificacionABC clasificacion);

    // Productos con stock crítico (stock_total <= stock_minimo)
    @Query("""
        SELECT p FROM Producto p
        WHERE p.activo = true
        AND p.stockTotal <= p.stockMinimo
        ORDER BY p.stockTotal ASC
        """)
    Page<Producto> findProductosStockCritico(Pageable pageable);

    // productos en stock critico
    @Query("""
    SELECT p FROM Producto p
    WHERE p.activo = true
    AND p.stockTotal <= p.stockMinimo
    """)
    List<Producto> findProductosStockCriticoSinPaginar();
}