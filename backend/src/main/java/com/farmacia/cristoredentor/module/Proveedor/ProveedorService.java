package com.farmacia.cristoredentor.module.Proveedor;

import com.farmacia.cristoredentor.module.Proveedor.dto.*;
import com.farmacia.cristoredentor.Entity.Proveedor;
import com.farmacia.cristoredentor.module.Proveedor.ProveedorRepository;
import com.farmacia.cristoredentor.module.Proveedor.ProveedorService;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProveedorService {
    private final ProveedorRepository repository;

    public ProveedorService(ProveedorRepository repository) {
        this.repository = repository;
    }

    
    public ProveedorResponseDTO crear(ProveedorCreateDTO dto){
        Proveedor proveedor = Proveedor.builder()
                .nombre(dto.getNombre())
                .contactoNombre(dto.getContactoNombre())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .direccion(dto.getDireccion())
                .activo(true)
                .build();

        repository.save(proveedor);
        return convertirResponse(proveedor);
    }

    
    public List<ProveedorResponseDTO> listar() {
        return repository.findAll().stream()
                .map(this::convertirResponse)
                .collect(Collectors.toList());
    }

    
    public ProveedorResponseDTO obtenerPorId(Long id) {
        Proveedor proveedor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        return convertirResponse(proveedor);
    }

    
    public ProveedorResponseDTO actualizar(Long id, ProveedorUpdateDTO dto) {
        Proveedor proveedor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        proveedor.setNombre(dto.getNombre());
        proveedor.setContactoNombre(dto.getContactoNombre());
        proveedor.setTelefono(dto.getTelefono());
        proveedor.setEmail(dto.getEmail());
        proveedor.setDireccion(dto.getDireccion());
        proveedor.setActivo(dto.isActivo());

        repository.save(proveedor);
        return convertirResponse(proveedor);
    }

    
    public void eliminar(Long id) {
        Proveedor proveedor = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));
        proveedor.setActivo(false);
        repository.save(proveedor);
    }

    private ProveedorResponseDTO convertirResponse(Proveedor proveedor) {
        return ProveedorResponseDTO.builder()
                .id(proveedor.getId())
                .nombre(proveedor.getNombre())
                .contactoNombre(proveedor.getContactoNombre())
                .telefono(proveedor.getTelefono())
                .email(proveedor.getEmail())
                .direccion(proveedor.getDireccion())
                .activo(proveedor.isActivo())
                .build();
    }
}
