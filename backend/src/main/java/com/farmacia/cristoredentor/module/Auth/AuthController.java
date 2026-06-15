package com.farmacia.cristoredentor.module.Auth;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.module.Auth.dto.LoginRequest;
import com.farmacia.cristoredentor.module.Auth.dto.LoginResponse;
import com.farmacia.cristoredentor.module.Auth.dto.RegisterRequest;
import com.farmacia.cristoredentor.module.Usuario.dto.usuarioRequestDto;
import com.farmacia.cristoredentor.module.Usuario.usuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final usuarioService usuarioService;


    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // POST /api/auth/register
    @PostMapping("/register")
public ResponseEntity<usuarioRequestDto> registrar(@Valid @RequestBody RegisterRequest dto) {
    usuarioRequestDto creado = usuarioService.registrarOperador(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(creado);
}
}