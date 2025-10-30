const Practice = require("../models/Practice");
const StudentProfile = require("../models/StudentProfile");

exports.create = async (req, res, next) => {
  try {
    // Build practice payload, attach the authenticated user's id
    const practiceData = { ...req.body, student: req.user.id };

    // Attach uploaded signature buffers if provided
    if (req.files?.firmaAlumno?.[0]) practiceData.firmaAlumno = req.files.firmaAlumno[0].buffer;
    if (req.files?.firmaEmpresa?.[0]) practiceData.firmaEmpresa = req.files.firmaEmpresa[0].buffer;

    const practice = new Practice(practiceData);
    await practice.save();

    // Link the created practice into the student's profile (best-effort)
    try {
      await StudentProfile.findOneAndUpdate(
        { user: req.user.id },
        { $push: { practices: practice._id } }
      );
    } catch (err) {
      console.error('Failed to link practice to student profile:', err);
    }

    // Sanitize response: remove large binary fields and internal props
    const response = practice.toObject();
    if (response.firmaAlumno) delete response.firmaAlumno;
    if (response.firmaEmpresa) delete response.firmaEmpresa;
    if (response.__v) delete response.__v;

    res.status(201).json({ practice: response });
  } catch (e) { next(e); }
};

exports.listMine = async (req, res, next) => {
  try {
    // Exclude binary signature buffers from the response for performance/security
    const rows = await Practice.find({ student: req.user.id }).select('-firmaAlumno -firmaEmpresa -__v').lean();
    res.json({ items: rows });
  } catch (e) { next(e); }
};

// professor/secretary review milestone
exports.reviewMilestone = async (req, res, next) => {
  try {
    const { practiceId, milestoneName, status, feedback } = req.body;
    const p = await Practice.findById(practiceId);
    if (!p) return res.status(404).json({ error: "Not found" });

    const m = p.milestones.find(m => m.name === milestoneName);
    if (!m) return res.status(404).json({ error: "Milestone not found" });

    m.status = status; // e.g., "approved"
    m.reviewedBy = req.user.id;
    m.feedback = feedback ?? m.feedback;

    await p.save();

    // Return sanitized practice (exclude raw buffers)
    const returned = p.toObject();
    if (returned.firmaAlumno) delete returned.firmaAlumno;
    if (returned.firmaEmpresa) delete returned.firmaEmpresa;
    if (returned.__v) delete returned.__v;

    res.json({ practice: returned });
  } catch (e) { next(e); }
};