package com.farmacia.cristoredentor.module.Usuario;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.Enum.UserRole;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.module.Auth.dto.RegisterRequest;
import com.farmacia.cristoredentor.module.Usuario.dto.ActualizarUsuarioDto;
import com.farmacia.cristoredentor.module.Usuario.dto.crearUsuarioDto;
import com.farmacia.cristoredentor.module.Usuario.dto.loginUsuarioDto;
import com.farmacia.cristoredentor.module.Usuario.dto.usuarioRequestDto;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@Service
@Transactional
public class usuarioService {

    private final usuarioRepository repo;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;

    public usuarioService(usuarioRepository repo, PasswordEncoder passwordEncoder, ModelMapper modelMapper) {
        this.repo = repo;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = modelMapper;
    }

    // Crear
    public usuarioRequestDto crearUsuario(crearUsuarioDto dto) {
        if (repo.existsByEmail(dto.getEmail()) && dto.getEmail() != null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ya registrado");
        if (repo.existsByTelefono(dto.getTelefono()))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Teléfono ya registrado");

        Usuario nuevoUsuario = Usuario.builder()
                .nombreCompleto(dto.getNombreCompleto())
                .email(dto.getEmail())
                .passwordHash(passwordEncoder.encode(dto.getPasswordHash()))
                .rol(dto.getRol())
                .telefono(dto.getTelefono())
                .build();

        repo.save(nuevoUsuario);

        usuarioRequestDto usuarioRequest = modelMapper.map(nuevoUsuario, usuarioRequestDto.class);
        return usuarioRequest;

    }


public usuarioRequestDto registrarOperador(RegisterRequest dto) {

    if (repo.existsByEmail(dto.getEmail()))                         // ← repo, no la clase
        throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ya registrado");

    Usuario usuario = Usuario.builder()
            .nombreCompleto(dto.getNombreCompleto())
            .email(dto.getEmail())
            .passwordHash(passwordEncoder.encode(dto.getPassword())) // ← passwordHash
            .rol(UserRole.OPERADOR)                                  // ← forzado, nunca del cliente
            .telefono(dto.getTelefono())                             // ← nullable, sin problema
            .activo(true)
            .build();

    Usuario guardado = repo.save(usuario);
    return modelMapper.map(guardado, usuarioRequestDto.class);
}

    // Listar todos activos sin paginación
    @Transactional(readOnly = true)
    public List<usuarioRequestDto> listarActivos() {
        return repo.findByActivoTrue()
                .stream()
                .map(u -> modelMapper.map(u, usuarioRequestDto.class))
                .collect(Collectors.toList()); // lista vacía es respuesta válida
    }

    // Listar todos (activos e inactivos) para gestión
    @Transactional(readOnly = true)
    public List<usuarioRequestDto> listarTodos() {
        return repo.findAll()
                .stream()
                .map(u -> modelMapper.map(u, usuarioRequestDto.class))
                .collect(Collectors.toList());
    }

    // Leer por id (solo activo)
    @Transactional(readOnly = true)
    public Usuario buscarEntidadPorId(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    // Leer por id request_dto
    @Transactional(readOnly = true)
    public usuarioRequestDto obtenerPorId_Request(Integer id) {
        return repo.findById(id)
                .map(u -> modelMapper.map(u, usuarioRequestDto.class))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }

    // Leer todos activos con paginación

    @Transactional(readOnly = true)
    public PaginatedResponseDto<usuarioRequestDto> listarActivosPaginado(int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit);
        Page<Usuario> resultado = repo.findByActivoTrue(pageable);

        List<usuarioRequestDto> data = resultado.getContent()
                .stream()
                .map(u -> modelMapper.map(u, usuarioRequestDto.class))
                .toList();

        return new PaginatedResponseDto<>(data, page, limit, (int) resultado.getTotalElements());
    }

    // Actualizar — solo campos no nulos

    public usuarioRequestDto actualizarUsuario(ActualizarUsuarioDto dto, Integer id) {
        Usuario u = buscarEntidadPorId(id);

        if (dto.getNombreCompleto() != null)
            u.setNombreCompleto(dto.getNombreCompleto());

        if (dto.getEmail() != null) {
            if (repo.existsByEmailAndIdNot(dto.getEmail(), id)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Email ya registrado");
            }
            u.setEmail(dto.getEmail());
        }

        if (dto.getPasswordHash() != null && !dto.getPasswordHash().isBlank())
            u.setPasswordHash(passwordEncoder.encode(dto.getPasswordHash()));

        if (dto.getTelefono() != null) {

            u.setTelefono(dto.getTelefono());
        }

        usuarioRequestDto usuarioRequest = modelMapper.map(u, usuarioRequestDto.class);
        repo.save(u);
        return usuarioRequest;
    }

    public void desactivarUsuario(Integer id) {
        Usuario u = buscarEntidadPorId(id);
        u.setActivo(false);
        repo.save(u);
    }

    public void activarUsuario(Integer id) {
        Usuario u = buscarEntidadPorId(id);
        u.setActivo(true);
        repo.save(u);
    }

}