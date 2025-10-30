const router = require("express").Router();
const auth = require("../middleware/auth");
const allow = require("../middleware/rbac");
const Practice = require("../models/Practice");
const StudentProfile = require("../models/StudentProfile");
const c = require("../controllers/practice.controller");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });


// Endpoint to create a practice and set status to 'pendiente'
router.post("/", auth, allow('student'), upload.fields([
  { name: "firmaAlumno", maxCount: 1 },
  { name: "firmaEmpresa", maxCount: 1 }
]), async (req, res) => {
  try {
    const practiceData = { ...req.body, status: "pendiente", student: req.user.id };
    
    if (req.files?.firmaAlumno?.[0]) practiceData.firmaAlumno = req.files.firmaAlumno[0].buffer;
    if (req.files?.firmaEmpresa?.[0]) practiceData.firmaEmpresa = req.files.firmaEmpresa[0].buffer;
    
    const practice = new Practice(practiceData);
    await practice.save();
      // Link the created practice into the student's profile (if exists)
      try {
        await StudentProfile.findOneAndUpdate(
          { user: req.user.id },
          { $push: { practices: practice._id } }
        );
      } catch (err) {
        // log but don't block the response — profile update failure isn't fatal here
        console.error('Failed to link practice to student profile:', err);
      }

      // Sanitize response: remove raw signature buffers before sending
      const response = practice.toObject();
      if (response.firmaAlumno) delete response.firmaAlumno;
      if (response.firmaEmpresa) delete response.firmaEmpresa;
      if (response.__v) delete response.__v;

      res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: "Error al crear la práctica", error });
  }
});

// Endpoint to list all practices
router.get("/", auth, allow('professor', 'secretary'), async (req, res) => {
  try {
    const practices = await Practice.find();
    res.status(200).json(practices);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las prácticas", error });
  }
});

// Endpoint to list practices of the authenticated student
router.get("/mine", auth, allow('student'), c.listMine);

// Endpoint to review milestones by staff
router.post("/review", auth, allow('professor', 'secretary'), c.reviewMilestone);

// Endpoint to update practice status by Secretaría
router.patch("/:id/status", auth, allow('secretary'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["aprobado", "rechazado"].includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }

    const practice = await Practice.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!practice) {
      return res.status(404).json({ message: "Práctica no encontrada" });
    }

    res.status(200).json(practice);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el estado", error });
  }
});



module.exports = router;