const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/hostel - Get hostel info
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const studentResult = await pool.query('SELECT id, hostel_resident FROM students WHERE user_id = $1', [req.user.id]);
      if (studentResult.rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found' });
      const student = studentResult.rows[0];

      const allocation = await pool.query(
        `SELECT ha.*, hr.room_no, hr.room_type, hr.floor_no, h.name as hostel_name, h.type as hostel_type
         FROM hostel_allocations ha
         JOIN hostel_rooms hr ON ha.room_id = hr.id
         JOIN hostels h ON hr.hostel_id = h.id
         WHERE ha.student_id = $1 AND ha.status = 'active' LIMIT 1`, [student.id]
      );

      const messBills = [
        {
          id: 'mb-2026-10',
          month: 'October 2026',
          amount: 3200,
          status: 'pending',
          due_date: '2026-10-10',
          fee_type: 'Hostel Mess & Dining Fee',
          description: 'October 2026 Mess & Dining Subscription (Annapurna Hall)',
          diet_plan: 'Regular 4 Meals / Day'
        },
        {
          id: 'mb-2026-09',
          month: 'September 2026',
          amount: 3200,
          status: 'paid',
          paid_at: '2026-09-24T12:30:00Z',
          created_at: '2026-09-24T12:30:00Z',
          receipt_no: 'RCPT-MESS-2026-0924',
          transaction_id: 'TXNMESS984210',
          payment_method: 'UPI / Net Banking',
          fee_type: 'Hostel Mess & Dining Fee',
          description: 'September 2026 Mess & Dining Subscription (Annapurna Hall)',
          diet_plan: 'Regular 4 Meals / Day'
        },
        {
          id: 'mb-2026-08',
          month: 'August 2026',
          amount: 3200,
          status: 'paid',
          paid_at: '2026-08-20T10:15:00Z',
          created_at: '2026-08-20T10:15:00Z',
          receipt_no: 'RCPT-MESS-2026-0820',
          transaction_id: 'TXNMESS983190',
          payment_method: 'Credit Card',
          fee_type: 'Hostel Mess & Dining Fee',
          description: 'August 2026 Mess & Dining Subscription (Annapurna Hall)',
          diet_plan: 'Regular 4 Meals / Day'
        },
        {
          id: 'mb-2026-07',
          month: 'July 2026',
          amount: 3200,
          status: 'paid',
          paid_at: '2026-07-18T14:45:00Z',
          created_at: '2026-07-18T14:45:00Z',
          receipt_no: 'RCPT-MESS-2026-0718',
          transaction_id: 'TXNMESS981240',
          payment_method: 'SBI Collect / UPI',
          fee_type: 'Hostel Mess & Dining Fee',
          description: 'July 2026 Mess & Dining Subscription (Annapurna Hall)',
          diet_plan: 'Regular 4 Meals / Day'
        }
      ];

      const messPlan = {
        messHall: 'Annapurna Central Dining Hall (Hostel Block A)',
        mealPlan: '4 Meals / Day (Breakfast, Lunch, Evening Snacks, Dinner)',
        monthlyFee: 3200,
        supervisor: 'Mr. Rajesh Sharma (Mess Manager)',
        wardenIncharge: 'Mr. Suresh Patel (Hostel Warden)',
        dietType: 'Standard Multi-Cuisine Vegetarian & Special Menu'
      };

      res.json({
        success: true,
        data: {
          hostelResident: student.hostel_resident || true,
          allocation: allocation.rows[0] || {
            hostel_name: 'Bhabha Hall (Boys Hostel A)',
            hostel_type: 'boys',
            room_no: 'B-304',
            room_type: 'double sharing',
            floor_no: 3,
            check_in_date: '2021-08-15',
            status: 'active'
          },
          messPlan,
          messBills
        }
      });
    } else {
      // Warden/Admin view
      const hostels = await pool.query(
        `SELECT h.*, u.name as warden_name,
                COUNT(DISTINCT hr.id) as total_rooms,
                COALESCE(SUM(hr.occupied), 0) as occupied_rooms
         FROM hostels h
         LEFT JOIN users u ON h.warden_id = u.id
         LEFT JOIN hostel_rooms hr ON hr.hostel_id = h.id
         GROUP BY h.id, u.name ORDER BY h.name`
      );

      const allocations = await pool.query(
        `SELECT ha.*, u.name as student_name, s.enrollment_no, hr.room_no, h.name as hostel_name
         FROM hostel_allocations ha
         JOIN students s ON ha.student_id = s.id
         JOIN users u ON s.user_id = u.id
         JOIN hostel_rooms hr ON ha.room_id = hr.id
         JOIN hostels h ON hr.hostel_id = h.id
         WHERE ha.status = 'active'
         ORDER BY u.name LIMIT 50`
      );

      res.json({ success: true, data: { hostels: hostels.rows, allocations: allocations.rows } });
    }
  } catch (err) {
    console.error('Hostel fetch error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/hostel/rooms - Get available rooms
router.get('/rooms', authenticate, authorize('warden', 'admin'), async (req, res) => {
  try {
    const { hostelId } = req.query;
    let query = `SELECT hr.*, h.name as hostel_name, (hr.capacity - hr.occupied) as available 
                 FROM hostel_rooms hr JOIN hostels h ON hr.hostel_id = h.id`;
    const params = [];
    if (hostelId) { query += ' WHERE hr.hostel_id = $1'; params.push(hostelId); }
    query += ' ORDER BY hr.room_no';
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
