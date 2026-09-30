/**
 * updatePasswords.js
 * Generates fresh bcrypt hashes for all demo accounts and outputs them.
 * Run: node server/scripts/updatePasswords.js
 */
const bcrypt = require('bcryptjs');

const ACCOUNTS = [
  { label: 'student (Student@123)', password: 'Student@123' },
  { label: 'faculty (Faculty@123)', password: 'Faculty@123' },
  { label: 'admin (Admin@123)', password: 'Admin@123' },
  { label: 'universal fallback (password123)', password: 'password123' },
];

(async () => {
  console.log('\nGenerating verified bcrypt hashes (rounds=12)...\n');
  const results = {};
  for (const { label, password } of ACCOUNTS) {
    const hash = await bcrypt.hash(password, 12);
    const ok = await bcrypt.compare(password, hash);
    results[password] = hash;
    console.log(`[${ok ? 'OK' : 'FAIL'}] ${label}`);
    console.log(`      Hash: ${hash}\n`);
  }
  return results;
})();
