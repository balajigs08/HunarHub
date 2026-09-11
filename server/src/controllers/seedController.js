/**
 * Production-safe demo user seeder.
 *
 * Uses findOne + create (upsert pattern) — NEVER deletes existing data.
 * Passwords are hashed by the User model's pre-save hook (bcrypt, 12 rounds).
 *
 * Accessible at:  POST /api/auth/seed-demo-users
 * Protected by:   SEED_SECRET header must match SEED_SECRET env var.
 * Idempotent:     Running multiple times creates no duplicates.
 */

const User = require('../models/User');
const EntrepreneurProfile = require('../models/EntrepreneurProfile');
const Category = require('../models/Category');
const config = require('../config/config');
const { sendSuccess, sendError } = require('../utils/response');

const seedDemoUsers = async (req, res) => {
  try {
    // Lightweight secret check so the endpoint is not publicly abusable
    const secret = process.env.SEED_SECRET;
    if (secret) {
      const provided = req.headers['x-seed-secret'] || req.body?.seedSecret;
      if (provided !== secret) {
        return sendError(res, 'Unauthorized', 401);
      }
    }

    const results = [];

    // ── 1. Admin ──────────────────────────────────────────────────────────────
    const adminEmail = config.adminEmail || 'admin@hunarhub.local';
    const adminPassword = config.adminPassword || 'Admin@12345';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'Platform Admin',
        email: adminEmail,
        password: adminPassword,
        phone: '+91-9800000001',
        role: 'admin',
        location: { city: 'Delhi' },
      });
      results.push({ role: 'admin', email: adminEmail, action: 'created' });
    } else {
      results.push({ role: 'admin', email: adminEmail, action: 'already_exists' });
    }

    // ── 2. Demo Customer ──────────────────────────────────────────────────────
    const customerEmail = config.customerEmail || 'customer@hunarhub.local';
    const customerPassword = config.customerPassword || 'Customer@12345';

    let customer = await User.findOne({ email: customerEmail });
    if (!customer) {
      customer = await User.create({
        name: 'Demo Customer',
        email: customerEmail,
        password: customerPassword,
        phone: '+91-9800000002',
        role: 'customer',
        location: { city: 'Delhi' },
      });
      results.push({ role: 'customer', email: customerEmail, action: 'created' });
    } else {
      results.push({ role: 'customer', email: customerEmail, action: 'already_exists' });
    }

    // ── 3. Demo Entrepreneur ──────────────────────────────────────────────────
    const entrepreneurEmail = config.entrepreneurEmail || 'entrepreneur@hunarhub.local';
    const entrepreneurPassword = config.entrepreneurPassword || 'Entrepreneur@12345';

    let entrepreneur = await User.findOne({ email: entrepreneurEmail });
    if (!entrepreneur) {
      // Ensure a category exists for the entrepreneur profile
      let category = await Category.findOne({});
      if (!category) {
        category = await Category.create({
          name: 'Artisan',
          description: 'Handmade crafts, art and traditional artworks',
          icon: '🎨',
          slug: 'artisan',
        });
      }

      entrepreneur = await User.create({
        name: 'Demo Entrepreneur',
        email: entrepreneurEmail,
        password: entrepreneurPassword,
        phone: '+91-9800000003',
        role: 'entrepreneur',
        location: { city: 'Mumbai' },
      });

      // Create entrepreneur profile only if it doesn't exist
      const existingProfile = await EntrepreneurProfile.findOne({ user: entrepreneur._id });
      if (!existingProfile) {
        await EntrepreneurProfile.create({
          user: entrepreneur._id,
          businessName: 'Demo Crafts Studio',
          category: category._id,
          skills: ['Handcrafting', 'Painting', 'Sculpting'],
          experience: { years: 5, description: 'Demo entrepreneur for testing.' },
          location: { city: 'Mumbai' },
          about: 'Demo entrepreneur account for platform testing.',
          profileImage: { url: '', public_id: '' },
          verificationStatus: 'approved',
        });
      }

      results.push({ role: 'entrepreneur', email: entrepreneurEmail, action: 'created' });
    } else {
      results.push({ role: 'entrepreneur', email: entrepreneurEmail, action: 'already_exists' });
    }

    return sendSuccess(res, 'Demo users seeded successfully.', { results });
  } catch (error) {
    console.error('Seed demo users error:', error);
    return sendError(res, `Seeding failed: ${error.message}`, 500);
  }
};

module.exports = { seedDemoUsers };
