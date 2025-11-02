#!/usr/bin/env node
/*
Usage:
  node scripts/hash_user_password.js user@example.com newPassword
  node scripts/hash_user_password.js --id 64a1... newPassword

This script connects to the app DB (reads .env) and updates the User.password
by hashing the provided plaintext. It is intended for fixing users inserted
directly into the database with an unhashed password.
*/

const path = require('path');
const bcrypt = require('bcryptjs');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/hash_user_password.js <email|--id id> <newPassword>');
    process.exit(2);
  }

  let identifier;
  let newPass;
  if (args[0] === '--id') {
    identifier = { _id: args[1] };
    newPass = args[2];
    if (!newPass) { console.error('Missing newPassword'); process.exit(2); }
  } else {
    identifier = { email: args[0] };
    newPass = args[1];
  }

  // Load env and DB connector from the project
  const connectDB = require('../src/config/db');
  // Ensure models path resolves correctly
  const User = require('../src/models/User');

  try {
    await connectDB();
    const user = await User.findOne(identifier);
    if (!user) {
      console.error('User not found for', identifier);
      process.exit(3);
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPass, salt);
    // Use direct update to avoid triggering UserSchema.pre('save') which would re-hash
    const update = await User.updateOne(identifier, { $set: { password: hashed } });
    if (update.matchedCount === 0 && update.nModified === 0 && update.modifiedCount === 0) {
      // Some mongoose versions return different fields; treat as success if acknowledged
      // but warn if nothing was matched
      console.warn('Warning: update result:', update);
    }
    console.log('Password updated for identifier:', identifier);
    process.exit(0);
  } catch (err) {
    console.error('Error updating password:', err);
    process.exit(1);
  }
}

main();
