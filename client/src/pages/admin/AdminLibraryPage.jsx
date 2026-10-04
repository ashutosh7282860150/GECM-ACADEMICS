import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { libraryAPI, noDuesAPI } from '../../services/api';
import { formatDate, timeAgo, getStatusBadgeClass, getStatusLabel } from '../../utils/helpers';
import GECMLogo from '../../components/GECMLogo';

export default function AdminLibraryPage() {
  const [activeTab, setActiveTab] = useState('clearance'); // 'clearance' | 'catalog' | 'circulations'
  const [stats, setStats] = useState({
    totalTitles: 14250,
    totalCopies: 45200,
    activeBorrowingsCount: 4,
    overdueCount: 1,
    totalFinesPending: 60,
    clearedNoDues: 184,
    pendingNoDues: 2,
    clearanceRate: '98.9%'
  });

  // Data states
  const [clearanceRequests, setClearanceRequests] = useState([]);
  const [books, setBooks] = useState([]);
  const [circulations, setCirculations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [clearanceFilter, setClearanceFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [clearanceSearch, setClearanceSearch] = useState('');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [circulationFilter, setCirculationFilter] = useState('all');
  const [circulationSearch, setCirculationSearch] = useState('');

  // Modals
  const [actionModal, setActionModal] = useState(null); // { request, actionType: 'approved' | 'rejected' }
  const [actionRemarks, setActionRemarks] = useState('');
  const [inspectModal, setInspectModal] = useState(null); // request to inspect
  const [certificateModal, setCertificateModal] = useState(null); // request for cert preview
  const [addBookModal, setAddBookModal] = useState(false);
  const [issueBookModal, setIssueBookModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // New Book Form
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    total_copies: 5,
    shelf_location: 'Rack CS-01',
    edition: 'Latest Edition'
  });

  // Issue Book Form
  const [issueForm, setIssueForm] = useState({
    book_id: '',
    enrollment_no: 'CSE2021001',
    student_name: 'Arjun Patel',
    department_name: 'Computer Science & Engineering',
    due_days: 14
  });

  // Fetch all library data
  const fetchData = async () => {
    try {
      const [statsRes, reqsRes, booksRes, circsRes] = await Promise.all([
        libraryAPI.getStats().catch(() => null),
        libraryAPI.getClearanceRequests().catch(() => null),
        libraryAPI.getBooks().catch(() => null),
        libraryAPI.getCirculations().catch(() => null)
      ]);

      if (statsRes?.data?.data) setStats(statsRes.data.data);
      if (reqsRes?.data?.data) setClearanceRequests(reqsRes.data.data);
      if (booksRes?.data?.data) setBooks(booksRes.data.data);
      if (circsRes?.data?.data) setCirculations(circsRes.data.data);
    } catch (err) {
      console.error('Failed to load library data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Verify No-Dues Action
  const handleProcessClearance = async () => {
    if (!actionModal) return;
    setProcessing(true);
    try {
      const { request, actionType } = actionModal;
      await libraryAPI.processClearance(request.id, {
        action: actionType,
        remarks: actionRemarks || (actionType === 'approved' ? 'Zero books pending. Digital Library Clearance granted.' : 'Pending return of overdue books.')
      });

      toast.success(
        actionType === 'approved'
          ? `✅ Library No-Dues cleared for ${request.student_name} (${request.enrollment_no})`
          : `⚠️ Library clearance flagged for ${request.student_name}`
      );
      setActionModal(null);
      setActionRemarks('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update clearance');
    } finally {
      setProcessing(false);
    }
  };

  // Batch Auto-Clear students with 0 overdue books
  const handleBatchAutoClear = async () => {
    const eligible = clearanceRequests.filter(
      r => (r.library_status || 'pending') === 'pending' && (!r.overdue_books_count || r.overdue_books_count === 0)
    );

    if (eligible.length === 0) {
      toast.info('No pending requests with zero overdue books to auto-clear.');
      return;
    }

    setProcessing(true);
    try {
      for (const req of eligible) {
        await libraryAPI.processClearance(req.id, {
          action: 'approved',
          remarks: 'Automated digital verification: Zero overdue books on record.'
        });
      }
      toast.success(`🎉 Successfully auto-cleared Library No-Dues for ${eligible.length} student(s)!`);
      fetchData();
    } catch (err) {
      toast.error('Batch clearance encountered an issue.');
    } finally {
      setProcessing(false);
    }
  };

  // Handle Add Book
  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) {
      toast.error('Please enter book title and author.');
      return;
    }
    setProcessing(true);
    try {
      await libraryAPI.createBook(newBook);
      toast.success(`📚 "${newBook.title}" added to Library Catalog!`);
      setAddBookModal(false);
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        category: 'Computer Science',
        total_copies: 5,
        shelf_location: 'Rack CS-01',
        edition: 'Latest Edition'
      });
      fetchData();
    } catch (err) {
      toast.error('Failed to add book');
    } finally {
      setProcessing(false);
    }
  };

  // Handle Issue Book
  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!issueForm.book_id || !issueForm.enrollment_no) {
      toast.error('Please select a book and student enrollment number.');
      return;
    }
    setProcessing(true);
    try {
      await libraryAPI.issueBook(issueForm);
      toast.success(`📖 Book volume issued to ${issueForm.enrollment_no}!`);
      setIssueBookModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setProcessing(false);
    }
  };

  // Handle Return Book
  const handleReturnBook = async (circ) => {
    try {
      await libraryAPI.returnBook(circ.id);
      toast.success(`✅ Book ${circ.accession_no} returned & fine cleared!`);
      fetchData();
    } catch (err) {
      toast.error('Failed to return book');
    }
  };

  // Handle Renew Book
  const handleRenewBook = async (circ) => {
    try {
      await libraryAPI.renewBook(circ.id);
      toast.success(`🔄 Book ${circ.accession_no} renewed for 14 days!`);
      fetchData();
    } catch (err) {
      toast.error('Failed to renew book');
    }
  };

  // Filtered clearance requests
  const filteredClearance = useMemo(() => {
    return clearanceRequests.filter(r => {
      const matchFilter =
        clearanceFilter === 'all' ||
        (clearanceFilter === 'pending' && (r.library_status || 'pending') === 'pending') ||
        r.library_status === clearanceFilter;

      const q = clearanceSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (r.student_name && r.student_name.toLowerCase().includes(q)) ||
        (r.enrollment_no && r.enrollment_no.toLowerCase().includes(q)) ||
        (r.department_name && r.department_name.toLowerCase().includes(q)) ||
        (r.reason && r.reason.toLowerCase().includes(q));

      return matchFilter && matchSearch;
    });
  }, [clearanceRequests, clearanceFilter, clearanceSearch]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchCat = catalogCategory === 'all' || b.category.toLowerCase().includes(catalogCategory.toLowerCase());
      const q = catalogSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.accession_no.toLowerCase().includes(q) ||
        (b.isbn && b.isbn.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [books, catalogCategory, catalogSearch]);

  // Filtered circulations
  const filteredCirculations = useMemo(() => {
    return circulations.filter(c => {
      const matchFilter = circulationFilter === 'all' || c.status.toLowerCase() === circulationFilter.toLowerCase();
      const q = circulationSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.book_title.toLowerCase().includes(q) ||
        c.student_name.toLowerCase().includes(q) ||
        c.enrollment_no.toLowerCase().includes(q) ||
        c.accession_no.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [circulations, circulationFilter, circulationSearch]);

  const pendingCount = clearanceRequests.filter(r => (r.library_status || 'pending') === 'pending').length;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* ── TOP HEADER BANNER ── */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '22px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '4px', border: '1px solid #bfdbfe', textTransform: 'uppercase' }}>
                ADMINISTRATOR / DEPARTMENT PORTAL
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#f0fdf4', color: '#16a34a', padding: '3px 10px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                CENTRAL LIBRARY DIVISION
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0b1d3a', margin: '4px 0' }}>
              📚 Central Library Management &amp; No-Dues Clearance Desk
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '2px 0 0 0' }}>
              Integrated library administration: verify student no-dues requests, audit book holdings, issue/return volumes, and settle overdue penalties.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="gov-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              onClick={() => setIssueBookModal(true)}
            >
              <span>📖</span> Issue Book
            </button>
            <button
              className="gov-btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              onClick={() => setAddBookModal(true)}
            >
              <span>➕</span> Add Book Title
            </button>
          </div>
        </div>
      </div>

      {/* ── SUMMARY STATS CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Library Titles / Catalog</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0b1d3a', marginTop: '4px' }}>
            {books.length > 0 ? books.length : stats.totalTitles} Titles
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
            {stats.totalCopies ? stats.totalCopies.toLocaleString() : '45,200'} Total Physical Copies
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Active Borrowings</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#b45309', marginTop: '4px' }}>
            {circulations.filter(c => c.status === 'Active' || c.status === 'Overdue').length} Books
          </div>
          <div style={{ fontSize: '0.76rem', color: '#dc2626', marginTop: '2px', fontWeight: 600 }}>
            ⚠️ {circulations.filter(c => c.status === 'Overdue').length} Overdue with Fines
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Library No-Dues Clearance</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#16a34a', marginTop: '4px' }}>
            {stats.clearanceRate || '98.5%'}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
            ✓ {clearanceRequests.filter(r => r.library_status === 'approved').length} Cleared Digital Stamped
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Pending Clearance Action</div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, color: pendingCount > 0 ? '#dc2626' : '#0b1d3a', marginTop: '4px' }}>
            {pendingCount} Students
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
            Awaiting Library Incharge Verification
          </div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e2e8f0', marginBottom: '20px', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('clearance')}
          style={{
            padding: '10px 18px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'clearance' ? '3px solid #1d4ed8' : '3px solid transparent',
            background: activeTab === 'clearance' ? '#eff6ff' : 'transparent',
            color: activeTab === 'clearance' ? '#1d4ed8' : '#64748b',
            borderRadius: '6px 6px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>✅</span> Library No-Dues Clearance Desk
          {pendingCount > 0 && (
            <span style={{ background: '#dc2626', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', borderRadius: '999px' }}>
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '10px 18px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'catalog' ? '3px solid #1d4ed8' : '3px solid transparent',
            background: activeTab === 'catalog' ? '#eff6ff' : 'transparent',
            color: activeTab === 'catalog' ? '#1d4ed8' : '#64748b',
            borderRadius: '6px 6px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📚</span> Book Catalog &amp; Inventory ({books.length})
        </button>

        <button
          onClick={() => setActiveTab('circulations')}
          style={{
            padding: '10px 18px',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            border: 'none',
            borderBottom: activeTab === 'circulations' ? '3px solid #1d4ed8' : '3px solid transparent',
            background: activeTab === 'circulations' ? '#eff6ff' : 'transparent',
            color: activeTab === 'circulations' ? '#1d4ed8' : '#64748b',
            borderRadius: '6px 6px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🔄</span> Active Circulations &amp; Overdues ({circulations.length})
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: NO-DUES CLEARANCE DESK                                 */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'clearance' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a', margin: 0 }}>
                📋 Student No-Dues Clearance Applications (Library Stage)
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                Verify that all books are returned and overdue fines settled before applying the official digital clearance seal.
              </p>
            </div>

            <button
              onClick={handleBatchAutoClear}
              disabled={processing || pendingCount === 0}
              style={{
                background: '#047857',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: pendingCount === 0 ? 'not-allowed' : 'pointer',
                opacity: pendingCount === 0 ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>⚡</span> Auto-Clear Eligible (0 Overdue)
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { key: 'all', label: 'All Requests' },
                { key: 'pending', label: '⏳ Pending Library Clearance' },
                { key: 'approved', label: '✓ Cleared' },
                { key: 'rejected', label: '⚠️ Flagged / Due' }
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setClearanceFilter(t.key)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: clearanceFilter === t.key ? '#1d4ed8' : '#e2e8f0',
                    background: clearanceFilter === t.key ? '#1d4ed8' : '#ffffff',
                    color: clearanceFilter === t.key ? '#ffffff' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ marginLeft: 'auto', minWidth: '260px' }}>
              <input
                type="text"
                placeholder="🔍 Search student name, roll no..."
                value={clearanceSearch}
                onChange={e => setClearanceSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem'
                }}
              />
            </div>
          </div>

          {/* Clearance Table */}
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              <div className="spinner" style={{ margin: '0 auto 10px' }} />
              Loading student applications...
            </div>
          ) : filteredClearance.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>No student clearance requests matching this filter.</div>
              <p style={{ fontSize: '0.82rem', marginTop: '4px' }}>All student records are up to date.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '10px 12px' }}>Student / Roll No</th>
                    <th style={{ padding: '10px 12px' }}>Department &amp; Sem</th>
                    <th style={{ padding: '10px 12px' }}>Clearance Reason</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Active Holdings</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Library Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Other Depts</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Date</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Clearance Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClearance.map((req) => {
                    const isPending = (req.library_status || 'pending') === 'pending';
                    const hasOverdue = (req.overdue_books_count || 0) > 0;
                    const activeCount = req.active_borrowings_count || 0;

                    return (
                      <tr key={req.id} style={{ borderBottom: '1px solid #e2e8f0', background: isPending && hasOverdue ? '#fffbeb' : '#ffffff' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 800, color: '#0b1d3a' }}>{req.student_name}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>{req.enrollment_no}</div>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{req.department_name || 'CSE'}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Semester {req.semester || 7}</div>
                        </td>

                        <td style={{ padding: '12px', maxWidth: '200px' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{req.reason || req.request_type}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'capitalize' }}>Type: {req.request_type}</div>
                        </td>

                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          {activeCount === 0 ? (
                            <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#16a34a', background: '#f0fdf4', padding: '3px 8px', borderRadius: '4px' }}>
                              0 Books (Clear)
                            </span>
                          ) : (
                            <button
                              onClick={() => setInspectModal(req)}
                              style={{
                                background: hasOverdue ? '#fef2f2' : '#eff6ff',
                                color: hasOverdue ? '#dc2626' : '#1d4ed8',
                                border: `1px solid ${hasOverdue ? '#fecaca' : '#bfdbfe'}`,
                                borderRadius: '4px',
                                padding: '3px 8px',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              {activeCount} Book(s) {hasOverdue && `(₹${req.total_library_fine || 60} Fine)`}
                            </button>
                          )}
                        </td>

                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: '4px',
                              fontSize: '0.74rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              background:
                                req.library_status === 'approved' ? '#f0fdf4' : req.library_status === 'rejected' ? '#fef2f2' : '#fffbeb',
                              color:
                                req.library_status === 'approved' ? '#16a34a' : req.library_status === 'rejected' ? '#dc2626' : '#b45309',
                              border: `1px solid ${
                                req.library_status === 'approved' ? '#bbf7d0' : req.library_status === 'rejected' ? '#fecaca' : '#fde68a'
                              }`
                            }}
                          >
                            {req.library_status === 'approved' ? '✓ Cleared' : req.library_status === 'rejected' ? '✗ Flagged' : '⏳ Pending'}
                          </span>
                          {req.library_verified_by && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                              By: {req.library_verified_by}
                            </div>
                          )}
                        </td>

                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <span title="Hostel" style={{ fontSize: '0.68rem', padding: '2px 5px', borderRadius: '3px', background: req.hostel_status === 'approved' ? '#dcfce7' : '#fee2e2', color: req.hostel_status === 'approved' ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
                              H: {req.hostel_status === 'approved' ? '✓' : '⏳'}
                            </span>
                            <span title="Accounts" style={{ fontSize: '0.68rem', padding: '2px 5px', borderRadius: '3px', background: req.accounts_status === 'approved' ? '#dcfce7' : '#fee2e2', color: req.accounts_status === 'approved' ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
                              A: {req.accounts_status === 'approved' ? '✓' : '⏳'}
                            </span>
                            <span title="HOD" style={{ fontSize: '0.68rem', padding: '2px 5px', borderRadius: '3px', background: req.hod_status === 'approved' ? '#dcfce7' : '#fee2e2', color: req.hod_status === 'approved' ? '#15803d' : '#b91c1c', fontWeight: 700 }}>
                              D: {req.hod_status === 'approved' ? '✓' : '⏳'}
                            </span>
                          </div>
                        </td>

                        <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                          {timeAgo(req.created_at)}
                        </td>

                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            {isPending ? (
                              <>
                                <button
                                  onClick={() => {
                                    setActionModal({ request: req, actionType: 'approved' });
                                    setActionRemarks(hasOverdue ? 'Books returned and fine waived.' : 'Zero library dues on record. Clearance approved.');
                                  }}
                                  style={{
                                    background: '#16a34a',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '5px 10px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✓ Clear
                                </button>
                                <button
                                  onClick={() => {
                                    setActionModal({ request: req, actionType: 'rejected' });
                                    setActionRemarks(hasOverdue ? 'Overdue library book(s) pending return. Please settle fines.' : 'Library verification flagged.');
                                  }}
                                  style={{
                                    background: '#ef4444',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '5px 8px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  ✗ Flag
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setCertificateModal(req)}
                                style={{
                                  background: '#0b1d3a',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '5px 10px',
                                  fontSize: '0.76rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                📜 Certificate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: BOOK CATALOG & INVENTORY                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'catalog' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a', margin: 0 }}>
                📚 Central Library Catalog &amp; Physical Holdings
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                Search accession registers, check copy availability on shelves, and add new curriculum textbook volumes.
              </p>
            </div>

            <button className="gov-btn-primary" onClick={() => setAddBookModal(true)}>
              ➕ Add New Book Title
            </button>
          </div>

          {/* Search & Category Filter */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
            <select
              value={catalogCategory}
              onChange={e => setCatalogCategory(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}
            >
              <option value="all">All Academic Categories</option>
              <option value="Computer Science">Computer Science &amp; Engg</option>
              <option value="Electronics">Electronics &amp; Comm</option>
              <option value="Mathematics">Basic Sciences &amp; Maths</option>
              <option value="AI">AI &amp; Data Science</option>
            </select>

            <input
              type="text"
              placeholder="🔍 Search title, author, accession no, ISBN..."
              value={catalogSearch}
              onChange={e => setCatalogSearch(e.target.value)}
              style={{ flex: 1, minWidth: '240px', padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
            />
          </div>

          {/* Catalog Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>Accession No</th>
                  <th style={{ padding: '10px 12px' }}>Title &amp; Author</th>
                  <th style={{ padding: '10px 12px' }}>Category</th>
                  <th style={{ padding: '10px 12px' }}>Shelf Location</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Available / Total</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, fontFamily: 'monospace', color: '#0b1d3a' }}>
                      {b.accession_no}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 800, color: '#0b1d3a' }}>{b.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>By {b.author} • {b.edition || 'Latest Edition'}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                        {b.category}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#475569', fontWeight: 600, fontSize: '0.8rem' }}>
                      📍 {b.shelf_location || 'Main Stacks'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          color: b.available_copies > 0 ? '#16a34a' : '#dc2626',
                          background: b.available_copies > 0 ? '#f0fdf4' : '#fef2f2',
                          padding: '3px 10px',
                          borderRadius: '4px'
                        }}
                      >
                        {b.available_copies} / {b.total_copies} Copies
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        onClick={() => {
                          setIssueForm(prev => ({ ...prev, book_id: b.id }));
                          setIssueBookModal(true);
                        }}
                        disabled={b.available_copies <= 0}
                        style={{
                          background: b.available_copies > 0 ? '#1d4ed8' : '#cbd5e1',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: b.available_copies > 0 ? 'pointer' : 'not-allowed'
                        }}
                      >
                        Issue to Student
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: ACTIVE CIRCULATIONS & OVERDUES                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'circulations' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0b1d3a', margin: 0 }}>
                🔄 Active Book Borrowings, Returns &amp; Overdue Fines
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                Track student return deadlines, apply 1-click book returns, extend renewals, and manage overdue penalty collections.
              </p>
            </div>

            <button className="gov-btn-primary" onClick={() => setIssueBookModal(true)}>
              📖 Issue Another Book
            </button>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'Active', 'Overdue', 'Returned'].map(st => (
                <button
                  key={st}
                  onClick={() => setCirculationFilter(st)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: circulationFilter === st ? '#1d4ed8' : '#e2e8f0',
                    background: circulationFilter === st ? '#1d4ed8' : '#ffffff',
                    color: circulationFilter === st ? '#ffffff' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {st === 'all' ? 'All Borrowings' : st}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="🔍 Search title, student, accession no..."
              value={circulationSearch}
              onChange={e => setCirculationSearch(e.target.value)}
              style={{ marginLeft: 'auto', minWidth: '240px', padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
            />
          </div>

          {/* Circulations Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '10px 12px' }}>Accession No</th>
                  <th style={{ padding: '10px 12px' }}>Book Title</th>
                  <th style={{ padding: '10px 12px' }}>Issued Student</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Issue Date</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Due Date</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Fine Due</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCirculations.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 800, fontFamily: 'monospace', color: '#0b1d3a' }}>{c.accession_no}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0b1d3a' }}>{c.book_title}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 700 }}>{c.student_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>{c.enrollment_no}</div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>{c.issue_date}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: c.status === 'Overdue' ? '#dc2626' : '#1e293b' }}>
                      {c.due_date}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {c.fine_amount > 0 ? (
                        <span style={{ color: '#dc2626', fontWeight: 800 }}>₹{c.fine_amount}</span>
                      ) : (
                        <span style={{ color: '#16a34a', fontWeight: 700 }}>₹0</span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          background: c.status === 'Active' ? '#eff6ff' : c.status === 'Overdue' ? '#fef2f2' : '#f0fdf4',
                          color: c.status === 'Active' ? '#1d4ed8' : c.status === 'Overdue' ? '#dc2626' : '#16a34a'
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {c.status !== 'Returned' ? (
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleReturnBook(c)}
                            style={{
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Return Book
                          </button>
                          <button
                            onClick={() => handleRenewBook(c)}
                            style={{
                              background: '#0b1d3a',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Renew
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Returned on {c.return_date}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 1: VERIFY NO-DUES MODAL (APPROVE / REJECT)              */}
      {/* ───────────────────────────────────────────────────────────── */}
      {actionModal && (
        <div className="modal-overlay" onClick={() => setActionModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ color: actionModal.actionType === 'approved' ? '#16a34a' : '#dc2626' }}>
                {actionModal.actionType === 'approved' ? '✅ Grant Library No-Dues Clearance' : '⚠️ Flag / Reject Library Clearance'}
              </h3>
              <button className="modal-close" onClick={() => setActionModal(null)}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.84rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Student Name:</span>
                  <div style={{ fontWeight: 800, color: '#0b1d3a' }}>{actionModal.request.student_name}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Roll Number:</span>
                  <div style={{ fontWeight: 800, fontFamily: 'monospace' }}>{actionModal.request.enrollment_no}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Department:</span>
                  <div style={{ fontWeight: 700 }}>{actionModal.request.department_name}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Active Borrowings:</span>
                  <div style={{ fontWeight: 800, color: actionModal.request.active_borrowings_count > 0 ? '#dc2626' : '#16a34a' }}>
                    {actionModal.request.active_borrowings_count || 0} Books Pending
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                Official Library Clearance Remarks / Stamp
              </label>
              <textarea
                rows={3}
                value={actionRemarks}
                onChange={e => setActionRemarks(e.target.value)}
                placeholder="Enter remarks for student dossier..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="gov-btn-secondary" onClick={() => setActionModal(null)}>
                Cancel
              </button>
              <button
                onClick={handleProcessClearance}
                disabled={processing}
                style={{
                  background: actionModal.actionType === 'approved' ? '#16a34a' : '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '9px 18px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {processing ? 'Processing...' : actionModal.actionType === 'approved' ? 'Confirm Digital Clearance Stamp' : 'Confirm Flag & Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 2: INSPECT STUDENT BORROWINGS                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      {inspectModal && (
        <div className="modal-overlay" onClick={() => setInspectModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 className="modal-title">📖 Student Book Borrowing Dossier</h3>
              <button className="modal-close" onClick={() => setInspectModal(null)}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0b1d3a' }}>{inspectModal.student_name}</h4>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Roll: {inspectModal.enrollment_no} • {inspectModal.department_name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#fef2f2', color: '#dc2626', padding: '3px 8px', borderRadius: '4px' }}>
                    {inspectModal.overdue_books_count || 0} Overdue • ₹{inspectModal.total_library_fine || 0} Fine
                  </span>
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0b1d3a', marginBottom: '8px' }}>
              Currently Checked Out Books
            </h4>

            {(!inspectModal.borrowed_books || inspectModal.borrowed_books.length === 0) ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#16a34a', background: '#f0fdf4', borderRadius: '6px', fontWeight: 700 }}>
                ✓ Zero books currently checked out. Student is fully clear!
              </div>
            ) : (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                {inspectModal.borrowed_books.map((b, idx) => (
                  <div key={idx} style={{ padding: '12px', borderBottom: idx < inspectModal.borrowed_books.length - 1 ? '1px solid #e2e8f0' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0b1d3a' }}>{b.book_title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Acc No: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{b.accession_no}</span> • Due Date: <strong>{b.due_date}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, padding: '2px 7px', borderRadius: '3px', background: b.status === 'Overdue' ? '#fef2f2' : '#eff6ff', color: b.status === 'Overdue' ? '#dc2626' : '#1d4ed8' }}>
                        {b.status} {b.fine_amount > 0 && `(₹${b.fine_amount})`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="gov-btn-secondary" onClick={() => setInspectModal(null)}>
                Close Dossier
              </button>
              <button
                onClick={() => {
                  const req = inspectModal;
                  setInspectModal(null);
                  setActionModal({ request: req, actionType: 'approved' });
                  setActionRemarks('Zero library dues on record. Clearance approved.');
                }}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Proceed to Grant Clearance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 3: CERTIFICATE PREVIEW                                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      {certificateModal && (
        <div className="modal-overlay" onClick={() => setCertificateModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">📜 Digital Library No-Dues Certificate</h3>
              <button className="modal-close" onClick={() => setCertificateModal(null)}>✕</button>
            </div>

            <div style={{ border: '2px solid #0b1d3a', borderRadius: '8px', padding: '24px', background: '#ffffff', position: 'relative' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #0b1d3a', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                  <GECMLogo size={40} />
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.5px', color: '#64748b' }}>GOVERNMENT ENGINEERING COLLEGE MADHUBANI</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0b1d3a' }}>CENTRAL LIBRARY CLEARANCE CERTIFICATE</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Certificate No: GECM/LIB-ND/2026/{(certificateModal.enrollment_no || '001').slice(-4)}</div>
              </div>

              <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: '#1e293b', marginBottom: '16px' }}>
                This is to certify that student <strong>{certificateModal.student_name}</strong> bearing Enrollment Number <strong style={{ fontFamily: 'monospace' }}>{certificateModal.enrollment_no}</strong> from the Department of <strong>{certificateModal.department_name}</strong> has returned all issued books and holds <strong>NIL / ZERO</strong> outstanding library dues.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '6px', fontSize: '0.8rem', marginBottom: '16px' }}>
                <div><strong>Status:</strong> <span style={{ color: '#16a34a', fontWeight: 800 }}>VERIFIED CLEAR (APPROVED)</span></div>
                <div><strong>Verified By:</strong> {certificateModal.library_verified_by || 'Dr. Ramesh Kumar (Library Incharge)'}</div>
                <div><strong>Date Issued:</strong> {formatDate(certificateModal.library_verified_at || new Date())}</div>
                <div><strong>Digital Signature:</strong> <span style={{ fontFamily: 'monospace', color: '#0b1d3a', fontWeight: 700 }}>GECM-VERIFIED-OK</span></div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>This is an authenticated institutional e-clearance record generated from the SmartCampus ERP Portal.</span>
              </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="gov-btn-secondary" onClick={() => setCertificateModal(null)}>Close</button>
              <button className="gov-btn-primary" onClick={() => toast.success('Certificate sent to printer / PDF export')}>
                🖨️ Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 4: ADD BOOK MODAL                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {addBookModal && (
        <div className="modal-overlay" onClick={() => setAddBookModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3 className="modal-title">➕ Add New Title to Library Catalog</h3>
              <button className="modal-close" onClick={() => setAddBookModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddBook}>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Book Title *</label>
                  <input
                    type="text"
                    required
                    value={newBook.title}
                    onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="e.g. Operating System Concepts"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Author(s) *</label>
                  <input
                    type="text"
                    required
                    value={newBook.author}
                    onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="e.g. Silberschatz, Galvin & Gagne"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Academic Category</label>
                    <select
                      value={newBook.category}
                      onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Computer Science">Computer Science &amp; Engg</option>
                      <option value="Electronics & Communication">Electronics &amp; Comm</option>
                      <option value="Mechanical Engineering">Mechanical Engg</option>
                      <option value="Basic Sciences & Mathematics">Basic Sciences &amp; Maths</option>
                      <option value="AI & Data Science">AI &amp; Data Science</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Total Physical Copies</label>
                    <input
                      type="number"
                      min="1"
                      value={newBook.total_copies}
                      onChange={e => setNewBook({ ...newBook, total_copies: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Shelf / Rack Location</label>
                    <input
                      type="text"
                      value={newBook.shelf_location}
                      onChange={e => setNewBook({ ...newBook, shelf_location: e.target.value })}
                      placeholder="e.g. Rack CS-02"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Edition / Year</label>
                    <input
                      type="text"
                      value={newBook.edition}
                      onChange={e => setNewBook({ ...newBook, edition: e.target.value })}
                      placeholder="e.g. 10th Edition"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="gov-btn-secondary" onClick={() => setAddBookModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="gov-btn-primary" disabled={processing}>
                  {processing ? 'Adding...' : 'Save to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* MODAL 5: ISSUE BOOK MODAL                                     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {issueBookModal && (
        <div className="modal-overlay" onClick={() => setIssueBookModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 className="modal-title">📖 Issue Book to Student</h3>
              <button className="modal-close" onClick={() => setIssueBookModal(false)}>✕</button>
            </div>

            <form onSubmit={handleIssueBook}>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Select Book Title *</label>
                  <select
                    required
                    value={issueForm.book_id}
                    onChange={e => setIssueForm({ ...issueForm, book_id: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">-- Choose Book from Catalog --</option>
                    {books.map(b => (
                      <option key={b.id} value={b.id} disabled={b.available_copies <= 0}>
                        {b.accession_no}: {b.title} ({b.available_copies} available)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Student Roll Number *</label>
                  <input
                    type="text"
                    required
                    value={issueForm.enrollment_no}
                    onChange={e => setIssueForm({ ...issueForm, enrollment_no: e.target.value })}
                    placeholder="e.g. CSE2021001"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Student Name</label>
                    <input
                      type="text"
                      value={issueForm.student_name}
                      onChange={e => setIssueForm({ ...issueForm, student_name: e.target.value })}
                      placeholder="Student full name"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Loan Duration (Days)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={issueForm.due_days}
                      onChange={e => setIssueForm({ ...issueForm, due_days: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="gov-btn-secondary" onClick={() => setIssueBookModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="gov-btn-primary" disabled={processing}>
                  {processing ? 'Issuing...' : 'Confirm Book Issue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
