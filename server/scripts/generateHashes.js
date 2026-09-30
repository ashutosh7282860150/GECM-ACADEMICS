/**
 * Generate bcrypt hashes for demo passwords
 * Run: node server/scripts/generateHashes.js
 */
const bcrypt = require('bcryptjs');

const PASSWORDS = {
  password123: 'password123',
  'Student@123': 'Student@123',
  'Faculty@123': 'Faculty@123',
  'Admin@123': 'Admin@123',
};

(async () => {
  console.log('Generating bcrypt hashes (rounds=12)...\n');
  for (const [label, pw] of Object.entries(PASSWORDS)) {
    const hash = await bcrypt.hash(pw, 12);
    const verified = await bcrypt.compare(pw, hash);
    console.log(`${label}:`);
    console.log(`  Hash:     ${hash}`);
    console.log(`  Verified: ${verified}`);
    console.log();
  }
})();
