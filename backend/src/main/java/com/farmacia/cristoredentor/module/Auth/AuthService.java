package com.farmacia.cristoredentor.module.Auth;

import org.springframework.security.crypto.password.PasswordEncoder; // O donde tengas tu entidad Usuario
import org.springframework.stereotype.Service;

import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.module.Auth.dto.LoginRequest; // Tu repositorio de usuarios
import com.farmacia.cristoredentor.module.Auth.dto.LoginResponse; // Tu servicio que genera tokens
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;
import com.farmacia.cristoredentor.security.JwtService;

@Service
public class AuthService {

    private final usuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService; // El que use tu proyecto (JwtProvider, JwtUtil, etc.)

    public AuthService(usuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public LoginResponse login(LoginRequest request) {
    // 1. Buscar al usuario activo por email (Esto se queda igual)
    Usuario usuario = usuarioRepository.findByEmailAndActivoTrue(request.getEmail())
            .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Credenciales inválidas"));
            
     if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
        throw new org.springframework.security.authentication.BadCredentialsException("Credenciales inválidas");
    }
    
    // 3. Generar el token JWT
    String token = jwtService.generarToken(usuario); 

    // 4. Construir el LoginResponse
    return LoginResponse.builder()
            .token(token)
            .tipo("Bearer")
            .expiresIn(3600)
            .userId(usuario.getId())
            .nombre(usuario.getNombreCompleto())
            .email(usuario.getEmail())
            .rol(usuario.getRol().name()) 
            .build();
}
}