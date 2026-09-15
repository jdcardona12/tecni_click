const calificacionModel = require('../models/calificacion.model');
const solicitudModel = require('../models/solicitud.model');

const create = async (req, res) => {
  try {
    const { solicitud_id, tecnico_id, usuario_id, puntuacion, comentario } = req.body;

    if (!solicitud_id || !tecnico_id || !usuario_id || !puntuacion) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos: solicitud_id, tecnico_id, usuario_id o puntuacion' });
    }

    if (puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ ok: false, msg: 'La puntuación debe estar entre 1 y 5' });
    }

    const solicitud = await solicitudModel.findById(solicitud_id);
    if (!solicitud) {
      return res.status(404).json({ ok: false, msg: 'Solicitud no encontrada' });
    }

    if (solicitud.estado !== 'completado') {
      return res.status(400).json({ ok: false, msg: 'Solo se puede calificar una solicitud completada' });
    }

    const existente = await calificacionModel.findBySolicitud(solicitud_id);
    if (existente) {
      return res.status(409).json({ ok: false, msg: 'Esta solicitud ya fue calificada' });
    }

    const nuevaCalificacion = await calificacionModel.create({ solicitud_id, tecnico_id, usuario_id, puntuacion, comentario });
    res.status(201).json({ ok: true, data: nuevaCalificacion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const calificacion = await calificacionModel.findById(req.params.id);
    if (!calificacion) {
      return res.status(404).json({ ok: false, msg: 'Calificación no encontrada' });
    }
    res.json({ ok: true, data: calificacion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const getByTecnico = async (req, res) => {
  try {
    const calificaciones = await calificacionModel.findByTecnico(req.params.id);
    const promedio = await calificacionModel.getPromedioByTecnico(req.params.id);

    res.json({
      ok: true,
      data: {
        calificaciones,
        total: promedio.total,
        promedio: promedio.promedio ? Number(promedio.promedio).toFixed(1) : null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const getBySolicitud = async (req, res) => {
  try {
    const calificacion = await calificacionModel.findBySolicitud(req.params.id);
    if (!calificacion) {
      return res.status(404).json({ ok: false, msg: 'Esta solicitud no tiene calificación' });
    }
    res.json({ ok: true, data: calificacion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

module.exports = { create, getById, getByTecnico, getBySolicitud };
