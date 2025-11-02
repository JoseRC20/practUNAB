const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const allow = require('../middleware/rbac');

router.get('/users', auth, allow('admin'), adminController.listUsers);
router.post('/users', auth, allow('admin'), adminController.createUser);
router.delete('/users/:id', auth, allow('admin'), adminController.deleteUser);

module.exports = router;
