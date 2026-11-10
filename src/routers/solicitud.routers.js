const router = require('express').Router();
const { verificarToken, permitirRoles } = require('../config/auto_midelware');
const ctrl = require('../controllers/solicitud_controller');

router.use(verificarToken);
router.get('/disponibles', permitirRoles('tecnico', 'admin'), ctrl.getDisponibles);
router.get('/tecnico/:id', permitirRoles('tecnico', 'admin'), ctrl.getByTecnico);
router.get('/usuario/:id', ctrl.getByUsuario);
router.get('/:id', ctrl.getById);
router.post('/', permitirRoles('cliente', 'admin'), ctrl.create);
router.put('/:id/aceptar', permitirRoles('tecnico'), ctrl.aceptar);
router.put('/:id/estado', permitirRoles('tecnico', 'admin'), ctrl.updateEstado);
module.exports = router;
