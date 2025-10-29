const mongoose = require("mongoose");

const StudentProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true },
    Names: { type: String, required: true },
    lastNamePaternal: { type: String, required: true },
    lastNameMaternal: { type: String, required: true },
    rut: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    institutionalEmail: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);