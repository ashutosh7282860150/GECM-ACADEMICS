const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const mockStore = require('../services/mockStore');
const { authenticate, authorize } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// File Upload Config
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Centralized Dynamic Routing Configuration Store
let routingConfig = [
  {
    typeId: 'type_gp',
    code: 'GECM-GP',
    name: 'Gate Pass',
    category: 'Security & Outpass',
    icon: '🚪',
    description: 'Request outpass for campus exit with unique QR code verification.',
    responsibleRole: 'warden',
    responsibleDepartment: 'Hostel & Security Cell',
    multiDeptClearance: false,
    requiresApproval: true,
    active: true
  },
  {
    typeId: 'type_nd',
    code: 'GECM-ND',
    name: 'No Dues Clearance',
    category: 'Academic Clearance',
    icon: '✅',
    description: 'Multi-department digital clearance for graduation, hostel, or transfer.',
    responsibleRole: 'admin',
    responsibleDepartment: 'Administration & Finance',
    multiDeptClearance: true,
    clearanceStages: ['Library', 'Accounts', 'Hostel', 'Department', 'Laboratory', 'Administration'],
    requiresApproval: true,
    active: true
  },
  {
    typeId: 'type_lv',
    code: 'GECM-LV',
    name: 'Leave Application',
    category: 'Academic Leave',
    icon: '📅',
    description: 'Apply for medical, casual, or official duty leave.',
    responsibleRole: 'faculty',
    responsibleDepartment: 'Concerned Department / HOD',
    multiDeptClearance: false,
    requiresApproval: true,
    active: true
  },
  {
    typeId: 'type_bf',
    code: 'GECM-BF',
    name: 'Bonafide Certificate',
    category: 'Certificates',
    icon: '📜',
    description: 'Request official Bonafide Certificate for bank, passport, or bus pass.',
    responsibleRole: 'hod',
    responsibleDepartment: 'Academic Affairs',
    multiDeptClearance: false,
    requiresApproval: true,
    active: true
  },
  {
    typeId: 'type_cc',
    code: 'GECM-CC',
    name: 'Character Certificate',
    category: 'Certificates',
    icon: '🎖️',
    description: 'Request Conduct & Character Certificate upon degree completion.',
    responsibleRole: 'admin',
    responsibleDepartment: 'Administration',
    multiDeptClearance: false,
    requiresApproval: true,
    active: true
  },
  {
    typeId: 'type_sc',
    code: 'GECM-SC',
    name: 'Student ID / Pass Certificate',
    category: 'Student Identity',
    icon: '🆔',
    description: 'Duplicate Student ID or enrollment verification certificate.',
    responsibleRole: 'admin',
    responsibleDepartment: 'Student Affairs',
    multiDeptClearance: false,
    requiresApproval: true,
    active: true
  },
  {
    typeId: 'type_ar',
    code: 'GECM-AR',
    name: 'Other Academic Request',
    category: 'General Academic',
    icon: '📝',
    description: 'Submit custom academic petitions, re-evaluations, or branch transfers.',
    responsibleRole: 'admin',
    responsibleDepartment: 'Academic Registrar',
    multiDeptClearance: false,
    requiresApproval: true,
    active: true
  }
];

// Helper to generate dynamic application ID (e.g. GECM-GP-2026-000101)
let appCounter = 100;
const generateApplicationId = (code) => {
  appCounter++;
  const year = new Date().getFullYear();
  const padNum = String(appCounter).padStart(6, '0');
  return `${code}-${year}-${padNum}`;
};

// Application Store in mockStore if DB fallback
if (!mockStore.applications) {
  mockStore.applications = [
    {
      id: 'app_1',
      application_id: 'GECM-GP-2026-000101',
      type_code: 'GECM-GP',
      type_name: 'Gate Pass',
      student_id: 's10',
      student_name: 'Arjun Patel',
      enrollment_no: 'CSE2021001',
      department_name: 'Computer Science & Engineering',
      semester: 7,
      phone: '9900000010',
      email: 'student1@smartcampus.edu',
      current_status: 'APPROVED',
      assigned_role: 'warden',
      assigned_department: 'Hostel & Security Cell',
      submitted_at: new Date('2026-09-25T10:00:00Z'),
      updated_at: new Date('2026-09-25T11:30:00Z'),
      reviewed_at: new Date('2026-09-25T11:30:00Z'),
      reviewed_by_name: 'Mr. Suresh Patel (Warden)',
      review_comment: 'Approved for home visit.',
      form_data: {
        destination: 'Home - Madhubani',
        reason: 'Family event',
        outDate: '2026-09-28',
        outTime: '10:00',
        returnDate: '2026-09-30',
        returnTime: '18:00',
        emergencyContact: '9800100001'
      },
      documents: [],
      workflow_timeline: [
        { step: 'Application Submitted', status: 'SUBMITTED', performed_by: 'Arjun Patel', timestamp: '2026-09-25T10:00:00Z' },
        { step: 'Assigned to Warden', status: 'UNDER_REVIEW', performed_by: 'System Routing', timestamp: '2026-09-25T10:00:05Z' },
        { step: 'Approved by Warden', status: 'APPROVED', performed_by: 'Mr. Suresh Patel', timestamp: '2026-09-25T11:30:00Z' }
      ]
    },
    {
      id: 'app_2',
      application_id: 'GECM-ND-2026-000102',
      type_code: 'GECM-ND',
      type_name: 'No Dues Clearance',
      student_id: 's10',
      student_name: 'Arjun Patel',
      enrollment_no: 'CSE2021001',
      department_name: 'Computer Science & Engineering',
      semester: 7,
      phone: '9900000010',
      email: 'student1@smartcampus.edu',
      current_status: 'UNDER_REVIEW',
      assigned_role: 'admin',
      assigned_department: 'Administration & Finance',
      submitted_at: new Date('2026-09-26T09:00:00Z'),
      updated_at: new Date('2026-09-26T09:00:00Z'),
      reviewed_at: null,
      reviewed_by_name: null,
      review_comment: null,
      form_data: {
        reason: 'Graduation & Degree Release',
        requestType: 'graduation'
      },
      clearances: [
        { department: 'Library', status: 'APPROVED', verified_by: 'Dr. Ramesh Kumar', remarks: 'Books returned' },
        { department: 'Accounts', status: 'PENDING', verified_by: null, remarks: 'Semester fee pending' },
        { department: 'Hostel', status: 'APPROVED', verified_by: 'Mr. Suresh Patel', remarks: 'Key returned' },
        { department: 'Department', status: 'APPROVED', verified_by: 'Prof. Anita Sharma', remarks: 'Labs cleared' },
        { department: 'Laboratory', status: 'APPROVED', verified_by: 'Dr. Vikram Singh', remarks: 'Equipment returned' },
        { department: 'Administration', status: 'PENDING', verified_by: null, remarks: 'Awaiting final signoff' }
      ],
      documents: [],
      workflow_timeline: [
        { step: 'Application Submitted', status: 'SUBMITTED', performed_by: 'Arjun Patel', timestamp: '2026-09-26T09:00:00Z' },
        { step: 'Multi-Department Verification', status: 'UNDER_REVIEW', performed_by: 'Clearance Committee', timestamp: '2026-09-26T09:01:00Z' }
      ]
    }
  ];
}

// -------------------------------------------------------------
// 1. GET /api/applications/types - Get Application Routing Config
// -------------------------------------------------------------
router.get('/types', authenticate, (req, res) => {
  res.json({ success: true, data: routingConfig });
});

// -------------------------------------------------------------
// 2. POST /api/applications/types/config - Admin Updates Routing Config
// -------------------------------------------------------------
router.post('/types/config', authenticate, authorize('admin'), (req, res) => {
  const { updatedTypes } = req.body;
  if (Array.isArray(updatedTypes)) {
    routingConfig = updatedTypes;
    return res.json({ success: true, message: 'Workflow routing configuration updated!', data: routingConfig });
  }
  res.status(400).json({ success: false, message: 'Invalid configuration format' });
});

// -------------------------------------------------------------
// 3. GET /api/applications/my-applications - Student Applications List
// -------------------------------------------------------------
router.get('/my-applications', authenticate, authorize('student'), async (req, res) => {
  try {
    const studentResult = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.id]);
    const studentId = studentResult.rows[0]?.id || 's10';

    let userApps = mockStore.applications.filter(a => a.student_id === studentId || a.student_id === 's10');
    const { status, type } = req.query;

    if (status) {
      userApps = userApps.filter(a => a.current_status.toLowerCase() === status.toLowerCase());
    }
    if (type) {
      userApps = userApps.filter(a => a.type_code === type);
    }

    res.json({ success: true, data: userApps });
  } catch (err) {
    console.error('Fetch my applications error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 4. GET /api/applications/inbox - Reviewer Applications Inbox
// -------------------------------------------------------------
router.get('/inbox', authenticate, authorize('admin', 'faculty', 'hod', 'warden', 'accounts'), async (req, res) => {
  try {
    const userRole = req.user.role;
    const { status, type, department, search, sortBy } = req.query;

    let inbox = [...mockStore.applications];

    // Filter by role permissions
    if (userRole === 'warden') {
      inbox = inbox.filter(a => a.assigned_role === 'warden' || a.type_code === 'GECM-GP' || (a.clearances && a.clearances.some(c => c.department === 'Hostel')));
    } else if (userRole === 'accounts') {
      inbox = inbox.filter(a => a.assigned_role === 'accounts' || (a.clearances && a.clearances.some(c => c.department === 'Accounts')));
    } else if (userRole === 'faculty') {
      inbox = inbox.filter(a => a.assigned_role === 'faculty' || a.type_code === 'GECM-LV');
    } else if (userRole === 'hod') {
      inbox = inbox.filter(a => a.assigned_role === 'hod' || a.type_code === 'GECM-BF' || a.type_code === 'GECM-LV');
    }

    // Filter by query parameters
    if (status) {
      inbox = inbox.filter(a => a.current_status.toLowerCase() === status.toLowerCase());
    }
    if (type) {
      inbox = inbox.filter(a => a.type_code === type);
    }
    if (department) {
      inbox = inbox.filter(a => a.department_name && a.department_name.toLowerCase().includes(department.toLowerCase()));
    }
    if (search) {
      const q = search.toLowerCase();
      inbox = inbox.filter(a =>
        a.application_id.toLowerCase().includes(q) ||
        a.student_name.toLowerCase().includes(q) ||
        a.enrollment_no.toLowerCase().includes(q) ||
        a.type_name.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'oldest') {
      inbox.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
    } else {
      inbox.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
    }

    res.json({ success: true, data: inbox });
  } catch (err) {
    console.error('Fetch inbox error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 5. GET /api/applications/:id - Full Application Dossier
// -------------------------------------------------------------
router.get('/:id', authenticate, async (req, res) => {
  try {
    const app = mockStore.applications.find(a => a.id === req.params.id || a.application_id === req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 6. POST /api/applications - Student Submit / Save Draft
// -------------------------------------------------------------
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { typeCode, formData, isDraft } = req.body;

    if (!typeCode || !formData) {
      return res.status(400).json({ success: false, message: 'Application type and form data are required.' });
    }

    // Find routing config for this type
    const config = routingConfig.find(c => c.code === typeCode) || routingConfig[0];

    // Prevent duplicate active application of same type
    const studentResult = await pool.query('SELECT id, enrollment_no, department_id, semester, phone FROM students WHERE user_id = $1', [req.user.id]);
    const studentId = studentResult.rows[0]?.id || 's10';

    if (!isDraft) {
      const activeApp = mockStore.applications.find(a =>
        a.student_id === studentId &&
        a.type_code === typeCode &&
        ['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_CORRECTION'].includes(a.current_status)
      );
      if (activeApp) {
        return res.status(400).json({
          success: false,
          message: `You already have an active application (${activeApp.application_id}) of type ${config.name} in progress.`
        });
      }
    }

    // Generate dynamic Application ID
    const appIdStr = generateApplicationId(typeCode);
    const newId = 'app_' + Date.now();
    const now = new Date();

    const newApp = {
      id: newId,
      application_id: appIdStr,
      type_code: typeCode,
      type_name: config.name,
      student_id: studentId,
      student_name: req.user.name,
      enrollment_no: studentResult.rows[0]?.enrollment_no || 'CSE2021001',
      department_name: 'Computer Science & Engineering',
      semester: studentResult.rows[0]?.semester || 7,
      phone: req.user.phone || '9900000010',
      email: req.user.email,
      current_status: isDraft ? 'DRAFT' : 'SUBMITTED',
      assigned_role: config.responsibleRole,
      assigned_department: config.responsibleDepartment,
      submitted_at: now,
      updated_at: now,
      reviewed_at: null,
      reviewed_by_name: null,
      review_comment: null,
      rejection_reason: null,
      correction_note: null,
      form_data: formData,
      documents: formData.uploadedFiles || [],
      clearances: config.multiDeptClearance ? (config.clearanceStages || ['Library', 'Accounts', 'Hostel', 'Department', 'Laboratory', 'Administration']).map(d => ({
        department: d,
        status: 'PENDING',
        verified_by: null,
        remarks: null
      })) : [],
      workflow_timeline: [
        {
          step: isDraft ? 'Draft Saved' : 'Application Submitted',
          status: isDraft ? 'DRAFT' : 'SUBMITTED',
          performed_by: req.user.name,
          timestamp: now.toISOString()
        }
      ]
    };

    if (!isDraft) {
      newApp.workflow_timeline.push({
        step: `Automatically Routed to ${config.responsibleDepartment}`,
        status: 'UNDER_REVIEW',
        performed_by: 'System Central Routing',
        timestamp: now.toISOString()
      });
      newApp.current_status = 'UNDER_REVIEW';

      // Send real-time notification to all assigned reviewer users & admin
      const reviewerUsers = mockStore.users.filter(u =>
        u.role === config.responsibleRole ||
        (config.responsibleRole === 'admin' && u.role === 'admin') ||
        (config.responsibleRole === 'hod' && (u.role === 'hod' || u.role === 'faculty')) ||
        u.role === 'admin' // Admin also has institutional oversight
      );

      const targetUsers = reviewerUsers.length > 0 ? reviewerUsers : mockStore.users.filter(u => u.role === 'admin');

      targetUsers.forEach((rev, idx) => {
        mockStore.notifications.unshift({
          id: 'n_' + Date.now() + '_' + idx,
          user_id: rev.id,
          title: `New ${config.name} Application Received 📬`,
          message: `${req.user.name} (${newApp.enrollment_no}) submitted ${config.name} (${appIdStr}). Needs review.`,
          type: 'action_required',
          reference_type: 'application',
          reference_id: appIdStr,
          is_read: false,
          created_at: now
        });
      });
    }

    mockStore.applications.unshift(newApp);

    res.status(201).json({
      success: true,
      message: isDraft ? 'Draft saved successfully!' : `Application ${appIdStr} submitted! Real-time alert dispatched to ${config.responsibleDepartment}.`,
      data: newApp
    });
  } catch (err) {
    console.error('Submit application error:', err);
    res.status(500).json({ success: false, message: 'Server error during submission' });
  }
});

// -------------------------------------------------------------
// 7. PUT /api/applications/:id/resubmit - Student Resubmits Correction
// -------------------------------------------------------------
router.put('/:id/resubmit', authenticate, authorize('student'), async (req, res) => {
  try {
    const { formData } = req.body;
    const app = mockStore.applications.find(a => a.id === req.params.id || a.application_id === req.params.id);

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    if (app.current_status !== 'NEEDS_CORRECTION' && app.current_status !== 'DRAFT') {
      return res.status(400).json({ success: false, message: 'Application is not in resubmittable status' });
    }

    const now = new Date();
    app.form_data = { ...app.form_data, ...formData };
    app.current_status = 'UNDER_REVIEW';
    app.updated_at = now;
    app.correction_note = null;

    app.workflow_timeline.push({
      step: 'Resubmitted by Student with Corrections',
      status: 'UNDER_REVIEW',
      performed_by: req.user.name,
      timestamp: now.toISOString()
    });

    res.json({ success: true, message: `Application ${app.application_id} resubmitted for review!`, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 8. PUT /api/applications/:id/review - Reviewer Actions (Approve / Reject / Correction)
// -------------------------------------------------------------
router.put('/:id/review', authenticate, authorize('admin', 'faculty', 'hod', 'warden', 'accounts'), async (req, res) => {
  try {
    const { action, comment, rejectionReason, correctionNote } = req.body; // action: 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION'
    const app = mockStore.applications.find(a => a.id === req.params.id || a.application_id === req.params.id);

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    if (action === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required when rejecting an application.' });
    }

    if (action === 'NEEDS_CORRECTION' && !correctionNote) {
      return res.status(400).json({ success: false, message: 'Correction details note is required when requesting correction.' });
    }

    const now = new Date();
    app.current_status = action;
    app.reviewed_at = now;
    app.reviewed_by_name = `${req.user.name} (${req.user.role.toUpperCase()})`;
    app.review_comment = comment || null;
    app.rejection_reason = rejectionReason || null;
    app.correction_note = correctionNote || null;
    app.updated_at = now;

    let stepTitle = 'Reviewed by ' + req.user.name;
    if (action === 'APPROVED') stepTitle = `Approved by ${req.user.name} (${req.user.role.toUpperCase()})`;
    if (action === 'REJECTED') stepTitle = `Rejected by ${req.user.name}: ${rejectionReason}`;
    if (action === 'NEEDS_CORRECTION') stepTitle = `Correction Requested by ${req.user.name}: ${correctionNote}`;

    app.workflow_timeline.push({
      step: stepTitle,
      status: action,
      performed_by: req.user.name,
      timestamp: now.toISOString(),
      comments: comment || rejectionReason || correctionNote
    });

    // Notify student user
    const studentUser = mockStore.users.find(u => u.name === app.student_name || u.email === app.email) || mockStore.users.find(u => u.role === 'student');
    if (studentUser) {
      let notifTitle = `Application ${app.application_id} Updated`;
      let notifMsg = `Your ${app.type_name} status is now ${action}.`;
      let notifType = 'info';

      if (action === 'APPROVED') { notifTitle = `Application Approved! 🎉`; notifMsg = `Your ${app.type_name} (${app.application_id}) has been approved!`; notifType = 'success'; }
      if (action === 'REJECTED') { notifTitle = `Application Rejected ❌`; notifMsg = `Your ${app.type_name} (${app.application_id}) was rejected. Reason: ${rejectionReason}`; notifType = 'error'; }
      if (action === 'NEEDS_CORRECTION') { notifTitle = `Correction Requested ⚠️`; notifMsg = `Your ${app.type_name} requires changes: ${correctionNote}`; notifType = 'warning'; }

      mockStore.notifications.unshift({
        id: 'n_' + Date.now(),
        user_id: studentUser.id,
        title: notifTitle,
        message: notifMsg,
        type: notifType,
        reference_type: 'application',
        reference_id: app.application_id,
        is_read: false,
        created_at: now
      });
    }

    res.json({ success: true, message: `Application ${app.application_id} updated to ${action}!`, data: app });
  } catch (err) {
    console.error('Review application error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 9. PUT /api/applications/:id/clearance - Update Dept Clearance (No Dues)
// -------------------------------------------------------------
router.put('/:id/clearance', authenticate, authorize('admin', 'faculty', 'hod', 'warden', 'accounts'), async (req, res) => {
  try {
    const { department, status, remarks } = req.body; // status: 'APPROVED', 'REJECTED'
    const app = mockStore.applications.find(a => a.id === req.params.id || a.application_id === req.params.id);

    if (!app || !app.clearances) return res.status(404).json({ success: false, message: 'Clearance application not found' });

    const cl = app.clearances.find(c => c.department.toLowerCase() === department.toLowerCase());
    if (cl) {
      cl.status = status;
      cl.verified_by = req.user.name;
      cl.remarks = remarks || null;
    }

    const now = new Date();
    app.updated_at = now;

    // Recalculate overall status
    const allApproved = app.clearances.every(c => c.status === 'APPROVED');
    const anyRejected = app.clearances.some(c => c.status === 'REJECTED');

    if (anyRejected) {
      app.current_status = 'REJECTED';
    } else if (allApproved) {
      app.current_status = 'APPROVED';
    } else {
      app.current_status = 'UNDER_REVIEW';
    }

    app.workflow_timeline.push({
      step: `${department} Clearance Updated: ${status}`,
      status: status,
      performed_by: req.user.name,
      timestamp: now.toISOString(),
      comments: remarks
    });

    res.json({ success: true, message: `${department} clearance set to ${status}`, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 10. POST /api/applications/upload - Upload Attachment File
// -------------------------------------------------------------
router.post('/upload', authenticate, upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded or invalid file format.' });
  }
  const fileData = {
    file_name: req.file.originalname,
    file_path: `/uploads/${req.file.filename}`,
    file_size: `${(req.file.size / 1024).toFixed(1)} KB`,
    file_type: req.file.mimetype,
    uploaded_at: new Date().toISOString()
  };
  res.json({ success: true, message: 'File uploaded successfully', data: fileData });
});

module.exports = router;
