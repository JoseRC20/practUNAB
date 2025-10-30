const Hito = require('../models/HitoSchema');
const fs = require('fs');

const removeFileSafe = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) { console.warn('cleanup error', e.message); }
};

exports.getHitosByStudent = async (req, res) => {
    try {
        const studentId = req.params.studentId || req.user.id;
        const hitos = await Hito.find({ student: studentId }).sort({ milestoneNumber: 1 });
        res.json(hitos);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching hitos', error: err.message });
    }
};

exports.getHitoById = async (req, res) => {
    try {
        const hito = await Hito.findById(req.params.id);
        if (!hito) return res.status(404).json({ message: 'Hito no encontrado' });
        res.json(hito);
    } catch (err) {
    res.status(500).json({ message: 'Error fetching hito', error: err.message });
    }
};

exports.createOrUploadHitoFile = async (req, res) => {
    try {
        const studentId = req.user && req.user.id;
        if (!studentId) return res.status(401).json({ message: 'Autenticación requerida (req.user.id faltante)' });

        const { milestoneNumber, title, description } = req.body;
        if (!milestoneNumber) {
            // si multer guardó archivo, eliminarlo
            if (req.file && req.file.path) removeFileSafe(req.file.path);
            return res.status(400).json({ message: 'milestoneNumber requerido' });
        }

        if (!req.file) return res.status(400).json({ message: 'Archivo (file) requerido' });

        const fileMeta = {
            originalName: req.file.originalname,
            storagePath: req.file.path,
            mimeType: req.file.mimetype,
            size: req.file.size,
            uploadedAt: new Date(),
            uploadedBy: req.user.id,
        };

        let hito = await Hito.findOne({ student: studentId, milestoneNumber: Number(milestoneNumber) });
        if (!hito) {
            hito = new Hito({
                student: studentId,
                milestoneNumber: Number(milestoneNumber),
                title: title || '',
                description: description || '',
                status: 'enviado',
                files: [fileMeta],
                submittedAt: new Date(),
            });
        } else {
            hito.files.push(fileMeta);
            hito.status = 'enviado';
            hito.submittedAt = hito.submittedAt || new Date();
            if (title) hito.title = title;
            if (description) hito.description = description;
        }

        await hito.save();
        return res.status(201).json(hito);
    } catch (err) {
        console.error('createOrUploadHitoFile ERROR:', err.stack || err);
        if (req && req.file && req.file.path) removeFileSafe(req.file.path);
        return res.status(500).json({ message: 'Error creating/updating hito', error: err.message });
    }
};

exports.updateHitoStatus = async (req, res) => {
    try {
        const { status, reviewerComments, grade } = req.body;
        const hito = await Hito.findById(req.params.id);
        if (!hito) return res.status(404).json({ message: 'Hito no encontrado' });

        hito.status = status || hito.status;
        if (reviewerComments) hito.reviewerComments = reviewerComments;
        if (grade) hito.grade = grade;
        if (status === 'aprobado' || status === 'rechazado') hito.reviewedAt = new Date();

        await hito.save();
        res.json(hito);
    } catch (err) {
        res.status(500).json({ message: 'Error updating status', error: err.message });
    }
};