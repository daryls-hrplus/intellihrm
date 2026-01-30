// Learning & Development Administrator Manual - Structure Definition
// Comprehensive documentation for 62+ database tables, 28 UI pages
// Following industry standards: Workday Learning, SAP SuccessFactors, Cornerstone

export interface SectionGroup {
  code: string;      // 'A', 'B', 'C', 'D', 'E', 'F'
  title: string;     // 'Compliance Program Framework'
  range: string;     // '5.1-5.3'
}

export interface LndSection {
  id: string;
  sectionNumber: string;
  title: string;
  description: string;
  contentLevel: 'overview' | 'concept' | 'procedure' | 'reference';
  estimatedReadTime: number;
  targetRoles: ('Admin' | 'Consultant' | 'HR Partner' | 'Manager' | 'Employee' | 'L&D Admin' | 'Training Staff' | 'Compliance Officer' | 'HSE Officer' | 'Executive')[];
  legacyReference?: string;
  industryContext?: {
    frequency?: string;
    timing?: string;
    benchmark?: string;
  };
  sectionGroup?: SectionGroup;
  subsections?: LndSection[];
}

export interface LndGlossaryTerm {
  term: string;
  definition: string;
  category: 'Core' | 'LMS' | 'Compliance' | 'Agency' | 'Workflow' | 'Analytics' | 'Integration' | 'AI' | 'Configuration' | 'Troubleshooting';
}

// =============================================================================
// MANUAL STRUCTURE - 9 Chapters Following Industry Implementation Sequence
// =============================================================================

export const LND_MANUAL_STRUCTURE: LndSection[] = [
  // ==========================================================================
  // CHAPTER 1: MODULE OVERVIEW & CONCEPTUAL FOUNDATION (~70 min)
  // ==========================================================================
  {
    id: 'chapter-1',
    sectionNumber: '1',
    title: 'Module Overview & Conceptual Foundation',
    description: 'Introduction to Learning & Development, business value, core concepts, persona journeys, and complete data architecture covering 62+ database tables.',
    contentLevel: 'overview',
    estimatedReadTime: 70,
    targetRoles: ['Admin', 'Consultant', 'HR Partner', 'L&D Admin'],
    subsections: [
      {
        id: 'sec-1-1',
        sectionNumber: '1.1',
        title: 'Introduction to Learning & Development',
        description: 'Executive summary, strategic value proposition, document scope, learning objectives, and document conventions',
        contentLevel: 'overview',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant', 'HR Partner', 'L&D Admin'],
        legacyReference: 'Overview of the Training Module',
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Organizations with structured L&D programs see 24% higher profit margins (ATD)'
        }
      },
      {
        id: 'sec-1-2',
        sectionNumber: '1.2',
        title: 'Core Concepts & Terminology',
        description: 'Course, Module, Lesson, Enrollment, Learning Path, SCORM/xAPI, Competency Mapping, and 60+ key terms',
        contentLevel: 'concept',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant', 'HR Partner', 'L&D Admin'],
        legacyReference: 'Glossary of Training Terms (A-Z)',
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Industry-standard LMS terminology alignment'
        }
      },
      {
        id: 'sec-1-3',
        sectionNumber: '1.3',
        title: 'User Personas & Journeys',
        description: 'Employee, Manager, L&D Admin, HR Partner, Executive, and Training Staff persona journeys with step-by-step workflows',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant'],
        legacyReference: 'A Guide to Using the Training Module',
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Role-based access control (RBAC) patterns'
        }
      },
      {
        id: 'sec-1-4',
        sectionNumber: '1.4',
        title: 'System Architecture',
        description: 'Entity relationship diagram, 62 table specifications across 9 domains with key fields and relationships',
        contentLevel: 'reference',
        estimatedReadTime: 18,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Enterprise-grade data model following industry patterns'
        }
      },
      {
        id: 'sec-1-5',
        sectionNumber: '1.5',
        title: 'L&D Calendar & Planning Cycle',
        description: 'Annual training planning, quarterly reviews, compliance deadlines, and seasonal patterns',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner', 'L&D Admin'],
        legacyReference: 'Training Calendar',
        industryContext: {
          frequency: 'Quarterly',
          timing: 'Ongoing',
          benchmark: 'Annual training needs analysis cycle'
        }
      },
      {
        id: 'sec-1-6',
        sectionNumber: '1.6',
        title: 'Legacy Migration Guide',
        description: 'Mapping HRplus Training concepts to Intelli HRM L&D module, field mappings, and data migration considerations',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        legacyReference: 'Training Module Updates'
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 2: SETUP & CONFIGURATION GUIDE (~100 min)
  // ==========================================================================
  {
    id: 'chapter-2',
    sectionNumber: '2',
    title: 'Setup & Configuration Guide',
    description: 'Complete setup guide including prerequisites, categories, courses, quizzes, learning paths, compliance rules, and SCORM configuration.',
    contentLevel: 'procedure',
    estimatedReadTime: 100,
    targetRoles: ['Admin', 'Consultant', 'L&D Admin'],
    subsections: [
      {
        id: 'sec-2-1',
        sectionNumber: '2.1',
        title: 'Prerequisites & Implementation Sequence',
        description: 'Required configurations from Workforce, Performance, and Competency modules before L&D setup',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time',
          timing: 'Pre-implementation',
          benchmark: 'Job architecture, competency framework must be in place'
        }
      },
      {
        id: 'sec-2-2',
        sectionNumber: '2.2',
        title: 'Course Categories Setup',
        description: 'Create logical groupings for training content (Compliance, Technical, Leadership, Soft Skills)',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-3',
        sectionNumber: '2.3',
        title: 'Course Creation & Structure',
        description: 'Course → Module → Lesson hierarchy, content types, duration estimates, thumbnails, and prerequisites',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-4',
        sectionNumber: '2.4',
        title: 'Modules & Lessons',
        description: 'Course → Module → Lesson hierarchy and content structure',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-5',
        sectionNumber: '2.5',
        title: 'Quiz Configuration',
        description: 'Question types, passing scores, time limits, retake policies',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-6',
        sectionNumber: '2.6',
        title: 'Learning Paths',
        description: 'Structured learning journeys, prerequisite courses, milestones',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-7',
        sectionNumber: '2.7',
        title: 'Competency Mapping',
        description: 'Link courses to skills and competencies for gap-based recommendations',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-8',
        sectionNumber: '2.8',
        title: 'Compliance Training Rules',
        description: 'Mandatory training configuration, recertification periods',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-9',
        sectionNumber: '2.9',
        title: 'Instructors',
        description: 'Internal and external instructor profiles, qualifications',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-10',
        sectionNumber: '2.10',
        title: 'Training Budgets',
        description: 'Department and company training budgets, spending thresholds',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin']
      },
      {
        id: 'sec-2-11',
        sectionNumber: '2.11',
        title: 'Training Evaluations',
        description: 'Kirkpatrick evaluation levels, feedback collection, surveys',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-12',
        sectionNumber: '2.12',
        title: 'Badges & Gamification',
        description: 'Achievement badges, points, leaderboards, learner engagement',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-13',
        sectionNumber: '2.13',
        title: 'SCORM/xAPI Integration',
        description: 'Import eLearning packages, tracking settings, completion criteria',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant']
      },
      {
        id: 'sec-2-14',
        sectionNumber: '2.14',
        title: 'Certificate Templates',
        description: 'Design certificate templates with dynamic fields and expiry',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-15',
        sectionNumber: '2.15',
        title: 'Training Requests Configuration',
        description: 'Request types, approval workflows, source integrations',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-2-16',
        sectionNumber: '2.16',
        title: 'Company L&D Settings',
        description: 'Company-specific L&D configuration and defaults',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin']
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 3: EXTERNAL TRAINING & VENDOR MANAGEMENT (~120 min)
  // ==========================================================================
  {
    id: 'chapter-3',
    sectionNumber: '3',
    title: 'External Training & Vendor Management',
    description: 'Enterprise vendor lifecycle management including selection, onboarding, course catalogs, session scheduling, cost tracking, performance reviews, and multi-company sharing.',
    contentLevel: 'procedure',
    estimatedReadTime: 120,
    targetRoles: ['Admin', 'L&D Admin', 'HR Partner'],
    subsections: [
      {
        id: 'sec-3-1',
        sectionNumber: '3.1',
        title: 'External Training & Vendor Concepts',
        description: 'Vendor lifecycle methodology, tier classification, and data model overview',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin'],
        industryContext: { benchmark: 'Workday vendor lifecycle methodology' }
      },
      {
        id: 'sec-3-2',
        sectionNumber: '3.2',
        title: 'Vendor Registry & Classification',
        description: 'Create vendor profiles with tiered classification (Strategic/Operational/Transactional)',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-3-3',
        sectionNumber: '3.3',
        title: 'Vendor Selection & Onboarding',
        description: 'Selection criteria, weighted scoring, due diligence, and contract setup',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-3-4',
        sectionNumber: '3.4',
        title: 'Vendor Course Catalog',
        description: 'Configure vendor courses with delivery methods, certifications, and prerequisites',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-3-5',
        sectionNumber: '3.5',
        title: 'Session Scheduling & Capacity',
        description: 'Schedule sessions with capacity limits, waitlists, and registration deadlines',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-3-6',
        sectionNumber: '3.6',
        title: 'Cost Management & Budgets',
        description: 'Configure itemized costs, multi-currency pricing, budget integration, and volume discounts',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin']
      },
      {
        id: 'sec-3-7',
        sectionNumber: '3.7',
        title: 'Training Request Workflow',
        description: 'Request lifecycle, approval chains, approval tracking, and source-based request types',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin', 'HR Partner']
      },
      {
        id: 'sec-3-8',
        sectionNumber: '3.8',
        title: 'External Training Records',
        description: 'Record completed external training with certificates and skills acquired',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-3-9',
        sectionNumber: '3.9',
        title: 'Vendor Performance Management',
        description: 'Reviews, scorecards, KPIs, learner feedback integration, and improvement tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-3-10',
        sectionNumber: '3.10',
        title: 'Certifications & Credentials',
        description: 'External certification tracking, expiry management, verification, and renewal workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-3-11',
        sectionNumber: '3.11',
        title: 'Multi-Company Vendor Sharing',
        description: 'Group-level vendor relationships, volume discount tracking, and cross-company enrollment',
        contentLevel: 'procedure',
        estimatedReadTime: 7,
        targetRoles: ['Admin']
      },
      {
        id: 'sec-3-12',
        sectionNumber: '3.12',
        title: 'Integration with Training Needs',
        description: 'Gap-based vendor recommendations, AI-powered course matching, and competency mapping',
        contentLevel: 'procedure',
        estimatedReadTime: 7,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-3-13',
        sectionNumber: '3.13',
        title: 'External Instructors',
        description: 'Manage external training instructors, specializations, rates, and performance',
        contentLevel: 'procedure',
        estimatedReadTime: 7,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-3-14',
        sectionNumber: '3.14',
        title: 'Session Enrollments & Waitlists',
        description: 'Employee enrollment tracking, waitlist management, and attendance',
        contentLevel: 'procedure',
        estimatedReadTime: 7,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-3-15',
        sectionNumber: '3.15',
        title: 'Vendor Contacts Management',
        description: 'Multiple contact types, escalation paths, and communication',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-3-16',
        sectionNumber: '3.16',
        title: 'Vendor Offboarding',
        description: 'Contract termination, data retention, and transition planning',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'L&D Admin']
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 4: OPERATIONAL WORKFLOWS (~120 min) - ADDIE-Aligned Structure
  // ==========================================================================
  {
    id: 'chapter-4',
    sectionNumber: '4',
    title: 'Operational Workflows',
    description: 'Complete learner journey, training request lifecycle, session delivery, and records management following ADDIE framework.',
    contentLevel: 'procedure',
    estimatedReadTime: 120,
    targetRoles: ['Admin', 'L&D Admin', 'HR Partner', 'Manager', 'Employee'],
    subsections: [
      // SECTION A: COURSE DELIVERY LIFECYCLE (4.1-4.6)
      {
        id: 'sec-4-1',
        sectionNumber: '4.1',
        title: 'Learner Journey Overview',
        description: 'End-to-end learner experience from course discovery through certification',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin', 'Employee'],
        sectionGroup: { code: 'A', title: 'Course Delivery Lifecycle', range: '4.1-4.6' },
        industryContext: {
          benchmark: 'Workday Learning Discover-Learn-Apply framework'
        }
      },
      {
        id: 'sec-4-2',
        sectionNumber: '4.2',
        title: 'Enrollment Management',
        description: 'Self-enrollment, manager assignment, bulk enrollment, and waitlist handling',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin', 'HR Partner'],
        sectionGroup: { code: 'A', title: 'Course Delivery Lifecycle', range: '4.1-4.6' },
        legacyReference: 'Training Requests workflow'
      },
      {
        id: 'sec-4-3',
        sectionNumber: '4.3',
        title: 'Progress Tracking & Reminders',
        description: 'Lesson progress monitoring, due date tracking, and automated reminder notifications',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'A', title: 'Course Delivery Lifecycle', range: '4.1-4.6' }
      },
      {
        id: 'sec-4-4',
        sectionNumber: '4.4',
        title: 'Assessment & Quiz Delivery',
        description: 'Quiz attempts, scoring algorithms, retake management, and feedback display',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'A', title: 'Course Delivery Lifecycle', range: '4.1-4.6' }
      },
      {
        id: 'sec-4-5',
        sectionNumber: '4.5',
        title: 'Course Completion & Evaluation',
        description: 'Completion workflows, post-training evaluation submission, and satisfaction surveys',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'A', title: 'Course Delivery Lifecycle', range: '4.1-4.6' },
        legacyReference: 'How to Complete a Training Course and Submit an Evaluation'
      },
      {
        id: 'sec-4-6',
        sectionNumber: '4.6',
        title: 'Certificate Issuance & Validation',
        description: 'Certificate generation, certificate numbers, digital delivery, and verification codes',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'A', title: 'Course Delivery Lifecycle', range: '4.1-4.6' }
      },
      // SECTION B: TRAINING REQUEST LIFECYCLE (4.7-4.13)
      {
        id: 'sec-4-7',
        sectionNumber: '4.7',
        title: 'Self-Service Training Requests',
        description: 'Employee-initiated training requests through ESS portal with approval chains',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Employee'],
        sectionGroup: { code: 'B', title: 'Training Request Lifecycle', range: '4.7-4.13' },
        legacyReference: 'How to View Training Requests by Self-Service'
      },
      {
        id: 'sec-4-8',
        sectionNumber: '4.8',
        title: 'Gap Analysis-Triggered Requests',
        description: 'Competency gap-based training requests with AI recommendations',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        sectionGroup: { code: 'B', title: 'Training Request Lifecycle', range: '4.7-4.13' },
        legacyReference: 'How to Create a Training Request by Job Gap Analysis'
      },
      {
        id: 'sec-4-9',
        sectionNumber: '4.9',
        title: 'Appraisal-Triggered Requests',
        description: 'Performance appraisal-triggered training requests and development plan integration',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR Partner'],
        sectionGroup: { code: 'B', title: 'Training Request Lifecycle', range: '4.7-4.13' },
        legacyReference: 'How to Create a Training Request via Performance Appraisal'
      },
      {
        id: 'sec-4-10',
        sectionNumber: '4.10',
        title: 'Onboarding Training Integration',
        description: 'Automatic course enrollment during onboarding task assignment',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR Partner'],
        sectionGroup: { code: 'B', title: 'Training Request Lifecycle', range: '4.7-4.13' },
        legacyReference: 'How to setup Training Requests by Onboarding'
      },
      {
        id: 'sec-4-11',
        sectionNumber: '4.11',
        title: 'HR/Manager Bulk Assignments',
        description: 'Bulk enrollment and HR-generated training assignments by department/role',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'HR Partner'],
        sectionGroup: { code: 'B', title: 'Training Request Lifecycle', range: '4.7-4.13' },
        legacyReference: 'How to Create Training Requests generated by HR'
      },
      {
        id: 'sec-4-12',
        sectionNumber: '4.12',
        title: 'Training Invitations',
        description: 'Manager-to-employee training invitations with RSVP acceptance workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Manager'],
        sectionGroup: { code: 'B', title: 'Training Request Lifecycle', range: '4.7-4.13' },
        legacyReference: 'How to Invite an Employee to Request Training'
      },
      {
        id: 'sec-4-13',
        sectionNumber: '4.13',
        title: 'HR Hub Workflow Integration',
        description: 'Unified training request approval through HR Hub workflow engine with SLA tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        sectionGroup: { code: 'B', title: 'Training Request Lifecycle', range: '4.7-4.13' },
        industryContext: {
          benchmark: 'Enterprise workflow integration pattern (SAP SuccessFactors, Workday)'
        }
      },
      // SECTION C: SESSION & DELIVERY OPERATIONS (4.14-4.18)
      {
        id: 'sec-4-14',
        sectionNumber: '4.14',
        title: 'Course Lifecycle Management',
        description: 'Draft → Published → Archived states, versioning, and content update workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'C', title: 'Session & Delivery Operations', range: '4.14-4.18' }
      },
      {
        id: 'sec-4-15',
        sectionNumber: '4.15',
        title: 'ILT Session Scheduling',
        description: 'Instructor-led training session scheduling, instructor assignment, and venue booking',
        contentLevel: 'procedure',
        estimatedReadTime: 7,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'C', title: 'Session & Delivery Operations', range: '4.14-4.18' }
      },
      {
        id: 'sec-4-16',
        sectionNumber: '4.16',
        title: 'Virtual Classroom Operations',
        description: 'Video platform integration (Teams/Zoom/Meet), attendance tracking, and recordings',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'C', title: 'Session & Delivery Operations', range: '4.14-4.18' }
      },
      {
        id: 'sec-4-17',
        sectionNumber: '4.17',
        title: 'Waitlist & Capacity Management',
        description: 'Session capacity limits, waitlist processing, and auto-promotion rules',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'C', title: 'Session & Delivery Operations', range: '4.14-4.18' }
      },
      {
        id: 'sec-4-18',
        sectionNumber: '4.18',
        title: 'Calendar Sync & Scheduling',
        description: 'Training calendar views, iCal export, and scheduling conflict resolution',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'C', title: 'Session & Delivery Operations', range: '4.14-4.18' },
        legacyReference: 'Training Calendar'
      },
      // SECTION D: HISTORICAL RECORDS & TRANSCRIPTS (4.19-4.21)
      {
        id: 'sec-4-19',
        sectionNumber: '4.19',
        title: 'Training History Management',
        description: 'Unified training transcript, historical record keeping, and audit trail maintenance',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'HR Partner'],
        sectionGroup: { code: 'D', title: 'Historical Records & Transcripts', range: '4.19-4.21' },
        legacyReference: 'How to Record an Employee\'s Training History'
      },
      {
        id: 'sec-4-20',
        sectionNumber: '4.20',
        title: 'External Training Records',
        description: 'Record training completed outside LMS, vendor tracking, evidence upload, and cost capture',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR Partner'],
        sectionGroup: { code: 'D', title: 'Historical Records & Transcripts', range: '4.19-4.21' }
      },
      {
        id: 'sec-4-21',
        sectionNumber: '4.21',
        title: 'Course Reviews & Ratings',
        description: 'Learner feedback collection, rating aggregation, moderation, and quality improvement',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'D', title: 'Historical Records & Transcripts', range: '4.19-4.21' }
      }
    ]
  },


  // ==========================================================================
  // CHAPTER 5: COMPLIANCE TRAINING OPERATIONS (~180 min)
  // Sections A-F: Compliance Framework, Assignment Management, Monitoring,
  // Escalation, Audit & Reporting, HSE & Industry Compliance
  // ==========================================================================
  {
    id: 'chapter-5',
    sectionNumber: '5',
    title: 'Compliance Training Operations',
    description: 'Regulatory compliance, assignment management, monitoring dashboards, escalation workflows, audit documentation, and HSE module integration.',
    contentLevel: 'procedure',
    estimatedReadTime: 180,
    targetRoles: ['Admin', 'L&D Admin', 'HR Partner', 'Compliance Officer', 'HSE Officer'],
    subsections: [
      // Section A: Compliance Program Framework (5.1-5.3)
      {
        id: 'sec-5-1',
        sectionNumber: '5.1',
        title: 'Regulatory Compliance Overview',
        description: 'Compliance training framework, governance structure, regulatory drivers, and program objectives',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Compliance Officer', 'L&D Admin'],
        sectionGroup: { code: 'A', title: 'Compliance Program Framework', range: '5.1-5.3' }
      },
      {
        id: 'sec-5-2',
        sectionNumber: '5.2',
        title: 'Compliance Training Categories',
        description: 'Mandatory, recommended, role-based, and HSE-linked training category configuration',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'A', title: 'Compliance Program Framework', range: '5.1-5.3' }
      },
      {
        id: 'sec-5-3',
        sectionNumber: '5.3',
        title: 'Compliance Calendar & Deadlines',
        description: 'Annual compliance planning, deadline management, and regulatory calendar alignment',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin', 'Compliance Officer'],
        sectionGroup: { code: 'A', title: 'Compliance Program Framework', range: '5.1-5.3' }
      },
      // Section B: Assignment Management (5.4-5.7)
      {
        id: 'sec-5-4',
        sectionNumber: '5.4',
        title: 'Bulk Assignment Operations',
        description: 'Mass compliance assignment, CSV import/export, and rule-based auto-assignment',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'B', title: 'Assignment Management', range: '5.4-5.7' }
      },
      {
        id: 'sec-5-5',
        sectionNumber: '5.5',
        title: 'Individual Assignment Management',
        description: 'Single employee compliance tracking, manual assignments, and status overrides',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin', 'Manager'],
        sectionGroup: { code: 'B', title: 'Assignment Management', range: '5.4-5.7' }
      },
      {
        id: 'sec-5-6',
        sectionNumber: '5.6',
        title: 'Exemption Request Workflow',
        description: 'Exemption requests, approval workflows, documentation requirements, and audit trail',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin', 'HR Partner'],
        sectionGroup: { code: 'B', title: 'Assignment Management', range: '5.4-5.7' }
      },
      {
        id: 'sec-5-7',
        sectionNumber: '5.7',
        title: 'Assignment Status Lifecycle',
        description: 'Status transitions (pending → in_progress → completed → expired), field reference for compliance_training_assignments',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        sectionGroup: { code: 'B', title: 'Assignment Management', range: '5.4-5.7' }
      },
      // Section C: Monitoring & Dashboards (5.8-5.11)
      {
        id: 'sec-5-8',
        sectionNumber: '5.8',
        title: 'Compliance Dashboard Analytics',
        description: 'Real-time compliance metrics, completion rates, risk scoring, and visualization',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin', 'HR Partner'],
        sectionGroup: { code: 'C', title: 'Monitoring & Dashboards', range: '5.8-5.11' }
      },
      {
        id: 'sec-5-9',
        sectionNumber: '5.9',
        title: 'Risk Indicators & Alerts',
        description: 'Risk scoring algorithms, early warning indicators, and proactive alert configuration',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Compliance Officer'],
        sectionGroup: { code: 'C', title: 'Monitoring & Dashboards', range: '5.8-5.11' }
      },
      {
        id: 'sec-5-10',
        sectionNumber: '5.10',
        title: 'Manager Compliance View',
        description: 'MSS team compliance portal, manager drill-down, and team-level reporting',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Manager', 'L&D Admin'],
        sectionGroup: { code: 'C', title: 'Monitoring & Dashboards', range: '5.8-5.11' }
      },
      {
        id: 'sec-5-11',
        sectionNumber: '5.11',
        title: 'Executive Compliance Reports',
        description: 'C-suite dashboards, board-ready reporting, and compliance trend analysis',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Executive', 'Compliance Officer'],
        sectionGroup: { code: 'C', title: 'Monitoring & Dashboards', range: '5.8-5.11' }
      },
      // Section D: Escalation & Enforcement (5.12-5.15)
      {
        id: 'sec-5-12',
        sectionNumber: '5.12',
        title: 'Escalation Rules & Tiers',
        description: 'Tiered escalation (1-4), SLA definitions, notification chains, and escalation_level tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin', 'HR Partner'],
        sectionGroup: { code: 'D', title: 'Escalation & Enforcement', range: '5.12-5.15' }
      },
      {
        id: 'sec-5-13',
        sectionNumber: '5.13',
        title: 'Grace Period Operations',
        description: 'Grace period configuration, extension requests, manager override workflows, and time tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'D', title: 'Escalation & Enforcement', range: '5.12-5.15' }
      },
      {
        id: 'sec-5-14',
        sectionNumber: '5.14',
        title: 'Non-Compliance Consequences',
        description: 'Consequence matrix, policy enforcement actions, system flags, and access restrictions',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner', 'Compliance Officer'],
        sectionGroup: { code: 'D', title: 'Escalation & Enforcement', range: '5.12-5.15' }
      },
      {
        id: 'sec-5-15',
        sectionNumber: '5.15',
        title: 'HR Intervention Workflows',
        description: 'HR workflow integration, disciplinary linkage, intervention tracking, and case resolution',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        sectionGroup: { code: 'D', title: 'Escalation & Enforcement', range: '5.12-5.15' }
      },
      // Section E: Audit & Reporting (5.16-5.19)
      {
        id: 'sec-5-16',
        sectionNumber: '5.16',
        title: 'Compliance Audit Trail',
        description: 'Audit log schema, retention policies, tamper-proof logging (SHA-256), and query patterns',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Compliance Officer', 'Consultant'],
        sectionGroup: { code: 'E', title: 'Audit & Reporting', range: '5.16-5.19' }
      },
      {
        id: 'sec-5-17',
        sectionNumber: '5.17',
        title: 'Regulatory Report Generation',
        description: 'OSHA 300A integration, standard report templates, export formats, and scheduling',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Compliance Officer', 'HSE Officer'],
        sectionGroup: { code: 'E', title: 'Audit & Reporting', range: '5.16-5.19' }
      },
      {
        id: 'sec-5-18',
        sectionNumber: '5.18',
        title: 'Evidence Package Preparation',
        description: 'Audit preparation workflows, evidence assembly, documentation packages, and regulator interface',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Compliance Officer'],
        sectionGroup: { code: 'E', title: 'Audit & Reporting', range: '5.16-5.19' }
      },
      {
        id: 'sec-5-19',
        sectionNumber: '5.19',
        title: 'Historical Compliance Records',
        description: 'Data archival, retention schedules, GDPR/data protection compliance, and historical query access',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant', 'Compliance Officer'],
        sectionGroup: { code: 'E', title: 'Audit & Reporting', range: '5.16-5.19' }
      },
      // Section F: HSE & Industry Compliance (5.20-5.23)
      {
        id: 'sec-5-20',
        sectionNumber: '5.20',
        title: 'HSE Training Integration',
        description: 'hse_safety_training ↔ lms_courses bidirectional linkage, hse_training_records sync with lms_enrollments',
        contentLevel: 'reference',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'HSE Officer', 'Consultant'],
        sectionGroup: { code: 'F', title: 'HSE & Industry Compliance', range: '5.20-5.23' }
      },
      {
        id: 'sec-5-21',
        sectionNumber: '5.21',
        title: 'Incident-Triggered Training',
        description: 'hse_incidents.corrective_actions → training request workflow, remedial training automation',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HSE Officer', 'L&D Admin'],
        sectionGroup: { code: 'F', title: 'HSE & Industry Compliance', range: '5.20-5.23' }
      },
      {
        id: 'sec-5-22',
        sectionNumber: '5.22',
        title: 'OSHA & Safety Certification',
        description: 'OSHA 10/30-Hour tracking, hse_osha_logs (22 fields), is_osha_reportable flag integration, OSHA 300A generation',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HSE Officer', 'Compliance Officer'],
        sectionGroup: { code: 'F', title: 'HSE & Industry Compliance', range: '5.20-5.23' }
      },
      {
        id: 'sec-5-23',
        sectionNumber: '5.23',
        title: 'Caribbean Regional Requirements',
        description: 'Jamaica OSHA Act, Trinidad OSH Act 2004, Barbados Safety & Health at Work Act, regional calendar compliance',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant', 'Compliance Officer'],
        sectionGroup: { code: 'F', title: 'HSE & Industry Compliance', range: '5.20-5.23' }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 6: AI FEATURES & INTELLIGENCE (~95 min)
  // ==========================================================================
  {
    id: 'chapter-6',
    sectionNumber: '6',
    title: 'AI Features & Intelligence',
    description: 'AI-powered recommendations, gap analysis, training needs forecasting, adaptive learning, chatbot assistant, and intelligent automation.',
    contentLevel: 'concept',
    estimatedReadTime: 95,
    targetRoles: ['Admin', 'Consultant', 'L&D Admin'],
    subsections: [
      // Section A: Gap Analysis & Recommendations
      {
        id: 'sec-6-1',
        sectionNumber: '6.1',
        title: 'AI-Powered Course Recommendations',
        description: 'Skill gap analysis driving personalized learning suggestions via competency_course_mappings',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin'],
        legacyReference: 'Automated Gap Analysis',
        sectionGroup: { code: 'A', title: 'Gap Analysis & Recommendations', range: '6.1-6.3' }
      },
      {
        id: 'sec-6-2',
        sectionNumber: '6.2',
        title: 'Competency Gap Detection',
        description: 'Automated gap identification comparing job requirements to employee skills via employee_skill_gaps',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        legacyReference: 'Job Gap Analysis',
        sectionGroup: { code: 'A', title: 'Gap Analysis & Recommendations', range: '6.1-6.3' }
      },
      {
        id: 'sec-6-3',
        sectionNumber: '6.3',
        title: 'Training Needs Analysis',
        description: 'AI-driven needs forecasting, department-level insights, and budget impact via training_needs_analysis',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'A', title: 'Gap Analysis & Recommendations', range: '6.1-6.3' }
      },
      // Section B: Content Generation
      {
        id: 'sec-6-4',
        sectionNumber: '6.4',
        title: 'Intelligent Quiz Generation',
        description: 'AI-assisted question creation with Bloom\'s taxonomy alignment via ai_generated_quizzes and ai_generated_questions',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'B', title: 'Content Generation', range: '6.4' }
      },
      // Section C: Adaptive Learning
      {
        id: 'sec-6-5',
        sectionNumber: '6.5',
        title: 'Adaptive Learning Paths',
        description: 'Performance-based path adaptation with skip/remediate rules via adaptive_learning_paths, adaptive_path_rules, adaptive_learner_progress',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'C', title: 'Adaptive Learning', range: '6.5' }
      },
      // Section D: Learning Assistant
      {
        id: 'sec-6-6',
        sectionNumber: '6.6',
        title: 'Learning Chatbot Assistant',
        description: 'Conversational AI for course discovery, progress queries, and skill recommendations via learning_chatbot_config, chatbot_conversations, chatbot_messages',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'D', title: 'Learning Assistant', range: '6.6' }
      },
      // Section E: Risk & Analytics
      {
        id: 'sec-6-7',
        sectionNumber: '6.7',
        title: 'Completion Risk Predictions',
        description: 'At-risk learner identification with automated interventions via completion_risk_predictions, risk_interventions, risk_alert_rules',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'L&D Admin', 'Manager'],
        sectionGroup: { code: 'E', title: 'Risk & Analytics', range: '6.7-6.8' }
      },
      {
        id: 'sec-6-8',
        sectionNumber: '6.8',
        title: 'Skills Transfer Index',
        description: 'Post-training impact measurement with transfer assessments and benchmarks via skills_transfer_assessments, transfer_benchmarks, transfer_follow_ups',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin', 'HR Partner'],
        sectionGroup: { code: 'E', title: 'Risk & Analytics', range: '6.7-6.8' }
      },
      // Section F: Governance
      {
        id: 'sec-6-9',
        sectionNumber: '6.9',
        title: 'AI Governance & Explainability',
        description: 'ISO 42001 alignment, model transparency, bias monitoring, and human oversight via ai_model_registry, ai_governance_metrics',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        sectionGroup: { code: 'F', title: 'Governance & Compliance', range: '6.9-6.10' }
      },
      {
        id: 'sec-6-10',
        sectionNumber: '6.10',
        title: 'AI Agent Framework',
        description: 'Agent configuration, capabilities, execution tracking, and performance metrics via ai_agents, ai_agent_capabilities, ai_agent_executions',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        sectionGroup: { code: 'F', title: 'Governance & Compliance', range: '6.9-6.10' }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 7: ANALYTICS & REPORTING (~150 min)
  // Industry-aligned: Workday Learning Analytics, SAP SuccessFactors LMS Reporting, Docebo Analytics, Cornerstone
  // ==========================================================================
  {
    id: 'chapter-7',
    sectionNumber: '7',
    title: 'Analytics & Reporting',
    description: 'Enterprise training analytics covering dashboards, Kirkpatrick evaluation, ROI analysis, compliance reporting, SCORM/xAPI tracking, gamification metrics, learning paths, external training, and AI-powered insights.',
    contentLevel: 'procedure',
    estimatedReadTime: 150,
    targetRoles: ['Admin', 'L&D Admin', 'HR Partner', 'Manager', 'Executive'],
    subsections: [
      // Section A: Executive Dashboards (7.1-7.3)
      {
        id: 'sec-7-1',
        sectionNumber: '7.1',
        title: 'Training Analytics Dashboard',
        description: 'Central analytics hub with 8 KPI cards, enrollment trends, completion rates, and budget utilization via TrainingAnalytics.tsx',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'L&D Admin', 'Executive'],
        legacyReference: 'Reports, Pivots',
        sectionGroup: { code: 'A', title: 'Executive Dashboards', range: '7.1-7.3' }
      },
      {
        id: 'sec-7-2',
        sectionNumber: '7.2',
        title: 'KPI Card Configuration',
        description: 'Configuring dashboard metrics: total courses, enrollments, completion rate, avg quiz score, certifications, training hours, compliance rate, budget used (allocated_amount)',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'A', title: 'Executive Dashboards', range: '7.1-7.3' }
      },
      {
        id: 'sec-7-3',
        sectionNumber: '7.3',
        title: 'Executive Summary Views',
        description: 'Role-based dashboard views for C-suite with strategic metrics vs operational details for HR partners',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Executive', 'HR Partner'],
        sectionGroup: { code: 'A', title: 'Executive Dashboards', range: '7.1-7.3' }
      },
      // Section B: Learner Analytics (7.4-7.6)
      {
        id: 'sec-7-4',
        sectionNumber: '7.4',
        title: 'Learner Progress Reports',
        description: 'Individual progress via lms_enrollments (user_id, course_id, enrolled_by, status, progress_percentage), lms_lesson_progress, and training_analytics tables',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Manager', 'Employee'],
        legacyReference: 'Training History',
        sectionGroup: { code: 'B', title: 'Learner Analytics', range: '7.4-7.6' }
      },
      {
        id: 'sec-7-5',
        sectionNumber: '7.5',
        title: 'Certification Tracking',
        description: 'Certificate issuance and expiry via lms_certificates (enrollment_id, course_id, user_id, verification_code, issued_at, expires_at)',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin', 'Manager'],
        sectionGroup: { code: 'B', title: 'Learner Analytics', range: '7.4-7.6' }
      },
      {
        id: 'sec-7-6',
        sectionNumber: '7.6',
        title: 'Quiz Performance Analytics',
        description: 'Quiz attempt analysis via lms_quiz_attempts (quiz_id, enrollment_id, score, max_score, percentage, passed, time_spent_seconds, attempt_number, started_at, submitted_at)',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'B', title: 'Learner Analytics', range: '7.4-7.6' }
      },
      // Section C: Course Effectiveness (7.7-7.9) - Kirkpatrick Model
      {
        id: 'sec-7-7',
        sectionNumber: '7.7',
        title: 'Course Effectiveness Metrics',
        description: 'Holistic course quality via completion rates, quiz scores, lms_course_reviews (rating, review_text, is_anonymous), and NPS tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin'],
        legacyReference: 'Course Evaluation',
        sectionGroup: { code: 'C', title: 'Course Effectiveness (Kirkpatrick)', range: '7.7-7.9' }
      },
      {
        id: 'sec-7-8',
        sectionNumber: '7.8',
        title: 'Kirkpatrick Model Reporting',
        description: 'Four-level evaluation via training_evaluations (id, company_id, name, description, evaluation_level, questions, is_active) and training_evaluation_responses',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'L&D Admin', 'HR Partner'],
        sectionGroup: { code: 'C', title: 'Course Effectiveness (Kirkpatrick)', range: '7.7-7.9' }
      },
      {
        id: 'sec-7-9',
        sectionNumber: '7.9',
        title: 'Training ROI Analysis',
        description: 'ROI calculation via training_budgets.allocated_amount vs skills_transfer_assessments, transfer_benchmarks, with cost-per-learner metrics',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner', 'Executive'],
        sectionGroup: { code: 'C', title: 'Course Effectiveness (Kirkpatrick)', range: '7.7-7.9' }
      },
      // Section D: Financial Analytics (7.10-7.11)
      {
        id: 'sec-7-10',
        sectionNumber: '7.10',
        title: 'Budget Utilization Reports',
        description: 'Financial tracking via training_budgets (company_id, department_id, fiscal_year, allocated_amount, spent_amount, currency, notes) with variance analysis',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner', 'Executive'],
        sectionGroup: { code: 'D', title: 'Financial Analytics', range: '7.10-7.11' }
      },
      {
        id: 'sec-7-11',
        sectionNumber: '7.11',
        title: 'Cost-Per-Learner Analysis',
        description: 'Training cost efficiency: total spend / unique learners with category breakdown and vendor cost comparison',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        sectionGroup: { code: 'D', title: 'Financial Analytics', range: '7.10-7.11' }
      },
      // Section E: Compliance Analytics (7.12-7.13)
      {
        id: 'sec-7-12',
        sectionNumber: '7.12',
        title: 'Compliance Reporting',
        description: 'Mandatory training status via compliance_training_assignments with overdue alerts, escalation tracking, and exemption management',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin', 'Compliance Officer'],
        sectionGroup: { code: 'E', title: 'Compliance Analytics', range: '7.12-7.13' }
      },
      {
        id: 'sec-7-13',
        sectionNumber: '7.13',
        title: 'Regulatory Audit Exports',
        description: 'Audit-ready reports via compliance_audit_log (event_category, entity_type, actor_type, actor_name, actor_role, change_summary, ip_address, user_agent, session_id, metadata, sequence_number, checksum, previous_checksum)',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Compliance Officer'],
        sectionGroup: { code: 'E', title: 'Compliance Analytics', range: '7.12-7.13' }
      },
      // Section F: Manager & Team Views (7.14-7.15)
      {
        id: 'sec-7-14',
        sectionNumber: '7.14',
        title: 'Manager Team Training View',
        description: 'Team training dashboard via ManagerTeamTrainingCard with completion status, overdue tracking, and expiring certifications for direct reports',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Manager'],
        sectionGroup: { code: 'F', title: 'Manager & Team Views', range: '7.14-7.15' }
      },
      {
        id: 'sec-7-15',
        sectionNumber: '7.15',
        title: 'Department Rollup Reports',
        description: 'Aggregated department-level analytics with cross-team comparison, skill gap heatmaps, and training investment allocation',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Manager', 'HR Partner'],
        sectionGroup: { code: 'F', title: 'Manager & Team Views', range: '7.14-7.15' }
      },
      // Section G: Advanced Analytics & AI (7.16-7.18)
      {
        id: 'sec-7-16',
        sectionNumber: '7.16',
        title: 'AI-Powered BI Reports',
        description: 'Natural language report generation via AIModuleReportBuilder with banded and BI report types, PII masking controls',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin'],
        legacyReference: 'HRplus BI',
        sectionGroup: { code: 'G', title: 'Advanced Analytics & AI', range: '7.16-7.18' }
      },
      {
        id: 'sec-7-17',
        sectionNumber: '7.17',
        title: 'Scheduled Reports Configuration',
        description: 'Automated report delivery via ScheduledOrgReports.tsx and scheduled_org_reports table with recipient lists, frequency, format options',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'G', title: 'Advanced Analytics & AI', range: '7.16-7.18' }
      },
      {
        id: 'sec-7-18',
        sectionNumber: '7.18',
        title: 'Custom Report Builder',
        description: 'Ad-hoc report creation with drag-drop field selection, filter configuration, and visualization options via saved_report_configs',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'L&D Admin', 'HR Partner'],
        sectionGroup: { code: 'G', title: 'Advanced Analytics & AI', range: '7.16-7.18' }
      },
      // Section H: Technical Analytics (7.19-7.22) - NEW
      {
        id: 'sec-7-19',
        sectionNumber: '7.19',
        title: 'SCORM/xAPI Analytics',
        description: 'eLearning tracking via lms_scorm_tracking (sco_id, lesson_status, completion_status, success_status, score_raw/min/max/scaled, total_time, suspend_data, cmi_data) and lms_xapi_statements (actor, verb, object, result, context)',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'L&D Admin', 'Consultant'],
        sectionGroup: { code: 'H', title: 'Technical Analytics', range: '7.19-7.22' }
      },
      {
        id: 'sec-7-20',
        sectionNumber: '7.20',
        title: 'Gamification Analytics',
        description: 'Engagement tracking via lms_user_points (total_points, current_level, streak_days), lms_user_badges (earned_at, source_type), lms_leaderboards (scope, time_period), lms_point_transactions',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin'],
        sectionGroup: { code: 'H', title: 'Technical Analytics', range: '7.19-7.22' }
      },
      {
        id: 'sec-7-21',
        sectionNumber: '7.21',
        title: 'Learning Path Analytics',
        description: 'Path progression via learning_path_enrollments (status, progress_percentage, current_course_index, source_type) and learning_path_course_progress with funnel analysis',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin', 'HR Partner'],
        sectionGroup: { code: 'H', title: 'Technical Analytics', range: '7.19-7.22' }
      },
      {
        id: 'sec-7-22',
        sectionNumber: '7.22',
        title: 'External Training Analytics',
        description: 'External training tracking via external_training_records (21 fields including training_type, provider_name, duration_hours, cost_amount, cost_currency, budget_id, certificate_url, skills_acquired, verified_by)',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin', 'HR Partner'],
        sectionGroup: { code: 'H', title: 'Technical Analytics', range: '7.19-7.22' }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 8: INTEGRATION & DOWNSTREAM IMPACTS (~80 min)
  // ==========================================================================
  {
    id: 'chapter-8',
    sectionNumber: '8',
    title: 'Integration & Downstream Impacts',
    description: 'Cross-module integrations including onboarding, appraisals, competencies, succession, workflows, notifications, and external systems.',
    contentLevel: 'reference',
    estimatedReadTime: 80,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      // Section A: Integration Architecture (8.1)
      {
        id: 'sec-8-1',
        sectionNumber: '8.1',
        title: 'Integration Architecture Overview',
        description: 'Event-driven integration model connecting L&D to HR lifecycle modules via appraisal_integration_rules and audit logging',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        sectionGroup: { code: 'A', title: 'Integration Architecture', range: '8.1' }
      },
      // Section B: HR Lifecycle Integrations (8.2-8.6)
      {
        id: 'sec-8-2',
        sectionNumber: '8.2',
        title: 'Onboarding Integration',
        description: 'Auto-enrollment via trigger_onboarding_training_enrollment PostgreSQL function and onboarding_tasks.training_course_id',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        legacyReference: 'Training Requests by Onboarding',
        sectionGroup: { code: 'B', title: 'HR Lifecycle Integrations', range: '8.2-8.6' }
      },
      {
        id: 'sec-8-3',
        sectionNumber: '8.3',
        title: 'Performance & Appraisal Integration',
        description: 'Training actions via appraisal-integration-orchestrator edge function with action types: create_request, auto_enroll, recommend, gap_based_enrollment',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        legacyReference: 'Training Request via Performance Appraisal',
        sectionGroup: { code: 'B', title: 'HR Lifecycle Integrations', range: '8.2-8.6' }
      },
      {
        id: 'sec-8-4',
        sectionNumber: '8.4',
        title: 'Competency Framework Sync',
        description: 'Bidirectional sync via competency_course_mappings: skill gaps → course recommendations and course completion → skill updates',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        legacyReference: 'Competencies to be Gained',
        sectionGroup: { code: 'B', title: 'HR Lifecycle Integrations', range: '8.2-8.6' }
      },
      {
        id: 'sec-8-5',
        sectionNumber: '8.5',
        title: 'Succession & Career Development',
        description: 'Succession readiness gaps, career path requirements, and IDP goals linked to training courses and learning paths',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        sectionGroup: { code: 'B', title: 'HR Lifecycle Integrations', range: '8.2-8.6' }
      },
      {
        id: 'sec-8-6',
        sectionNumber: '8.6',
        title: 'Workflow Engine & Approvals',
        description: '5 seeded workflow templates (TRAINING_REQUEST_APPROVAL, CERTIFICATION_REQUEST_APPROVAL, etc.) with SLA tracking and escalation',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        legacyReference: 'Workflow for Approval Process',
        sectionGroup: { code: 'B', title: 'HR Lifecycle Integrations', range: '8.2-8.6' }
      },
      // Section C: External Systems (8.7-8.9)
      {
        id: 'sec-8-7',
        sectionNumber: '8.7',
        title: 'Notification & Calendar Integration',
        description: '20+ training reminder_event_types, email templates with placeholders, and Google/Outlook calendar sync',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin'],
        sectionGroup: { code: 'C', title: 'External Systems', range: '8.7-8.9' }
      },
      {
        id: 'sec-8-8',
        sectionNumber: '8.8',
        title: 'External LMS & Content Providers',
        description: 'external_training_records tracking, SSO/SAML configuration, and SCORM/xAPI data exchange patterns',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        legacyReference: 'HRplus-Talent LMS Integration',
        sectionGroup: { code: 'C', title: 'External Systems', range: '8.7-8.9' }
      },
      {
        id: 'sec-8-9',
        sectionNumber: '8.9',
        title: 'Virtual Classroom Integration',
        description: 'Microsoft Teams, Zoom, and Google Meet configuration for virtual ILT with attendance tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin'],
        sectionGroup: { code: 'C', title: 'External Systems', range: '8.7-8.9' }
      },
      // Section D: Operational Support (8.10-8.12)
      {
        id: 'sec-8-10',
        sectionNumber: '8.10',
        title: 'API & Data Sync Patterns',
        description: 'REST API endpoints, webhook configuration, data sync patterns, and LTI 1.3 roadmap',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        sectionGroup: { code: 'D', title: 'Operational Support', range: '8.10-8.12' }
      },
      {
        id: 'sec-8-11',
        sectionNumber: '8.11',
        title: 'Integration Audit & Monitoring',
        description: 'appraisal_integration_log diagnostic queries, execution status tracking, and monitoring dashboard metrics',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        sectionGroup: { code: 'D', title: 'Operational Support', range: '8.10-8.12' }
      },
      {
        id: 'sec-8-12',
        sectionNumber: '8.12',
        title: 'Integration Troubleshooting',
        description: 'Common integration failures, error message reference, diagnostic checklist, and support escalation paths',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        sectionGroup: { code: 'D', title: 'Operational Support', range: '8.10-8.12' }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 9: TROUBLESHOOTING & BEST PRACTICES (~120 min)
  // ==========================================================================
  {
    id: 'chapter-9',
    sectionNumber: '9',
    title: 'Troubleshooting & Best Practices',
    description: 'Comprehensive diagnostic procedures, 100+ documented issues, escalation paths, and implementation best practices.',
    contentLevel: 'reference',
    estimatedReadTime: 120,
    targetRoles: ['Admin', 'L&D Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-9-1',
        sectionNumber: '9.1',
        title: 'Troubleshooting Overview',
        description: 'Diagnostic methodology, symptom-to-section matrix, issue ID conventions, and escalation decision tree',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin', 'Consultant']
      },
      {
        id: 'sec-9-2',
        sectionNumber: '9.2',
        title: 'Setup & Configuration Issues',
        description: '15 issues: Categories, courses, modules, SCORM/xAPI, certificates, company settings (LMS-001 to LMS-015)',
        contentLevel: 'reference',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'L&D Admin', 'Consultant']
      },
      {
        id: 'sec-9-3',
        sectionNumber: '9.3',
        title: 'Enrollment & Access Issues',
        description: '12 issues: Catalog visibility, self-enrollment, manager assignment, waitlists, prerequisites (ENR-001 to ENR-012)',
        contentLevel: 'reference',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'L&D Admin', 'Manager']
      },
      {
        id: 'sec-9-4',
        sectionNumber: '9.4',
        title: 'Progress Tracking Issues',
        description: '10 issues: Lesson completion, SCORM sync, progress calculation, module unlock (PRG-001 to PRG-010)',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant']
      },
      {
        id: 'sec-9-5',
        sectionNumber: '9.5',
        title: 'Quiz & Assessment Issues',
        description: '12 issues: Scoring, timing, retakes, randomization, AI quiz generation (QIZ-001 to QIZ-012)',
        contentLevel: 'reference',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'L&D Admin']
      },
      {
        id: 'sec-9-6',
        sectionNumber: '9.6',
        title: 'Certificate & Credential Issues',
        description: '10 issues: Generation, numbering, PDF rendering, expiry, verification (CRT-001 to CRT-010)',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin']
      },
      {
        id: 'sec-9-7',
        sectionNumber: '9.7',
        title: 'Compliance Training Issues',
        description: '12 issues: Assignment rules, exemptions, escalations, recertification, HSE sync (CMP-001 to CMP-012)',
        contentLevel: 'reference',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'L&D Admin', 'Compliance Officer']
      },
      {
        id: 'sec-9-8',
        sectionNumber: '9.8',
        title: 'External Training & Vendor Issues',
        description: '10 issues: Vendor courses, sessions, costs, approvals, budget integration (VND-001 to VND-010)',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'L&D Admin', 'HR Partner']
      },
      {
        id: 'sec-9-9',
        sectionNumber: '9.9',
        title: 'Integration & Sync Issues',
        description: '12 issues: Onboarding, appraisals, competencies, SSO, virtual classrooms, webhooks (INT-001 to INT-012)',
        contentLevel: 'reference',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant']
      },
      {
        id: 'sec-9-10',
        sectionNumber: '9.10',
        title: 'AI & Automation Issues',
        description: '8 issues: Recommendations, adaptive paths, risk prediction, chatbot, governance (AIA-001 to AIA-008)',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant']
      },
      {
        id: 'sec-9-11',
        sectionNumber: '9.11',
        title: 'Performance & Data Issues',
        description: '8 issues: Page loading, analytics, duplicates, exports, realtime sync (PER-001 to PER-008)',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant']
      },
      {
        id: 'sec-9-12',
        sectionNumber: '9.12',
        title: 'Escalation Procedures & FAQs',
        description: 'Tiered support model (L1-L4), SLA targets, escalation checklist, 20+ FAQs',
        contentLevel: 'reference',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'L&D Admin', 'Consultant', 'Manager', 'Employee']
      }
    ]
  }
];

// =============================================================================
// GLOSSARY - 80+ L&D/LMS Terms
// =============================================================================

export const LND_GLOSSARY: LndGlossaryTerm[] = [
  // Core Terms
  { term: 'Learning Management System (LMS)', definition: 'Software platform for delivering, tracking, and managing training content and learner progress.', category: 'Core' },
  { term: 'Course', definition: 'A structured learning experience containing modules and lessons, leading to completion or certification.', category: 'Core' },
  { term: 'Module', definition: 'A logical grouping of related lessons within a course, often representing a topic or chapter.', category: 'Core' },
  { term: 'Lesson', definition: 'The smallest unit of learning content within a module, such as a video, document, or interactive element.', category: 'Core' },
  { term: 'Enrollment', definition: 'The process of registering a learner for a course, either through self-enrollment or assignment.', category: 'Core' },
  { term: 'Learning Path', definition: 'A curated sequence of courses designed to develop specific skills or achieve career progression.', category: 'Core' },
  { term: 'Competency', definition: 'A measurable skill, knowledge area, or behavior required for job performance.', category: 'Core' },
  { term: 'Certification', definition: 'Formal recognition of course completion or skill attainment, often with validity periods.', category: 'Core' },
  
  // LMS Terms
  { term: 'SCORM', definition: 'Sharable Content Object Reference Model - an eLearning standard for content packaging and tracking.', category: 'LMS' },
  { term: 'xAPI (Tin Can)', definition: 'Experience API - a modern eLearning specification allowing tracking of diverse learning activities.', category: 'LMS' },
  { term: 'Content Package', definition: 'A standardized bundle of eLearning content (SCORM/xAPI) that can be imported into an LMS.', category: 'LMS' },
  { term: 'Quiz Attempt', definition: 'A single instance of a learner taking an assessment, tracked with score and completion status.', category: 'LMS' },
  { term: 'Passing Score', definition: 'The minimum score required to successfully complete an assessment or course.', category: 'LMS' },
  { term: 'Progress Tracking', definition: 'Monitoring learner advancement through course content, including time spent and completion percentage.', category: 'LMS' },
  { term: 'Lesson Bookmark', definition: 'A saved position in course content allowing learners to resume from where they left off.', category: 'LMS' },
  { term: 'Discussion Forum', definition: 'A collaborative space within a course for learners to ask questions and share insights.', category: 'LMS' },
  
  // Compliance Terms
  { term: 'Mandatory Training', definition: 'Required training that employees must complete, often for legal or regulatory compliance.', category: 'Compliance' },
  { term: 'Compliance Training', definition: 'Training designed to meet regulatory requirements such as safety, ethics, or industry standards.', category: 'Compliance' },
  { term: 'Recertification', definition: 'The process of renewing certification through additional training or assessment after expiry.', category: 'Compliance' },
  { term: 'Grace Period', definition: 'Time allowed after certification expiry before penalties apply or access is restricted.', category: 'Compliance' },
  { term: 'Target Audience', definition: 'The defined group of employees who must complete specific compliance training.', category: 'Compliance' },
  { term: 'Compliance Assignment', definition: 'The linking of mandatory training to employees based on role, department, or other criteria.', category: 'Compliance' },
  
  // Agency Terms
  { term: 'Training Agency', definition: 'An external provider of training courses, workshops, or certifications.', category: 'Agency' },
  { term: 'Preferred Vendor', definition: 'A training agency designated as the recommended provider due to quality or pricing.', category: 'Agency' },
  { term: 'Agency Rating', definition: 'A quality score assigned to training agencies based on performance and feedback.', category: 'Agency' },
  { term: 'External Training Record', definition: 'Documentation of training completed outside the organization\'s LMS.', category: 'Agency' },
  { term: 'Delivery Method', definition: 'The format for delivering training: in-person, online, virtual instructor-led, or blended.', category: 'Agency' },
  { term: 'Contact Hours', definition: 'The total instructional time for a training course, used for compliance and reporting.', category: 'Agency' },
  
  // Workflow Terms
  { term: 'Training Request', definition: 'A formal submission by or on behalf of an employee to attend training, subject to approval.', category: 'Workflow' },
  { term: 'Training Invitation', definition: 'A manager-initiated request for an employee to attend specific training.', category: 'Workflow' },
  { term: 'Approval Workflow', definition: 'The process of routing training requests through appropriate approvers based on rules.', category: 'Workflow' },
  { term: 'Reject Reason', definition: 'A standardized code explaining why a training request was denied.', category: 'Workflow' },
  { term: 'Cancel Reason', definition: 'A standardized code explaining why an enrollment was cancelled.', category: 'Workflow' },
  { term: 'Waitlist', definition: 'A queue of learners waiting for enrollment when a course reaches capacity.', category: 'Workflow' },
  { term: 'Training Event', definition: 'A scheduled training session or period, such as a training week or bootcamp.', category: 'Workflow' },
  
  // Analytics Terms
  { term: 'Completion Rate', definition: 'The percentage of enrolled learners who successfully complete a course.', category: 'Analytics' },
  { term: 'Time to Completion', definition: 'The average duration from enrollment to course completion.', category: 'Analytics' },
  { term: 'Training ROI', definition: 'Return on investment calculated from training costs versus business outcomes.', category: 'Analytics' },
  { term: 'Cost per Learner', definition: 'The average expense incurred for training each employee.', category: 'Analytics' },
  { term: 'Satisfaction Score', definition: 'Learner feedback rating for course quality, typically on a 1-5 scale.', category: 'Analytics' },
  { term: 'Training Needs Analysis', definition: 'Systematic assessment of skill gaps to determine required training.', category: 'Analytics' },
  { term: 'Budget Utilization', definition: 'The percentage of allocated training budget that has been spent.', category: 'Analytics' },
  
  // Integration Terms
  { term: 'Onboarding Integration', definition: 'Automatic course enrollment triggered by onboarding task assignment.', category: 'Integration' },
  { term: 'Appraisal Integration', definition: 'Training recommendations generated from performance appraisal outcomes.', category: 'Integration' },
  { term: 'Competency Sync', definition: 'Automatic update of employee skills based on course completion.', category: 'Integration' },
  { term: 'Succession Link', definition: 'Training recommendations based on succession candidate readiness gaps.', category: 'Integration' },
  { term: 'IDP Goal', definition: 'Individual Development Plan objective that may include training requirements.', category: 'Integration' },
  { term: 'Calendar Integration', definition: 'Syncing training sessions with employee calendars for scheduling.', category: 'Integration' },
  
  // AI Terms
  { term: 'AI Recommendation', definition: 'Machine learning-generated suggestion for relevant courses based on skill gaps.', category: 'AI' },
  { term: 'Gap Analysis', definition: 'Comparison of current skills versus required competencies to identify training needs.', category: 'AI' },
  { term: 'Predictive Analytics', definition: 'AI-driven forecasting of training outcomes such as completion probability.', category: 'AI' },
  { term: 'At-Risk Learner', definition: 'A learner identified by AI as unlikely to complete training without intervention.', category: 'AI' },
  { term: 'Intelligent Quiz', definition: 'AI-generated assessment questions calibrated to appropriate difficulty levels.', category: 'AI' },
  { term: 'Explainability', definition: 'Transparency in AI decision-making, showing why specific recommendations were made.', category: 'AI' },
  
  // Configuration Terms
  { term: 'Course Category', definition: 'A logical grouping for organizing courses (e.g., Compliance, Technical, Leadership).', category: 'Configuration' },
  { term: 'Cost Type', definition: 'Classification of training expenses (direct, indirect, support) for budgeting.', category: 'Configuration' },
  { term: 'Training Staff', definition: 'L&D administrators assigned to manage training operations for specific companies.', category: 'Configuration' },
  { term: 'Certificate Template', definition: 'A configurable design for generating completion certificates with dynamic fields.', category: 'Configuration' },
  { term: 'Instructor Profile', definition: 'Configuration of internal or external trainers with qualifications and availability.', category: 'Configuration' },
  { term: 'Training Budget', definition: 'Allocated funds for training expenses at company or department level.', category: 'Configuration' },
  
  // Troubleshooting Terms
  { term: 'SCORM Communication', definition: 'Data exchange between SCORM content and the LMS for progress tracking.', category: 'Troubleshooting' },
  { term: 'Enrollment Error', definition: 'Failure to register a learner for a course due to prerequisites, capacity, or permissions.', category: 'Troubleshooting' },
  { term: 'Progress Sync', definition: 'The process of updating lesson completion status in the database.', category: 'Troubleshooting' },
  { term: 'Certificate Conflict', definition: 'Duplicate certificate number generation requiring resolution.', category: 'Troubleshooting' },
  { term: 'Data Migration', definition: 'Transfer of training records from legacy systems to the new LMS.', category: 'Troubleshooting' },
  { term: 'Session Timeout', definition: 'Automatic logout during course progress potentially causing data loss.', category: 'Troubleshooting' }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getLndTotalReadTime(): number {
  return LND_MANUAL_STRUCTURE.reduce((acc, section) => acc + section.estimatedReadTime, 0);
}

export function getLndTotalSections(): number {
  return LND_MANUAL_STRUCTURE.reduce((acc, section) => 
    acc + 1 + (section.subsections?.length || 0), 0);
}

export function getLndGlossaryByCategory(category: LndGlossaryTerm['category']): LndGlossaryTerm[] {
  return LND_GLOSSARY.filter(term => term.category === category);
}

export function getLndSectionById(id: string): LndSection | undefined {
  for (const chapter of LND_MANUAL_STRUCTURE) {
    if (chapter.id === id) return chapter;
    const subsection = chapter.subsections?.find(s => s.id === id);
    if (subsection) return subsection;
  }
  return undefined;
}
