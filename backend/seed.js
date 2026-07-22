require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Internship = require('./models/Internship');
const Registration = require('./models/Registration');
const Quiz = require('./models/Quiz');
const QuizAttempt = require('./models/QuizAttempt');
const VideoLesson = require('./models/VideoLesson');
const VideoProgress = require('./models/VideoProgress');
const Notification = require('./models/Notification');

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
    await Quiz.deleteMany({});
    await QuizAttempt.deleteMany({});
    await VideoLesson.deleteMany({});
    await VideoProgress.deleteMany({});
    await Notification.deleteMany({});
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
        title: 'Full-Stack AI Engineer Intern',
        company: 'Google Cloud Division',
        companyLogo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200',
        description: 'Build enterprise cloud microservices, GraphQL APIs, and responsive React web applications integrating AI capabilities. Gain hands-on experience with Kubernetes, CI/CD pipelines, and high-concurrency Node.js architectures.',
        domain: 'Web Development',
        location: 'Bengaluru, India',
        workType: 'Hybrid',
        duration: '3 Months',
        stipend: '₹25,000 / month',
        skillsRequired: ['React', 'Node.js', 'MongoDB', 'Docker', 'REST APIs', 'OpenAI API'],
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
          { week: 8, title: 'AI Integration & Frontend Components', description: 'Connect React dashboard with AI endpoints and live WebSocket feeds.', deliverable: 'Staging Deployment URL', status: 'In Progress' },
          { week: 12, title: 'Final Production Deployment & Demo', description: 'Deploy application to cloud with automated test suite.', deliverable: 'Final Project Report', status: 'Pending' }
        ],
        mentors: [
          { name: 'Dr. Sarah Lin', role: 'Head of AI Research', company: 'Google Cloud', email: 'sarah.lin@techcorp.com', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
          { name: 'David K. Miller', role: 'Lead Architect', company: 'Cloud Scale Tech', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }
        ],
        createdById: adminUser._id
      },
      {
        title: 'Cyber Security Operations Analyst Intern',
        company: 'Cisco Systems India',
        companyLogo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200',
        description: 'Conduct penetration testing, vulnerability assessments, and SOC telemetry monitoring. Analyze network traffic, malware payloads, and audit security compliance standards.',
        domain: 'Cyber Security',
        location: 'Hyderabad, India',
        workType: 'On-site',
        duration: '4 Months',
        stipend: '₹20,000 / month',
        skillsRequired: ['Wireshark', 'Kali Linux', 'Network Pentesting', 'Python', 'SOC Operations'],
        totalPositions: 8,
        appliedCount: 6,
        startDate: new Date('2026-08-10'),
        endDate: new Date('2026-12-10'),
        deadline: new Date('2026-08-01'),
        status: 'Open',
        isFeatured: false,
        milestones: [
          { week: 2, title: 'Network Fundamentals & Tooling', description: 'Setup Kali Linux environment and master Wireshark basics.', deliverable: 'Network Analysis Report', status: 'Pending' },
          { week: 8, title: 'Vulnerability Assessment', description: 'Perform full vulnerability scan on simulated enterprise network.', deliverable: 'Vulnerability Report', status: 'Pending' }
        ],
        createdById: adminUser._id
      },
      {
        title: 'Cloud DevOps & Kubernetes Intern',
        company: 'AWS Cloud Center',
        companyLogo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200',
        description: 'Automate multi-region cloud deployments using Terraform, Helm charts, GitHub Actions, and Prometheus monitoring dashboards. Scale containerized applications effectively.',
        domain: 'Cloud & DevOps',
        location: 'Pune, India',
        workType: 'Hybrid',
        duration: '6 Months',
        stipend: '₹30,000 / month',
        skillsRequired: ['AWS', 'Terraform', 'Kubernetes', 'CI/CD', 'Linux Administration'],
        totalPositions: 10,
        appliedCount: 22,
        startDate: new Date('2026-08-15'),
        endDate: new Date('2027-02-15'),
        deadline: new Date('2026-08-05'),
        status: 'Open',
        isFeatured: true,
        milestones: [
          { week: 4, title: 'Infrastructure as Code setup', description: 'Write Terraform scripts for VPC and EC2 provisioning.', deliverable: 'Terraform Scripts', status: 'Pending' },
          { week: 12, title: 'Kubernetes Cluster Deployment', description: 'Deploy highly available EKS cluster and Helm charts.', deliverable: 'Cluster Architecture Diagram', status: 'Pending' }
        ],
        createdById: adminUser._id
      },
      {
        title: 'Data Science & Analytics Intern',
        company: 'Fractal Analytics',
        companyLogo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200',
        description: 'Analyze large datasets to extract actionable insights. Build predictive models using Python, Pandas, and Scikit-Learn. Create interactive Tableau/PowerBI dashboards.',
        domain: 'Data Science',
        location: 'Remote',
        workType: 'Remote',
        duration: '3 Months',
        stipend: '₹18,000 / month',
        skillsRequired: ['Python', 'SQL', 'Pandas', 'Tableau', 'Machine Learning Basics'],
        totalPositions: 20,
        appliedCount: 45,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-12-01'),
        deadline: new Date('2026-08-20'),
        status: 'Open',
        isFeatured: false,
        milestones: [
          { week: 2, title: 'Data Cleaning & Preprocessing', description: 'Clean and format messy datasets using Pandas.', deliverable: 'Cleaned Dataset & Jupyter Notebook', status: 'Pending' },
          { week: 6, title: 'Predictive Modeling', description: 'Train a regression model to predict sales trends.', deliverable: 'Model Performance Metrics', status: 'Pending' }
        ],
        createdById: adminUser._id
      },
      {
        title: 'UI/UX Product Design Intern',
        company: 'DesignStudio',
        companyLogo: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200',
        description: 'Create wireframes, high-fidelity prototypes, and design systems in Figma. Conduct user research and usability testing to iterate on product designs.',
        domain: 'UI/UX Design',
        location: 'Mumbai, India',
        workType: 'Hybrid',
        duration: '4 Months',
        stipend: '₹22,000 / month',
        skillsRequired: ['Figma', 'Wireframing', 'User Research', 'Prototyping', 'Adobe CC'],
        totalPositions: 5,
        appliedCount: 30,
        startDate: new Date('2026-09-15'),
        endDate: new Date('2027-01-15'),
        deadline: new Date('2026-09-01'),
        status: 'Open',
        isFeatured: true,
        milestones: [
          { week: 3, title: 'User Persona & Journey Mapping', description: 'Develop personas and user flows for a new app feature.', deliverable: 'User Research Report', status: 'Pending' },
          { week: 8, title: 'High-Fidelity Prototypes', description: 'Design complete interactive prototypes in Figma.', deliverable: 'Figma Prototype Link', status: 'Pending' }
        ],
        createdById: adminUser._id
      },
      {
        title: 'Embedded & IoT Firmware Engineer',
        company: 'Intel IoT Solutions',
        companyLogo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200',
        description: 'Develop low-level C/C++ firmware for ARM Cortex microcontrollers. Integrate IoT sensors via I2C/SPI and establish MQTT cloud connectivity for smart home devices.',
        domain: 'Embedded & IoT',
        location: 'Bengaluru, India',
        workType: 'On-site',
        duration: '6 Months',
        stipend: '₹28,000 / month',
        skillsRequired: ['C/C++', 'Microcontrollers', 'RTOS', 'SPI/I2C', 'MQTT'],
        totalPositions: 6,
        appliedCount: 15,
        startDate: new Date('2026-08-01'),
        endDate: new Date('2027-02-01'),
        deadline: new Date('2026-07-25'),
        status: 'Open',
        isFeatured: false,
        milestones: [
          { week: 4, title: 'Sensor Integration', description: 'Interface temperature and humidity sensors with ESP32.', deliverable: 'Sensor Driver Code', status: 'Pending' },
          { week: 10, title: 'Cloud Connectivity', description: 'Publish sensor data securely to AWS IoT Core via MQTT.', deliverable: 'IoT Dashboard Preview', status: 'Pending' }
        ],
        createdById: adminUser._id
      },
      {
        title: 'Machine Learning Research Intern',
        company: 'Meta AI Innovation Labs',
        companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
        description: 'Implement state-of-the-art transformer models, RAG architectures, and fine-tune open-weight LLMs for specialized domain knowledge bases.',
        domain: 'AI & Machine Learning',
        location: 'Remote',
        workType: 'Remote',
        duration: '6 Months',
        stipend: '₹35,000 / month',
        skillsRequired: ['Python', 'PyTorch', 'HuggingFace', 'LangChain', 'Vector DBs'],
        totalPositions: 10,
        appliedCount: 52,
        startDate: new Date('2026-08-15'),
        endDate: new Date('2027-02-15'),
        deadline: new Date('2026-08-05'),
        status: 'Open',
        isFeatured: true,
        milestones: [
          { week: 2, title: 'Data Cleaning & Vector Embedding', description: 'Preprocess dataset into Milvus vector store.', deliverable: 'Data Pipeline Script', status: 'Completed' },
          { week: 8, title: 'LoRA Fine-tuning & Benchmarking', description: 'Train Llama model with evaluation metrics.', deliverable: 'Model Benchmark Notebook', status: 'In Progress' }
        ],
        createdById: adminUser._id
      },
      {
        title: 'Mobile App Development Intern (Flutter)',
        company: 'Appify Solutions',
        companyLogo: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200',
        description: 'Design and develop cross-platform mobile applications using Flutter and Dart. Implement complex UI animations and integrate REST APIs and Firebase services.',
        domain: 'Software Engineering',
        location: 'Chennai, India',
        workType: 'Hybrid',
        duration: '3 Months',
        stipend: '₹15,000 / month',
        skillsRequired: ['Flutter', 'Dart', 'Firebase', 'REST API', 'UI/UX Design Basics'],
        totalPositions: 12,
        appliedCount: 40,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-12-01'),
        deadline: new Date('2026-08-25'),
        status: 'Open',
        isFeatured: false,
        milestones: [
          { week: 3, title: 'UI Implementation', description: 'Convert Figma designs into pixel-perfect Flutter screens.', deliverable: 'APK File', status: 'Pending' },
          { week: 7, title: 'API & Firebase Integration', description: 'Add user authentication and fetch live data.', deliverable: 'Source Code Repository', status: 'Pending' }
        ],
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

    // Seed sample Quizzes for Full-Stack AI Engineer Intern
    const quiz1 = await Quiz.create({
      internshipId: insertedInternships[0]._id,
      title: 'React & Node.js Microservices Checkpoint',
      description: 'Test your understanding of RESTful routing, Express middleware, and React state management.',
      moduleName: 'Week 1-2 Skill Checkpoint',
      durationMinutes: 10,
      passingScore: 70,
      xpReward: 150,
      questions: [
        {
          question: 'What is the primary role of middleware in Express.js?',
          options: [
            'To directly render HTML templates',
            'To execute functions with access to req, res, and next objects',
            'To store database records in memory',
            'To compress images automatically'
          ],
          correctAnswer: 1,
          explanation: 'Express middleware functions process request/response objects before passing control to the next middleware.'
        },
        {
          question: 'Which Hook in React is recommended for performing side-effects like API data fetching?',
          options: ['useMemo', 'useState', 'useEffect', 'useCallback'],
          correctAnswer: 2,
          explanation: 'useEffect is used for side-effects such as subscriptions, DOM mutations, and data fetching.'
        },
        {
          question: 'In REST API design, which HTTP method should be used for updating existing resource fields?',
          options: ['GET', 'POST', 'PATCH', 'DELETE'],
          correctAnswer: 2,
          explanation: 'PATCH is standard for partial updates of existing resources, whereas PUT is for full replacement.'
        }
      ],
      createdById: mentorUser._id
    });

    const quiz2 = await Quiz.create({
      internshipId: insertedInternships[0]._id,
      title: 'AI Model Integration & Vector Embeddings',
      description: 'Evaluate knowledge on RAG pipelines, OpenAI API integrations, and vector database retrieval.',
      moduleName: 'Week 4-5 Advanced Checkpoint',
      durationMinutes: 15,
      passingScore: 75,
      xpReward: 200,
      questions: [
        {
          question: 'What is the function of Vector Embeddings in AI applications?',
          options: [
            'To encrypt API keys securely',
            'To represent text/data as dense numerical vectors for semantic similarity search',
            'To compile TypeScript to WebAssembly',
            'To format JSON responses'
          ],
          correctAnswer: 1,
          explanation: 'Vector embeddings map text into high-dimensional space so semantic similarity can be computed via cosine distance.'
        },
        {
          question: 'What does RAG stand for in modern AI architecture?',
          options: [
            'Realtime API Gateway',
            'Retrieval-Augmented Generation',
            'Reactive Application Graph',
            'Random Algorithmic Generator'
          ],
          correctAnswer: 1,
          explanation: 'Retrieval-Augmented Generation enhances LLM prompts with relevant external documents retrieved from a database.'
        }
      ],
      createdById: mentorUser._id
    });

    // Seed sample Video Lessons for Full-Stack AI Engineer Intern
    await VideoLesson.create({
      internshipId: insertedInternships[0]._id,
      title: '1. Orientation & Architecture Overview',
      description: 'Get started with the DiGi Campus stack, setup guide, git workflow, and cloud architecture.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Sample video link
      thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600',
      duration: '12:45',
      moduleName: 'Module 1: Orientation',
      order: 1,
      createdById: mentorUser._id
    });

    await VideoLesson.create({
      internshipId: insertedInternships[0]._id,
      title: '2. Building Scalable Microservices with Node.js & Express',
      description: 'Deep dive into controller patterns, JWT authentication, rate limiting, and MongoDB indexing.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600',
      duration: '18:30',
      moduleName: 'Module 2: Microservices & DB',
      order: 2,
      createdById: mentorUser._id
    });

    await VideoLesson.create({
      internshipId: insertedInternships[0]._id,
      title: '3. Integrating AI & Vector Stores in Production',
      description: 'Learn how to connect LLMs, embed documents, and present AI responses in React.',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      duration: '22:15',
      moduleName: 'Module 3: AI Integration',
      order: 3,
      createdById: mentorUser._id
    });

    // Seed sample Notifications
    await Notification.create({
      userId: internUser._id,
      title: '🚀 Welcome to Full-Stack AI Engineer Internship!',
      message: 'Your application has been accepted. Access your weekly tasks, video lessons, and checkpoint quizzes.',
      type: 'application',
      link: `/event/${insertedInternships[0]._id}`,
      isRead: false
    });

    await Notification.create({
      userId: internUser._id,
      title: '📝 New Quiz Available: React & Node.js Checkpoint',
      message: 'Test your understanding and earn +150 XP towards your level progression.',
      type: 'quiz',
      link: `/event/${insertedInternships[0]._id}`,
      isRead: false
    });

    await Notification.create({
      userId: null, // Broadcast
      title: '📢 Institutional Announcement: Mid-Term Progress Audits',
      message: 'All interns are required to submit their weekly progress report by Friday 5:00 PM for institutional review.',
      type: 'announcement',
      link: '/admin',
      isRead: false
    });

    console.log('Seeded sample quizzes, video lessons, and notifications successfully.');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
}

seedData();

