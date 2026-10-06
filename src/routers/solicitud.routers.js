const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/solicitud_controller');

router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.get('/usuario/:id', ctrl.getByUsuario);
router.put('/:id', ctrl.updateEstado);

module.exports = router;