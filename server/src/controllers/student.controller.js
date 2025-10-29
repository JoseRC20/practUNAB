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

exports.createFromRegistration = async (regData, userId) => {
  try {
    const payload = {
      user: userId,
      name: regData.name || '',
      apellidoP: regData.apellidoP || '',
      apellidoM: regData.apellidoM || '',
      rut: regData.rut || '',
      phone: regData.phone || '',
      institutionalemail: regData.institutionalemail || ''
      // Añade aquí otros campos requeridos por StudentProfile con valores por defecto si hace falta
    };

    const profile = await StudentProfile.findOneAndUpdate(
      { user: userId },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return profile;
  } catch (err) {
    throw err;
  }
};