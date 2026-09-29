const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/dashboard/student
router.get('/student', authenticate, authorize('student'), async (req, res) => {
  try {
    const userId = req.user.id;
    const studentResult = await pool.query('SELECT * FROM students WHERE user_id = $1', [userId]);
    if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const student = studentResult.rows[0];
    const sid = student.id;

    // Attendance
    const attResult = await pool.query(
      `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
       FROM attendance WHERE student_id = $1`, [sid]
    );
    const att = attResult.rows[0];
    const attendancePct = att.total > 0 ? Math.round((att.present / att.total) * 100) : 0;

    // Fees
    const feesResult = await pool.query(
      `SELECT status, SUM(amount) as total FROM fees WHERE student_id = $1 GROUP BY status`, [sid]
    );
    const feesByStatus = {};
    feesResult.rows.forEach(r => { feesByStatus[r.status] = parseFloat(r.total) || 0; });

    // Hostel
    const hostelResult = await pool.query(
      `SELECT ha.*, hr.room_no, h.name as hostel_name 
       FROM hostel_allocations ha
       JOIN hostel_rooms hr ON ha.room_id = hr.id
       JOIN hostels h ON hr.hostel_id = h.id
       WHERE ha.student_id = $1 AND ha.status = 'active' LIMIT 1`, [sid]
    );

    // No-dues
    const noDuesResult = await pool.query(
      'SELECT * FROM no_dues_requests WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1', [sid]
    );

    // Gate pass
    const gatePassResult = await pool.query(
      `SELECT * FROM gate_passes WHERE student_id = $1 ORDER BY created_at DESC LIMIT 3`, [sid]
    );

    // Notifications
    const notifResult = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`, [userId]
    );

    // Results
    const resultsResult = await pool.query(
      `SELECT r.*, e.name as exam_name, c.name as course_name 
       FROM results r 
       JOIN examinations e ON r.examination_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE r.student_id = $1 ORDER BY r.created_at DESC LIMIT 5`, [sid]
    );

    res.json({
      success: true,
      data: {
        student,
        attendance: { percentage: attendancePct, total: parseInt(att.total) || 0, present: parseInt(att.present) || 0 },
        fees: { pending: feesByStatus.pending || 0, paid: feesByStatus.paid || 0, overdue: feesByStatus.overdue || 0 },
        hostel: hostelResult.rows[0] || null,
        noDues: noDuesResult.rows[0] || null,
        gatePasses: gatePassResult.rows,
        notifications: notifResult.rows,
        results: resultsResult.rows
      }
    });
  } catch (err) {
    console.error('Student dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dashboard/admin
router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [studentsCount, facultyCount, pendingNoDues, pendingGatePasses, totalFeeCollected, hostelOccupancy] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM students'),
      pool.query('SELECT COUNT(*) FROM faculty'),
      pool.query("SELECT COUNT(*) FROM no_dues_requests WHERE overall_status IN ('pending', 'in_progress')"),
      pool.query("SELECT COUNT(*) FROM gate_passes WHERE status = 'pending'"),
      pool.query("SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'success'"),
      pool.query('SELECT COUNT(*) FROM hostel_allocations WHERE status = \'active\'')
    ]);

    // Fee by month (last 6 months)
    const feeByMonth = await pool.query(`
      SELECT TO_CHAR(payment_date, 'Mon YYYY') as month, SUM(amount) as total
      FROM payments WHERE status = 'success' AND payment_date >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR(payment_date, 'Mon YYYY'), DATE_TRUNC('month', payment_date)
      ORDER BY DATE_TRUNC('month', payment_date)
    `);

    // Department wise students
    const deptStudents = await pool.query(`
      SELECT d.name as department, COUNT(s.id) as count
      FROM departments d LEFT JOIN students s ON s.department_id = d.id
      GROUP BY d.name ORDER BY count DESC
    `);

    // Recent activity
    const recentActivity = await pool.query(`
      SELECT al.*, u.name as user_name FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        stats: {
          totalStudents: parseInt(studentsCount.rows[0].count),
          totalFaculty: parseInt(facultyCount.rows[0].count),
          pendingNoDues: parseInt(pendingNoDues.rows[0].count),
          pendingGatePasses: parseInt(pendingGatePasses.rows[0].count),
          totalFeeCollected: parseFloat(totalFeeCollected.rows[0].total),
          hostelOccupancy: parseInt(hostelOccupancy.rows[0].count)
        },
        charts: {
          feeByMonth: feeByMonth.rows,
          departmentStudents: deptStudents.rows
        },
        recentActivity: recentActivity.rows
      }
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dashboard/warden
router.get('/warden', authenticate, authorize('warden', 'admin'), async (req, res) => {
  try {
    const [hostelStudents, pendingGatePasses, approvedToday, pendingNoDues] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT ha.student_id) FROM hostel_allocations ha WHERE ha.status = 'active'`),
      pool.query(`SELECT COUNT(*) FROM gate_passes WHERE status = 'pending'`),
      pool.query(`SELECT COUNT(*) FROM gate_passes WHERE status = 'approved' AND DATE(approved_at) = CURRENT_DATE`),
      pool.query(`SELECT COUNT(*) FROM no_dues_requests WHERE hostel_status = 'pending'`)
    ]);

    const recentGatePasses = await pool.query(`
      SELECT gp.*, u.name as student_name, s.enrollment_no
      FROM gate_passes gp
      JOIN students s ON gp.student_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY gp.created_at DESC LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        stats: {
          hostelStudents: parseInt(hostelStudents.rows[0].count),
          pendingGatePasses: parseInt(pendingGatePasses.rows[0].count),
          approvedToday: parseInt(approvedToday.rows[0].count),
          pendingNoDues: parseInt(pendingNoDues.rows[0].count)
        },
        recentGatePasses: recentGatePasses.rows
      }
    });
  } catch (err) {
    console.error('Warden dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dashboard/accounts
router.get('/accounts', authenticate, authorize('accounts', 'admin'), async (req, res) => {
  try {
    const [totalCollected, pendingPayments, pendingNoDues, overdueAmount] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'success'`),
      pool.query(`SELECT COUNT(*), COALESCE(SUM(amount), 0) as total FROM fees WHERE status = 'pending'`),
      pool.query(`SELECT COUNT(*) FROM no_dues_requests WHERE accounts_status = 'pending'`),
      pool.query(`SELECT COALESCE(SUM(amount), 0) as total FROM fees WHERE status = 'overdue'`)
    ]);

    const recentPayments = await pool.query(`
      SELECT p.*, u.name as student_name, s.enrollment_no, f.fee_type
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN fees f ON p.fee_id = f.id
      ORDER BY p.created_at DESC LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        stats: {
          totalCollected: parseFloat(totalCollected.rows[0].total),
          pendingCount: parseInt(pendingPayments.rows[0].count),
          pendingAmount: parseFloat(pendingPayments.rows[0].total),
          pendingNoDues: parseInt(pendingNoDues.rows[0].count),
          overdueAmount: parseFloat(overdueAmount.rows[0].total)
        },
        recentPayments: recentPayments.rows
      }
    });
  } catch (err) {
    console.error('Accounts dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/dashboard/faculty
router.get('/faculty', authenticate, authorize('faculty', 'hod'), async (req, res) => {
  try {
    const userId = req.user.id;
    const facultyResult = await pool.query('SELECT * FROM faculty WHERE user_id = $1', [userId]);
    if (facultyResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Faculty not found' });
    const faculty = facultyResult.rows[0];

    const courses = await pool.query(
      `SELECT c.*, d.name as department_name FROM courses c
       LEFT JOIN departments d ON c.department_id = d.id
       WHERE c.faculty_id = $1`, [faculty.id]
    );

    const studentCount = await pool.query(
      `SELECT COUNT(DISTINCT a.student_id) FROM attendance a
       JOIN courses c ON a.course_id = c.id
       WHERE c.faculty_id = $1`, [faculty.id]
    );

    const pendingResults = await pool.query(
      `SELECT COUNT(*) FROM results r
       JOIN examinations e ON r.examination_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE c.faculty_id = $1 AND r.status = 'pending'`, [faculty.id]
    );

    res.json({
      success: true,
      data: {
        faculty,
        stats: {
          totalCourses: courses.rows.length,
          totalStudents: parseInt(studentCount.rows[0].count),
          pendingResults: parseInt(pendingResults.rows[0].count)
        },
        courses: courses.rows
      }
    });
  } catch (err) {
    console.error('Faculty dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
