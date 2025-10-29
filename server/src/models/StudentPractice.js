const mongoose = require('mongoose');

const StudentPracticeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student', // Referencia al esquema del perfil del estudiante
    required: true,
  },
  practice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Practice', // Referencia al esquema de práctica
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StudentPractice', StudentPracticeSchema);