/* ============================================================
   registros.js
   CONTROL VEHICULAR — Listado de registros generados
   ============================================================ */

let ultimosRegistros = [];

/**
 * Escapa caracteres especiales HTML para evitar inyección
 * al pintar datos del servidor directamente en innerHTML.
 */
function escaparHTML(valor){
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function cargarRegistros(){

    const tbody = document.getElementById("tbodyResultados");

    try{

        const response = await fetch(`${API}/api/registros/${AREA}`);

        if(!response.ok) throw new Error("Error obteniendo registros");

        ultimosRegistros = await response.json();

        renderizarRegistros(ultimosRegistros);

    }

    catch(error){

        console.error("ERROR CARGANDO REGISTROS:", error);

        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:20px; color:red;">
                    Error al cargar registros: ${escaparHTML(error.message)}
                </td>
            </tr>
        `;

    }

}

function renderizarRegistros(registros){

    const tbody = document.getElementById("tbodyResultados");

    if(!registros || registros.length === 0){
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:20px;">
                    No hay registros
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = registros.map((registro) => `
        <tr>
            <td>${escaparHTML(registro.codigo)}</td>
            <td>${escaparHTML(registro.persona)}</td>
            <td>${escaparHTML(registro.unidad_placas)}</td>
            <td>${escaparHTML(registro.no_oficio)}</td>
            <td>${escaparHTML(registro.comunidades)}</td>
            <td>${escaparHTML(registro.kilometraje_inicial)}</td>
            <td>${escaparHTML(registro.km_total)}</td>
            <td>${
                registro.fecha
                ? escaparHTML(new Date(registro.fecha).toLocaleDateString("es-MX"))
                : "-"
            }</td>
            <td>
                ${
                    registro.documento_pdf
                    ? `<a href="${escaparHTML(registro.documento_pdf)}" target="_blank" class="btn-pdf">Ver Documento</a>`
                    : `<button class="btn-eliminar" disabled>Sin documento</button>`
                }
            </td>
        </tr>
    `).join("");

}

document.getElementById("buscadorTexto")?.addEventListener("input", function(){

    const texto = this.value.trim().toLowerCase();

    if(!texto){
        renderizarRegistros(ultimosRegistros);
        return;
    }

    const filtrados = ultimosRegistros.filter((registro) =>
        (registro.codigo || "").toLowerCase().includes(texto) ||
        (registro.persona || "").toLowerCase().includes(texto) ||
        (registro.unidad_placas || "").toLowerCase().includes(texto)
    );

    renderizarRegistros(filtrados);

});

document.addEventListener("DOMContentLoaded", () => {

    cargarRegistros();

    /* Refresco automático cada 30s */
    setInterval(cargarRegistros, 30000);

});
