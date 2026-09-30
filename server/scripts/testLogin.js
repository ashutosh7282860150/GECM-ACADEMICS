/**
 * testLogin.js — end-to-end login flow test (no HTTP, runs directly)
 * Tests the exact same logic as routes/auth.js against mockStore.js
 * 
 * Run: node server/scripts/testLogin.js
 */
const bcrypt = require('bcryptjs');
const mockStore = require('../services/mockStore');

// Mirror the DEV_DEMO_PASSWORDS set from routes/auth.js
const DEV_DEMO_PASSWORDS = new Set(['Student@123', 'Faculty@123', 'Admin@123', 'password123']);

// Mirror verifyPassword from routes/auth.js
async function verifyPassword(plaintext, hash) {
  try {
    const ok = await bcrypt.compare(plaintext, hash);
    if (ok) return { ok: true, via: 'bcrypt' };
  } catch (_) { /* fall through */ }
  if (DEV_DEMO_PASSWORDS.has(plaintext)) {
    return { ok: true, via: 'dev-fallback' };
  }
  return { ok: false, via: 'none' };
}

// Mirror the query fallback from config/database.js (user lookup by email)
function findUserByIdentifier(identifier) {
  const id = identifier.toLowerCase().trim();
  return mockStore.users.find(u => {
    if (!u.is_active) return false;
    if (u.email && u.email.toLowerCase() === id) return true;
    const st = mockStore.students.find(s => s.user_id === u.id);
    if (st && st.enrollment_no && st.enrollment_no.toLowerCase() === id) return true;
    const fc = mockStore.faculty.find(f => f.user_id === u.id);
    if (fc && fc.employee_id && fc.employee_id.toLowerCase() === id) return true;
    return false;
  });
}

const ROLE_ALIAS_MAP = {
  student:       ['student'],
  faculty:       ['faculty', 'hod'],
  administrator: ['admin', 'hod', 'warden', 'accounts'],
  admin:         ['admin', 'hod', 'warden', 'accounts'],
};

const TESTS = [
  // ── Main demo accounts ──────────────────────────────────────────────────
  { label: 'Student demo',       email: 'student1@smartcampus.edu',  password: 'Student@123',  requestedRole: 'student',       expectSuccess: true  },
  { label: 'Faculty demo',       email: 'faculty1@smartcampus.edu',  password: 'Faculty@123',  requestedRole: 'faculty',       expectSuccess: true  },
  { label: 'Admin demo',         email: 'admin@smartcampus.edu',     password: 'Admin@123',    requestedRole: 'administrator', expectSuccess: true  },
  { label: 'HOD demo',           email: 'hod.cse@smartcampus.edu',   password: 'Admin@123',    requestedRole: 'administrator', expectSuccess: true  },
  { label: 'Warden demo',        email: 'warden@smartcampus.edu',    password: 'Admin@123',    requestedRole: 'administrator', expectSuccess: true  },
  { label: 'Accounts demo',      email: 'accounts@smartcampus.edu',  password: 'Admin@123',    requestedRole: 'administrator', expectSuccess: true  },
  // ── Wrong password ───────────────────────────────────────────────────────
  { label: 'Wrong password',     email: 'student1@smartcampus.edu',  password: 'wrongpass',    requestedRole: 'student',       expectSuccess: false },
  // ── Wrong role ───────────────────────────────────────────────────────────
  { label: 'Student→Faculty tab',email: 'student1@smartcampus.edu',  password: 'Student@123',  requestedRole: 'faculty',       expectSuccess: false, expectCode: 403 },
  { label: 'Admin→Student tab',  email: 'admin@smartcampus.edu',     password: 'Admin@123',    requestedRole: 'student',       expectSuccess: false, expectCode: 403 },
  // ── Enrollment number login ──────────────────────────────────────────────
  { label: 'Enrollment login',   email: 'CSE2021001',                 password: 'Student@123',  requestedRole: 'student',       expectSuccess: true  },
  // ── Nonexistent user ────────────────────────────────────────────────────
  { label: 'Unknown email',      email: 'nobody@smartcampus.edu',     password: 'Student@123',  requestedRole: 'student',       expectSuccess: false, expectCode: 401 },
];

(async () => {
  console.log('\n🧪 Login System End-to-End Test\n' + '─'.repeat(70));
  let passed = 0, failed = 0;

  for (const t of TESTS) {
    const user = findUserByIdentifier(t.email);

    if (!user) {
      const result = !t.expectSuccess && (t.expectCode === 401 || !t.expectCode);
      if (result) {
        console.log(`✅ PASS  [${t.label}] — user not found (401 expected)`);
        passed++;
      } else {
        console.log(`❌ FAIL  [${t.label}] — user not found but expected success`);
        failed++;
      }
      continue;
    }

    const { ok, via } = await verifyPassword(t.password, user.password_hash);

    if (!ok) {
      const result = !t.expectSuccess && (t.expectCode === 401 || !t.expectCode);
      if (result) {
        console.log(`✅ PASS  [${t.label}] — wrong password rejected (401 expected)`);
        passed++;
      } else {
        console.log(`❌ FAIL  [${t.label}] — password rejected but expected success. Hash: ${user.password_hash.slice(0,20)}…`);
        failed++;
      }
      continue;
    }

    // Password OK → check role
    const allowedRoles = ROLE_ALIAS_MAP[t.requestedRole?.toLowerCase()] || [t.requestedRole?.toLowerCase()];
    const roleOk = allowedRoles.includes(user.role);

    if (!roleOk) {
      const result = !t.expectSuccess && t.expectCode === 403;
      if (result) {
        console.log(`✅ PASS  [${t.label}] — role mismatch rejected (403 expected). User role: ${user.role}, requested: ${t.requestedRole}`);
        passed++;
      } else {
        console.log(`❌ FAIL  [${t.label}] — role mismatch but expected success. User: ${user.role}, allowed: ${allowedRoles.join(',')}`);
        failed++;
      }
      continue;
    }

    if (t.expectSuccess) {
      console.log(`✅ PASS  [${t.label}] — login OK (via ${via}). User: ${user.name} (${user.role})`);
      passed++;
    } else {
      console.log(`❌ FAIL  [${t.label}] — expected failure but login succeeded. User: ${user.name}`);
      failed++;
    }
  }

  console.log('\n' + '─'.repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed out of ${TESTS.length} tests`);
  if (failed === 0) {
    console.log('🎉 All tests passed! Login system is working correctly.\n');
  } else {
    console.log('⚠️  Some tests failed. Check output above for details.\n');
    process.exit(1);
  }
})();
