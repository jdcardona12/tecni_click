const pool = require('../config/db');

const create = async ({ solicitud_id, tecnico_id, usuario_id, puntuacion, comentario }) => {
  const [result] = await pool.query(
    'INSERT INTO calificaciones (solicitud_id, tecnico_id, usuario_id, puntuacion, comentario) VALUES (?, ?, ?, ?, ?)',
    [solicitud_id, tecnico_id, usuario_id, puntuacion, comentario]
  );
  return { id: result.insertId, solicitud_id, tecnico_id, usuario_id, puntuacion, comentario };
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM calificaciones WHERE id = ?', [id]);
  return rows[0];
};

const findBySolicitud = async (solicitud_id) => {
  const [rows] = await pool.query('SELECT * FROM calificaciones WHERE solicitud_id = ?', [solicitud_id]);
  return rows[0];
};

const findByTecnico = async (tecnico_id) => {
  const [rows] = await pool.query(
    'SELECT * FROM calificaciones WHERE tecnico_id = ? ORDER BY fecha_calificacion DESC',
    [tecnico_id]
  );
  return rows;
};

const getPromedioByTecnico = async (tecnico_id) => {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS total, AVG(puntuacion) AS promedio FROM calificaciones WHERE tecnico_id = ?',
    [tecnico_id]
  );
  return rows[0];
};

module.exports = { create, findById, findBySolicitud, findByTecnico, getPromedioByTecnico };
