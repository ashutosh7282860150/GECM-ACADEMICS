const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const mockStore = require('../services/mockStore');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/fees - Get fees for logged in student
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
      const studentId = studentResult.rows[0]?.id || (mockStore.students.find(s => s.user_id === req.user.id)?.id) || 's10';
      const result = await pool.query('SELECT * FROM fees WHERE student_id = $1 ORDER BY created_at DESC', [studentId]);
      let feeList = result.rows;
      if (!feeList || feeList.length === 0) {
        feeList = (mockStore.fees || []).filter(f => f.student_id === studentId || f.student_id === 's10');
      }
      return res.json({ success: true, data: feeList });
    } else {
      // Admin/Accounts can see all
      const result = await pool.query(
        `SELECT f.*, u.name as student_name, s.enrollment_no 
         FROM fees f JOIN students s ON f.student_id = s.id JOIN users u ON s.user_id = u.id
         ORDER BY f.created_at DESC LIMIT 100`
      );
      let feeList = result.rows;
      if (!feeList || feeList.length === 0) {
        feeList = mockStore.fees || [];
      }
      return res.json({ success: true, data: feeList });
    }
  } catch (err) {
    console.error('Fetch fees error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/fees/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fees WHERE id = $1', [req.params.id]);
    let fee = result.rows[0];
    if (!fee && mockStore.fees) {
      fee = mockStore.fees.find(f => f.id === req.params.id || f.id === String(req.params.id));
    }
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    res.json({ success: true, data: fee });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/fees/pay - Process fee payment (mock)
router.post('/pay', authenticate, authorize('student'), async (req, res) => {
  try {
    const { feeId, paymentMethod, cardDetails } = req.body;
    const studentResult = await pool.query('SELECT id, enrollment_no, department_id, semester FROM students WHERE user_id = $1', [req.user.id]);
    const studentObj = studentResult.rows[0] || mockStore.students.find(s => s.user_id === req.user.id) || mockStore.students[0];
    const studentId = studentObj?.id || 's10';

    let feeResult = await pool.query('SELECT * FROM fees WHERE id = $1 AND student_id = $2', [feeId, studentId]);
    if (feeResult.rows.length === 0) {
      feeResult = await pool.query('SELECT * FROM fees WHERE id = $1', [feeId]);
    }
    let fee = feeResult.rows[0];
    if (!fee && mockStore.fees) {
      fee = mockStore.fees.find(f => f.id === feeId || f.id === String(feeId));
    }

    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    if (fee.status === 'paid') {
      return res.status(400).json({ success: false, message: 'This fee is already paid.' });
    }

    const transactionId = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
    const receiptNo = 'RCPT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    // Save payment
    await pool.query(
      `INSERT INTO payments (fee_id, student_id, amount, payment_method, transaction_id, status, receipt_no)
       VALUES ($1, $2, $3, $4, $5, 'success', $6)`,
      [fee.id, studentId, fee.amount, paymentMethod || 'Online Banking', transactionId, receiptNo]
    );

    // Update fee status in DB & mockStore
    await pool.query("UPDATE fees SET status = 'paid' WHERE id = $1", [fee.id]);
    fee.status = 'paid';
    fee.updated_at = new Date();

    // Send notification
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id)
       VALUES ($1, $2, $3, 'success', 'payment', $4)`,
      [req.user.id, 'Payment Successful', `Payment of ₹${fee.amount} for ${fee.fee_type} was successful. Receipt: ${receiptNo}`, fee.id]
    );

    const deptName = req.user.department_name || studentObj?.department_name || 'Computer Science & Engineering';

    res.json({
      success: true,
      message: 'Payment processed successfully! Official receipt generated.',
      data: {
        transactionId,
        transaction_id: transactionId,
        receiptNo,
        receipt_no: receiptNo,
        amount: fee.amount,
        feeType: fee.fee_type,
        fee_type: fee.fee_type,
        description: fee.description || `${fee.fee_type} (Semester ${fee.semester})`,
        paymentMethod: paymentMethod || 'Online Banking',
        payment_method: paymentMethod || 'Online Banking',
        studentName: req.user.name,
        student_name: req.user.name,
        enrollmentNo: req.user.enrollment_no || studentObj?.enrollment_no || 'CSE2021001',
        enrollment_no: req.user.enrollment_no || studentObj?.enrollment_no || 'CSE2021001',
        departmentName: deptName,
        department_name: deptName,
        semester: fee.semester || studentObj?.semester || 7,
        academicYear: fee.academic_year || '2024-25',
        academic_year: fee.academic_year || '2024-25',
        paidAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
        feeId: fee.id,
        status: 'completed'
      }
    });
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
      studentId = studentResult.rows[0]?.id || (mockStore.students.find(s => s.user_id === req.user.id)?.id) || 's10';
    }

    const query = studentId
      ? `SELECT p.*, f.fee_type, f.description FROM payments p LEFT JOIN fees f ON p.fee_id = f.id WHERE p.student_id = $1 ORDER BY p.created_at DESC`
      : `SELECT p.*, f.fee_type, u.name as student_name, s.enrollment_no FROM payments p LEFT JOIN fees f ON p.fee_id = f.id JOIN students s ON p.student_id = s.id JOIN users u ON s.user_id = u.id ORDER BY p.created_at DESC LIMIT 50`;

    const result = await pool.query(query, studentId ? [studentId] : []);
    let paymentList = result.rows;
    if (!paymentList || paymentList.length === 0) {
      if (studentId) {
        paymentList = (mockStore.payments || []).filter(p => p.student_id === studentId || p.student_id === 's10');
      } else {
        paymentList = mockStore.payments || [];
      }
    }

    res.json({ success: true, data: paymentList });
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
