const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function seedDatabase() {
  console.log('🌱 Seeding SmartCampus ERP Database with demo data...\n');
  
  try {
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    
    await pool.query(seed);
    console.log('✅ Demo data seeded successfully!\n');

    console.log('📧 Demo Login Accounts:');
    console.log('─'.repeat(55));
    console.log('Role        Email                        Password');
    console.log('─'.repeat(55));
    console.log('Admin     : admin@smartcampus.edu      / Admin@123');
    console.log('HOD       : hod.cse@smartcampus.edu   / Admin@123');
    console.log('Warden    : warden@smartcampus.edu    / Admin@123');
    console.log('Accounts  : accounts@smartcampus.edu  / Admin@123');
    console.log('Librarian : library@smartcampus.edu   / Admin@123');
    console.log('Faculty   : faculty1@smartcampus.edu  / Faculty@123');
    console.log('Student   : student1@smartcampus.edu  / Student@123');
    console.log('─'.repeat(55));
    console.log('Login tab  : Student       → Student@123');
    console.log('Login tab  : Faculty       → Faculty@123');
    console.log('Login tab  : Administrator → Admin@123');
    console.log('─'.repeat(55));
    
    await pool.end();
  } catch (err) {
    console.error('❌ Database seed failed:', err.message);
    process.exit(1);
  }
}

seedDatabase();

