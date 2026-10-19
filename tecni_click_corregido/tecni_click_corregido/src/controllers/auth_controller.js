const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');
const tecnicoModel = require('../models/tecnico.model');

const generarToken = (payload) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe configurarse en .env con al menos 32 caracteres.');
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
};

const register = async (req, res) => {
  try {
    let { nombre, telefono, email, password } = req.body;
    nombre = typeof nombre === 'string' ? nombre.trim() : '';
    email = typeof email === 'string' ? email.trim().toLowerCase() : '';
    telefono = telefono ? String(telefono).trim() : null;

    if (!nombre || !email || !password) return res.status(400).json({ ok: false, msg: 'Nombre, email y contraseña son obligatorios.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, msg: 'El correo no tiene un formato válido.' });
    if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ ok: false, msg: 'La contraseña debe tener al menos 8 caracteres.' });

    if (await usuarioModel.findByEmail(email) || await tecnicoModel.findByEmail(email)) {
      return res.status(409).json({ ok: false, msg: 'Ese correo ya está registrado.' });
    }

    const hash = await bcrypt.hash(password, 12);
    const data = await usuarioModel.create({ nombre, telefono, email, password: hash });
    const token = generarToken({ id: data.id, email, rol: 'cliente' });
    return res.status(201).json({ ok: true, msg: 'Usuario registrado correctamente.', token, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'No fue posible registrar el usuario.' });
  }
};

const login = async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, msg: 'Email y contraseña son obligatorios.' });

    const usuario = await usuarioModel.findByEmail(email);
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(401).json({ ok: false, msg: 'Credenciales incorrectas.' });
    }
    if (Number(usuario.activo) === 0) return res.status(403).json({ ok: false, msg: 'La cuenta está desactivada.' });

    const token = generarToken({ id: usuario.id, email: usuario.email, rol: usuario.tipo_usuario || 'cliente' });
    return res.json({ ok: true, msg: 'Inicio de sesión exitoso.', token, data: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.tipo_usuario || 'cliente' } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'No fue posible iniciar sesión.' });
  }
};

const loginTecnico = async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, msg: 'Email y contraseña son obligatorios.' });

    const tecnico = await tecnicoModel.findByEmail(email);
    if (!tecnico || !(await bcrypt.compare(password, tecnico.password))) {
      return res.status(401).json({ ok: false, msg: 'Credenciales incorrectas.' });
    }
    if (Number(tecnico.activo) === 0) return res.status(403).json({ ok: false, msg: 'La cuenta está desactivada.' });

    const token = generarToken({ id: tecnico.id, email: tecnico.email, rol: 'tecnico' });
    return res.json({ ok: true, msg: 'Inicio de sesión exitoso.', token, data: { id: tecnico.id, nombre: tecnico.nombre, email: tecnico.email, rol: 'tecnico' } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, msg: 'No fue posible iniciar sesión.' });
  }
};

module.exports = { register, login, loginTecnico };
