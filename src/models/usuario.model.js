const pool = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0];
};

const create = async ({ nombre, telefono, email, password, tipo_usuario = 'cliente' }) => {
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, telefono, email, password, tipo_usuario, activo) VALUES (?, ?, ?, ?, ?, 1)',
    [nombre, telefono, email, password, tipo_usuario]
  );
  return { id: result.insertId, nombre, email, tipo_usuario };
};

module.exports = { findByEmail, create };