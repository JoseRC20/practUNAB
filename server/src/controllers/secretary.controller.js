const StudentProfile = require("../models/StudentProfile");
const Practice = require('../models/Practice');

// List practices that require secretary attention (status 'pendiente')
exports.listPendingForSecretary = async (req, res, next) => {
  try {
    // Include 'rut' in the populated student so the front-end can render it
    const items = await Practice.find({ status: 'pendiente' })
      .populate('student', 'firstName lastNamePaternal lastNameMaternal email rut')
      .lean();

    // Map to a simpler DTO: student name, email, practice status, practice id
    const result = items.map(p => ({
      practiceId: p._id,
      status: p.status,
      student: {
        id: p.student?._id,
        firstName: p.student?.firstName || '',
        lastNamePaternal: p.student?.lastNamePaternal || '',
        lastNameMaternal: p.student?.lastNameMaternal || '',
        email: p.student?.email || ''
      }
    }));

    res.json({ items: result });
  } catch (err) { next(err); }
};
