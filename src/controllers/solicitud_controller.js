const solicitudModel = require('../models/solicitud.model');

const create = async (req, res) => {
  try {
    const { usuario_id, electrodomestico, descripcion } = req.body;

    if (!usuario_id || !electrodomestico) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos: usuario_id o electrodomestico' });
    }

    const nuevaSolicitud = await solicitudModel.create({ usuario_id, electrodomestico, descripcion });
    res.status(201).json({ ok: true, data: nuevaSolicitud });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const solicitud = await solicitudModel.findById(req.params.id);
    if (!solicitud) {
      return res.status(404).json({ ok: false, msg: 'Solicitud no encontrada' });
    }
    res.json({ ok: true, data: solicitud });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const getByUsuario = async (req, res) => {
  try {
    const solicitudes = await solicitudModel.findByUsuario(req.params.id);
    res.json({ ok: true, data: solicitudes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const updateEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'en_proceso', 'completado', 'cancelado'];

    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ ok: false, msg: 'Estado inválido. Usa: ' + estadosValidos.join(', ') });
    }

    const existente = await solicitudModel.findById(req.params.id);
    if (!existente) {
      return res.status(404).json({ ok: false, msg: 'Solicitud no encontrada' });
    }

    const actualizada = await solicitudModel.updateEstado(req.params.id, estado);
    res.json({ ok: true, data: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

module.exports = { create, getById, getByUsuario, updateEstado };