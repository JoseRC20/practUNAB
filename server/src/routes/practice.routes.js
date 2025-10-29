const router = require("express").Router();
const auth = require("../middleware/auth");
const allow = require("../middleware/rbac");
const Practice = require("../models/Practice");
const c = require("../controllers/practice.controller");


// Endpoint to create a practice and set status to 'pendiente'
router.post("/", auth, allow('student'), async (req, res) => {
  try {
    const practiceData = { ...req.body, status: "pendiente", student: req.user.id };
    const practice = new Practice(practiceData);
    await practice.save();
    res.status(201).json(practice);
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
router.get("/mine", auth, allow(0), c.listMine);

// Endpoint to review milestones by staff
router.post("/review", auth, allow(1, 2), c.reviewMilestone);

// Endpoint to update practice status by Secretaría
router.patch("/:id/status", auth, allow(1), async (req, res) => {
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