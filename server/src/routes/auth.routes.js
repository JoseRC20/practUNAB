const router = require("express").Router();
const { signup, login } = require("../controllers/auth.controller");

// Registro de usuario
router.post("/register", signup);

// Login de usuario
router.post("/login", login);


module.exports = router;
