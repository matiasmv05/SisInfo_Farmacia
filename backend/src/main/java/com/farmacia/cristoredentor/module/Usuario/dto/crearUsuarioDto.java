package com.farmacia.cristoredentor.module.Usuario.dto;

import com.farmacia.cristoredentor.Entity.Usuario.UserRole;

import jakarta.validation.constraints.Email;


public class crearUsuarioDto {
    
    private String nombreCompleto;

    private String password;
    
    private UserRole rol;
    
    private String numeroTelefono;

    @Email
    private String email;

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UserRole getRol() {
        return rol;
    }

    public void setRol(UserRole rol) {
        this.rol = rol;
    }

    public String getNumeroTelefono() {
        return numeroTelefono;
    }

    public void setNumeroTelefono(String numeroTelefono) {
        this.numeroTelefono = numeroTelefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    
}
