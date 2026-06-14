package com.farmacia.cristoredentor.module.Reporte;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.imageio.ImageIO;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.BarRenderer;
import org.jfree.data.category.DefaultCategoryDataset;
import org.jfree.data.general.DefaultPieDataset;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.farmacia.cristoredentor.Entity.ExportacionReporte;
import com.farmacia.cristoredentor.Entity.Lote;
import com.farmacia.cristoredentor.Entity.MovimientoInventario;
import com.farmacia.cristoredentor.Entity.Producto;
import com.farmacia.cristoredentor.Entity.ReporteExportado;
import com.farmacia.cristoredentor.Entity.Usuario;
import com.farmacia.cristoredentor.Enum.TipoMovimiento;
import com.farmacia.cristoredentor.exceptions.BusinessException;
import com.farmacia.cristoredentor.exceptions.ResourceNotFoundException;
import com.farmacia.cristoredentor.module.Lote.LoteRepository;
import com.farmacia.cristoredentor.module.MovimientoInventario.MovimientoInventarioRepository;
import com.farmacia.cristoredentor.module.Producto.ProductoRepository;
import com.farmacia.cristoredentor.module.Reporte.dto.ReporteCreateDTO;
import com.farmacia.cristoredentor.module.Reporte.dto.ReporteResponseDTO;
import com.farmacia.cristoredentor.module.Usuario.usuarioRepository;

import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.Event;
import com.itextpdf.kernel.events.IEventHandler;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.geom.Rectangle;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import com.itextpdf.layout.Canvas;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.layout.properties.VerticalAlignment;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteService {

    private final ReporteRepository repository;
    private final usuarioRepository usuarioRepo;
    private final ExportacionReporteRepository exportacionRepo;
    private final LoteRepository loteRepo;
    private final ProductoRepository productoRepo;
    private final MovimientoInventarioRepository movimientoRepo;

    // Colores corporativos para el PDF
    private static final DeviceRgb COLOR_PRIMARIO = new DeviceRgb(46, 117, 89); // Verde Farmacia
    private static final DeviceRgb COLOR_SECUNDARIO = new DeviceRgb(240, 248, 255); // Fondo claro
    private static final DeviceRgb COLOR_TEXTO_OSCURO = new DeviceRgb(44, 62, 80);

    // =========================================================================
    // Métodos CRUD Existentes (Para no romper compatibilidad)
    // =========================================================================

    public ReporteResponseDTO crear(ReporteCreateDTO dto) {
        Usuario usuario = usuarioRepo.findById(dto.getUsuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        ReporteExportado reporte = ReporteExportado.builder()
                .tipoReporte(dto.getTipoReporte())
                .fechaInicioPeriodo(dto.getFechaInicioPeriodo())
                .fechaFinPeriodo(dto.getFechaFinPeriodo())
                .parametrosJson(dto.getParametrosJson())
                .usuario(usuario)
                .build();

        repository.save(reporte);
        return mapearAResponse(reporte);
    }

    public ReporteResponseDTO obtenerPorId(Long id) {
        ReporteExportado reporte = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado"));
        return mapearAResponse(reporte);
    }

    public List<ReporteResponseDTO> listar() {
        return repository.findAll().stream()
                .map(this::mapearAResponse)
                .toList();
    }

    public List<ReporteResponseDTO> obtenerPorUsuario(Long usuarioId) {
        return repository.findByUsuarioId(usuarioId).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    public List<ReporteResponseDTO> obtenerPorTipo(String tipoReporte) {
        return repository.findByTipoReporte(tipoReporte).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    public List<ReporteResponseDTO> obtenerPorRangoFechas(LocalDate inicio, LocalDate fin) {
        return repository.findByFechaInicioPeriodoBetween(inicio, fin).stream()
                .map(this::mapearAResponse)
                .toList();
    }

    public void eliminar(Long id) {
        ReporteExportado reporte = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reporte no encontrado"));
        repository.delete(reporte);
    }

    private ReporteResponseDTO mapearAResponse(ReporteExportado reporte) {
        return ReporteResponseDTO.builder()
                .id(reporte.getId())
                .tipoReporte(reporte.getTipoReporte())
                .fechaInicioPeriodo(reporte.getFechaInicioPeriodo())
                .fechaFinPeriodo(reporte.getFechaFinPeriodo())
                .parametrosJson(reporte.getParametrosJson())
                .nombreUsuario(reporte.getUsuario().getNombreCompleto())
                .fechaExportacion(reporte.getFechaExportacion())
                .build();
    }

    // =========================================================================
    // NUEVA GENERACIÓN DE REPORTES PDF E INTEGRACIÓN CON JFREECHART
    // =========================================================================

    @Transactional
    public byte[] exportarReportePdf(String tipo, LocalDate fechaInicio, LocalDate fechaFin, Integer usuarioId) {
        Usuario usuario = usuarioRepo.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + usuarioId));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        try {
            // 1. Inicializar iText PDF Writer y Document
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4);
            document.setMargins(36, 36, 60, 36);

            // Registrar Event Handler para pie de página con número de página
            String fechaGeneracionStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
            pdf.addEventHandler(PdfDocumentEvent.END_PAGE, new FooterEventHandler(usuario.getNombreCompleto(), fechaGeneracionStr));

            // Generar logo e insertarlo
            byte[] logoBytes = obtenerLogoFarmacia();
            ImageData logoData = ImageDataFactory.create(logoBytes);
            Image logoImage = new Image(logoData).scaleToFit(50, 50);

            // 2. Procesar según el tipo de reporte
            if ("INVENTARIO".equalsIgnoreCase(tipo)) {
                generarReporteInventario(document, logoImage, usuario, fechaInicio, fechaFin);
            } else if ("PERDIDAS".equalsIgnoreCase(tipo)) {
                if (fechaInicio == null || fechaFin == null) {
                    throw new BusinessException("El rango de fechas es obligatorio para el reporte de pérdidas.");
                }
                generarReportePerdidas(document, logoImage, usuario, fechaInicio, fechaFin);
            } else if ("ALERTAS".equalsIgnoreCase(tipo)) {
                generarReporteAlertas(document, logoImage, usuario);
            } else {
                throw new BusinessException("Tipo de reporte no soportado: " + tipo);
            }

            document.close();

            // 3. Guardar registro de auditoría automáticamente
            ExportacionReporte audit = ExportacionReporte.builder()
                    .usuarioId(usuarioId)
                    .tipoReporte(tipo.toUpperCase())
                    .fechaInicio(fechaInicio)
                    .fechaFin(fechaFin)
                    .build();
            exportacionRepo.save(audit);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error al generar el reporte PDF", e);
            throw new RuntimeException("Error interno al procesar el documento PDF: " + e.getMessage(), e);
        }

        return baos.toByteArray();
    }

    // =========================================================================
    // DETALLE REPORTE 1: INVENTARIO
    // =========================================================================

    private void generarReporteInventario(Document doc, Image logo, Usuario usuario, LocalDate inicio, LocalDate fin) throws Exception {
        // Consultar Lotes
        List<Lote> lotes = loteRepo.findLotesActivosConProducto();

        // Si se especifican fechas, filtrar lotes creados en ese rango
        if (inicio != null && fin != null) {
            lotes = lotes.stream()
                    .filter(l -> {
                        LocalDate regDate = l.getFechaRegistro().toLocalDate();
                        return !regDate.isBefore(inicio) && !regDate.isAfter(fin);
                    })
                    .toList();
        }

        if (lotes.isEmpty()) {
            throw new BusinessException("No se encontraron registros de inventario activo para los filtros seleccionados.");
        }

        // Diseñar encabezado
        crearCabeceraSeccion(doc, logo, "REPORTE DE INVENTARIO VALORIZADO", 
                "Visualización completa del stock disponible valorado por lote.", 
                inicio, fin);

        // Estadísticas
        long totalProductos = lotes.stream().map(l -> l.getProducto().getId()).distinct().count();
        long stockTotal = lotes.stream().mapToLong(Lote::getCantidad).sum();
        BigDecimal valorTotal = lotes.stream()
                .map(l -> l.getCostoUnitario().multiply(BigDecimal.valueOf(l.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tabla de resumen
        Table statsTable = new Table(3).useAllAvailableWidth().setMarginBottom(15);
        statsTable.addCell(crearTarjetaResumen("Total de Productos Únicos", String.valueOf(totalProductos)));
        statsTable.addCell(crearTarjetaResumen("Stock Total Disponible", String.valueOf(stockTotal)));
        statsTable.addCell(crearTarjetaResumen("Valor Total del Inventario", String.format("$%.2f", valorTotal.doubleValue())));
        doc.add(statsTable);

        // Generar Gráfico ABC
        Map<String, Integer> countsAbc = new LinkedHashMap<>();
        countsAbc.put("A", 0);
        countsAbc.put("B", 0);
        countsAbc.put("C", 0);
        for (Lote l : lotes) {
            String cat = l.getProducto().getClasificacionAbc() != null 
                    ? l.getProducto().getClasificacionAbc().name() : "C";
            countsAbc.put(cat, countsAbc.getOrDefault(cat, 0) + 1);
        }

        DefaultPieDataset dataset = new DefaultPieDataset();
        countsAbc.forEach((k, v) -> {
            if (v > 0) dataset.setValue("Categoría " + k + " (" + v + ")", v);
        });

        JFreeChart chart = ChartFactory.createPieChart("Clasificación ABC de Productos", dataset, true, true, false);
        chart.setBackgroundPaint(java.awt.Color.WHITE);
        org.jfree.chart.plot.PiePlot plot = (org.jfree.chart.plot.PiePlot) chart.getPlot();
        plot.setBackgroundPaint(java.awt.Color.WHITE);
        plot.setOutlineVisible(false);
        plot.setSectionPaint("Categoría A", new Color(46, 117, 89));
        plot.setSectionPaint("Categoría B", new Color(230, 162, 60));
        plot.setSectionPaint("Categoría C", new Color(144, 147, 153));

        BufferedImage bufImg = chart.createBufferedImage(500, 250);
        ByteArrayOutputStream chartStream = new ByteArrayOutputStream();
        ImageIO.write(bufImg, "png", chartStream);
        ImageData chartData = ImageDataFactory.create(chartStream.toByteArray());
        Image chartImg = new Image(chartData).setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER).setMarginBottom(15);
        doc.add(chartImg);

        // Tabla Principal
        float[] columnWidths = {1.2f, 3f, 1.2f, 1.5f, 1.8f, 1.2f, 1.5f, 1.6f};
        Table table = new Table(columnWidths).useAllAvailableWidth();

        // Cabeceras de tabla
        String[] headers = {"Código", "Medicamento", "Cat. ABC", "Lote", "Vencimiento", "Stock", "P. Unitario", "Valor Total"};
        for (String header : headers) {
            table.addHeaderCell(new Cell().add(new Paragraph(header))
                    .setBackgroundColor(COLOR_PRIMARIO)
                    .setFontColor(ColorConstants.WHITE)
                    .setBold()
                    .setFontSize(8)
                    .setTextAlignment(TextAlignment.CENTER));
        }

        for (Lote l : lotes) {
            Producto p = l.getProducto();
            BigDecimal subtotal = l.getCostoUnitario().multiply(BigDecimal.valueOf(l.getCantidad()));
            String dateStr = l.getFechaVencimiento().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            String catAbc = p.getClasificacionAbc() != null ? p.getClasificacionAbc().name() : "C";

            table.addCell(new Cell().add(new Paragraph(String.valueOf(p.getId()))).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
            table.addCell(new Cell().add(new Paragraph(p.getNombre())).setFontSize(8));
            table.addCell(new Cell().add(new Paragraph(catAbc)).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
            table.addCell(new Cell().add(new Paragraph(l.getNumeroLote())).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
            table.addCell(new Cell().add(new Paragraph(dateStr)).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(l.getCantidad()))).setFontSize(8).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(new Cell().add(new Paragraph(String.format("$%.2f", l.getCostoUnitario().doubleValue()))).setFontSize(8).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(new Cell().add(new Paragraph(String.format("$%.2f", subtotal.doubleValue()))).setFontSize(8).setBold().setTextAlignment(TextAlignment.RIGHT));
        }

        doc.add(table);
    }

    // =========================================================================
    // DETALLE REPORTE 2: PÉRDIDAS POR CADUCIDAD
    // =========================================================================

    private void generarReportePerdidas(Document doc, Image logo, Usuario usuario, LocalDate inicio, LocalDate fin) throws Exception {
        OffsetDateTime desde = inicio.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime hasta = fin.atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);

        List<MovimientoInventario> movimientos = movimientoRepo.findByTipoYFechaRange(
                TipoMovimiento.baja_vencimiento, desde, hasta);

        if (movimientos.isEmpty()) {
            throw new BusinessException("No existen registros de pérdidas por vencimiento en el rango de fechas seleccionado.");
        }

        crearCabeceraSeccion(doc, logo, "REPORTE DE PÉRDIDAS POR VENCIMIENTO", 
                "Detalle de medicamentos desechados debido a expiración en el rango seleccionado.", 
                inicio, fin);

        // Cálculos
        long totalUnidadesPerdidas = movimientos.stream().mapToLong(MovimientoInventario::getCantidad).sum();
        BigDecimal perdidaEconomicaTotal = movimientos.stream()
                .map(m -> m.getCostoUnitario().multiply(BigDecimal.valueOf(m.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Tarjetas
        Table statsTable = new Table(2).useAllAvailableWidth().setMarginBottom(15);
        statsTable.addCell(crearTarjetaResumen("Total Unidades Perdidas", String.valueOf(totalUnidadesPerdidas)));
        statsTable.addCell(crearTarjetaResumen("Pérdida Económica Total", String.format("$%.2f", perdidaEconomicaTotal.doubleValue())));
        doc.add(statsTable);

        // Generar Gráfico de Barras por Período
        Map<String, Double> perdidasPorPeriodo = new LinkedHashMap<>();
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
        for (MovimientoInventario m : movimientos) {
            String periodo = m.getFechaHora().format(monthFormatter);
            double valor = m.getCostoUnitario().multiply(BigDecimal.valueOf(m.getCantidad())).doubleValue();
            perdidasPorPeriodo.put(periodo, perdidasPorPeriodo.getOrDefault(periodo, 0.0) + valor);
        }

        DefaultCategoryDataset dataset = new DefaultCategoryDataset();
        perdidasPorPeriodo.forEach((k, v) -> dataset.addValue(v, "Pérdidas ($)", k));

        JFreeChart chart = ChartFactory.createBarChart("Pérdida Económica por Mes", "Mes", "Pérdida ($)", dataset, 
                PlotOrientation.VERTICAL, false, true, false);
        chart.setBackgroundPaint(java.awt.Color.WHITE);
        CategoryPlot plot = (CategoryPlot) chart.getPlot();
        plot.setBackgroundPaint(java.awt.Color.WHITE);
        plot.setRangeGridlinePaint(java.awt.Color.LIGHT_GRAY);
        BarRenderer renderer = (BarRenderer) plot.getRenderer();
        renderer.setSeriesPaint(0, new Color(217, 83, 79)); // Rojo suave

        BufferedImage bufImg = chart.createBufferedImage(500, 250);
        ByteArrayOutputStream chartStream = new ByteArrayOutputStream();
        ImageIO.write(bufImg, "png", chartStream);
        ImageData chartData = ImageDataFactory.create(chartStream.toByteArray());
        Image chartImg = new Image(chartData).setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER).setMarginBottom(15);
        doc.add(chartImg);

        // Tabla Principal
        float[] columnWidths = {3.5f, 1.8f, 1.8f, 1.5f, 1.8f, 2f};
        Table table = new Table(columnWidths).useAllAvailableWidth();

        String[] headers = {"Medicamento", "Lote", "Fecha Vencimiento", "Cant. Perdida", "Costo Unitario", "Total Perdido"};
        for (String header : headers) {
            table.addHeaderCell(new Cell().add(new Paragraph(header))
                    .setBackgroundColor(COLOR_PRIMARIO)
                    .setFontColor(ColorConstants.WHITE)
                    .setBold()
                    .setFontSize(8)
                    .setTextAlignment(TextAlignment.CENTER));
        }

        for (MovimientoInventario m : movimientos) {
            BigDecimal totalPerdido = m.getCostoUnitario().multiply(BigDecimal.valueOf(m.getCantidad()));
            String vDateStr = m.getLote().getFechaVencimiento().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));

            table.addCell(new Cell().add(new Paragraph(m.getProducto().getNombre())).setFontSize(8));
            table.addCell(new Cell().add(new Paragraph(m.getLote().getNumeroLote())).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
            table.addCell(new Cell().add(new Paragraph(vDateStr)).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
            table.addCell(new Cell().add(new Paragraph(String.valueOf(m.getCantidad()))).setFontSize(8).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(new Cell().add(new Paragraph(String.format("$%.2f", m.getCostoUnitario().doubleValue()))).setFontSize(8).setTextAlignment(TextAlignment.RIGHT));
            table.addCell(new Cell().add(new Paragraph(String.format("$%.2f", totalPerdido.doubleValue()))).setFontSize(8).setBold().setTextAlignment(TextAlignment.RIGHT));
        }

        doc.add(table);
    }

    // =========================================================================
    // DETALLE REPORTE 3: ALERTAS DE INVENTARIO
    // =========================================================================

    private void generarReporteAlertas(Document doc, Image logo, Usuario usuario) throws Exception {
        LocalDate hoy = LocalDate.now();

        // Sección A: Próximos a vencer (Lotes activos con vencimiento <= hoy + 30 días)
        List<Lote> vencimientosProximos = loteRepo.findLotesActivosConVencimientoProximo(hoy.plusDays(30));

        // Sección B: Productos con stock bajo (stockTotal <= stockMinimo)
        List<Producto> stockBajo = productoRepo.findProductosStockCriticoSinPaginar();

        if (vencimientosProximos.isEmpty() && stockBajo.isEmpty()) {
            throw new BusinessException("No existen alertas activas de vencimiento o stock bajo en este momento.");
        }

        crearCabeceraSeccion(doc, logo, "REPORTE CONTROL DE ALERTAS CRÍTICAS", 
                "Monitoreo activo de lotes próximos a vencer y productos con stock insuficiente.", 
                null, null);

        // Tarjetas
        Table statsTable = new Table(2).useAllAvailableWidth().setMarginBottom(15);
        statsTable.addCell(crearTarjetaResumen("Alertas por Vencimiento", String.valueOf(vencimientosProximos.size())));
        statsTable.addCell(crearTarjetaResumen("Alertas por Stock Bajo", String.valueOf(stockBajo.size())));
        doc.add(statsTable);

        // Gráfico Circular de Alertas
        DefaultPieDataset dataset = new DefaultPieDataset();
        if (!vencimientosProximos.isEmpty()) dataset.setValue("Próximos a Vencer (" + vencimientosProximos.size() + ")", vencimientosProximos.size());
        if (!stockBajo.isEmpty()) dataset.setValue("Stock Bajo (" + stockBajo.size() + ")", stockBajo.size());

        JFreeChart chart = ChartFactory.createPieChart("Distribución de Alertas Críticas", dataset, true, true, false);
        chart.setBackgroundPaint(java.awt.Color.WHITE);
        org.jfree.chart.plot.PiePlot plot = (org.jfree.chart.plot.PiePlot) chart.getPlot();
        plot.setBackgroundPaint(java.awt.Color.WHITE);
        plot.setOutlineVisible(false);
        plot.setSectionPaint("Próximos a Vencer", new Color(230, 162, 60)); // Naranja
        plot.setSectionPaint("Stock Bajo", new Color(217, 83, 79)); // Rojo

        BufferedImage bufImg = chart.createBufferedImage(500, 250);
        ByteArrayOutputStream chartStream = new ByteArrayOutputStream();
        ImageIO.write(bufImg, "png", chartStream);
        ImageData chartData = ImageDataFactory.create(chartStream.toByteArray());
        Image chartImg = new Image(chartData).setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER).setMarginBottom(15);
        doc.add(chartImg);

        // SECCIÓN A: TABLA DE PRÓXIMOS A VENCER
        doc.add(new Paragraph("SECCIÓN A: PRODUCTOS PRÓXIMOS A VENCER (<= 30 DÍAS)")
                .setBold()
                .setFontSize(10)
                .setFontColor(COLOR_PRIMARIO)
                .setMarginBottom(5));

        if (vencimientosProximos.isEmpty()) {
            doc.add(new Paragraph("No se registran productos próximos a vencer en el período configurado.").setFontSize(8).setItalic().setMarginBottom(15));
        } else {
            float[] colWidthsA = {4.5f, 2f, 2.5f, 2f};
            Table tableA = new Table(colWidthsA).useAllAvailableWidth().setMarginBottom(15);

            String[] headersA = {"Medicamento", "Lote", "Fecha Vencimiento", "Días Restantes"};
            for (String header : headersA) {
                tableA.addHeaderCell(new Cell().add(new Paragraph(header))
                        .setBackgroundColor(COLOR_PRIMARIO)
                        .setFontColor(ColorConstants.WHITE)
                        .setBold()
                        .setFontSize(8)
                        .setTextAlignment(TextAlignment.CENTER));
            }

            for (Lote l : vencimientosProximos) {
                long diasRestantes = ChronoUnit.DAYS.between(hoy, l.getFechaVencimiento());
                String expDate = l.getFechaVencimiento().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                
                tableA.addCell(new Cell().add(new Paragraph(l.getProducto().getNombre())).setFontSize(8));
                tableA.addCell(new Cell().add(new Paragraph(l.getNumeroLote())).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
                tableA.addCell(new Cell().add(new Paragraph(expDate)).setFontSize(8).setTextAlignment(TextAlignment.CENTER));
                
                Cell daysCell = new Cell().add(new Paragraph(diasRestantes + " días")).setFontSize(8).setTextAlignment(TextAlignment.CENTER);
                if (diasRestantes <= 7) {
                    daysCell.setFontColor(ColorConstants.RED).setBold();
                } else if (diasRestantes <= 15) {
                    daysCell.setFontColor(new DeviceRgb(200, 120, 0)).setBold();
                }
                tableA.addCell(daysCell);
            }
            doc.add(tableA);
        }

        // SECCIÓN B: TABLA DE STOCK BAJO
        doc.add(new Paragraph("SECCIÓN B: PRODUCTOS CON STOCK BAJO (INSUFICIENTE)")
                .setBold()
                .setFontSize(10)
                .setFontColor(COLOR_PRIMARIO)
                .setMarginBottom(5));

        if (stockBajo.isEmpty()) {
            doc.add(new Paragraph("No se registran productos con stock por debajo del mínimo.").setFontSize(8).setItalic());
        } else {
            float[] colWidthsB = {5f, 2.5f, 2.5f};
            Table tableB = new Table(colWidthsB).useAllAvailableWidth();

            String[] headersB = {"Medicamento", "Stock Actual", "Stock Mínimo"};
            for (String header : headersB) {
                tableB.addHeaderCell(new Cell().add(new Paragraph(header))
                        .setBackgroundColor(COLOR_PRIMARIO)
                        .setFontColor(ColorConstants.WHITE)
                        .setBold()
                        .setFontSize(8)
                        .setTextAlignment(TextAlignment.CENTER));
            }

            for (Producto p : stockBajo) {
                tableB.addCell(new Cell().add(new Paragraph(p.getNombre())).setFontSize(8));
                tableB.addCell(new Cell().add(new Paragraph(String.valueOf(p.getStockTotal()))).setFontSize(8).setTextAlignment(TextAlignment.RIGHT).setBold().setFontColor(ColorConstants.RED));
                tableB.addCell(new Cell().add(new Paragraph(String.valueOf(p.getStockMinimo()))).setFontSize(8).setTextAlignment(TextAlignment.RIGHT));
            }
            doc.add(tableB);
        }
    }

    // =========================================================================
    // MÉTODOS AUXILIARES Y DIBUJO DE INTERFAZ DEL PDF
    // =========================================================================

    private void crearCabeceraSeccion(Document doc, Image logo, String titulo, String descripcion, LocalDate inicio, LocalDate fin) {
        Table headerTable = new Table(new float[]{1.5f, 8.5f}).useAllAvailableWidth().setMarginBottom(15);
        headerTable.setBorder(Border.NO_BORDER);

        Cell logoCell = new Cell().add(logo)
                .setBorder(Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);
        headerTable.addCell(logoCell);

        Cell titleCell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setVerticalAlignment(VerticalAlignment.MIDDLE);
        titleCell.add(new Paragraph("FARMACIA CRISTO REDENTOR")
                .setFontSize(10)
                .setBold()
                .setFontColor(COLOR_PRIMARIO)
                .setMargin(0));
        titleCell.add(new Paragraph(titulo)
                .setFontSize(16)
                .setBold()
                .setFontColor(COLOR_TEXTO_OSCURO)
                .setMargin(0));
        titleCell.add(new Paragraph(descripcion)
                .setFontSize(8)
                .setFontColor(ColorConstants.GRAY)
                .setMargin(0));

        if (inicio != null && fin != null) {
            titleCell.add(new Paragraph(String.format("Período: %s al %s", 
                    inicio.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), 
                    fin.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))))
                    .setFontSize(8)
                    .setItalic()
                    .setFontColor(COLOR_TEXTO_OSCURO)
                    .setMarginTop(2));
        }
        headerTable.addCell(titleCell);
        
        doc.add(headerTable);

        // Línea divisoria decorativa
        Table divider = new Table(1).useAllAvailableWidth().setMarginBottom(15);
        Cell dividerCell = new Cell().setBorder(new SolidBorder(COLOR_PRIMARIO, 1f));
        divider.addCell(dividerCell);
        doc.add(divider);
    }

    private Cell crearTarjetaResumen(String label, String value) {
        Cell cell = new Cell();
        cell.setBackgroundColor(COLOR_SECUNDARIO);
        cell.setBorder(new SolidBorder(new DeviceRgb(220, 224, 230), 1f));
        cell.setPadding(8);
        cell.setTextAlignment(TextAlignment.CENTER);
        
        cell.add(new Paragraph(label)
                .setFontSize(7)
                .setFontColor(ColorConstants.GRAY)
                .setMargin(0));
        cell.add(new Paragraph(value)
                .setFontSize(12)
                .setBold()
                .setFontColor(COLOR_PRIMARIO)
                .setMargin(0));
        
        return cell;
    }

    private byte[] generarLogoFarmacia() throws Exception {
        int size = 120;
        BufferedImage img = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2 = img.createGraphics();

        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        // Fondo transparente
        g2.setBackground(new java.awt.Color(0, 0, 0, 0));
        g2.clearRect(0, 0, size, size);

        // Círculo base de color verde
        g2.setColor(new java.awt.Color(46, 117, 89));
        g2.fillOval(10, 10, size - 20, size - 20);

        // Borde decorativo
        g2.setColor(new java.awt.Color(240, 248, 255, 80));
        g2.setStroke(new java.awt.BasicStroke(3));
        g2.drawOval(15, 15, size - 30, size - 30);

        // Cruz Farmacéutica Blanca
        g2.setColor(Color.WHITE);
        int thickness = 22;
        int length = 68;
        // Barra horizontal
        g2.fillRect((size - length) / 2, (size - thickness) / 2, length, thickness);
        // Barra vertical
        g2.fillRect((size - thickness) / 2, (size - length) / 2, thickness, length);

        g2.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, "png", baos);
        return baos.toByteArray();
    }

    private byte[] obtenerLogoFarmacia() {
        try {
            java.io.File file = new java.io.File("d:/Cato/Quinto semestre/sisinfo/SisInfo_Farmacia/frontend/my-app/public/Logo.png");
            if (file.exists()) {
                return java.nio.file.Files.readAllBytes(file.toPath());
            }
        } catch (Exception e) {
            log.warn("No se pudo cargar el logo desde el frontend: {}. Usando logo dinámico.", e.getMessage());
        }
        // Fallback al logo dinámico en memoria
        try {
            return generarLogoFarmacia();
        } catch (Exception e) {
            log.error("No se pudo generar el logo fallback", e);
            return new byte[0];
        }
    }

    // =========================================================================
    // EVENT HANDLER PARA PIE DE PÁGINA RECURRENTE (iText 7)
    // =========================================================================

    private static class FooterEventHandler implements IEventHandler {
        private final String usuario;
        private final String fechaGeneracion;

        public FooterEventHandler(String usuario, String fechaGeneracion) {
            this.usuario = usuario;
            this.fechaGeneracion = fechaGeneracion;
        }

        @Override
        public void handleEvent(Event event) {
            PdfDocumentEvent docEvent = (PdfDocumentEvent) event;
            PdfDocument pdfDoc = docEvent.getDocument();
            PdfPage page = docEvent.getPage();
            int pageNumber = pdfDoc.getPageNumber(page);

            Rectangle pageSize = page.getPageSize();
            PdfCanvas pdfCanvas = new PdfCanvas(page.newContentStreamBefore(), page.getResources(), pdfDoc);
            
            // Línea divisoria por encima del pie
            pdfCanvas.setStrokeColor(ColorConstants.LIGHT_GRAY)
                     .setLineWidth(0.5f)
                     .moveTo(36, 42)
                     .lineTo(pageSize.getWidth() - 36, 42)
                     .stroke();

            // Texto de pie de página
            String footerText = String.format("Página %d   |   Usuario: %s   |   Generado: %s   |   Farmacia Cristo Redentor",
                    pageNumber, usuario, fechaGeneracion);

            Canvas canvas = new Canvas(pdfCanvas, pageSize);
            canvas.showTextAligned(
                new Paragraph(footerText)
                    .setFontSize(7)
                    .setFontColor(ColorConstants.GRAY),
                pageSize.getWidth() / 2, 24, TextAlignment.CENTER
            );
            canvas.close();
        }
    }
}