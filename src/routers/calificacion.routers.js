const router = require('express').Router();
const { verificarToken, permitirRoles } = require('../config/auto_midelware');
const ctrl = require('../controllers/calificacion_controller');

router.use(verificarToken);
router.get('/tecnico/:id', ctrl.getByTecnico);
router.get('/solicitud/:id', ctrl.getBySolicitud);
router.get('/:id', ctrl.getById);
router.post('/', permitirRoles('cliente'), ctrl.create);
module.exports = router;
