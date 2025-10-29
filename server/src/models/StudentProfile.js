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
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

StudentProfileSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

StudentProfileSchema.methods.comparePassword = function(plain) {
    return bcrypt.compare(plain, this.password);
}

module.exports = mongoose.model("StudentProfile", StudentProfileSchema);