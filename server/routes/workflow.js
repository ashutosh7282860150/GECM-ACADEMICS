const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

// GET /api/workflow/:type/:id/steps - Get workflow steps for a request
router.get('/:type/:id/steps', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ws.*, u.name as performed_by_name, u.role as performed_by_role
       FROM workflow_steps ws
       LEFT JOIN users u ON ws.performed_by = u.id
       WHERE ws.workflow_type = $1 AND ws.reference_id = $2
       ORDER BY ws.created_at ASC`,
      [req.params.type, req.params.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
