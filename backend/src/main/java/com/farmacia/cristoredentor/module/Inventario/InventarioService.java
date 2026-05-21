package com.farmacia.cristoredentor.module.Inventario;

import com.farmacia.cristoredentor.module.Inventario.dto.*;

import java.util.List;

public interface InventarioService {

    // Salidas con lógica FEFO
    SalidaFEFOResponseDTO registrarSalidaFEFO(SalidaFEFORequestDTO request, Long usuarioId);

    // Entrada directa (sin orden de compra)
    void registrarEntradaDirecta(EntradaDirectaRequestDTO request, Long usuarioId);

    // Ajustes manuales (solo administrador)
    void registrarAjuste(AjusteInventarioRequestDTO request, Long usuarioId);

    // Consultas
    InventarioResponseDTO obtenerStockPorProducto(Long productoId);
    List<InventarioResponseDTO> obtenerHistorialPorProducto(Long productoId);
    List<InventarioResponseDTO> obtenerHistorialPorLote(Long loteId);
    List<InventarioResponseDTO> obtenerLotesActivosPorProducto(Long productoId);

    // Tareas programadas
    void ejecutarBajaLotesVencidos(Long usuarioSistemaId);
    void ejecutarGeneracionAlertas();
}