const ProfessorProfile = require('../models/ProfessorProfile');
const StudentProfile = require('../models/StudentProfile');

exports.listProfessors = async (req, res) => {
  try {
    const profs = await ProfessorProfile.find().select('-__v').lean();
    res.json({ items: profs });
  } catch (err) {
    res.status(500).json({ error: 'Error listing professors', details: err.message });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const prof = await ProfessorProfile.findOne({ user: req.user.id })
      .populate({ path: 'listStudents', select: 'Names lastNamePaternal lastNameMaternal rut institutionalEmail user', populate: { path: 'user', select: '_id email' } })
      .lean();
    if (!prof) return res.status(404).json({ error: 'Profesor no encontrado' });
    res.json({ profile: prof });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching profile', details: err.message });
  }
};

exports.getStudentsForProfessor = async (req, res) => {
  try {
    const { id } = req.params;
    // If requester is a professor ensure they are requesting their own students
    if (req.user.role === 'professor') {
      const prof = await ProfessorProfile.findOne({ user: req.user.id }).lean();
      if (!prof) return res.status(404).json({ error: 'Profesor no encontrado' });
      if (String(prof._id) !== String(id) && String(prof.user) !== String(id)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Prefer direct StudentProfile query by professor field if available
    const students = await StudentProfile.find({ professor: id })
      .select('Names lastNamePaternal lastNameMaternal rut institutionalEmail')
      .lean();

    // Fallback: if none found, try to find by professor.listStudents
    if (!students.length) {
      const prof = await ProfessorProfile.findById(id)
        .populate({ path: 'listStudents', select: 'Names lastNamePaternal lastNameMaternal rut institutionalEmail user', populate: { path: 'user', select: '_id email' } })
        .lean();
      if (!prof) return res.status(404).json({ error: 'Profesor no encontrado' });
      return res.json({ students: prof.listStudents || [] });
    }

    res.json({ students });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching students', details: err.message });
  }
};
