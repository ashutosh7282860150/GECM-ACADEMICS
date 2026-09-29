const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET /api/admin/users
router.get('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = `SELECT u.id, u.name, u.email, u.role, u.phone, u.is_active, u.last_login, u.created_at FROM users u WHERE 1=1`;
    const params = [];
    let p = 1;
    if (role) { query += ` AND u.role = $${p++}`; params.push(role); }
    if (search) { query += ` AND (u.name ILIKE $${p} OR u.email ILIKE $${p})`; params.push(`%${search}%`); p++; }
    query += ' ORDER BY u.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/admin/users - Create user
router.post('/users', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role',
      [name, email.toLowerCase(), hash, role, phone]
    );
    res.status(201).json({ success: true, message: 'User created!', data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ success: false, message: 'Email already exists.' });
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/toggle-status
router.put('/users/:id/toggle-status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING is_active', [req.params.id]
    );
    res.json({ success: true, message: `User ${result.rows[0].is_active ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/departments
router.get('/departments', authenticate, authorize('admin', 'hod'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT d.*, u.name as hod_name,
              (SELECT COUNT(*) FROM students s WHERE s.department_id = d.id) as student_count,
              (SELECT COUNT(*) FROM faculty f WHERE f.department_id = d.id) as faculty_count
       FROM departments d LEFT JOIN users u ON d.hod_id = u.id ORDER BY d.name`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', authenticate, authorize('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT al.*, u.name as user_name FROM audit_logs al LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC LIMIT 100`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/admin/pending-workflows
router.get('/pending-workflows', authenticate, authorize('admin', 'hod'), async (req, res) => {
  try {
    const pendingNoDues = await pool.query(
      `SELECT nd.*, u.name as student_name, s.enrollment_no
       FROM no_dues_requests nd
       JOIN students s ON nd.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE nd.overall_status IN ('pending', 'in_progress')
       ORDER BY nd.created_at ASC`
    );
    const pendingGatePasses = await pool.query(
      `SELECT gp.*, u.name as student_name, s.enrollment_no
       FROM gate_passes gp
       JOIN students s ON gp.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE gp.status = 'pending'
       ORDER BY gp.created_at ASC`
    );
    res.json({ success: true, data: { noDues: pendingNoDues.rows, gatePasses: pendingGatePasses.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
