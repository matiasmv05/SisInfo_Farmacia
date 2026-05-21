package com.farmacia.cristoredentor.module.ProductoProveedor;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.ProductoProveedor;
import com.farmacia.cristoredentor.Entity.ProductoProveedorId;

@Repository
public interface ProductoProveedorRepository
        extends JpaRepository<ProductoProveedor, ProductoProveedorId> {

    // Todos los proveedores de un producto
    List<ProductoProveedor> findByIdProductoId(Integer productoId);

    // Proveedor principal de un producto
    Optional<ProductoProveedor> findByIdProductoIdAndEsPrincipalTrue(Integer productoId);

    // Verificar si ya existe la relación
    boolean existsByIdProductoIdAndIdProveedorId(Integer productoId, Integer proveedorId);

    // Todos los productos de un proveedor
    @Query("""
        SELECT pp FROM ProductoProveedor pp
        JOIN FETCH pp.producto p
        WHERE pp.id.proveedorId = :proveedorId
        AND p.activo = true
        """)
    List<ProductoProveedor> findProductosActivosByProveedorId(
        @Param("proveedorId") Integer proveedorId);
}