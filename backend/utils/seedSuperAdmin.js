// Run with: npm run seed:admin
// Creates (or updates) the initial Super Admin account from .env values.
import '../config/loadEnv.js';

import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';
import mongoose from 'mongoose';

const run = async () => {
  await connectDB();

  const { SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = process.env;

  if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    console.error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  const existing = await Admin.findOne({ email: SUPER_ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    console.log('Super admin already exists:', existing.email);
  } else {
    const admin = await Admin.create({
      name: SUPER_ADMIN_NAME || 'Super Admin',
      email: SUPER_ADMIN_EMAIL,
      password: SUPER_ADMIN_PASSWORD,
      role: 'super_admin',
    });
    console.log('Super admin created:', admin.email);
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
