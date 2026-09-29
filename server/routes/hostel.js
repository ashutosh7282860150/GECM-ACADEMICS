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

      res.json({ success: true, data: { hostelResident: student.hostel_resident, allocation: allocation.rows[0] || null } });
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
