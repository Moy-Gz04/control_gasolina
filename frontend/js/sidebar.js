/* ============================================================
   sidebar.js
   CONTROL VEHICULAR — Barra superior de navegación
   ============================================================ */

const paginaActual =
window.location.pathname
.split("/")
.pop();

/* =========================
   PÁGINAS
========================= */

const PAGINAS = [

    {
        nombre: "Inicio",
        ruta: "CAPTURA.html"
    },

    {
        nombre: "Registros",
        ruta: "REGISTROS.html"
    }

];

/* =========================
   ÍCONOS DEL MENÚ
========================= */

const ICONOS_MENU = {

    "Inicio": `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9.5 12 3l9 6.5"/>
            <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/>
        </svg>
    `,

    "Registros": `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="2"/>
            <path d="M9 3v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3"/>
            <line x1="8" y1="11" x2="16" y2="11"/>
            <line x1="8" y1="15" x2="16" y2="15"/>
        </svg>
    `

};

/* =========================
   GENERAR BOTONES
========================= */

const botonesMenu =

PAGINAS.map((pagina) => {

    return `

        <button
            type="button"
            title="${pagina.nombre}"
            class="menu-btn ${paginaActual === pagina.ruta ? "activo" : ""}"
            onclick="window.location.href='${pagina.ruta}'"
        >

            <span class="menu-btn-icono">
                ${ICONOS_MENU[pagina.nombre] || ""}
            </span>

            <span class="menu-btn-texto">
                ${pagina.nombre}
            </span>

        </button>

    `;

}).join("");

/* =========================
   SIDEBAR
========================= */

document.getElementById("sidebar-container").innerHTML = `

<aside class="sidebar">

    <div class="sidebar-top">

        <div class="sidebar-logo">
            <img src="../img/logo.png" alt="Logo" class="logo-sidebar">
        </div>

        <nav class="sidebar-menu">
            ${botonesMenu}
        </nav>

    </div>

    <div class="sidebar-footer">

        <button type="button" class="logout-btn" onclick="logout()">
            <span class="logout-icon">↩</span>
            <span>Cerrar Sesión</span>
        </button>

    </div>

</aside>

`;

/* =========================
   MODALES GENÉRICOS
========================= */

function abrirModal(id){
    const modal = document.getElementById(id);
    if(modal) modal.style.display = "flex";
}

function cerrarModal(id){
    const modal = document.getElementById(id);
    if(modal) modal.style.display = "none";
}

/* =========================
   LOGOUT
========================= */

function logout(){
    abrirModal('modalLogout');
}

document.addEventListener("DOMContentLoaded", () => {

    const btnConfirmarLogout =
    document.getElementById('confirmarLogout');

    if(btnConfirmarLogout){

        btnConfirmarLogout.addEventListener('click', function(){

            localStorage.removeItem('token');
            localStorage.removeItem('area');

            window.location.href = '../index.html';

        });

    }

});
