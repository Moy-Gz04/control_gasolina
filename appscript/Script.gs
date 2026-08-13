/* ============================================================
   Script.gs — CONTROL VEHICULAR
   Google Apps Script vinculado (o independiente) que:
     1. Recibe los datos del formulario (texto + imagen Base64)
     2. Copia la plantilla de Google Docs
     3. Reemplaza los placeholders <<...>>
     4. Inserta la imagen del tablero en el placeholder <<IMG>>
     5. Exporta el documento como PDF
     6. Guarda el PDF en la carpeta de Drive indicada
     7. Elimina la copia temporal de Google Docs (solo deja el PDF)
     8. Regresa { ok:true, url, id } al frontend

   ─────────────────────────────────────────────────────────
   INSTALACIÓN:
     1. Ve a https://script.google.com y crea un proyecto nuevo
        (o Extensiones > Apps Script desde cualquier Doc/Sheet).
     2. Pega este código en Código.gs (borra el contenido de ejemplo).
     3. Revisa que TEMPLATE_DOC_ID y FOLDER_ID sean correctos.
     4. Implementar > Nueva implementación > Tipo: Aplicación web.
        - Ejecutar como: Yo (tu cuenta)
        - Quién tiene acceso: Cualquier usuario
     5. Copia la URL "/exec" que te entrega y pégala en
        frontend/js/config.js en la constante API_APPS_SCRIPT.
     6. La primera vez tendrás que autorizar los permisos
        (Drive y Docs) desde tu cuenta de Google.
   ─────────────────────────────────────────────────────────
   ============================================================ */

/** ID del documento plantilla de Google Docs con los placeholders */
const TEMPLATE_DOC_ID = "14um3yKWZATsmzzmOXEuzqOMKmOSw1gsY6bqOa9_RYGI";

/** ID de la carpeta de Drive donde se guardará el PDF final */
const FOLDER_ID = "1SlgX7PwSOoya9oGWZKSHqEQwE-W0pqaT";

/* ============================================================
   PUNTO DE ENTRADA (POST)
   ============================================================ */

function doPost(e) {

  try {

    const datos = JSON.parse(e.postData.contents);

    const codigo      = datos.codigo || Utilities.getUuid();
    const fileName     = datos.fileName || ("CTRLVEH_" + codigo);
    const variables      = datos.variables || {};
    const imagenBase64    = datos.imagenBase64 || "";

    const resultado = generarDocumento_(fileName, variables, imagenBase64);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        url: resultado.url,
        id: resultado.id
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: err.message
      }))
      .setMimeType(ContentService.MimeType.JSON);

  }

}

/* ============================================================
   GENERAR DOCUMENTO
   ============================================================ */

function generarDocumento_(fileName, variables, imagenBase64) {

  /* --- 1. Copiar la plantilla --- */

  const copia = DriveApp.getFileById(TEMPLATE_DOC_ID)
    .makeCopy(fileName + "_TMP");

  const doc  = DocumentApp.openById(copia.getId());
  const body = doc.getBody();

  /* --- 2. Reemplazar placeholders de texto --- */

  Object.keys(variables).forEach((placeholder) => {

    const valor = safe_(variables[placeholder]);

    body.replaceText(
      escaparRegex_(placeholder),
      valor.replace(/\$/g, "$$$$")   // escapa "$" para replaceText
    );

  });

  /* --- 3. Insertar la imagen del tablero en <<IMG>> --- */

  if (imagenBase64) {
    insertarImagenEnPlaceholder_(body, "<<IMG>>", imagenBase64);
  } else {
    // Si no llegó imagen, al menos limpia el placeholder
    body.replaceText(escaparRegex_("<<IMG>>"), "");
  }

  doc.saveAndClose();

  /* --- 4. Exportar a PDF --- */

  const pdfBlob = DriveApp.getFileById(copia.getId())
    .getAs("application/pdf")
    .setName(fileName + ".pdf");

  const carpeta = DriveApp.getFolderById(FOLDER_ID);
  const pdfFile = carpeta.createFile(pdfBlob);

  /* Hacer el PDF visible para cualquiera que tenga el link */
  pdfFile.setSharing(
    DriveApp.Access.ANYONE_WITH_LINK,
    DriveApp.Permission.VIEW
  );

  /* --- 5. Limpieza: eliminar la copia de Google Docs --- */

  DriveApp.getFileById(copia.getId()).setTrashed(true);

  return {
    url: "https://drive.google.com/file/d/" + pdfFile.getId() + "/view",
    id:  pdfFile.getId()
  };

}

/* ============================================================
   INSERTAR IMAGEN EN UN PLACEHOLDER DE TEXTO
   Busca el placeholder, borra el texto del párrafo que lo
   contiene y coloca ahí la imagen (Base64 -> Blob).
   ============================================================ */

function insertarImagenEnPlaceholder_(body, placeholder, base64) {

  const encontrado = body.findText(escaparRegex_(placeholder));

  if (!encontrado) return;

  const elemento  = encontrado.getElement();
  const parrafo   = elemento.getParent().asParagraph();

  /* Limpiar el texto del párrafo (quita el placeholder) */
  parrafo.asText().setText("");

  /* Convertir Base64 -> Blob */
  const partes   = base64.split(",");
  const mimeMatch = partes[0].match(/data:(image\/[a-zA-Z0-9.+-]+);base64/);
  const mime      = mimeMatch ? mimeMatch[1] : "image/png";
  const bytes      = Utilities.base64Decode(partes[1] || partes[0]);
  const blob        = Utilities.newBlob(bytes, mime, "tablero.png");

  const imagen = parrafo.insertInlineImage(0, blob);

  /* Redimensionar para que no rompa el layout del documento */
  const anchoMaximo = 380;

  if (imagen.getWidth() > anchoMaximo) {
    const proporcion = anchoMaximo / imagen.getWidth();
    imagen.setWidth(anchoMaximo);
    imagen.setHeight(imagen.getHeight() * proporcion);
  }

}

/* ============================================================
   UTILIDADES
   ============================================================ */

/** Convierte cualquier valor a texto seguro (sin undefined/null) */
function safe_(valor) {
  return (valor !== null && valor !== undefined) ? String(valor) : "";
}

/** Escapa caracteres especiales de regex para usarlos con replaceText/findText */
function escaparRegex_(texto) {
  return String(texto).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
