// Comprehensive capabilities data for PDF export

export interface CapabilityCategoryData {
  title: string;
  items: string[];
}

export interface AICapabilityData {
  type: string;
  description: string;
}

export interface IntegrationData {
  module: string;
  description: string;
}

export interface ModuleData {
  id: string;
  title: string;
  tagline: string;
  overview: string;
  badge?: string;
  categories: CapabilityCategoryData[];
  aiCapabilities: AICapabilityData[];
  integrations: IntegrationData[];
  regionalNote?: string;
}

export interface ActData {
  id: string;
  title: string;
  subtitle: string;
  color: [number, number, number];
  modules: ModuleData[];
}

export const EXECUTIVE_SUMMARY = {
  title: "Intelli HRM",
  subtitle: "AI-First Human Resource Management System",
  description: "Purpose-built for the Caribbean, Latin America, and Africa. Deep regional compliance meets embedded intelligence for enterprise-grade workforce management.",
  stats: [
    { value: "18", label: "Core Modules" },
    { value: "450+", label: "Features" },
    { value: "15+", label: "Countries" },
    { value: "100%", label: "AI-Enhanced" },
  ],
  valueProps: [
    {
      title: "Regional Expertise",
      description: "Deep compliance for Caribbean islands (Jamaica NIS/NHT/PAYE, Trinidad, Barbados), Latin America (Dominican Republic, Mexico), and Africa (Ghana SSNIT, Nigeria PFA). Built-in labor law intelligence."
    },
    {
      title: "AI at the Core",
      description: "Every module features predictive insights, prescriptive recommendations, and automated actions. AI reduces thinking load, not just clicks."
    },
    {
      title: "Cross-Module Intelligence",
      description: "No module exists in isolation. Appraisals feed Succession, Compensation, and Learning. Time data flows to Payroll, Wellness, and Compliance."
    }
  ],
  differentiators: [
    "AI embedded in every module, not bolted on",
    "Native Caribbean & African compliance",
    "Full audit trails with explainable AI",
    "Role-based simplicity with progressive depth"
  ]
};

export const CAPABILITIES_DATA: ActData[] = [
  {
    id: "prologue",
    title: "Prologue: Setting the Stage",
    subtitle: "The foundational modules that power everything else",
    color: [100, 116, 139],
    modules: [
      {
        id: "admin-security",
        title: "Admin & Security",
        tagline: "Enterprise-grade security that scales with you",
        overview: "Foundation for all platform operations with comprehensive user lifecycle management, multi-factor authentication, granular role-based access control, PII protection, organizational scoping, approval workflows, and full audit capabilities with AI-powered security monitoring.",
        badge: "75+ Capabilities",
        categories: [
          {
            title: "User Lifecycle Management",
            items: [
              "User creation with configurable provisioning workflows and approval routing",
              "Bulk user import/export with field mapping validation and error handling",
              "Employee status transitions (active, inactive, terminated) with cascading access removal",
              "Access expiry scheduling with automatic deactivation and notification alerts",
              "Profile management with company-specific configurable fields",
              "Badge number pattern configuration per company with auto-generation",
              "User-to-company, department, and section assignments with effective dating"
            ]
          },
          {
            title: "Authentication & Identity",
            items: [
              "Multi-factor authentication (TOTP, SMS, Email) with configurable enrollment periods",
              "MFA grace periods and mandatory re-authentication for sensitive operations",
              "Password policy configuration (length, complexity, history, special characters)",
              "Password expiry with forced rotation and first-login change enforcement",
              "Single Sign-On integration (SAML 2.0, OIDC) with attribute mapping",
              "Session management with configurable timeout and concurrent session limits",
              "Device binding, browser close logout, and remember-me token management"
            ]
          },
          {
            title: "Role-Based Access Control",
            items: [
              "Granular permission management (View/Create/Edit/Delete) per function",
              "Module, tab, and card-level permission controls",
              "Container-based access scoping for multi-tenant environments",
              "Role inheritance hierarchies with seeded vs. custom role classification",
              "Role type classification (Super Admin, Admin, Business, Self-Service)",
              "Role duplication and templating for rapid deployment",
              "Multi-tenant role visibility controls with activation/deactivation"
            ]
          },
          {
            title: "Data Access & PII Protection",
            items: [
              "PII access levels (None/Limited/Full) configurable per role and domain",
              "Domain-specific PII controls: Personal, Compensation, Banking, Medical, Disciplinary",
              "Field-level data masking with just-in-time (JIT) access for sensitive data",
              "Approval workflows for full PII access with time-limited grants",
              "PII export restrictions and access logging with real-time alerts",
              "GDPR data subject request handling with right to erasure support"
            ]
          },
          {
            title: "Organizational Scope Controls",
            items: [
              "Company-level access restrictions for multi-entity deployments",
              "Division, department, and section-level permission scoping",
              "Pay group and company tag-based access controls",
              "Position type exclusions for sensitive role categories",
              "Hierarchical reporting line visibility controls",
              "Cross-entity permission management for shared services"
            ]
          },
          {
            title: "Approval Workflows & Delegation",
            items: [
              "Configurable multi-step approval workflows with parallel/sequential routing",
              "Approval delegation with date ranges and workflow type restrictions",
              "Auto-escalation with SLA enforcement and reminder notifications",
              "Auto-approval rules for low-risk actions based on configurable thresholds",
              "Digital signature integration for critical approvals",
              "Substitute approver configuration with delegation audit trails",
              "Workflow analytics with bottleneck detection and optimization recommendations"
            ]
          },
          {
            title: "Audit, Compliance & Monitoring",
            items: [
              "Complete activity logging with before/after value comparison (diff view)",
              "Risk-level classification for audit events with priority alerting",
              "Module-based audit filtering with export and long-term archival",
              "Security audit reports and real-time compliance dashboards",
              "Data retention policy configuration with automated enforcement",
              "Investigation request tracking with approval workflows",
              "Access certification campaigns and compliance framework alignment (ISO 27001, SOC 2)"
            ]
          },
          {
            title: "AI Security & Governance",
            items: [
              "AI security violation detection with unauthorized data access monitoring",
              "Role escalation attempt detection and PII query blocking",
              "AI response audit trails with explainability logging",
              "False positive review workflows with severity-based alert routing",
              "AI guardrails configuration with budget limit enforcement",
              "Model registry with approved/prohibited use case management"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Anomaly detection in access patterns and attrition-related access behavior" },
          { type: "Analytics", description: "Security risk scoring, role permission sprawl analysis, unused permission detection" },
          { type: "Automated", description: "Suspicious activity flagging, auto-deactivation triggers, compliance gap alerts" },
          { type: "Prescriptive", description: "Role optimization recommendations and access review suggestions" }
        ],
        integrations: [
          { module: "All Modules", description: "Central authentication, authorization, and audit backbone" },
          { module: "Payroll", description: "Sensitive compensation data access controls and visibility rules" },
          { module: "HR Hub", description: "Policy enforcement and document access permissions" },
          { module: "Performance", description: "360 feedback and investigation access controls" },
          { module: "Compensation", description: "Salary data PII protection and approval workflows" },
          { module: "Employee Relations", description: "Disciplinary record access restrictions" }
        ]
      },
      {
        id: "hr-hub",
        title: "HR Hub",
        tagline: "The central command center for all HR operations",
        overview: "Unified hub for daily operations, documents, policies, communications, compliance tracking, workflow configuration, and cross-module integration. The single source of truth for HR operations with AI-powered insights and automation.",
        badge: "70+ Capabilities",
        categories: [
          {
            title: "Daily Operations",
            items: [
              "Help Desk with full ticketing, SLA management, escalation rules, agent performance tracking, and satisfaction surveys",
              "ESS Change Request management for address, banking, emergency contacts, qualifications, dependents, and government IDs",
              "HR Task Management with priorities, due dates, assignees, recurring schedules, comments, and completion tracking",
              "HR Calendar with event types (meetings, deadlines, training, holidays), company-specific views, and color-coded scheduling",
              "Milestones Dashboard tracking birthdays, work anniversaries, and probation endings with celebration automation",
              "Configurable approval modes per change type (auto-approve, HR review, full workflow) with risk-based routing"
            ]
          },
          {
            title: "Communication & Support",
            items: [
              "Company announcements with targeted messaging by department, location, or employee group",
              "Notifications & Reminders with AI-powered automation rules, event triggers, and recipient targeting",
              "Email template management with versioning, category organization, and merge field support",
              "Multi-channel delivery tracking (email, SMS, in-app) with retry capability and delivery logs",
              "Real-time notification center for ESS approvals, workflow updates, and system alerts",
              "Scheduled communications with read receipt tracking and acknowledgment workflows"
            ]
          },
          {
            title: "Document Center",
            items: [
              "Company document library with categories, types, access controls, and version management",
              "Policy documents with version control, acknowledgment tracking, and compliance alerts",
              "Letter template builder with merge fields, bulk generation, and digital signature integration",
              "Employee document vault with secure storage, expiry tracking, and automated reminders",
              "Multi-language policy support with regulatory update notifications",
              "Forms library for configurable HR processes with workflow integration"
            ]
          },
          {
            title: "Knowledge Base",
            items: [
              "FAQ management with category and tag organization for easy navigation",
              "AI-powered semantic search across all HR content with natural language queries",
              "Ticket deflection analytics measuring self-service effectiveness",
              "Help article workflows with approval, publishing, and content freshness tracking",
              "SOP library with AI assistant integration for step-by-step guidance",
              "Content recommendations based on user queries and browsing patterns"
            ]
          },
          {
            title: "Compliance & Governance",
            items: [
              "Compliance Tracker with categories: Labor Law, Safety Regulations, Tax, Data Protection, Immigration, Benefits, Training, Licensing",
              "Deadline management with responsible party assignment and progress tracking",
              "Overall compliance rate calculation with visual indicators and trend analysis",
              "Status management (compliant, pending, in progress, overdue) with escalation alerts",
              "SOP Management with versioning, applicable roles, effective dates, and global vs company-specific scope",
              "Audit trail for all compliance actions with reporting capabilities"
            ]
          },
          {
            title: "Workflow Configuration",
            items: [
              "Reusable workflow templates for common approval patterns",
              "Transaction workflow settings with company-specific configuration for approval requirements",
              "Approval delegations with date ranges and workflow type restrictions",
              "ESS approval policies with configurable modes (auto-approve, HR review, workflow) per request type",
              "Risk-based policy routing (low/medium/high) for change requests",
              "Documentation requirements and notification settings per workflow step"
            ]
          },
          {
            title: "Organization & Configuration",
            items: [
              "Lookup values management for centralized master data (dropdowns, selections)",
              "Government ID types configuration with country-specific requirements (NIS, BIR, SSN, etc.)",
              "Data Import Wizard with AI validation, dependency checking, and error correction suggestions",
              "Import templates for company structure, positions, employees, and new hires",
              "Import history with full audit trail and status tracking",
              "Org structure visualization with drill-down capabilities"
            ]
          },
          {
            title: "Analytics & Insights",
            items: [
              "AI Sentiment Monitoring with eNPS scoring, organization trends, and department comparison",
              "Active alerts management with severity levels (critical, high, medium) and resolution tracking",
              "Recognition analytics with program effectiveness, leaderboards, and values alignment",
              "Scheduled reports with automated delivery and company/department filtering",
              "Radar charts for top sentiment themes and engagement drivers",
              "Help desk performance metrics with agent productivity and SLA compliance"
            ]
          },
          {
            title: "Integration Hub",
            items: [
              "Cross-module integration dashboard monitoring data flows between Performance, Succession, IDP, PIP, and Compensation",
              "Pending approvals queue with bulk approve/reject capabilities for integration actions",
              "Failed integration retry with automatic and manual retry options",
              "By-module analytics showing success rates, activity volumes, and processing times"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Sentiment trend forecasting and compliance deadline risk detection" },
          { type: "Automated", description: "Auto-categorization for help desk tickets with intelligent routing" },
          { type: "Automated", description: "SOP guidance integration for AI assistant responses" },
          { type: "Automated", description: "Import data validation with correction suggestions" },
          { type: "Prescriptive", description: "Content suggestions based on user queries and patterns" },
          { type: "Prescriptive", description: "Reminder rule recommendations based on company behavior" },
          { type: "Conversational", description: "Intelligent policy search and natural language Q&A" },
          { type: "Analytics", description: "Recognition program effectiveness insights and participation analysis" }
        ],
        integrations: [
          { module: "Help Center", description: "Published KB articles and FAQ content" },
          { module: "ESS", description: "Policy acknowledgments, self-service changes, reminders" },
          { module: "Onboarding", description: "Required policy completions and task checklists" },
          { module: "Performance", description: "Appraisal data flow to integration hub for IDP/PIP triggers" },
          { module: "Succession", description: "9-Box placement integration and talent pool feeds" },
          { module: "Compensation", description: "Salary change workflow integration and approval routing" },
          { module: "Workforce", description: "Org structure data and compliance tracker feeds" },
          { module: "Employee Relations", description: "Pulse surveys feeding sentiment analysis" }
        ]
      }
    ]
  },
  {
    id: "act1",
    title: "Act 1: Attract & Onboard",
    subtitle: "Find, hire, and welcome the best talent",
    color: [59, 130, 246],
    modules: [
      {
        id: "recruitment",
        title: "Recruitment",
        tagline: "Find, attract, and hire the best talent faster",
        overview: "Complete Applicant Tracking System with requisition management, candidate pipeline, and seamless onboarding integration.",
        badge: "55+ Capabilities",
        categories: [
          {
            title: "Requisition Management",
            items: [
              "Job requisition creation and approval",
              "Multi-level approval workflows",
              "Budget tracking and headcount control",
              "Position linking and vacancy management",
              "Hiring manager collaboration",
              "Requisition templates"
            ]
          },
          {
            title: "Job Posting & Sourcing",
            items: [
              "Branded career portal",
              "Multi-channel job distribution",
              "Custom application forms",
              "Job board integrations",
              "Employee referral program",
              "Social media sharing"
            ]
          },
          {
            title: "Candidate Pipeline",
            items: [
              "Visual pipeline management",
              "Stage-based candidate tracking",
              "Bulk actions and updates",
              "Talent pool management",
              "Duplicate candidate detection",
              "Candidate communication history"
            ]
          },
          {
            title: "Selection & Assessment",
            items: [
              "Configurable scorecards",
              "Interview scheduling with calendar sync",
              "Panel review workflows",
              "Assessment integrations",
              "Offer comparison tools",
              "Background check tracking"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Automated", description: "Resume parsing and data extraction" },
          { type: "Predictive", description: "Candidate-job matching scores" },
          { type: "Compliance", description: "Bias detection in screening" },
          { type: "Analytics", description: "Time-to-hire predictions" }
        ],
        integrations: [
          { module: "Workforce", description: "Automatic employee record creation on hire" },
          { module: "Onboarding", description: "Pre-boarding task assignment" },
          { module: "Compensation", description: "Salary benchmarking for offers" }
        ]
      },
      {
        id: "workforce",
        title: "Workforce Management",
        tagline: "The complete employee record, from hire to retire",
        overview: "Comprehensive employee master data, organization structure, position management, and workforce analytics. The core of your HR operations.",
        badge: "100+ Capabilities",
        categories: [
          {
            title: "Employee Master Data",
            items: [
              "16+ configurable data tabs",
              "100+ standard fields with custom field support",
              "Document attachments and expiry tracking",
              "Employment history and transactions",
              "Government ID management (TRN, NIS, etc.)",
              "Dependent and emergency contact tracking"
            ]
          },
          {
            title: "Organization Structure",
            items: [
              "Interactive org charts with date filtering",
              "Department and division hierarchies",
              "Cost center management",
              "Location and site configuration",
              "Reporting relationship management",
              "Org change tracking and history"
            ]
          },
          {
            title: "Position Management",
            items: [
              "Job catalog with job families",
              "Position budgeting and control",
              "Vacancy tracking and reporting",
              "Competency and skill requirements",
              "Headcount planning and requests",
              "Position history and incumbents"
            ]
          },
          {
            title: "Lifecycle & Transactions",
            items: [
              "Promotions and transfers",
              "Terminations with exit workflows",
              "Rehire processing",
              "Mass update capabilities",
              "Onboarding checklists and tasks",
              "Offboarding and clearance"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Attrition risk scoring and alerts" },
          { type: "Analytics", description: "Monte Carlo workforce forecasting" },
          { type: "Prescriptive", description: "Org structure optimization recommendations" },
          { type: "Automated", description: "Probation tracking and alerts" }
        ],
        integrations: [
          { module: "Payroll", description: "Employee compensation and banking data" },
          { module: "Time & Attendance", description: "Schedule assignments and time records" },
          { module: "Performance", description: "Manager relationships and goal owners" },
          { module: "Succession", description: "9-Box placement and career paths" }
        ],
        regionalNote: "Caribbean statutory IDs (TRN, NIS, NHT), African national ID formats, multi-country employment support"
      }
    ]
  },
  {
    id: "act2",
    title: "Act 2: Enable & Engage",
    subtitle: "Empower employees and managers with self-service tools",
    color: [34, 197, 94],
    modules: [
      {
        id: "ess",
        title: "Employee Self-Service (ESS)",
        tagline: "Empower employees with 24/7 HR access",
        overview: "Comprehensive self-service portal enabling employees to manage their personal information, time, pay, and career development independently.",
        badge: "30+ Capabilities",
        categories: [
          {
            title: "Personal Information",
            items: [
              "Profile and contact management",
              "Emergency contact updates",
              "Photo upload and management",
              "Banking details (with approval)",
              "Dependents and beneficiaries",
              "Government ID viewing"
            ]
          },
          {
            title: "Time & Leave",
            items: [
              "Clock in/out with geofencing",
              "Leave request submission",
              "Balance viewing and projections",
              "Schedule and shift viewing",
              "Timesheet submission",
              "Team calendar access"
            ]
          },
          {
            title: "Pay & Benefits",
            items: [
              "Payslip viewing and download",
              "Tax document access",
              "Benefit election management",
              "Claims submission",
              "Total rewards statement",
              "Expense claim submission"
            ]
          },
          {
            title: "Career & Development",
            items: [
              "Goals viewing and progress",
              "Training enrollment",
              "Internal job applications",
              "Skill profile management",
              "Development plan access",
              "Feedback submission"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Prescriptive", description: "Personalized dashboard with smart task prioritization" },
          { type: "Conversational", description: "AI chatbot for HR questions and policy lookup" }
        ],
        integrations: []
      },
      {
        id: "mss",
        title: "Manager Self-Service (MSS)",
        tagline: "Equip managers with real-time team insights",
        overview: "Unified manager portal providing team oversight, approval workflows, performance management, and workforce action capabilities.",
        badge: "35+ Capabilities",
        categories: [
          {
            title: "Team Overview",
            items: [
              "Team org chart and headcount",
              "Attendance summary dashboard",
              "Leave calendar visualization",
              "Direct reports management",
              "Team member profiles",
              "Vacancy and open position tracking"
            ]
          },
          {
            title: "Unified Approvals",
            items: [
              "Consolidated approval inbox",
              "Leave and time-off approvals",
              "Expense and claims approvals",
              "Training request approvals",
              "Requisition approvals",
              "Bulk approval actions"
            ]
          },
          {
            title: "Performance Management",
            items: [
              "Team goal tracking and progress",
              "Feedback and recognition tools",
              "Performance review initiation",
              "Calibration session input",
              "PIP creation and tracking",
              "1-on-1 meeting scheduling"
            ]
          },
          {
            title: "Workforce Actions",
            items: [
              "Promotion and transfer requests",
              "Compensation change requests",
              "Disciplinary action initiation",
              "Termination requests",
              "Onboarding task management",
              "Offboarding coordination"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Team attrition and burnout risk alerts" },
          { type: "Prescriptive", description: "Coaching recommendations based on team dynamics" },
          { type: "Analytics", description: "Workload distribution insights" }
        ],
        integrations: []
      },
      {
        id: "time-attendance",
        title: "Time & Attendance",
        tagline: "Accurate time tracking with smart scheduling",
        overview: "Full time management from clock-in to payroll integration, including shift management, overtime control, and compliance tracking.",
        badge: "40+ Capabilities",
        categories: [
          {
            title: "Clock Operations",
            items: [
              "Web, mobile, and kiosk clock-in",
              "Biometric device integration",
              "GPS and geofencing verification",
              "Facial recognition support",
              "Offline mode with sync",
              "Exception handling workflows"
            ]
          },
          {
            title: "Shift Management",
            items: [
              "Shift template configuration",
              "Rotating schedule support",
              "Shift swap and bid management",
              "Coverage gap identification",
              "Multi-location scheduling",
              "Employee preference matching"
            ]
          },
          {
            title: "Overtime Control",
            items: [
              "Overtime rules and thresholds",
              "Pre-approval workflows",
              "Real-time overtime tracking",
              "Cost allocation by project",
              "Compensatory time management",
              "Overtime reports and alerts"
            ]
          },
          {
            title: "Compliance & Integration",
            items: [
              "Break and meal tracking",
              "Labor law compliance checks",
              "Attendance reporting",
              "Payroll data integration",
              "Project time allocation",
              "Audit trail and history"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Schedule optimization recommendations" },
          { type: "Automated", description: "Anomaly detection in punch patterns" },
          { type: "Analytics", description: "Attendance trend analysis" }
        ],
        integrations: [
          { module: "Payroll", description: "Hours worked and overtime calculations" },
          { module: "Leave", description: "Absence and leave data" },
          { module: "Wellness", description: "Working hours for fatigue monitoring" }
        ],
        regionalNote: "Caribbean overtime rules, regional labor law compliance, multi-jurisdiction shift requirements"
      },
      {
        id: "leave",
        title: "Leave Management",
        tagline: "Flexible leave policies with regional compliance",
        overview: "Comprehensive leave management supporting unlimited leave types, policy configuration, balance tracking, and regional statutory requirements.",
        badge: "35+ Capabilities",
        categories: [
          {
            title: "Leave Types & Rules",
            items: [
              "Unlimited leave type configuration",
              "Accrual rules and formulas",
              "Carry-forward policies",
              "Eligibility and tenure rules",
              "Encashment options",
              "Negative balance handling"
            ]
          },
          {
            title: "Request & Approval",
            items: [
              "Self-service leave requests",
              "Multi-level approval workflows",
              "Attachment requirements",
              "Delegation and proxy",
              "Cancellation workflows",
              "Calendar blocking integration"
            ]
          },
          {
            title: "Balance & Tracking",
            items: [
              "Real-time balance display",
              "Balance projections",
              "Accrual history",
              "Used vs remaining analysis",
              "Expiry notifications",
              "Year-end processing"
            ]
          },
          {
            title: "Calendar & Compliance",
            items: [
              "Team leave calendar",
              "Public holiday configuration",
              "Blackout period management",
              "Minimum staffing rules",
              "Statutory reporting",
              "Absence pattern alerts"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Leave pattern forecasting for staffing" },
          { type: "Prescriptive", description: "Optimal leave approval recommendations" },
          { type: "Automated", description: "Balance alerts and expiry notifications" }
        ],
        integrations: [
          { module: "Time & Attendance", description: "Absence synchronization" },
          { module: "Payroll", description: "Leave pay calculations" },
          { module: "Workforce", description: "Tenure and eligibility data" }
        ],
        regionalNote: "Caribbean statutory leave (Jamaica, Trinidad), African maternity/paternity requirements, regional public holidays"
      }
    ]
  },
  {
    id: "act3",
    title: "Act 3: Pay & Reward",
    subtitle: "Compensate fairly with regional compliance",
    color: [245, 158, 11],
    modules: [
      {
        id: "payroll",
        title: "Payroll",
        tagline: "Multi-country payroll with regional compliance built-in",
        overview: "Enterprise payroll processing with gross-to-net calculations, statutory compliance, and comprehensive reporting for Caribbean and African markets.",
        badge: "50+ Capabilities",
        categories: [
          {
            title: "Pay Processing",
            items: [
              "Scheduled and ad-hoc pay runs",
              "Gross-to-net calculations",
              "Multi-currency support",
              "Retroactive pay calculations",
              "Off-cycle payments",
              "Payroll simulation/preview"
            ]
          },
          {
            title: "Earnings & Deductions",
            items: [
              "Unlimited pay code configuration",
              "Formula-based calculations",
              "Court order/garnishment handling",
              "Loan deductions and tracking",
              "Bonus and commission processing",
              "Tip pool distribution"
            ]
          },
          {
            title: "Statutory Compliance",
            items: [
              "NIS contributions (Jamaica, Trinidad)",
              "NHT calculations (Jamaica)",
              "PAYE tax processing",
              "SSNIT contributions (Ghana)",
              "Pension fund compliance",
              "Statutory tax relief schemes"
            ]
          },
          {
            title: "Reporting & Output",
            items: [
              "Payroll journals and GL integration",
              "Bank file generation",
              "Government submission files",
              "Payslip generation and distribution",
              "Year-end processing (P60, IR56)",
              "Variance and audit reports"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Automated", description: "Anomaly detection in payroll data" },
          { type: "Compliance", description: "Pre-run validation and compliance checks" },
          { type: "Predictive", description: "Budget forecasting and variance alerts" }
        ],
        integrations: [
          { module: "Time & Attendance", description: "Hours worked and overtime data" },
          { module: "Compensation", description: "Salary and pay grade information" },
          { module: "Benefits", description: "Deductions and employer contributions" },
          { module: "Finance/GL", description: "Journal entries and cost allocation" }
        ],
        regionalNote: "Full Caribbean statutory support (Jamaica NIS/NHT/PAYE/HEART, Trinidad NIS/PAYE), African payroll (Ghana SSNIT, Nigeria pension), multi-country tax tables"
      },
      {
        id: "compensation",
        title: "Compensation",
        tagline: "Strategic compensation planning with market intelligence",
        overview: "Comprehensive compensation management including salary structures, planning cycles, market benchmarking, and pay equity analysis.",
        badge: "25+ Capabilities",
        categories: [
          {
            title: "Salary Structures",
            items: [
              "Grade and band configuration",
              "Salary ranges with min/mid/max",
              "Geographic differentials",
              "Multi-currency handling",
              "Spinal point systems",
              "Job family alignment"
            ]
          },
          {
            title: "Planning Cycles",
            items: [
              "Merit increase planning",
              "Bonus cycle management",
              "Equity grant planning",
              "Budget controls and limits",
              "Manager worksheets",
              "Approval workflows"
            ]
          },
          {
            title: "Market Analysis",
            items: [
              "Compa-ratio calculations",
              "Quartile positioning",
              "Market benchmark comparison",
              "Salary survey integration",
              "Competitive analysis",
              "Market movement tracking"
            ]
          },
          {
            title: "Pay Equity & Rewards",
            items: [
              "Pay equity analysis",
              "Gender pay gap reporting",
              "Total rewards statements",
              "Benefit valuation",
              "Comprehensive view dashboards",
              "Minimum wage compliance"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Prescriptive", description: "Market-based adjustment recommendations" },
          { type: "Analytics", description: "Pay equity risk identification" },
          { type: "Predictive", description: "Budget optimization scenarios" }
        ],
        integrations: [
          { module: "Payroll", description: "Salary changes and effective dates" },
          { module: "Performance", description: "Rating-based increase guidelines" },
          { module: "Recruitment", description: "Offer salary benchmarking" },
          { module: "Budgeting", description: "Position cost planning" }
        ]
      },
      {
        id: "benefits",
        title: "Benefits Administration",
        tagline: "Comprehensive benefits from enrollment to claims",
        overview: "Full lifecycle benefits management including plan configuration, open enrollment, life events, claims processing, and cost analysis.",
        badge: "45+ Capabilities",
        categories: [
          {
            title: "Plan Configuration",
            items: [
              "Health, life, and pension plans",
              "Voluntary benefit options",
              "Multi-tier coverage structures",
              "Contribution rules and formulas",
              "Dependent eligibility rules",
              "Plan versioning and renewals"
            ]
          },
          {
            title: "Enrollment Management",
            items: [
              "Open enrollment campaigns",
              "Life event processing",
              "Eligibility rule enforcement",
              "Waiting period management",
              "Evidence of insurability",
              "Enrollment confirmations"
            ]
          },
          {
            title: "Claims Processing",
            items: [
              "Claim submission portal",
              "Adjudication workflows",
              "Payment tracking",
              "Appeals management",
              "EOB generation",
              "Claim history and reporting"
            ]
          },
          {
            title: "Cost & Analytics",
            items: [
              "Utilization analysis",
              "Cost trend reporting",
              "Provider rate management",
              "Renewal forecasting",
              "Employee cost modeling",
              "Compliance reporting"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Prescriptive", description: "Personalized plan recommendations" },
          { type: "Predictive", description: "Cost and utilization predictions" },
          { type: "Analytics", description: "Optimization opportunities identification" }
        ],
        integrations: [
          { module: "Payroll", description: "Deduction calculations and contributions" },
          { module: "Workforce", description: "Dependent and eligibility data" },
          { module: "ESS", description: "Self-service enrollment and claims" }
        ],
        regionalNote: "Caribbean health scheme integration, African pension requirements, regional statutory benefit compliance"
      }
    ]
  },
  {
    id: "act4",
    title: "Act 4: Develop & Grow",
    subtitle: "Build capabilities and nurture talent",
    color: [168, 85, 247],
    modules: [
      {
        id: "learning",
        title: "Learning & Development",
        tagline: "Build capabilities with an intelligent LMS",
        overview: "Deliver engaging learning experiences across your organization with our comprehensive learning management system. Support multiple content formats, track certifications, and align development with business objectives.",
        badge: "40+ Capabilities",
        categories: [
          {
            title: "Course Management",
            items: [
              "SCORM 1.2/2004 and xAPI (Tin Can) content support",
              "Built-in content authoring with multimedia support",
              "Course versioning and prerequisite management",
              "Content library with reusable learning objects",
              "Assessment creation with question banks"
            ]
          },
          {
            title: "Learning Paths",
            items: [
              "Career-based learning path configuration",
              "Certification programs with renewal tracking",
              "Compliance training tracks with deadlines",
              "Role-based curriculum assignment",
              "Sequential and parallel path options"
            ]
          },
          {
            title: "Delivery Methods",
            items: [
              "Instructor-led training (ILT) scheduling",
              "Virtual classroom integration (Zoom, Teams)",
              "Self-paced online learning modules",
              "Blended learning program support",
              "Mobile learning with offline access"
            ]
          },
          {
            title: "Compliance Training",
            items: [
              "Mandatory training assignment automation",
              "Deadline tracking with escalation alerts",
              "Completion certificates and badges",
              "Audit-ready compliance reports",
              "Re-certification workflow management"
            ]
          },
          {
            title: "Learning Analytics",
            items: [
              "Course completion rates and trends",
              "Learning effectiveness assessments",
              "Time-to-competency tracking",
              "Training hours per employee metrics",
              "ROI analysis for learning investments"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Skill gap analysis based on role requirements" },
          { type: "Prescriptive", description: "Personalized course recommendations" },
          { type: "Automated", description: "Learning path auto-generation from career goals" }
        ],
        integrations: [
          { module: "Talent Management", description: "Skill development aligned to performance goals" },
          { module: "Succession Planning", description: "Leadership development program tracking" },
          { module: "Recruitment", description: "Onboarding learning assignments" }
        ]
      },
      {
        id: "talent",
        title: "Talent Management",
        tagline: "Transform performance from annual event to continuous culture",
        overview: "Comprehensive talent management spanning goals, appraisals, 360 feedback, and continuous recognition. Drive performance excellence through aligned objectives and meaningful feedback.",
        badge: "50+ Capabilities",
        categories: [
          {
            title: "Goals Management",
            items: [
              "SMART and OKR goal frameworks",
              "Cascading goals with alignment visualization",
              "Goal weighting and priority setting",
              "Progress tracking with milestones",
              "Team and organizational goal dashboards",
              "Goal library with templates"
            ]
          },
          {
            title: "Performance Appraisals",
            items: [
              "Configurable review cycles and templates",
              "Self-assessment and manager evaluation",
              "Competency-based rating scales",
              "Multi-section reviews with weighting",
              "Comments and evidence attachments",
              "Digital signature and acknowledgment"
            ]
          },
          {
            title: "360 Multi-Rater Feedback",
            items: [
              "Peer, upward, and external rater selection",
              "Anonymity controls and thresholds",
              "Customizable questionnaires",
              "Aggregated feedback reports",
              "Rater response tracking",
              "Development action generation"
            ]
          },
          {
            title: "Continuous Feedback",
            items: [
              "Real-time recognition and appreciation",
              "Pulse surveys and quick check-ins",
              "Feedback request workflows",
              "Achievement and milestone logging",
              "Manager coaching prompts",
              "Peer-to-peer feedback channels"
            ]
          },
          {
            title: "Calibration & Development",
            items: [
              "Calibration session management",
              "9-Box talent matrix integration",
              "Rating distribution curves",
              "Individual Development Plans (IDP)",
              "Performance Improvement Plans (PIP)",
              "Manager coaching tools"
            ]
          },
          {
            title: "Performance Analytics",
            items: [
              "Goal completion and alignment metrics",
              "Rating distribution analysis",
              "Performance trend tracking",
              "Feedback frequency dashboards",
              "Engagement correlation insights"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Goal achievement likelihood scoring" },
          { type: "Prescriptive", description: "AI-suggested objectives based on role and strategy" },
          { type: "Automated", description: "Bias detection in ratings and feedback" },
          { type: "Conversational", description: "Comment quality analysis and coaching" }
        ],
        integrations: [
          { module: "Compensation", description: "Performance-based pay recommendations" },
          { module: "Succession Planning", description: "High-performer identification" },
          { module: "Learning", description: "Development gap-based training" }
        ]
      },
      {
        id: "succession",
        title: "Succession Planning",
        tagline: "Identify, develop, and retain future leaders",
        overview: "Ensure business continuity through proactive succession planning. Identify critical positions, build talent pipelines, and develop future leaders with data-driven insights.",
        badge: "35+ Capabilities",
        categories: [
          {
            title: "Critical Position Management",
            items: [
              "Critical position identification and tagging",
              "Vacancy risk assessment scoring",
              "Business impact analysis",
              "Position criticality matrix",
              "Coverage gap reporting"
            ]
          },
          {
            title: "Talent Identification",
            items: [
              "9-Box talent matrix placement",
              "Readiness assessment frameworks",
              "Flight risk indicators",
              "High-potential designation",
              "Talent review sessions",
              "Multi-rater readiness input"
            ]
          },
          {
            title: "Succession Pools",
            items: [
              "Talent pool creation and management",
              "Successor nomination workflows",
              "Development tracking per nominee",
              "Pipeline strength metrics",
              "Succession depth analysis"
            ]
          },
          {
            title: "Career Pathing",
            items: [
              "Career ladder visualization",
              "Skill requirement mapping",
              "Experience milestone tracking",
              "Lateral move recommendations",
              "Career aspiration capture"
            ]
          },
          {
            title: "Leadership Development",
            items: [
              "High-potential program management",
              "Mentoring relationship tracking",
              "Stretch assignment management",
              "Executive coaching integration",
              "Leadership competency development"
            ]
          },
          {
            title: "Succession Analytics",
            items: [
              "Bench strength by position/department",
              "Diversity in pipeline metrics",
              "Readiness progression tracking",
              "Time-to-readiness forecasting",
              "Internal fill rate analysis"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Flight risk prediction for key talent" },
          { type: "Prescriptive", description: "AI-matched successor recommendations" },
          { type: "Automated", description: "Readiness scoring based on performance data" }
        ],
        integrations: [
          { module: "Talent Management", description: "Performance data for readiness assessment" },
          { module: "Learning", description: "Development program enrollment" },
          { module: "Workforce", description: "Position and org structure data" }
        ]
      }
    ]
  },
  {
    id: "act5",
    title: "Act 5: Protect & Support",
    subtitle: "Ensure safety, fairness, and accountability",
    color: [239, 68, 68],
    modules: [
      {
        id: "health-safety",
        title: "Health & Safety (HSE)",
        tagline: "Proactive safety management with compliance built-in",
        overview: "Comprehensive occupational health and safety management from incident reporting to wellness programs. Maintain regulatory compliance while fostering a culture of safety.",
        badge: "50+ Capabilities",
        categories: [
          {
            title: "Incident Management",
            items: [
              "Multi-channel incident reporting (web, mobile, kiosk)",
              "Investigation workflow with root cause analysis",
              "Corrective action tracking and verification",
              "Witness statement collection",
              "Incident classification and severity rating",
              "Near-miss reporting and trending"
            ]
          },
          {
            title: "Risk Assessment",
            items: [
              "Hazard identification workflows",
              "Risk matrices with likelihood/severity scoring",
              "Control measure documentation",
              "Residual risk tracking",
              "Job safety analysis (JSA) templates",
              "Risk register management"
            ]
          },
          {
            title: "Inspections & Audits",
            items: [
              "Scheduled inspection management",
              "Customizable inspection checklists",
              "Finding tracking and resolution",
              "Photo and evidence attachments",
              "Compliance audit scheduling",
              "Corrective action follow-up"
            ]
          },
          {
            title: "PPE Management",
            items: [
              "PPE assignment by role/location",
              "Inventory tracking and reorder alerts",
              "Maintenance and inspection records",
              "Expiry date monitoring",
              "Employee acknowledgment tracking"
            ]
          },
          {
            title: "Wellness Programs",
            items: [
              "Health screening management",
              "Ergonomic assessment tracking",
              "Fitness and wellness program enrollment",
              "Mental health resources",
              "Return-to-work program management"
            ]
          },
          {
            title: "Emergency Management",
            items: [
              "Emergency response plan documentation",
              "Drill scheduling and execution tracking",
              "Emergency contact trees",
              "Evacuation procedure management",
              "Crisis communication templates"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Incident likelihood prediction by location/role" },
          { type: "Prescriptive", description: "Risk mitigation recommendations" },
          { type: "Automated", description: "Compliance deadline alerts and escalations" }
        ],
        integrations: [
          { module: "Workforce", description: "Employee job and location data" },
          { module: "Time & Attendance", description: "Work hours for exposure tracking" },
          { module: "Learning", description: "Safety training compliance" }
        ],
        regionalNote: "OSHA compliance reporting, regional health & safety regulations, and multi-country incident classification standards"
      },
      {
        id: "employee-relations",
        title: "Employee Relations",
        tagline: "Fair, consistent, and compliant employee management",
        overview: "Manage the full spectrum of employee relations from grievances to disciplinary actions. Ensure fair treatment, maintain compliance, and support positive workplace relationships.",
        badge: "45+ Capabilities",
        categories: [
          {
            title: "Case Management",
            items: [
              "Centralized case tracking system",
              "Investigation workflow management",
              "Evidence and document collection",
              "Timeline and milestone tracking",
              "Resolution documentation",
              "Case categorization and trending"
            ]
          },
          {
            title: "Grievance Management",
            items: [
              "Multi-channel grievance submission",
              "Escalation path configuration",
              "Mediation scheduling and tracking",
              "Outcome documentation",
              "Appeal process management",
              "SLA monitoring and alerts"
            ]
          },
          {
            title: "Disciplinary Management",
            items: [
              "Progressive discipline framework",
              "Warning letter generation",
              "Hearing scheduling and documentation",
              "Appeal process workflows",
              "Policy violation tracking",
              "Corrective action monitoring"
            ]
          },
          {
            title: "Union & Labor Relations",
            items: [
              "Collective bargaining agreement (CBA) tracking",
              "Union dues management",
              "Grievance handling per CBA terms",
              "Negotiation documentation",
              "Union representative management"
            ]
          },
          {
            title: "Industrial Relations",
            items: [
              "Labor dispute tracking",
              "Agreement version control",
              "Compliance monitoring",
              "Work council management",
              "Industrial action documentation"
            ]
          },
          {
            title: "Exit Management",
            items: [
              "Resignation processing workflows",
              "Exit interview scheduling and forms",
              "Clearance checklist management",
              "Final settlement tracking",
              "Knowledge transfer documentation",
              "Alumni network management"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Case outcome probability scoring" },
          { type: "Prescriptive", description: "Escalation recommendations based on case type" },
          { type: "Automated", description: "Sentiment analysis in exit interview feedback" }
        ],
        integrations: [
          { module: "Workforce", description: "Employee and manager data" },
          { module: "Payroll", description: "Final settlement calculations" },
          { module: "Company Property", description: "Asset return tracking" }
        ],
        regionalNote: "Regional labor law compliance, statutory termination requirements, and industrial relations frameworks"
      },
      {
        id: "company-property",
        title: "Company Property",
        tagline: "Track and manage all employee-assigned assets",
        overview: "Comprehensive asset management from assignment to return. Track company property throughout the employee lifecycle and maintain accurate inventory records.",
        badge: "30+ Capabilities",
        categories: [
          {
            title: "Asset Registry",
            items: [
              "Complete asset inventory management",
              "Asset categorization and tagging",
              "Depreciation tracking",
              "Maintenance schedule management",
              "Asset lifecycle tracking",
              "Barcode/QR code integration"
            ]
          },
          {
            title: "Asset Assignment",
            items: [
              "Employee asset issuance workflows",
              "Return tracking and verification",
              "Condition reporting at issue/return",
              "Digital acknowledgment signatures",
              "Asset transfer between employees",
              "Temporary assignment management"
            ]
          },
          {
            title: "Lifecycle Integration",
            items: [
              "Onboarding asset provisioning automation",
              "Offboarding return checklist integration",
              "Department-based standard kits",
              "Cost center allocation",
              "Budget impact tracking"
            ]
          },
          {
            title: "Asset Analytics",
            items: [
              "Asset utilization reports",
              "Lifecycle cost analysis",
              "Replacement planning forecasts",
              "Loss and damage tracking",
              "Vendor performance metrics"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Maintenance need predictions based on usage patterns" },
          { type: "Prescriptive", description: "Optimal replacement timing recommendations" },
          { type: "Automated", description: "Utilization optimization suggestions" }
        ],
        integrations: [
          { module: "Workforce", description: "Employee data and department assignment" },
          { module: "Employee Relations", description: "Offboarding clearance checklist" },
          { module: "Payroll", description: "Asset deduction for non-return" }
        ]
      }
    ]
  },
  {
    id: "epilogue",
    title: "Epilogue: Continuous Excellence",
    subtitle: "Support that never stops",
    color: [99, 102, 241],
    modules: [
      {
        id: "help-center",
        title: "Help Center",
        tagline: "Self-service support that reduces HR burden",
        overview: "Empower employees and managers with instant access to knowledge, guided workflows, and intelligent support. Reduce HR ticket volume through comprehensive self-service capabilities.",
        badge: "35+ Capabilities",
        categories: [
          {
            title: "Knowledge Base",
            items: [
              "Searchable article library",
              "FAQ management with categories",
              "Policy document linking",
              "Multimedia content support (video, images)",
              "Article versioning and updates",
              "Role-based content visibility"
            ]
          },
          {
            title: "Support Ticketing",
            items: [
              "Multi-channel ticket creation",
              "Automatic categorization and routing",
              "Priority and SLA management",
              "Ticket status tracking",
              "Internal notes and collaboration",
              "Escalation workflows"
            ]
          },
          {
            title: "Self-Service Tools",
            items: [
              "Guided workflow wizards",
              "Interactive troubleshooting",
              "Video tutorial library",
              "Step-by-step how-to guides",
              "Common task shortcuts"
            ]
          },
          {
            title: "AI Assistant",
            items: [
              "Conversational chatbot interface",
              "Policy-aware question answering",
              "Context-sensitive help suggestions",
              "Automatic article recommendations",
              "Human escalation when needed"
            ]
          },
          {
            title: "Support Analytics",
            items: [
              "Ticket deflection rate tracking",
              "Resolution time metrics",
              "Customer satisfaction (CSAT) scores",
              "Top inquiry trending",
              "Knowledge gap identification",
              "Agent performance dashboards"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Trending inquiry forecasting" },
          { type: "Prescriptive", description: "Article suggestions based on user context" },
          { type: "Automated", description: "Ticket auto-categorization and routing" },
          { type: "Conversational", description: "Natural language policy Q&A" }
        ],
        integrations: [
          { module: "HR Hub", description: "Policy and document library access" },
          { module: "All Modules", description: "Context-aware help from any screen" },
          { module: "Learning", description: "Training recommendations for knowledge gaps" }
        ]
      }
    ]
  }
];

export const PLATFORM_FEATURES = {
  categories: [
    {
      title: "Security & Access Control",
      features: [
        "Role-based access control (RBAC)",
        "Field-level security and PII protection",
        "Complete audit trails",
        "Data encryption at rest and in transit",
        "SSO (SAML 2.0, OAuth 2.0)",
        "Multi-factor authentication (MFA)"
      ]
    },
    {
      title: "Workflow Engine",
      features: [
        "Multi-step approval workflows",
        "Delegation and proxy support",
        "Automatic escalation rules",
        "Digital signature integration",
        "Parallel and sequential approvals",
        "Configurable business rules"
      ]
    },
    {
      title: "Analytics & Reporting",
      features: [
        "Interactive BI dashboards",
        "AI-powered report writer",
        "Monte Carlo workforce forecasting",
        "Custom report builder",
        "Scheduled report distribution",
        "Export to PDF, Excel, PowerPoint"
      ]
    },
    {
      title: "Mobile Experience",
      features: [
        "Fully responsive design",
        "Progressive Web App (PWA)",
        "Offline capability",
        "Push notifications",
        "Mobile clock-in/out with GPS",
        "Native app-like experience"
      ]
    },
    {
      title: "Integration Capabilities",
      features: [
        "RESTful API with full documentation",
        "Webhook event notifications",
        "File import/export (CSV, Excel)",
        "Pre-built ERP connectors",
        "Custom integration support",
        "Real-time data sync"
      ]
    },
    {
      title: "Multi-Entity Support",
      features: [
        "Multi-company configuration",
        "Multi-currency handling",
        "Multi-language (EN, ES, FR, AR)",
        "Consolidated reporting",
        "Entity-specific policies",
        "Shared services model support"
      ]
    }
  ]
};

export const REGIONAL_COMPLIANCE = {
  regions: [
    {
      name: "Caribbean",
      countries: ["Jamaica", "Trinidad & Tobago", "Barbados", "Bahamas", "OECS"],
      highlights: [
        "Jamaica: NIS, NHT, HEART, PAYE, Education Tax",
        "Trinidad: NIS, PAYE, Health Surcharge",
        "Multi-island payroll consolidation",
        "Caribbean labor law compliance",
        "Statutory leave entitlements",
        "Regional public holiday calendars"
      ]
    },
    {
      name: "Africa",
      countries: ["Ghana", "Nigeria", "Kenya", "South Africa"],
      highlights: [
        "Ghana: SSNIT, PAYE, Tier 1/2/3 pensions",
        "Nigeria: Pension Fund Administration",
        "Regional labor law frameworks",
        "Country-specific tax calculations",
        "Union and CBA compliance",
        "Statutory reporting requirements"
      ]
    },
    {
      name: "Global Standards",
      countries: ["GDPR", "ISO 27001", "SOC 2"],
      highlights: [
        "GDPR data protection compliance",
        "Data residency awareness",
        "Consent management",
        "Right to erasure support",
        "Cross-border data transfer controls",
        "Privacy impact assessments"
      ]
    }
  ]
};

export const AI_INTELLIGENCE = {
  capabilities: [
    {
      title: "Predictive Intelligence",
      description: "Anticipate what's coming before it happens",
      examples: [
        "Attrition risk scoring for key employees",
        "Workforce demand forecasting",
        "Incident likelihood by location/role",
        "Budget variance predictions",
        "Time-to-fill estimations for requisitions"
      ]
    },
    {
      title: "Prescriptive Recommendations",
      description: "Know what action to take and why",
      examples: [
        "Compensation adjustment recommendations",
        "Successor matching for critical positions",
        "Personalized learning path suggestions",
        "Optimal scheduling recommendations",
        "Pay equity remediation guidance"
      ]
    },
    {
      title: "Intelligent Automation",
      description: "Reduce manual work with smart automation",
      examples: [
        "Ticket auto-categorization and routing",
        "Anomaly detection in payroll and attendance",
        "Workflow routing optimization",
        "Document classification and extraction",
        "Compliance deadline monitoring"
      ]
    },
    {
      title: "Conversational AI",
      description: "Natural language interaction with HR systems",
      examples: [
        "Policy Q&A with natural language",
        "HR chatbot for employee queries",
        "Natural language report generation",
        "Voice-enabled time tracking",
        "Intelligent search across all modules"
      ]
    }
  ],
  principles: [
    "Explainable Outputs",
    "Human-in-the-Loop",
    "Bias Detection",
    "Audit Trail",
    "ISO 42001 Aligned"
  ]
};
