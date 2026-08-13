# Control Vehicular — Guía de puesta en marcha

Sistema calcado del diseño de "Sistema Biáticos" (mismo look guinda/dorado,
mismo patrón de login + JWT + Postgres + Google Apps Script), pero enfocado
en capturar bitácoras de uso de vehículo.

## 1. Estructura entregada

```
control-vehicular/
├── frontend/          → Netlify (estático)
│   ├── index.html      (login)
│   ├── css/
│   ├── js/
│   │   ├── config.js    ⚠️ EDITA: API y API_APPS_SCRIPT
│   │   └── catalogos.js ⚠️ EDITA: personas y unidades reales
│   ├── img/logo.png
│   └── vistas/
│       ├── CAPTURA.html
│       └── REGISTROS.html
├── backend/            → Render (Node/Express)
│   ├── server.js
│   ├── database/db.js
│   ├── routes/auth.js
│   ├── routes/registros.js
│   ├── hash.js          (generador de contraseñas)
│   ├── sql/schema.sql   (tablas para Neon)
│   └── .env.example
└── appscript/
    └── Script.gs        → pegar en script.google.com
```

## 2. Base de datos (Neon)

1. Crea un proyecto en Neon y copia tu connection string.
2. Abre el SQL Editor de Neon y ejecuta todo `backend/sql/schema.sql`.
3. Genera el hash de tu primera contraseña:
   ```
   cd backend
   npm install
   node hash.js "tuContraseñaSegura"
   ```
4. Inserta tu usuario con el hash generado:
   ```sql
   INSERT INTO usuarios (usuario, password_hash, area, rol)
   VALUES ('admin', '<<HASH_GENERADO>>', 'CTRL-VEH', 'admin');
   ```

## 3. Backend (Render)

1. Sube la carpeta `backend/` a un repositorio propio.
2. En Render crea un "Web Service" apuntando a ese repo.
3. Configura las variables de entorno (mismas de `.env.example`):
   `DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, JWT_SECRET`.
4. Build command: `npm install` — Start command: `npm start`.
5. Al terminar, tendrás una URL tipo `https://tu-servicio.onrender.com`.

## 4. Google Apps Script (genera el PDF)

1. Verifica que el documento plantilla
   `14um3yKWZATsmzzmOXEuzqOMKmOSw1gsY6bqOa9_RYGI` tenga EXACTAMENTE estos
   placeholders escritos tal cual (con las dobles llaves angulares):

   ```
   <<NOF>>       <<ACT>>       <<COMUNIDAD>>   <<KM>>
   <<IMG>>       <<NOMBRE>>    <<ADS>>         <<CONCAT>>
   <<PLAC>>      <<KMINIC>>    <<FECHA>>
   ```

   El placeholder `<<IMG>>` debe estar solo en su propio párrafo (una línea
   dedicada), porque el script borra ese párrafo completo y coloca ahí la
   imagen del tablero.

2. Ve a https://script.google.com → Proyecto nuevo.
3. Pega el contenido de `appscript/Script.gs`.
4. Revisa que `FOLDER_ID` sea la carpeta de Drive
   `1SlgX7PwSOoya9oGWZKSHqEQwE-W0pqaT` (donde se guardarán los PDFs).
5. Implementar → Nueva implementación → Tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier usuario**
6. Copia la URL que termina en `/exec`.

## 5. Frontend (Netlify)

1. Abre `frontend/js/config.js` y reemplaza:
   - `API` → la URL de tu backend en Render.
   - `API_APPS_SCRIPT` → la URL `/exec` del paso anterior.
2. Abre `frontend/js/catalogos.js` y sustituye el catálogo de ejemplo
   (3 personas, 3 unidades) por tus datos reales. Cada objeto necesita
   exactamente esos campos (nombre/adscripcion para personas;
   placas/modelo/tipo/color/inventario para unidades).
3. Sube la carpeta `frontend/` a Netlify (arrastrar y soltar, o conectar
   el repo). No requiere build, es HTML/CSS/JS estático.

## 6. Cómo funciona el flujo de captura

1. El usuario inicia sesión (`index.html` → backend `/api/auth/login`).
2. En `CAPTURA.html` elige Persona y Unidad (catálogos fijos en
   `catalogos.js`, no se guardan en la base de datos).
3. Captura: No. de Oficio, Actividad, Comunidades, Km. antes de uso,
   imagen del tablero, una o más rutas (Inicio → Destino → Km, con botón
   "+ Añadir Ruta") y la Fecha (por defecto hoy, editable con el
   calendario nativo del navegador).
4. Al confirmar, el navegador arma el texto de `<<KM>>` así:
   ```
   De (Lugar1) a (Lugar2) (Km) Km.
   De (Lugar3) a (Lugar4) (Km) Km.
   ```
5. Envía todo (texto + imagen en Base64) al Apps Script, que llena la
   plantilla, inserta la imagen, exporta a PDF y lo guarda en la carpeta
   de Drive indicada.
6. El frontend guarda los metadatos del registro (incluyendo la URL del
   PDF) en Postgres vía `POST /api/registros`.
7. En `REGISTROS.html` se listan todos los registros con un botón
   "Ver Documento" que abre el PDF generado.

## 7. Notas y supuestos que hice

- El código de área es `CTRL-VEH`; puedes cambiarlo buscando esa cadena
  en `config.js`, `sql/schema.sql` y `CAPTURA.html`/`REGISTROS.html`.
- El texto de `<<CONCAT>>` se armó literalmente como lo describiste:
  `(Modelo) (Tipo), color (Color), placas de circulación (Placas), con
  numero de inventario (n. de inventario)` — incluyendo los paréntesis.
  Si no los quieres literales, es un solo cambio en
  `frontend/js/catalogos.js`, función `construirConcatUnidad`.
- Los catálogos de Personas y Unidades son arreglos fijos en JavaScript
  (mismo patrón que usa el sistema base para catálogos de municipios/
  personas), no viven en la base de datos.
- No se generó una vista de administración para editar catálogos desde
  el navegador; se editan directamente en `catalogos.js`. Si más
  adelante quieres administrarlos desde una pantalla web, es una
  extensión sencilla (tabla en Postgres + CRUD).
