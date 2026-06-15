package com.farmacia.cristoredentor.module.Alerta;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmacia.cristoredentor.Entity.Alerta;
import com.farmacia.cristoredentor.Entity.Lote;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.Enum.CriticidadAlerta;
import com.farmacia.cristoredentor.Enum.TipoAlerta;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.Alerta.dto.AlertaDetalleDTO;
import com.farmacia.cristoredentor.module.Alerta.dto.AlertaMarcarLeidaDTO;
import com.farmacia.cristoredentor.module.Configuracion_sistema.configuracionSistemaRepository;
import com.farmacia.cristoredentor.module.Lote.LoteRepository;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

@Service
public class AlertaService {

    private final AlertaRepository alertaRepo;
    private final LoteRepository loteRepo;
    private final ProductoRepository productoRepo;
    private final usuarioRepository usuarioRepo;
    private final configuracionSistemaRepository configuracionRepo;

    public AlertaService(
            AlertaRepository alertaRepo,
            LoteRepository loteRepo,
            ProductoRepository productoRepo,
            usuarioRepository usuarioRepo,
            configuracionSistemaRepository configuracionRepo) {
        this.alertaRepo = alertaRepo;
        this.loteRepo = loteRepo;
        this.productoRepo = productoRepo;
        this.usuarioRepo = usuarioRepo;
        this.configuracionRepo = configuracionRepo;
    }

    // -------------------------------------------------------------------------
    // Scheduler: corre cada hora para detectar vencimientos y stock crítico
    // -------------------------------------------------------------------------
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void generarAlertasAutomaticas() {
    int diasRojo     = obtenerConfigInt("alerta_dias_rojo",     7);
    int diasAmarillo = obtenerConfigInt("alerta_dias_amarillo", 15);
    int diasVerde    = obtenerConfigInt("alerta_dias_verde",    30);

    LocalDate hoy = LocalDate.now();

    // ← AQUÍ va la línea corregida
    loteRepo.findLotesActivosConVencimientoProximo(hoy.plusDays(diasVerde))
        .forEach(lote -> generarAlertaVencimiento(lote, hoy, diasRojo, diasAmarillo));

    // Alertas de stock mínimo
    productoRepo.findProductosStockCriticoSinPaginar()
        .forEach(this::generarAlertaStockMinimo);

    // ← NUEVO: Limpiar alertas obsoletas de stock que ya no aplican
    limpiarAlertasStockObsoletas();
}

    // -------------------------------------------------------------------------
    // Listar alertas activas para el dashboard
    // -------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public PaginatedResponseDto<AlertaDetalleDTO> listarActivas(
            Integer page, Integer limit) {

        Pageable pageable = PageRequest.of(page, limit);
        Page<Alerta> resultado = alertaRepo
            .findByLeidaFalseOrderByFechaGeneracionDesc(pageable);

        List<AlertaDetalleDTO> data = resultado.getContent()
            .stream()
            .map(this::toDetalleDTO)
            .toList();

        return new PaginatedResponseDto<>(data, page, limit,
            (int) resultado.getTotalElements());
    }

    // -------------------------------------------------------------------------
    // Resumen para KPIs
    // -------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public Map<String, Integer> obtenerResumen() {
        List<Alerta> activas = alertaRepo.findByLeidaFalse();
        int alta = 0;
        int media = 0;
        int baja = 0;
        int vencimientos = 0;

        for (Alerta a : activas) {
            if (a.getCriticidad() == CriticidadAlerta.alta) alta++;
            else if (a.getCriticidad() == CriticidadAlerta.media) media++;
            else if (a.getCriticidad() == CriticidadAlerta.baja) baja++;

            if (a.getTipo() == TipoAlerta.vencimiento_rojo || 
                a.getTipo() == TipoAlerta.vencimiento_amarillo ||
                a.getTipo() == TipoAlerta.vencimiento_verde) {
                vencimientos++;
            }
        }

        Map<String, Integer> map = new HashMap<>();
        map.put("total", activas.size());
        map.put("alta", alta);
        map.put("media", media);
        map.put("baja", baja);
        map.put("vencimientos", vencimientos);
        return map;
    }

    // -------------------------------------------------------------------------
    // Marcar alerta como leída
    // -------------------------------------------------------------------------
    @Transactional
    public AlertaDetalleDTO marcarLeida(Integer alertaId, AlertaMarcarLeidaDTO dto) {
        Alerta alerta = alertaRepo.findById(alertaId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Alerta no encontrada: " + alertaId));

        if (alerta.isLeida())
            throw new BusinessException(
                "La alerta id=" + alertaId + " ya fue gestionada");

        Usuario usuario = usuarioRepo.findById(dto.getUsuarioGestionaId())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Usuario no encontrado: " + dto.getUsuarioGestionaId()));

        alerta.setLeida(true);
        alerta.setFechaLectura(OffsetDateTime.now());
        alerta.setUsuarioGestiona(usuario);

        return toDetalleDTO(alertaRepo.save(alerta));
    }

    // -------------------------------------------------------------------------
    // Generación interna de alertas
    // -------------------------------------------------------------------------
    private void generarAlertaVencimiento(
            Lote lote, LocalDate hoy, int diasRojo, int diasAmarillo) {

        Long diasRestantes = hoy.until(
            lote.getFechaVencimiento(),
            java.time.temporal.ChronoUnit.DAYS);

        // Respetar dias_minimos_venta del producto
        Integer diasMinVenta = lote.getProducto().getDiasMinimosVenta();
        if (diasMinVenta != null && diasRestantes <= diasMinVenta) {
            // Ya no se puede vender, alerta roja forzada
            crearAlertaVencimientoSiNoExiste(
                lote, TipoAlerta.vencimiento_rojo, CriticidadAlerta.alta,
                "Lote " + lote.getNumeroLote() + " no puede venderse: " +
                diasRestantes + " días restantes (mínimo: " + diasMinVenta + ")");
            return;
        }

        if (diasRestantes <= diasRojo) {
            crearAlertaVencimientoSiNoExiste(
                lote, TipoAlerta.vencimiento_rojo, CriticidadAlerta.alta,
                "Lote " + lote.getNumeroLote() + " vence en " +
                diasRestantes + " días");

        } else if (diasRestantes <= diasAmarillo) {
            crearAlertaVencimientoSiNoExiste(
                lote, TipoAlerta.vencimiento_amarillo, CriticidadAlerta.media,
                "Lote " + lote.getNumeroLote() + " vence en " +
                diasRestantes + " días");

        } else {
            crearAlertaVencimientoSiNoExiste(
                lote, TipoAlerta.vencimiento_verde, CriticidadAlerta.baja,
                "Lote " + lote.getNumeroLote() + " vence en " +
                diasRestantes + " días");
        }
    }

    private void crearAlertaVencimientoSiNoExiste(
            Lote lote, TipoAlerta tipo,
            CriticidadAlerta criticidad, String mensaje) {

        // Si ya existe una alerta activa del mismo tipo para este lote, no duplicar
        boolean yaExiste = alertaRepo
            .findByTipoAndLoteIdAndLeidaFalse(tipo, lote.getId())
            .isPresent();

        if (yaExiste) return;

        alertaRepo.save(Alerta.builder()
            .tipo(tipo)
            .criticidad(criticidad)
            .mensaje(mensaje)
            .producto(lote.getProducto())
            .lote(lote)
            .leida(false)
            .fechaGeneracion(OffsetDateTime.now())
            .build());
    }

    private void generarAlertaStockMinimo(Producto producto) {
        boolean yaExiste = alertaRepo
            .findByTipoAndProductoIdAndLeidaFalse(
                TipoAlerta.stock_minimo, producto.getId())
            .isPresent();

        if (yaExiste) return;

        alertaRepo.save(Alerta.builder()
            .tipo(TipoAlerta.stock_minimo)
            .criticidad(CriticidadAlerta.alta)
            .mensaje("Stock crítico: " + producto.getNombre() +
                " tiene " + producto.getStockTotal() +
                " unidades (mínimo: " + producto.getStockMinimo() + ")")
            .producto(producto)
            .leida(false)
            .fechaGeneracion(OffsetDateTime.now())
            .build());
    }

    // -------------------------------------------------------------------------
    // Limpiar alertas de stock que ya no aplican (stock ya está por encima del mínimo)
    // -------------------------------------------------------------------------
    private void limpiarAlertasStockObsoletas() {
        List<Alerta> alertasStockActivas = alertaRepo
            .findByTipoAndLeidaFalseOrderByFechaGeneracionDesc(TipoAlerta.stock_minimo);

        for (Alerta alerta : alertasStockActivas) {
            Producto producto = alerta.getProducto();
            // Si el stock actual YA NO está por debajo del mínimo, marcar como leída
            if (producto.getStockTotal() >= producto.getStockMinimo()) {
                alerta.setLeida(true);
                alerta.setFechaLectura(OffsetDateTime.now());
                alertaRepo.save(alerta);
            }
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------
    private int obtenerConfigInt(String clave, int defecto) {
        return configuracionRepo.findById(clave)
            .map(c -> c.getValor().intValue())
            .orElse(defecto);
    }

    private AlertaDetalleDTO toDetalleDTO(Alerta a) {
        return AlertaDetalleDTO.builder()
            .id(a.getId())
            .tipo(a.getTipo())
            .criticidad(a.getCriticidad())
            .mensaje(a.getMensaje())
            .productoId(a.getProducto().getId())
            .productoNombre(a.getProducto().getNombre())
            .productoCategoria(a.getProducto().getCategoria() != null ? a.getProducto().getCategoria().name() : null)
            .stockActual(a.getProducto().getStockTotal())
            .stockMinimo(a.getProducto().getStockMinimo())
            .loteId(a.getLote() != null ? a.getLote().getId() : null)
            .loteNumero(a.getLote() != null ? a.getLote().getNumeroLote() : null)
            .leida(a.isLeida())
            .usuarioGestionaNombre(a.getUsuarioGestiona() != null
                ? a.getUsuarioGestiona().getNombreCompleto() : null)
            .fechaGeneracion(a.getFechaGeneracion())
            .fechaLectura(a.getFechaLectura())
            .build();
    }
}