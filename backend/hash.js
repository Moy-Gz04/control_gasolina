/* ============================================================
   hash.js
   UTILIDAD PARA GENERAR CONTRASEÑAS (bcrypt)

   Uso:
     node hash.js "miContraseñaSegura"

   Copia el hash que imprime y úsalo en el INSERT de la tabla
   "usuarios" (columna password_hash). Ver sql/schema.sql.
   ============================================================ */

const bcrypt = require('bcryptjs');

const password = process.argv[2];

if(!password){
    console.log('Uso: node hash.js "tuContraseña"');
    process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
    console.log('HASH GENERADO:');
    console.log(hash);
});
