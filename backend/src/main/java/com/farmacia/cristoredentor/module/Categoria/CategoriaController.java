package com.farmacia.cristoredentor.module.Categoria;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.module.Categoria.dto.CategoriaCreateDTO;
import com.farmacia.cristoredentor.module.Categoria.dto.CategoriaResponseDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;


@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {
    private final CategoriaService service;
    
    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<CategoriaResponseDTO> crear(@RequestBody CategoriaCreateDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listar() {
    
        return ResponseEntity.ok(service.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CategoriaResponseDTO> actualizar(
        @PathVariable Long id,
        @RequestBody CategoriaCreateDTO dto) {

        return ResponseEntity.ok(service.update(id, dto));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {

        service.desactivarCategoria(id);

        return ResponseEntity.noContent().build();
    }
}
