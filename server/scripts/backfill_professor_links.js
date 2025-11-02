#!/usr/bin/env node
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

async function run() {
  try {
    await connectDB();
    const StudentProfile = require('../src/models/StudentProfile');
    const ProfessorProfile = require('../src/models/ProfessorProfile');

    const students = await StudentProfile.find({ professorEmail: { $exists: true, $ne: null }, professor: { $exists: false } });
    console.log(`Found ${students.length} student(s) with professorEmail but without linked professor`);

    let updatedCount = 0;
    for (const s of students) {
      const prof = await ProfessorProfile.findOne({ institutionalEmail: s.professorEmail });
      if (prof) {
        s.professor = prof._id;
        await s.save();
        await ProfessorProfile.findByIdAndUpdate(prof._id, { $addToSet: { listStudents: s._id } });
        updatedCount++;
        console.log(`Linked student ${s._id} -> professor ${prof._id}`);
      } else {
        console.log(`No professor found for email ${s.professorEmail} (student ${s._id})`);
      }
    }

    console.log(`Done. Linked ${updatedCount} student(s).`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
