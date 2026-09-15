const pagoModel = require('../models/pago.model');
const solicitudModel = require('../models/solicitud.model');

const metodosValidos = ['efectivo', 'tarjeta', 'transferencia', 'nequi', 'daviplata'];
const estadosValidos = ['pendiente', 'pagado', 'rechazado', 'reembolsado'];

const create = async (req, res) => {
  try {
    const { solicitud_id, monto, metodo_pago } = req.body;

    if (!solicitud_id || !monto || !metodo_pago) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos: solicitud_id, monto o metodo_pago' });
    }

    if (isNaN(monto) || monto <= 0) {
      return res.status(400).json({ ok: false, msg: 'El monto debe ser un número mayor a 0' });
    }

    if (!metodosValidos.includes(metodo_pago)) {
      return res.status(400).json({ ok: false, msg: 'Método inválido. Usa: ' + metodosValidos.join(', ') });
    }

    const solicitud = await solicitudModel.findById(solicitud_id);
    if (!solicitud) {
      return res.status(404).json({ ok: false, msg: 'Solicitud no encontrada' });
    }

    const nuevoPago = await pagoModel.create({ solicitud_id, monto, metodo_pago });
    res.status(201).json({ ok: true, data: nuevoPago });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const pago = await pagoModel.findById(req.params.id);
    if (!pago) {
      return res.status(404).json({ ok: false, msg: 'Pago no encontrado' });
    }
    res.json({ ok: true, data: pago });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const getBySolicitud = async (req, res) => {
  try {
    const pagos = await pagoModel.findBySolicitud(req.params.id);
    res.json({ ok: true, data: pagos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const updateEstado = async (req, res) => {
  try {
    const { estado } = req.body;

    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ ok: false, msg: 'Estado inválido. Usa: ' + estadosValidos.join(', ') });
    }

    const existente = await pagoModel.findById(req.params.id);
    if (!existente) {
      return res.status(404).json({ ok: false, msg: 'Pago no encontrado' });
    }

    const actualizado = await pagoModel.updateEstado(req.params.id, estado);
    res.json({ ok: true, data: actualizado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

module.exports = { create, getById, getBySolicitud, updateEstado };
