const pool = require('../config/database');

async function testQuery() {
  const res = await pool.query('SELECT * FROM fees WHERE id = $1 AND student_id = $2', ['fe2', 's10']);
  console.log('Query result:', res.rows);
  process.exit(0);
}

testQuery();
