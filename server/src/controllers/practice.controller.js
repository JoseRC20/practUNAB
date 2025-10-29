const Practice = require("../models/Practice");

exports.create = async (req, res, next) => {
  try {
    const body = { ...req.body, student: req.user.id };
    const practice = await Practice.create(body);
    res.status(201).json({ practice });
  } catch (e) { next(e); }
};

exports.listMine = async (req, res, next) => {
  try {
    const rows = await Practice.find({ student: req.user.id }).lean();
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
    res.json({ practice: p });
  } catch (e) { next(e); }
};