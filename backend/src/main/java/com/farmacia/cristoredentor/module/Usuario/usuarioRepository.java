package com.farmacia.cristoredentor.module.Usuario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.Usuario;

@Repository
public interface usuarioRepository extends JpaRepository<Usuario, Integer> {

    boolean existsByEmail(String email);

    boolean existsByTelefono(String telefono);

    boolean existsByEmailAndIdNot(String email, Integer id);

    boolean existsByTelefonoAndIdNot(String telefono, Integer id);

    List<Usuario> findByActivoTrue();

    Page<Usuario> findByActivoTrue(Pageable pageable);

    Optional<Usuario> findByEmailAndActivoTrue(String email);
}