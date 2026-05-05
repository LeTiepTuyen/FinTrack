const mongoose = require('mongoose');
require('dotenv').config();
const Budget = require('./models/Budget');

const userId = '69f9d6ce93a4494976331890';
const currentMonth = '2026-05';

const budgets = [
  { user: userId, category: 'Food', limit: 600, month: currentMonth },
  { user: userId, category: 'Utilities', limit: 300, month: currentMonth },
  { user: userId, category: 'Transportation', limit: 200, month: currentMonth },
  { user: userId, category: 'Entertainment', limit: 150, month: currentMonth },
  { user: userId, category: 'Health', limit: 100, month: currentMonth },
  { user: userId, category: 'Shopping', limit: 400, month: currentMonth },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing for this user/month to avoid duplicates
    await Budget.deleteMany({ user: userId, month: currentMonth });
    
    await Budget.insertMany(budgets);
    console.log('Budgets seeded successfully');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
