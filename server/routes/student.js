const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// POST /api/students - Create a new student (permanently stored in DB)
router.post('/', authenticate, authorize('admin', 'hod'), async (req, res) => {
  try {
    const {
      name,
      email,
      password = 'Student@123',
      phone,
      enrollment_no,
      roll_no,
      department_id = 'd1',
      semester = 1,
      batch = '2024-2028',
      gender = 'Male',
      hostel_resident = false,
      guardian_name,
      guardian_phone
    } = req.body;

    if (!name || !email || !enrollment_no) {
      return res.status(400).json({ success: false, message: 'Student Name, Email, and Enrollment No are required.' });
    }

    const hash = await bcrypt.hash(password, 10);

    // 1. Insert User Account
    const userResult = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, phone',
      [name.trim(), email.toLowerCase().trim(), hash, 'student', phone || '']
    );

    const createdUser = userResult.rows[0];
    const userId = createdUser.id;

    // 2. Insert Student Record
    const studentResult = await pool.query(
      `INSERT INTO students (user_id, enrollment_no, roll_no, department_id, semester, batch, gender, hostel_resident, guardian_name, guardian_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        enrollment_no.toUpperCase().trim(),
        (roll_no || enrollment_no).toUpperCase().trim(),
        department_id,
        parseInt(semester) || 1,
        batch,
        gender,
        Boolean(hostel_resident),
        guardian_name || null,
        guardian_phone || null
      ]
    );

    const createdStudent = studentResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Student account created and saved to database successfully!',
      data: {
        ...createdStudent,
        user: createdUser,
        name: createdUser.name,
        email: createdUser.email,
        phone: createdUser.phone
      }
    });
  } catch (err) {
    console.error('Student create error:', err);
    if (err.code === '23505') {
      return res.status(400).json({ success: false, message: 'A student with this Email or Enrollment No already exists.' });
    }
    res.status(500).json({ success: false, message: err.message || 'Server error creating student' });
  }
});

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
