package com.farmacia.cristoredentor.module.Producto;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Enum.CategoriaProducto;
import com.farmacia.cristoredentor.Enum.ClasificacionABC;
import com.farmacia.cristoredentor.module.ClasificacionAbc.ClasificacionAbcDetalleRepository;
import com.farmacia.cristoredentor.module.Lote.LoteRepository;

@ExtendWith(MockitoExtension.class)
class ProductoServiceTest {

    @Mock
    private ProductoRepository productoRepo;

    @Mock
    private ModelMapper modelMapper;

    @Mock
    private LoteRepository loteRepo;

    @Mock
    private ClasificacionAbcDetalleRepository abcDetalleRepo;

    @InjectMocks
    private ProductoService service;

    @Test
    void listarFiltrado_debeAplicarFiltroDeClasificacionAbc() {
        Producto producto = Producto.builder()
                .id(1)
                .nombre("Paracetamol")
                .categoria(CategoriaProducto.ANALGESICOS)
                .clasificacionAbc(ClasificacionABC.A)
                .activo(true)
                .build();

        when(productoRepo.findByFiltros(eq("para"), eq(CategoriaProducto.ANALGESICOS), eq(ClasificacionABC.A), any()))
                .thenReturn(new PageImpl<>(List.of(producto), PageRequest.of(0, 10), 1));
        when(modelMapper.map(any(Producto.class), any())).thenReturn(new com.farmacia.cristoredentor.module.Producto.dto.ProductoDetalleDTO());

        service.listarFiltrado(0, 10, "para", CategoriaProducto.ANALGESICOS, ClasificacionABC.A);

        verify(productoRepo).findByFiltros(eq("para"), eq(CategoriaProducto.ANALGESICOS), eq(ClasificacionABC.A), any());
    }
}
