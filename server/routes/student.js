const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/students
router.get('/', authenticate, authorize('admin', 'hod', 'faculty', 'warden', 'accounts'), async (req, res) => {
  try {
    const { department, semester, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    let conditions = [];
    let params = [];
    let paramCount = 1;

    if (department) { conditions.push(`s.department_id = $${paramCount++}`); params.push(department); }
    if (semester) { conditions.push(`s.semester = $${paramCount++}`); params.push(semester); }
    if (search) {
      conditions.push(`(u.name ILIKE $${paramCount} OR s.enrollment_no ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT s.*, u.name, u.email, u.phone, u.is_active, d.name as department_name, d.code as department_code
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON s.department_id = d.id
       ${whereClause}
       ORDER BY u.name ASC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM students s JOIN users u ON s.user_id = u.id ${whereClause}`, params
    );

    res.json({ success: true, data: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Students fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/students/profile - Own profile
router.get('/profile', authenticate, authorize('student'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.name, u.email, u.phone, d.name as department_name, d.code as department_code
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE s.user_id = $1`, [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/students/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.name, u.email, u.phone, d.name as department_name, d.code as department_code
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE s.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
