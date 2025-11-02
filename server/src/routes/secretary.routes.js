const router = require("express").Router();
const auth = require("../middleware/auth");
const allow = require("../middleware/rbac");
const secretaryController = require("../controllers/secretary.controller");

// Secretary: list pending practices requiring approval
router.get('/pending', auth, allow('secretary'), secretaryController.listPendingForSecretary);

module.exports = router;