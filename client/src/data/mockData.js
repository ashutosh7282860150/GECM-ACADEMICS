// Centralized institutional mock data for GECM ACADEMICS

export const NOTICES_DATA = [
  {
    id: 1,
    date: '27 SEP 2026',
    title: 'B.Tech 7th Semester Mid-Term Examination Schedule Released',
    dept: 'Examination Cell',
    category: 'Exam',
    shortDesc: 'The mid-term examination for B.Tech 7th Semester students will commence from 10th October 2026.',
    details: 'The mid-term examination for B.Tech 7th Semester students will commence from 10th October 2026. Students are requested to download hall tickets from the student dashboard after clearing all pending mess and tuition dues. Practical examinations will follow theory assessments.',
    fileUrl: '#'
  },
  {
    id: 2,
    date: '25 SEP 2026',
    title: 'Hostel Fee Payment & No-Dues Clearance Deadline Notice',
    dept: 'Accounts & Hostel Cell',
    category: 'Accounts',
    shortDesc: 'All hostellers must complete mess fee payments and online digital No-Dues clearance before 5th October 2026.',
    details: 'All hostellers must complete mess fee payments and online digital No-Dues clearance before 5th October 2026 to avoid penalty charges. Clearance certificates can be generated directly from the student portal once approved by warden and accounts cell.',
    fileUrl: '#'
  },
  {
    id: 3,
    date: '22 SEP 2026',
    title: 'Registration for Campus Recruitment Drive 2026 (TCS / Infosys)',
    dept: 'Training & Placement',
    category: 'Placement',
    shortDesc: 'Training & Placement Cell invites applications for TCS NQT and Infosys Campus Drive 2026.',
    details: 'Training & Placement Cell invites applications for TCS NQT and Infosys Campus Drive 2026. Eligible branches: CSE, ECE, Civil (2027 Passing batch). Minimum criteria: 6.5 CGPA with no active backlogs. Register via student portal before 30th September.',
    fileUrl: '#'
  },
  {
    id: 4,
    date: '20 SEP 2026',
    title: 'Circular regarding Mandatory 75% Attendance Requirement for End-Sem Exams',
    dept: 'Academic Affairs',
    category: 'Academic',
    shortDesc: 'Students falling short of 75% overall attendance will not be permitted to appear for end-semester exams.',
    details: 'As per AICTE & University norms, students falling short of 75% overall attendance in individual theory and practical subjects will be debarred from end-semester examinations. Check your current subject-wise attendance on the student dashboard.',
    fileUrl: '#'
  },
  {
    id: 5,
    date: '18 SEP 2026',
    title: 'National Conference on Recent Advances in Engineering (NCRAE-2026)',
    dept: 'R&D Cell',
    category: 'Event',
    shortDesc: 'GECM Madhubani is hosting NCRAE-2026 on 15-16 November 2026. Paper submissions are open.',
    details: 'GECM Madhubani is hosting NCRAE-2026 on 15-16 November 2026. Paper submissions are open for faculty members, research scholars, and undergraduate students in CSE, ECE, and Civil streams. Accepted papers will be indexed in IEEE Xplore / Scopus.',
    fileUrl: '#'
  }
];

export const SERVICES_DATA = [
  { id: 'profile', icon: '👤', title: 'Student Profile', desc: 'Personal & Academic Bio', route: '/student/profile', role: 'student' },
  { id: 'course-reg', icon: '📑', title: 'Course Registration', desc: 'Semester Subjects Enrollment', route: '/student/course-registration', role: 'student' },
  { id: 'attendance', icon: '📊', title: 'Attendance', desc: 'Course Attendance Monitoring', route: '/student/attendance', role: 'student' },
  { id: 'examination', icon: '📝', title: 'Examination', desc: 'Exam Schedules & Hall Tickets', route: '/student/examination', role: 'student' },
  { id: 'results', icon: '🏆', title: 'Results', desc: 'SGPA / CGPA Grade Sheet', route: '/student/results', role: 'student' },
  { id: 'timetable', icon: '📅', title: 'Time Table', desc: 'Class & Exam Schedules', route: '/student/timetable', role: 'student' },
  { id: 'calendar', icon: '🗓️', title: 'Academic Calendar', desc: 'Semester Event Timetable', route: '/academics', role: 'all' },
  { id: 'notices', icon: '📢', title: 'Notices', desc: 'Official Circulars & Orders', route: '/notices', role: 'all' },
  { id: 'assignments', icon: '📚', title: 'Assignments', desc: 'Digital Submissions & Notes', route: '/student/assignments', role: 'student' },
  { id: 'faculty-dir', icon: '👨‍🏫', title: 'Faculty Directory', desc: 'Professors & Mentors', route: '/departments', role: 'all' },
  { id: 'dept-info', icon: '🏛️', title: 'Department Info', desc: 'CSE, ECE & Civil Programs', route: '/departments', role: 'all' },
  { id: 'certificates', icon: '📜', title: 'Certificates & No-Dues', desc: 'Bonafide & Clearance', route: '/student/no-dues', role: 'student' }
];

export const DEPARTMENTS_DATA = {
  cse: {
    id: 'cse',
    code: 'CSE',
    name: 'Computer Science & Engineering',
    fullName: 'Department of Computer Science & Engineering',
    intake: 60,
    established: '2019',
    overview: 'The Department of Computer Science & Engineering at GECM Madhubani prepares students with foundational computation theory, advanced software engineering, AI/ML, cloud computing, and cyber security through rigorous curricula and practical lab environments.',
    hod: {
      name: 'Dr. Vikram Singh',
      designation: 'Head of Department & Associate Professor',
      qualification: 'Ph.D. in Computer Science (IIT Patna), M.Tech (NIT Trichy)',
      email: 'hod.cse@smartcampus.edu',
      phone: '+91 6272 234101',
      experience: '14+ Years Academic & Research'
    },
    faculty: [
      { name: 'Dr. Vikram Singh', role: 'Associate Professor & HOD', spec: 'Distributed Systems & Cloud Computing' },
      { name: 'Prof. Anjali Roy', role: 'Assistant Professor', spec: 'Artificial Intelligence & Data Mining' },
      { name: 'Prof. Rajesh Kumar', role: 'Assistant Professor', spec: 'Network Security & Cryptography' },
      { name: 'Prof. Sneha Kumari', role: 'Assistant Professor', spec: 'Web Technologies & Software Eng.' }
    ],
    laboratories: [
      { name: 'Advanced Computing & AI Lab', pcs: 45, os: 'Ubuntu 22.04 LTS / GPU Workstations' },
      { name: 'Software Development Lab', pcs: 40, os: 'Windows 11 Pro / Visual Studio & Java' },
      { name: 'Database & Cloud Lab', pcs: 35, os: 'PostgreSQL, Docker & AWS Cloud Workbench' },
      { name: 'Network & Security Lab', pcs: 30, os: 'Cisco Packet Tracer, Wireshark & Kali Linux' }
    ],
    courses: [
      { code: 'PCC-CS501', name: 'Database Management Systems', credits: 4, sem: '5th' },
      { code: 'PCC-CS502', name: 'Design and Analysis of Algorithms', credits: 4, sem: '5th' },
      { code: 'PCC-CS701', name: 'Artificial Intelligence & Machine Learning', credits: 3, sem: '7th' },
      { code: 'PCC-CS702', name: 'Cloud Computing Architecture', credits: 3, sem: '7th' }
    ],
    timetable: [
      { time: '09:30 AM - 10:30 AM', subject: 'Machine Learning (CS701)', room: 'Room 204 (LH-1)' },
      { time: '10:30 AM - 11:30 AM', subject: 'Cloud Computing (CS702)', room: 'Room 204 (LH-1)' },
      { time: '11:45 AM - 01:45 PM', subject: 'AI & Data Science Lab', room: 'Computing Lab 1' },
      { time: '02:30 PM - 03:30 PM', subject: 'Cyber Security (Elective)', room: 'Room 202' }
    ],
    notices: [
      'CSE Major Project Phase-1 Synopsis Submission deadline: 15 Oct 2026',
      'Hackathon 2026 registration open for CSE 3rd and 4th year students',
      'Special Workshop on Generative AI & LLM Deployment scheduled for 24 Oct 2026'
    ]
  },
  ece: {
    id: 'ece',
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    fullName: 'Department of Electronics & Communication Engineering',
    intake: 60,
    established: '2019',
    overview: 'The Department of Electronics and Communication Engineering equips students with deep domain expertise across semiconductor devices, VLSI design, digital signal processing, embedded IoT systems, and RF/Microwave communications.',
    hod: {
      name: 'Dr. Amitav Mishra',
      designation: 'Head of Department & Associate Professor',
      qualification: 'Ph.D. in VLSI Systems (IIT BHU), M.Tech (IIIT Allahabad)',
      email: 'hod.ece@smartcampus.edu',
      phone: '+91 6272 234102',
      experience: '12+ Years'
    },
    faculty: [
      { name: 'Dr. Amitav Mishra', role: 'Associate Professor & HOD', spec: 'VLSI & Low-Power SoC' },
      { name: 'Prof. Neha Jha', role: 'Assistant Professor', spec: 'Digital Signal Processing & Wireless Comms' },
      { name: 'Prof. Alok Prasad', role: 'Assistant Professor', spec: 'Embedded Systems & IoT' }
    ],
    laboratories: [
      { name: 'VLSI & Cadence Design Lab', pcs: 35, os: 'Cadence Virtuoso, MATLAB & Xilinx FPGA' },
      { name: 'Analog & Digital Communication Lab', pcs: 30, os: 'DSO, Spectrum Analyzers & Signal Gens' },
      { name: 'Microprocessor & Microcontroller Lab', pcs: 30, os: 'ARM Cortex, 8051 & Arduino/ESP32 kits' }
    ],
    courses: [
      { code: 'PCC-EC501', name: 'Digital Signal Processing', credits: 4, sem: '5th' },
      { code: 'PCC-EC502', name: 'Electromagnetic Waves & Transmission Lines', credits: 3, sem: '5th' },
      { code: 'PCC-EC701', name: 'VLSI Design & Embedded Systems', credits: 4, sem: '7th' }
    ],
    timetable: [
      { time: '09:30 AM - 10:30 AM', subject: 'VLSI Design (EC701)', room: 'Room 301' },
      { time: '10:30 AM - 11:30 AM', subject: 'Digital Communication', room: 'Room 301' },
      { time: '11:45 AM - 01:45 PM', subject: 'DSP & FPGA Lab', room: 'VLSI Lab' }
    ],
    notices: [
      'Submission of ECE 5th Sem Microcontroller mini-projects due 12 Oct 2026',
      'Industrial visit to BSNL Telecom Training Centre on 28 Oct 2026'
    ]
  },
  civil: {
    id: 'civil',
    code: 'CIVIL',
    name: 'Civil Engineering',
    fullName: 'Department of Civil Engineering',
    intake: 60,
    established: '2019',
    overview: 'The Department of Civil Engineering trains future infrastructure leaders in structural engineering, geotechnical analysis, transportation systems, hydrology, and sustainable green construction technologies.',
    hod: {
      name: 'Dr. R. K. Choudhary',
      designation: 'Head of Department & Professor',
      qualification: 'Ph.D. in Structural Engineering (IIT Roorkee), M.E. (BITS Pilani)',
      email: 'hod.civil@smartcampus.edu',
      phone: '+91 6272 234103',
      experience: '18+ Years'
    },
    faculty: [
      { name: 'Dr. R. K. Choudhary', role: 'Professor & HOD', spec: 'Earthquake Resistant Structures & Concrete' },
      { name: 'Prof. Manish Verma', role: 'Assistant Professor', spec: 'Geotechnical & Foundation Engineering' },
      { name: 'Prof. Kavita Kumari', role: 'Assistant Professor', spec: 'Hydraulics & Water Resource Eng.' }
    ],
    laboratories: [
      { name: 'Strength of Materials & Concrete Lab', pcs: 10, os: 'UTM 1000kN, Compression Testing' },
      { name: 'Surveying & Total Station Lab', pcs: 15, os: 'Digital Theodolite, Total Station & GPS' },
      { name: 'Geotechnical & Soil Mechanics Lab', pcs: 12, os: 'Triaxial Shear & Direct Shear Equipment' }
    ],
    courses: [
      { code: 'PCC-CE501', name: 'Structural Analysis-II', credits: 4, sem: '5th' },
      { code: 'PCC-CE502', name: 'Geotechnical Engineering-I', credits: 4, sem: '5th' },
      { code: 'PCC-CE701', name: 'Design of Reinforced Concrete Structures', credits: 4, sem: '7th' }
    ],
    timetable: [
      { time: '09:30 AM - 10:30 AM', subject: 'Design of Concrete Structures', room: 'Room 102' },
      { time: '10:30 AM - 11:30 AM', subject: 'Environmental Engineering', room: 'Room 102' },
      { time: '11:45 AM - 01:45 PM', subject: 'Soil Mechanics & Geotech Lab', room: 'Soil Lab' }
    ],
    notices: [
      'Survey Camp field schedule for Civil 6th Semester: 20-26 Oct 2026',
      'Structural design software AutoCAD & STAAD.Pro hands-on session on Saturday'
    ]
  }
};
