const router = require("express").Router();
const auth = require("../middleware/auth");
const allow = require("../middleware/rbac");

router.get("/me",     auth, allow(0), require("../controllers/student.controller").getMe);
router.put("/me",     auth, allow(0), require("../controllers/student.controller").upsertMe);
router.get("/HomeAlumno", auth, (req, res) => {
    if (req.user.role !== "student") {
        return res.status(403).json({ message: "Acceso denegado. Solo los estudiantes pueden acceder a esta página." });
    }
    res.status(200).json({ message: "Bienvenido al Home del Estudiante" });
});

module.exports = router;