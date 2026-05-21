package com.farmacia.cristoredentor.Entity;

import java.math.BigDecimal;
import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "configuracion_sistema",schema = "farmacia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Configuracion_sistema {
      @Id
      @Column(name = "clave", nullable = false)
      private String clave;

      @Column(name = "valor", nullable = false)
      private BigDecimal valor;

       @Column(name = "descripcion", nullable = false)
      private String descripcion;

       @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
      private Instant updatedAt;

}
