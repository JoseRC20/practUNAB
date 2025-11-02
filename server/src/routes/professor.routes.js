const router = require('express').Router();
const auth = require('../middleware/auth');
const allow = require('../middleware/rbac');
const c = require('../controllers/professor.controller');

// List all professors (admin)
router.get('/', auth, allow('admin'), c.listProfessors);

// Get profile for the authenticated professor
router.get('/me', auth, allow('professor'), c.getMyProfile);

// Get students for a professor by professor id (admin or the professor themselves)
router.get('/:id/students', auth, allow('professor', 'admin'), c.getStudentsForProfessor);

module.exports = router;
