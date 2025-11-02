const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    originalName: { type: String, required: true },
    storagePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

const HitosSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    milestoneNumber: { type: Number, required: true },
    title: { type: String, default: '', required: true },
    description: { type: String, default: '' },
    status: {
        type: String,
        enum: ['no_iniciado', 'enviado', 'aprobado', 'rechazado'],
        default: 'no_iniciado',
        index: true
    },
    files: { type: [FileSchema], default: [] },
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewerComments: { type: String, default: '' }
}, { timestamps: true});

HitosSchema.index({ student: 1, milestoneNumber: 1 }, { unique: true });

module.exports = mongoose.model('Hitos', HitosSchema);