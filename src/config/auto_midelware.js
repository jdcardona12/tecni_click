const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, msg: 'Token requerido. Usa Authorization: Bearer <token>.' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) return res.status(401).json({ ok: false, msg: 'Token requerido.' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ ok: false, msg: 'Token inválido o expirado.' });
  }
};

const permitirRoles = (...roles) => (req, res, next) => {
  if (!req.usuario || !roles.includes(req.usuario.rol)) {
    return res.status(403).json({ ok: false, msg: 'No tienes permisos para realizar esta acción.' });
  }
  return next();
};

module.exports = { verificarToken, permitirRoles };
