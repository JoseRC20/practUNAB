const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const StudentProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    Names: { type: String, required: true },
    lastNamePaternal: { type: String, required: true },
    lastNameMaternal: { type: String, required: true },
    rut: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    institutionalEmail: { type: String, required: true, unique: true },
    professorEmail: { type: String },
    // Link to the professor profile (optional)
    professor: { type: mongoose.Schema.Types.ObjectId, ref: 'ProfessorProfile' },
    practices: [{ type: mongoose.Schema.Types.ObjectId, ref: "PracticaProfile" }], // Array of professional practices
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


// Ensure the referenced user exists and has the 'student' role
StudentProfileSchema.pre('validate', async function (next) {
    try {
        // Use mongoose model to avoid circular requires
        const User = mongoose.model('User');
        const user = await User.findById(this.user);
        if (!user) return next(new Error('Referenced user not found'));
        if (user.role !== 'student') return next(new Error('Referenced user must have role "student"'));
        next();
    } catch (err) {
        next(err);
    }
});

// Passwords are stored only on the User model. StudentProfile does not keep credentials.

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);