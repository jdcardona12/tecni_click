const router = require('express').Router();
const { verificarToken } = require('../config/auto_midelware');
const ctrl = require('../controllers/tecnico_controller');

router.get('/actual', verificarToken, ctrl.actual);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', verificarToken, ctrl.update);
router.delete('/:id', verificarToken, ctrl.remove);

module.exports = router;