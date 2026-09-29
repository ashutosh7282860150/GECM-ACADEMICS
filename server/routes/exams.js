const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/exams - Get exams
router.get('/', authenticate, async (req, res) => {
  try {
    let query, params = [];
    if (req.user.role === 'student') {
      const studentResult = await pool.query(
        `SELECT s.*, d.id as dept_id FROM students s LEFT JOIN departments d ON s.department_id = d.id WHERE s.user_id = $1`, [req.user.id]
      );
      if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      const student = studentResult.rows[0];
      query = `SELECT e.*, c.name as course_name, c.code as course_code 
               FROM examinations e LEFT JOIN courses c ON e.course_id = c.id
               WHERE e.department_id = $1 AND e.semester = $2 ORDER BY e.exam_date ASC`;
      params = [student.dept_id, student.semester];
    } else {
      query = `SELECT e.*, c.name as course_name, d.name as department_name 
               FROM examinations e LEFT JOIN courses c ON e.course_id = c.id
               LEFT JOIN departments d ON e.department_id = d.id
               ORDER BY e.exam_date DESC LIMIT 50`;
    }
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/exams/results - Get results for student
router.get('/results', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      const sid = studentResult.rows[0].id;

      const results = await pool.query(
        `SELECT r.*, e.name as exam_name, e.exam_type, e.max_marks, e.exam_date, c.name as course_name, c.code as course_code
         FROM results r
         JOIN examinations e ON r.examination_id = e.id
         JOIN courses c ON e.course_id = c.id
         WHERE r.student_id = $1 AND r.status = 'published'
         ORDER BY e.exam_date DESC`, [sid]
      );
      res.json({ success: true, data: results.rows });
    } else {
      // Faculty/admin view
      const { examId } = req.query;
      if (!examId) return res.status(400).json({ success: false, message: 'examId required' });
      const results = await pool.query(
        `SELECT r.*, u.name as student_name, s.enrollment_no
         FROM results r
         JOIN students s ON r.student_id = s.id
         JOIN users u ON s.user_id = u.id
         WHERE r.examination_id = $1 ORDER BY u.name`, [examId]
      );
      res.json({ success: true, data: results.rows });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/exams - Create examination (faculty/admin)
router.post('/', authenticate, authorize('faculty', 'hod', 'admin'), async (req, res) => {
  try {
    const { name, examType, courseId, examDate, maxMarks, passingMarks, semester, departmentId, academicYear } = req.body;
    const result = await pool.query(
      `INSERT INTO examinations (name, exam_type, course_id, exam_date, max_marks, passing_marks, semester, department_id, academic_year)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, examType, courseId, examDate, maxMarks, passingMarks, semester, departmentId, academicYear]
    );
    res.status(201).json({ success: true, message: 'Examination created!', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/exams/results/enter - Enter marks (faculty)
router.post('/results/enter', authenticate, authorize('faculty', 'hod', 'admin'), async (req, res) => {
  try {
    const { examinationId, results } = req.body;
    // results: [{ studentId, marksObtained, grade, remarks }]

    const facultyResult = await pool.query('SELECT id FROM faculty WHERE user_id = $1', [req.user.id]);
    const facultyId = facultyResult.rows.length > 0 ? facultyResult.rows[0].id : null;

    for (const result of results) {
      await pool.query(
        `INSERT INTO results (student_id, examination_id, marks_obtained, grade, status, remarks, entered_by)
         VALUES ($1, $2, $3, $4, 'pending', $5, $6)
         ON CONFLICT (student_id, examination_id) DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained, grade = EXCLUDED.grade, remarks = EXCLUDED.remarks`,
        [result.studentId, examinationId, result.marksObtained, result.grade, result.remarks, facultyId]
      );
    }

    res.json({ success: true, message: `Results entered for ${results.length} students.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/exams/:id/publish - Publish results
router.put('/:id/publish', authenticate, authorize('admin', 'hod'), async (req, res) => {
  try {
    await pool.query(`UPDATE results SET status = 'published' WHERE examination_id = $1`, [req.params.id]);
    res.json({ success: true, message: 'Results published successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
