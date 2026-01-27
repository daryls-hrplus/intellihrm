// Career Development Administrator Manual - Structure Definition
// Comprehensive documentation for 10+ database tables, 6 UI pages
// Following Workday Career Hub architecture patterns

export interface CareerDevSection {
  id: string;
  sectionNumber: string;
  title: string;
  description: string;
  contentLevel: 'overview' | 'concept' | 'procedure' | 'reference';
  estimatedReadTime: number;
  targetRoles: ('Admin' | 'Consultant' | 'HR Partner' | 'Manager' | 'Employee')[];
  industryContext?: {
    frequency?: string;
    timing?: string;
    benchmark?: string;
  };
  subsections?: CareerDevSection[];
}

export interface CareerDevGlossaryTerm {
  term: string;
  definition: string;
  category: 'Career Path' | 'IDP' | 'Mentorship' | 'Development' | 'AI' | 'Integration';
}

// =============================================================================
// MANUAL STRUCTURE - 10 Chapters Following Workday Career Hub Pattern
// =============================================================================

export const CAREER_DEV_MANUAL_STRUCTURE: CareerDevSection[] = [
  // ==========================================================================
  // CHAPTER 1: SYSTEM OVERVIEW (~55 min)
  // ==========================================================================
  {
    id: 'chapter-1',
    sectionNumber: '1',
    title: 'System Overview',
    description: 'Introduction to Career Development, business value, core concepts, persona journeys, and complete data architecture.',
    contentLevel: 'overview',
    estimatedReadTime: 55,
    targetRoles: ['Admin', 'Consultant', 'HR Partner'],
    subsections: [
      {
        id: 'sec-1-1',
        sectionNumber: '1.1',
        title: 'Introduction & Business Value',
        description: 'Strategic value of career development, employee engagement impact, retention benefits, and organizational capability building',
        contentLevel: 'overview',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Gallup: Organizations with strong career development have 34% higher engagement'
        }
      },
      {
        id: 'sec-1-2',
        sectionNumber: '1.2',
        title: 'Core Concepts & Terminology',
        description: 'Career paths, IDPs, mentorship programs, development themes, and lifecycle states',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Workday Career Hub terminology alignment'
        }
      },
      {
        id: 'sec-1-3',
        sectionNumber: '1.3',
        title: 'User Personas & Journeys',
        description: 'HR Admin, Manager, and Employee persona journeys with step-by-step workflows and role-based access',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Role-based access control (RBAC) patterns'
        }
      },
      {
        id: 'sec-1-4',
        sectionNumber: '1.4',
        title: 'Database Architecture',
        description: 'Entity relationship diagram, 10 table specifications across career pathing, IDP, and mentorship domains',
        contentLevel: 'reference',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Enterprise-grade data model following Workday patterns'
        }
      },
      {
        id: 'sec-1-5',
        sectionNumber: '1.5',
        title: 'Module Access Points',
        description: 'Admin routes, L&D integration, ESS self-service access, and cross-module navigation',
        contentLevel: 'concept',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Multi-access point architecture for different personas'
        }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 2: CAREER PATHS CONFIGURATION (~50 min)
  // ==========================================================================
  {
    id: 'chapter-2',
    sectionNumber: '2',
    title: 'Career Paths Configuration',
    description: 'Create and manage career paths, define progression steps, link to jobs, and configure prerequisites.',
    contentLevel: 'procedure',
    estimatedReadTime: 50,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-2-1',
        sectionNumber: '2.1',
        title: 'Career Paths Overview',
        description: 'Career path concepts, strategic value, and relationship to job architecture',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-configuration',
          benchmark: 'Structured career progression aligned with job families'
        }
      },
      {
        id: 'sec-2-2',
        sectionNumber: '2.2',
        title: 'Career Paths Table Reference',
        description: 'Complete field reference for career_paths table with 8 columns',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Configuration',
          benchmark: 'Database schema documentation'
        }
      },
      {
        id: 'sec-2-3',
        sectionNumber: '2.3',
        title: 'Create Career Path Procedure',
        description: 'Step-by-step procedure to create career paths via CareerPathsTab UI',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per path creation',
          timing: 'Configuration',
          benchmark: 'Career path definition workflow'
        }
      },
      {
        id: 'sec-2-4',
        sectionNumber: '2.4',
        title: 'Career Path Steps Configuration',
        description: 'Add steps to career paths, define progression sequence, and set duration expectations',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per path',
          timing: 'Post path creation',
          benchmark: 'Multi-step career progression modeling'
        }
      },
      {
        id: 'sec-2-5',
        sectionNumber: '2.5',
        title: 'Career Path Steps Table Reference',
        description: 'Complete field reference for career_path_steps table with 8 columns',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Configuration',
          benchmark: 'Database schema documentation'
        }
      },
      {
        id: 'sec-2-6',
        sectionNumber: '2.6',
        title: 'Job Linking & Prerequisites',
        description: 'Link career steps to jobs, define prerequisites, and configure skill requirements',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per step',
          timing: 'Post step creation',
          benchmark: 'Job-career alignment for accurate pathing'
        }
      },
      {
        id: 'sec-2-7',
        sectionNumber: '2.7',
        title: 'Path Activation & Lifecycle',
        description: 'Activate paths, manage versions, archive outdated paths, and handle employee transitions',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Lifecycle events',
          timing: 'Ongoing',
          benchmark: 'Career path versioning and governance'
        }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 3: MENTORSHIP PROGRAMS (~55 min)
  // ==========================================================================
  {
    id: 'chapter-3',
    sectionNumber: '3',
    title: 'Mentorship Programs',
    description: 'Create mentorship programs, manage mentor-mentee pairings, and track mentoring sessions.',
    contentLevel: 'procedure',
    estimatedReadTime: 55,
    targetRoles: ['Admin', 'HR Partner'],
    subsections: [
      {
        id: 'sec-3-1',
        sectionNumber: '3.1',
        title: 'Mentorship Programs Overview',
        description: 'Mentorship value proposition, program types, and organizational benefits',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-configuration',
          benchmark: 'SHRM: Mentorship programs increase retention by 25%'
        }
      },
      {
        id: 'sec-3-2',
        sectionNumber: '3.2',
        title: 'Programs Table Reference',
        description: 'Complete field reference for mentorship_programs table with 11 columns',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Configuration',
          benchmark: 'Database schema documentation'
        }
      },
      {
        id: 'sec-3-3',
        sectionNumber: '3.3',
        title: 'Create Mentorship Program',
        description: 'Step-by-step procedure to create mentorship programs via MentorshipTab UI',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per program',
          timing: 'Configuration',
          benchmark: 'Formal mentorship program establishment'
        }
      },
      {
        id: 'sec-3-4',
        sectionNumber: '3.4',
        title: 'Program Types',
        description: 'Configure succession, development, onboarding, and leadership mentorship programs',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per type',
          timing: 'Configuration',
          benchmark: 'Purpose-driven mentorship categorization'
        }
      },
      {
        id: 'sec-3-5',
        sectionNumber: '3.5',
        title: 'Mentor-Mentee Pairings',
        description: 'Create and manage mentor-mentee pairings with validation and goal setting',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per pairing',
          timing: 'Ongoing',
          benchmark: 'Effective mentor matching strategies'
        }
      },
      {
        id: 'sec-3-6',
        sectionNumber: '3.6',
        title: 'Pairings Table Reference',
        description: 'Complete field reference for mentorship_pairings table with 11 columns',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Configuration',
          benchmark: 'Database schema documentation'
        }
      },
      {
        id: 'sec-3-7',
        sectionNumber: '3.7',
        title: 'Pairing Lifecycle Management',
        description: 'Manage pairing status transitions: active, completed, paused, cancelled',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Lifecycle events',
          timing: 'Ongoing',
          benchmark: 'Pairing governance and completion tracking'
        }
      },
      {
        id: 'sec-3-8',
        sectionNumber: '3.8',
        title: 'Session Tracking',
        description: 'Schedule, complete, and document mentorship sessions with action items',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per session',
          timing: 'Ongoing',
          benchmark: 'Session documentation for accountability'
        }
      },
      {
        id: 'sec-3-9',
        sectionNumber: '3.9',
        title: 'Sessions Table Reference',
        description: 'Complete field reference for mentorship_sessions table with 10 columns',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Configuration',
          benchmark: 'Database schema documentation'
        }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 4: INDIVIDUAL DEVELOPMENT PLANS (~65 min)
  // ==========================================================================
  {
    id: 'chapter-4',
    sectionNumber: '4',
    title: 'Individual Development Plans (IDP)',
    description: 'Create and manage IDPs with goals, activities, and progress tracking for employee development.',
    contentLevel: 'procedure',
    estimatedReadTime: 65,
    targetRoles: ['Admin', 'HR Partner', 'Manager'],
    subsections: [
      {
        id: 'sec-4-1',
        sectionNumber: '4.1',
        title: 'IDP Architecture Overview',
        description: 'IDP structure, goal-activity hierarchy, and integration with performance management',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-configuration',
          benchmark: 'Workday IDP hierarchical model'
        }
      },
      {
        id: 'sec-4-2',
        sectionNumber: '4.2',
        title: 'IDP Table Reference',
        description: 'Complete field reference for individual_development_plans table with 13 columns',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Configuration',
          benchmark: 'Database schema documentation'
        }
      },
      {
        id: 'sec-4-3',
        sectionNumber: '4.3',
        title: 'Create & Manage IDPs',
        description: 'Step-by-step procedure to create IDPs via CareerDevelopmentTab UI',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Per employee',
          timing: 'Annual or as needed',
          benchmark: 'Employee development planning workflow'
        }
      },
      {
        id: 'sec-4-4',
        sectionNumber: '4.4',
        title: 'IDP Goals Configuration',
        description: 'Add development goals to IDPs with categories, priorities, and target dates',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Per IDP',
          timing: 'Post IDP creation',
          benchmark: 'SMART goal setting for development'
        }
      },
      {
        id: 'sec-4-5',
        sectionNumber: '4.5',
        title: 'Goals Table Reference',
        description: 'Complete field reference for idp_goals table with 13 columns',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Configuration',
          benchmark: 'Database schema documentation'
        }
      },
      {
        id: 'sec-4-6',
        sectionNumber: '4.6',
        title: 'Goal Categories',
        description: 'Configure skill, knowledge, experience, certification, and education goal categories',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup',
          timing: 'Configuration',
          benchmark: '70-20-10 development model alignment'
        }
      },
      {
        id: 'sec-4-7',
        sectionNumber: '4.7',
        title: 'IDP Activities',
        description: 'Add activities to goals with types, due dates, and completion tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner', 'Manager'],
        industryContext: {
          frequency: 'Per goal',
          timing: 'Post goal creation',
          benchmark: 'Activity-based development execution'
        }
      },
      {
        id: 'sec-4-8',
        sectionNumber: '4.8',
        title: 'Activities Table Reference',
        description: 'Complete field reference for idp_activities table with 11 columns',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Configuration',
          benchmark: 'Database schema documentation'
        }
      },
      {
        id: 'sec-4-9',
        sectionNumber: '4.9',
        title: 'Activity Types & Progress Tracking',
        description: 'Configure training, mentoring, project, reading, course, and certification activity types',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Configuration',
          timing: 'Setup',
          benchmark: '70-20-10 learning model implementation'
        }
      },
      {
        id: 'sec-4-10',
        sectionNumber: '4.10',
        title: 'IDP Lifecycle',
        description: 'Manage IDP status transitions: draft, active, completed, cancelled with approval workflows',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Lifecycle events',
          timing: 'Ongoing',
          benchmark: 'IDP governance and completion tracking'
        }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 5: DEVELOPMENT THEMES & AI (~45 min)
  // ==========================================================================
  {
    id: 'chapter-5',
    sectionNumber: '5',
    title: 'Development Themes & AI Recommendations',
    description: 'AI-driven development theme generation, confirmation workflows, and learning recommendations.',
    contentLevel: 'procedure',
    estimatedReadTime: 45,
    targetRoles: ['Admin', 'HR Partner'],
    subsections: [
      {
        id: 'sec-5-1',
        sectionNumber: '5.1',
        title: 'AI-Driven Development Overview',
        description: 'How AI generates development themes from talent signals, performance data, and feedback',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-configuration',
          benchmark: 'AI-augmented talent development per ISO 42001'
        }
      },
      {
        id: 'sec-5-2',
        sectionNumber: '5.2',
        title: 'Development Themes Table Reference',
        description: 'Complete field reference for development_themes table with 15 columns',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Configuration',
          benchmark: 'Database schema documentation'
        }
      },
      {
        id: 'sec-5-3',
        sectionNumber: '5.3',
        title: 'Theme Generation from Talent Signals',
        description: 'How themes are generated from appraisals, 360 feedback, goals, and competency assessments',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Automatic',
          timing: 'Post-cycle',
          benchmark: 'Signal aggregation for development insights'
        }
      },
      {
        id: 'sec-5-4',
        sectionNumber: '5.4',
        title: 'Theme Confirmation Workflow',
        description: 'Manager/HR review and confirmation of AI-generated themes before employee visibility',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per theme',
          timing: 'Post-generation',
          benchmark: 'Human-in-the-loop AI governance'
        }
      },
      {
        id: 'sec-5-5',
        sectionNumber: '5.5',
        title: 'Development Recommendations',
        description: 'AI-generated learning and development recommendations linked to themes',
        contentLevel: 'concept',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Per theme',
          timing: 'Post-confirmation',
          benchmark: 'Personalized learning recommendations'
        }
      },
      {
        id: 'sec-5-6',
        sectionNumber: '5.6',
        title: 'Recommendations Table Reference',
        description: 'Complete field reference for development_recommendations table with 10 columns',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Configuration',
          benchmark: 'Database schema documentation'
        }
      },
      {
        id: 'sec-5-7',
        sectionNumber: '5.7',
        title: 'Learning Path Integration',
        description: 'Link recommendations to L&D courses, learning paths, and external resources',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Configuration',
          timing: 'Post-setup',
          benchmark: 'Recommendation-to-learning automation'
        }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 6: CROSS-MODULE INTEGRATION (~40 min)
  // ==========================================================================
  {
    id: 'chapter-6',
    sectionNumber: '6',
    title: 'Cross-Module Integration',
    description: 'Integration architecture with Succession, Performance, 360 Feedback, and Learning modules.',
    contentLevel: 'concept',
    estimatedReadTime: 40,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-6-1',
        sectionNumber: '6.1',
        title: 'Integration Architecture',
        description: 'Data flow architecture between Career Development and connected modules',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Pre-implementation',
          benchmark: 'Enterprise integration patterns'
        }
      },
      {
        id: 'sec-6-2',
        sectionNumber: '6.2',
        title: 'Succession Planning Integration',
        description: 'Link succession candidates to IDPs, gap-to-development linking, and readiness tracking',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Post-succession setup',
          benchmark: 'Cross-reference to Succession Manual Chapter 8'
        }
      },
      {
        id: 'sec-6-3',
        sectionNumber: '6.3',
        title: 'Performance Appraisal Integration',
        description: 'Development actions from appraisal outcomes, competency gap identification',
        contentLevel: 'concept',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Post-appraisal cycle',
          timing: 'Automatic',
          benchmark: 'Performance-to-development automation'
        }
      },
      {
        id: 'sec-6-4',
        sectionNumber: '6.4',
        title: '360 Feedback Integration',
        description: 'Development themes from 360 feedback, multi-rater insights for IDP goals',
        contentLevel: 'concept',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Post-360 cycle',
          timing: 'Automatic',
          benchmark: 'Feedback-driven development'
        }
      },
      {
        id: 'sec-6-5',
        sectionNumber: '6.5',
        title: 'Learning & Training Integration',
        description: 'IDP activities linked to training courses, completion sync, and skill updates',
        contentLevel: 'concept',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Ongoing',
          timing: 'Post-enrollment',
          benchmark: 'Learning-career alignment'
        }
      },
      {
        id: 'sec-6-6',
        sectionNumber: '6.6',
        title: 'ESS Self-Service Access',
        description: 'Employee access to career paths, IDPs, and mentorship via ESS portal',
        contentLevel: 'concept',
        estimatedReadTime: 4,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Post-configuration',
          benchmark: 'Employee self-service enablement'
        }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 7: EMPLOYEE SELF-SERVICE (~35 min)
  // ==========================================================================
  {
    id: 'chapter-7',
    sectionNumber: '7',
    title: 'Employee Self-Service',
    description: 'ESS pages for career paths, development plans, mentorship, and skill gap visualization.',
    contentLevel: 'procedure',
    estimatedReadTime: 35,
    targetRoles: ['Admin', 'Employee'],
    subsections: [
      {
        id: 'sec-7-1',
        sectionNumber: '7.1',
        title: 'My Career Paths Page',
        description: 'Employee view of assigned career paths and current position within paths',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Employee'],
        industryContext: {
          frequency: 'Employee access',
          timing: 'Ongoing',
          benchmark: 'Career visibility for engagement'
        }
      },
      {
        id: 'sec-7-2',
        sectionNumber: '7.2',
        title: 'Career Path Milestones & Progress',
        description: 'Milestone tracking, prerequisite completion, and path progression visualization',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Employee'],
        industryContext: {
          frequency: 'Employee access',
          timing: 'Ongoing',
          benchmark: 'Visual progress tracking'
        }
      },
      {
        id: 'sec-7-3',
        sectionNumber: '7.3',
        title: 'My Development Plan Page',
        description: 'Employee view and self-update of IDP goals and activities',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'Employee'],
        industryContext: {
          frequency: 'Employee access',
          timing: 'Ongoing',
          benchmark: 'Self-directed development'
        }
      },
      {
        id: 'sec-7-4',
        sectionNumber: '7.4',
        title: 'Goal & Activity Self-Update',
        description: 'Employee workflow for updating progress, completing activities, and adding notes',
        contentLevel: 'procedure',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'Employee'],
        industryContext: {
          frequency: 'Employee actions',
          timing: 'Ongoing',
          benchmark: 'Employee ownership of development'
        }
      },
      {
        id: 'sec-7-5',
        sectionNumber: '7.5',
        title: 'My Mentorship Page',
        description: 'Employee view of mentorship pairings, sessions, and action items',
        contentLevel: 'procedure',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Employee'],
        industryContext: {
          frequency: 'Employee access',
          timing: 'Ongoing',
          benchmark: 'Mentorship relationship management'
        }
      },
      {
        id: 'sec-7-6',
        sectionNumber: '7.6',
        title: 'Skill Gap Visualization',
        description: 'Visual representation of skill gaps against career path requirements',
        contentLevel: 'procedure',
        estimatedReadTime: 4,
        targetRoles: ['Admin', 'Employee'],
        industryContext: {
          frequency: 'Employee access',
          timing: 'Ongoing',
          benchmark: 'Gap awareness for targeted development'
        }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 8: REPORTING & ANALYTICS (~30 min)
  // ==========================================================================
  {
    id: 'chapter-8',
    sectionNumber: '8',
    title: 'Reporting & Analytics',
    description: 'Career path coverage, IDP completion, mentorship effectiveness, and development theme analytics.',
    contentLevel: 'reference',
    estimatedReadTime: 30,
    targetRoles: ['Admin', 'HR Partner'],
    subsections: [
      {
        id: 'sec-8-1',
        sectionNumber: '8.1',
        title: 'Career Path Coverage Metrics',
        description: 'Employee coverage by path, progression rates, and path effectiveness',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Monthly/Quarterly',
          timing: 'Reporting',
          benchmark: 'Path utilization and coverage KPIs'
        }
      },
      {
        id: 'sec-8-2',
        sectionNumber: '8.2',
        title: 'IDP Completion Analytics',
        description: 'IDP completion rates, goal achievement, and activity completion trends',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Monthly/Quarterly',
          timing: 'Reporting',
          benchmark: 'Development plan effectiveness'
        }
      },
      {
        id: 'sec-8-3',
        sectionNumber: '8.3',
        title: 'Mentorship Program Effectiveness',
        description: 'Pairing success rates, session completion, and mentorship impact metrics',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Monthly/Quarterly',
          timing: 'Reporting',
          benchmark: 'Mentorship ROI measurement'
        }
      },
      {
        id: 'sec-8-4',
        sectionNumber: '8.4',
        title: 'Development Theme Distribution',
        description: 'AI-generated theme patterns, confirmation rates, and recommendation acceptance',
        contentLevel: 'reference',
        estimatedReadTime: 6,
        targetRoles: ['Admin', 'HR Partner'],
        industryContext: {
          frequency: 'Post-cycle',
          timing: 'Reporting',
          benchmark: 'AI effectiveness in development planning'
        }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 9: TROUBLESHOOTING & FAQs (~25 min)
  // ==========================================================================
  {
    id: 'chapter-9',
    sectionNumber: '9',
    title: 'Troubleshooting & FAQs',
    description: 'Common issues with career paths, IDPs, mentorship, AI themes, and integration sync.',
    contentLevel: 'reference',
    estimatedReadTime: 25,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-9-1',
        sectionNumber: '9.1',
        title: 'Career Path Issues',
        description: 'Troubleshooting path visibility, step ordering, and job linking problems',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Support',
          benchmark: 'Common career path configuration issues'
        }
      },
      {
        id: 'sec-9-2',
        sectionNumber: '9.2',
        title: 'IDP Configuration Problems',
        description: 'Troubleshooting IDP creation, goal assignment, and activity tracking issues',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Support',
          benchmark: 'Common IDP configuration issues'
        }
      },
      {
        id: 'sec-9-3',
        sectionNumber: '9.3',
        title: 'Mentorship Pairing Conflicts',
        description: 'Troubleshooting mentor-mentee matching, program assignment, and session issues',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Support',
          benchmark: 'Common mentorship configuration issues'
        }
      },
      {
        id: 'sec-9-4',
        sectionNumber: '9.4',
        title: 'AI Theme Generation Issues',
        description: 'Troubleshooting theme generation, confidence scoring, and recommendation linking',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Support',
          benchmark: 'AI feature troubleshooting'
        }
      },
      {
        id: 'sec-9-5',
        sectionNumber: '9.5',
        title: 'Integration Sync Problems',
        description: 'Troubleshooting cross-module data sync, trigger failures, and integration errors',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Support',
          benchmark: 'Integration troubleshooting'
        }
      }
    ]
  },

  // ==========================================================================
  // CHAPTER 10: APPENDICES (~15 min)
  // ==========================================================================
  {
    id: 'chapter-10',
    sectionNumber: '10',
    title: 'Appendices',
    description: 'Quick reference cards, field summaries, glossary, and version history.',
    contentLevel: 'reference',
    estimatedReadTime: 15,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-10-1',
        sectionNumber: '10.1',
        title: 'Quick Reference Card',
        description: 'One-page summary of key procedures and navigation paths',
        contentLevel: 'reference',
        estimatedReadTime: 4,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Quick lookup',
          benchmark: 'Rapid reference for common tasks'
        }
      },
      {
        id: 'sec-10-2',
        sectionNumber: '10.2',
        title: 'Field Reference Summary',
        description: 'Complete field reference across all 10 Career Development tables',
        contentLevel: 'reference',
        estimatedReadTime: 5,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Configuration',
          benchmark: 'Complete schema documentation'
        }
      },
      {
        id: 'sec-10-3',
        sectionNumber: '10.3',
        title: 'Glossary',
        description: 'Comprehensive glossary of Career Development terminology',
        contentLevel: 'reference',
        estimatedReadTime: 3,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Quick lookup',
          benchmark: 'Terminology standardization'
        }
      },
      {
        id: 'sec-10-4',
        sectionNumber: '10.4',
        title: 'Version History',
        description: 'Manual version history and change log',
        contentLevel: 'reference',
        estimatedReadTime: 3,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference',
          timing: 'Version tracking',
          benchmark: 'Document governance'
        }
      }
    ]
  }
];

// =============================================================================
// GLOSSARY TERMS
// =============================================================================

export const CAREER_DEV_GLOSSARY: CareerDevGlossaryTerm[] = [
  // Career Path Terms
  { term: 'Career Path', definition: 'A structured sequence of job positions representing a potential progression route within the organization.', category: 'Career Path' },
  { term: 'Career Path Step', definition: 'An individual position or role within a career path, representing a milestone in career progression.', category: 'Career Path' },
  { term: 'Path Activation', definition: 'The process of making a career path available for employee assignment and visibility.', category: 'Career Path' },
  { term: 'Prerequisite', definition: 'Requirements that must be met before an employee can advance to the next step in a career path.', category: 'Career Path' },
  { term: 'Typical Duration', definition: 'The expected time an employee spends at a career path step before progressing to the next level.', category: 'Career Path' },
  
  // IDP Terms
  { term: 'Individual Development Plan (IDP)', definition: 'A personalized document outlining an employee\'s development goals, activities, and timeline for professional growth.', category: 'IDP' },
  { term: 'IDP Goal', definition: 'A specific development objective within an IDP, categorized by type (skill, knowledge, experience, certification, education).', category: 'IDP' },
  { term: 'IDP Activity', definition: 'A specific action or task assigned to achieve an IDP goal, such as training, mentoring, or project work.', category: 'IDP' },
  { term: 'Progress Percentage', definition: 'A numeric indicator (0-100) representing the completion status of an IDP goal or activity.', category: 'IDP' },
  { term: 'Goal Category', definition: 'Classification of development goals: skill, knowledge, experience, certification, or education.', category: 'IDP' },
  { term: 'Activity Type', definition: 'Classification of development activities: training, mentoring, project, reading, course, certification, or other.', category: 'IDP' },
  
  // Mentorship Terms
  { term: 'Mentorship Program', definition: 'A formal organizational initiative pairing experienced mentors with mentees for professional development.', category: 'Mentorship' },
  { term: 'Mentor', definition: 'An experienced employee who guides and advises a less experienced colleague (mentee).', category: 'Mentorship' },
  { term: 'Mentee', definition: 'An employee who receives guidance and advice from a more experienced mentor.', category: 'Mentorship' },
  { term: 'Mentorship Pairing', definition: 'A formal relationship between a mentor and mentee within a mentorship program.', category: 'Mentorship' },
  { term: 'Mentorship Session', definition: 'A scheduled meeting between mentor and mentee to discuss development, provide guidance, and track progress.', category: 'Mentorship' },
  { term: 'Program Type', definition: 'Classification of mentorship programs: succession, development, onboarding, or leadership.', category: 'Mentorship' },
  
  // Development Terms
  { term: '70-20-10 Model', definition: 'A learning and development framework: 70% experiential, 20% social, 10% formal training.', category: 'Development' },
  { term: 'Skill Gap', definition: 'The difference between an employee\'s current skills and the skills required for their target career position.', category: 'Development' },
  { term: 'Competency Gap', definition: 'The difference between an employee\'s current competency levels and the levels required for target roles.', category: 'Development' },
  
  // AI Terms
  { term: 'Development Theme', definition: 'An AI-generated pattern or focus area for employee development based on talent signals and performance data.', category: 'AI' },
  { term: 'Confidence Score', definition: 'A numeric indicator (0-1) representing the AI\'s confidence in a generated theme or recommendation.', category: 'AI' },
  { term: 'Theme Confirmation', definition: 'The human review process to validate AI-generated development themes before employee visibility.', category: 'AI' },
  { term: 'Development Recommendation', definition: 'An AI-suggested learning or development activity linked to a development theme.', category: 'AI' },
  { term: 'Talent Signal', definition: 'Data points from performance, feedback, and assessments used as inputs for AI analysis.', category: 'AI' },
  
  // Integration Terms
  { term: 'Gap-to-Development Linking', definition: 'The process of connecting identified skill or competency gaps to specific IDP goals and activities.', category: 'Integration' },
  { term: 'Succession Integration', definition: 'The connection between Career Development and Succession Planning for candidate development tracking.', category: 'Integration' },
  { term: 'Learning Integration', definition: 'The connection between IDP activities and L&D training courses for automated enrollment and tracking.', category: 'Integration' }
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getCareerDevTotalReadTime(): number {
  return CAREER_DEV_MANUAL_STRUCTURE.reduce((total, chapter) => total + chapter.estimatedReadTime, 0);
}

export function getCareerDevTotalSections(): number {
  return CAREER_DEV_MANUAL_STRUCTURE.reduce((total, chapter) => {
    const subsectionCount = chapter.subsections?.length ?? 0;
    return total + 1 + subsectionCount;
  }, 0);
}

export function getCareerDevSectionById(id: string): CareerDevSection | undefined {
  for (const chapter of CAREER_DEV_MANUAL_STRUCTURE) {
    if (chapter.id === id) return chapter;
    const subsection = chapter.subsections?.find(sub => sub.id === id);
    if (subsection) return subsection;
  }
  return undefined;
}
