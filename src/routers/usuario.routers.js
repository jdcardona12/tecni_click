const router = require('express').Router();
const { verificarToken } = require('../config/auto_midelware');
const ctrl = require('../controllers/Usuario_controller');

router.get('/actual', verificarToken, ctrl.actual);
router.get('/', verificarToken, ctrl.getAll);
router.get('/:id', verificarToken, ctrl.getById);
router.put('/:id', verificarToken, ctrl.update);
router.delete('/:id', verificarToken, ctrl.remove);

module.exports = router;