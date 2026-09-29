const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/attendance - Get attendance records
router.get('/', authenticate, async (req, res) => {
  try {
    const { courseId, studentId, startDate, endDate } = req.query;
    
    if (req.user.role === 'student') {
      const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      const sid = studentResult.rows[0].id;

      const result = await pool.query(
        `SELECT a.*, c.name as course_name, c.code as course_code
         FROM attendance a
         LEFT JOIN courses c ON a.course_id = c.id
         WHERE a.student_id = $1
         ORDER BY a.date DESC LIMIT 100`, [sid]
      );

      // Summary per course
      const summary = await pool.query(
        `SELECT c.name as course_name, c.code as course_code,
                COUNT(*) as total,
                SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present,
                ROUND(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as percentage
         FROM attendance a
         JOIN courses c ON a.course_id = c.id
         WHERE a.student_id = $1
         GROUP BY c.name, c.code ORDER BY c.name`, [sid]
      );

      res.json({ success: true, data: result.rows, summary: summary.rows });
    } else {
      // Faculty/Admin view
      let query = `SELECT a.*, c.name as course_name, u.name as student_name, s.enrollment_no
                   FROM attendance a
                   JOIN courses c ON a.course_id = c.id
                   JOIN students s ON a.student_id = s.id
                   JOIN users u ON s.user_id = u.id
                   WHERE 1=1`;
      const params = [];
      let paramCount = 1;

      if (courseId) { query += ` AND a.course_id = $${paramCount++}`; params.push(courseId); }
      if (studentId) { query += ` AND a.student_id = $${paramCount++}`; params.push(studentId); }
      if (startDate) { query += ` AND a.date >= $${paramCount++}`; params.push(startDate); }
      if (endDate) { query += ` AND a.date <= $${paramCount++}`; params.push(endDate); }

      query += ' ORDER BY a.date DESC LIMIT 200';
      const result = await pool.query(query, params);
      res.json({ success: true, data: result.rows });
    }
  } catch (err) {
    console.error('Attendance fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/attendance/mark - Faculty marks attendance
router.post('/mark', authenticate, authorize('faculty', 'hod', 'admin'), async (req, res) => {
  try {
    const { courseId, date, records } = req.body;
    // records: [{ studentId, status }]
    
    const facultyResult = await pool.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    const facultyId = facultyResult.rows.length > 0 ? facultyResult.rows[0].id : null;

    const insertedRecords = [];
    for (const record of records) {
      try {
        // Upsert attendance
        const result = await pool.query(
          `INSERT INTO attendance (student_id, course_id, date, status, marked_by)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (student_id, course_id, date) DO UPDATE SET status = EXCLUDED.status
           RETURNING *`,
          [record.studentId, courseId, date, record.status, facultyId]
        );
        insertedRecords.push(result.rows[0]);
      } catch (e) {
        // Skip duplicates
      }
    }

    res.json({ success: true, message: `Attendance marked for ${insertedRecords.length} students.`, data: insertedRecords });
  } catch (err) {
    console.error('Attendance mark error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/attendance/courses - Get courses for faculty
router.get('/courses', authenticate, authorize('faculty', 'hod'), async (req, res) => {
  try {
    const facultyResult = await pool.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    if (facultyResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const courses = await pool.query(
      `SELECT c.*, d.name as department_name,
              (SELECT COUNT(DISTINCT a.student_id) FROM attendance a WHERE a.course_id = c.id) as student_count
       FROM courses c
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.faculty_id = $1 ORDER BY c.name`, [facultyResult.rows[0].id]
    );

    res.json({ success: true, data: courses.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add unique constraint for attendance (if not exists)
// NOTE: Add to schema: ALTER TABLE attendance ADD CONSTRAINT unique_att UNIQUE (student_id, course_id, date);

module.exports = router;
