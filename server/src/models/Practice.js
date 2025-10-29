const { FileEnumerator } = require("eslint/use-at-your-own-risk");
const mongoose = require("mongoose");

const PracticaProfileSchema = new mongoose.Schema({
    fechaInicioPractica: { type: Date, required: true },
    fechaTerminoPractica: { type: Date, required: true },
    career: { type: String, required: true },
    jornada: { type: String, enum: ["Diurna", "Vespertina"], required: true },
    tipoPractica: { type: String, enum: ["Práctica I", "Práctica II"], required: true },
    empresaNombre: { type: String, required: true },
    empresaRut: { type: String, required: true },
    empresaGiro: { type: String, required: true },
    empresaDireccion: { type: String, required: true },
    empresaComuna: { type: String, required: true },
    empresaCiudad: { type: String, required: true },
    empresaRegion: { type: String, required: true },
    empresaTelefono: { type: String, required: true },
    empresaWeb: { type: String, required: true },
    empresaEmail: { type: String, required: true },
    cartaNombre: { type: String, required: true },
    cartaCargo: { type: String, required: true },
    cartaEmail: { type: String, required: true },
    supervisorNombre: { type: String, required: true },
    supervisorCargo: { type: String, required: true },
    supervisorTelefono: { type: String, required: true },
    supervisorEmail: { type: String, required: true },
    observacion: { type: String, required: true },
    firmaAlumno: { type: Buffer, required: true },
    firmaEmpresa: { type: Buffer, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['no iniciado', 'pendiente', 'rechazado', 'aprobado'],
        default: 'no iniciado',
    },
});

module.exports = mongoose.model("PracticaProfile", PracticaProfileSchema);