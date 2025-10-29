const router = require("express").Router();
const { signup, login } = require("../controllers/auth.controller");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");

// Registro de usuario
router.post("/register", async (req, res) => {
    try {
        const { name, apellidoP, apellidoM, rut, phone, email, password, role } = req.body;
        const allowedRoles = ["student", "teacher", "secretary"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: "Rol inválido" });
        }
        const newUser = new User({
            firstName: name,
            lastNamePaternal: apellidoP,
            lastNameMaternal: apellidoM,
            rut: rut,
            phone: phone,
            email: email,
            password: password,
            role: role
        });
        await newUser.save();
        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: "Error de validación", details: error.errors });
        }
        console.error(error);
        res.status(500).json({ error: "Error al registrar el usuario" });
    }
});

// Login de usuario
router.post("/login", login);

// Signup (si lo necesitas)
router.post("/signup", signup);

module.exports = router;
