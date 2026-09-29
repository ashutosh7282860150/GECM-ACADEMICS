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

    // Notify warden for hostel verification
    const wardenResult = await pool.query("SELECT id FROM users WHERE role = 'warden' LIMIT 1");
    if (wardenResult.rows.length > 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
         VALUES ($1, 'No-Dues Request', $2, 'action_required', 'no_dues', $3)`,
        [wardenResult.rows[0].id, `${req.user.name} has submitted a no-dues request requiring hostel verification.`, ndId]
      );
    }

    res.status(201).json({ success: true, message: 'No-dues request submitted successfully!', data: result.rows[0] });
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
  const statuses = [r.hostel_status, r.library_status, r.accounts_status, r.admin_status];
  
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
router.put('/:id/verify', authenticate, authorize('warden', 'accounts', 'admin'), async (req, res) => {
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
      stepName = 'Accounts Verification';
    } else if (role === 'admin') {
      statusField = 'admin_status'; remarksField = 'admin_remarks';
      verifiedByField = 'admin_verified_by'; verifiedAtField = 'admin_verified_at';
      stepName = 'Admin Approval';
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
        ? 'All departments have approved your No-Dues request! Your certificate is ready.'
        : overallStatus === 'rejected'
        ? `Your No-Dues request was rejected at ${stepName}. Reason: ${remarks}`
        : `${stepName} completed. Status: ${action}. Next step pending.`;

      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
         VALUES ($1, 'No-Dues Update', $2, $3, 'no_dues', $4)`,
        [ndResult.rows[0].user_id, notifMsg, action === 'approved' ? 'success' : 'error', ndId]
      );
    }

    // Admin approval needed: notify admin after accounts
    if (role === 'accounts' && action === 'approved') {
      const adminResult = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      if (adminResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
           VALUES ($1, 'No-Dues Pending Admin Approval', 'A no-dues request is ready for your final approval.', 'action_required', 'no_dues', $2)`,
          [adminResult.rows[0].id, ndId]
        );
      }
    }

    res.json({ success: true, message: `${stepName} ${action} successfully.`, overallStatus });
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
