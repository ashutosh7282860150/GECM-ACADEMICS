-- SmartCampus ERP - Seed Data (Demo Data)
-- Run AFTER schema.sql

-- =============================================
-- DEPARTMENTS
-- =============================================
INSERT INTO departments (id, name, code, description) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Computer Science & Engineering', 'CSE', 'Department of Computer Science and Engineering'),
  ('d1000000-0000-0000-0000-000000000002', 'Electronics & Communication', 'ECE', 'Department of Electronics and Communication Engineering'),
  ('d1000000-0000-0000-0000-000000000003', 'Mechanical Engineering', 'ME', 'Department of Mechanical Engineering')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- USERS — per-role bcrypt hashes (rounds = 12, verified)
-- Passwords:
--   admin / hod / warden / accounts : Admin@123
--   faculty*                         : Faculty@123
--   student*                         : Student@123
-- =============================================
INSERT INTO users (id, name, email, password_hash, role, phone, is_active) VALUES
  -- Admin    (Admin@123)
  ('u0000000-0000-0000-0000-000000000001', 'Dr. Ramesh Kumar',   'admin@smartcampus.edu',    '$2b$12$KqRGhn2yJko326zERwrSMO.SqyIRApLU3kHvMb.o12V7wb7mSEMie', 'admin',    '9800000001', TRUE),
  -- HOD CSE  (Admin@123)
  ('u0000000-0000-0000-0000-000000000002', 'Prof. Anita Sharma', 'hod.cse@smartcampus.edu',  '$2b$12$KqRGhn2yJko326zERwrSMO.SqyIRApLU3kHvMb.o12V7wb7mSEMie', 'hod',      '9800000002', TRUE),
  -- Warden   (Admin@123)
  ('u0000000-0000-0000-0000-000000000003', 'Mr. Suresh Patel',   'warden@smartcampus.edu',   '$2b$12$KqRGhn2yJko326zERwrSMO.SqyIRApLU3kHvMb.o12V7wb7mSEMie', 'warden',   '9800000003', TRUE),
  -- Accounts (Admin@123)
  ('u0000000-0000-0000-0000-000000000004', 'Mrs. Priya Mehta',   'accounts@smartcampus.edu', '$2b$12$KqRGhn2yJko326zERwrSMO.SqyIRApLU3kHvMb.o12V7wb7mSEMie', 'accounts', '9800000004', TRUE),
  -- Faculty 1 (Faculty@123)
  ('u0000000-0000-0000-0000-000000000005', 'Dr. Vikram Singh',   'faculty1@smartcampus.edu', '$2b$12$Jv70q5aAVmRatgb5oHijLuw8KTsPlbbUT1ail7NkvEJUvGwszMWdC', 'faculty',  '9800000005', TRUE),
  -- Faculty 2 (Faculty@123)
  ('u0000000-0000-0000-0000-000000000006', 'Dr. Kavitha Rao',    'faculty2@smartcampus.edu', '$2b$12$Jv70q5aAVmRatgb5oHijLuw8KTsPlbbUT1ail7NkvEJUvGwszMWdC', 'faculty',  '9800000006', TRUE),
  -- Faculty 3 (Faculty@123)
  ('u0000000-0000-0000-0000-000000000007', 'Prof. Rajan Nair',   'faculty3@smartcampus.edu', '$2b$12$Jv70q5aAVmRatgb5oHijLuw8KTsPlbbUT1ail7NkvEJUvGwszMWdC', 'faculty',  '9800000007', TRUE),
  -- Student 1  (Student@123)
  ('u0000000-0000-0000-0000-000000000010', 'Arjun Patel',   'student1@smartcampus.edu',  '$2b$12$aLPSxIr2CuRgqwYCpa/5hujJHwSbDWWBJP0c0WzwOrDm7AV6y.2sq', 'student', '9900000010', TRUE),
  -- Student 2  (Student@123)
  ('u0000000-0000-0000-0000-000000000011', 'Priya Sharma',  'student2@smartcampus.edu',  '$2b$12$aLPSxIr2CuRgqwYCpa/5hujJHwSbDWWBJP0c0WzwOrDm7AV6y.2sq', 'student', '9900000011', TRUE),
  -- Student 3  (Student@123)
  ('u0000000-0000-0000-0000-000000000012', 'Rohit Verma',   'student3@smartcampus.edu',  '$2b$12$aLPSxIr2CuRgqwYCpa/5hujJHwSbDWWBJP0c0WzwOrDm7AV6y.2sq', 'student', '9900000012', TRUE),
  -- Student 4  (Student@123)
  ('u0000000-0000-0000-0000-000000000013', 'Sneha Gupta',   'student4@smartcampus.edu',  '$2b$12$aLPSxIr2CuRgqwYCpa/5hujJHwSbDWWBJP0c0WzwOrDm7AV6y.2sq', 'student', '9900000013', TRUE),
  -- Student 5  (Student@123)
  ('u0000000-0000-0000-0000-000000000014', 'Amit Kumar',    'student5@smartcampus.edu',  '$2b$12$aLPSxIr2CuRgqwYCpa/5hujJHwSbDWWBJP0c0WzwOrDm7AV6y.2sq', 'student', '9900000014', TRUE),
  -- Student 6  (Student@123)
  ('u0000000-0000-0000-0000-000000000015', 'Divya Nair',    'student6@smartcampus.edu',  '$2b$12$aLPSxIr2CuRgqwYCpa/5hujJHwSbDWWBJP0c0WzwOrDm7AV6y.2sq', 'student', '9900000015', TRUE),
  -- Student 7  (Student@123)
  ('u0000000-0000-0000-0000-000000000016', 'Karan Mehta',   'student7@smartcampus.edu',  '$2b$12$aLPSxIr2CuRgqwYCpa/5hujJHwSbDWWBJP0c0WzwOrDm7AV6y.2sq', 'student', '9900000016', TRUE),
  -- Student 8  (Student@123)
  ('u0000000-0000-0000-0000-000000000017', 'Riya Singh',    'student8@smartcampus.edu',  '$2b$12$aLPSxIr2CuRgqwYCpa/5hujJHwSbDWWBJP0c0WzwOrDm7AV6y.2sq', 'student', '9900000017', TRUE),
  -- Student 9  (Student@123)
  ('u0000000-0000-0000-0000-000000000018', 'Rahul Das',     'student9@smartcampus.edu',  '$2b$12$aLPSxIr2CuRgqwYCpa/5hujJHwSbDWWBJP0c0WzwOrDm7AV6y.2sq', 'student', '9900000018', TRUE),
  -- Student 10 (Student@123)
  ('u0000000-0000-0000-0000-000000000019', 'Pooja Pillai',  'student10@smartcampus.edu', '$2b$12$aLPSxIr2CuRgqwYCpa/5hujJHwSbDWWBJP0c0WzwOrDm7AV6y.2sq', 'student', '9900000019', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- =============================================
-- FACULTY RECORDS
-- =============================================
INSERT INTO faculty (id, user_id, employee_id, department_id, designation, qualification, joining_date) VALUES
  ('f0000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000005', 'EMP001', 'd1000000-0000-0000-0000-000000000001', 'Associate Professor', 'PhD Computer Science', '2018-07-01'),
  ('f0000000-0000-0000-0000-000000000006', 'u0000000-0000-0000-0000-000000000006', 'EMP002', 'd1000000-0000-0000-0000-000000000001', 'Assistant Professor', 'PhD AI & ML', '2020-08-01'),
  ('f0000000-0000-0000-0000-000000000007', 'u0000000-0000-0000-0000-000000000007', 'EMP003', 'd1000000-0000-0000-0000-000000000002', 'Professor', 'PhD Electronics', '2015-06-15')
ON CONFLICT (employee_id) DO NOTHING;

-- Update HOD department
UPDATE departments SET hod_id = 'u0000000-0000-0000-0000-000000000002' WHERE id = 'd1000000-0000-0000-0000-000000000001';

-- =============================================
-- STUDENTS RECORDS
-- =============================================
INSERT INTO students (id, user_id, enrollment_no, department_id, semester, academic_year, batch, dob, gender, blood_group, guardian_name, guardian_phone, hostel_resident) VALUES
  ('s0000000-0000-0000-0000-000000000010', 'u0000000-0000-0000-0000-000000000010', 'CSE2021001', 'd1000000-0000-0000-0000-000000000001', 7, '2024-25', '2021', '2002-05-15', 'Male', 'B+', 'Rajesh Patel', '9800100001', TRUE),
  ('s0000000-0000-0000-0000-000000000011', 'u0000000-0000-0000-0000-000000000011', 'CSE2021002', 'd1000000-0000-0000-0000-000000000001', 7, '2024-25', '2021', '2002-08-22', 'Female', 'A+', 'Ramesh Sharma', '9800100002', TRUE),
  ('s0000000-0000-0000-0000-000000000012', 'u0000000-0000-0000-0000-000000000012', 'CSE2022001', 'd1000000-0000-0000-0000-000000000001', 5, '2024-25', '2022', '2003-03-10', 'Male', 'O+', 'Vikas Verma', '9800100003', FALSE),
  ('s0000000-0000-0000-0000-000000000013', 'u0000000-0000-0000-0000-000000000013', 'CSE2022002', 'd1000000-0000-0000-0000-000000000001', 5, '2024-25', '2022', '2003-11-28', 'Female', 'B-', 'Sunil Gupta', '9800100004', TRUE),
  ('s0000000-0000-0000-0000-000000000014', 'u0000000-0000-0000-0000-000000000014', 'ECE2021001', 'd1000000-0000-0000-0000-000000000002', 7, '2024-25', '2021', '2002-07-04', 'Male', 'AB+', 'Mohan Kumar', '9800100005', FALSE),
  ('s0000000-0000-0000-0000-000000000015', 'u0000000-0000-0000-0000-000000000015', 'ECE2022001', 'd1000000-0000-0000-0000-000000000002', 5, '2024-25', '2022', '2003-02-14', 'Female', 'O-', 'Gopalan Nair', '9800100006', TRUE),
  ('s0000000-0000-0000-0000-000000000016', 'u0000000-0000-0000-0000-000000000016', 'CSE2023001', 'd1000000-0000-0000-0000-000000000001', 3, '2024-25', '2023', '2004-09-20', 'Male', 'A-', 'Harish Mehta', '9800100007', FALSE),
  ('s0000000-0000-0000-0000-000000000017', 'u0000000-0000-0000-0000-000000000017', 'CSE2023002', 'd1000000-0000-0000-0000-000000000001', 3, '2024-25', '2023', '2004-12-05', 'Female', 'B+', 'Ajay Singh', '9800100008', TRUE),
  ('s0000000-0000-0000-0000-000000000018', 'u0000000-0000-0000-0000-000000000018', 'ME2022001', 'd1000000-0000-0000-0000-000000000003', 5, '2024-25', '2022', '2003-06-18', 'Male', 'O+', 'Subhash Das', '9800100009', FALSE),
  ('s0000000-0000-0000-0000-000000000019', 'u0000000-0000-0000-0000-000000000019', 'CSE2021003', 'd1000000-0000-0000-0000-000000000001', 7, '2024-25', '2021', '2002-04-25', 'Female', 'A+', 'Thomas Pillai', '9800100010', TRUE)
ON CONFLICT (enrollment_no) DO NOTHING;

-- =============================================
-- COURSES
-- =============================================
INSERT INTO courses (id, name, code, department_id, semester, credits, faculty_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Data Structures & Algorithms', 'CSE301', 'd1000000-0000-0000-0000-000000000001', 5, 4, 'f0000000-0000-0000-0000-000000000005'),
  ('c0000000-0000-0000-0000-000000000002', 'Machine Learning', 'CSE401', 'd1000000-0000-0000-0000-000000000001', 7, 4, 'f0000000-0000-0000-0000-000000000006'),
  ('c0000000-0000-0000-0000-000000000003', 'Database Management Systems', 'CSE302', 'd1000000-0000-0000-0000-000000000001', 5, 3, 'f0000000-0000-0000-0000-000000000005'),
  ('c0000000-0000-0000-0000-000000000004', 'Digital Electronics', 'ECE201', 'd1000000-0000-0000-0000-000000000002', 3, 4, 'f0000000-0000-0000-0000-000000000007'),
  ('c0000000-0000-0000-0000-000000000005', 'Computer Networks', 'CSE402', 'd1000000-0000-0000-0000-000000000001', 7, 3, 'f0000000-0000-0000-0000-000000000005')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- FEE RECORDS
-- =============================================
INSERT INTO fees (id, student_id, fee_type, amount, due_date, academic_year, semester, status, description) VALUES
  ('fe000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000010', 'Tuition Fee', 45000.00, '2024-09-30', '2024-25', 7, 'paid', 'Semester 7 Tuition Fee'),
  ('fe000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000010', 'Hostel Fee', 25000.00, '2024-09-30', '2024-25', 7, 'pending', 'Semester 7 Hostel Fee'),
  ('fe000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000010', 'Exam Fee', 2500.00, '2024-10-15', '2024-25', 7, 'pending', 'Semester 7 Exam Fee'),
  ('fe000000-0000-0000-0000-000000000011', 's0000000-0000-0000-0000-000000000010', 'Course Registration Fee', 3500.00, '2024-10-25', '2024-25', 7, 'pending', 'Semester 7 Course Registration Fee'),
  ('fe000000-0000-0000-0000-000000000004', 's0000000-0000-0000-0000-000000000011', 'Tuition Fee', 45000.00, '2024-09-30', '2024-25', 7, 'paid', 'Semester 7 Tuition Fee'),
  ('fe000000-0000-0000-0000-000000000005', 's0000000-0000-0000-0000-000000000011', 'Hostel Fee', 25000.00, '2024-09-30', '2024-25', 7, 'paid', 'Semester 7 Hostel Fee'),
  ('fe000000-0000-0000-0000-000000000012', 's0000000-0000-0000-0000-000000000011', 'Course Registration Fee', 3500.00, '2024-10-25', '2024-25', 7, 'paid', 'Semester 7 Course Registration Fee'),
  ('fe000000-0000-0000-0000-000000000006', 's0000000-0000-0000-0000-000000000012', 'Tuition Fee', 45000.00, '2024-09-30', '2024-25', 5, 'overdue', 'Semester 5 Tuition Fee'),
  ('fe000000-0000-0000-0000-000000000007', 's0000000-0000-0000-0000-000000000013', 'Tuition Fee', 45000.00, '2024-09-30', '2024-25', 5, 'pending', 'Semester 5 Tuition Fee'),
  ('fe000000-0000-0000-0000-000000000008', 's0000000-0000-0000-0000-000000000013', 'Hostel Fee', 25000.00, '2024-09-30', '2024-25', 5, 'pending', 'Semester 5 Hostel Fee'),
  ('fe000000-0000-0000-0000-000000000009', 's0000000-0000-0000-0000-000000000014', 'Tuition Fee', 45000.00, '2024-09-30', '2024-25', 7, 'paid', 'Semester 7 Tuition Fee'),
  ('fe000000-0000-0000-0000-000000000010', 's0000000-0000-0000-0000-000000000019', 'Tuition Fee', 45000.00, '2024-09-30', '2024-25', 7, 'pending', 'Semester 7 Tuition Fee')
ON CONFLICT DO NOTHING;

-- =============================================
-- PAYMENTS
-- =============================================
INSERT INTO payments (id, fee_id, student_id, amount, payment_method, transaction_id, status, receipt_no) VALUES
  ('p0000000-0000-0000-0000-000000000001', 'fe000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000010', 45000.00, 'online', 'TXN20240901001', 'success', 'RCPT-2024-001'),
  ('p0000000-0000-0000-0000-000000000002', 'fe000000-0000-0000-0000-000000000004', 's0000000-0000-0000-0000-000000000011', 45000.00, 'online', 'TXN20240901002', 'success', 'RCPT-2024-002'),
  ('p0000000-0000-0000-0000-000000000003', 'fe000000-0000-0000-0000-000000000005', 's0000000-0000-0000-0000-000000000011', 25000.00, 'dd', 'TXN20240901003', 'success', 'RCPT-2024-003'),
  ('p0000000-0000-0000-0000-000000000004', 'fe000000-0000-0000-0000-000000000009', 's0000000-0000-0000-0000-000000000014', 45000.00, 'online', 'TXN20240901004', 'success', 'RCPT-2024-004')
ON CONFLICT DO NOTHING;

-- =============================================
-- HOSTELS
-- =============================================
INSERT INTO hostels (id, name, type, total_rooms, warden_id) VALUES
  ('h0000000-0000-0000-0000-000000000001', 'Boys Hostel Block A', 'boys', 100, 'u0000000-0000-0000-0000-000000000003'),
  ('h0000000-0000-0000-0000-000000000002', 'Girls Hostel Block B', 'girls', 80, 'u0000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

INSERT INTO hostel_rooms (id, hostel_id, room_no, room_type, capacity, occupied, floor_no) VALUES
  ('r0000000-0000-0000-0000-000000000001', 'h0000000-0000-0000-0000-000000000001', '101', 'double', 2, 2, 1),
  ('r0000000-0000-0000-0000-000000000002', 'h0000000-0000-0000-0000-000000000001', '102', 'double', 2, 1, 1),
  ('r0000000-0000-0000-0000-000000000003', 'h0000000-0000-0000-0000-000000000002', '201', 'double', 2, 2, 2),
  ('r0000000-0000-0000-0000-000000000004', 'h0000000-0000-0000-0000-000000000002', '202', 'double', 2, 1, 2)
ON CONFLICT DO NOTHING;

-- =============================================
-- HOSTEL ALLOCATIONS
-- =============================================
INSERT INTO hostel_allocations (student_id, room_id, check_in_date, status) VALUES
  ('s0000000-0000-0000-0000-000000000010', 'r0000000-0000-0000-0000-000000000001', '2024-07-15', 'active'),
  ('s0000000-0000-0000-0000-000000000011', 'r0000000-0000-0000-0000-000000000003', '2024-07-15', 'active'),
  ('s0000000-0000-0000-0000-000000000013', 'r0000000-0000-0000-0000-000000000003', '2024-07-15', 'active'),
  ('s0000000-0000-0000-0000-000000000015', 'r0000000-0000-0000-0000-000000000004', '2024-07-15', 'active'),
  ('s0000000-0000-0000-0000-000000000017', 'r0000000-0000-0000-0000-000000000003', '2024-07-15', 'active'),
  ('s0000000-0000-0000-0000-000000000019', 'r0000000-0000-0000-0000-000000000001', '2024-07-15', 'active')
ON CONFLICT DO NOTHING;

-- =============================================
-- EXAMINATIONS
-- =============================================
INSERT INTO examinations (id, name, exam_type, course_id, exam_date, max_marks, semester, department_id, academic_year) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'DSA Mid Semester Exam', 'mid_sem', 'c0000000-0000-0000-0000-000000000001', '2024-09-20', 50, 5, 'd1000000-0000-0000-0000-000000000001', '2024-25'),
  ('e0000000-0000-0000-0000-000000000002', 'ML Internal Assessment', 'internal', 'c0000000-0000-0000-0000-000000000002', '2024-09-22', 30, 7, 'd1000000-0000-0000-0000-000000000001', '2024-25'),
  ('e0000000-0000-0000-0000-000000000003', 'DBMS Mid Semester Exam', 'mid_sem', 'c0000000-0000-0000-0000-000000000003', '2024-09-25', 50, 5, 'd1000000-0000-0000-0000-000000000001', '2024-25')
ON CONFLICT DO NOTHING;

-- =============================================
-- RESULTS
-- =============================================
INSERT INTO results (student_id, examination_id, marks_obtained, grade, status) VALUES
  ('s0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000002', 27.5, 'A', 'published'),
  ('s0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000002', 24.0, 'B+', 'published'),
  ('s0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000001', 38.5, 'A+', 'published'),
  ('s0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000001', 32.0, 'B', 'published'),
  ('s0000000-0000-0000-0000-000000000019', 'e0000000-0000-0000-0000-000000000002', 22.0, 'B', 'published')
ON CONFLICT DO NOTHING;

-- =============================================
-- NO-DUES REQUESTS
-- =============================================
INSERT INTO no_dues_requests (id, student_id, reason, request_type, hostel_status, library_status, accounts_status, admin_status, overall_status) VALUES
  ('nd000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000010', 'Graduating this semester', 'graduation', 'approved', 'approved', 'pending', 'pending', 'in_progress'),
  ('nd000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000011', 'Internship requirement', 'internship', 'pending', 'pending', 'pending', 'pending', 'pending'),
  ('nd000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000019', 'Final year graduation', 'graduation', 'approved', 'approved', 'approved', 'approved', 'completed')
ON CONFLICT DO NOTHING;

-- =============================================
-- GATE PASSES
-- =============================================
INSERT INTO gate_passes (id, student_id, reason, destination, from_datetime, to_datetime, status) VALUES
  ('gp000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000010', 'Medical appointment', 'City Hospital, Downtown', '2024-09-28 10:00:00', '2024-09-28 18:00:00', 'pending'),
  ('gp000000-0000-0000-0000-000000000002', 's0000000-0000-0000-0000-000000000011', 'Family visit', 'Home - Jaipur', '2024-09-29 08:00:00', '2024-09-30 20:00:00', 'approved'),
  ('gp000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000013', 'College event', 'Tech Fest venue', '2024-09-27 14:00:00', '2024-09-27 22:00:00', 'approved'),
  ('gp000000-0000-0000-0000-000000000004', 's0000000-0000-0000-0000-000000000015', 'Personal work', 'City Center Mall', '2024-09-26 15:00:00', '2024-09-26 21:00:00', 'rejected')
ON CONFLICT DO NOTHING;

-- =============================================
-- NOTIFICATIONS
-- =============================================
INSERT INTO notifications (user_id, title, message, type, reference_type) VALUES
  ('u0000000-0000-0000-0000-000000000010', 'Fee Payment Reminder', 'Your Hostel Fee of ₹25,000 is due on 30 September 2024. Please pay before the due date.', 'warning', 'fee'),
  ('u0000000-0000-0000-0000-000000000010', 'No-Dues Update', 'Your No-Dues request has been verified by Hostel and Library. Pending Accounts verification.', 'info', 'no_dues'),
  ('u0000000-0000-0000-0000-000000000010', 'Gate Pass Request', 'Your gate pass request is pending warden approval.', 'action_required', 'gate_pass'),
  ('u0000000-0000-0000-0000-000000000011', 'Gate Pass Approved', 'Your gate pass for September 29 has been approved. Enjoy your trip!', 'success', 'gate_pass'),
  ('u0000000-0000-0000-0000-000000000011', 'Exam Result', 'ML Internal Assessment results have been published. Check your result.', 'info', 'result'),
  ('u0000000-0000-0000-0000-000000000019', 'No-Dues Certificate', 'Congratulations! Your No-Dues certificate has been generated. Download it from documents.', 'success', 'no_dues'),
  ('u0000000-0000-0000-0000-000000000001', 'System Alert', '5 no-dues requests pending admin approval.', 'action_required', 'no_dues'),
  ('u0000000-0000-0000-0000-000000000003', 'Gate Pass Requests', '3 new gate pass requests are awaiting your approval.', 'action_required', 'gate_pass')
ON CONFLICT DO NOTHING;

-- =============================================
-- ATTENDANCE (sample)
-- =============================================
INSERT INTO attendance (student_id, course_id, date, status, marked_by) VALUES
  ('s0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000002', '2024-09-20', 'present', 'f0000000-0000-0000-0000-000000000006'),
  ('s0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000002', '2024-09-21', 'present', 'f0000000-0000-0000-0000-000000000006'),
  ('s0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000002', '2024-09-23', 'absent', 'f0000000-0000-0000-0000-000000000006'),
  ('s0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000005', '2024-09-20', 'present', 'f0000000-0000-0000-0000-000000000005'),
  ('s0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000005', '2024-09-21', 'present', 'f0000000-0000-0000-0000-000000000005'),
  ('s0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000005', '2024-09-23', 'present', 'f0000000-0000-0000-0000-000000000005'),
  ('s0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', '2024-09-20', 'present', 'f0000000-0000-0000-0000-000000000006'),
  ('s0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', '2024-09-21', 'absent', 'f0000000-0000-0000-0000-000000000006'),
  ('s0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000002', '2024-09-23', 'present', 'f0000000-0000-0000-0000-000000000006')
ON CONFLICT DO NOTHING;
