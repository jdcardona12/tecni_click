const pool = require('../config/db');

const findAll = async () => {
  const [rows] = await pool.query('SELECT id, nombre, telefono, email, especialidad, activo, fecha_registro FROM tecnicos');
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT id, nombre, telefono, email, especialidad, activo, fecha_registro FROM tecnicos WHERE id = ?', [id]);
  return rows[0];
};

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM tecnicos WHERE email = ?', [email]);
  return rows[0];
};

const create = async ({ nombre, telefono, email, especialidad, password }) => {
  const [result] = await pool.query(
    'INSERT INTO tecnicos (nombre, telefono, email, especialidad, password, activo) VALUES (?, ?, ?, ?, ?, 1)',
    [nombre, telefono, email, especialidad, password]
  );
  return { id: result.insertId, nombre, email, especialidad };
};

module.exports = { findAll, findById, findByEmail, create };