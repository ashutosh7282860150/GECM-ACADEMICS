const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/faculty
router.get('/', authenticate, authorize('admin', 'hod'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.name, u.email, u.phone, d.name as department_name
       FROM faculty f JOIN users u ON f.user_id = u.id LEFT JOIN departments d ON f.department_id = d.id
       ORDER BY u.name`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/faculty/profile
router.get('/profile', authenticate, authorize('faculty', 'hod'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.name, u.email, u.phone, d.name as department_name
       FROM faculty f JOIN users u ON f.user_id = u.id LEFT JOIN departments d ON f.department_id = d.id
       WHERE f.user_id = $1`, [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/faculty/students - Get students for faculty's courses
router.get('/students', authenticate, authorize('faculty', 'hod'), async (req, res) => {
  try {
    const facultyResult = await pool.query('SELECT id, department_id FROM faculty WHERE user_id = $1', [req.user.id]);
    if (facultyResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found' });
    const faculty = facultyResult.rows[0];

    const students = await pool.query(
      `SELECT DISTINCT s.*, u.name, u.email, u.phone, d.name as department_name, d.code
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE s.department_id = $1
       ORDER BY u.name`, [faculty.department_id]
    );
    res.json({ success: true, data: students.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/faculty/courses
router.get('/courses', authenticate, authorize('faculty', 'hod'), async (req, res) => {
  try {
    const facultyResult = await pool.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    if (facultyResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const result = await pool.query(
      `SELECT c.*, d.name as department_name FROM courses c LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.faculty_id = $1 ORDER BY c.semester, c.name`, [facultyResult.rows[0].id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
