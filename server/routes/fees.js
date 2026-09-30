const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/fees - Get fees for logged in student
router.get('/', authenticate, async (req, res) => {
  try {
    let query, params;
    if (req.user.role === 'student') {
      const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      query = 'SELECT * FROM fees WHERE student_id = $1 ORDER BY created_at DESC';
      params = [studentResult.rows[0].id];
    } else {
      // Admin/Accounts can see all
      query = `SELECT f.*, u.name as student_name, s.enrollment_no 
               FROM fees f JOIN students s ON f.student_id = s.id JOIN users u ON s.user_id = u.id
               ORDER BY f.created_at DESC LIMIT 100`;
      params = [];
    }
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/fees/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.name as student_name, s.enrollment_no 
       FROM fees f JOIN students s ON f.student_id = s.id JOIN users u ON s.user_id = u.id
       WHERE f.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Fee not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/fees/pay - Process fee payment (mock)
router.post('/pay', authenticate, authorize('student'), async (req, res) => {
  try {
    const { feeId, paymentMethod, cardDetails } = req.body;
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
    const studentId = studentResult.rows[0].id;

    const feeResult = await pool.query('SELECT * FROM fees WHERE id = $1 AND student_id = $2', [feeId, studentId]);
    if (feeResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Fee record not found' });
    const fee = feeResult.rows[0];

    if (fee.status === 'paid') return res.status(400).json({ success: false, message: 'This fee is already paid.' });

    // Mock payment processing (simulate 95% success rate)
    const success = Math.random() > 0.05;
    const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
    const receiptNo = 'RCPT-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    if (success) {
      // Create payment record
      await pool.query(
        `INSERT INTO payments (fee_id, student_id, amount, payment_method, transaction_id, status, receipt_no)
         VALUES ($1, $2, $3, $4, $5, 'success', $6)`,
        [feeId, studentId, fee.amount, paymentMethod, transactionId, receiptNo]
      );
      // Update fee status
      await pool.query("UPDATE fees SET status = 'paid' WHERE id = $1", [feeId]);

      // Send notification
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
         VALUES ($1, $2, $3, 'success', 'payment', $4)`,
        [req.user.id, 'Payment Successful', `Payment of ₹${fee.amount} for ${fee.fee_type} was successful. Receipt: ${receiptNo}`, feeId]
      );

      res.json({
        success: true,
        message: 'Payment processed successfully!',
        data: {
          transactionId,
          transaction_id: transactionId,
          receiptNo,
          receipt_no: receiptNo,
          amount: fee.amount,
          feeType: fee.fee_type,
          fee_type: fee.fee_type,
          description: fee.description || `${fee.fee_type} (Semester ${fee.semester})`,
          paymentMethod,
          payment_method: paymentMethod,
          studentName: req.user.name,
          student_name: req.user.name,
          enrollmentNo: req.user.enrollment_no,
          enrollment_no: req.user.enrollment_no,
          departmentName: req.user.department_name || 'Computer Science & Engineering',
          department_name: req.user.department_name || 'Computer Science & Engineering',
          semester: fee.semester || 7,
          academicYear: fee.academic_year || '2024-25',
          academic_year: fee.academic_year || '2024-25',
          paidAt: new Date().toISOString(),
          created_at: new Date().toISOString(),
          feeId,
          status: 'completed'
        }
      });
    } else {
      await pool.query(
        `INSERT INTO payments (fee_id, student_id, amount, payment_method, transaction_id, status)
         VALUES ($1, $2, $3, $4, $5, 'failed')`,
        [feeId, studentId, fee.amount, paymentMethod, transactionId]
      );
      res.status(402).json({ success: false, message: 'Payment failed. Please try again or use a different payment method.' });
    }
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ success: false, message: 'Server error during payment processing.' });
  }
});

// GET /api/fees/payments/history - Payment history
router.get('/payments/history', authenticate, async (req, res) => {
  try {
    let studentId;
    if (req.user.role === 'student') {
      const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      studentId = studentResult.rows[0].id;
    }

    const query = studentId
      ? `SELECT p.*, f.fee_type, f.description FROM payments p LEFT JOIN fees f ON p.fee_id = f.id WHERE p.student_id = $1 ORDER BY p.created_at DESC`
      : `SELECT p.*, f.fee_type, u.name as student_name, s.enrollment_no FROM payments p LEFT JOIN fees f ON p.fee_id = f.id JOIN students s ON p.student_id = s.id JOIN users u ON s.user_id = u.id ORDER BY p.created_at DESC LIMIT 50`;

    const result = await pool.query(query, studentId ? [studentId] : []);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/fees/:id/verify - Accounts verify payment
router.put('/:id/verify', authenticate, authorize('accounts', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    await pool.query(
      `UPDATE payments SET status = $1, notes = $2, verified_by = $3, verified_at = NOW() WHERE id = $4`,
      [status, notes, req.user.id, req.params.id]
    );
    res.json({ success: true, message: `Payment ${status} successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
