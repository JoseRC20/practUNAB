const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const ProfessorProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    Names: { type: String, required: true },
    lastNamePaternal: { type: String, required: true },
    lastNameMaternal: { type: String, required: true },
    rut: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    institutionalEmail: { type: String, required: true, unique: true },
    listStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: "StudentProfile" }], // Array of associated students
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ProfessorProfileSchema.pre('validate', async function (next) {
    try {
        // Use mongoose model to avoid circular requires
        const User = mongoose.model('User');
        const user = await User.findById(this.user);
        if (!user) return next(new Error('Referenced user not found'));
        if (user.role !== 'professor') return next(new Error('Referenced user must have role "professor"'));
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model("ProfessorProfile", ProfessorProfileSchema);