const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// GET /api/nodues - Get no-dues requests
router.get('/', authenticate, async (req, res) => {
  try {
    let query, params = [];

    if (req.user.role === 'student') {
      const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      query = `SELECT nd.*, 
               hu.name as hostel_verified_by_name, lu.name as library_verified_by_name,
               au.name as accounts_verified_by_name, adu.name as admin_verified_by_name
               FROM no_dues_requests nd
               LEFT JOIN users hu ON nd.hostel_verified_by = hu.id
               LEFT JOIN users lu ON nd.library_verified_by = lu.id
               LEFT JOIN users au ON nd.accounts_verified_by = au.id
               LEFT JOIN users adu ON nd.admin_verified_by = adu.id
               WHERE nd.student_id = $1 ORDER BY nd.created_at DESC`;
      params = [studentResult.rows[0].id];
    } else {
      const { status, dept } = req.query;
      query = `SELECT nd.*, u.name as student_name, s.enrollment_no, d.name as department_name,
               nd.hostel_status, nd.library_status, nd.accounts_status, nd.admin_status
               FROM no_dues_requests nd
               JOIN students s ON nd.student_id = s.id
               JOIN users u ON s.user_id = u.id
               LEFT JOIN departments d ON s.department_id = d.id
               ${status ? 'WHERE nd.overall_status = $1' : ''}
               ORDER BY nd.created_at DESC LIMIT 50`;
      if (status) params = [status];
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('No-dues fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/nodues - Student submits no-dues request
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { reason, requestType } = req.body;
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const studentId = studentResult.rows[0].id;

    // Check if active request exists
    const existing = await pool.query(
      `SELECT id FROM no_dues_requests WHERE student_id = $1 AND overall_status IN ('pending', 'in_progress')`, [studentId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'You already have an active no-dues request.' });
    }

    const ndId = uuidv4();
    const result = await pool.query(
      `INSERT INTO no_dues_requests (id, student_id, reason, request_type, overall_status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [ndId, studentId, reason, requestType || 'graduation']
    );

    await pool.query(
      `INSERT INTO workflow_steps (workflow_type, reference_id, step_name, action, performed_by, comments)
       VALUES ('no_dues', $1, 'Request Created', 'created', $2, $3)`,
      [ndId, req.user.id, `No-dues request submitted: ${reason}`]
    );

    // Notify ALL departments for real-time parallel verification (Admin, HOD, Warden, Accounts, Faculty)
    const reviewerRoles = ['admin', 'hod', 'warden', 'accounts', 'faculty'];
    const reviewers = await pool.query("SELECT id, role FROM users WHERE role = ANY($1)", [reviewerRoles]);
    
    if (reviewers.rows && reviewers.rows.length > 0) {
      for (const rev of reviewers.rows) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
           VALUES ($1, 'No-Dues Clearance Request', $2, 'action_required', 'no_dues', $3)`,
          [rev.id, `${req.user.name} submitted a No-Dues clearance request. Department verification required.`, ndId]
        );
      }
    }

    res.status(201).json({ success: true, message: 'No-dues request submitted and dispatched to all departments!', data: result.rows[0] });
  } catch (err) {
    console.error('No-dues create error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Helper to update overall status based on all department statuses
const updateOverallStatus = async (ndId) => {
  const nd = await pool.query('SELECT * FROM no_dues_requests WHERE id = $1', [ndId]);
  const r = nd.rows[0];
  if (!r) return;

  let overall = 'pending';
  const statuses = [
    r.hostel_status || 'pending',
    r.library_status || 'approved',
    r.accounts_status || 'pending',
    r.hod_status || 'approved',
    r.faculty_status || 'approved',
    r.admin_status || 'pending'
  ];
  
  if (statuses.some(s => s === 'rejected')) {
    overall = 'rejected';
  } else if (statuses.every(s => s === 'approved')) {
    overall = 'completed';
  } else if (statuses.some(s => s === 'approved')) {
    overall = 'in_progress';
  }

  await pool.query('UPDATE no_dues_requests SET overall_status = $1, updated_at = NOW() WHERE id = $2', [overall, ndId]);
  return overall;
};

// PUT /api/nodues/:id/verify - Department verifies
router.put('/:id/verify', authenticate, authorize('warden', 'accounts', 'admin', 'hod', 'faculty'), async (req, res) => {
  try {
    const { action, remarks } = req.body; // action: 'approved' or 'rejected'
    const ndId = req.params.id;
    const role = req.user.role;
    
    let statusField, remarksField, verifiedByField, verifiedAtField, stepName;
    if (role === 'warden') {
      statusField = 'hostel_status'; remarksField = 'hostel_remarks';
      verifiedByField = 'hostel_verified_by'; verifiedAtField = 'hostel_verified_at';
      stepName = 'Hostel Verification';
    } else if (role === 'accounts') {
      statusField = 'accounts_status'; remarksField = 'accounts_remarks';
      verifiedByField = 'accounts_verified_by'; verifiedAtField = 'accounts_verified_at';
      stepName = 'Fee Cell / Accounts Verification';
    } else if (role === 'hod') {
      statusField = 'hod_status'; remarksField = 'hod_remarks';
      verifiedByField = 'hod_verified_by'; verifiedAtField = 'hod_verified_at';
      stepName = 'HOD CSE Clearance';
    } else if (role === 'faculty') {
      statusField = 'faculty_status'; remarksField = 'faculty_remarks';
      verifiedByField = 'faculty_verified_by'; verifiedAtField = 'faculty_verified_at';
      stepName = 'Faculty & Labs Clearance';
    } else if (role === 'admin') {
      statusField = 'admin_status'; remarksField = 'admin_remarks';
      verifiedByField = 'admin_verified_by'; verifiedAtField = 'admin_verified_at';
      stepName = 'Administrator Final Approval';
    }

    await pool.query(
      `UPDATE no_dues_requests SET ${statusField} = $1, ${remarksField} = $2, ${verifiedByField} = $3, ${verifiedAtField} = NOW(), updated_at = NOW() WHERE id = $4`,
      [action, remarks, req.user.id, ndId]
    );

    const overallStatus = await updateOverallStatus(ndId);

    await pool.query(
      `INSERT INTO workflow_steps (workflow_type, reference_id, step_name, action, performed_by, comments)
       VALUES ('no_dues', $1, $2, $3, $4, $5)`,
      [ndId, stepName, action, req.user.id, remarks || action]
    );

    // Notify student
    const ndResult = await pool.query('SELECT nd.*, u.id as user_id FROM no_dues_requests nd JOIN students s ON nd.student_id = s.id JOIN users u ON s.user_id = u.id WHERE nd.id = $1', [ndId]);
    if (ndResult.rows.length > 0) {
      const notifMsg = overallStatus === 'completed'
        ? 'All departments (Admin, HOD, Warden, Fee Cell, Faculty) have approved your No-Dues request! Your certificate is ready.'
        : overallStatus === 'rejected'
        ? `Your No-Dues request was rejected at ${stepName}. Reason: ${remarks}`
        : `${stepName} completed (${action}). Real-time clearance in progress.`;

      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
         VALUES ($1, 'No-Dues Update', $2, $3, 'no_dues', $4)`,
        [ndResult.rows[0].user_id, notifMsg, action === 'approved' ? 'success' : 'error', ndId]
      );
    }

    res.json({ success: true, message: `${stepName} ${action} successfully in real-time.`, overallStatus });
  } catch (err) {
    console.error('No-dues verify error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/nodues/:id - Get specific no-dues with workflow steps
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ndResult = await pool.query(
      `SELECT nd.*, u.name as student_name, s.enrollment_no, d.name as department_name
       FROM no_dues_requests nd
       JOIN students s ON nd.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN departments d ON s.department_id = d.id
       WHERE nd.id = $1`, [req.params.id]
    );
    if (ndResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Request not found' });

    const steps = await pool.query(
      `SELECT ws.*, u.name as performed_by_name FROM workflow_steps ws
       LEFT JOIN users u ON ws.performed_by = u.id
       WHERE ws.reference_id = $1 AND ws.workflow_type = 'no_dues'
       ORDER BY ws.created_at ASC`, [req.params.id]
    );

    res.json({ success: true, data: { ...ndResult.rows[0], workflowSteps: steps.rows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
