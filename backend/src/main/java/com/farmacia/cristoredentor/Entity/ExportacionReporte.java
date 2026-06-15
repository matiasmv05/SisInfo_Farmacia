package com.farmacia.cristoredentor.Entity;

import java.time.LocalDateTime;
import java.time.LocalDate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "exportacion_reporte", schema = "farmacia")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportacionReporte {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "usuario_id", nullable = false)
    private Integer usuarioId;

    @Column(name = "tipo_reporte", nullable = false, length = 50)
    private String tipoReporte;

    @Column(name = "fecha_generacion", nullable = false)
    private LocalDateTime fechaGeneracion;

    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;

    @PrePersist
    protected void onCreate() {
        this.fechaGeneracion = LocalDateTime.now();
    }
}
