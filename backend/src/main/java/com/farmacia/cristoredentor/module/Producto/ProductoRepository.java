package com.farmacia.cristoredentor.module.Producto;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Enum.CategoriaProducto;
import com.farmacia.cristoredentor.Enum.ClasificacionABC;

import jakarta.persistence.LockModeType;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    // Buscar activo por id
    Optional<Producto> findByIdAndActivoTrue(Integer id);

    // Buscar desactivo por id
    Optional<Producto> findByIdAndActivoFalse(Integer id);

    // Listar activos paginado
    Page<Producto> findByActivoTrue(Pageable pageable);

    List<Producto> findByActivoTrue();

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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Producto p WHERE p.id = :id")
    Optional<Producto> findByIdWithLock(@Param("id") Integer id);

     @Query("SELECT COALESCE(SUM(l.cantidad), 0) FROM Lote l WHERE l.producto.id = :id AND l.estado = 'activo'")
     int calcularStockReal(Integer productoId);

@Query("""
    SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END 
    FROM Producto p 
    WHERE p.activo = true 
      AND LOWER(p.nombre) = LOWER(:nombre) 
      AND LOWER(p.concentracion) = LOWER(:concentracion) 
      AND LOWER(p.presentacion) = LOWER(:presentacion)
    """)
boolean existeProductoDuplicado(
    @Param("nombre") String nombre, 
    @Param("concentracion") String concentracion, 
    @Param("presentacion") String presentacion
);

@Query("""
    SELECT p FROM Producto p
    WHERE p.activo = true
      AND (:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', CAST(:nombre AS string), '%')))
      AND (:categoria IS NULL OR p.categoria = :categoria)
      AND (:clasificacionAbc IS NULL OR p.clasificacionAbc = :clasificacionAbc)
    ORDER BY p.nombre ASC
    """)
Page<Producto> findByFiltros(
    @Param("nombre") String nombre,
    @Param("categoria") CategoriaProducto categoria, 
    @Param("clasificacionAbc") ClasificacionABC clasificacionAbc,
    Pageable pageable
);
}