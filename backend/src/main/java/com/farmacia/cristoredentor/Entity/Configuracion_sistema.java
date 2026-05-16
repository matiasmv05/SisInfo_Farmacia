package com.farmacia.cristoredentor.Entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

 @Entity
  @Table(name = "configuracion_sistema",
         schema = "farmacia")
public class Configuracion_sistema {
      @Id
      @Column(name = "clave", nullable = false)
      private String clave;

      @Column(name = "valor", nullable = false)
      private String valor;

       @Column(name = "descripcion", nullable = false)
      private String descripcion;

       @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
      private Instant updatedAt;

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
    }

    public String getValor() {
        return valor;
    }

    public void setValor(String valor) {
        this.valor = valor;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
