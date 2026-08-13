require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/* =========================
   EXPRESS
========================= */

const app = express();

/* =========================
   RUTAS
========================= */

const authRoutes      = require('./routes/auth');
const registrosRoutes = require('./routes/registros');

/* =========================
   MIDDLEWARES
========================= */

app.use(express.json({ limit: '15mb' })); // la imagen base64 va por Apps Script, no por aquí, pero se deja margen
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

/* =========================
   ENDPOINTS
========================= */

app.use('/api/auth',      authRoutes);
app.use('/api/registros', registrosRoutes);

/* =========================
   ROOT
========================= */

app.get('/', (req, res) => {
    res.send('API Control Vehicular funcionando');
});

/* =========================
   ERROR 404
========================= */

app.use((req, res) => {
    res.status(404).json({ ok: false, msg: 'Ruta no encontrada' });
});

/* =========================
   ERROR GENERAL
========================= */

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).json({ ok: false, msg: 'Error interno servidor' });
});

/* =========================
   SERVIDOR
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor Control Vehicular funcionando en puerto ${PORT}`);
});
