const bcrypt = require('bcryptjs');
const usuarioModel = require('../models/usuario.model');

const register = async (req, res) => {
  try {
    const { nombre, telefono, email, password, tipo_usuario } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ ok: false, msg: 'Faltan datos: nombre, email o password' });
    }

    const existente = await usuarioModel.findByEmail(email);
    if (existente) {
      return res.status(409).json({ ok: false, msg: 'Ese email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const nuevoUsuario = await usuarioModel.create({ nombre, telefono, email, password: hash, tipo_usuario });

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

    res.json({ ok: true, msg: 'Login exitoso', data: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Error en el servidor' });
  }
};

module.exports = { register, login };