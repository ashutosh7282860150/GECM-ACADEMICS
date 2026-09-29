const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/notifications - Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { unread } = req.query;
    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    if (unread === 'true') query += ' AND is_read = FALSE';
    query += ' ORDER BY created_at DESC LIMIT 20';
    
    const result = await pool.query(query, [req.user.id]);
    const unreadCount = await pool.query('SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE', [req.user.id]);
    
    res.json({ success: true, data: result.rows, unreadCount: parseInt(unreadCount.rows[0].count) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/notifications/:id/read - Mark as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', authenticate, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [req.user.id]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/notifications/send - Admin sends notification
router.post('/send', authenticate, authorize('admin', 'hod'), async (req, res) => {
  try {
    const { userIds, title, message, type } = req.body;
    for (const userId of userIds) {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)`,
        [userId, title, message, type || 'info']
      );
    }
    res.json({ success: true, message: `Notification sent to ${userIds.length} users.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
