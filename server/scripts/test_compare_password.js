#!/usr/bin/env node
/*
Usage: node scripts/test_compare_password.js user@example.com plainPassword

This script loads the User by email and checks:
 - whether the stored password field looks like a bcrypt hash
 - whether user.comparePassword(plainPassword) returns true

It helps debug why login returns "Contraseña incorrecta".
*/

const connectDB = require('../src/config/db');
const User = require('../src/models/User');

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/test_compare_password.js user@example.com plainPassword');
    process.exit(2);
  }
  const [email, plain] = args;

  try {
    await connectDB();
    const user = await User.findOne({ email }).lean();
    if (!user) {
      console.error('User not found for', email);
      process.exit(3);
    }

    const pwd = user.password || '';
    const looksHashed = typeof pwd === 'string' && /^\$2[aby]\$\d{2}\$/.test(pwd);
    console.log('User found:', user.email);
    console.log('Password present:', !!pwd);
    console.log('Looks like bcrypt hash:', looksHashed);

    // Load non-lean user to access comparePassword method
    const userModel = await User.findOne({ email });
    const ok = await userModel.comparePassword(plain);
    console.log('comparePassword result:', ok);
    process.exit(ok ? 0 : 4);
  } catch (err) {
    console.error('Error running test:', err);
    process.exit(1);
  }
}

main();
