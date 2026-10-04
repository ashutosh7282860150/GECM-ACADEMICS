const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const mockStore = require('../services/mockStore');
const { authenticate, authorize } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// In-memory library store (synced with mockStore)
if (!mockStore.libraryBooks) {
  mockStore.libraryBooks = [
    { id: 'BK-101', accession_no: 'LIB-4091', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell & Peter Norvig', isbn: '978-0134610993', category: 'Computer Science', total_copies: 8, available_copies: 7, shelf_location: 'Rack CS-04', edition: '4th Edition' },
    { id: 'BK-102', accession_no: 'LIB-4092', title: 'Database System Concepts', author: 'Abraham Silberschatz, Henry F. Korth', isbn: '978-0078022159', category: 'Computer Science', total_copies: 12, available_copies: 11, shelf_location: 'Rack CS-02', edition: '7th Edition' },
    { id: 'BK-103', accession_no: 'LIB-4093', title: 'Introduction to Algorithms (CLRS)', author: 'Thomas H. Cormen, Charles E. Leiserson', isbn: '978-0262033848', category: 'Computer Science', total_copies: 10, available_copies: 9, shelf_location: 'Rack CS-01', edition: '3rd Edition' },
    { id: 'BK-104', accession_no: 'LIB-4094', title: 'Computer Networks', author: 'Andrew S. Tanenbaum, David J. Wetherall', isbn: '978-0132126953', category: 'Electronics & Communication', total_copies: 6, available_copies: 5, shelf_location: 'Rack EC-03', edition: '5th Edition' },
    { id: 'BK-105', accession_no: 'LIB-4095', title: 'Digital Design & Computer Architecture', author: 'David Harris, Sarah Harris', isbn: '978-0123944245', category: 'Electronics & Communication', total_copies: 5, available_copies: 5, shelf_location: 'Rack EC-01', edition: '2nd Edition' },
    { id: 'BK-106', accession_no: 'LIB-4096', title: 'Higher Engineering Mathematics', author: 'Dr. B.S. Grewal', isbn: '978-8174091955', category: 'Basic Sciences & Mathematics', total_copies: 20, available_copies: 20, shelf_location: 'Rack BS-05', edition: '44th Edition' },
    { id: 'BK-107', accession_no: 'LIB-4097', title: 'Machine Learning: A Probabilistic Perspective', author: 'Kevin P. Murphy', isbn: '978-0262018029', category: 'AI & Data Science', total_copies: 4, available_copies: 4, shelf_location: 'Rack CS-06', edition: '1st Edition' },
    { id: 'BK-108', accession_no: 'LIB-4098', title: 'Operating System Principles', author: 'Peter B. Galvin, Greg Gagne', isbn: '978-8126509621', category: 'Computer Science', total_copies: 9, available_copies: 9, shelf_location: 'Rack CS-03', edition: '9th Edition' }
  ];
}

if (!mockStore.libraryCirculations) {
  mockStore.libraryCirculations = [
    {
      id: 'CIRC-101',
      accession_no: 'LIB-4091',
      book_id: 'BK-101',
      book_title: 'Artificial Intelligence: A Modern Approach',
      student_id: 's10',
      student_name: 'Arjun Patel',
      enrollment_no: 'CSE2021001',
      department_name: 'Computer Science & Engineering',
      issue_date: '2026-09-10',
      due_date: '2026-10-10',
      return_date: null,
      fine_amount: 0,
      fine_paid: false,
      status: 'Active'
    },
    {
      id: 'CIRC-102',
      accession_no: 'LIB-4092',
      book_id: 'BK-102',
      book_title: 'Database System Concepts',
      student_id: 's11',
      student_name: 'Priya Sharma',
      enrollment_no: 'CSE2021002',
      department_name: 'Computer Science & Engineering',
      issue_date: '2026-09-12',
      due_date: '2026-10-12',
      return_date: null,
      fine_amount: 0,
      fine_paid: false,
      status: 'Active'
    },
    {
      id: 'CIRC-103',
      accession_no: 'LIB-4093',
      book_id: 'BK-103',
      book_title: 'Introduction to Algorithms (CLRS)',
      student_id: 's12',
      student_name: 'Rohit Verma',
      enrollment_no: 'CSE2022001',
      department_name: 'Computer Science & Engineering',
      issue_date: '2026-08-25',
      due_date: '2026-09-25',
      return_date: null,
      fine_amount: 60,
      fine_paid: false,
      status: 'Overdue'
    },
    {
      id: 'CIRC-104',
      accession_no: 'LIB-4094',
      book_id: 'BK-104',
      book_title: 'Computer Networks',
      student_id: 's14',
      student_name: 'Amit Kumar',
      enrollment_no: 'ECE2021001',
      department_name: 'Electronics & Communication',
      issue_date: '2026-09-15',
      due_date: '2026-10-15',
      return_date: null,
      fine_amount: 0,
      fine_paid: false,
      status: 'Active'
    }
  ];
}

// -------------------------------------------------------------
// 1. GET /api/library/stats - Summary Statistics
// -------------------------------------------------------------
router.get('/stats', authenticate, async (req, res) => {
  try {
    const totalTitles = mockStore.libraryBooks.length;
    const totalCopies = mockStore.libraryBooks.reduce((acc, b) => acc + (b.total_copies || 0), 0);
    const activeBorrowings = mockStore.libraryCirculations.filter(c => c.status === 'Active' || c.status === 'Overdue');
    const overdueBorrowings = mockStore.libraryCirculations.filter(c => c.status === 'Overdue');
    const totalFines = overdueBorrowings.reduce((acc, c) => acc + (c.fine_amount || 0), 0);

    const noDuesList = mockStore.noDuesRequests || [];
    const clearedNoDues = noDuesList.filter(n => n.library_status === 'approved').length;
    const pendingNoDues = noDuesList.filter(n => n.library_status === 'pending' || !n.library_status).length;
    const clearanceRate = noDuesList.length > 0 ? ((clearedNoDues / noDuesList.length) * 100).toFixed(1) : '100.0';

    res.json({
      success: true,
      data: {
        totalTitles,
        totalCopies,
        activeBorrowingsCount: activeBorrowings.length,
        overdueCount: overdueBorrowings.length,
        totalFinesPending: totalFines,
        clearedNoDues,
        pendingNoDues,
        clearanceRate: `${clearanceRate}%`
      }
    });
  } catch (err) {
    console.error('Library stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 2. GET /api/library/books - Catalog with search and category filter
// -------------------------------------------------------------
router.get('/books', authenticate, async (req, res) => {
  try {
    const { search, category } = req.query;
    let books = [...mockStore.libraryBooks];

    if (category && category !== 'all') {
      books = books.filter(b => b.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      books = books.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.accession_no.toLowerCase().includes(q) ||
        (b.isbn && b.isbn.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, data: books });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 3. POST /api/library/books - Add book to catalog
// -------------------------------------------------------------
router.post('/books', authenticate, authorize('admin', 'faculty', 'hod', 'librarian', 'library'), async (req, res) => {
  try {
    const { title, author, isbn, category, total_copies, shelf_location, edition } = req.body;
    if (!title || !author) {
      return res.status(400).json({ success: false, message: 'Title and Author are required.' });
    }

    const nextId = 'BK-' + (mockStore.libraryBooks.length + 101);
    const nextAcc = 'LIB-' + (4090 + mockStore.libraryBooks.length + 1);

    const newBook = {
      id: nextId,
      accession_no: nextAcc,
      title,
      author,
      isbn: isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: category || 'General Engineering',
      total_copies: parseInt(total_copies) || 5,
      available_copies: parseInt(total_copies) || 5,
      shelf_location: shelf_location || 'Main Stacks',
      edition: edition || 'Latest Edition'
    };

    mockStore.libraryBooks.unshift(newBook);
    res.status(201).json({ success: true, message: 'Book title added to library catalog.', data: newBook });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 4. DELETE /api/library/books/:id - Remove book title
// -------------------------------------------------------------
router.delete('/books/:id', authenticate, authorize('admin', 'librarian', 'library'), async (req, res) => {
  try {
    const idx = mockStore.libraryBooks.findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Book not found' });

    mockStore.libraryBooks.splice(idx, 1);
    res.json({ success: true, message: 'Book removed from library catalog.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 5. GET /api/library/circulations - Active & overdue borrowings
// -------------------------------------------------------------
router.get('/circulations', authenticate, async (req, res) => {
  try {
    const { status, student_id, search } = req.query;
    let circs = [...mockStore.libraryCirculations];

    if (status && status !== 'all') {
      circs = circs.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }

    if (student_id) {
      circs = circs.filter(c => c.student_id === student_id || c.enrollment_no === student_id);
    }

    if (search) {
      const q = search.toLowerCase();
      circs = circs.filter(c =>
        c.book_title.toLowerCase().includes(q) ||
        c.student_name.toLowerCase().includes(q) ||
        c.enrollment_no.toLowerCase().includes(q) ||
        c.accession_no.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, data: circs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 6. POST /api/library/issue - Issue book to a student
// -------------------------------------------------------------
router.post('/issue', authenticate, authorize('admin', 'faculty', 'hod', 'librarian', 'library'), async (req, res) => {
  try {
    const { book_id, enrollment_no, student_name, department_name, due_days } = req.body;
    const book = mockStore.libraryBooks.find(b => b.id === book_id || b.accession_no === book_id);
    if (!book) return res.status(404).json({ success: false, message: 'Book volume not found' });
    if (book.available_copies <= 0) return res.status(400).json({ success: false, message: 'No copies available for issue.' });

    const student = mockStore.students.find(s => s.enrollment_no.toLowerCase() === (enrollment_no || '').toLowerCase()) || {
      id: 's_custom',
      name: student_name || 'Student',
      enrollment_no: enrollment_no || 'GECM2024',
      department_name: department_name || 'Engineering'
    };

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + (parseInt(due_days) || 14));

    const newCirc = {
      id: 'CIRC-' + (mockStore.libraryCirculations.length + 101),
      accession_no: book.accession_no,
      book_id: book.id,
      book_title: book.title,
      student_id: student.id,
      student_name: student.name,
      enrollment_no: student.enrollment_no,
      department_name: student.department_name || 'Computer Science & Engineering',
      issue_date: today.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      return_date: null,
      fine_amount: 0,
      fine_paid: false,
      status: 'Active'
    };

    book.available_copies = Math.max(0, book.available_copies - 1);
    mockStore.libraryCirculations.unshift(newCirc);

    res.status(201).json({ success: true, message: `Book issued successfully to ${student.name} (${student.enrollment_no})`, data: newCirc });
  } catch (err) {
    console.error('Book issue error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 7. POST /api/library/return/:id - Return book & update inventory
// -------------------------------------------------------------
router.post('/return/:id', authenticate, authorize('admin', 'faculty', 'hod', 'librarian', 'library'), async (req, res) => {
  try {
    const circ = mockStore.libraryCirculations.find(c => c.id === req.params.id || c.accession_no === req.params.id);
    if (!circ) return res.status(404).json({ success: false, message: 'Borrowing record not found' });

    circ.status = 'Returned';
    circ.return_date = new Date().toISOString().split('T')[0];
    circ.fine_paid = true;

    const book = mockStore.libraryBooks.find(b => b.id === circ.book_id || b.accession_no === circ.accession_no);
    if (book) {
      book.available_copies = Math.min(book.total_copies, (book.available_copies || 0) + 1);
    }

    res.json({ success: true, message: `Book ${circ.accession_no} (${circ.book_title}) marked returned. Fine cleared.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 8. POST /api/library/renew/:id - Renew / Extend book due date
// -------------------------------------------------------------
router.post('/renew/:id', authenticate, authorize('admin', 'faculty', 'hod', 'librarian', 'library'), async (req, res) => {
  try {
    const circ = mockStore.libraryCirculations.find(c => c.id === req.params.id || c.accession_no === req.params.id);
    if (!circ) return res.status(404).json({ success: false, message: 'Borrowing record not found' });

    const currentDue = new Date(circ.due_date || new Date());
    currentDue.setDate(currentDue.getDate() + 14);
    circ.due_date = currentDue.toISOString().split('T')[0];
    circ.status = 'Active';
    circ.fine_amount = 0;

    res.json({ success: true, message: `Borrowing renewed. New due date is ${circ.due_date}`, data: circ });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 9. GET /api/library/clearance-requests - Fetch No-Dues Clearance requests
// -------------------------------------------------------------
router.get('/clearance-requests', authenticate, async (req, res) => {
  try {
    const { status, search } = req.query;
    let requests = (mockStore.noDuesRequests || []).map(r => {
      // Find active borrowings for this student
      const studentCircs = (mockStore.libraryCirculations || []).filter(
        c => (c.student_id === r.student_id || c.enrollment_no === r.enrollment_no) && (c.status === 'Active' || c.status === 'Overdue')
      );
      const overdueCircs = studentCircs.filter(c => c.status === 'Overdue');
      const totalFine = studentCircs.reduce((acc, c) => acc + (c.fine_amount || 0), 0);

      return {
        ...r,
        active_borrowings_count: studentCircs.length,
        overdue_books_count: overdueCircs.length,
        total_library_fine: totalFine,
        borrowed_books: studentCircs
      };
    });

    if (status && status !== 'all') {
      if (status === 'pending') {
        requests = requests.filter(r => (r.library_status || 'pending') === 'pending');
      } else {
        requests = requests.filter(r => r.library_status === status);
      }
    }

    if (search) {
      const q = search.toLowerCase();
      requests = requests.filter(r =>
        (r.student_name && r.student_name.toLowerCase().includes(q)) ||
        (r.enrollment_no && r.enrollment_no.toLowerCase().includes(q)) ||
        (r.department_name && r.department_name.toLowerCase().includes(q))
      );
    }

    res.json({ success: true, data: requests });
  } catch (err) {
    console.error('Clearance requests error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------------------------------------------------
// 10. POST /api/library/clearance/:id - Approve or Reject Library Clearance
// -------------------------------------------------------------
router.post('/clearance/:id', authenticate, authorize('admin', 'faculty', 'hod', 'librarian', 'library'), async (req, res) => {
  try {
    const { action, remarks } = req.body; // action: 'approved' or 'rejected'
    const ndId = req.params.id;
    const reqItem = (mockStore.noDuesRequests || []).find(r => r.id === ndId || r.request_number === ndId);

    if (!reqItem) {
      return res.status(404).json({ success: false, message: 'No-Dues application not found' });
    }

    const verifierName = req.user.name || 'Central Library Incharge';
    reqItem.library_status = action;
    reqItem.library_remarks = remarks || (action === 'approved' ? 'Zero books pending. Digital Library Clearance granted.' : 'Action required: Return overdue books or pay fine.');
    reqItem.library_verified_by = verifierName;
    reqItem.library_verified_at = new Date();
    reqItem.updated_at = new Date();

    // Also update steps
    if (!reqItem.steps) reqItem.steps = [];
    const libStep = reqItem.steps.find(s => s.department === 'library');
    if (libStep) {
      libStep.status = action;
      libStep.comment = reqItem.library_remarks;
      libStep.updated_by = req.user.id;
      libStep.updated_at = new Date().toISOString();
    } else {
      reqItem.steps.push({
        id: 'nds_' + Date.now(),
        department: 'library',
        status: action,
        comment: reqItem.library_remarks,
        updated_by: req.user.id,
        updated_at: new Date().toISOString()
      });
    }

    // Recompute overall status
    const statuses = [
      reqItem.hostel_status || 'pending',
      reqItem.library_status || 'pending',
      reqItem.accounts_status || 'pending',
      reqItem.hod_status || 'approved',
      reqItem.faculty_status || 'approved',
      reqItem.admin_status || 'pending'
    ];

    if (statuses.some(s => s === 'rejected')) {
      reqItem.overall_status = 'rejected';
    } else if (statuses.every(s => s === 'approved')) {
      reqItem.overall_status = 'completed';
    } else if (statuses.some(s => s === 'approved')) {
      reqItem.overall_status = 'in_progress';
    }

    // Add notification to student
    if (reqItem.student_id) {
      const studentUser = mockStore.students.find(s => s.id === reqItem.student_id);
      if (studentUser && studentUser.user_id) {
        mockStore.notifications.unshift({
          id: 'notif_' + Date.now(),
          user_id: studentUser.user_id,
          title: `Library No-Dues ${action === 'approved' ? 'Approved ✅' : 'Action Required ⚠️'}`,
          message: action === 'approved'
            ? `Central Library has cleared your No-Dues request. ${reqItem.library_remarks}`
            : `Central Library flagged an issue: ${reqItem.library_remarks}`,
          type: action === 'approved' ? 'success' : 'error',
          reference_type: 'no_dues',
          reference_id: reqItem.id,
          is_read: false,
          created_at: new Date()
        });
      }
    }

    res.json({
      success: true,
      message: `Library clearance marked ${action.toUpperCase()} for ${reqItem.student_name}.`,
      data: reqItem
    });
  } catch (err) {
    console.error('Process library clearance error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
