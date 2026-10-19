const router = require('express').Router();
const { verificarToken, permitirRoles } = require('../config/auto_midelware');
const ctrl = require('../controllers/tecnico_controller');

router.get('/', ctrl.getAll);
router.get('/actual', verificarToken, permitirRoles('tecnico'), ctrl.actual);
router.get('/:id', ctrl.getById);
router.post('/', verificarToken, permitirRoles('admin'), ctrl.create);
router.put('/:id', verificarToken, permitirRoles('admin', 'tecnico'), ctrl.update);
router.delete('/:id', verificarToken, permitirRoles('admin'), ctrl.remove);
module.exports = router;
