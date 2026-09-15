const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/calificacion_controller');

router.post('/', ctrl.create);
router.get('/:id', ctrl.getById);
router.get('/tecnico/:id', ctrl.getByTecnico);
router.get('/solicitud/:id', ctrl.getBySolicitud);

module.exports = router;
