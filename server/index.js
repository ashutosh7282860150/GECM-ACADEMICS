const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// MIDDLEWARE
// =============================================
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: true, // Allow all origins (localhost, Vercel deployments, mobile devices)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global API rate limiter (generous - prevents abuse but not normal use)
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }, // suppress proxy-header warning in dev
  message: { success: false, message: 'Too many requests, please try again later.' },
  skip: (req) => {
    if (req.method === 'OPTIONS') return true;
    // Skip global limit in development (login limiter still applies)
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  },
});
app.use('/api/', limiter);

// Strict brute-force limiter — ONLY for POST /api/auth/login
// Tracks by IP. 10 failed login attempts per 15 mins per IP.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count FAILED login attempts
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    message: 'Too many login attempts from this IP. Please wait 15 minutes before trying again.',
    retryAfter: 15
  },
  keyGenerator: (req) => ipKeyGenerator(req), // IPv4 + IPv6 safe per-IP tracking
});

// Lenient limiter for /me and /change-password (called frequently by the app)
const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // very generous — page refresh, tab focus, etc.
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: { success: false, message: 'Too many session requests. Please try again shortly.' },
  skip: (req) => req.method === 'OPTIONS',
});

// =============================================
// ROUTES
// =============================================
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const facultyRoutes = require('./routes/faculty');
const adminRoutes = require('./routes/admin');
const feeRoutes = require('./routes/fees');
const attendanceRoutes = require('./routes/attendance');
const examRoutes = require('./routes/exams');
const hostelRoutes = require('./routes/hostel');
const noDuesRoutes = require('./routes/nodues');
const gatePassRoutes = require('./routes/gatepass');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes = require('./routes/dashboard');
const workflowRoutes = require('./routes/workflow');
const applicationRoutes = require('./routes/applications');
const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth/login', loginLimiter);   // Strict brute-force on login only
app.use('/api/auth', sessionLimiter);        // Lenient for /me, /change-password, etc.
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/hostel', hostelRoutes);
app.use('/api/nodues', noDuesRoutes);
app.use('/api/gatepass', gatePassRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/applications', applicationRoutes);


// =============================================
// HEALTH CHECK
// =============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SmartCampus ERP API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// =============================================
// ERROR HANDLING
// =============================================
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// =============================================
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log('\n🚀 SmartCampus ERP Server Started');
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('─'.repeat(50));
  });
}

module.exports = app;
