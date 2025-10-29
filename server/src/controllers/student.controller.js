const StudentProfile = require("../models/StudentProfile");

exports.getMe = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id }).lean();
    res.json({ profile });
  } catch (e) { next(e); }
};

exports.upsertMe = async (req, res, next) => {
  try {
    const update = req.body;
    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id }, 
      { ...update, user: req.user.id }, 
      { upsert: true, new: true }
    );
    res.json({ profile });
  } catch (e) { next(e); }
};