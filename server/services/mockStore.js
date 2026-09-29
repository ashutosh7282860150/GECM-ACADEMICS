const bcrypt = require('bcryptjs');

// Pre-hashed 'password123' - verified with bcrypt.compare
const HASHED_PASSWORD = '$2b$10$gyH9PLhGSzYGAOh8cNTwc.lD5G4NRDV7JOlrR7QKrBZyfebQfEQca';

const departments = [
  { id: 'd1', name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering', hod_id: 'u2' },
  { id: 'd2', name: 'Electronics & Communication', code: 'ECE', description: 'Department of Electronics and Communication Engineering', hod_id: null },
  { id: 'd3', name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering', hod_id: null }
];

const users = [
  { id: 'u1', name: 'Dr. Ramesh Kumar', email: 'admin@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'admin', phone: '9800000001', is_active: true, created_at: new Date() },
  { id: 'u2', name: 'Prof. Anita Sharma', email: 'hod.cse@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'hod', phone: '9800000002', is_active: true, created_at: new Date() },
  { id: 'u3', name: 'Mr. Suresh Patel', email: 'warden@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'warden', phone: '9800000003', is_active: true, created_at: new Date() },
  { id: 'u4', name: 'Mrs. Priya Mehta', email: 'accounts@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'accounts', phone: '9800000004', is_active: true, created_at: new Date() },
  { id: 'u5', name: 'Dr. Vikram Singh', email: 'faculty1@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'faculty', phone: '9800000005', is_active: true, created_at: new Date() },
  { id: 'u6', name: 'Dr. Kavitha Rao', email: 'faculty2@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'faculty', phone: '9800000006', is_active: true, created_at: new Date() },
  { id: 'u7', name: 'Prof. Rajan Nair', email: 'faculty3@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'faculty', phone: '9800000007', is_active: true, created_at: new Date() },
  { id: 'u10', name: 'Arjun Patel', email: 'student1@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'student', phone: '9900000010', is_active: true, created_at: new Date() },
  { id: 'u11', name: 'Priya Sharma', email: 'student2@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'student', phone: '9900000011', is_active: true, created_at: new Date() },
  { id: 'u12', name: 'Rohit Verma', email: 'student3@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'student', phone: '9900000012', is_active: true, created_at: new Date() },
  { id: 'u13', name: 'Sneha Gupta', email: 'student4@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'student', phone: '9900000013', is_active: true, created_at: new Date() },
  { id: 'u14', name: 'Amit Kumar', email: 'student5@smartcampus.edu', password_hash: HASHED_PASSWORD, role: 'student', phone: '9900000014', is_active: true, created_at: new Date() }
];

const students = [
  { id: 's10', user_id: 'u10', enrollment_no: 'CSE2021001', department_id: 'd1', semester: 7, academic_year: '2024-25', batch: '2021', dob: '2002-05-15', gender: 'Male', blood_group: 'B+', guardian_name: 'Rajesh Patel', guardian_phone: '9800100001', hostel_resident: true, name: 'Arjun Patel', email: 'student1@smartcampus.edu' },
  { id: 's11', user_id: 'u11', enrollment_no: 'CSE2021002', department_id: 'd1', semester: 7, academic_year: '2024-25', batch: '2021', dob: '2002-08-22', gender: 'Female', blood_group: 'A+', guardian_name: 'Ramesh Sharma', guardian_phone: '9800100002', hostel_resident: true, name: 'Priya Sharma', email: 'student2@smartcampus.edu' },
  { id: 's12', user_id: 'u12', enrollment_no: 'CSE2022001', department_id: 'd1', semester: 5, academic_year: '2024-25', batch: '2022', dob: '2003-03-10', gender: 'Male', blood_group: 'O+', guardian_name: 'Vikas Verma', guardian_phone: '9800100003', hostel_resident: false, name: 'Rohit Verma', email: 'student3@smartcampus.edu' },
  { id: 's13', user_id: 'u13', enrollment_no: 'CSE2022002', department_id: 'd1', semester: 5, academic_year: '2024-25', batch: '2022', dob: '2003-11-28', gender: 'Female', blood_group: 'B-', guardian_name: 'Sunil Gupta', guardian_phone: '9800100004', hostel_resident: true, name: 'Sneha Gupta', email: 'student4@smartcampus.edu' },
  { id: 's14', user_id: 'u14', enrollment_no: 'ECE2021001', department_id: 'd2', semester: 7, academic_year: '2024-25', batch: '2021', dob: '2002-07-04', gender: 'Male', blood_group: 'AB+', guardian_name: 'Mohan Kumar', guardian_phone: '9800100005', hostel_resident: false, name: 'Amit Kumar', email: 'student5@smartcampus.edu' }
];

const faculty = [
  { id: 'f5', user_id: 'u5', employee_id: 'EMP001', department_id: 'd1', designation: 'Associate Professor', qualification: 'PhD Computer Science', joining_date: '2018-07-01', name: 'Dr. Vikram Singh' },
  { id: 'f6', user_id: 'u6', employee_id: 'EMP002', department_id: 'd1', designation: 'Assistant Professor', qualification: 'PhD AI & ML', joining_date: '2020-08-01', name: 'Dr. Kavitha Rao' },
  { id: 'f7', user_id: 'u7', employee_id: 'EMP003', department_id: 'd2', designation: 'Professor', qualification: 'PhD Electronics', joining_date: '2015-06-15', name: 'Prof. Rajan Nair' }
];

const courses = [
  { id: 'c1', name: 'Data Structures & Algorithms', code: 'CSE301', department_id: 'd1', semester: 5, credits: 4, faculty_id: 'f5', department_name: 'Computer Science & Engineering', faculty_name: 'Dr. Vikram Singh' },
  { id: 'c2', name: 'Machine Learning', code: 'CSE401', department_id: 'd1', semester: 7, credits: 4, faculty_id: 'f6', department_name: 'Computer Science & Engineering', faculty_name: 'Dr. Kavitha Rao' },
  { id: 'c3', name: 'Database Management Systems', code: 'CSE302', department_id: 'd1', semester: 5, credits: 3, faculty_id: 'f5', department_name: 'Computer Science & Engineering', faculty_name: 'Dr. Vikram Singh' },
  { id: 'c4', name: 'Digital Electronics', code: 'ECE201', department_id: 'd2', semester: 3, credits: 4, faculty_id: 'f7', department_name: 'Electronics & Communication', faculty_name: 'Prof. Rajan Nair' }
];

const fees = [
  { id: 'fe1', student_id: 's10', fee_type: 'Tuition Fee', amount: 45000.00, due_date: '2024-09-30', academic_year: '2024-25', semester: 7, status: 'paid', description: 'Semester 7 Tuition Fee', student_name: 'Arjun Patel', enrollment_no: 'CSE2021001' },
  { id: 'fe2', student_id: 's10', fee_type: 'Hostel Fee', amount: 25000.00, due_date: '2024-09-30', academic_year: '2024-25', semester: 7, status: 'pending', description: 'Semester 7 Hostel Fee', student_name: 'Arjun Patel', enrollment_no: 'CSE2021001' },
  { id: 'fe3', student_id: 's10', fee_type: 'Exam Fee', amount: 2500.00, due_date: '2024-10-15', academic_year: '2024-25', semester: 7, status: 'pending', description: 'Semester 7 Exam Fee', student_name: 'Arjun Patel', enrollment_no: 'CSE2021001' },
  { id: 'fe4', student_id: 's11', fee_type: 'Tuition Fee', amount: 45000.00, due_date: '2024-09-30', academic_year: '2024-25', semester: 7, status: 'paid', description: 'Semester 7 Tuition Fee', student_name: 'Priya Sharma', enrollment_no: 'CSE2021002' },
  { id: 'fe5', student_id: 's12', fee_type: 'Tuition Fee', amount: 45000.00, due_date: '2024-09-30', academic_year: '2024-25', semester: 5, status: 'overdue', description: 'Semester 5 Tuition Fee', student_name: 'Rohit Verma', enrollment_no: 'CSE2022001' }
];

const payments = [
  { id: 'p1', fee_id: 'fe1', student_id: 's10', amount: 45000.00, payment_method: 'UPI / Online Banking', transaction_id: 'TXN9823471023', status: 'completed', payment_date: '2024-09-15T10:30:00Z', fee_type: 'Tuition Fee', student_name: 'Arjun Patel', enrollment_no: 'CSE2021001' },
  { id: 'p2', fee_id: 'fe4', student_id: 's11', amount: 45000.00, payment_method: 'Credit Card', transaction_id: 'TXN9823471024', status: 'completed', payment_date: '2024-09-18T14:15:00Z', fee_type: 'Tuition Fee', student_name: 'Priya Sharma', enrollment_no: 'CSE2021002' }
];

const attendance = [
  { id: 'att1', student_id: 's10', course_id: 'c2', date: '2024-09-20', status: 'present', course_name: 'Machine Learning', course_code: 'CSE401' },
  { id: 'att2', student_id: 's10', course_id: 'c2', date: '2024-09-22', status: 'present', course_name: 'Machine Learning', course_code: 'CSE401' },
  { id: 'att3', student_id: 's10', course_id: 'c2', date: '2024-09-24', status: 'absent', course_name: 'Machine Learning', course_code: 'CSE401' },
  { id: 'att4', student_id: 's10', course_id: 'c2', date: '2024-09-26', status: 'present', course_name: 'Machine Learning', course_code: 'CSE401' },
  { id: 'att5', student_id: 's10', course_id: 'c3', date: '2024-09-21', status: 'present', course_name: 'Database Management Systems', course_code: 'CSE302' },
  { id: 'att6', student_id: 's10', course_id: 'c3', date: '2024-09-23', status: 'present', course_name: 'Database Management Systems', course_code: 'CSE302' }
];

const hostelRooms = [
  { id: 'hr1', hostel_name: 'Bhabha Hall (Boys Hostel A)', room_number: 'B-304', capacity: 2, occupied: 2, floor: 3, fees_per_semester: 25000 },
  { id: 'hr2', hostel_name: 'Bhabha Hall (Boys Hostel A)', room_number: 'B-305', capacity: 2, occupied: 1, floor: 3, fees_per_semester: 25000 },
  { id: 'hr3', hostel_name: 'Gargi Hall (Girls Hostel B)', room_number: 'G-201', capacity: 2, occupied: 2, floor: 2, fees_per_semester: 25000 }
];

const hostelAllocations = [
  { id: 'ha1', student_id: 's10', room_id: 'hr1', hostel_name: 'Bhabha Hall (Boys Hostel A)', room_number: 'B-304', allocated_date: '2021-08-15', status: 'allocated', student_name: 'Arjun Patel', enrollment_no: 'CSE2021001' },
  { id: 'ha2', student_id: 's11', room_id: 'hr3', hostel_name: 'Gargi Hall (Girls Hostel B)', room_number: 'G-201', allocated_date: '2021-08-15', status: 'allocated', student_name: 'Priya Sharma', enrollment_no: 'CSE2021002' }
];

const noDuesRequests = [
  {
    id: 'nd1',
    request_number: 'ND-2024-001',
    student_id: 's10',
    reason: 'Graduation & Degree Certificate Release',
    overall_status: 'under_verification',
    created_at: new Date('2024-09-20T09:00:00Z'),
    updated_at: new Date('2024-09-25T11:30:00Z'),
    certificate_url: null,
    student_name: 'Arjun Patel',
    enrollment_no: 'CSE2021001',
    department_name: 'Computer Science & Engineering',
    semester: 7,
    batch: '2021',
    steps: [
      { id: 'nds1', department: 'hostel', status: 'approved', comment: 'Hostel room cleared, key returned', updated_by: 'u3', updated_at: '2024-09-21T10:00:00Z' },
      { id: 'nds2', department: 'library', status: 'approved', comment: 'All borrowed books returned', updated_by: 'u1', updated_at: '2024-09-22T14:30:00Z' },
      { id: 'nds3', department: 'accounts', status: 'pending', comment: 'Semester 7 Hostel fee pending ₹25,000', updated_by: null, updated_at: null },
      { id: 'nds4', department: 'admin', status: 'pending', comment: 'Awaiting prior department verifications', updated_by: null, updated_at: null }
    ]
  },
  {
    id: 'nd2',
    request_number: 'ND-2024-002',
    student_id: 's11',
    reason: 'Semester Break Clearance',
    overall_status: 'approved',
    created_at: new Date('2024-09-18T08:00:00Z'),
    updated_at: new Date('2024-09-24T16:00:00Z'),
    certificate_url: '/api/nodues/nd2/certificate',
    student_name: 'Priya Sharma',
    enrollment_no: 'CSE2021002',
    department_name: 'Computer Science & Engineering',
    semester: 7,
    batch: '2021',
    steps: [
      { id: 'nds5', department: 'hostel', status: 'approved', comment: 'Room inspected, no damages', updated_by: 'u3', updated_at: '2024-09-19T09:00:00Z' },
      { id: 'nds6', department: 'library', status: 'approved', comment: 'No pending books or fines', updated_by: 'u1', updated_at: '2024-09-20T11:00:00Z' },
      { id: 'nds7', department: 'accounts', status: 'approved', comment: 'All fees paid', updated_by: 'u4', updated_at: '2024-09-22T15:00:00Z' },
      { id: 'nds8', department: 'admin', status: 'approved', comment: 'Final approval granted by Dean', updated_by: 'u1', updated_at: '2024-09-24T16:00:00Z' }
    ]
  }
];

const gatePasses = [
  {
    id: 'gp1',
    pass_number: 'GP-2024-1001',
    student_id: 's10',
    reason: 'Medical Checkup & Prescription Collection',
    destination: 'City Hospital, Civil Lines',
    out_date_time: '2024-09-28T10:00:00Z',
    expected_in_date_time: '2024-09-28T18:00:00Z',
    status: 'approved',
    qr_code_data: JSON.stringify({ passNumber: 'GP-2024-1001', studentName: 'Arjun Patel', enrollmentNo: 'CSE2021001', status: 'approved' }),
    actual_out_time: null,
    actual_in_time: null,
    warden_comment: 'Medical reason verified with parent call',
    created_at: new Date('2024-09-27T08:00:00Z'),
    student_name: 'Arjun Patel',
    enrollment_no: 'CSE2021001',
    hostel_name: 'Bhabha Hall (Boys Hostel A)',
    room_number: 'B-304',
    phone: '9900000010'
  },
  {
    id: 'gp2',
    pass_number: 'GP-2024-1002',
    student_id: 's11',
    reason: 'Weekend Home Visit',
    destination: 'Jaipur, Rajasthan',
    out_date_time: '2024-09-29T07:00:00Z',
    expected_in_date_time: '2024-10-01T20:00:00Z',
    status: 'pending',
    qr_code_data: null,
    actual_out_time: null,
    actual_in_time: null,
    warden_comment: null,
    created_at: new Date('2024-09-27T11:00:00Z'),
    student_name: 'Priya Sharma',
    enrollment_no: 'CSE2021002',
    hostel_name: 'Gargi Hall (Girls Hostel B)',
    room_number: 'G-201',
    phone: '9900000011'
  }
];

const notifications = [
  { id: 'n1', user_id: 'u10', title: 'Gate Pass Approved', message: 'Your Gate Pass GP-2024-1001 has been approved by Warden Suresh Patel. QR code is ready for security scanning.', type: 'success', is_read: false, created_at: new Date('2024-09-27T08:30:00Z') },
  { id: 'n2', user_id: 'u10', title: 'Fee Payment Reminder', message: 'Semester 7 Hostel Fee of ₹25,000 is due on 30 Sep 2024.', type: 'warning', is_read: false, created_at: new Date('2024-09-25T10:00:00Z') },
  { id: 'n3', user_id: 'u10', title: 'Mid-Sem Exam Timetable Released', message: 'Mid-Sem examination timetable for CSE Semester 7 has been published.', type: 'info', is_read: true, created_at: new Date('2024-09-20T14:00:00Z') }
];

const auditLogs = [
  { id: 'al1', user_id: 'u10', user_name: 'Arjun Patel', action: 'CREATE_GATE_PASS', details: 'Created gate pass GP-2024-1001 for Medical Checkup', ip_address: '192.168.1.105', timestamp: new Date('2024-09-27T08:00:00Z') },
  { id: 'al2', user_id: 'u3', user_name: 'Mr. Suresh Patel', action: 'APPROVE_GATE_PASS', details: 'Approved gate pass GP-2024-1001', ip_address: '192.168.1.50', timestamp: new Date('2024-09-27T08:30:00Z') },
  { id: 'al3', user_id: 'u10', user_name: 'Arjun Patel', action: 'PAY_FEE', details: 'Paid Tuition Fee ₹45,000 via UPI (TXN9823471023)', ip_address: '192.168.1.105', timestamp: new Date('2024-09-15T10:30:00Z') }
];

const exams = [
  { id: 'e1', course_id: 'c2', name: 'Machine Learning Mid-Sem Exam', exam_date: '2024-10-10T10:00:00Z', total_marks: 50, semester: 7, course_name: 'Machine Learning', course_code: 'CSE401' },
  { id: 'e2', course_id: 'c3', name: 'DBMS Mid-Sem Exam', exam_date: '2024-10-12T14:00:00Z', total_marks: 50, semester: 5, course_name: 'Database Management Systems', course_code: 'CSE302' },
  { id: 'e3', course_id: 'c1', name: 'Data Structures Mid-Sem Exam', exam_date: '2024-10-14T10:00:00Z', total_marks: 50, semester: 5, course_name: 'Data Structures & Algorithms', course_code: 'CSE301' }
];

const results = [
  { id: 'r1', exam_id: 'e1', student_id: 's10', marks_obtained: 44, grade: 'A+', remarks: 'Excellent performance', course_name: 'Machine Learning', course_code: 'CSE401', total_marks: 50 },
  { id: 'r2', exam_id: 'e2', student_id: 's10', marks_obtained: 41, grade: 'A', remarks: 'Good database query skills', course_name: 'Database Management Systems', course_code: 'CSE302', total_marks: 50 }
];

module.exports = {
  departments,
  users,
  students,
  faculty,
  courses,
  fees,
  payments,
  attendance,
  hostelRooms,
  hostelAllocations,
  noDuesRequests,
  gatePasses,
  notifications,
  auditLogs,
  exams,
  results,
  HASHED_PASSWORD
};
