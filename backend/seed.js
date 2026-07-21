require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Internship = require('./models/Internship');
const Registration = require('./models/Registration');

const MONGODB_URI = process.env.MONGODB_URI;

async function seedData() {
  try {
    if (!MONGODB_URI || MONGODB_URI.includes('<db_password>')) {
      console.log('⚠️ MongoDB URI contains placeholder <db_password>. Skipping automated database seed until real password is provided in backend/.env');
      return;
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas successfully.');

    // Clear existing data
    await User.deleteMany({});
    await Internship.deleteMany({});
    await Registration.deleteMany({});
    console.log('Cleared existing data.');

    // Create demo users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    const sankyaHash = await bcrypt.hash('Mr.sankya@123', salt);

    const internUser = await User.create({
      name: 'Alex Rivera',
      email: 'alex.rivera@digicampus.edu',
      password: passwordHash,
      role: 'intern',
      position: 'Web & AI Intern',
      department: 'Computer Science & AI',
      studentId: 'INT-2026-894',
      xpPoints: 850,
      level: 3,
      badges: ['💼 Verified Intern', '🚀 Full-Stack Architect', '🤖 AI Pioneer'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });

    const mentorUser = await User.create({
      name: 'Dr. Sarah Lin',
      email: 'sarah.lin@techcorp.com',
      password: passwordHash,
      role: 'company_mentor',
      position: 'Head of AI Research',
      company: 'Google Cloud & AI Labs',
      department: 'AI & Research Division',
      studentId: 'MNT-2026-042',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    });

    const adminUser = await User.create({
      name: 'Mr. Sankya',
      email: 'mr.sankya@digicampus.edu',
      password: sankyaHash,
      role: 'institution_admin',
      position: 'Dean of Industrial Training & Placement',
      department: 'School of Engineering & Administration',
      studentId: 'ADM-2026-001',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    // Alias for campuspulse email domain compatibility
    await User.create({
      name: 'Mr. Sankya',
      email: 'mr.sankya@campuspulse.edu',
      password: sankyaHash,
      role: 'institution_admin',
      position: 'Dean of Industrial Training & Placement',
      department: 'School of Engineering & Administration',
      studentId: 'ADM-2026-002',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    console.log('Demo Users Created:');
    console.log(' - Intern: alex.rivera@digicampus.edu / password123');
    console.log(' - Mentor: sarah.lin@techcorp.com / password123');
    console.log(' - Institution Admin: mr.sankya@digicampus.edu / Mr.sankya@123');

    // Create sample internships
    const sampleInternships = [
      {
        title: 'Full-Stack Web & Microservices Development Internship',
        company: 'Google Cloud Division',
        companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200',
        description: 'Build enterprise cloud microservices, GraphQL APIs, and responsive React web applications. Gain hands-on experience with Kubernetes, CI/CD pipelines, and high-concurrency Node.js architectures.',
        domain: 'Web Development',
        location: 'Bengaluru, India',
        workType: 'Hybrid',
        duration: '3 Months',
        stipend: '₹25,000 / month',
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'Docker', 'REST APIs'],
        totalPositions: 15,
        appliedCount: 12,
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-11-01'),
        deadline: new Date('2026-07-28'),
        status: 'Open',
        isFeatured: true,
        milestones: [
          { week: 1, title: 'Environment Setup & Codebase Onboarding', description: 'Configure dev tools, local containers, and submit initial PR.', deliverable: 'GitHub Repository Link', status: 'Completed' },
          { week: 4, title: 'Microservices & DB Schema Implementation', description: 'Design MongoDB schemas and build 4 core REST endpoints.', deliverable: 'Swagger API Documentation', status: 'Verified' },
          { week: 8, title: 'Frontend Component Integration & Testing', description: 'Connect React dashboard with live WebSocket feeds.', deliverable: 'Staging Deployment URL', status: 'In Progress' },
          { week: 12, title: 'Final Production Deployment & Demo', description: 'Deploy application to cloud with automated test suite.', deliverable: 'Final Project Report', status: 'Pending' }
        ],
        mentors: [
          { name: 'Dr. Sarah Lin', role: 'Head of AI Research', company: 'Google Cloud', email: 'sarah.lin@techcorp.com', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
          { name: 'David K. Miller', role: 'Lead Architect', company: 'Cloud Scale Tech', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
        ],
        createdById: adminUser._id
      },
      {
        title: 'Generative AI & LLM Fine-Tuning Internship',
        company: 'Meta AI Innovation Labs',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
        description: 'Implement state-of-the-art transformer models, RAG (Retrieval-Augmented Generation) architectures, and fine-tune open-weight LLMs for specialized domain knowledge bases.',
        domain: 'AI & Machine Learning',
        location: 'Remote / Online',
        workType: 'Remote',
        duration: '6 Months',
        stipend: '₹35,000 / month',
        skillsRequired: ['Python', 'PyTorch', 'HuggingFace', 'LangChain', 'Vector DBs'],
        totalPositions: 10,
        appliedCount: 8,
        startDate: new Date('2026-08-15'),
        endDate: new Date('2026-02-15'),
        deadline: new Date('2026-08-05'),
        status: 'Open',
        isFeatured: true,
        milestones: [
          { week: 2, title: 'Data Cleaning & Vector Embedding Ingestion', description: 'Preprocess dataset into Milvus vector store.', deliverable: 'Data Pipeline Script', status: 'Completed' },
          { week: 8, title: 'LoRA Fine-tuning & Benchmarking', description: 'Train Llama model with evaluation metrics.', deliverable: 'Model Benchmark Notebook', status: 'In Progress' }
        ],
        createdById: adminUser._id
      },
      {
        title: 'Cyber Security & Ethical Hacking Trainee',
        company: 'Cisco Systems India',
        companyLogo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200',
        description: 'Conduct penetration testing, vulnerability assessments, and SOC telemetry monitoring. Analyze network traffic, malware payloads, and audit security compliance standards.',
        domain: 'Cyber Security',
        location: 'Hyderabad, India',
        workType: 'On-site',
        duration: '3 Months',
        stipend: '₹20,000 / month',
        skillsRequired: ['Wireshark', 'Kali Linux', 'Network Pentesting', 'Python', 'SOC Operations'],
        totalPositions: 8,
        appliedCount: 6,
        startDate: new Date('2026-08-10'),
        endDate: new Date('2026-11-10'),
        deadline: new Date('2026-08-01'),
        status: 'Open',
        isFeatured: false,
        createdById: adminUser._id
      },
      {
        title: 'Cloud DevOps & Infrastructure Automation',
        company: 'AWS Cloud Center',
        companyLogo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200',
        description: 'Automate multi-region cloud deployments using Terraform, Helm charts, GitHub Actions, and Prometheus monitoring dashboards.',
        domain: 'Cloud & DevOps',
        location: 'Pune, India',
        workType: 'Hybrid',
        duration: '4 Months',
        stipend: '₹22,000 / month',
        skillsRequired: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD', 'Linux Administration'],
        totalPositions: 12,
        appliedCount: 10,
        startDate: new Date('2026-08-20'),
        endDate: new Date('2026-12-20'),
        deadline: new Date('2026-08-10'),
        status: 'Open',
        isFeatured: false,
        createdById: adminUser._id
      }
    ];

    const insertedInternships = await Internship.insertMany(sampleInternships);
    console.log(`Successfully seeded ${insertedInternships.length} initial internships.`);

    // Seed demo application for Alex Rivera
    const demoVerificationCode = 'INT-782910';
    await Registration.create({
      internshipId: insertedInternships[0]._id,
      eventId: insertedInternships[0]._id,
      userId: internUser._id,
      ticketCode: demoVerificationCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${demoVerificationCode}`,
      status: 'Ongoing',
      progress: 65,
      hoursLogged: 84,
      attendanceStatus: 'Verified',
      checkIns: [
        { date: new Date('2026-08-02'), taskSummary: 'Environment Setup & Docker Compose Stack', verifiedBy: 'Dr. Sarah Lin', status: 'Verified' },
        { date: new Date('2026-08-09'), taskSummary: 'MongoDB Atlas Schema & Indexing', verifiedBy: 'Dr. Sarah Lin', status: 'Verified' },
        { date: new Date('2026-08-16'), taskSummary: 'REST API Authentication & JWT Security', verifiedBy: 'Dr. Sarah Lin', status: 'Verified' }
      ],
      progressReports: [
        { title: 'Week 1 - Project Setup & Architecture', description: 'Configured TypeScript, Docker, and Express boilerplate', hoursLogged: 24, status: 'Approved', mentorFeedback: 'Outstanding code structure and documentation!', score: 95 },
        { title: 'Week 2 - Database Models & Endpoints', description: 'Implemented MongoDB Schemas and CRUD controllers', hoursLogged: 30, status: 'Approved', mentorFeedback: 'Clean implementation of mongoose middleware.', score: 92 }
      ],
      certificateIssued: false,
      mentorRating: 5,
      mentorFeedback: 'Alex demonstrates exceptional technical initiative, clean architectural principles, and strong problem-solving skills.'
    });

    console.log('Seeded demo internship application and progress records for Alex Rivera.');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedData();
