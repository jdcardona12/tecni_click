const solicitudModel = require('../models/solicitud.model');

const create = async (req, res) => {
  try {
    const { electrodomestico, descripcion } = req.body;
    const usuario_id = req.usuario.id;

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
    if (solicitud && req.usuario.rol !== 'admin' && String(solicitud.usuario_id) !== String(req.usuario.id) && req.usuario.rol !== 'tecnico') {
      return res.status(403).json({ ok: false, msg: 'No autorizado para consultar esta solicitud.' });
    }
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
    if (req.usuario.rol !== 'admin' && String(req.usuario.id) !== String(req.params.id)) {
      return res.status(403).json({ ok: false, msg: 'No autorizado para consultar estas solicitudes.' });
    }
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

    if (req.usuario.rol === 'tecnico' && String(existente.tecnico_id) !== String(req.usuario.id)) {
      return res.status(403).json({ ok: false, msg: 'Solo puedes cambiar el estado de tus propias solicitudes.' });
    }

    const actualizada = await solicitudModel.updateEstado(req.params.id, estado);
    res.json({ ok: true, data: actualizada });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const getDisponibles = async (req, res) => {
  try {
    res.json({ ok: true, data: await solicitudModel.findDisponibles() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const getByTecnico = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin' && String(req.usuario.id) !== String(req.params.id)) {
      return res.status(403).json({ ok: false, msg: 'No autorizado para consultar estas solicitudes.' });
    }
    res.json({ ok: true, data: await solicitudModel.findByTecnico(req.params.id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const aceptar = async (req, res) => {
  try {
    const aceptada = await solicitudModel.aceptar(req.params.id, req.usuario.id);
    if (!aceptada) {
      return res.status(409).json({ ok: false, msg: 'Esta solicitud ya no está disponible (otro técnico la tomó o fue cancelada).' });
    }
    res.json({ ok: true, msg: 'Solicitud aceptada', data: await solicitudModel.findById(req.params.id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

module.exports = { create, getById, getByUsuario, getDisponibles, getByTecnico, aceptar, updateEstado };