package com.farmacia.cristoredentor.module.Usuario;

import java.util.List;

  import org.springframework.http.HttpStatus;
  import org.springframework.security.crypto.password.PasswordEncoder;
  import org.springframework.stereotype.Service;
  import org.springframework.transaction.annotation.Transactional;
  import org.springframework.web.server.ResponseStatusException;

  import com.farmacia.cristoredentor.Entity.Usuario;
  import com.farmacia.cristoredentor.module.Usuario.dto.ActualizarUsuarioDto;
  import com.farmacia.cristoredentor.module.Usuario.dto.crearUsuarioDto;
  import com.farmacia.cristoredentor.module.Usuario.dto.loginUsuarioDto;
  import com.farmacia.cristoredentor.utils.PaginatedResponseDto;
  import  com.farmacia.cristoredentor.utils.Query;

@Service
@Transactional
public class usuarioService {

    private final usuarioRepository repo;
    private final PasswordEncoder passwordEncoder;

    public usuarioService(usuarioRepository repo,PasswordEncoder passwordEncoder) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
    }

    // Crear
    public Usuario crearUsuario(crearUsuarioDto dto) {
        if (repo.existsByEmail(dto.getEmail()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ya registrado");
        if (repo.existsByTelefono(dto.getNumeroTelefono()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Teléfono ya registrado");

        Usuario u = new Usuario();
        u.setNombreCompleto(dto.getNombreCompleto());
        u.setEmail(dto.getEmail());
        u.setPasswordHash(passwordEncoder.encode(dto.getPassword())); // Assuming the DTO already contains the hashed password
        u.setRol(dto.getRol());
        u.setTelefono(dto.getNumeroTelefono());
        u.setActivo(true);
        return repo.save(u);
    }

    // Leer por id
    @Transactional(readOnly = true)
    public Usuario obtenerPorId(Long id){
        return repo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        }
    // Leer todos activos
    @Transactional(readOnly = true)
    public List<Usuario> listarActivos() {
        return repo.findByActivoTrue();
    }

    // Leer todos activos con paginación
    @Transactional(readOnly = true)
    public PaginatedResponseDto<Usuario> listarActivosPaginado(Integer page, Integer limit) {
        Query.Pagination pagination = Query.normalizePage(page, limit);
        List<Usuario> allUsuarios = repo.findByActivoTrue();
        int totalElements = allUsuarios.size();
        
        int offset = pagination.getOffset();
        int endIndex = Math.min(offset + pagination.getLimit(), allUsuarios.size());
        
        List<Usuario> paginatedData = allUsuarios.subList(offset, endIndex);
        
        return new PaginatedResponseDto<>(paginatedData, pagination.getPage(), pagination.getLimit(), totalElements);
    }

    // Actualizar — solo campos no nulos
    public Usuario actualizarUsuario(ActualizarUsuarioDto dto, Long id){
        Usuario u = obtenerPorId(id);

        if (dto.getNombreCompleto() != null)
            u.setNombreCompleto(dto.getNombreCompleto());

        if (dto.getEmail() != null ) {
           if (repo.existsByEmail(dto.getEmail()))
              throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ya registrado");
            u.setEmail(dto.getEmail());
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank())
            u.setPasswordHash(dto.getPassword());

        if (dto.getRol() != null)
            u.setRol(dto.getRol());

        if (dto.getNumeroTelefono() != null)
                if (repo.existsByTelefono(dto.getNumeroTelefono()))
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Teléfono ya registrado");
            u.setTelefono(dto.getNumeroTelefono());

        return repo.save(u);
    }

    // Desactivar — borrado lógico
    public void desactivarUsuario(Long id) {
        Usuario u = obtenerPorId(id);
        u.setActivo(false);
        repo.save(u);
   }

    // Login — busca activo, verifica contraseña
    @Transactional(readOnly = true)
    public Usuario login(loginUsuarioDto dto){
        Usuario u = repo.findByEmailAndActivoTrue(dto.getEmail())
            .orElseThrow(() ->  new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));

        if (!passwordEncoder.matches(dto.getPassword(), u.getPasswordHash()))
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");

        return u;
    }
}