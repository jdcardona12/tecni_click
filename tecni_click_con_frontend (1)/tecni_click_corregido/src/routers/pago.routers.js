const router = require('express').Router();
const { verificarToken, permitirRoles } = require('../config/auto_midelware');
const ctrl = require('../controllers/pago_controller');

router.use(verificarToken);
router.get('/solicitud/:id', ctrl.getBySolicitud);
router.get('/:id', ctrl.getById);
router.post('/', permitirRoles('cliente', 'admin'), ctrl.create);
router.put('/:id/estado', permitirRoles('admin'), ctrl.updateEstado);
module.exports = router;
