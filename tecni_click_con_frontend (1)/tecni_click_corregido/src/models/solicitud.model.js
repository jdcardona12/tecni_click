const pool = require('../config/db');

const create = async ({ usuario_id, electrodomestico, descripcion }) => {
  const [result] = await pool.query(
    'INSERT INTO solicitudes (usuario_id, electrodomestico, descripcion) VALUES (?, ?, ?)',
    [usuario_id, electrodomestico, descripcion]
  );
  return { id: result.insertId, usuario_id, electrodomestico, descripcion, estado: 'pendiente' };
};

// Consulta base: trae también el nombre del técnico y los datos del cliente
const BASE = `SELECT s.*, t.nombre AS tecnico_nombre, u.nombre AS cliente_nombre, u.telefono AS cliente_telefono
  FROM solicitudes s
  LEFT JOIN tecnicos t ON t.id = s.tecnico_id
  LEFT JOIN usuarios u ON u.id = s.usuario_id`;

const findById = async (id) => {
  const [rows] = await pool.query(`${BASE} WHERE s.id = ?`, [id]);
  return rows[0];
};

const findByUsuario = async (usuario_id) => {
  const [rows] = await pool.query(`${BASE} WHERE s.usuario_id = ? ORDER BY s.fecha_solicitud DESC`, [usuario_id]);
  return rows;
};

const updateEstado = async (id, estado) => {
  await pool.query('UPDATE solicitudes SET estado = ? WHERE id = ?', [estado, id]);
  return findById(id);
};

// Solicitudes pendientes que todavía no tiene técnico
const findDisponibles = async () => {
  const [rows] = await pool.query(`${BASE} WHERE s.estado = 'pendiente' AND s.tecnico_id IS NULL ORDER BY s.fecha_solicitud ASC`);
  return rows;
};

// Solicitudes que ya aceptó un técnico
const findByTecnico = async (tecnico_id) => {
  const [rows] = await pool.query(`${BASE} WHERE s.tecnico_id = ? ORDER BY s.fecha_solicitud DESC`, [tecnico_id]);
  return rows;
};

// Un técnico acepta la solicitud (solo si nadie más la tomó antes)
const aceptar = async (id, tecnico_id) => {
  const [result] = await pool.query(
    "UPDATE solicitudes SET tecnico_id = ?, estado = 'en_proceso' WHERE id = ? AND tecnico_id IS NULL AND estado = 'pendiente'",
    [tecnico_id, id]
  );
  return result.affectedRows > 0;
};

module.exports = { create, findById, findByUsuario, findDisponibles, findByTecnico, aceptar, updateEstado };