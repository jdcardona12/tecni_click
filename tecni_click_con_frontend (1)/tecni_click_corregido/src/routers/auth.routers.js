const router = require('express').Router();
const { rateLimit } = require('express-rate-limit');
const ctrl = require('../controllers/auth_controller');

const limiteAuth = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
router.post('/register', limiteAuth, ctrl.register);
router.post('/register-tecnico', limiteAuth, ctrl.registerTecnico);
router.post('/login', limiteAuth, ctrl.login);
router.post('/login-tecnico', limiteAuth, ctrl.loginTecnico);
module.exports = router;
