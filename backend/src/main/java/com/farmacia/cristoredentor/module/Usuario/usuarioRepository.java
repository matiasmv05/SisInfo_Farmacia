package com.farmacia.cristoredentor.module.Usuario;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.Enum.UserRole;

@Repository 
public interface usuarioRepository extends JpaRepository<Usuario, Integer> {

    boolean existsByEmail(String email);

    boolean existsByTelefono(String telefono);

    boolean existsByEmailAndIdNot(String email, Integer id);

    boolean existsByTelefonoAndIdNot(String telefono, Integer id);

    List<Usuario> findByActivoTrue();

    Page<Usuario> findByActivoTrue(Pageable pageable);

    Optional<Usuario> findByEmailAndActivoTrue(String email);

    Optional<Usuario> findFirstByRolAndActivoTrue(UserRole rol);

    Optional<Usuario> findByEmail(String usuarioEmail);
    

}