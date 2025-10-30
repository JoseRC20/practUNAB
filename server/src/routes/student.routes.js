const router = require("express").Router();
const auth = require("../middleware/auth");
const allow = require("../middleware/rbac");
const studentController = require("../controllers/student.controller");

// Use explicit role name 'student' with the RBAC middleware
router.get("/me", auth, allow('student'), studentController.getMe);
router.put("/me", auth, allow('student'), studentController.upsertMe);
router.get("/HomeAlumno", auth, allow('student'), (req, res) => {
    res.status(200).json({ message: "Bienvenido al Home del Estudiante" });
});

module.exports = router;