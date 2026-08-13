/* ============================================================
   captura.js
   CONTROL VEHICULAR — Lógica del formulario de captura

   Flujo:
     1. Valida los datos capturados.
     2. Convierte la imagen del tablero a Base64.
     3. Arma el texto de <<KM>> con todas las rutas capturadas.
     4. Envía todo al Apps Script (variables + imagen) para que
        llene la plantilla de Google Docs y genere el PDF.
     5. Guarda los metadatos del registro en el backend (Postgres).
   ============================================================ */

/* ============================================================
   1. MODALES
   ============================================================ */

function abrirModal(id){
    const modal = document.getElementById(id);
    if(modal) modal.style.display = "flex";
}

function cerrarModal(id){
    const modal = document.getElementById(id);
    if(modal) modal.style.display = "none";
}

function mostrarAdvertencia(mensaje){
    document.getElementById("mensajeAdvertencia").innerText = mensaje;
    abrirModal("modalAdvertencia");
}

/* ============================================================
   2. MESES EN ESPAÑOL (para <<FECHA>>)
   ============================================================ */

const MESES_ES = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

/**
 * Convierte "2026-07-09" (input type=date) a "09 de julio de 2026".
 * @param {string} valorFecha
 * @returns {string}
 */
function formatearFechaLarga(valorFecha){

    if(!valorFecha) return "";

    const [anio, mes, dia] = valorFecha.split("-").map(Number);

    if(!anio || !mes || !dia) return "";

    return `${String(dia).padStart(2, "0")} de ${MESES_ES[mes - 1]} de ${anio}`;

}

/* ============================================================
   3. GENERAR CÓDIGO DE REGISTRO
   ============================================================ */

function generarCodigoRegistro(){

    const ahora = new Date();

    const yyyy = ahora.getFullYear();
    const mm   = String(ahora.getMonth() + 1).padStart(2, "0");
    const dd   = String(ahora.getDate()).padStart(2, "0");

    const aleatorio =
    Math.random().toString(36).substring(2, 6).toUpperCase();

    return `CV-${yyyy}${mm}${dd}-${aleatorio}`;

}

/* ============================================================
   4. RUTAS DINÁMICAS (DISTANCIA)
   ============================================================ */

const plantillaRuta = () => `
    <div class="ruta-item" data-ruta>
        <div class="campo-mini">
            <span>Inicio</span>
            <input type="text" class="ruta-origen" placeholder="Lugar de inicio">
        </div>
        <div class="campo-mini">
            <span>Destino</span>
            <input type="text" class="ruta-destino" placeholder="Lugar de destino">
        </div>
        <div class="campo-mini">
            <span>Km</span>
            <input type="number" class="ruta-km" min="0" step="0.1" placeholder="Km">
        </div>
        <button type="button" class="btn-quitar-ruta" onclick="quitarRuta(this)">✕</button>
    </div>
`;

document.getElementById("btnAgregarRuta").addEventListener("click", () => {

    document.getElementById("rutasContenedor")
    .insertAdjacentHTML("beforeend", plantillaRuta());

});

function quitarRuta(boton){

    const contenedor = document.getElementById("rutasContenedor");

    /* Siempre debe quedar al menos una ruta */
    if(contenedor.querySelectorAll("[data-ruta]").length <= 1){
        mostrarAdvertencia("Debe existir al menos una ruta capturada.");
        return;
    }

    boton.closest("[data-ruta]").remove();

}

/**
 * Lee todas las rutas capturadas y regresa un arreglo de objetos
 * { origen, destino, km }. Descarta filas totalmente vacías.
 */
function obtenerRutas(){

    const filas =
    document.querySelectorAll("#rutasContenedor [data-ruta]");

    const rutas = [];

    filas.forEach((fila) => {

        const origen  = fila.querySelector(".ruta-origen").value.trim();
        const destino = fila.querySelector(".ruta-destino").value.trim();
        const km      = fila.querySelector(".ruta-km").value.trim();

        if(origen || destino || km){
            rutas.push({ origen, destino, km });
        }

    });

    return rutas;

}

/**
 * Arma el texto de <<KM>> con el formato:
 *   De (Lugar1) a (Lugar2) (Km) Km.
 *   De (Lugar3) a (Lugar4) (Km) Km.
 */
function construirTextoKM(rutas){

    return rutas
    .map((ruta) => `De ${ruta.origen} a ${ruta.destino} (${ruta.km}) Km.`)
    .join("\n");

}

/* ============================================================
   5. CATÁLOGO PERSONA / UNIDAD — AUTOLLENADO
   ============================================================ */

document.getElementById("persona").addEventListener("change", function(){

    const indice = this.value;

    if(indice === ""){
        document.getElementById("mostrarNombre").value = "";
        document.getElementById("mostrarAdscripcion").value = "";
        return;
    }

    const persona = catalogoPersonas[indice];

    document.getElementById("mostrarNombre").value = persona.nombre;
    document.getElementById("mostrarAdscripcion").value = persona.adscripcion;

});

document.getElementById("unidad").addEventListener("change", function(){

    const indice = this.value;

    if(indice === ""){
        document.getElementById("mostrarConcat").value = "";
        return;
    }

    const unidad = catalogoUnidades[indice];

    document.getElementById("mostrarConcat").value =
    construirConcatUnidad(unidad);

});

/* ============================================================
   6. IMAGEN DE TABLERO — PREVIEW + BASE64
   ============================================================ */

let imagenBase64 = "";

document.getElementById("imagenTablero").addEventListener("change", function(){

    const archivo = this.files[0];
    const preview = document.getElementById("previewImagen");

    if(!archivo){
        imagenBase64 = "";
        preview.style.display = "none";
        return;
    }

    const lector = new FileReader();

    lector.onload = function(evento){

        imagenBase64 = evento.target.result;

        preview.src = imagenBase64;
        preview.style.display = "block";

    };

    lector.readAsDataURL(archivo);

});

/* ============================================================
   7. VALIDACIÓN
   ============================================================ */

function validarFormulario(){

    const indicePersona = document.getElementById("persona").value;
    const indiceUnidad   = document.getElementById("unidad").value;
    const oficio         = document.getElementById("oficio").value.trim();
    const actividad      = document.getElementById("actividad").value.trim();
    const comunidades    = document.getElementById("comunidades").value.trim();
    const kmInicial       = document.getElementById("kmInicial").value.trim();
    const fecha           = document.getElementById("fecha").value;
    const rutas            = obtenerRutas();

    if(indicePersona === ""){
        mostrarAdvertencia("Selecciona una persona.");
        return false;
    }

    if(indiceUnidad === ""){
        mostrarAdvertencia("Selecciona una unidad (placas).");
        return false;
    }

    if(!oficio){
        mostrarAdvertencia("El No. de Oficio es obligatorio.");
        return false;
    }

    if(!actividad){
        mostrarAdvertencia("La Actividad a Realizar es obligatoria.");
        return false;
    }

    if(!comunidades){
        mostrarAdvertencia("Las Comunidades son obligatorias.");
        return false;
    }

    if(!kmInicial){
        mostrarAdvertencia("El Kilometraje antes de uso es obligatorio.");
        return false;
    }

    if(!imagenBase64){
        mostrarAdvertencia("Debes subir la imagen del tablero.");
        return false;
    }

    if(!fecha){
        mostrarAdvertencia("La fecha es obligatoria.");
        return false;
    }

    if(rutas.length === 0){
        mostrarAdvertencia("Captura al menos una ruta en Distancia.");
        return false;
    }

    for(const ruta of rutas){
        if(!ruta.origen || !ruta.destino || !ruta.km){
            mostrarAdvertencia("Completa Inicio, Destino y Km en todas las rutas capturadas.");
            return false;
        }
    }

    return true;

}

/* ============================================================
   8. BOTÓN GENERAR — ABRIR CONFIRMACIÓN
   ============================================================ */

document.getElementById("btnEnviar").addEventListener("click", function(){

    if(!validarFormulario()) return;

    abrirModal("modalConfirmacion");

});

/* ============================================================
   9. CONFIRMAR GENERACIÓN
   ============================================================ */

document.getElementById("confirmarGeneracion").addEventListener("click", async function(){

    cerrarModal("modalConfirmacion");
    abrirModal("modalCarga");

    const btn = document.getElementById("btnEnviar");
    btn.disabled = true;

    try{

        const indicePersona = document.getElementById("persona").value;
        const indiceUnidad   = document.getElementById("unidad").value;

        const persona = catalogoPersonas[indicePersona];
        const unidad   = catalogoUnidades[indiceUnidad];

        const oficio       = document.getElementById("oficio").value.trim();
        const actividad    = document.getElementById("actividad").value.trim();
        const comunidades  = document.getElementById("comunidades").value.trim();
        const kmInicial     = document.getElementById("kmInicial").value.trim();
        const fecha          = document.getElementById("fecha").value;
        const fechaLarga     = formatearFechaLarga(fecha);
        const rutas           = obtenerRutas();
        const textoKM          = construirTextoKM(rutas);
        const kmTotal            = rutas.reduce((suma, r) => suma + (parseFloat(r.km) || 0), 0);

        const codigo = generarCodigoRegistro();
        const concatUnidad = construirConcatUnidad(unidad);

        /* =========================
           PAYLOAD PARA APPS SCRIPT
        ========================= */

        const payload = {

            codigo,

            fileName: `CTRLVEH_${codigo}`,

            variables: {
                "<<NOF>>":       oficio,
                "<<ACT>>":       actividad,
                "<<COMUNIDAD>>": comunidades,
                "<<KM>>":        textoKM,
                "<<NOMBRE>>":    persona.nombre,
                "<<ADS>>":       persona.adscripcion,
                "<<CONCAT>>":    concatUnidad,
                "<<PLAC>>":      unidad.placas,
                "<<KMINIC>>":    kmInicial,
                "<<FECHA>>":     fechaLarga
            },

            imagenBase64

        };

        console.log("PAYLOAD APPS SCRIPT:", payload);

        /* =========================
           PASO 1: ENVIAR A APPS SCRIPT
        ========================= */

        const respuestaScript = await fetch(API_APPS_SCRIPT, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload)
        });

        const textoRespuesta = await respuestaScript.text();

        let dataScript;

        try{
            dataScript = JSON.parse(textoRespuesta);
        }
        catch(error){
            throw new Error("El Apps Script no devolvió una respuesta válida.");
        }

        console.log("RESPUESTA APPS SCRIPT:", dataScript);

        if(!dataScript.ok){
            throw new Error(dataScript.error || "No se pudo generar el documento.");
        }

        /* =========================
           PASO 2: GUARDAR EN LA BASE DE DATOS
        ========================= */

        const respuestaDB = await fetch(`${API}/api/registros`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                codigo,
                area: AREA,
                persona: persona.nombre,
                adscripcion: persona.adscripcion,
                unidad_placas: unidad.placas,
                unidad_concat: concatUnidad,
                no_oficio: oficio,
                actividad,
                comunidades,
                kilometraje_inicial: kmInicial,
                rutas,
                km_total: kmTotal,
                fecha,
                documento_pdf: dataScript.url,
                documento_id: dataScript.id || ""
            })
        });

        if(!respuestaDB.ok){
            const errorDB = await respuestaDB.text();
            console.error(errorDB);
            throw new Error("El documento se generó, pero no se pudo guardar el registro.");
        }

        /* =========================
           ÉXITO
        ========================= */

        cerrarModal("modalCarga");

        const link = document.getElementById("linkDocumentoGenerado");
        link.href = dataScript.url;
        link.style.display = "inline-flex";

        abrirModal("modalExito");

    }

    catch(error){

        console.error("ERROR GENERANDO DOCUMENTO:", error);

        cerrarModal("modalCarga");
        mostrarAdvertencia(error.message);

    }

    finally{

        btn.disabled = false;

    }

});

/* ============================================================
   10. INICIALIZACIÓN
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    llenarSelectPersonas();
    llenarSelectUnidades();

    /* Fecha predeterminada: hoy, editable con el calendario nativo */
    const campoFecha = document.getElementById("fecha");
    const hoy = new Date();

    campoFecha.value =
    `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

});
