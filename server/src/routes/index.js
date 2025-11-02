const router = require("express").Router();
router.get("/health", (_req, res) => res.json({ ok: true }));
router.use("/auth",     require("./auth.routes"));
router.use("/students", require("./student.routes"));
router.use("/practices", require("./practice.routes"));
router.use("/hitos", require("./hito.routes"));
router.use('/admin', require('./admin.routes'));
router.use('/secretary', require('./secretary.routes'));
// Use plural '/professors' to match client endpoints (e.g. /api/professors/me)
router.use('/professors', require('./professor.routes'));
module.exports = router;