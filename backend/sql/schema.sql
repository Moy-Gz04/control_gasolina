-- =========================================================
-- ESQUEMA DE BASE DE DATOS — CONTROL VEHICULAR
-- Ejecuta este script completo en tu base de datos de Neon
-- (Neon SQL Editor o con psql apuntando a tu connection string).
-- =========================================================

-- =========================
-- TABLA: usuarios
-- Usuarios que pueden iniciar sesión en el sistema.
-- =========================

CREATE TABLE IF NOT EXISTS usuarios (
    id            SERIAL PRIMARY KEY,
    usuario       VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    area          VARCHAR(50) NOT NULL DEFAULT 'CTRL-VEH',
    rol           VARCHAR(50) DEFAULT 'operador',
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Inserta tu primer usuario reemplazando <<HASH_GENERADO>>
-- por el resultado de: node hash.js "tuContraseña"
--
-- INSERT INTO usuarios (usuario, password_hash, area, rol)
-- VALUES ('admin', '<<HASH_GENERADO>>', 'CTRL-VEH', 'admin');

-- =========================
-- TABLA: registros_ctrl_veh
-- Cada fila es una bitácora de uso de vehículo generada.
-- =========================

CREATE TABLE IF NOT EXISTS registros_ctrl_veh (
    id                    SERIAL PRIMARY KEY,
    codigo                VARCHAR(60) UNIQUE NOT NULL,
    area                  VARCHAR(50) NOT NULL DEFAULT 'CTRL-VEH',

    -- Catálogo Persona (solo referencia, no editable en el form)
    persona               VARCHAR(200) NOT NULL,
    adscripcion           VARCHAR(200),

    -- Catálogo Unidad (vehículo)
    unidad_placas         VARCHAR(30),
    unidad_concat         TEXT,

    -- Datos capturados en el formulario
    no_oficio             VARCHAR(100),
    actividad             TEXT,
    comunidades           TEXT,
    kilometraje_inicial   NUMERIC(10,2),
    rutas                 JSONB DEFAULT '[]'::jsonb,   -- [{origen,destino,km}, ...]
    km_total              NUMERIC(10,2) DEFAULT 0,
    fecha                 DATE,

    -- Documento generado (Google Doc -> PDF en Drive)
    documento_pdf         TEXT,
    documento_id          VARCHAR(120),

    created_at            TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_registros_ctrl_veh_area
    ON registros_ctrl_veh (area);

CREATE INDEX IF NOT EXISTS idx_registros_ctrl_veh_fecha
    ON registros_ctrl_veh (fecha);
