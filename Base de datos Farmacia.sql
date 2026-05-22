-- =============================================================================
-- SISTEMA DE GESTIÓN DE INVENTARIOS — FARMACIA CRISTO REDENTOR
-- SCRIPT DEFINITIVO v5.1
-- Motor: PostgreSQL 15+ (puro, sin dependencias de Supabase auth)
-- Arquitectura: Cliente-Servidor
-- Fecha: Mayo 2026
-- =============================================================================


-- =============================================================================
-- 0. SCHEMA
-- =============================================================================
CREATE SCHEMA IF NOT EXISTS farmacia;
SET search_path = farmacia;


-- =============================================================================
-- 2. TABLA DE CONFIGURACIÓN DEL SISTEMA
-- =============================================================================
CREATE TABLE configuracion_sistema (
    clave        VARCHAR(80)    PRIMARY KEY,
    valor        numeric(100)   NOT NULL,
    descripcion  VARCHAR(300)   NOT NULL,
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()

);

COMMENT ON TABLE configuracion_sistema IS
    'Parámetros de negocio externalizados. Modificar aquí, nunca en las funciones.';

INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
    ('abc_umbral_a',           80, 'Porcentaje acumulado máximo para clasificación A (ej: 80 = 80%)'),
    ('abc_umbral_b',           95, 'Porcentaje acumulado máximo para clasificación B (ej: 95 = 95%)'),
    ('alerta_dias_rojo',       7,  'Días para vencimiento que dispara alerta roja (máxima urgencia)'),
    ('alerta_dias_amarillo',   15,  'Días para vencimiento que dispara alerta amarilla'),
    ('alerta_dias_verde',      30,  'Días para vencimiento que dispara alerta verde (aviso temprano)'),
    ('login_intentos_max',     5,  'Intentos fallidos de login antes de bloquear la cuenta'),
    ('login_bloqueo_minutos',  15,  'Minutos que permanece bloqueada una cuenta tras superar intentos_max');


-- =============================================================================
-- 4. TABLAS PRINCIPALES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 4.01 USUARIO
-- -----------------------------------------------------------------------------
CREATE TABLE usuario (
    id               BIGSERIAL          PRIMARY KEY,
    nombre_completo  VARCHAR(150)    NOT NULL,
    password_hash    VARCHAR(255)    NOT NULL,
    rol              VARCHAR(20)     NOT NULL,
    activo           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    telefono         VARCHAR(30),
    email            varchar(150)    NOT NULL,

      CONSTRAINT uq_usuario_email UNIQUE (email),

    CONSTRAINT ck_usuario_rol
        CHECK (rol IN ('ADMINISTRADOR', 'OPERADOR')),

    CONSTRAINT ck_usuario_password_hash_len
        CHECK (LENGTH(password_hash) >= 60)
);

COMMENT ON TABLE  usuario              IS 'Personal de la farmacia con acceso al sistema.';
COMMENT ON COLUMN usuario.password_hash IS 'Hash bcrypt generado por la app. Nunca texto plano.';


-- -----------------------------------------------------------------------------
-- 4.02 CATEGORIA
-- -----------------------------------------------------------------------------
CREATE TABLE categoria (
    id           BIGSERIAL          PRIMARY KEY,
    nombre       VARCHAR(100)    NOT NULL,
    descripcion  VARCHAR(255),
    activo       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_categoria_nombre UNIQUE (nombre)
);

COMMENT ON TABLE categoria IS 'Agrupación terapéutica o funcional (Antibióticos, Analgésicos, etc.).';


-- -----------------------------------------------------------------------------
-- 4.03 PROVEEDOR
-- -----------------------------------------------------------------------------
CREATE TABLE proveedor (
    id               BIGSERIAL          PRIMARY KEY,
    nombre           VARCHAR(150)    NOT NULL,
    contacto_nombre  VARCHAR(100),
    telefono         VARCHAR(30),
    correo           VARCHAR(100),
    direccion        VARCHAR(250),
    activo           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_proveedor_nombre UNIQUE (nombre),
    

    CONSTRAINT ck_proveedor_correo
        CHECK (
            correo IS NULL
            OR correo ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'
        )
);

COMMENT ON TABLE proveedor IS 'Laboratorios y distribuidores que suministran productos.';


-- -----------------------------------------------------------------------------
-- 4.04 PRODUCTO
-- -----------------------------------------------------------------------------
CREATE TABLE producto (
    id                BIGSERIAL          PRIMARY KEY,
    nombre            VARCHAR(150)    NOT NULL,
    categoria_id      INTEGER         NOT NULL,
    laboratorio       VARCHAR(100)    NOT NULL,
    concentracion     VARCHAR(50),
    presentacion      VARCHAR(80),
    precio_costo      NUMERIC(10,2)   NOT NULL,
    precio_venta      NUMERIC(10,2)   NOT NULL,
    stock_minimo      INTEGER         NOT NULL DEFAULT 0,
    stock_maximo      INTEGER,
    clasificacion_abc CHAR(1),
    stock_total       INTEGER         NOT NULL DEFAULT 0,
    dias_minimos_venta INTEGER DEFAULT NULL,
    activo            BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (categoria_id) REFERENCES categoria (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT ck_producto_dias_minimos_venta 
        CHECK (dias_minimos_venta IS NULL OR dias_minimos_venta > 0),

    CONSTRAINT ck_producto_precio_costo    CHECK (precio_costo > 0),
    CONSTRAINT ck_producto_precio_venta    CHECK (precio_venta > 0),
    CONSTRAINT ck_producto_precio_margen   CHECK (precio_venta >= precio_costo),
    CONSTRAINT ck_producto_stock_minimo    CHECK (stock_minimo >= 0),
    CONSTRAINT ck_producto_stock_total     CHECK (stock_total >= 0),
    CONSTRAINT ck_producto_stock_maximo    CHECK (stock_maximo IS NULL OR stock_maximo > stock_minimo),
    CONSTRAINT ck_producto_clasificacion_abc
        CHECK (clasificacion_abc IS NULL OR clasificacion_abc IN ('A', 'B', 'C'))
);

COMMENT ON COLUMN producto.precio_costo  IS 'Precio de referencia del catálogo. El costo real por compra está en lote.costo_unitario.';
COMMENT ON COLUMN producto.stock_maximo  IS 'Límite superior de reabastecimiento. Opcional.';
COMMENT ON COLUMN producto.stock_minimo  IS 'Umbral de alerta. stock_total <= stock_minimo dispara alerta crítica.';
COMMENT ON COLUMN producto.dias_minimos_venta IS
    'Días mínimos antes del vencimiento para permitir la venta. '
    'NULL = sin restricción (insumos, cuidado personal, etc.).';


-- -----------------------------------------------------------------------------
-- 4.05 PRODUCTO_PROVEEDOR
-- -----------------------------------------------------------------------------
CREATE TABLE producto_proveedor (
    producto_id   INTEGER     NOT NULL,
    proveedor_id  INTEGER     NOT NULL,
    es_principal  BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pk_producto_proveedor PRIMARY KEY (producto_id, proveedor_id),

    CONSTRAINT fk_pp_producto
        FOREIGN KEY (producto_id)  REFERENCES producto  (id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_pp_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedor (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON COLUMN producto_proveedor.es_principal IS 'TRUE = proveedor preferido. Solo uno por producto.';

CREATE UNIQUE INDEX uq_pp_producto_principal
    ON producto_proveedor (producto_id)
    WHERE es_principal = TRUE;


-- -----------------------------------------------------------------------------
-- 4.06 ORDEN_COMPRA
-- Estados: borrador → emitida → recibida | recibida_parcial | cancelada
-- -----------------------------------------------------------------------------
CREATE TABLE orden_compra (
    id              BIGSERIAL          PRIMARY KEY,
    proveedor_id    INTEGER         NOT NULL,
    usuario_id      INTEGER         NOT NULL,
    estado          VARCHAR(20)     NOT NULL DEFAULT 'borrador',
    fecha_emision   TIMESTAMPTZ,
    fecha_recepcion TIMESTAMPTZ,
    monto_total     NUMERIC(12,2),
    notas           VARCHAR(500),
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_oc_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedor (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_oc_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT ck_oc_estado
        CHECK (estado IN ('borrador', 'emitida', 'recibida', 'recibida_parcial', 'cancelada')),

    CONSTRAINT ck_oc_monto_total
        CHECK (monto_total IS NULL OR monto_total >= 0),

    CONSTRAINT ck_oc_fecha_emision
        CHECK (
            (estado = 'borrador' AND fecha_emision IS NULL)
            OR (estado IN ('emitida','recibida','recibida_parcial','cancelada')
                AND fecha_emision IS NOT NULL)
        ),

    CONSTRAINT ck_oc_fecha_recepcion
        CHECK (
            (estado IN ('recibida','recibida_parcial') AND fecha_recepcion IS NOT NULL)
            OR (estado IN ('borrador','emitida','cancelada') AND fecha_recepcion IS NULL)
        )
);

COMMENT ON COLUMN orden_compra.estado IS
    'borrador: en preparación. emitida: enviada al proveedor. '
    'recibida: todos los ítems recepcionados. recibida_parcial: recibida con diferencias. '
    'cancelada: anulada (solo desde borrador o emitida).';


-- -----------------------------------------------------------------------------
-- 4.07 ORDEN_COMPRA_DETALLE
-- -----------------------------------------------------------------------------
CREATE TABLE orden_compra_detalle (
    id                  BIGSERIAL          PRIMARY KEY,
    orden_compra_id     INTEGER         NOT NULL,
    producto_id         INTEGER         NOT NULL,
    cantidad_solicitada INTEGER         NOT NULL,
    costo_unitario      NUMERIC(10,2),
    cantidad_recibida   INTEGER         NOT NULL DEFAULT 0,

    CONSTRAINT fk_ocd_orden_compra
        FOREIGN KEY (orden_compra_id) REFERENCES orden_compra (id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_ocd_producto
        FOREIGN KEY (producto_id) REFERENCES producto (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT uq_ocd_orden_producto
        UNIQUE (orden_compra_id, producto_id),

    CONSTRAINT ck_ocd_cantidad_solicitada  CHECK (cantidad_solicitada > 0),
    CONSTRAINT ck_ocd_costo                CHECK (costo_unitario IS NULL OR costo_unitario > 0),
    CONSTRAINT ck_ocd_cantidad_recibida    CHECK (cantidad_recibida >= 0)
);

COMMENT ON COLUMN orden_compra_detalle.cantidad_recibida IS
    'Actualizado al recepcionar. Permite rastrear diferencias con cantidad_solicitada.';
COMMENT ON COLUMN orden_compra_detalle.costo_unitario IS
    'Puede ser NULL en borrador. Obligatorio antes de emitir la orden.';


-- -----------------------------------------------------------------------------
-- 4.08 LOTE
-- -----------------------------------------------------------------------------
CREATE TABLE lote (
    id                  BIGSERIAL          PRIMARY KEY,
    producto_id         INTEGER         NOT NULL,
    numero_lote         VARCHAR(50)     NOT NULL,
    cantidad            INTEGER         NOT NULL DEFAULT 0,
    fecha_vencimiento   DATE            NOT NULL,
    costo_unitario      NUMERIC(10,2)   NOT NULL,
    estado              VARCHAR(10)     NOT NULL DEFAULT 'activo',
    orden_compra_id     INTEGER,
    fecha_registro      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    fecha_baja          TIMESTAMPTZ,
    motivo_baja         VARCHAR(200),

    CONSTRAINT fk_lote_producto
        FOREIGN KEY (producto_id) REFERENCES producto (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_lote_orden_compra
        FOREIGN KEY (orden_compra_id) REFERENCES orden_compra (id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT uq_lote_producto_numero
        UNIQUE (producto_id, numero_lote),

    CONSTRAINT ck_lote_cantidad       CHECK (cantidad >= 0),
    CONSTRAINT ck_lote_costo          CHECK (costo_unitario > 0),
    CONSTRAINT ck_lote_estado         CHECK (estado IN ('activo', 'agotado', 'vencido')),

    CONSTRAINT ck_lote_numero_nonempty
        CHECK (LENGTH(TRIM(numero_lote)) > 0),

    CONSTRAINT ck_lote_estado_consistente
        CHECK (
            (estado IN ('activo', 'agotado')
                AND fecha_baja   IS NULL
                AND motivo_baja  IS NULL)
            OR
            (estado = 'vencido'
                AND fecha_baja   IS NOT NULL
                AND motivo_baja  IS NOT NULL)
        )
);

COMMENT ON COLUMN lote.estado      IS 'activo: con stock disponible. agotado: cantidad=0 por consumo. vencido: expirado, con fecha_baja y motivo_baja.';
COMMENT ON COLUMN lote.fecha_baja  IS 'Obligatorio cuando estado=vencido. NULL para activo y agotado.';
COMMENT ON COLUMN lote.motivo_baja IS 'Obligatorio cuando estado=vencido.';
COMMENT ON COLUMN lote.costo_unitario IS 'Costo real de compra. Usado en cálculo ABC y valorización.';


-- -----------------------------------------------------------------------------
-- 4.09 MOVIMIENTO_INVENTARIO
-- -----------------------------------------------------------------------------
CREATE TABLE movimiento_inventario (
    id               BIGSERIAL          PRIMARY KEY,
    lote_id          INTEGER         NOT NULL,
    producto_id      INTEGER         NOT NULL,
    tipo_movimiento  VARCHAR(25)     NOT NULL,
    cantidad         INTEGER         NOT NULL,
    costo_unitario   NUMERIC(10,2),
    motivo           VARCHAR(255),
    usuario_id       INTEGER         NOT NULL,
    proveedor_id     INTEGER,
    orden_compra_id  INTEGER,
    referencia_id    INTEGER,
    fecha_hora       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_mi_lote
        FOREIGN KEY (lote_id)      REFERENCES lote     (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_mi_producto
        FOREIGN KEY (producto_id)  REFERENCES producto (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_mi_usuario
        FOREIGN KEY (usuario_id)   REFERENCES usuario  (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_mi_proveedor
        FOREIGN KEY (proveedor_id) REFERENCES proveedor (id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_mi_orden_compra
        FOREIGN KEY (orden_compra_id) REFERENCES orden_compra (id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT ck_mi_tipo_movimiento
        CHECK (tipo_movimiento IN (
            'entrada', 'entrada_directa',
            'salida',
            'ajuste_entrada', 'ajuste_salida',
            'devolucion_cliente', 'devolucion_proveedor',
            'baja_vencimiento'
        )),

    CONSTRAINT ck_mi_cantidad CHECK (cantidad != 0),

    CONSTRAINT ck_mi_motivo_requerido
        CHECK (
            tipo_movimiento IN ('entrada', 'entrada_directa', 'salida')
            OR (motivo IS NOT NULL AND LENGTH(TRIM(motivo)) > 0)
        ),

    CONSTRAINT ck_mi_entrada_requiere_orden
        CHECK (
            tipo_movimiento != 'entrada'
            OR orden_compra_id IS NOT NULL
        ),

    CONSTRAINT ck_mi_devolucion_cliente_referencia
        CHECK (
            tipo_movimiento != 'devolucion_cliente'
            OR referencia_id IS NOT NULL
        )
);

COMMENT ON TABLE  movimiento_inventario IS
    'Registro histórico inmutable. Sin UPDATE ni DELETE. '
    'Correcciones: registrar movimiento de ajuste contrapuesto.';
COMMENT ON COLUMN movimiento_inventario.referencia_id IS
    'En devolucion_cliente: id del movimiento de salida que se revierte. '
    'En devolucion_proveedor: id de la orden de compra de referencia.';
COMMENT ON COLUMN movimiento_inventario.costo_unitario IS
    'Costo en el momento del movimiento. Para valorización y ABC histórico.';


-- -----------------------------------------------------------------------------
-- 4.10 RECEPCION_MERCADERIA
-- -----------------------------------------------------------------------------
CREATE TABLE recepcion_mercaderia (
    id               BIGSERIAL          PRIMARY KEY,
    orden_compra_id  INTEGER         NOT NULL,
    usuario_id       INTEGER         NOT NULL,
    fecha_hora       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    observaciones    VARCHAR(500),

    CONSTRAINT fk_rm_orden_compra
        FOREIGN KEY (orden_compra_id) REFERENCES orden_compra (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_rm_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

COMMENT ON COLUMN recepcion_mercaderia.observaciones IS
    'Diferencias, daños, lotes rechazados, etc.';


-- -----------------------------------------------------------------------------
-- 4.11 RECEPCION_DETALLE
-- -----------------------------------------------------------------------------
CREATE TABLE recepcion_detalle (
    id                  BIGSERIAL          PRIMARY KEY,
    recepcion_id        INTEGER         NOT NULL,
    orden_detalle_id    INTEGER         NOT NULL,
    cantidad_recibida   INTEGER         NOT NULL,
    numero_lote         VARCHAR(50)     NOT NULL,
    fecha_vencimiento   DATE            NOT NULL,
    observacion_item    VARCHAR(300),

    CONSTRAINT fk_rd_recepcion
        FOREIGN KEY (recepcion_id)     REFERENCES recepcion_mercaderia (id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_rd_orden_detalle
        FOREIGN KEY (orden_detalle_id) REFERENCES orden_compra_detalle (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT ck_rd_cantidad_recibida   CHECK (cantidad_recibida > 0),
    CONSTRAINT ck_rd_numero_lote_nonempty
        CHECK (LENGTH(TRIM(numero_lote)) > 0)
);

COMMENT ON COLUMN recepcion_detalle.observacion_item IS
    'Notas del ítem: daño parcial, lote sospechoso, diferencia de cantidad, etc.';


-- -----------------------------------------------------------------------------
-- 4.12 ALERTA
-- -----------------------------------------------------------------------------
CREATE TABLE alerta (
    id                   BIGSERIAL          PRIMARY KEY,
    tipo                 VARCHAR(25)     NOT NULL,
    criticidad           VARCHAR(10)     NOT NULL,
    mensaje              VARCHAR(500)    NOT NULL,
    producto_id          INTEGER         NOT NULL,
    lote_id              bigint,
    leida                BOOLEAN         NOT NULL DEFAULT FALSE,
    usuario_gestiona_id  INTEGER,
    fecha_generacion     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    fecha_lectura        TIMESTAMPTZ,

    CONSTRAINT fk_alerta_producto
        FOREIGN KEY (producto_id) REFERENCES producto (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT fk_alerta_lote
        FOREIGN KEY (lote_id) REFERENCES lote (id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_alerta_usuario_gestiona
        FOREIGN KEY (usuario_gestiona_id) REFERENCES usuario (id)
        ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT ck_alerta_tipo
        CHECK (tipo IN (
            'vencimiento_rojo', 'vencimiento_amarillo', 'vencimiento_verde', 'stock_minimo'
        )),

    CONSTRAINT ck_alerta_criticidad
        CHECK (criticidad IN ('alta', 'media', 'baja')),

    CONSTRAINT ck_alerta_fecha_lectura
        CHECK (
            (leida = FALSE AND fecha_lectura IS NULL)
            OR (leida = TRUE  AND fecha_lectura IS NOT NULL)
        ),

    CONSTRAINT ck_alerta_gestiona_leida
        CHECK (leida = TRUE OR usuario_gestiona_id IS NULL),

    CONSTRAINT ck_alerta_lote_vencimiento
        CHECK (
            tipo = 'stock_minimo'
            OR (tipo LIKE 'vencimiento%' AND lote_id IS NOT NULL)
        )
);

CREATE UNIQUE INDEX uq_alerta_stock_minimo
    ON alerta (tipo, producto_id)
    WHERE tipo = 'stock_minimo' AND leida = FALSE;

CREATE UNIQUE INDEX uq_alerta_vencimiento
    ON alerta (tipo, lote_id)
    WHERE tipo LIKE 'vencimiento%' AND leida = FALSE;

COMMENT ON COLUMN alerta.leida IS
    'FALSE = activa en dashboard. TRUE = gestionada, permanece en historial.';


-- -----------------------------------------------------------------------------
-- 4.13 CLASIFICACION_ABC_HISTORIAL
-- -----------------------------------------------------------------------------
CREATE TABLE clasificacion_abc_historial (
    id               BIGSERIAL          PRIMARY KEY,
    fecha_calculo    TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    usuario_id       INTEGER         NOT NULL,
    total_productos  INTEGER         NOT NULL,
    valor_total_inv  NUMERIC(14,2),
    observaciones    VARCHAR(255),
    completado       BOOLEAN         NOT NULL DEFAULT FALSE,

    CONSTRAINT fk_cabc_h_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT ck_cabc_h_total CHECK (total_productos > 0)
);

COMMENT ON COLUMN clasificacion_abc_historial.completado IS
    'FALSE si el recálculo falló a mitad. Permite detectar ejecuciones parciales.';
COMMENT ON COLUMN clasificacion_abc_historial.valor_total_inv IS
    'Valor total del inventario en el momento del cálculo.';


-- -----------------------------------------------------------------------------
-- 4.14 CLASIFICACION_ABC_DETALLE
-- -----------------------------------------------------------------------------
CREATE TABLE clasificacion_abc_detalle (
    id                    BIGSERIAL          PRIMARY KEY,
    historial_id          INTEGER         NOT NULL,
    producto_id           INTEGER         NOT NULL,
    valor_inventario      NUMERIC(14,2)   NOT NULL,
    porcentaje_individual NUMERIC(6,3)    NOT NULL,
    porcentaje_acumulado  NUMERIC(6,3)    NOT NULL,
    clasificacion         CHAR(1)         NOT NULL,

    CONSTRAINT fk_cabc_d_historial
        FOREIGN KEY (historial_id) REFERENCES clasificacion_abc_historial (id)
        ON UPDATE CASCADE ON DELETE CASCADE,

    CONSTRAINT fk_cabc_d_producto
        FOREIGN KEY (producto_id) REFERENCES producto (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT uq_cabc_d_historial_producto
        UNIQUE (historial_id, producto_id),

    CONSTRAINT ck_cabc_d_clasificacion
        CHECK (clasificacion IN ('A', 'B', 'C')),

    CONSTRAINT ck_cabc_d_valor
        CHECK (valor_inventario >= 0),

    CONSTRAINT ck_cabc_d_pct_individual
        CHECK (porcentaje_individual >= 0 AND porcentaje_individual <= 100),

    CONSTRAINT ck_cabc_d_pct_acumulado
        CHECK (porcentaje_acumulado >= 0 AND porcentaje_acumulado <= 100.001)
);

COMMENT ON COLUMN clasificacion_abc_detalle.valor_inventario IS
    'Calculado como SUM(lote.cantidad * lote.costo_unitario).';


-- -----------------------------------------------------------------------------
-- 4.15 REPORTE_EXPORTADO
-- -----------------------------------------------------------------------------
CREATE TABLE reporte_exportado (
    id                    BIGSERIAL          PRIMARY KEY,
    tipo_reporte          VARCHAR(50)     NOT NULL,
    fecha_inicio_periodo  DATE,
    fecha_fin_periodo     DATE,
    parametros_json       JSONB,
    usuario_id            INTEGER         NOT NULL,
    fecha_exportacion     TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_re_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuario (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,

    CONSTRAINT ck_re_tipo_reporte
        CHECK (tipo_reporte IN (
            'movimientos', 'stock_critico', 'proximos_vencer',
            'perdidas_caducidad', 'historial_compras', 'clasificacion_abc'
        )),

    CONSTRAINT ck_re_periodo
        CHECK (
            (fecha_inicio_periodo IS NULL AND fecha_fin_periodo IS NULL)
            OR (fecha_inicio_periodo IS NOT NULL
                AND fecha_fin_periodo IS NOT NULL
                AND fecha_fin_periodo >= fecha_inicio_periodo)
        )
);

COMMENT ON COLUMN reporte_exportado.parametros_json IS
    'Filtros exactos del reporte para auditoría completa.';


-- =============================================================================
-- 5. ÍNDICES
-- =============================================================================

-- Producto
CREATE INDEX idx_producto_nombre             ON producto (nombre) WHERE nombre IS NOT NULL;
CREATE INDEX idx_producto_clasificacion_abc  ON producto (clasificacion_abc) WHERE clasificacion_abc IS NOT NULL;
CREATE INDEX idx_producto_activo_stock       ON producto (activo, stock_total);
CREATE INDEX idx_producto_categoria          ON producto (categoria_id);
CREATE INDEX idx_producto_stock_bajo         ON producto (stock_total, stock_minimo) WHERE activo = TRUE;

-- Lote (crítico para FEFO)
CREATE INDEX idx_lote_fefo
    ON lote (producto_id, fecha_vencimiento ASC, id ASC)
    WHERE estado = 'activo' AND cantidad > 0;

CREATE INDEX idx_lote_fecha_vencimiento      ON lote (fecha_vencimiento);
CREATE INDEX idx_lote_producto_estado        ON lote (producto_id, estado);
CREATE INDEX idx_lote_orden_compra           ON lote (orden_compra_id) WHERE orden_compra_id IS NOT NULL;

-- Movimiento inventario
CREATE INDEX idx_mi_producto_fecha           ON movimiento_inventario (producto_id, fecha_hora DESC);
CREATE INDEX idx_mi_lote                     ON movimiento_inventario (lote_id);
CREATE INDEX idx_mi_tipo_fecha               ON movimiento_inventario (tipo_movimiento, fecha_hora DESC);
CREATE INDEX idx_mi_usuario                  ON movimiento_inventario (usuario_id);
CREATE INDEX idx_mi_orden_compra             ON movimiento_inventario (orden_compra_id) WHERE orden_compra_id IS NOT NULL;
CREATE INDEX idx_mi_proveedor_fecha          ON movimiento_inventario (proveedor_id, fecha_hora DESC) WHERE proveedor_id IS NOT NULL;
CREATE INDEX idx_mi_referencia               ON movimiento_inventario (referencia_id) WHERE referencia_id IS NOT NULL;

-- Orden compra
CREATE INDEX idx_oc_estado_proveedor         ON orden_compra (estado, proveedor_id);
CREATE INDEX idx_oc_usuario                  ON orden_compra (usuario_id);
CREATE INDEX idx_oc_fecha_emision            ON orden_compra (fecha_emision DESC) WHERE fecha_emision IS NOT NULL;

-- Alertas
CREATE INDEX idx_alerta_leida_tipo           ON alerta (leida, tipo);
CREATE INDEX idx_alerta_producto             ON alerta (producto_id);
CREATE INDEX idx_alerta_fecha_generacion     ON alerta (fecha_generacion DESC);
CREATE INDEX idx_alerta_gestiona             ON alerta (usuario_gestiona_id) WHERE usuario_gestiona_id IS NOT NULL;

-- Recepción
CREATE INDEX idx_rm_orden_compra             ON recepcion_mercaderia (orden_compra_id);
CREATE INDEX idx_rd_recepcion                ON recepcion_detalle (recepcion_id);
CREATE INDEX idx_rd_orden_detalle            ON recepcion_detalle (orden_detalle_id);

-- ABC
CREATE INDEX idx_cabc_h_fecha                ON clasificacion_abc_historial (fecha_calculo DESC);
CREATE INDEX idx_cabc_d_historial            ON clasificacion_abc_detalle (historial_id);

-- Proveedor
CREATE INDEX idx_proveedor_nombre            ON proveedor (nombre);
CREATE INDEX idx_proveedor_activo            ON proveedor (activo);

-- Reportes
CREATE INDEX idx_re_usuario_fecha            ON reporte_exportado (usuario_id, fecha_exportacion DESC);
CREATE INDEX idx_re_tipo_fecha               ON reporte_exportado (tipo_reporte, fecha_exportacion DESC);


-- =============================================================================
-- 6. FUNCIÓN updated_at Y TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;


-- -----------------------------------------------------------------------------
-- fn_bloquear_cambio_vencido()
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_bloquear_cambio_vencido()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    -- Si el lote ya estaba vencido y alguien intenta cambiarle el estado...
    IF OLD.estado = 'vencido' AND NEW.estado != 'vencido' THEN
        RAISE EXCEPTION 
            '[LOTE] Regla de negocio: Un lote "vencido" (id=%) es un estado terminal. '
            'No puede transicionar a estado "%".', OLD.id, NEW.estado;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_bloquear_cambio_vencido
    BEFORE UPDATE OF estado ON lote
    FOR EACH ROW EXECUTE FUNCTION fn_bloquear_cambio_vencido();

-- -----------------------------------------------------------------------------
-- fn_sync_stock_total() - OPTIMIZADA POR DELTA
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_sync_stock_total()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_delta INTEGER := 0;
BEGIN
    -- 1. Calcular la diferencia (Delta) según la operación
    IF TG_OP = 'INSERT' THEN
        -- Si insertamos un lote nuevo y está activo, sumamos su cantidad
        IF NEW.estado = 'activo' THEN
            v_delta := NEW.cantidad;
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        -- CASO A: El lote se mantiene activo, solo cambia la cantidad
        IF OLD.estado = 'activo' AND NEW.estado = 'activo' THEN
            v_delta := NEW.cantidad - OLD.cantidad;
            
        -- CASO B: El lote pasa de inactivo (ej. agotado/vencido) a activo
        ELSIF OLD.estado = 'agotado' AND NEW.estado = 'activo' THEN
            v_delta := NEW.cantidad;
            
        -- CASO C: El lote pasa de activo a inactivo (ej. se agotó o se venció)
        ELSIF OLD.estado = 'activo' AND NEW.estado != 'activo' THEN
            v_delta := -OLD.cantidad;
        END IF;
    END IF;

    -- 2. Aplicar el delta a la tabla producto (Solo si hay un cambio real)
    IF v_delta != 0 THEN
        UPDATE producto
           SET stock_total = stock_total + v_delta
         WHERE id = NEW.producto_id;
    END IF;

    RETURN NEW;
END;
$$;

-- El trigger se mantiene igual, pero ahora la función es muchísimo más rápida
DROP TRIGGER IF EXISTS trg_sync_stock_total ON lote;
CREATE TRIGGER trg_sync_stock_total
    AFTER INSERT OR UPDATE OF cantidad, estado ON lote
    FOR EACH ROW EXECUTE FUNCTION fn_sync_stock_total();

CREATE TRIGGER trg_updated_at_usuario
    BEFORE UPDATE ON usuario
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_updated_at_producto
    BEFORE UPDATE ON producto
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_updated_at_proveedor
    BEFORE UPDATE ON proveedor
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_updated_at_orden_compra
    BEFORE UPDATE ON orden_compra
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_updated_at_configuracion
    BEFORE UPDATE ON configuracion_sistema
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- =============================================================================
-- 7. TRIGGERS DE INTEGRIDAD — LOTE
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_validar_fecha_vencimiento_lote()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.fecha_vencimiento < CURRENT_DATE THEN
        RAISE EXCEPTION
            '[LOTE] La fecha de vencimiento debe ser futura. Recibido: %, hoy: %.',
            NEW.fecha_vencimiento, CURRENT_DATE;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_fecha_vencimiento_lote
    BEFORE INSERT ON lote
    FOR EACH ROW EXECUTE FUNCTION fn_validar_fecha_vencimiento_lote();


-- =============================================================================
-- 8. TRIGGERS DE INMUTABILIDAD — MOVIMIENTO_INVENTARIO
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_bloquear_update_movimiento()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION
        '[INMUTABLE] movimiento_inventario no permite UPDATE sobre id=%. '
        'Registre un movimiento de ajuste correctivo.', OLD.id;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_bloquear_update_movimiento
    BEFORE UPDATE ON movimiento_inventario
    FOR EACH ROW EXECUTE FUNCTION fn_bloquear_update_movimiento();


CREATE OR REPLACE FUNCTION fn_bloquear_delete_movimiento()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION
        '[INMUTABLE] movimiento_inventario no permite DELETE sobre id=%. '
        'El historial es permanente por diseño.', OLD.id;
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_bloquear_delete_movimiento
    BEFORE DELETE ON movimiento_inventario
    FOR EACH ROW EXECUTE FUNCTION fn_bloquear_delete_movimiento();


CREATE OR REPLACE FUNCTION fn_bloquear_truncate_movimiento()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION
        '[INMUTABLE] movimiento_inventario no permite TRUNCATE.';
    RETURN NULL;
END;
$$;

CREATE TRIGGER trg_bloquear_truncate_movimiento
    BEFORE TRUNCATE ON movimiento_inventario
    EXECUTE FUNCTION fn_bloquear_truncate_movimiento();


-- -----------------------------------------------------------------------------
-- Función y Trigger: Procesar Recepción de Detalle
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_procesar_recepcion_detalle()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_producto_id      INTEGER;
    v_costo_unitario   NUMERIC(10,2);
    v_orden_compra_id  INTEGER;
    v_proveedor_id     INTEGER;
    v_usuario_id       INTEGER;
    v_lote_id          INTEGER;
BEGIN
    -- 1. Extraer contexto y bloquear fila para evitar condiciones de carrera
    SELECT ocd.producto_id, ocd.costo_unitario, ocd.orden_compra_id, oc.proveedor_id
      INTO v_producto_id, v_costo_unitario, v_orden_compra_id, v_proveedor_id
      FROM orden_compra_detalle ocd
      JOIN orden_compra oc ON ocd.orden_compra_id = oc.id
     WHERE ocd.id = NEW.orden_detalle_id
       FOR UPDATE OF ocd;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            '[RECEPCION] orden_detalle_id=% no encontrado.',
            NEW.orden_detalle_id;
    END IF;

    -- 2. Obtener el usuario que registra la recepción
    SELECT usuario_id INTO v_usuario_id
      FROM recepcion_mercaderia
     WHERE id = NEW.recepcion_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            '[RECEPCION] recepcion_id=% no encontrada.', NEW.recepcion_id;
    END IF;

    -- 3. UPSERT atómico del lote
    INSERT INTO lote (
        producto_id, numero_lote, cantidad, fecha_vencimiento,
        costo_unitario, estado, orden_compra_id
    )
    VALUES (
        v_producto_id, NEW.numero_lote, NEW.cantidad_recibida, NEW.fecha_vencimiento,
        v_costo_unitario, 'activo', v_orden_compra_id
    )
    ON CONFLICT (producto_id, numero_lote)
    DO UPDATE SET
        cantidad = lote.cantidad + EXCLUDED.cantidad,
        estado   = 'activo'
    RETURNING id INTO v_lote_id;

    -- 4. Trazabilidad en movimiento de inventario
    INSERT INTO movimiento_inventario (
        lote_id, producto_id, tipo_movimiento, cantidad,
        costo_unitario, usuario_id, proveedor_id, orden_compra_id, motivo
    ) VALUES (
        v_lote_id, v_producto_id, 'entrada', NEW.cantidad_recibida,
        v_costo_unitario, v_usuario_id, v_proveedor_id, v_orden_compra_id,
        'Recepción de OC-' || v_orden_compra_id
    );

    -- 5. Actualizar progreso en orden de compra detalle
    UPDATE orden_compra_detalle
       SET cantidad_recibida = cantidad_recibida + NEW.cantidad_recibida
     WHERE id = NEW.orden_detalle_id;

    RETURN NEW;
END;
$$;

--==============================
--#Procesar Recepción de Detalle
--==============================
CREATE TRIGGER trg_procesar_recepcion_detalle
    AFTER INSERT ON recepcion_detalle
    FOR EACH ROW EXECUTE FUNCTION fn_procesar_recepcion_detalle();
-- -----------------------------------------------------------------------------
-- Función y Trigger: Evaluar Estado de Orden de Compra
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_actualizar_estado_orden_compra()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_total_solicitado INTEGER;
    v_total_recibido   INTEGER;
    v_nuevo_estado     VARCHAR(20);
BEGIN
    -- Sumarizamos toda la orden para ver el panorama completo
    SELECT COALESCE(SUM(cantidad_solicitada), 0),
           COALESCE(SUM(cantidad_recibida), 0)
      INTO v_total_solicitado, v_total_recibido
      FROM orden_compra_detalle
     WHERE orden_compra_id = NEW.orden_compra_id;

    -- Evaluamos la transición de estado
    IF v_total_recibido >= v_total_solicitado THEN
        v_nuevo_estado := 'recibida';
    ELSIF v_total_recibido > 0 THEN
        v_nuevo_estado := 'recibida_parcial';
    ELSE
        RETURN NEW; -- No hay recepciones, salimos.
    END IF;

    -- Actualizamos la orden padre (Solo si el estado realmente cambió para evitar loops)
    UPDATE orden_compra
       SET estado = v_nuevo_estado,
           -- Seteamos la fecha solo la primera vez que entra en estado de recepción
           fecha_recepcion = CASE 
                                WHEN v_nuevo_estado IN ('recibida', 'recibida_parcial') AND fecha_recepcion IS NULL 
                                THEN NOW() 
                                ELSE fecha_recepcion 
                             END
     WHERE id = NEW.orden_compra_id AND estado != v_nuevo_estado;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_actualizar_estado_orden_compra
    AFTER UPDATE OF cantidad_recibida ON orden_compra_detalle
    FOR EACH ROW EXECUTE FUNCTION fn_actualizar_estado_orden_compra();

-- =============================================================================
-- 9. TRIGGERS DE NEGOCIO — ÓRDENES DE COMPRA
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_validar_transicion_orden()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.estado = NEW.estado THEN RETURN NEW; END IF;

    IF NOT (
        (OLD.estado = 'borrador'          AND NEW.estado IN ('emitida', 'cancelada'))
     OR (OLD.estado = 'emitida'           AND NEW.estado IN ('recibida', 'recibida_parcial', 'cancelada'))
     OR (OLD.estado = 'recibida_parcial'  AND NEW.estado = 'recibida')
    ) THEN
        RAISE EXCEPTION
            '[ORDEN] Transición de estado inválida en orden id=%: ''%'' → ''%''. '
            'Permitidas: borrador→emitida|cancelada, emitida→recibida|recibida_parcial|cancelada, '
            'recibida_parcial→recibida.',
            NEW.id, OLD.estado, NEW.estado;
    END IF;

    IF OLD.estado = 'borrador' AND NEW.estado = 'emitida' THEN
        IF NEW.fecha_emision IS NULL THEN
            NEW.fecha_emision := NOW();
        END IF;
        IF EXISTS (
            SELECT 1 FROM orden_compra_detalle
            WHERE orden_compra_id = NEW.id AND costo_unitario IS NULL
        ) THEN
            RAISE EXCEPTION
                '[ORDEN] No se puede emitir la orden id=% porque hay ítems sin costo_unitario.', NEW.id;
        END IF;
    END IF;

    IF NEW.estado IN ('recibida', 'recibida_parcial') AND NEW.fecha_recepcion IS NULL THEN
        NEW.fecha_recepcion := NOW();
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_transicion_orden
    BEFORE UPDATE ON orden_compra
    FOR EACH ROW EXECUTE FUNCTION fn_validar_transicion_orden();


CREATE OR REPLACE FUNCTION fn_bloquear_detalle_orden_emitida()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_orden_id INTEGER;
    v_estado   VARCHAR(20);
BEGIN
    v_orden_id := COALESCE(NEW.orden_compra_id, OLD.orden_compra_id);

    SELECT estado INTO v_estado
    FROM orden_compra WHERE id = v_orden_id;

    -- DELETE siempre bloqueado si no está en borrador
    IF TG_OP = 'DELETE' AND v_estado != 'borrador' THEN
        RAISE EXCEPTION
            '[ORDEN] No se puede eliminar ítems de la orden id=% (estado: ''%'').',
            v_orden_id, v_estado;
    END IF;

    -- INSERT bloqueado si no está en borrador
    IF TG_OP = 'INSERT' AND v_estado != 'borrador' THEN
        RAISE EXCEPTION
            '[ORDEN] No se puede agregar ítems a la orden id=% (estado: ''%'').',
            v_orden_id, v_estado;
    END IF;

    -- UPDATE: solo bloqueamos cambios a columnas que no sean cantidad_recibida
    IF TG_OP = 'UPDATE' AND v_estado != 'borrador' THEN
        IF (NEW.producto_id       IS DISTINCT FROM OLD.producto_id)       OR
           (NEW.cantidad_solicitada IS DISTINCT FROM OLD.cantidad_solicitada) OR
           (NEW.costo_unitario    IS DISTINCT FROM OLD.costo_unitario)
        THEN
            RAISE EXCEPTION
                '[ORDEN] No se puede modificar producto, cantidad solicitada '
                'ni costo de la orden id=% (estado: ''%''). '
                'Solo se permite actualizar cantidad_recibida.',
                v_orden_id, v_estado;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_bloquear_detalle_orden_emitida
    BEFORE INSERT OR UPDATE OR DELETE ON orden_compra_detalle
    FOR EACH ROW EXECUTE FUNCTION fn_bloquear_detalle_orden_emitida();


CREATE OR REPLACE FUNCTION fn_validar_orden_para_recepcion()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_estado VARCHAR(20);
BEGIN
    SELECT estado INTO v_estado
    FROM orden_compra WHERE id = NEW.orden_compra_id;

    IF v_estado IS NULL THEN
        RAISE EXCEPTION '[RECEPCION] Orden de compra id=% no existe.', NEW.orden_compra_id;
    END IF;

    IF v_estado NOT IN ('emitida', 'recibida_parcial') THEN
        RAISE EXCEPTION
            '[RECEPCION] La orden id=% tiene estado ''%''. '
            'Solo se puede recepcionar una orden en estado ''emitida'' o ''recibida_parcial''.',
            NEW.orden_compra_id, v_estado;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validar_orden_para_recepcion
    BEFORE INSERT ON recepcion_mercaderia
    FOR EACH ROW EXECUTE FUNCTION fn_validar_orden_para_recepcion();


CREATE OR REPLACE FUNCTION fn_bloquear_delete_producto()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM movimiento_inventario WHERE producto_id = OLD.id LIMIT 1) THEN
        RAISE EXCEPTION
            '[PRODUCTO] No se puede eliminar el producto id=% porque tiene movimientos. '
            'Use activo = FALSE para desactivarlo.', OLD.id;
    END IF;
    RETURN OLD;
END;
$$;

CREATE TRIGGER trg_bloquear_delete_producto
    BEFORE DELETE ON producto
    FOR EACH ROW EXECUTE FUNCTION fn_bloquear_delete_producto();




-- -----------------------------------------------------------------------------
-- fn_marcar_alerta_leida()
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_marcar_alerta_leida(
    p_alerta_id           INTEGER,
    p_usuario_gestiona_id INTEGER
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    UPDATE alerta
       SET leida               = TRUE,
           fecha_lectura       = NOW(),
           usuario_gestiona_id = p_usuario_gestiona_id
     WHERE id = p_alerta_id AND leida = FALSE;

    IF NOT FOUND THEN
        RAISE EXCEPTION '[ALERTA] Alerta id=% no encontrada o ya fue leída.', p_alerta_id;
    END IF;
END;
$$;


-- =============================================================================
-- 17. DATOS SEMILLA
-- =============================================================================

INSERT INTO categoria (nombre, descripcion) VALUES
    ('Antibióticos',            'Medicamentos para infecciones bacterianas'),
    ('Antihipertensivos',       'Control de presión arterial alta'),
    ('Antidiabéticos',          'Control de glucemia en diabetes tipo 2'),
    ('Analgésicos',             'Alivio del dolor e inflamación'),
    ('Antihistamínicos',        'Tratamiento de alergias y procesos alérgicos'),
    ('Protectores gástricos',   'Gastritis, reflujo y úlceras pépticas'),
    ('Vitaminas y suplementos', 'Suplementos nutricionales y vitamínicos'),
    ('Insumos médicos',         'Gasas, vendajes, termómetros y material de curación'),
    ('Cuidado personal',        'Cremas, higiene y cuidado de la piel'),
    ('Pediátrico',              'Productos para bebés y niños menores de 12 años');

INSERT INTO usuario (nombre_completo, password_hash, rol, telefono,email)
VALUES (
    'Administrador del Sistema',
    '$2a$10$vI8A7idbIuQCXGvSk7rGae1tD6S8.8h93MscKzV7iK8xR/A2PCDW2',
    'ADMINISTRADOR',
    75912252,
    'el_correo_que_usas_en_postman@ejemplo.com'
);


-- =============================================================================
-- FIN DEL SCRIPT — Farmacia Cristo Redentor v5.1
-- PostgreSQL 15+ | JWT gestionado por la aplicación
-- =============================================================================