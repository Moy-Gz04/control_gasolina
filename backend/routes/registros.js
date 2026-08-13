const express = require("express");
const pool = require("../database/db");
const router = express.Router();

/* ============================================================
   OBTENER REGISTRO POR CÓDIGO
   ============================================================ */

router.get("/codigo/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo.trim();

    const result = await pool.query(
      `SELECT * FROM registros_ctrl_veh WHERE codigo = $1`,
      [codigo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Registro no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/* ============================================================
   OBTENER REGISTROS POR ÁREA
   (usado por la vista de Registros del área)
   ============================================================ */

router.get("/:area", async (req, res) => {
  try {
    const area = req.params.area.trim();

    const result = await pool.query(
      `
      SELECT *
      FROM registros_ctrl_veh
      WHERE TRIM(area) = $1
      ORDER BY created_at DESC
      `,
      [area]
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, error: "Error obteniendo registros" });
  }
});

/* ============================================================
   GUARDAR REGISTRO
   Se llama después de generar el PDF vía Apps Script, con el
   código y la URL del documento ya generados.
   ============================================================ */

router.post("/", async (req, res) => {
  try {
    const {
      codigo,
      area,
      persona,
      adscripcion,
      unidad_placas,
      unidad_concat,
      no_oficio,
      actividad,
      comunidades,
      kilometraje_inicial,
      rutas,
      km_total,
      fecha,
      documento_pdf,
      documento_id
    } = req.body;

    if (!codigo || !area || !persona) {
      return res.status(400).json({ ok: false, error: "Campos obligatorios incompletos" });
    }

    const existe = await pool.query(
      `SELECT id FROM registros_ctrl_veh WHERE codigo = $1`,
      [codigo.trim()]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ ok: false, error: "El código ya existe" });
    }

    await pool.query(
      `
      INSERT INTO registros_ctrl_veh(
          codigo, area, persona, adscripcion,
          unidad_placas, unidad_concat,
          no_oficio, actividad, comunidades,
          kilometraje_inicial, rutas, km_total,
          fecha, documento_pdf, documento_id
      )
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      `,
      [
        codigo.trim(),
        area.trim(),
        persona.trim(),
        adscripcion || "",
        unidad_placas || "",
        unidad_concat || "",
        no_oficio || "",
        actividad || "",
        comunidades || "",
        kilometraje_inicial || null,
        JSON.stringify(rutas || []),
        km_total || 0,
        fecha || null,
        documento_pdf || "",
        documento_id || ""
      ]
    );

    res.json({ ok: true, msg: "Registro guardado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, error: "Error guardando registro" });
  }
});

/* ============================================================
   ELIMINAR REGISTRO
   ============================================================ */

router.delete("/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo.trim();

    const validar = await pool.query(
      `SELECT id FROM registros_ctrl_veh WHERE codigo = $1`,
      [codigo]
    );

    if (validar.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "Registro no encontrado" });
    }

    await pool.query(`DELETE FROM registros_ctrl_veh WHERE codigo = $1`, [codigo]);

    res.json({ ok: true, msg: "Registro eliminado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, error: "Error eliminando registro" });
  }
});

module.exports = router;
