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

module.exports = { getAll, getById, create };