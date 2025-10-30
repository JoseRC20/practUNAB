const StudentProfile = require("../models/StudentProfile");

exports.getMe = async (req, res, next) => {
  try {
    // Return the student's profile, excluding sensitive fields and populating related data
    const profile = await StudentProfile.findOne({ user: req.user.id })
      .select('-password -__v')
      .populate('user', 'firstName lastNamePaternal lastNameMaternal email')
      .populate('practices')
      .lean();
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ profile });
  } catch (e) { next(e); }
};

exports.upsertMe = async (req, res, next) => {
  try {
    // Whitelist fields allowed to be updated on the student profile
    const allowedFields = [
      'Names', 'lastNamePaternal', 'lastNameMaternal', 'phone', 'institutionalEmail', 'practices'
    ];
    const update = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

    await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { ...update, user: req.user.id },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const profile = await StudentProfile.findOne({ user: req.user.id })
      .select('-password -__v')
      .populate('user', 'firstName lastNamePaternal lastNameMaternal email')
      .populate('practices')
      .lean();

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