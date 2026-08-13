/* ============================================================
   config.js
   CONFIGURACIÓN GLOBAL DEL SISTEMA — CONTROL VEHICULAR
   Cambia estas 2 URLs cuando tengas tus propios despliegues.
   ============================================================ */

/** URL base del backend (Render). Cámbiala por la tuya al desplegar. */
const API = "https://control-gasolina.onrender.com";

/** Código de área/sistema. Debe coincidir con la columna "area"
 *  de la tabla usuarios y con el valor guardado en localStorage
 *  tras iniciar sesión. */
const AREA = "CTRL-VEH";

/** URL de la Aplicación Web de Google Apps Script que llena
 *  la plantilla de Google Docs y genera el PDF.
 *  Se obtiene al hacer "Implementar > Nueva implementación > Aplicación web"
 *  en el proyecto de Apps Script (ver appscript/Script.gs). */
const API_APPS_SCRIPT =
"https://script.google.com/macros/s/AKfycbyMHbbMu1HTyUZCrb8zN5KuK0uSRZZ4Jb0VQYbApBQiXoQBL5xW4WLjTpGdC7o4C2EP/exec";
