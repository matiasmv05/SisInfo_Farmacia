package com.farmacia.cristoredentor.module.Proveedor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmacia.cristoredentor.Entity.Proveedor;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.Proveedor.dto.ProveedorRequestDTO;
import com.farmacia.cristoredentor.module.Proveedor.dto.ProveedorResponseDTO;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@Service
@Transactional
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;

    public ProveedorService(ProveedorRepository proveedorRepository) {
        this.proveedorRepository = proveedorRepository;
    }

    // Crear
    public ProveedorResponseDTO crear(ProveedorRequestDTO dto) {
        if (proveedorRepository.existsByNombreIgnoreCase(dto.getNombre()))
            throw new BusinessException("Ya existe un proveedor con el nombre: " + dto.getNombre());

        Proveedor proveedor = Proveedor.builder()
                .nombre(dto.getNombre().strip())
                .contactoNombre(dto.getContactoNombre())
                .telefono(dto.getTelefono())
                .correo(dto.getCorreo())
                .direccion(dto.getDireccion())
                .activo(true)
                .build();

        return toResponseDTO(proveedorRepository.save(proveedor));
    }

    // Obtener por id
    @Transactional(readOnly = true)
    public ProveedorResponseDTO obtenerPorId(Integer id) {
        return toResponseDTO(buscarEntidadActiva(id));
    }

    // Listar activos sin paginación (para dropdowns en frontend)
    @Transactional(readOnly = true)
    public List<ProveedorResponseDTO> listarActivos() {
        return proveedorRepository.findByActivoTrue()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    // Listar con filtros y paginación
    @Transactional(readOnly = true)
    public PaginatedResponseDto<ProveedorResponseDTO> listarPaginado(
            Integer page, Integer limit, String nombre, Boolean activo) {

        Pageable pageable = PageRequest.of(page, limit, Sort.by("nombre").ascending());
        Page<Proveedor> resultado = proveedorRepository.buscarConFiltros(nombre, activo, pageable);

        List<ProveedorResponseDTO> data = resultado.getContent()
                .stream()
                .map(this::toResponseDTO)
                .toList();

        return new PaginatedResponseDto<>(data, page, limit, (int) resultado.getTotalElements());
    }

    // Actualizar
    public ProveedorResponseDTO actualizar(Integer id, ProveedorRequestDTO dto) {
        Proveedor proveedor = buscarEntidadActiva(id);

        if (proveedorRepository.existsByNombreIgnoreCaseAndIdNot(dto.getNombre(), id))
            throw new BusinessException("Ya existe otro proveedor con el nombre: " + dto.getNombre());

        proveedor.setNombre(dto.getNombre().strip());
        proveedor.setContactoNombre(dto.getContactoNombre());
        proveedor.setTelefono(dto.getTelefono());
        proveedor.setCorreo(dto.getCorreo());
        proveedor.setDireccion(dto.getDireccion());

        return toResponseDTO(proveedorRepository.save(proveedor));
    }

    // Desactivar
    public void desactivar(Integer id) {
        Proveedor proveedor = buscarEntidadActiva(id);
        proveedor.setActivo(false);
        proveedorRepository.save(proveedor);
    }

    // Activar
    public void activar(Integer id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Proveedor no encontrado: " + id));
        if (proveedor.isActivo())
            throw new BusinessException("El proveedor id=" + id + " ya está activo.");
        proveedor.setActivo(true);
        proveedorRepository.save(proveedor);
    }

    // -------------------------------------------------------------------------
    // Métodos internos
    // -------------------------------------------------------------------------

    public Proveedor buscarEntidadActiva(Integer id) {
    Proveedor proveedor = proveedorRepository.findByIdAndActivoTrue(id);
    if (proveedor == null) {
        throw new ResourceNotFoundException("Proveedor no encontrado o inactivo: " + id);
    }
    return proveedor;
}

    private ProveedorResponseDTO toResponseDTO(Proveedor p) {
        return ProveedorResponseDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .contactoNombre(p.getContactoNombre())
                .telefono(p.getTelefono())
                .correo(p.getCorreo())
                .direccion(p.getDireccion())
                .activo(p.isActivo())
                .build();
    }
}