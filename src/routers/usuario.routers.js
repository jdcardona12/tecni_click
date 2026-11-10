const router = require('express').Router();
const { verificarToken, permitirRoles } = require('../config/auto_midelware');
const ctrl = require('../controllers/Usuario_controller');

router.use(verificarToken);
router.get('/actual', ctrl.actual);
router.get('/', permitirRoles('admin'), ctrl.getAll);
router.get('/:id', ctrl.getById);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
module.exports = router;
