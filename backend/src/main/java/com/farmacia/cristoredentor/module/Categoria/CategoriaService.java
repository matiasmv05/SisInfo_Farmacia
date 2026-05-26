package com.farmacia.cristoredentor.module.Categoria;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.farmacia.cristoredentor.Entity.Categoria;
import com.farmacia.cristoredentor.module.Categoria.dto.CategoriaCreateDTO;
import com.farmacia.cristoredentor.module.Categoria.dto.CategoriaResponseDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository repository;
    private final ModelMapper modelMapper;

    // Método para crear una nueva categoría
    public CategoriaResponseDTO create(CategoriaCreateDTO dto) {

        Categoria categoria = Categoria.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .activo(true)
                .build();

        repository.save(categoria);

        CategoriaResponseDTO categoriaResponse = modelMapper.map(categoria, CategoriaResponseDTO.class);

        return categoriaResponse;
    }

    
    // Método para listar todas las categorías
    public List<CategoriaResponseDTO> listar() {

        List<Categoria> categorias = repository.findByActivoTrue();

        return categorias.stream()
                .map(categoria -> modelMapper.map(categoria, CategoriaResponseDTO.class))
                .toList();
    }

    // Método para listar categorías activas con paginación
     public PaginatedResponseDto<CategoriaResponseDTO> listarActivosPaginado(Integer page, Integer limit) {
        PageRequest pageable = PageRequest.of(page, limit);
        Page<Categoria> resultado = repository.findByActivoTrue(pageable);

        List<CategoriaResponseDTO> data = resultado.getContent()
            .stream()
            .map(categoria -> modelMapper.map(categoria, CategoriaResponseDTO.class))
        .toList();

    return new PaginatedResponseDto<>(data, page, limit, (int) resultado.getTotalElements());
    }

 
    // Método para obtener una categoría por su ID
    public CategoriaResponseDTO getById_Request(Integer id) {

        Categoria categoria = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        return modelMapper.map(categoria, CategoriaResponseDTO.class);
    }

    // Método para actualizar una categoría existente
    public CategoriaResponseDTO update(Integer id, CategoriaCreateDTO dto) {

        Categoria categoria = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        categoria.setNombre(dto.getNombre());
        categoria.setDescripcion(dto.getDescripcion());

        repository.save(categoria);

        return modelMapper.map(categoria, CategoriaResponseDTO.class);
                
    }

    // Método para eliminar una categoría (desactivarla)
    public Categoria obtenerPorId(Integer id){
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Categoría no encontrada"));
        }

 
    // Método para desactivar una categoría
    public void desactivarCategoria(Integer id) {
        Categoria categoria = obtenerPorId(id);
        categoria.setActivo(false);
        repository.save(categoria);
    }

    // Método para activar una categoría
    public void activarCategoria(Integer id) {
        Categoria categoria = obtenerPorId(id);
        categoria.setActivo(true);
        repository.save(categoria);
    }
}