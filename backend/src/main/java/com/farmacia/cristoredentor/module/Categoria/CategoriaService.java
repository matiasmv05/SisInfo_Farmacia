package com.farmacia.cristoredentor.module.Categoria;

import java.util.List;

import org.springframework.stereotype.Service;

import com.farmacia.cristoredentor.Entity.Categoria;
import com.farmacia.cristoredentor.module.Categoria.dto.CategoriaCreateDTO;
import com.farmacia.cristoredentor.module.Categoria.dto.CategoriaResponseDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository repository;

    
    public CategoriaResponseDTO create(CategoriaCreateDTO dto) {

        Categoria categoria = Categoria.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .activo(true)
                .build();

        repository.save(categoria);

        return CategoriaResponseDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .descripcion(categoria.getDescripcion())
                .activo(categoria.isActivo())
                .build();
    }

    
    public List<CategoriaResponseDTO> listar() {

        List<Categoria> categorias = repository.findAll();

        return categorias.stream()
                .map(categoria -> CategoriaResponseDTO.builder()
                        .id(categoria.getId())
                        .nombre(categoria.getNombre())
                        .descripcion(categoria.getDescripcion())
                        .activo(categoria.isActivo())
                        .build())
                .toList();
    }

        
    public CategoriaResponseDTO getById(Long id) {

        Categoria categoria = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        return CategoriaResponseDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .descripcion(categoria.getDescripcion())
                .activo(categoria.isActivo())
                .build();
    }

   
    public CategoriaResponseDTO update(Long id, CategoriaCreateDTO dto) {

        Categoria categoria = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        categoria.setNombre(dto.getNombre());
        categoria.setDescripcion(dto.getDescripcion());

        repository.save(categoria);

        return CategoriaResponseDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .descripcion(categoria.getDescripcion())
                .activo(categoria.isActivo())
                .build();
    }

    public void desactivarCategoria(Long id) {

        Categoria categoria = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        categoria.setActivo(false);
        repository.save(categoria);
    }
}