const { FileEnumerator } = require("eslint/use-at-your-own-risk");
const mongoose = require("mongoose");

const PracticaProfileSchema = new mongoose.Schema({
    fechaInicioPractica: { type: Date, required: false },
    fechaTerminoPractica: { type: Date, required: false },
    career: { type: String, required: false },
    jornada: { type: String, enum: ["Diurna", "Vespertina"], required: false },
    tipoPractica: { type: String, enum: ["Práctica I", "Práctica II"], required: false },
    empresaNombre: { type: String, required: false },
    empresaRut: { type: String, required: false },
    empresaGiro: { type: String, required: false },
    empresaDireccion: { type: String, required: false },
    empresaComuna: { type: String, required: false },
    empresaCiudad: { type: String, required: false },
    empresaRegion: { type: String, required: false },
    empresaTelefono: { type: String, required: false },
    empresaWeb: { type: String, required: false },
    empresaEmail: { type: String, required: false },
    cartaNombre: { type: String, required: false },
    cartaCargo: { type: String, required: false },
    cartaEmail: { type: String, required: false },
    supervisorNombre: { type: String, required: false },
    supervisorCargo: { type: String, required: false },
    supervisorTelefono: { type: String, required: false },
    supervisorEmail: { type: String, required: false },
    observacion: { type: String, required: false },
    FirmaAlumno: { type: Buffer, required: false },
    FirmaSupervisor: { type: Buffer, required: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['no iniciado', 'pendiente', 'rechazado', 'aprobado'],
        default: 'no iniciado',
    },
});

module.exports = mongoose.model("PracticaProfile", PracticaProfileSchema);