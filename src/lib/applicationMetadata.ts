// Application metadata definitions for HRplus Cerebra modules and features
// This provides structured information about the application for documentation generation

export interface ModuleMetadata {
  code: string;
  name: string;
  description: string;
  icon: string;
  routePath: string;
  roleRequirements: string[];
  features: FeatureMetadata[];
  i18nKey?: string;
}

export interface FeatureMetadata {
  code: string;
  name: string;
  description: string;
  routePath?: string;
  roleRequirements: string[];
  workflowSteps?: string[];
  uiElements?: string[];
  i18nKey?: string;
}

export const APPLICATION_MODULES: ModuleMetadata[] = [
  {
    code: 'workforce',
    name: 'Workforce Management',
    description: 'Comprehensive employee and organizational structure management including hiring, positions, departments, and organizational charts.',
    icon: 'Users',
    routePath: '/workforce',
    roleRequirements: ['admin', 'hr_manager'],
    i18nKey: 'sidebar.workforce',
    features: [
      {
        code: 'employees',
        name: 'Employee Directory',
        description: 'View and manage all employee records including personal information, employment history, and documents.',
        routePath: '/workforce/employees',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Search employees', 'View employee profile', 'Edit employee details', 'Manage documents'],
        uiElements: ['Employee table', 'Search bar', 'Filter dropdowns', 'Profile tabs']
      },
      {
        code: 'positions',
        name: 'Position Management',
        description: 'Create and manage job positions, define reporting structures, and configure compensation packages.',
        routePath: '/workforce/positions',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Create position', 'Assign to department', 'Set reporting line', 'Configure compensation'],
        uiElements: ['Position grid', 'Add position dialog', 'Reporting structure viewer']
      },
      {
        code: 'orgchart',
        name: 'Organization Chart',
        description: 'Visual representation of company hierarchy and reporting relationships.',
        routePath: '/workforce/orgchart',
        roleRequirements: ['admin', 'hr_manager', 'employee'],
        workflowSteps: ['Select company', 'Choose view date', 'Navigate hierarchy', 'View position details'],
        uiElements: ['Org chart canvas', 'Date picker', 'Company selector', 'Position cards']
      },
      {
        code: 'departments',
        name: 'Department Management',
        description: 'Manage organizational departments and sections.',
        routePath: '/workforce/departments',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Create department', 'Assign manager', 'Add sections', 'Assign employees'],
        uiElements: ['Department list', 'Add department form', 'Section manager']
      },
      {
        code: 'onboarding',
        name: 'Employee Onboarding',
        description: 'Manage new hire onboarding process with configurable checklists and task tracking.',
        routePath: '/workforce/onboarding',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Create onboarding template', 'Assign to new hire', 'Track task completion', 'Complete onboarding'],
        uiElements: ['Template editor', 'Task checklist', 'Progress tracker', 'Completion dashboard']
      },
      {
        code: 'offboarding',
        name: 'Employee Offboarding',
        description: 'Manage employee exit process with exit interviews and asset return tracking.',
        routePath: '/workforce/offboarding',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Initiate offboarding', 'Conduct exit interview', 'Collect assets', 'Complete separation'],
        uiElements: ['Offboarding checklist', 'Exit interview form', 'Asset return tracker']
      }
    ]
  },
  {
    code: 'leave',
    name: 'Leave Management',
    description: 'Manage employee time off including leave requests, approvals, balances, and policies.',
    icon: 'Calendar',
    routePath: '/leave',
    roleRequirements: ['admin', 'hr_manager'],
    i18nKey: 'sidebar.leave',
    features: [
      {
        code: 'apply',
        name: 'Apply for Leave',
        description: 'Submit leave requests with date selection and approval routing.',
        routePath: '/leave/apply',
        roleRequirements: ['employee'],
        workflowSteps: ['Select leave type', 'Choose dates', 'Add reason', 'Submit for approval'],
        uiElements: ['Leave type dropdown', 'Date range picker', 'Reason textarea', 'Balance display']
      },
      {
        code: 'balances',
        name: 'Leave Balances',
        description: 'View and manage employee leave balances by type.',
        routePath: '/leave/balances',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Select employee', 'View balances by type', 'Adjust balance', 'View history'],
        uiElements: ['Balance cards', 'Adjustment form', 'History table']
      },
      {
        code: 'calendar',
        name: 'Leave Calendar',
        description: 'Visual calendar view of team and organizational leave.',
        routePath: '/leave/calendar',
        roleRequirements: ['admin', 'hr_manager', 'employee'],
        workflowSteps: ['Select date range', 'Filter by department', 'View leave events', 'Click for details'],
        uiElements: ['Calendar grid', 'Department filter', 'Event popover']
      },
      {
        code: 'types',
        name: 'Leave Types Configuration',
        description: 'Configure leave types with accrual rules and eligibility.',
        routePath: '/leave/types',
        roleRequirements: ['admin'],
        workflowSteps: ['Create leave type', 'Set accrual method', 'Define eligibility', 'Activate type'],
        uiElements: ['Type list', 'Configuration form', 'Accrual settings']
      }
    ]
  },
  {
    code: 'payroll',
    name: 'Payroll',
    description: 'Process employee payroll including calculations, deductions, tax management, and payment distribution.',
    icon: 'DollarSign',
    routePath: '/payroll',
    roleRequirements: ['admin', 'hr_manager'],
    i18nKey: 'sidebar.payroll',
    features: [
      {
        code: 'processing',
        name: 'Payroll Processing',
        description: 'Calculate and process payroll runs for pay groups.',
        routePath: '/payroll/processing',
        roleRequirements: ['admin'],
        workflowSteps: ['Select pay group', 'Generate calculations', 'Review results', 'Approve payroll', 'Generate payments'],
        uiElements: ['Pay group selector', 'Calculation grid', 'Approval workflow', 'Payment generation']
      },
      {
        code: 'payslips',
        name: 'Payslips',
        description: 'View and distribute employee payslips.',
        routePath: '/payroll/payslips',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Select pay period', 'View payslips', 'Download PDF', 'Send to employee'],
        uiElements: ['Period selector', 'Payslip viewer', 'Download button', 'Email distribution']
      },
      {
        code: 'tax-config',
        name: 'Tax Configuration',
        description: 'Configure tax brackets and statutory deductions.',
        routePath: '/payroll/tax-config',
        roleRequirements: ['admin'],
        workflowSteps: ['Select country', 'Configure brackets', 'Set rates', 'Activate configuration'],
        uiElements: ['Country selector', 'Bracket editor', 'Rate inputs']
      }
    ]
  },
  {
    code: 'training',
    name: 'Training & Development',
    description: 'Learning management system for employee training, courses, and development tracking.',
    icon: 'GraduationCap',
    routePath: '/training',
    roleRequirements: ['admin', 'hr_manager'],
    i18nKey: 'sidebar.training',
    features: [
      {
        code: 'courses',
        name: 'Course Management',
        description: 'Create and manage training courses and learning content.',
        routePath: '/training/courses',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Create course', 'Add modules', 'Configure settings', 'Publish course'],
        uiElements: ['Course list', 'Course editor', 'Module builder', 'Publishing controls']
      },
      {
        code: 'enrollments',
        name: 'Training Enrollments',
        description: 'Manage employee training enrollments and progress tracking.',
        routePath: '/training/enrollments',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Select course', 'Enroll employees', 'Track progress', 'Issue certificates'],
        uiElements: ['Enrollment table', 'Progress bars', 'Certificate generator']
      },
      {
        code: 'catalog',
        name: 'Course Catalog',
        description: 'Browse available training courses.',
        routePath: '/training/catalog',
        roleRequirements: ['employee'],
        workflowSteps: ['Browse courses', 'View details', 'Self-enroll', 'Start learning'],
        uiElements: ['Course cards', 'Search/filter', 'Enrollment button']
      }
    ]
  },
  {
    code: 'performance',
    name: 'Performance Management',
    description: 'Employee performance appraisals, goal setting, and feedback systems.',
    icon: 'Target',
    routePath: '/performance',
    roleRequirements: ['admin', 'hr_manager'],
    i18nKey: 'sidebar.performance',
    features: [
      {
        code: 'appraisals',
        name: 'Performance Appraisals',
        description: 'Conduct employee performance reviews and evaluations.',
        routePath: '/performance/appraisals',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Create appraisal cycle', 'Assign participants', 'Collect evaluations', 'Review results'],
        uiElements: ['Cycle management', 'Evaluation forms', 'Score dashboard']
      },
      {
        code: 'goals',
        name: 'Goal Management',
        description: 'Set and track employee goals and objectives.',
        routePath: '/performance/goals',
        roleRequirements: ['admin', 'hr_manager', 'employee'],
        workflowSteps: ['Create goal', 'Set targets', 'Track progress', 'Complete goal'],
        uiElements: ['Goal list', 'Progress tracker', 'Completion status']
      },
      {
        code: '360-feedback',
        name: '360-Degree Feedback',
        description: 'Multi-rater feedback collection from peers, managers, and direct reports.',
        routePath: '/performance/360-feedback',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Create review cycle', 'Select reviewers', 'Collect feedback', 'Generate report'],
        uiElements: ['Reviewer selection', 'Feedback forms', 'Anonymous results']
      }
    ]
  },
  {
    code: 'recruitment',
    name: 'Recruitment',
    description: 'Manage job requisitions, candidates, interviews, and hiring workflows.',
    icon: 'UserPlus',
    routePath: '/recruitment',
    roleRequirements: ['admin', 'hr_manager'],
    i18nKey: 'sidebar.recruitment',
    features: [
      {
        code: 'requisitions',
        name: 'Job Requisitions',
        description: 'Create and manage job openings and requisitions.',
        routePath: '/recruitment/requisitions',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Create requisition', 'Get approval', 'Post job', 'Review applications'],
        uiElements: ['Requisition list', 'Job editor', 'Approval workflow']
      },
      {
        code: 'candidates',
        name: 'Candidate Management',
        description: 'Track and manage job candidates through the hiring pipeline.',
        routePath: '/recruitment/candidates',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Review application', 'Schedule interview', 'Evaluate candidate', 'Make offer'],
        uiElements: ['Candidate pipeline', 'Interview scheduler', 'Evaluation forms']
      },
      {
        code: 'offers',
        name: 'Offer Management',
        description: 'Create and manage job offers to candidates.',
        routePath: '/recruitment/offers',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['Create offer', 'Get approval', 'Send to candidate', 'Track response'],
        uiElements: ['Offer editor', 'Approval workflow', 'Acceptance tracking']
      }
    ]
  },
  {
    code: 'ess',
    name: 'Employee Self Service',
    description: 'Self-service portal for employees to manage their own information and requests.',
    icon: 'User',
    routePath: '/ess',
    roleRequirements: ['employee'],
    i18nKey: 'sidebar.ess',
    features: [
      {
        code: 'my-profile',
        name: 'My Profile',
        description: 'View and update personal information.',
        routePath: '/ess/profile',
        roleRequirements: ['employee'],
        workflowSteps: ['View profile', 'Edit information', 'Upload documents', 'Save changes'],
        uiElements: ['Profile tabs', 'Edit forms', 'Document uploader']
      },
      {
        code: 'my-leave',
        name: 'My Leave',
        description: 'View leave balances and submit leave requests.',
        routePath: '/ess/leave',
        roleRequirements: ['employee'],
        workflowSteps: ['Check balance', 'Submit request', 'Track status', 'View history'],
        uiElements: ['Balance cards', 'Request form', 'Status tracker']
      },
      {
        code: 'my-payslips',
        name: 'My Payslips',
        description: 'View and download personal payslips.',
        routePath: '/ess/payslips',
        roleRequirements: ['employee'],
        workflowSteps: ['Select period', 'View payslip', 'Download PDF'],
        uiElements: ['Period list', 'Payslip viewer', 'Download button']
      }
    ]
  },
  {
    code: 'mss',
    name: 'Manager Self Service',
    description: 'Self-service portal for managers to manage their teams.',
    icon: 'Users',
    routePath: '/mss',
    roleRequirements: ['admin', 'hr_manager'],
    i18nKey: 'sidebar.mss',
    features: [
      {
        code: 'my-team',
        name: 'My Team',
        description: 'View and manage direct reports.',
        routePath: '/mss/team',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['View team members', 'Check attendance', 'Review requests', 'Approve actions'],
        uiElements: ['Team grid', 'Attendance summary', 'Pending approvals']
      },
      {
        code: 'team-leave',
        name: 'Team Leave Approvals',
        description: 'Review and approve team leave requests.',
        routePath: '/mss/leave-approvals',
        roleRequirements: ['admin', 'hr_manager'],
        workflowSteps: ['View pending requests', 'Review details', 'Approve or reject', 'Add comments'],
        uiElements: ['Request list', 'Approval buttons', 'Comment box']
      }
    ]
  },
  {
    code: 'admin',
    name: 'Admin & Security',
    description: 'System administration, user management, and security settings.',
    icon: 'Settings',
    routePath: '/admin',
    roleRequirements: ['admin'],
    i18nKey: 'sidebar.admin',
    features: [
      {
        code: 'users',
        name: 'User Management',
        description: 'Manage system users and their access.',
        routePath: '/admin/users',
        roleRequirements: ['admin'],
        workflowSteps: ['View users', 'Create user', 'Assign roles', 'Manage permissions'],
        uiElements: ['User table', 'User form', 'Role assignment']
      },
      {
        code: 'roles',
        name: 'Role Management',
        description: 'Configure roles and their permissions.',
        routePath: '/admin/roles',
        roleRequirements: ['admin'],
        workflowSteps: ['View roles', 'Create role', 'Configure permissions', 'Assign to users'],
        uiElements: ['Role list', 'Permission matrix', 'Assignment panel']
      },
      {
        code: 'audit-logs',
        name: 'Audit Logs',
        description: 'View system activity and audit trail.',
        routePath: '/admin/audit-logs',
        roleRequirements: ['admin'],
        workflowSteps: ['Set date range', 'Filter by action', 'View details', 'Export logs'],
        uiElements: ['Log table', 'Filter panel', 'Detail viewer', 'Export button']
      }
    ]
  }
];

export function getModuleByCode(code: string): ModuleMetadata | undefined {
  return APPLICATION_MODULES.find(m => m.code === code);
}

export function getFeatureByCode(moduleCode: string, featureCode: string): FeatureMetadata | undefined {
  const module = getModuleByCode(moduleCode);
  return module?.features.find(f => f.code === featureCode);
}

export function getAllFeatures(): { module: ModuleMetadata; feature: FeatureMetadata }[] {
  const result: { module: ModuleMetadata; feature: FeatureMetadata }[] = [];
  APPLICATION_MODULES.forEach(module => {
    module.features.forEach(feature => {
      result.push({ module, feature });
    });
  });
  return result;
}

export function getModulesForRole(role: string): ModuleMetadata[] {
  return APPLICATION_MODULES.filter(m => 
    m.roleRequirements.includes(role) || m.roleRequirements.includes('employee')
  );
}
