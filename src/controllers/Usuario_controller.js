const usuarioModel = require('../models/usuario.model');

// Solo el dueño de la cuenta o un admin pueden modificarla o eliminarla
const puedeModificar = (req) =>
  req.usuario.rol !== 'tecnico' &&
  (req.usuario.id == req.params.id || req.usuario.rol === 'admin');

const getAll = async (req, res) => {
  try {
    const usuarios = await usuarioModel.findAll();
    res.json({ ok: true, data: usuarios });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const usuario = await usuarioModel.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
    res.json({ ok: true, data: usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const actual = async (req, res) => {
  try {
    if (req.usuario.rol === 'tecnico') {
      return res.status(403).json({ ok: false, msg: 'Solo para usuarios' });
    }

    const usuario = await usuarioModel.findById(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }
    res.json({ ok: true, data: usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const update = async (req, res) => {
  try {
    if (!puedeModificar(req)) {
      return res.status(403).json({ ok: false, msg: 'No autorizado' });
    }

    const { nombre, telefono, email } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos: nombre o email' });
    }

    const existente = await usuarioModel.findByEmail(email);
    if (existente && existente.id != req.params.id) {
      return res.status(409).json({ ok: false, msg: 'Ese email ya está registrado' });
    }

    const actualizado = await usuarioModel.update(req.params.id, { nombre, telefono, email });
    if (!actualizado) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }

    res.json({ ok: true, msg: 'Usuario actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const remove = async (req, res) => {
  try {
    if (!puedeModificar(req)) {
      return res.status(403).json({ ok: false, msg: 'No autorizado' });
    }

    const eliminado = await usuarioModel.remove(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }

    res.json({ ok: true, msg: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

module.exports = { getAll, getById, actual, update, remove };