const pool = require('../config/db');

const findAll = async () => {
  const [rows] = await pool.query(
    'SELECT id, nombre, telefono, email, tipo_usuario, activo FROM usuarios'
  );
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, nombre, telefono, email, tipo_usuario, activo FROM usuarios WHERE id = ?',
    [id]
  );
  return rows[0];
};

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

const update = async (id, { nombre, telefono, email }) => {
  const [result] = await pool.query(
    'UPDATE usuarios SET nombre = ?, telefono = ?, email = ? WHERE id = ?',
    [nombre, telefono, email, id]
  );
  return result.affectedRows > 0;
};

const remove = async (id) => {
  const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

module.exports = { findAll, findById, findByEmail, create, update, remove };
