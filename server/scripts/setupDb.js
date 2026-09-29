const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function setupDatabase() {
  console.log('🗄️  Setting up SmartCampus ERP Database...\n');
  
  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Creating tables...');
    await pool.query(schema);
    console.log('✅ Tables created successfully!\n');

    // Read and execute seed data
    const seedPath = path.join(__dirname, '../../database/seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    
    console.log('🌱 Seeding demo data...');
    await pool.query(seed);
    console.log('✅ Demo data seeded successfully!\n');

    console.log('🎉 Database setup complete!');
    console.log('\n📧 Demo Login Accounts:');
    console.log('─'.repeat(50));
    console.log('Admin:    admin@smartcampus.edu    / password123');
    console.log('HOD:      hod.cse@smartcampus.edu / password123');
    console.log('Warden:   warden@smartcampus.edu  / password123');
    console.log('Accounts: accounts@smartcampus.edu/ password123');
    console.log('Faculty:  faculty1@smartcampus.edu/ password123');
    console.log('Student:  student1@smartcampus.edu/ password123');
    console.log('─'.repeat(50));
    
    await pool.end();
  } catch (err) {
    console.error('❌ Database setup failed:', err.message);
    console.error('\nMake sure PostgreSQL is running and credentials in .env are correct.');
    process.exit(1);
  }
}

setupDatabase();
