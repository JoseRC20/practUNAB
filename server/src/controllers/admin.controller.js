const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -__v').lean();
    res.json({ users });
  } catch (err) { next(err); }
};

exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastNamePaternal, lastNameMaternal, rut, phone, email, password, role, institutionalEmail, professorEmail } = req.body;
    const allowedRoles = ['student','teacher','secretary','admin'];
    if (!allowedRoles.includes(role)) return res.status(400).json({ error: 'Rol inválido' });

    const user = await User.create({ firstName, lastNamePaternal, lastNameMaternal, rut, phone, email, password, role });

    let studentProfile = null;
    if (role === 'student') {
      studentProfile = await StudentProfile.create({
        user: user._id,
        Names: firstName,
        lastNamePaternal,
        lastNameMaternal,
        rut,
        phone,
        institutionalEmail: institutionalEmail || email,
        professorEmail: professorEmail || null,
        practices: []
      });
      // Auto-link to professor if professorEmail provided
      if (studentProfile && studentProfile.professorEmail) {
        try {
          const ProfessorProfile = require('../models/ProfessorProfile');
          const prof = await ProfessorProfile.findOne({ institutionalEmail: studentProfile.professorEmail });
          if (prof) {
            studentProfile.professor = prof._id;
            await studentProfile.save();
            await ProfessorProfile.findByIdAndUpdate(prof._id, { $addToSet: { listStudents: studentProfile._id } });
          }
        } catch (err) {
          console.error('Failed to auto-link student to professor in admin.createUser:', err);
        }
      }
      if (studentProfile && studentProfile.password) {
        studentProfile = studentProfile.toObject();
        delete studentProfile.password;
      }
    }

    const out = user.toObject(); delete out.password;
    res.status(201).json({ user: out, studentProfile });
  } catch (err) { next(err); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Remove StudentProfile associated
    await StudentProfile.deleteOne({ user: id });
    // Optionally: remove practices referencing this user (left out for safety)
    const result = await User.deleteOne({ _id: id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ ok: true });
  } catch (err) { next(err); }
};
