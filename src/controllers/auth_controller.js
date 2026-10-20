const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');
const tecnicoModel = require('../models/tecnico.model');

const generarToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const register = async (req, res) => {
  try {
    const { nombre, telefono, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos: nombre, email o password' });
    }

    const existente = await usuarioModel.findByEmail(email);
    if (existente) {
      return res.status(409).json({ ok: false, msg: 'Ese email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const nuevoUsuario = await usuarioModel.create({ nombre, telefono, email, password: hash });

    res.status(201).json({ ok: true, data: nuevoUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos: email o password' });
    }

    const usuario = await usuarioModel.findByEmail(email);
    if (!usuario) {
      return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ ok: false, msg: 'Contraseña incorrecta' });
    }

    const token = generarToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.tipo_usuario
    });

    res.json({
      ok: true,
      msg: 'Login exitoso',
      token,
      data: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

const loginTecnico = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos: email o password' });
    }

    const tecnico = await tecnicoModel.findByEmail(email);
    if (!tecnico) {
      return res.status(404).json({ ok: false, msg: 'Técnico no encontrado' });
    }

    const passwordValida = await bcrypt.compare(password, tecnico.password);
    if (!passwordValida) {
      return res.status(401).json({ ok: false, msg: 'Contraseña incorrecta' });
    }

    const token = generarToken({
      id: tecnico.id,
      email: tecnico.email,
      rol: 'tecnico'
    });

    res.json({
      ok: true,
      msg: 'Login exitoso',
      token,
      data: { id: tecnico.id, nombre: tecnico.nombre, email: tecnico.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

module.exports = { register, login, loginTecnico };