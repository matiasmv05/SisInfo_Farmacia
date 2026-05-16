package com.farmacia.cristoredentor.module.Configuracion_sistema;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.Configuracion_sistema;

@Repository
public interface configuracionSistemaRepository extends JpaRepository<Configuracion_sistema, String> {
    
    public Optional<Configuracion_sistema> findByClave(String clave);

}
