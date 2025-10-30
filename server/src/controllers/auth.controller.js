const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const { signAccess, signRefresh } = require("../utils/tokens");

exports.signup = async (req, res, next) => {
    try {
        // Accept full registration data
        const { name, apellidoP, apellidoM, rut, phone, email, password, role, institutionalEmail } = req.body;
        const allowedRoles = ["student", "teacher", "secretary"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: "Rol inválido" });
        }

        // Create User (authentication/identity)
        const user = await User.create({
            firstName: name,
            lastNamePaternal: apellidoP,
            lastNameMaternal: apellidoM,
            rut,
            phone,
            email,
            password,
            role
        });

        // If student, create associated StudentProfile
        let studentProfile = null;
        if (role === 'student') {
            studentProfile = await StudentProfile.create({
                user: user._id,
                Names: name,
                lastNamePaternal: apellidoP,
                lastNameMaternal: apellidoM,
                rut,
                phone,
                institutionalEmail: institutionalEmail || email,
                password, // will be hashed by StudentProfile pre-save hook
                practices: []
            });
            // Remove sensitive field before returning
            if (studentProfile && studentProfile.password) {
                studentProfile = studentProfile.toObject();
                delete studentProfile.password;
            }
        }

        const access = signAccess({ id: user._id, role: user.role, email: user.email });
        const refresh = signRefresh({ id: user._id });
        res.status(201).json({ user: { id: user._id, email: user.email, role: user.role}, tokens: { access, refresh }, studentProfile });
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