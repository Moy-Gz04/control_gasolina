/* ============================================================
   login.js
   CONTROL VEHICULAR — Inicio de sesión
   Requiere que config.js se cargue antes (define API y AREA).
   ============================================================ */

async function login(){

    const usuario =
    document.getElementById("usuario").value;

    const password =
    document.getElementById("password").value;

    const error =
    document.getElementById("error");

    error.innerText = "";

    try{

        const response = await fetch(
            `${API}/api/auth/login`,
            {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({
                    usuario,
                    password
                })
            }
        );

        const data = await response.json();

        if(response.ok){

            /* Validar que el usuario pertenezca a esta área */
            if(data.area !== AREA){

                error.innerHTML = `
                    <span>Este usuario no tiene acceso a Control Vehicular.</span>
                `;

                return;

            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('area', data.area);

            window.location.href = 'vistas/CAPTURA.html';

        }

        else{

            error.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>${data.error || "Error de acceso"}</span>
            `;

        }

    }

    catch(err){

        error.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>No se pudo conectar al servidor.</span>
        `;

    }

}

function togglePassword(){

    const passwordInput =
    document.getElementById("password");

    const ojoAbierto =
    document.querySelector(".icono-ojo-abierto");

    const ojoCerrado =
    document.querySelector(".icono-ojo-cerrado");

    if(passwordInput.type === "password"){

        passwordInput.type = "text";

        if(ojoAbierto) ojoAbierto.style.display = "none";
        if(ojoCerrado) ojoCerrado.style.display = "block";

    }else{

        passwordInput.type = "password";

        if(ojoAbierto) ojoAbierto.style.display = "block";
        if(ojoCerrado) ojoCerrado.style.display = "none";

    }

}

/* =========================
   LOGIN CON ENTER
========================= */

document.addEventListener("DOMContentLoaded", () => {

    const campoUsuario =
    document.getElementById("usuario");

    const campoPassword =
    document.getElementById("password");

    [campoUsuario, campoPassword].forEach((campo) => {

        if(!campo) return;

        campo.addEventListener("keydown", (evento) => {

            if(evento.key === "Enter"){

                evento.preventDefault();

                login();

            }

        });

    });

});
