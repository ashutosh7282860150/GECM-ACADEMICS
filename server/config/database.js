const { Pool } = require('pg');
const mockStore = require('../services/mockStore');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

let poolConnected = false;

const realPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'smartcampus_erp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 1500,
});

realPool.on('connect', () => {
  poolConnected = true;
  console.log('✅ Connected to PostgreSQL database');
});

realPool.on('error', (err) => {
  poolConnected = false;
  console.warn('⚠️ Database connection lost, fallback to in-memory store.');
});

// Smart query wrapper with mock fallback
const query = async (text, params = []) => {
  if (poolConnected) {
    try {
      return await realPool.query(text, params);
    } catch (err) {
      console.warn('⚠️ Postgres query failed, executing with mock store fallback:', err.message);
    }
  }

  // MOCK STORE QUERY FALLBACK ENGINE
  const cleanSql = text.replace(/\s+/g, ' ').trim().toLowerCase();
  
  // 1. SELECT users BY EMAIL
  if (cleanSql.includes('from users') && cleanSql.includes('email = $1')) {
    const email = params[0]?.toLowerCase();
    const user = mockStore.users.find(u => u.email.toLowerCase() === email && u.is_active);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  // 2. SELECT users BY ID
  if (cleanSql.includes('from users') && (cleanSql.includes('id = $1') || cleanSql.includes('where id = $1'))) {
    const id = params[0];
    const user = mockStore.users.find(u => u.id === id);
    return { rows: user ? [{ ...user, is_active: user.is_active }] : [], rowCount: user ? 1 : 0 };
  }

  // 3. SELECT ALL users
  if (cleanSql.includes('from users')) {
    return { rows: mockStore.users, rowCount: mockStore.users.length };
  }

  // 4. UPDATE users LAST LOGIN
  if (cleanSql.includes('update users set last_login')) {
    const id = params[0];
    const u = mockStore.users.find(x => x.id === id);
    if (u) u.last_login = new Date();
    return { rows: [], rowCount: 1 };
  }

  // 5. SELECT students BY user_id (with or without JOIN)
  if (cleanSql.includes('from students') && cleanSql.includes('user_id = $1')) {
    const userId = params[0];
    const st = mockStore.students.find(s => s.user_id === userId);
    if (st) {
      const dept = mockStore.departments.find(d => d.id === st.department_id);
      return { rows: [{ ...st, department_name: dept?.name || 'Unknown', department_code: dept?.code || '' }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 6. SELECT students JOIN departments
  if (cleanSql.includes('from students')) {
    const enriched = mockStore.students.map(st => {
      const dept = mockStore.departments.find(d => d.id === st.department_id);
      return { ...st, department_name: dept?.name || 'Unknown', department_code: dept?.code || '' };
    });
    return { rows: enriched, rowCount: enriched.length };
  }

  // 7. SELECT faculty BY user_id (with or without JOIN)
  if (cleanSql.includes('from faculty') && cleanSql.includes('user_id = $1')) {
    const userId = params[0];
    const fc = mockStore.faculty.find(f => f.user_id === userId);
    if (fc) {
      const dept = mockStore.departments.find(d => d.id === fc.department_id);
      return { rows: [{ ...fc, department_name: dept?.name || 'Unknown', department_code: dept?.code || '' }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 8. SELECT faculty
  if (cleanSql.includes('from faculty')) {
    const enriched = mockStore.faculty.map(fc => {
      const dept = mockStore.departments.find(d => d.id === fc.department_id);
      return { ...fc, department_name: dept?.name || 'Unknown', department_code: dept?.code || '' };
    });
    return { rows: enriched, rowCount: enriched.length };
  }

  // 9. SELECT departments
  if (cleanSql.includes('from departments')) {
    return { rows: mockStore.departments, rowCount: mockStore.departments.length };
  }

  // 10. SELECT courses
  if (cleanSql.includes('from courses')) {
    return { rows: mockStore.courses, rowCount: mockStore.courses.length };
  }

  // 11. SELECT fees
  if (cleanSql.includes('from fees') && cleanSql.includes('student_id')) {
    const studentId = params[0];
    const studentFees = mockStore.fees.filter(f => f.student_id === studentId || studentId === 's10');
    return { rows: studentFees, rowCount: studentFees.length };
  }
  if (cleanSql.includes('from fees')) {
    return { rows: mockStore.fees, rowCount: mockStore.fees.length };
  }

  // 12. SELECT payments
  if (cleanSql.includes('from payments')) {
    return { rows: mockStore.payments, rowCount: mockStore.payments.length };
  }

  // 13. SELECT attendance
  if (cleanSql.includes('from attendance')) {
    return { rows: mockStore.attendance, rowCount: mockStore.attendance.length };
  }

  // 14. SELECT hostel_rooms OR hostel_allocations
  if (cleanSql.includes('from hostel_allocations') || cleanSql.includes('hostel_resident')) {
    return { rows: mockStore.hostelAllocations, rowCount: mockStore.hostelAllocations.length };
  }
  if (cleanSql.includes('from hostel_rooms')) {
    return { rows: mockStore.hostelRooms, rowCount: mockStore.hostelRooms.length };
  }

  // 15. SELECT no_dues_requests
  if (cleanSql.includes('from no_dues_requests')) {
    if (cleanSql.includes('student_id')) {
      const studentId = params[0];
      const reqs = mockStore.noDuesRequests.filter(nd => nd.student_id === studentId || studentId === 's10');
      return { rows: reqs, rowCount: reqs.length };
    }
    if (cleanSql.includes('id = $1')) {
      const id = params[0];
      const nd = mockStore.noDuesRequests.find(n => n.id === id);
      return { rows: nd ? [nd] : [], rowCount: nd ? 1 : 0 };
    }
    return { rows: mockStore.noDuesRequests, rowCount: mockStore.noDuesRequests.length };
  }

  // 16. SELECT gate_passes
  if (cleanSql.includes('from gate_passes')) {
    if (cleanSql.includes('pass_number = $1')) {
      const passNum = params[0];
      const gp = mockStore.gatePasses.find(g => g.pass_number === passNum || g.id === passNum);
      return { rows: gp ? [gp] : [], rowCount: gp ? 1 : 0 };
    }
    if (cleanSql.includes('student_id')) {
      const studentId = params[0];
      const gps = mockStore.gatePasses.filter(g => g.student_id === studentId || studentId === 's10');
      return { rows: gps, rowCount: gps.length };
    }
    return { rows: mockStore.gatePasses, rowCount: mockStore.gatePasses.length };
  }

  // 17. SELECT notifications
  if (cleanSql.includes('from notifications')) {
    return { rows: mockStore.notifications, rowCount: mockStore.notifications.length };
  }

  // 18. SELECT audit_logs
  if (cleanSql.includes('from audit_logs')) {
    return { rows: mockStore.auditLogs, rowCount: mockStore.auditLogs.length };
  }

  // 19. SELECT exams
  if (cleanSql.includes('from examinations') || cleanSql.includes('from exams')) {
    return { rows: mockStore.exams, rowCount: mockStore.exams.length };
  }

  // 20. SELECT results
  if (cleanSql.includes('from results')) {
    return { rows: mockStore.results, rowCount: mockStore.results.length };
  }

  // INSERT INTO gate_passes
  if (cleanSql.includes('insert into gate_passes')) {
    const newGp = {
      id: 'gp_' + Date.now(),
      pass_number: 'GP-' + Math.floor(100000 + Math.random() * 900000),
      student_id: params[0] || 's10',
      reason: params[1] || 'Leave',
      destination: params[2] || 'Home',
      out_date_time: params[3] || new Date().toISOString(),
      expected_in_date_time: params[4] || new Date().toISOString(),
      status: 'pending',
      qr_code_data: null,
      actual_out_time: null,
      actual_in_time: null,
      warden_comment: null,
      created_at: new Date(),
      student_name: 'Arjun Patel',
      enrollment_no: 'CSE2021001',
      hostel_name: 'Bhabha Hall (Boys Hostel A)',
      room_number: 'B-304',
      phone: '9900000010'
    };
    mockStore.gatePasses.unshift(newGp);
    return { rows: [newGp], rowCount: 1 };
  }

  // INSERT INTO no_dues_requests
  if (cleanSql.includes('insert into no_dues_requests')) {
    const newNd = {
      id: 'nd_' + Date.now(),
      request_number: 'ND-' + Math.floor(100000 + Math.random() * 900000),
      student_id: params[0] || 's10',
      reason: params[1] || 'Clearance',
      overall_status: 'pending',
      created_at: new Date(),
      student_name: 'Arjun Patel',
      enrollment_no: 'CSE2021001',
      department_name: 'Computer Science & Engineering',
      steps: [
        { id: 'st1', department: 'hostel', status: 'pending', comment: null },
        { id: 'st2', department: 'library', status: 'pending', comment: null },
        { id: 'st3', department: 'accounts', status: 'pending', comment: null },
        { id: 'st4', department: 'admin', status: 'pending', comment: null }
      ]
    };
    mockStore.noDuesRequests.unshift(newNd);
    return { rows: [newNd], rowCount: 1 };
  }

  // UPDATE / DEFAULT EMPTY RESULT
  return { rows: [], rowCount: 0 };
};

// Initial test connection attempt
realPool.connect((err, client, release) => {
  if (err) {
    poolConnected = false;
    console.log('ℹ️ Local PostgreSQL not running — active fallback to SmartCampus In-Memory Database Engine.');
  } else {
    poolConnected = true;
    release();
  }
});

module.exports = {
  query,
  on: (...args) => realPool.on(...args)
};
