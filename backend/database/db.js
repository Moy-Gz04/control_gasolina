const { Pool } = require('pg');

/* ============================================================
   CONEXIÓN A NEON (POSTGRESQL)
   Neon requiere SSL. rejectUnauthorized:false evita problemas
   con certificados intermedios, igual que en el sistema base.
   ============================================================ */

const pool = new Pool({

    user: process.env.DB_USER,

    host: process.env.DB_HOST,

    database: process.env.DB_NAME,

    password: process.env.DB_PASSWORD,

    port: process.env.DB_PORT,

    ssl: {
        rejectUnauthorized: false
    }

});

module.exports = pool;
