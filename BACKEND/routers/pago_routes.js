const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pago_controller');

router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.get('/solicitud/:id', ctrl.getBySolicitud);
router.put('/:id/estado', ctrl.updateEstado);

module.exports = router;
