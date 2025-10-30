const router = require("express").Router();
router.get("/health", (_req, res) => res.json({ ok: true }));
router.use("/auth",     require("./auth.routes"));
router.use("/students", require("./student.routes"));
router.use("/practices", require("./practice.routes"));
router.use("/hitos", require("./hito.routes"));
module.exports = router;