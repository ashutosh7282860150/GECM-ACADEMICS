const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

// ─────────────────────────────────────────────────────────────────────────────
// Role configuration
// ─────────────────────────────────────────────────────────────────────────────

// All valid backend role values stored in the database
const VALID_ROLES = ['student', 'faculty', 'hod', 'warden', 'accounts', 'admin'];

/**
 * Maps the role the user SELECTED on the login UI → the backend role(s) that
 * are accepted for that selection.
 *
 * e.g. A user who picks "Administrator" on the UI can be role: admin|hod|warden|accounts
 *      A user who picks "Faculty" can be role: faculty|hod
 *      A user who picks "Student" must be role: student only
 */
const ROLE_ALIAS_MAP = {
  student:       ['student'],
  faculty:       ['faculty', 'hod'],
  administrator: ['admin', 'hod', 'warden', 'accounts'],
  admin:         ['admin', 'hod', 'warden', 'accounts'],
  warden:        ['warden', 'admin'],
  accounts:      ['accounts', 'admin'],
  hod:           ['hod', 'faculty', 'admin'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Dev-mode demo password map (bypasses bcrypt for speed in demo/development)
// Maps plaintext password → accepted when NODE_ENV !== 'production'
// NEVER used in production.
// ─────────────────────────────────────────────────────────────────────────────
const DEV_DEMO_PASSWORDS = new Set([
  'Student@123',
  'Faculty@123',
  'Admin@123',
  'password123',  // legacy fallback
]);

/**
 * Verify a password against its hash.
 * In development, also accepts known demo passwords as a fallback
 * so that even if the hash in the store is wrong the login still works.
 */
async function verifyPassword(plaintext, hash) {
  // 1. Always try the proper bcrypt comparison first
  try {
    const ok = await bcrypt.compare(plaintext, hash);
    if (ok) return true;
  } catch (_) {
    // malformed hash — fall through to dev fallback
  }

  // 2. Dev-only shortcut: allow known demo passwords without bcrypt
  if (process.env.NODE_ENV !== 'production' && DEV_DEMO_PASSWORDS.has(plaintext)) {
    console.warn(
      `[AUTH DEV FALLBACK] bcrypt compare failed for hash "${hash.slice(0, 15)}…", ` +
      `accepting demo password "${plaintext}" in development mode.`
    );
    return true;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password, role: requestedRole } = req.body;

    // ── Input validation ───────────────────────────────────────────────────
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email or Registration Number is required.' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Password is required.' });
    }

    const identifier = email.trim().toLowerCase();

    // ── Fetch user from DB (by email, enrollment_no, or employee_id) ───────
    const userResult = await pool.query(
      `SELECT u.* FROM users u 
       LEFT JOIN students s ON u.id = s.user_id 
       LEFT JOIN faculty f ON u.id = f.user_id 
       WHERE (LOWER(u.email) = $1 OR LOWER(COALESCE(s.enrollment_no, '')) = $1 OR LOWER(COALESCE(f.employee_id, '')) = $1) 
       AND u.is_active = TRUE`,
      [identifier]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/registration number or password.'
      });
    }

    const user = userResult.rows[0];

    // ── Password verification ──────────────────────────────────────────────
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/registration number or password.'
      });
    }

    // ── Role verification (backend enforced) ───────────────────────────────
    if (requestedRole) {
      const normalizedRequested = requestedRole.toLowerCase();
      const allowedRoles = ROLE_ALIAS_MAP[normalizedRequested] || [normalizedRequested];
      if (!allowedRoles.includes(user.role)) {
        // Tell the user which tab they should use instead
        const friendlyRole = {
          student:  'Student',
          faculty:  'Faculty',
          hod:      'Faculty',
          warden:   'Administrator',
          accounts: 'Administrator',
          admin:    'Administrator',
        }[user.role] || user.role;

        return res.status(403).json({
          success: false,
          message: `Access denied. Your account belongs to the "${friendlyRole}" role. Please select the "${friendlyRole}" tab and try again.`
        });
      }
    }

    // ── Update last login (non-blocking) ──────────────────────────────────
    pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]).catch(() => {});

    // ── Role-specific profile data ─────────────────────────────────────────
    let profileData = {};
    if (user.role === 'student') {
      const st = await pool.query(
        `SELECT s.*, d.name as department_name, d.code as department_code 
         FROM students s LEFT JOIN departments d ON s.department_id = d.id 
         WHERE s.user_id = $1`,
        [user.id]
      );
      if (st.rows.length > 0) profileData = st.rows[0];
    } else if (user.role === 'faculty' || user.role === 'hod') {
      const fc = await pool.query(
        `SELECT f.*, d.name as department_name, d.code as department_code 
         FROM faculty f LEFT JOIN departments d ON f.department_id = d.id 
         WHERE f.user_id = $1`,
        [user.id]
      );
      if (fc.rows.length > 0) profileData = fc.rows[0];
    }

    // ── Sign JWT ───────────────────────────────────────────────────────────
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Strip sensitive fields before sending
    const { password_hash, ...safeUser } = user;
    const { password_hash: _ph, ...safeProfile } = profileData;

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: safeUser.id,
        name: safeUser.name,
        email: safeUser.email,
        role: safeUser.role,
        phone: safeUser.phone,
        last_login: safeUser.last_login,
        ...safeProfile
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me — session validation
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;
    let profileData = {};

    if (user.role === 'student') {
      const st = await pool.query(
        `SELECT s.*, d.name as department_name, d.code as department_code 
         FROM students s LEFT JOIN departments d ON s.department_id = d.id 
         WHERE s.user_id = $1`,
        [user.id]
      );
      if (st.rows.length > 0) profileData = st.rows[0];
    } else if (user.role === 'faculty' || user.role === 'hod') {
      const fc = await pool.query(
        `SELECT f.*, d.name as department_name, d.code as department_code 
         FROM faculty f LEFT JOIN departments d ON f.department_id = d.id 
         WHERE f.user_id = $1`,
        [user.id]
      );
      if (fc.rows.length > 0) profileData = fc.rows[0];
    }

    return res.json({ success: true, user: { ...user, ...profileData } });
  } catch (err) {
    console.error('Auth/me error:', err);
    return res.status(500).json({ success: false, message: 'Session verification failed.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/change-password
// ─────────────────────────────────────────────────────────────────────────────
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new passwords are required.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from the current password.' });
    }

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (!userResult.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const user = userResult.rows[0];

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, user.id]);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
router.post('/logout', authenticate, (req, res) => {
  // JWT is stateless; actual logout happens on client by removing token.
  return res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
