package com.farmacia.cristoredentor.module.ClasificacionAbc;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.farmacia.cristoredentor.Entity.ClasificacionAbcDetalle;
import com.farmacia.cristoredentor.Entity.ClasificacionAbcHistorial;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.Enum.ClasificacionABC;
import com.farmacia.cristoredentor.Enum.UserRole;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcActualizarResponseDTO;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcDetalleDTO;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcHistorialDTO;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ClasificacionAbcRequestDTO;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ProductoABCResponseDTO;
import com.farmacia.cristoredentor.module.ClasificacionAbc.dto.ProductoABCStats;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;
import com.farmacia.cristoredentor.utils.PaginatedResponseDto;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional(readOnly = true)
@Slf4j
public class ClasificacionAbcService {

    private final ClasificacionAbcHistorialRepository historialRepo;
    private final ClasificacionAbcDetalleRepository   detalleRepo;
    private final ProductoRepository                  productoRepo;
    private final usuarioRepository                   usuarioRepo;

    public ClasificacionAbcService(
            ClasificacionAbcHistorialRepository historialRepo,
            ClasificacionAbcDetalleRepository detalleRepo,
            ProductoRepository productoRepo,
            usuarioRepository usuarioRepo) {
        this.historialRepo     = historialRepo;
        this.detalleRepo       = detalleRepo;
        this.productoRepo      = productoRepo;
        this.usuarioRepo       = usuarioRepo;
    }

    // -------------------------------------------------------------------------
    // Scheduler nocturno trimestral
    // -------------------------------------------------------------------------
    @Scheduled(cron = "0 0 2 1 1,4,7,10 *")
    @Transactional
    public void calcularAbcAutomatico() {
        Usuario usuario = usuarioRepo
            .findFirstByRolAndActivoTrue(UserRole.ADMINISTRADOR)
            .orElse(null);

        if (usuario == null) {
            log.warn("[ABC Scheduler] No se encontró administrador activo.");
            return;
        }

        try {
            ejecutarCalculo(usuario, "Cálculo automático trimestral");
            log.info("[ABC Scheduler] Cálculo ABC completado exitosamente.");
        } catch (Exception e) {
            log.error("[ABC Scheduler] Error: {}", e.getMessage(), e);
        }
    }

    // -------------------------------------------------------------------------
    // Scheduler semanal — 3am todos los domingos
    // -------------------------------------------------------------------------
    @Scheduled(cron = "0 0 3 * * SUN")
    @Transactional
    public void calcularAbcSemanalAutomatico() {
        Usuario usuario = usuarioRepo
            .findFirstByRolAndActivoTrue(UserRole.ADMINISTRADOR)
            .orElse(null);

        if (usuario == null) {
            log.warn("[ABC Weekly Scheduler] No se encontró administrador activo.");
            return;
        }

        try {
            ejecutarCalculo(usuario, "Cálculo automático semanal");
            log.info("[ABC Weekly Scheduler] Cálculo ABC completado exitosamente.");
        } catch (Exception e) {
            log.error("[ABC Weekly Scheduler] Error: {}", e.getMessage(), e);
        }
    }

    // -------------------------------------------------------------------------
    // Disparo manual
    // -------------------------------------------------------------------------
    @Transactional
    public ClasificacionAbcHistorialDTO calcularManual(
            Integer usuarioId, ClasificacionAbcRequestDTO dto) {

        Usuario usuario = usuarioRepo.findById(usuarioId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Usuario no encontrado: " + usuarioId));

        return ejecutarCalculo(usuario, dto.getObservaciones());
    }

    // -------------------------------------------------------------------------
    // NUEVO ENDPOINT DE ACTUALIZACIÓN COMPLETA CON DTO DETALLADO
    // -------------------------------------------------------------------------
    @Transactional
    public ClasificacionAbcActualizarResponseDTO actualizarClasificacionAbcManual(Integer usuarioId) {
        long startTime = System.currentTimeMillis();

        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuario no encontrado: " + usuarioId));

        // Ejecutar cálculo con algoritmo dinámico 50/30/20
        ClasificacionAbcHistorialDTO historialDTO = ejecutarCalculo(usuario, "Actualización manual dinámica 50/30/20");

        // Obtener estadísticas de ejecución
        List<ProductoABCStats> statsList = detalleRepo.obtenerStatsParaABC();

        List<ProductoABCResponseDTO> todos = new ArrayList<>();
        List<ClasificacionAbcDetalle> detallesPersistidos = detalleRepo
                .findByHistorialIdOrderByPorcentajeAcumuladoAsc(historialDTO.getId());

        for (ClasificacionAbcDetalle d : detallesPersistidos) {
            ProductoABCStats stats = statsList.stream()
                    .filter(s -> s.getProductoId().equals(d.getProducto().getId()))
                    .findFirst()
                    .orElse(null);

            Long vendidas = stats != null ? stats.getTotalVendidas() : 0L;
            BigDecimal ganancia = stats != null ? stats.getGananciaTotal() : BigDecimal.ZERO;
            Long circulacion = stats != null ? stats.getCirculacion() : 0L;

            todos.add(ProductoABCResponseDTO.builder()
                    .id(d.getProducto().getId())
                    .nombre(d.getProducto().getNombre())
                    .unidadesVendidas(vendidas)
                    .gananciaGenerada(ganancia)
                    .circulacion(circulacion)
                    .score(d.getValorInventario().doubleValue()) // d.getValorInventario() contiene el score
                    .clasificacion(d.getClasificacion().name())
                    .build());
        }

        List<ProductoABCResponseDTO> prodA = todos.stream().filter(p -> "A".equals(p.getClasificacion())).toList();
        List<ProductoABCResponseDTO> prodB = todos.stream().filter(p -> "B".equals(p.getClasificacion())).toList();
        List<ProductoABCResponseDTO> prodC = todos.stream().filter(p -> "C".equals(p.getClasificacion())).toList();

        long duration = System.currentTimeMillis() - startTime;

        return ClasificacionAbcActualizarResponseDTO.builder()
                .productosA(prodA)
                .productosB(prodB)
                .productosC(prodC)
                .fechaActualizacion(LocalDateTime.now())
                .tiempoEjecucion(duration + " ms")
                .build();
    }

    // -------------------------------------------------------------------------
    // Lógica central: Algoritmo ABC Ponderado (Ventas 50%, Ganancia 30%, Circulación 20%)
    // -------------------------------------------------------------------------
    @Transactional
    public ClasificacionAbcHistorialDTO ejecutarCalculo(Usuario usuario, String observaciones) {
        // 1. Obtener estadísticas de todos los productos activos
        List<ProductoABCStats> statsList = detalleRepo.obtenerStatsParaABC();

        if (statsList.isEmpty()) {
            throw new BusinessException("No existen productos activos en el sistema para realizar la clasificación ABC.");
        }

        // 2. Encontrar mínimos y máximos para normalización
        long maxVentas = statsList.stream().mapToLong(ProductoABCStats::getTotalVendidas).max().orElse(0L);
        long minVentas = statsList.stream().mapToLong(ProductoABCStats::getTotalVendidas).min().orElse(0L);

        BigDecimal maxGanancia = statsList.stream().map(ProductoABCStats::getGananciaTotal).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        BigDecimal minGanancia = statsList.stream().map(ProductoABCStats::getGananciaTotal).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO);

        long maxCirculacion = statsList.stream().mapToLong(ProductoABCStats::getCirculacion).max().orElse(0L);
        long minCirculacion = statsList.stream().mapToLong(ProductoABCStats::getCirculacion).min().orElse(0L);

        // Clase auxiliar temporal para almacenar puntuaciones intermedias
        class TempABC {
            ProductoABCStats stats;
            double score;
        }

        List<TempABC> infoList = new ArrayList<>();
        double totalScoreSum = 0.0;

        for (ProductoABCStats s : statsList) {
            double ventasNorm = (maxVentas - minVentas > 0) 
                    ? (double) (s.getTotalVendidas() - minVentas) / (maxVentas - minVentas) : 0.0;

            double gananciaNorm = (maxGanancia.compareTo(minGanancia) > 0) 
                    ? s.getGananciaTotal().subtract(minGanancia).doubleValue() / maxGanancia.subtract(minGanancia).doubleValue() : 0.0;

            double circNorm = (maxCirculacion - minCirculacion > 0) 
                    ? (double) (s.getCirculacion() - minCirculacion) / (maxCirculacion - minCirculacion) : 0.0;

            double score = (ventasNorm * 0.50) + (gananciaNorm * 0.30) + (circNorm * 0.20);
            totalScoreSum += score;

            TempABC t = new TempABC();
            t.stats = s;
            t.score = score;
            infoList.add(t);
        }

        // 3. Ordenar productos por puntuación de mayor a menor
        infoList.sort((a, b) -> Double.compare(b.score, a.score));

        // 4. Calcular porcentaje acumulado y clasificar
        double runningScoreSum = 0.0;
        List<ClasificacionAbcDetalle> detalles = new ArrayList<>();

        for (TempABC t : infoList) {
            runningScoreSum += t.score;

            double pctInd = (totalScoreSum > 0.0) ? (t.score / totalScoreSum) * 100.0 : 0.0;
            double pctAcum = (totalScoreSum > 0.0) ? (runningScoreSum / totalScoreSum) * 100.0 : 100.0;

            ClasificacionABC category;
            if (pctAcum <= 80.0) {
                category = ClasificacionABC.A;
            } else if (pctAcum <= 95.0) {
                category = ClasificacionABC.B;
            } else {
                category = ClasificacionABC.C;
            }

            double finalPctAcum = Math.min(100.0, pctAcum);
            Producto producto = productoRepo.getReferenceById(t.stats.getProductoId());

            detalles.add(ClasificacionAbcDetalle.builder()
                    .producto(producto)
                    .valorInventario(BigDecimal.valueOf(t.score)) // Guardamos score
                    .porcentajeIndividual(BigDecimal.valueOf(pctInd))
                    .porcentajeAcumulado(BigDecimal.valueOf(finalPctAcum))
                    .clasificacion(category)
                    .build());

            // Actualizar el producto en DB
            productoRepo.actualizarClasificacionAbc(t.stats.getProductoId(), category);
        }

        // 5. Guardar registro en historial
        ClasificacionAbcHistorial historial = historialRepo.save(
                ClasificacionAbcHistorial.builder()
                        .usuario(usuario)
                        .fechaCalculo(OffsetDateTime.now())
                        .totalProductos(detalles.size())
                        .valorTotalInv(BigDecimal.valueOf(totalScoreSum))
                        .completado(true)
                        .observaciones(observaciones != null ? observaciones : "Cálculo ABC dinámico ponderado 50/30/20")
                        .build()
        );

        // Asignar historial persistido a detalles
        detalles.forEach(d -> d.setHistorial(historial));
        detalleRepo.saveAll(detalles);

        return toHistorialDTO(historial, detalles);
    }

    @Async
    @Transactional
    public void recalcularAbcPostMovimiento() {
        Usuario usuario = usuarioRepo
            .findFirstByRolAndActivoTrue(UserRole.ADMINISTRADOR)
            .orElse(null);

        if (usuario == null) {
            log.warn("[ABC Post-Movimiento] No hay administrador activo — recálculo omitido.");
            return;
        }

        try {
            ejecutarCalculo(usuario, "Recálculo automático post-movimiento");
            log.info("[ABC Post-Movimiento] Recálculo completado.");
        } catch (BusinessException e) {
            log.debug("[ABC Post-Movimiento] Sin datos suficientes: {}", e.getMessage());
        } catch (Exception e) {
            log.error("[ABC Post-Movimiento] Error inesperado: {}", e.getMessage(), e);
        }
    }

    // -------------------------------------------------------------------------
    // Consultas
    // -------------------------------------------------------------------------
    public ClasificacionAbcHistorialDTO obtenerUltimoCalculo() {
        ClasificacionAbcHistorial historial = historialRepo
            .findTopByCompletadoTrueOrderByFechaCalculoDesc()
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "No hay cálculos ABC completados"));

        List<ClasificacionAbcDetalle> detalles = detalleRepo
            .findByHistorialIdOrderByPorcentajeAcumuladoAsc(historial.getId());

        return toHistorialDTO(historial, detalles);
    }

    public PaginatedResponseDto<ClasificacionAbcHistorialDTO> listarHistorial(
            Integer page, Integer limit) {

        Pageable pageable = PageRequest.of(page, limit,
            Sort.by("fechaCalculo").descending());

        Page<ClasificacionAbcHistorial> resultado =
            historialRepo.findByCompletadoTrue(pageable);

        List<ClasificacionAbcHistorialDTO> data = resultado.getContent()
            .stream()
            .map(h -> toHistorialDTO(h, Collections.emptyList()))
            .toList();

        return new PaginatedResponseDto<>(data, page, limit,
            (int) resultado.getTotalElements());
    }

    public ClasificacionAbcHistorialDTO obtenerHistorialPorId(Integer id) {
        ClasificacionAbcHistorial historial = historialRepo.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Historial ABC no encontrado: " + id));

        List<ClasificacionAbcDetalle> detalles = detalleRepo
            .findByHistorialIdOrderByPorcentajeAcumuladoAsc(id);

        return toHistorialDTO(historial, detalles);
    }

    private ClasificacionAbcHistorialDTO toHistorialDTO(
            ClasificacionAbcHistorial h,
            List<ClasificacionAbcDetalle> detalles) {

        List<ClasificacionAbcDetalleDTO> detalleDTOs = detalles.stream()
            .map(d -> ClasificacionAbcDetalleDTO.builder()
                .productoId(d.getProducto().getId())
                .productoNombre(d.getProducto().getNombre())
                .laboratorio(d.getProducto().getLaboratorio())
                .unidadesDespachadas(d.getValorInventario())
                .porcentajeIndividual(d.getPorcentajeIndividual())
                .porcentajeAcumulado(d.getPorcentajeAcumulado())
                .clasificacion(d.getClasificacion().name())
                .build())
            .toList();

        return ClasificacionAbcHistorialDTO.builder()
            .id(h.getId())
            .fechaCalculo(h.getFechaCalculo())
            .usuarioNombre(h.getUsuario().getNombreCompleto())
            .totalProductos(h.getTotalProductos())
            .totalUnidadesDespachadas(h.getValorTotalInv())
            .observaciones(h.getObservaciones())
            .completado(h.isCompletado())
            .detalles(detalleDTOs)
            .build();
    }
}