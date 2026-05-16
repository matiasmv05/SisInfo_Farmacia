  package com.farmacia.cristoredentor.module.Usuario;

  import java.util.List;
  import java.util.Optional;

  import org.springframework.data.jpa.repository.JpaRepository;
  import org.springframework.stereotype.Repository;

  import com.farmacia.cristoredentor.Entity.Usuario;

  @Repository
  public interface usuarioRepository extends JpaRepository<Usuario, Long> {


    // Login: busca usuario activo por teléfono
    Optional<Usuario> findByEmailAndActivoTrue(String email);

    // Validación al crear: ¿ya existe ese teléfono?
    boolean existsByEmail(String email);

    boolean existsByTelefono(String telefono);

    // Listar solo usuarios activos
    List<Usuario> findByActivoTrue();

}
  