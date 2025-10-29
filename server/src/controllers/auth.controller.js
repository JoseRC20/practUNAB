const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const { signAccess, signRefresh } = require("../utils/tokens");

exports.signup = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.create({ email, password, role });
        const access = signAccess({ id: user._id, role: user.role, email: user.email });
        const refresh = signRefresh({ id: user._id });
        res.status(201).json({ user: { id: user._id, email, role}, tokens: { access, refresh }});
    } catch (e) { next(e); }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }
        // Generar token
        const token = signAccess({ id: user.id, role: user.role, email: user.email });
        // Si es estudiante, buscar perfil
        let studentProfile = null;
        if (user.role === "student") {
            studentProfile = await StudentProfile.findOne({ user: user._id }).lean();
        }
        // Responder con token y perfil si corresponde
        res.json({ token, studentProfile });
    } catch (err) {
        console.error("Error en el login:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};