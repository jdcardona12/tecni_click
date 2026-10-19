const bcrypt = require('bcryptjs');
const tecnicoModel = require('../models/tecnico.model');

const getAll = async (req, res) => {
  try {
    const tecnicos = await tecnicoModel.findAll();
    res.json({ ok: true, data: tecnicos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const tecnico = await tecnicoModel.findById(req.params.id);
    if (!tecnico) {
      return res.status(404).json({ ok: false, msg: 'Técnico no encontrado' });
    }
    res.json({ ok: true, data: tecnico });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, telefono, email, especialidad, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos: nombre, email o password' });
    }

    const existente = await tecnicoModel.findByEmail(email);
    if (existente) {
      return res.status(409).json({ ok: false, msg: 'Ese email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const nuevoTecnico = await tecnicoModel.create({ nombre, telefono, email, especialidad, password: hash });

    res.status(201).json({ ok: true, data: nuevoTecnico });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const update = async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin' && String(req.usuario.id) !== String(req.params.id)) {
      return res.status(403).json({ ok: false, msg: 'No autorizado para modificar este técnico.' });
    }
    const { nombre, telefono, email, especialidad } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos: nombre o email' });
    }

    const existente = await tecnicoModel.findByEmail(email);
    if (existente && String(existente.id) !== String(req.params.id)) {
      return res.status(409).json({ ok: false, msg: 'Ese correo ya está registrado por otro técnico.' });
    }
    const actualizado = await tecnicoModel.update(req.params.id, { nombre, telefono, email, especialidad });
    if (!actualizado) {
      return res.status(404).json({ ok: false, msg: 'Técnico no encontrado' });
    }

    res.json({ ok: true, msg: 'Técnico actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const remove = async (req, res) => {
  try {
    const eliminado = await tecnicoModel.remove(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ ok: false, msg: 'Técnico no encontrado' });
    }
    res.json({ ok: true, msg: 'Técnico eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const actual = async (req, res) => {
  try {
    const tecnico = await tecnicoModel.findById(req.usuario.id);
    if (!tecnico) {
      return res.status(404).json({ ok: false, msg: 'Técnico no encontrado' });
    }
    res.json({ ok: true, data: tecnico });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};
module.exports = { getAll, getById, create, update, remove, actual };