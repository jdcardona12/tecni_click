const pool = require('../config/db');

const create = async ({ usuario_id, electrodomestico, descripcion }) => {
  const [result] = await pool.query(
    'INSERT INTO solicitudes (usuario_id, electrodomestico, descripcion) VALUES (?, ?, ?)',
    [usuario_id, electrodomestico, descripcion]
  );
  return { id: result.insertId, usuario_id, electrodomestico, descripcion, estado: 'pendiente' };
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM solicitudes WHERE id = ?', [id]);
  return rows[0];
};

const findByUsuario = async (usuario_id) => {
  const [rows] = await pool.query('SELECT * FROM solicitudes WHERE usuario_id = ? ORDER BY fecha_solicitud DESC', [usuario_id]);
  return rows;
};

const updateEstado = async (id, estado) => {
  await pool.query('UPDATE solicitudes SET estado = ? WHERE id = ?', [estado, id]);
  return findById(id);
};

module.exports = { create, findById, findByUsuario, updateEstado };