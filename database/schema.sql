-- SmartCampus ERP - Complete Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DEPARTMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  hod_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- USERS TABLE (Base authentication table)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'hod', 'warden', 'accounts', 'admin')),
  phone VARCHAR(15),
  avatar_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- STUDENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  enrollment_no VARCHAR(20) NOT NULL UNIQUE,
  department_id UUID REFERENCES departments(id),
  semester INTEGER NOT NULL DEFAULT 1,
  academic_year VARCHAR(10),
  batch VARCHAR(10),
  dob DATE,
  gender VARCHAR(10),
  blood_group VARCHAR(5),
  address TEXT,
  guardian_name VARCHAR(100),
  guardian_phone VARCHAR(15),
  hostel_resident BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FACULTY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS faculty (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  employee_id VARCHAR(20) NOT NULL UNIQUE,
  department_id UUID REFERENCES departments(id),
  designation VARCHAR(100),
  qualification VARCHAR(200),
  joining_date DATE,
  specialization VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- COURSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  department_id UUID REFERENCES departments(id),
  semester INTEGER NOT NULL,
  credits INTEGER DEFAULT 3,
  faculty_id UUID REFERENCES faculty(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ATTENDANCE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id),
  date DATE NOT NULL,
  status VARCHAR(10) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES faculty(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- FEES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  fee_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  academic_year VARCHAR(10),
  semester INTEGER,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fee_id UUID REFERENCES fees(id),
  student_id UUID REFERENCES students(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(30) NOT NULL,
  transaction_id VARCHAR(100) UNIQUE,
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  receipt_no VARCHAR(50) UNIQUE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- EXAMINATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS examinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  exam_type VARCHAR(30) NOT NULL CHECK (exam_type IN ('mid_sem', 'end_sem', 'internal', 'practical')),
  course_id UUID REFERENCES courses(id),
  exam_date DATE,
  start_time TIME,
  end_time TIME,
  max_marks INTEGER NOT NULL DEFAULT 100,
  passing_marks INTEGER DEFAULT 40,
  semester INTEGER,
  department_id UUID REFERENCES departments(id),
  academic_year VARCHAR(10),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- RESULTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  examination_id UUID REFERENCES examinations(id),
  marks_obtained DECIMAL(5, 2),
  grade VARCHAR(5),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'withheld')),
  remarks TEXT,
  entered_by UUID REFERENCES faculty(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- HOSTELS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hostels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('boys', 'girls', 'mixed')),
  total_rooms INTEGER DEFAULT 0,
  warden_id UUID REFERENCES users(id),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- HOSTEL ROOMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hostel_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hostel_id UUID REFERENCES hostels(id),
  room_no VARCHAR(20) NOT NULL,
  room_type VARCHAR(20) CHECK (room_type IN ('single', 'double', 'triple', 'dormitory')),
  capacity INTEGER DEFAULT 2,
  occupied INTEGER DEFAULT 0,
  floor_no INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- HOSTEL ALLOCATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS hostel_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  room_id UUID REFERENCES hostel_rooms(id),
  check_in_date DATE,
  check_out_date DATE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- NO-DUES REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS no_dues_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  reason VARCHAR(200),
  request_type VARCHAR(50) DEFAULT 'graduation',
  hostel_status VARCHAR(20) DEFAULT 'pending' CHECK (hostel_status IN ('pending', 'approved', 'rejected')),
  library_status VARCHAR(20) DEFAULT 'pending' CHECK (library_status IN ('pending', 'approved', 'rejected')),
  accounts_status VARCHAR(20) DEFAULT 'pending' CHECK (accounts_status IN ('pending', 'approved', 'rejected')),
  admin_status VARCHAR(20) DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected')),
  overall_status VARCHAR(20) DEFAULT 'pending' CHECK (overall_status IN ('pending', 'in_progress', 'completed', 'rejected')),
  hostel_remarks TEXT,
  library_remarks TEXT,
  accounts_remarks TEXT,
  admin_remarks TEXT,
  hostel_verified_by UUID REFERENCES users(id),
  library_verified_by UUID REFERENCES users(id),
  accounts_verified_by UUID REFERENCES users(id),
  admin_verified_by UUID REFERENCES users(id),
  hostel_verified_at TIMESTAMP,
  library_verified_at TIMESTAMP,
  accounts_verified_at TIMESTAMP,
  admin_verified_at TIMESTAMP,
  certificate_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- GATE PASSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS gate_passes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  destination VARCHAR(200) NOT NULL,
  from_datetime TIMESTAMP NOT NULL,
  to_datetime TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'used')),
  qr_code TEXT,
  qr_data TEXT,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  remarks TEXT,
  exit_recorded_at TIMESTAMP,
  return_recorded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- WORKFLOW STEPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_type VARCHAR(50) NOT NULL,
  reference_id UUID NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'submitted', 'approved', 'rejected', 'commented', 'completed')),
  performed_by UUID REFERENCES users(id),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'action_required')),
  is_read BOOLEAN DEFAULT FALSE,
  reference_type VARCHAR(50),
  reference_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- DOCUMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255),
  file_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- AUDIT LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  ip_address VARCHAR(45),
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_students_enrollment ON students(enrollment_no);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_status ON fees(status);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_gate_passes_student ON gate_passes(student_id);
CREATE INDEX IF NOT EXISTS idx_gate_passes_status ON gate_passes(status);
CREATE INDEX IF NOT EXISTS idx_no_dues_student ON no_dues_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_ref ON workflow_steps(reference_id);

-- Unique constraint for attendance upsert
ALTER TABLE attendance ADD CONSTRAINT IF NOT EXISTS unique_att UNIQUE (student_id, course_id, date);
-- Unique constraint for results upsert
ALTER TABLE results ADD CONSTRAINT IF NOT EXISTS unique_result UNIQUE (student_id, examination_id);
