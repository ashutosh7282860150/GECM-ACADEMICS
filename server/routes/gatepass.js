const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// GET /api/gatepass - Get gate passes
router.get('/', authenticate, async (req, res) => {
  try {
    let query, params = [];
    
    if (req.user.role === 'student') {
      const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      query = `SELECT gp.*, u.name as approved_by_name FROM gate_passes gp 
               LEFT JOIN users u ON gp.approved_by = u.id
               WHERE gp.student_id = $1 ORDER BY gp.created_at DESC`;
      params = [studentResult.rows[0].id];
    } else {
      // Warden, Admin
      const { status } = req.query;
      query = `SELECT gp.*, u.name as student_name, s.enrollment_no, d.name as department_name
               FROM gate_passes gp
               JOIN students s ON gp.student_id = s.id
               JOIN users u ON s.user_id = u.id
               LEFT JOIN departments d ON s.department_id = d.id
               ${status ? 'WHERE gp.status = $1' : ''}
               ORDER BY gp.created_at DESC LIMIT 50`;
      if (status) params = [status];
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('Gate pass fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/gatepass - Create gate pass request
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { reason, destination, fromDatetime, toDatetime } = req.body;
    
    if (!reason || !destination || !fromDatetime || !toDatetime) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const studentId = studentResult.rows[0].id;

    const gpId = uuidv4();
    const result = await pool.query(
      `INSERT INTO gate_passes (id, student_id, reason, destination, from_datetime, to_datetime, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
      [gpId, studentId, reason, destination, fromDatetime, toDatetime]
    );

    // Notify warden
    const wardenResult = await pool.query("SELECT id FROM users WHERE role = 'warden' LIMIT 1");
    if (wardenResult.rows.length > 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
         VALUES ($1, 'New Gate Pass Request', $2, 'action_required', 'gate_pass', $3)`,
        [wardenResult.rows[0].id, `${req.user.name} has submitted a gate pass request.`, gpId]
      );
    }

    // Log workflow step
    await pool.query(
      `INSERT INTO workflow_steps (workflow_type, reference_id, step_name, action, performed_by, comments)
       VALUES ('gate_pass', $1, 'Request Created', 'created', $2, $3)`,
      [gpId, req.user.id, `Gate pass requested to ${destination}`]
    );

    res.status(201).json({ success: true, message: 'Gate pass request submitted!', data: result.rows[0] });
  } catch (err) {
    console.error('Gate pass create error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/gatepass/:id/approve - Warden approves
router.put('/:id/approve', authenticate, authorize('warden', 'admin'), async (req, res) => {
  try {
    const { remarks } = req.body;
    const gpId = req.params.id;

    const gpResult = await pool.query('SELECT * FROM gate_passes WHERE id = $1', [gpId]);
    if (gpResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Gate pass not found' });
    const gp = gpResult.rows[0];

    // Generate QR Code data
    const qrData = JSON.stringify({
      id: gpId,
      studentId: gp.student_id,
      destination: gp.destination,
      from: gp.from_datetime,
      to: gp.to_datetime,
      approvedBy: req.user.name,
      approvedAt: new Date().toISOString()
    });

    // Generate QR code as base64
    const qrCode = await QRCode.toDataURL(qrData, { width: 300, margin: 2 });

    await pool.query(
      `UPDATE gate_passes SET status = 'approved', approved_by = $1, approved_at = NOW(), 
       remarks = $2, qr_code = $3, qr_data = $4, updated_at = NOW() WHERE id = $5`,
      [req.user.id, remarks, qrCode, qrData, gpId]
    );

    // Notify student
    const studentUserResult = await pool.query(
      'SELECT u.id FROM users u JOIN students s ON s.user_id = u.id WHERE s.id = $1', [gp.student_id]
    );
    if (studentUserResult.rows.length > 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
         VALUES ($1, 'Gate Pass Approved ✅', 'Your gate pass has been approved. You can now download the QR code.', 'success', 'gate_pass', $2)`,
        [studentUserResult.rows[0].id, gpId]
      );
    }

    await pool.query(
      `INSERT INTO workflow_steps (workflow_type, reference_id, step_name, action, performed_by, comments)
       VALUES ('gate_pass', $1, 'Warden Approval', 'approved', $2, $3)`,
      [gpId, req.user.id, remarks || 'Approved']
    );

    res.json({ success: true, message: 'Gate pass approved and QR code generated!', data: { qrCode, qrData } });
  } catch (err) {
    console.error('Gate pass approve error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/gatepass/:id/reject - Warden rejects
router.put('/:id/reject', authenticate, authorize('warden', 'admin'), async (req, res) => {
  try {
    const { remarks } = req.body;
    const gpId = req.params.id;

    const gpResult = await pool.query('SELECT * FROM gate_passes WHERE id = $1', [gpId]);
    if (gpResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Gate pass not found' });
    const gp = gpResult.rows[0];

    await pool.query(
      `UPDATE gate_passes SET status = 'rejected', approved_by = $1, approved_at = NOW(), remarks = $2, updated_at = NOW() WHERE id = $3`,
      [req.user.id, remarks, gpId]
    );

    const studentUserResult = await pool.query(
      'SELECT u.id FROM users u JOIN students s ON s.user_id = u.id WHERE s.id = $1', [gp.student_id]
    );
    if (studentUserResult.rows.length > 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
         VALUES ($1, 'Gate Pass Rejected ❌', $2, 'error', 'gate_pass', $3)`,
        [studentUserResult.rows[0].id, `Your gate pass was rejected. Reason: ${remarks || 'No reason provided'}`, gpId]
      );
    }

    await pool.query(
      `INSERT INTO workflow_steps (workflow_type, reference_id, step_name, action, performed_by, comments)
       VALUES ('gate_pass', $1, 'Warden Rejection', 'rejected', $2, $3)`,
      [gpId, req.user.id, remarks || 'Rejected']
    );

    res.json({ success: true, message: 'Gate pass rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/gatepass/verify-qr - Security scans QR
router.post('/verify-qr', authenticate, async (req, res) => {
  try {
    const { qrData } = req.body;
    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid QR code data.' });
    }

    const result = await pool.query(
      `SELECT gp.*, u.name as student_name, s.enrollment_no 
       FROM gate_passes gp
       JOIN students s ON gp.student_id = s.id
       JOIN users u ON s.user_id = u.id
       WHERE gp.id = $1`, [parsedData.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Gate pass not found.' });
    const gp = result.rows[0];

    const now = new Date();
    const fromDate = new Date(gp.from_datetime);
    const toDate = new Date(gp.to_datetime);
    const isValid = gp.status === 'approved' && now >= fromDate && now <= toDate;

    res.json({
      success: true,
      data: {
        isValid,
        gatePass: gp,
        message: isValid ? '✅ Valid Gate Pass' : '❌ Invalid or Expired Gate Pass',
        validityStatus: {
          statusOk: gp.status === 'approved',
          withinTime: now >= fromDate && now <= toDate
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/gatepass/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gp.*, u.name as student_name, s.enrollment_no, wu.name as approved_by_name
       FROM gate_passes gp
       JOIN students s ON gp.student_id = s.id
       JOIN users u ON s.user_id = u.id
       LEFT JOIN users wu ON gp.approved_by = wu.id
       WHERE gp.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Gate pass not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
