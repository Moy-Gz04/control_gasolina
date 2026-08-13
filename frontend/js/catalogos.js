/* ============================================================
   catalogos.js
   CATÁLOGOS FIJOS — CONTROL VEHICULAR

   Estos datos NO se capturan en el formulario, se seleccionan
   de un desplegable y el sistema extrae automáticamente los
   datos relacionados.

   ⚠️ EDITA ESTOS ARREGLOS con tu información real. Son solo
   ejemplos de muestra (catálogo de ejemplo, como se acordó).
   ============================================================ */

/* ============================================================
   CATÁLOGO : PERSONAS
   Cada persona tiene su Nombre completo y su Adscripción.
   Al elegir una persona en el formulario se llenan
   automáticamente <<NOMBRE>> y <<ADS>> en el documento.
   ============================================================ */

const catalogoPersonas = [
    {
        nombre: "Ing. Juan Carlos Pérez López",
        adscripcion: "Dirección de Recursos Materiales"
    },
    {
        nombre: "Lic. Ana María Torres Ramírez",
        adscripcion: "Unidad de Transportes"
    },
    {
        nombre: "C. Pedro Sánchez Gómez",
        adscripcion: "Dirección de Administración"
    }
];

/* ============================================================
   CATÁLOGO : UNIDADES (VEHÍCULOS)
   Cada unidad se identifica por sus placas. Al elegir una
   unidad se arma automáticamente <<CONCAT>> (leyenda) y
   se llena <<PLAC>> con las placas.
   ============================================================ */

const catalogoUnidades = [
    {
        placas: "ABC-123-A",
        modelo: "2022",
        tipo: "Pickup Nissan NP300",
        color: "Blanco",
        inventario: "INV-0001"
    },
    {
        placas: "XYZ-456-B",
        modelo: "2021",
        tipo: "Sedán Nissan Versa",
        color: "Gris",
        inventario: "INV-0002"
    },
    {
        placas: "DEF-789-C",
        modelo: "2023",
        tipo: "Van Toyota Hiace",
        color: "Azul",
        inventario: "INV-0003"
    }
];

/* ============================================================
   FUNCIÓN : construirConcatUnidad
   Arma la leyenda de la unidad seleccionada con el formato:
   "(Modelo) (Tipo), color (Color), placas de circulación
   (Placas), con numero de inventario (n. de inventario)"
   ============================================================ */

function construirConcatUnidad(unidad){

    return (
        `(${unidad.modelo}) (${unidad.tipo}), ` +
        `color (${unidad.color}), ` +
        `placas de circulación (${unidad.placas}), ` +
        `con numero de inventario (${unidad.inventario})`
    );

}

/* ============================================================
   FUNCIÓN : llenarSelectPersonas
   Llena el <select id="persona"> con el catálogo de personas.
   ============================================================ */

function llenarSelectPersonas(){

    const select =
    document.getElementById("persona");

    if(!select) return;

    select.innerHTML =
    `<option value="">Selecciona una persona</option>`;

    catalogoPersonas.forEach((persona, indice) => {

        const option =
        document.createElement("option");

        option.value = indice;
        option.textContent = persona.nombre;

        select.appendChild(option);

    });

}

/* ============================================================
   FUNCIÓN : llenarSelectUnidades
   Llena el <select id="unidad"> con el catálogo de unidades,
   mostrando las placas como referencia visible.
   ============================================================ */

function llenarSelectUnidades(){

    const select =
    document.getElementById("unidad");

    if(!select) return;

    select.innerHTML =
    `<option value="">Selecciona una unidad (placas)</option>`;

    catalogoUnidades.forEach((unidad, indice) => {

        const option =
        document.createElement("option");

        option.value = indice;
        option.textContent =
        `${unidad.placas} — ${unidad.tipo}`;

        select.appendChild(option);

    });

}
