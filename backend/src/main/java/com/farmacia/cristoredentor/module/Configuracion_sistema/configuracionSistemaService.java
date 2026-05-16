package com.farmacia.cristoredentor.module.Configuracion_sistema;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.farmacia.cristoredentor.Entity.Configuracion_sistema;
import com.farmacia.cristoredentor.module.Configuracion_sistema.dto.ActualizarConfiguracionDto;

@Service
@Transactional
public class configuracionSistemaService {

    private final configuracionSistemaRepository repo;

    public configuracionSistemaService(configuracionSistemaRepository repo) {
        this.repo = repo;
    }

    // Obtener todos los parámetros
    @Transactional(readOnly = true)
    public List<Configuracion_sistema> obtenerTodos() {
        return repo.findAll();
    }

    // Obtener por clave
    @Transactional(readOnly = true)
    public Configuracion_sistema obtenerPorClave(String clave) {
        return repo.findByClave(clave)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Configuración no encontrada: " + clave));
    }

    // Actualizar valor
    public Configuracion_sistema actualizarValor(String clave, ActualizarConfiguracionDto dto) {
        Configuracion_sistema config = obtenerPorClave(clave);
        config.setValor(dto.getValor());
        config.setDescripcion(dto.getDescripcion());
        return repo.save(config);
    }
}
