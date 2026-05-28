package com.farmacia.cristoredentor.module.Proveedor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.Proveedor;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {

    List<Proveedor> findByActivoTrue();

    Proveedor findByIdAndActivoTrue(Integer id);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Integer id);

   @Query(value = """
    SELECT * FROM farmacia.proveedor p
    WHERE (:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
      AND (:activo IS NULL OR p.activo = :activo)
    ORDER BY p.nombre
    """, nativeQuery = true)
Page<Proveedor> buscarConFiltros(
    @Param("nombre") String nombre,
    @Param("activo") Boolean activo,
    Pageable pageable
);
}