package com.farmacia.cristoredentor.module.Categoria;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.module.Categoria.dto.CategoriaCreateDTO;
import com.farmacia.cristoredentor.module.Categoria.dto.CategoriaResponseDTO;


@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
    private final CategoriaService service;
    
    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    // POST api/categorias
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<CategoriaResponseDTO> crear(@RequestBody CategoriaCreateDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    // GET api/categorias
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    // GET api/categorias/paginado
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping("/paginado")
    public ResponseEntity<?> listarActivosPaginado(
        @RequestParam(defaultValue = "0") Integer page,
        @RequestParam(defaultValue = "20") Integer limit) {

        return ResponseEntity.ok(service.listarActivosPaginado(page, limit));
    }

    // GET api/categorias/{id}
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'OPERADOR')")
    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> obtenerPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById_Request(id));
    }
    
    // PUT api/categorias/{id}
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> actualizar(
        @PathVariable Integer id,
        @RequestBody CategoriaCreateDTO dto) {

        return ResponseEntity.ok(service.update(id, dto));
    }

    // DELETE api/categorias/{id}
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {

        service.desactivarCategoria(id);

        return ResponseEntity.noContent().build();
    }
}
