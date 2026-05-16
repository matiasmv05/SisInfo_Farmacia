package com.farmacia.cristoredentor.Entity;

 import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;

 @Entity
  @Table(name = "usuario",
         schema = "farmacia")

  public class Usuario {

    public enum UserRole {
        administrador,
        operador
    }

      @Id
      @GeneratedValue(strategy = GenerationType.IDENTITY)
      @Column(name = "id")
      private long id;

      @Column(name = "nombre_completo", nullable = false)
      private String nombreCompleto;

      @Column(name = "password_hash", nullable = false)
      private String passwordHash;

      @Enumerated(EnumType.STRING)
      @Column(name = "rol", nullable = false)
      private UserRole rol;

      @Column(name = "activo", nullable = false)
      private boolean activo;

      @Column(name = "created_at", nullable = false, insertable = false)
      private Instant createdAt;

      @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
      private Instant updatedAt;

      @Column(name = "telefono", nullable = false, unique = true)
      private String telefono;

      @Email
      @Column(name = "email", nullable = false, unique = true)
      private String email;




       public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public boolean isActivo() {
        return activo;
    }

    public void setActivo(boolean activo) {
        this.activo = activo;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

     public UserRole getRol() {
        return rol;
    }

    public void setRol(UserRole rol) {
        this.rol = rol;
    }

     public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
