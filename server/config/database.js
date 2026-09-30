const { Pool } = require('pg');
const mockStore = require('../services/mockStore');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  null;

const isRemoteDb = Boolean(
  connectionString ||
  process.env.DB_SSL === 'true' ||
  (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1')
);

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'smartcampus_erp',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

const realPool = new Pool(poolConfig);
let poolConnected = false;

realPool.on('connect', () => {
  poolConnected = true;
  console.log('✅ Connected to PostgreSQL database');
});

realPool.on('error', (err) => {
  poolConnected = false;
  console.warn('⚠️ Database connection error, fallback to in-memory store:', err.message);
});

// Smart query wrapper with mock fallback
const query = async (text, params = []) => {
  try {
    const res = await realPool.query(text, params);
    poolConnected = true;
    return res;
  } catch (err) {
    if (poolConnected || connectionString) {
      console.warn('⚠️ Postgres query failed, executing with mock store fallback:', err.message);
    }
  }

  // MOCK STORE QUERY FALLBACK ENGINE
  const cleanSql = text.replace(/\s+/g, ' ').trim().toLowerCase();
  
  // 0. SELECT users JOIN students
  if (cleanSql.includes('from users') && cleanSql.includes('students') && cleanSql.includes('s.id = $1')) {
    const studentId = params[0];
    const st = mockStore.students.find(s => s.id === studentId || s.user_id === studentId);
    if (st) {
      const user = mockStore.users.find(u => u.id === st.user_id);
      return { rows: user ? [{ id: user.id }] : [{ id: st.user_id }], rowCount: 1 };
    }
    return { rows: [{ id: 'u10' }], rowCount: 1 };
  }

  // 1. SELECT users BY EMAIL / ENROLLMENT NO / EMPLOYEE ID
  if (cleanSql.includes('from users') && (cleanSql.includes('email') || cleanSql.includes('enrollment_no') || cleanSql.includes('$1')) && !cleanSql.includes('where id = $1')) {
    const identifier = (params[0] || '').toLowerCase().trim();
    const user = mockStore.users.find(u => {
      if (!u.is_active) return false;
      if (u.email && u.email.toLowerCase() === identifier) return true;
      const st = mockStore.students.find(s => s.user_id === u.id);
      if (st && st.enrollment_no && st.enrollment_no.toLowerCase() === identifier) return true;
      const fc = mockStore.faculty.find(f => f.user_id === u.id);
      if (fc && fc.employee_id && fc.employee_id.toLowerCase() === identifier) return true;
      return false;
    });
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
    const normalizeGp = (g) => {
      const st = mockStore.students.find(s => s.id === g.student_id || s.user_id === g.student_id) || mockStore.students[0];
      return {
        ...g,
        from_datetime: g.from_datetime || g.out_date_time,
        to_datetime: g.to_datetime || g.expected_in_date_time,
        remarks: g.remarks || g.warden_comment,
        student_name: g.student_name || st.name,
        enrollment_no: g.enrollment_no || st.enrollment_no,
        phone: g.phone || st.phone,
        hostel_name: g.hostel_name || 'Bhabha Hall (Boys Hostel A)',
        room_number: g.room_number || 'B-304',
        qr_data: g.qr_data || g.qr_code_data || JSON.stringify({
          id: g.id,
          passNumber: g.pass_number || 'GP-VERIFIED',
          studentName: g.student_name || st.name,
          enrollment: g.enrollment_no || st.enrollment_no,
          destination: g.destination,
          status: g.status
        })
      };
    };

    if (cleanSql.includes('id = $1') || cleanSql.includes('pass_number = $1')) {
      const id = params[0];
      const gp = mockStore.gatePasses.find(g => g.id === id || g.pass_number === id);
      return { rows: gp ? [normalizeGp(gp)] : [], rowCount: gp ? 1 : 0 };
    }
    if (cleanSql.includes('where gp.status = $1') || cleanSql.includes('where status = $1')) {
      const status = params[0];
      const gps = mockStore.gatePasses.filter(g => g.status === status).map(normalizeGp);
      return { rows: gps, rowCount: gps.length };
    }
    if (cleanSql.includes('student_id')) {
      const studentId = params[0];
      const gps = mockStore.gatePasses.filter(g => g.student_id === studentId || studentId === 's10').map(normalizeGp);
      return { rows: gps, rowCount: gps.length };
    }
    return { rows: mockStore.gatePasses.map(normalizeGp), rowCount: mockStore.gatePasses.length };
  }

  // 17. SELECT notifications
  if (cleanSql.includes('from notifications')) {
    const userId = params[0];
    let userNotifs = mockStore.notifications;
    if (userId) {
      userNotifs = mockStore.notifications.filter(n => n.user_id === userId || !n.user_id);
    }
    if (cleanSql.includes('is_read = false') || cleanSql.includes('unread')) {
      userNotifs = userNotifs.filter(n => !n.is_read);
    }
    if (cleanSql.includes('count(*)')) {
      const count = userNotifs.filter(n => !n.is_read).length;
      return { rows: [{ count }], rowCount: 1 };
    }
    return { rows: userNotifs, rowCount: userNotifs.length };
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
    const id = params[0] || ('gp_' + Date.now());
    const studentId = params[1] || 's10';
    const reason = params[2] || 'Campus Outpass';
    const destination = params[3] || 'Home';
    const fromDatetime = params[4] || new Date().toISOString();
    const toDatetime = params[5] || new Date().toISOString();

    const studentObj = mockStore.students.find(s => s.id === studentId || s.user_id === studentId) || mockStore.students[0];
    const newGp = {
      id,
      pass_number: 'GP-' + Math.floor(100000 + Math.random() * 900000),
      student_id: studentObj.id,
      reason,
      destination,
      from_datetime: fromDatetime,
      to_datetime: toDatetime,
      out_date_time: fromDatetime,
      expected_in_date_time: toDatetime,
      status: 'pending',
      qr_code: null,
      qr_data: null,
      qr_code_data: null,
      remarks: null,
      created_at: new Date(),
      student_name: studentObj.name || 'Arjun Patel',
      enrollment_no: studentObj.enrollment_no || 'CSE2021001',
      hostel_name: 'Bhabha Hall (Boys Hostel A)',
      room_number: 'B-304',
      phone: studentObj.phone || '9900000010'
    };
    mockStore.gatePasses.unshift(newGp);
    return { rows: [newGp], rowCount: 1 };
  }

  // UPDATE gate_passes (Approve / Reject)
  if (cleanSql.includes('update gate_passes')) {
    const gpId = params[params.length - 1];
    const gp = mockStore.gatePasses.find(g => g.id === gpId || g.pass_number === gpId);
    if (gp) {
      if (cleanSql.includes("status = 'approved'")) {
        gp.status = 'approved';
        gp.approved_by = params[0];
        gp.remarks = params[1];
        gp.qr_code = params[2];
        gp.qr_data = params[3];
        gp.qr_code_data = params[3];
        gp.approved_at = new Date();
      } else if (cleanSql.includes("status = 'rejected'")) {
        gp.status = 'rejected';
        gp.approved_by = params[0];
        gp.remarks = params[1];
        gp.approved_at = new Date();
      }
      gp.updated_at = new Date();
      return { rows: [gp], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // INSERT INTO notifications
  if (cleanSql.includes('insert into notifications')) {
    const notif = {
      id: 'n_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      user_id: params[0],
      title: params[1],
      message: params[2],
      type: params[3] || 'info',
      reference_type: params[4] || null,
      reference_id: params[5] || null,
      is_read: false,
      created_at: new Date()
    };
    mockStore.notifications.unshift(notif);
    return { rows: [notif], rowCount: 1 };
  }

  // UPDATE notifications (Mark Read)
  if (cleanSql.includes('update notifications set is_read = true')) {
    if (cleanSql.includes('where id = $1')) {
      const n = mockStore.notifications.find(item => item.id === params[0]);
      if (n) n.is_read = true;
    } else {
      const userId = params[0];
      mockStore.notifications.forEach(n => {
        if (!userId || n.user_id === userId) n.is_read = true;
      });
    }
    return { rows: [], rowCount: 1 };
  }

  // INSERT INTO attendance
  if (cleanSql.includes('insert into attendance')) {
    const studentId = params[0];
    const courseId = params[1];
    const date = params[2];
    const status = params[3];
    const markedBy = params[4];

    const course = mockStore.courses.find(c => c.id === courseId);
    const existingIdx = mockStore.attendance.findIndex(a => a.student_id === studentId && a.course_id === courseId && a.date === date);
    const attObj = {
      id: 'att_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      student_id: studentId,
      course_id: courseId,
      date,
      status,
      marked_by: markedBy,
      course_name: course?.name || 'Lecture Course',
      course_code: course?.code || 'CS'
    };

    if (existingIdx >= 0) {
      mockStore.attendance[existingIdx].status = status;
    } else {
      mockStore.attendance.unshift(attObj);
    }
    return { rows: [attObj], rowCount: 1 };
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
        { id: 'st2', department: 'accounts', status: 'pending', comment: null },
        { id: 'st3', department: 'hod', status: 'pending', comment: null },
        { id: 'st4', department: 'faculty', status: 'pending', comment: null },
        { id: 'st5', department: 'library', status: 'pending', comment: null },
        { id: 'st6', department: 'admin', status: 'pending', comment: null }
      ]
    };
    mockStore.noDuesRequests.unshift(newNd);
    return { rows: [newNd], rowCount: 1 };
  }

  // UPDATE no_dues_requests (Approve / Reject)
  if (cleanSql.includes('update no_dues_requests')) {
    const ndId = params[params.length - 1];
    const nd = mockStore.noDuesRequests.find(n => n.id === ndId || n.request_number === ndId);
    if (nd) {
      if (cleanSql.includes('hostel_status')) {
        nd.hostel_status = params[0];
        nd.hostel_remarks = params[1];
        nd.hostel_verified_by = params[2];
        nd.hostel_verified_at = new Date();
      } else if (cleanSql.includes('accounts_status')) {
        nd.accounts_status = params[0];
        nd.accounts_remarks = params[1];
        nd.accounts_verified_by = params[2];
        nd.accounts_verified_at = new Date();
      } else if (cleanSql.includes('hod_status')) {
        nd.hod_status = params[0];
        nd.hod_remarks = params[1];
        nd.hod_verified_by = params[2];
        nd.hod_verified_at = new Date();
      } else if (cleanSql.includes('faculty_status')) {
        nd.faculty_status = params[0];
        nd.faculty_remarks = params[1];
        nd.faculty_verified_by = params[2];
        nd.faculty_verified_at = new Date();
      } else if (cleanSql.includes('admin_status')) {
        nd.admin_status = params[0];
        nd.admin_remarks = params[1];
        nd.admin_verified_by = params[2];
        nd.admin_verified_at = new Date();
      } else if (cleanSql.includes('overall_status')) {
        nd.overall_status = params[0];
      }
      nd.updated_at = new Date();
      return { rows: [nd], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // INSERT INTO payments
  if (cleanSql.includes('insert into payments')) {
    const feeId = params[0];
    const studentId = params[1];
    const amount = params[2];
    const paymentMethod = params[3];
    const transactionId = params[4];
    const receiptNo = params[5] || params[6] || ('RCPT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
    const fee = mockStore.fees.find(f => f.id === feeId);
    const student = mockStore.students.find(s => s.id === studentId || s.user_id === studentId) || mockStore.students[0];
    const dept = mockStore.departments.find(d => d.id === student?.department_id);

    const paymentObj = {
      id: 'p_' + Date.now(),
      fee_id: feeId,
      student_id: studentId,
      amount: parseFloat(amount) || fee?.amount || 25000,
      payment_method: paymentMethod || 'online',
      transaction_id: transactionId,
      status: 'completed',
      receipt_no: receiptNo,
      created_at: new Date(),
      payment_date: new Date(),
      fee_type: fee?.fee_type || 'Tuition Fee',
      description: fee?.description || 'Semester Fee Payment',
      student_name: student?.name || 'Arjun Patel',
      enrollment_no: student?.enrollment_no || 'CSE2021001',
      department_name: dept?.name || 'Computer Science & Engineering',
      semester: fee?.semester || 7,
      academic_year: fee?.academic_year || '2024-25'
    };
    mockStore.payments.unshift(paymentObj);
    return { rows: [paymentObj], rowCount: 1 };
  }

  // UPDATE fees (Mark Paid)
  if (cleanSql.includes('update fees set status =') || cleanSql.includes("update fees set status = 'paid'")) {
    const feeId = params[params.length - 1];
    const fee = mockStore.fees.find(f => f.id === feeId);
    if (fee) {
      fee.status = 'paid';
      fee.updated_at = new Date();
      return { rows: [fee], rowCount: 1 };
    }
    return { rows: [], rowCount: 1 };
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
  end: () => realPool.end(),
  on: (...args) => realPool.on(...args),
  realPool
};
