// Administrator Manual Types - Enterprise-grade documentation structure

export interface ManualSection {
  id: string;
  sectionNumber: string; // e.g., "1", "2.1", "3.2.1"
  title: string;
  description: string;
  contentLevel: 'overview' | 'concept' | 'procedure' | 'reference' | 'troubleshooting';
  estimatedReadTime: number; // in minutes
  targetRoles: string[];
  industryContext?: IndustryContext;
  subsections?: ManualSection[];
}

export interface IndustryContext {
  frequency: string; // e.g., "Annual", "Per cycle", "One-time setup"
  timing: string; // e.g., "Q4", "Start of fiscal year"
  benchmark: string; // Industry standard reference
  compliance?: string[]; // Regulatory requirements
}

export interface ManualArtifact {
  id: string;
  artifactId: string;
  sectionId: string;
  title: string;
  description: string;
  contentLevel: 'Overview' | 'How-To' | 'Advanced' | 'Scenario' | 'FAQ' | 'Video';
  roleScope: string[];
  industryContext: IndustryContext;
  learningObjectives: string[];
  preconditions: string[];
  content: ManualContent;
  expectedOutcomes: string[];
  relatedArtifacts: string[];
  tags: string[];
}

export interface ManualContent {
  introduction?: string;
  conceptExplanation?: string;
  steps?: ManualStep[];
  diagrams?: ManualDiagram[];
  screenshots?: ManualScreenshot[];
  tables?: ManualTable[];
  callouts?: ManualCallout[];
  bestPractices?: string[];
  commonMistakes?: string[];
  troubleshooting?: TroubleshootingItem[];
}

export interface ManualStep {
  order: number;
  title: string;
  description: string;
  substeps?: string[];
  uiRoute?: string;
  screenshot?: ManualScreenshot;
  tips?: string[];
  warnings?: string[];
  expectedResult?: string;
}

export interface ManualDiagram {
  id: string;
  type: 'flowchart' | 'sequence' | 'er' | 'architecture' | 'journey' | 'pie' | 'gantt';
  title: string;
  description: string;
  mermaidCode: string;
}

export interface ManualScreenshot {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  annotations?: ScreenshotAnnotation[];
}

export interface ScreenshotAnnotation {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: 'highlight' | 'callout' | 'arrow';
}

export interface ManualTable {
  title: string;
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ManualCallout {
  type: 'info' | 'tip' | 'warning' | 'danger' | 'industry-standard' | 'best-practice';
  title: string;
  content: string;
}

export interface TroubleshootingItem {
  symptom: string;
  possibleCauses: string[];
  solutions: string[];
  preventionTips?: string[];
}

// Appraisals Manual Structure
export const APPRAISALS_MANUAL_STRUCTURE: ManualSection[] = [
  {
    id: 'part-1',
    sectionNumber: '1',
    title: 'Module Overview & Conceptual Foundation',
    description: 'Introduction to the Appraisals module, core concepts, and system architecture',
    contentLevel: 'overview',
    estimatedReadTime: 30,
    targetRoles: ['All'],
    subsections: [
      {
        id: 'sec-1-1',
        sectionNumber: '1.1',
        title: 'Introduction to Appraisals in Intelli HRM',
        description: 'Purpose, positioning, and key differentiators of the Appraisals module',
        contentLevel: 'overview',
        estimatedReadTime: 10,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Enterprise HRMS standards'
        }
      },
      {
        id: 'sec-1-2',
        sectionNumber: '1.2',
        title: 'Core Concepts & Terminology',
        description: 'CRGV+360 Model, scoring methodology, phase deadlines, and key definitions',
        contentLevel: 'concept',
        estimatedReadTime: 20,
        targetRoles: ['HR User', 'Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: '35-25-30-10 goal-responsibility-competency-values weight distribution with optional 360'
        }
      },
      {
        id: 'sec-1-3',
        sectionNumber: '1.3',
        title: 'User Personas & Journeys',
        description: 'Role-based workflows and user experience paths',
        contentLevel: 'overview',
        estimatedReadTime: 10,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training sessions',
          benchmark: 'Industry-standard persona definitions'
        }
      },
      {
        id: 'sec-1-4',
        sectionNumber: '1.4',
        title: 'System Architecture',
        description: 'Data model, integration points, and technical overview',
        contentLevel: 'reference',
        estimatedReadTime: 20,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Implementation phase',
          benchmark: 'Enterprise HRMS data architecture standards'
        }
      },
      {
        id: 'sec-1-5',
        sectionNumber: '1.5',
        title: 'Performance Management Calendar',
        description: 'Annual cycle planning and timing recommendations',
        contentLevel: 'overview',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Annual planning',
          timing: 'Q1 goal-setting, Q3/Q4 reviews',
          benchmark: 'Industry-standard performance calendar',
          compliance: ['SOX compliance for public companies', 'Industry-specific regulations']
        }
      }
    ]
  },
  {
    id: 'part-2',
    sectionNumber: '2',
    title: 'Setup & Configuration Guide',
    description: 'Complete setup instructions for administrators and consultants',
    contentLevel: 'procedure',
    estimatedReadTime: 90,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-2-1',
        sectionNumber: '2.1',
        title: 'Pre-requisites Checklist',
        description: 'Dependencies and requirements before appraisal setup',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time during implementation',
          timing: '4-6 weeks before go-live',
          benchmark: 'Enterprise implementation methodology'
        }
      },
      {
        id: 'sec-2-2',
        sectionNumber: '2.2',
        title: 'Rating Scales Configuration',
        description: 'Setting up component-level rating scales',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup, annual review',
          timing: 'Pre-implementation',
          benchmark: '5-point scale (1-5) industry standard'
        }
      },
      {
        id: 'sec-2-3',
        sectionNumber: '2.3',
        title: 'Overall Rating Scales Setup',
        description: 'Configuring final appraisal rating categories',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time setup, annual review',
          timing: 'Pre-implementation',
          benchmark: 'Typically 4-5 categories aligned with compensation'
        }
      },
      {
        id: 'sec-2-4a',
        sectionNumber: '2.4a',
        title: 'Skills vs Competencies Explained',
        description: 'Understanding the unified capability framework that powers performance assessment',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant', 'HR User'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Before competency configuration',
          benchmark: 'Industry-standard capability frameworks'
        }
      },
      {
        id: 'sec-2-4',
        sectionNumber: '2.4',
        title: 'Competency Framework Configuration',
        description: 'Import competencies, generate AI indicators, and link to jobs with weights',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Initial setup, quarterly updates',
          timing: 'Post competency library population',
          benchmark: 'Job-based competency assignment with 100% weight validation'
        }
      },
      {
        id: 'sec-2-4b',
        sectionNumber: '2.4b',
        title: 'Responsibility & KRA Configuration',
        description: 'Setting up job responsibilities and Key Result Areas for performance scoring',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Initial setup, per new job',
          timing: 'Before cycle launch',
          benchmark: 'KRA weights must total 100% per responsibility'
        }
      },
      {
        id: 'sec-2-4c',
        sectionNumber: '2.4c',
        title: 'Performance Trend Settings',
        description: 'Configure lookback period, recent performance weight, and trend impact levels',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Annual review',
          timing: 'After initial cycles',
          benchmark: 'Weighted historical performance aggregation with trend recognition'
        }
      },
      {
        id: 'sec-2-readiness',
        sectionNumber: '2.5',
        title: 'Appraisal Readiness',
        description: 'Pre-launch validation dashboard to verify configuration prerequisites',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'Before each cycle launch',
          timing: '2-4 weeks before cycle start',
          benchmark: 'Pre-flight checklist for cycle readiness'
        }
      },
      {
        id: 'sec-2-job-config',
        sectionNumber: '2.6',
        title: 'Job Assessment Configuration',
        description: 'Validate job responsibility weights and KRA structures for accurate scoring',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Annual review, per new job',
          timing: 'Before cycle launch',
          benchmark: 'Responsibility weights must total 100%'
        }
      },
      {
        id: 'sec-2-5',
        sectionNumber: '2.7',
        title: 'Appraisal Form Templates',
        description: 'Creating and configuring evaluation templates with versioning and weight enforcement',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Annual template refresh cycle',
          timing: '2-4 weeks before cycle launch',
          benchmark: 'Role-based template assignment with version control'
        }
      },
      {
        id: 'sec-2-7',
        sectionNumber: '2.8',
        title: 'Rating Levels Configuration',
        description: 'Map overall scores to rating labels, colors, and eligibility flags for automated talent actions',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time, annual review',
          timing: 'Pre-implementation',
          benchmark: 'Eligibility flags: promotion, succession, bonus, PIP automation'
        }
      },
      {
        id: 'sec-2-8',
        sectionNumber: '2.9',
        title: 'Outcome Rules Configuration',
        description: 'Setting up automated actions and module integrations based on appraisal outcomes',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per template, annual review',
          timing: 'Post template creation',
          benchmark: 'Score-based action triggers and cross-module integration'
        }
      },
      {
        id: 'sec-2-6',
        sectionNumber: '2.10',
        title: 'Appraisal Cycles Configuration',
        description: 'Setting up annual, mid-year, quarterly, or probationary cycles with 6-phase deadlines',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per cycle (annual/semi-annual)',
          timing: '4-6 weeks before cycle start',
          benchmark: 'Annual review cycle aligned with fiscal year'
        }
      },
      {
        id: 'sec-2-10',
        sectionNumber: '2.11',
        title: 'Employee Response Configuration',
        description: 'Setting up the employee acknowledgment and response phase',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time, policy review annually',
          timing: 'Pre-implementation',
          benchmark: '5-10 business days response window',
          compliance: ['Labor law compliance', 'Documentation requirements']
        }
      },
      {
        id: 'sec-2-11',
        sectionNumber: '2.12',
        title: 'HR Escalation Settings',
        description: 'Configuring escalation paths for disagreements',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'One-time, policy review annually',
          timing: 'Pre-implementation',
          benchmark: 'Multi-tier escalation workflow'
        }
      },
      {
        id: 'sec-2-12',
        sectionNumber: '2.13',
        title: 'Multi-Position Appraisals Setup',
        description: 'Configuring evaluations for employees with multiple positions',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed for complex org structures',
          timing: 'Post basic setup',
          benchmark: 'Aggregate vs Separate evaluation modes'
        }
      },
      {
        id: 'sec-2-14',
        sectionNumber: '2.14',
        title: 'Benchmarks',
        description: 'Distribution targets for calibration',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Annual review',
          timing: 'Pre-calibration season',
          benchmark: 'Bell curve or custom distribution targets'
        }
      }
    ]
  },
  {
    id: 'part-3',
    sectionNumber: '3',
    title: 'Operational Workflows',
    description: 'Day-to-day procedures for running appraisal cycles',
    contentLevel: 'procedure',
    estimatedReadTime: 90,
    targetRoles: ['HR User', 'Manager', 'Employee'],
    subsections: [
      {
        id: 'sec-3-1',
        sectionNumber: '3.1',
        title: 'Appraisal Cycle Lifecycle',
        description: 'Understanding and managing cycle status progression',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Per cycle execution',
          timing: 'Throughout the cycle',
          benchmark: 'Draft → Active → In Progress → Completed → Closed'
        }
      },
      {
        id: 'sec-3-2',
        sectionNumber: '3.2',
        title: 'Participant Enrollment',
        description: 'Adding employees and assigning evaluators',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User'],
        industryContext: {
          frequency: 'At cycle launch',
          timing: '1-2 weeks before evaluation window',
          benchmark: 'Bulk enrollment with eligibility filters'
        }
      },
      {
        id: 'sec-3-3',
        sectionNumber: '3.3',
        title: 'Self-Assessment Process',
        description: 'Employee guide for completing self-evaluations across all CRGV components',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Employee'],
        industryContext: {
          frequency: 'Per cycle',
          timing: 'Before manager evaluation (1-2 weeks)',
          benchmark: 'Self-assessment completion rate target: 90%+'
        }
      },
      {
        id: 'sec-3-4',
        sectionNumber: '3.4',
        title: 'Goal Rating Process',
        description: 'Evaluating goal achievement with evidence',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Manager', 'Employee'],
        industryContext: {
          frequency: 'Per evaluation',
          timing: 'Part of evaluation window',
          benchmark: 'Evidence-based scoring methodology'
        }
      },
      {
        id: 'sec-3-5',
        sectionNumber: '3.5',
        title: 'Responsibility/KRA Assessment',
        description: 'Rating job responsibilities and Key Result Areas',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Manager', 'Employee'],
        industryContext: {
          frequency: 'Per evaluation',
          timing: 'Part of evaluation window',
          benchmark: 'Weight-adjusted KRA scoring'
        }
      },
      {
        id: 'sec-3-5a',
        sectionNumber: '3.5a',
        title: 'Competency Assessment',
        description: 'Rating behavioral competencies with indicators',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Manager', 'Employee'],
        industryContext: {
          frequency: 'Per evaluation',
          timing: 'Part of evaluation window',
          benchmark: 'Proficiency-level based rating'
        }
      },
      {
        id: 'sec-3-6',
        sectionNumber: '3.6',
        title: 'Values Assessment',
        description: 'Evaluating employees against organizational values',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Manager', 'Employee'],
        industryContext: {
          frequency: 'Per evaluation',
          timing: 'Part of evaluation window',
          benchmark: 'Values alignment with culture initiatives'
        }
      },
      {
        id: 'sec-3-7',
        sectionNumber: '3.7',
        title: 'Manager Evaluation Workflow',
        description: 'Complete guide for managers conducting evaluations across all CRGV components',
        contentLevel: 'procedure',
        estimatedReadTime: 18,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Per cycle (annual/semi-annual)',
          timing: 'During evaluation window (2-4 weeks)',
          benchmark: 'Industry standard 60-90 minutes per evaluation'
        }
      },
      {
        id: 'sec-3-8',
        sectionNumber: '3.8',
        title: 'Appraisal Interview Scheduling',
        description: 'Scheduling and conducting performance discussions',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Per evaluation',
          timing: 'Post-rating, pre-close (within 2 weeks)',
          benchmark: '30-60 minute sessions recommended'
        }
      },
      {
        id: 'sec-3-9',
        sectionNumber: '3.9',
        title: 'Employee Response Phase',
        description: 'Managing employee acknowledgment and disagreements',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Employee', 'HR User'],
        industryContext: {
          frequency: 'Post-evaluation',
          timing: '5-10 business days after manager submission',
          benchmark: 'Response rate target: 95%+',
          compliance: ['Documentation for legal compliance']
        }
      },
      {
        id: 'sec-3-10',
        sectionNumber: '3.10',
        title: 'Role Change Handling',
        description: 'Managing appraisals for employees who changed roles',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'As role changes occur',
          timing: 'During evaluation',
          benchmark: 'Time-weighted contribution percentages'
        }
      },
      {
        id: 'sec-3-11',
        sectionNumber: '3.11',
        title: 'Finalization & Close-out',
        description: 'Completing and archiving the appraisal cycle',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'End of cycle',
          timing: 'Within 2 weeks of deadline',
          benchmark: 'Completion rate target: 95%+'
        }
      },
      {
        id: 'sec-3-12',
        sectionNumber: '3.12',
        title: 'Rating Release Workflow',
        description: 'Releasing finalized ratings to employees and managing the visibility transition',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Post-calibration',
          timing: 'Before employee acknowledgment',
          benchmark: 'Release within 1 week of calibration'
        }
      },
      {
        id: 'sec-3-13',
        sectionNumber: '3.13',
        title: 'Rating Dispute & Acknowledgment',
        description: 'Employee acknowledgment process and formal dispute resolution',
        contentLevel: 'procedure',
        estimatedReadTime: 18,
        targetRoles: ['Employee', 'Manager', 'HR User'],
        industryContext: {
          frequency: 'Post-release',
          timing: '10 business days for acknowledgment',
          benchmark: 'Acknowledgment rate target: 95%+',
          compliance: ['Documentation for legal compliance']
        }
      }
    ]
  },
  {
    id: 'part-4',
    sectionNumber: '4',
    title: 'Calibration Sessions',
    description: 'Running effective calibration to ensure fair and consistent ratings',
    contentLevel: 'procedure',
    estimatedReadTime: 45,
    targetRoles: ['HR User', 'Admin'],
    subsections: [
      {
        id: 'sec-4-1',
        sectionNumber: '4.1',
        title: 'Calibration Concepts & Purpose',
        description: 'Understanding why calibration matters and how it works',
        contentLevel: 'concept',
        estimatedReadTime: 10,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Pre-calibration training',
          timing: 'Before first calibration session',
          benchmark: 'Reduce rating bias by 20-30%'
        }
      },
      {
        id: 'sec-4-2',
        sectionNumber: '4.2',
        title: 'Calibration Session Setup',
        description: 'Creating and configuring calibration sessions',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Once per cycle, post-ratings',
          timing: '1 week before session',
          benchmark: 'Schedule within 2 weeks of rating deadline'
        }
      },
      {
        id: 'sec-4-3',
        sectionNumber: '4.3',
        title: 'Calibration Workspace Guide',
        description: 'Using the calibration interface effectively',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR User'],
        industryContext: {
          frequency: 'During calibration sessions',
          timing: '2-4 hours per session',
          benchmark: 'Facilitator ratio: 1 HR per 50-100 employees'
        }
      },
      {
        id: 'sec-4-4',
        sectionNumber: '4.4',
        title: 'AI-Powered Calibration Features',
        description: 'Leveraging AI for anomaly detection and suggestions',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'During calibration',
          timing: 'Real-time during session',
          benchmark: 'AI accuracy rate: 85%+ for anomaly detection'
        }
      },
      {
        id: 'sec-4-5',
        sectionNumber: '4.5',
        title: 'Nine-Box Grid Integration',
        description: 'Visualizing talent distribution during calibration',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'During/post calibration',
          timing: 'Part of calibration workflow',
          benchmark: 'Performance × Potential matrix'
        }
      },
      {
        id: 'sec-4-6',
        sectionNumber: '4.6',
        title: 'Calibration Governance & Audit',
        description: 'Ensuring compliance and documenting decisions',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Post-calibration review',
          timing: 'Within 1 week of session',
          benchmark: '100% justification documentation',
          compliance: ['Audit trail requirements', 'EEOC compliance']
        }
      }
    ]
  },
  {
    id: 'part-5',
    sectionNumber: '5',
    title: 'AI Features & Intelligence',
    description: 'Leveraging AI capabilities throughout the appraisal process',
    contentLevel: 'procedure',
    estimatedReadTime: 45,
    targetRoles: ['Manager', 'HR User', 'Admin'],
    subsections: [
      {
        id: 'sec-5-1',
        sectionNumber: '5.1',
        title: 'AI Feedback Assistant Overview',
        description: 'Introduction to AI-powered evaluation assistance',
        contentLevel: 'overview',
        estimatedReadTime: 10,
        targetRoles: ['Manager', 'HR User'],
        industryContext: {
          frequency: 'During evaluations',
          timing: 'Throughout evaluation window',
          benchmark: 'Reduces evaluation time by 30-40%'
        }
      },
      {
        id: 'sec-5-2',
        sectionNumber: '5.2',
        title: 'Generating Strength Statements',
        description: 'Using AI to create impactful feedback',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Per evaluation',
          timing: 'During comment writing',
          benchmark: 'Specific, measurable, actionable feedback'
        }
      },
      {
        id: 'sec-5-3',
        sectionNumber: '5.3',
        title: 'Development Suggestions & IDP Links',
        description: 'AI-generated development recommendations',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Manager'],
        industryContext: {
          frequency: 'Per evaluation',
          timing: 'Post-rating',
          benchmark: 'Role-aligned development paths'
        }
      },
      {
        id: 'sec-5-4',
        sectionNumber: '5.4',
        title: 'Bias Detection & Remediation',
        description: 'Identifying and addressing potential bias in evaluations',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Per cycle review',
          timing: 'Pre and post calibration',
          benchmark: 'EEOC compliance requirement',
          compliance: ['Title VII compliance', 'ADA compliance']
        }
      },
      {
        id: 'sec-5-5',
        sectionNumber: '5.5',
        title: 'Comment Quality Analysis',
        description: 'Ensuring meaningful and constructive feedback',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Manager', 'HR User'],
        industryContext: {
          frequency: 'Per evaluation',
          timing: 'During comment review',
          benchmark: 'Quality threshold: 80%+'
        }
      },
      {
        id: 'sec-5-6',
        sectionNumber: '5.6',
        title: 'AI Analytics & Predictions',
        description: 'Advanced insights and predictive capabilities',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Quarterly/Annual review',
          timing: 'Post-cycle analysis',
          benchmark: 'Predictive accuracy: 75%+ for trends'
        }
      }
    ]
  },
  {
    id: 'part-6',
    sectionNumber: '6',
    title: 'Analytics & Reporting',
    description: 'Monitoring, measuring, and reporting on appraisal outcomes',
    contentLevel: 'procedure',
    estimatedReadTime: 30,
    targetRoles: ['HR User', 'Admin'],
    subsections: [
      {
        id: 'sec-6-1',
        sectionNumber: '6.1',
        title: 'Appraisal Analytics Dashboard',
        description: 'Understanding and using the analytics interface',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Weekly during cycle, monthly otherwise',
          timing: 'Throughout cycle',
          benchmark: 'KPIs: Completion rate (95%+), On-time rate (90%+)'
        }
      },
      {
        id: 'sec-6-2',
        sectionNumber: '6.2',
        title: 'Performance Distribution Analysis',
        description: 'Analyzing rating distributions and trends',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Post-calibration',
          timing: 'After calibration sessions',
          benchmark: 'Alert if 40%+ in single category'
        }
      },
      {
        id: 'sec-6-3',
        sectionNumber: '6.3',
        title: 'Manager Scoring Patterns',
        description: 'Identifying and addressing rating tendencies',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Annual review',
          timing: 'Post-cycle analysis',
          benchmark: 'Leniency/strictness detection'
        }
      },
      {
        id: 'sec-6-4',
        sectionNumber: '6.4',
        title: 'Trend Analysis & Predictions',
        description: 'Year-over-year comparisons and forecasting',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Quarterly',
          timing: 'Strategic planning cycles',
          benchmark: '3-year trend minimum for insights'
        }
      }
    ]
  },
  {
    id: 'part-7',
    sectionNumber: '7',
    title: 'Integration & Downstream Impacts',
    description: 'How appraisal data flows to other Intelli HRM modules',
    contentLevel: 'reference',
    estimatedReadTime: 40,
    targetRoles: ['Admin', 'Consultant'],
    subsections: [
      {
        id: 'sec-7-1',
        sectionNumber: '7.1',
        title: 'Integration Overview',
        description: 'Understanding the appraisal data ecosystem',
        contentLevel: 'overview',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Implementation planning',
          benchmark: 'Enterprise data integration patterns'
        }
      },
      {
        id: 'sec-7-2',
        sectionNumber: '7.2',
        title: 'Nine-Box & Succession Integration',
        description: 'Automatic talent placement and succession updates',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'Post-appraisal finalization',
          timing: 'Within 30 days of cycle close',
          benchmark: 'Automatic performance dimension update'
        }
      },
      {
        id: 'sec-7-3',
        sectionNumber: '7.3',
        title: 'IDP/PIP Auto-Creation',
        description: 'Automated development plan generation',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User'],
        industryContext: {
          frequency: 'Per triggered action',
          timing: 'Within 14 days of finalization',
          benchmark: 'Score-threshold triggered workflows'
        }
      },
      {
        id: 'sec-7-4',
        sectionNumber: '7.4',
        title: 'Compensation Integration',
        description: 'Linking appraisal outcomes to merit increases',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Compensation planning cycle',
          timing: 'Typically Q1 (aligned with merit cycle)',
          benchmark: 'Performance-to-compa-ratio mapping'
        }
      },
      {
        id: 'sec-7-5',
        sectionNumber: '7.5',
        title: 'Learning & Development Links',
        description: 'Connecting skill gaps to learning recommendations',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['HR User'],
        industryContext: {
          frequency: 'Post-appraisal',
          timing: 'Within 30 days of skill gap identification',
          benchmark: 'AI-powered course recommendations'
        }
      },
      {
        id: 'sec-7-6',
        sectionNumber: '7.6',
        title: 'Notification Orchestration',
        description: 'Automated notifications throughout the process',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Per event',
          timing: 'Event-triggered',
          benchmark: 'Multi-channel notification delivery'
        }
      }
    ]
  },
  {
    id: 'part-8',
    sectionNumber: '8',
    title: 'Troubleshooting & Best Practices',
    description: 'Problem resolution, optimization guidance, and escalation procedures',
    contentLevel: 'troubleshooting',
    estimatedReadTime: 60,
    targetRoles: ['Admin', 'Consultant', 'HR User'],
    subsections: [
      {
        id: 'sec-8-1',
        sectionNumber: '8.1',
        title: 'Common Issues & Solutions',
        description: 'Frequently encountered problems with step-by-step resolution procedures',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 15,
        targetRoles: ['HR User', 'Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Throughout cycle',
          benchmark: 'First-call resolution target: 80%'
        }
      },
      {
        id: 'sec-8-2',
        sectionNumber: '8.2',
        title: 'Best Practices Guide',
        description: 'Industry-validated recommendations organized by cycle phase',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'Annual review',
          timing: 'Pre-cycle planning',
          benchmark: 'Industry-validated practices'
        }
      },
      {
        id: 'sec-8-3',
        sectionNumber: '8.3',
        title: 'Security & Access Control',
        description: 'Permission configuration, RLS policies, and data protection',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Initial setup, annual audit',
          timing: 'Pre-implementation, annual review',
          benchmark: 'Role-based access control (RBAC)',
          compliance: ['GDPR', 'SOC 2', 'Data residency requirements']
        }
      },
      {
        id: 'sec-8-4',
        sectionNumber: '8.4',
        title: 'Compliance & Audit Checklist',
        description: 'Regulatory requirements, audit checklists, and documentation standards',
        contentLevel: 'reference',
        estimatedReadTime: 10,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Quarterly/Annual',
          timing: 'Pre and post-cycle',
          benchmark: '100% audit trail coverage',
          compliance: ['EEOC', 'SOX', 'Industry-specific regulations']
        }
      },
      {
        id: 'sec-8-5',
        sectionNumber: '8.5',
        title: 'Integration Troubleshooting Guide',
        description: 'Error codes, log interpretation, and retry procedures for downstream integrations',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 15,
        targetRoles: ['Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Post-finalization',
          benchmark: '95% integration success rate'
        }
      },
      {
        id: 'sec-8-6',
        sectionNumber: '8.6',
        title: 'Performance Optimization',
        description: 'Large dataset handling, bulk operations, and browser compatibility',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Implementation and scaling',
          benchmark: '<3s page load time'
        }
      },
      {
        id: 'sec-8-7',
        sectionNumber: '8.7',
        title: 'Data Quality & Validation',
        description: 'Pre-cycle validation, data integrity checks, and score calculation verification',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Admin', 'HR User'],
        industryContext: {
          frequency: 'Before each cycle',
          timing: '1-2 weeks pre-launch',
          benchmark: '100% data completeness'
        }
      },
      {
        id: 'sec-8-8',
        sectionNumber: '8.8',
        title: 'Escalation Procedures',
        description: 'Tiered support model, SLA expectations, and communication templates',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 10,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'As needed',
          benchmark: 'P1: 1hr response, P2: 4hr response'
        }
      }
    ]
  }
];

// Quick Reference Cards
export const QUICK_REFERENCE_CARDS = [
  {
    id: 'qr-001',
    title: 'Cycle Setup Checklist',
    description: 'Essential steps for launching an appraisal cycle',
    format: 'checklist'
  },
  {
    id: 'qr-002',
    title: 'Manager Evaluation Quick Guide',
    description: '10-step summary for completing evaluations',
    format: 'steps'
  },
  {
    id: 'qr-003',
    title: 'Calibration Session Prep',
    description: 'Pre-session checklist for facilitators',
    format: 'checklist'
  },
  {
    id: 'qr-004',
    title: 'Troubleshooting Decision Tree',
    description: 'Quick diagnosis for common issues',
    format: 'flowchart'
  },
  {
    id: 'qr-005',
    title: 'Annual Performance Calendar',
    description: 'Timeline for the performance management year',
    format: 'timeline'
  }
];
