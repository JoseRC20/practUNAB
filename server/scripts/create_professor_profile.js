#!/usr/bin/env node
const connectDB = require('../src/config/db');
const mongoose = require('mongoose');

async function run() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node server/scripts/create_professor_profile.js <userId>');
    process.exit(2);
  }
  try {
    await connectDB();
    const User = require('../src/models/User');
    const ProfessorProfile = require('../src/models/ProfessorProfile');

    const user = await User.findById(userId).lean();
    if (!user) {
      console.error('User not found:', userId);
      process.exit(1);
    }

    // Check if already exists
    const existing = await ProfessorProfile.findOne({ user: userId });
    if (existing) {
      console.log('ProfessorProfile already exists for user:', userId);
      console.log(existing);
      process.exit(0);
    }

    // Create minimal professor profile from user data
    const prof = new ProfessorProfile({
      user: user._id,
      Names: user.firstName || 'N/A',
      lastNamePaternal: user.lastNamePaternal || 'N/A',
      lastNameMaternal: user.lastNameMaternal || 'N/A',
      rut: user.rut || 'N/A',
      phone: user.phone || '',
      institutionalEmail: user.email || '',
      listStudents: []
    });

    await prof.save();
    console.log('ProfessorProfile created:', prof._id);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
