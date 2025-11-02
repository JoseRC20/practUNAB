const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const { signAccess, signRefresh } = require("../utils/tokens");

exports.signup = async (req, res, next) => {
    try {
    // Accept full registration data
    const { name, apellidoP, apellidoM, rut, phone, email, password, role, institutionalEmail, professorEmail } = req.body;
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
                professorEmail: professorEmail || null,
                practices: []
            });
            // If a professorEmail was provided, try to link the student to that professor
            if (studentProfile && studentProfile.professorEmail) {
                try {
                    const ProfessorProfile = require('../models/ProfessorProfile');
                    const prof = await ProfessorProfile.findOne({ institutionalEmail: studentProfile.professorEmail });
                    if (prof) {
                        studentProfile.professor = prof._id;
                        await studentProfile.save();
                        // also add the student to the professor's listStudents (avoid duplicates)
                        await ProfessorProfile.findByIdAndUpdate(prof._id, { $addToSet: { listStudents: studentProfile._id } });
                    }
                } catch (err) {
                    console.error('Failed to auto-link student to professor by email:', err);
                    // non-fatal
                }
            }
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
        // Generar access + refresh tokens (same shape as signup)
        const access = signAccess({ id: user._id, role: user.role, email: user.email });
        const refresh = signRefresh({ id: user._id });

        // Si es estudiante, buscar perfil y sanitizar
        let studentProfile = null;
        if (user.role === "student") {
            studentProfile = await StudentProfile.findOne({ user: user._id }).lean();
            if (studentProfile && studentProfile.password) delete studentProfile.password;
        }

        // Responder con la misma estructura que signup: user + tokens + optional studentProfile
        res.json({ user: { id: user._id, email: user.email, role: user.role }, tokens: { access, refresh }, studentProfile });
    } catch (err) {
        console.error("Error en el login:", err);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};