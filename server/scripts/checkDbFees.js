const pool = require('../config/database');
const mockStore = require('../services/mockStore');

async function checkDb() {
  try {
    const studentRes = await pool.query('SELECT * FROM students WHERE user_id = $1', ['u10']);
    console.log('Students query rows:', studentRes.rows);

    const feeRes = await pool.query('SELECT * FROM fees');
    console.log('Fees query count:', feeRes.rows.length);
    console.log('Fees in DB:', feeRes.rows.map(f => ({ id: f.id, student_id: f.student_id, fee_type: f.fee_type, status: f.status })));
  } catch (err) {
    console.error('Check DB error:', err);
  } finally {
    process.exit(0);
  }
}

checkDb();
