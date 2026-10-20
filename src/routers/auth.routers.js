const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth_controller');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/login-tecnico', ctrl.loginTecnico);

module.exports = router;