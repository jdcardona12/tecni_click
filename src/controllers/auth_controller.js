const register = (req, res) => {
  res.status(201).json({ ok: true, msg: 'Usuario registrado' });
};

const login = (req, res) => {
  res.json({ ok: true, msg: 'Login exitoso' });
};

module.exports = { register, login };