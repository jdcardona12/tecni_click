const pool = require('../config/db');

const create = async ({ solicitud_id, monto, metodo_pago }) => {
  const [result] = await pool.query(
    'INSERT INTO pagos (solicitud_id, monto, metodo_pago, estado) VALUES (?, ?, ?, ?)',
    [solicitud_id, monto, metodo_pago, 'pendiente']
  );
  return { id: result.insertId, solicitud_id, monto, metodo_pago, estado: 'pendiente' };
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM pagos WHERE id = ?', [id]);
  return rows[0];
};

const findBySolicitud = async (solicitud_id) => {
  const [rows] = await pool.query('SELECT * FROM pagos WHERE solicitud_id = ? ORDER BY fecha_pago DESC', [solicitud_id]);
  return rows;
};

const updateEstado = async (id, estado) => {
  await pool.query('UPDATE pagos SET estado = ? WHERE id = ?', [estado, id]);
  return findById(id);
};

module.exports = { create, findById, findBySolicitud, updateEstado };
