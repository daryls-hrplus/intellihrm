// Comprehensive capabilities data for PDF export

export interface CapabilityCategoryData {
  title: string;
  context?: string;  // Context text explaining why this category matters
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

export interface KeyOutcomeData {
  value: string;      // "70%", "5x", "100%"
  label: string;      // "Self-Service Resolution"
  description: string; // "AI-powered knowledge base deflection"
  trend: "up" | "down" | "neutral";
}

export interface PersonaData {
  persona: string;    // "HR Manager"
  benefit: string;    // "Single dashboard, complete control"
  outcomes: string[];
}

export interface RegionalAdvantageData {
  regions: string[];
  advantages: string[];
}

export interface ModuleData {
  id: string;
  title: string;
  tagline: string;
  overview: string;
  badge?: string;
  // Rich content for PDF export (matching web components)
  challenge?: string;
  promise?: string;
  keyOutcomes?: KeyOutcomeData[];
  personas?: PersonaData[];
  categories: CapabilityCategoryData[];
  aiCapabilities: AICapabilityData[];
  integrations: IntegrationData[];
  regionalAdvantage?: RegionalAdvantageData;
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
    { value: "25", label: "Core Modules" },
    { value: "1,675+", label: "Capabilities" },
    { value: "20+", label: "Countries" },
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
        challenge: "Without robust, unified security controls, organizations face fragmented access management, compliance gaps, data breaches, and audit failures. Manual permission management across multiple systems creates security blind spots and consumes valuable HR and IT resources.",
        promise: "Intelli HRM delivers an enterprise-grade security foundation that centralizes authentication, authorization, and audit across all HR operations. From day one, you get the same security architecture trusted by global enterprises—configured for your regional compliance needs.",
        keyOutcomes: [
          { value: "90%", label: "Faster Access Provisioning", description: "Automated user lifecycle vs. manual", trend: "up" },
          { value: "75%", label: "Fewer Security Incidents", description: "With AI-powered anomaly detection", trend: "down" },
          { value: "100%", label: "Audit Ready", description: "Complete trails for every action", trend: "up" },
          { value: "60%", label: "Less Admin Overhead", description: "Self-service and automation", trend: "down" }
        ],
        personas: [
          { persona: "IT Security / Compliance Officer", benefit: "Complete visibility, zero blind spots", outcomes: ["Complete audit trails with before/after comparisons", "Real-time anomaly detection and alerts", "Framework alignment (ISO 27001, SOC 2, GDPR)"] },
          { persona: "HR Administrator", benefit: "Configure once, enforce everywhere", outcomes: ["Self-service password resets and MFA enrollment", "Delegated approvals without security gaps", "Automated access provisioning on hire/term"] },
          { persona: "System Administrator", benefit: "Enterprise power, startup simplicity", outcomes: ["SSO/SAML integration in hours, not weeks", "Granular permissions without complexity", "AI-assisted role optimization suggestions"] },
          { persona: "Employee", benefit: "Seamless access, transparent security", outcomes: ["Single sign-on across all HR functions", "Secure self-service without friction", "Transparent access to their own data"] }
        ],
        categories: [
          {
            title: "User Lifecycle Management",
            context: "Every access decision—from first login to final offboarding—must be tracked, auditable, and aligned with your policies.",
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
            context: "Identity is the new perimeter. Proper authentication prevents 80% of security incidents before they start.",
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
            context: "The right people need the right access—nothing more, nothing less. Role sprawl is a compliance risk waiting to happen.",
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
            context: "Employee data is among the most sensitive in any organization. Protection isn't optional—it's fundamental.",
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
            context: "Multi-entity organizations need security boundaries that mirror their business structure—not fight against it.",
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
            context: "Security should enable business, not block it. Smart workflows balance control with speed.",
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
            context: "When auditors come calling, you need answers in seconds—not days of manual log searching.",
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
            context: "AI amplifies both capabilities and risks. Governance ensures AI serves your security goals, not undermines them.",
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
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Pre-configured for regional data residency requirements",
            "Local compliance frameworks built-in (NIS, GDPR equivalents)",
            "Support for regional SSO providers and identity systems",
            "Multi-jurisdiction audit reporting for cross-border operations"
          ]
        }
      },
      {
        id: "hr-hub",
        title: "HR Hub",
        tagline: "The central command center for all HR operations",
        overview: "Unified hub for daily operations, documents, policies, communications, compliance tracking, workflow configuration, and cross-module integration. The single source of truth for HR operations with AI-powered insights and automation.",
        badge: "70+ Capabilities",
        challenge: "HR teams juggle dozens of disconnected tools—ticketing systems, document repositories, policy libraries, compliance trackers—wasting hours on context-switching and manual coordination. Employees can't find answers, managers lack visibility, and compliance deadlines slip through the cracks.",
        promise: "HR Hub is your single command center for all HR operations. Every document, every policy, every ticket, every compliance deadline—unified in one intelligent workspace with AI that anticipates needs and automates routine work.",
        keyOutcomes: [
          { value: "70%", label: "Self-Service Resolution", description: "AI-powered knowledge base deflection", trend: "up" },
          { value: "100%", label: "Compliance Visibility", description: "Never miss a regulatory requirement", trend: "up" },
          { value: "5x", label: "Faster Document Search", description: "Semantic AI search vs. folder browsing", trend: "up" },
          { value: "40%", label: "HR Admin Time Saved", description: "Automation of routine operations", trend: "down" }
        ],
        personas: [
          { persona: "HR Manager", benefit: "Single dashboard, complete control", outcomes: ["Single dashboard for all team operations", "Real-time compliance and sentiment visibility", "Workflow automation without IT dependency"] },
          { persona: "HR Operations Specialist", benefit: "Efficiency without complexity", outcomes: ["Help desk with SLA tracking and intelligent routing", "Document management with version control", "Bulk operations and data import wizards"] },
          { persona: "Employee", benefit: "Answers when you need them", outcomes: ["Self-service answers without waiting for HR", "Easy policy access and acknowledgment", "Milestone celebrations and recognition"] },
          { persona: "Compliance Officer", benefit: "Proactive compliance, not reactive panic", outcomes: ["Complete compliance tracker by category", "Automated deadline alerts and escalations", "Full audit trail for all policy distributions"] }
        ],
        categories: [
          {
            title: "Daily Operations",
            context: "60% of HR time is spent on routine operational tasks. Automating these frees HR to focus on strategic initiatives.",
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
            context: "Poor communication costs organizations 26% of productive time. Unified communications eliminate the chaos.",
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
            context: "Employees spend 19% of their time searching for information. A smart document center cuts that to near zero.",
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
            context: "Employees ask the same questions repeatedly. A smart knowledge base resolves 70% of queries before they become tickets.",
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
            context: "Non-compliance costs companies $14.82 million annually on average. Proactive tracking prevents costly surprises.",
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
            context: "Every organization is unique. Configurable workflows ensure the system adapts to you, not the other way around.",
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
            context: "Clean data is the foundation of everything. Smart import tools ensure accuracy from day one.",
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
            context: "What gets measured gets managed. Real-time analytics transform reactive HR into strategic partnership.",
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
            context: "Disconnected modules create data silos. The Integration Hub ensures every action flows seamlessly across the platform.",
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
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Pre-built compliance trackers for regional labor laws",
            "Multi-language policy support for diverse workforces",
            "Country-specific government ID configurations",
            "Local holiday calendars and cultural milestone recognition"
          ]
        }
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
        overview: "Complete Applicant Tracking System with AI-powered sourcing, structured assessments, interview coordination, offer management, and seamless onboarding integration. Your end-to-end talent acquisition command center.",
        badge: "85+ Capabilities",
        challenge: "Every open position costs $500 per day unfilled. Manual resume screening misses qualified candidates, interview chaos frustrates hiring managers, and disjointed communication damages your employer brand. Without a unified system, great talent slips through the cracks while competitors move faster.",
        promise: "Intelli HRM Recruitment is your complete talent acquisition command center. From requisition to offer acceptance, AI-powered sourcing, structured interviews, and seamless candidate experiences ensure you hire the best talent 50% faster—while maintaining full compliance and eliminating bias.",
        keyOutcomes: [
          { value: "50%", label: "Faster Time-to-Hire", description: "AI screening + automated workflows", trend: "up" },
          { value: "35%", label: "Higher Candidate Quality", description: "AI matching + structured assessment", trend: "up" },
          { value: "40%", label: "Lower Cost-per-Hire", description: "Job board optimization + referrals", trend: "down" },
          { value: "85%+", label: "Offer Acceptance Rate", description: "Streamlined offer management", trend: "up" }
        ],
        personas: [
          { persona: "Recruiter", benefit: "AI handles the noise so I focus on the best candidates", outcomes: ["AI-powered candidate matching and ranking", "Automated screening with skill extraction", "One-click candidate communication tools"] },
          { persona: "Hiring Manager", benefit: "I see exactly who's in my pipeline and why", outcomes: ["Real-time pipeline visibility with stage tracking", "Structured scorecards for consistent evaluation", "Interview feedback aggregation and insights"] },
          { persona: "HR Leader", benefit: "Complete visibility into hiring metrics and compliance", outcomes: ["Source effectiveness and diversity analytics", "Time-to-fill tracking by department and role", "Bias detection in screening and job postings"] },
          { persona: "Candidate", benefit: "Professional experience that reflects the company brand", outcomes: ["Branded career portal with easy application", "Self-service interview scheduling", "Real-time status updates and communication"] }
        ],
        categories: [
          {
            title: "Requisition Management",
            context: "Every hire starts with proper authorization and budget alignment. Requisitions ensure headcount control and approval compliance.",
            items: [
              "Job requisition creation with position linking",
              "Multi-level approval workflows with configurable routing",
              "Budget tracking and headcount control validation",
              "Hiring manager collaboration portal",
              "Requisition templates by job family",
              "Headcount request integration with workforce planning"
            ]
          },
          {
            title: "Job Posting & Sourcing",
            context: "Reach the right candidates across every channel with consistent branding. Multi-channel distribution maximizes qualified applicant flow.",
            items: [
              "Branded career portal with SEO optimization",
              "Multi-channel job distribution (job boards, social)",
              "Custom application forms by job type",
              "Job board API integrations (Indeed, LinkedIn, etc.)",
              "AI-powered job description optimization",
              "Social media amplification and sharing"
            ]
          },
          {
            title: "Candidate Pipeline",
            context: "Visual pipeline management ensures no candidate falls through the cracks. Real-time tracking keeps hiring on schedule.",
            items: [
              "Kanban-style pipeline visualization",
              "Stage-based candidate tracking with SLAs",
              "Bulk actions and stage transitions",
              "Talent pool management",
              "Duplicate candidate detection",
              "Candidate communication history"
            ]
          },
          {
            title: "Selection & Assessment",
            context: "Structured selection reduces bias and improves hire quality. Consistent evaluation criteria lead to better decisions.",
            items: [
              "Configurable scorecards by role",
              "Interview scheduling with calendar sync",
              "Panel review workflows",
              "Assessment integrations",
              "Offer comparison tools",
              "Background check tracking"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Automated", description: "Resume parsing and skill extraction" },
          { type: "Predictive", description: "Candidate-job matching scores" },
          { type: "Compliance", description: "Bias detection in screening and postings" },
          { type: "Analytics", description: "Time-to-hire and source effectiveness" }
        ],
        integrations: [
          { module: "Workforce", description: "Automatic employee record creation on hire" },
          { module: "Onboarding", description: "Pre-boarding task assignment" },
          { module: "Compensation", description: "Salary benchmarking for offers" }
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Local job board integrations for regional reach",
            "Multi-currency salary and offer support",
            "Regional work permit and visa tracking",
            "Country-specific employment documentation"
          ]
        }
      },
      {
        id: "workforce",
        title: "Workforce Management",
        tagline: "The complete employee record, from hire to retire",
        overview: "Comprehensive employee master data, organization structure, position management, job architecture, headcount planning, and workforce analytics. The single source of truth for your entire organization with 16+ configurable data tabs per employee.",
        badge: "150+ Capabilities",
        challenge: "Employee data scattered across spreadsheets, siloed org charts that are always outdated, and manual position tracking create a governance nightmare. Without a single source of truth, strategic workforce decisions are based on gut feel, compliance risks multiply, and HR spends hours chasing data instead of driving strategy.",
        promise: "Intelli HRM Workforce Management is your organization's living blueprint. Every employee, every position, every reporting relationship—unified in one intelligent system that automatically maintains accuracy, surfaces insights, and enables data-driven workforce planning across countries and entities.",
        keyOutcomes: [
          { value: "99.9%", label: "Data Accuracy", description: "Single source of truth", trend: "up" },
          { value: "80%", label: "Faster Reporting", description: "Real-time dashboards vs. manual", trend: "up" },
          { value: "Near Zero", label: "Compliance Risk", description: "Automated document tracking", trend: "down" },
          { value: "360°", label: "Workforce Visibility", description: "All dimensions, all countries", trend: "up" }
        ],
        personas: [
          { persona: "HR Business Partner", benefit: "I see my entire workforce at a glance with real insights", outcomes: ["Complete employee profiles across 16+ data tabs", "Real-time org structure with drill-down", "Attrition risk alerts and workforce trends"] },
          { persona: "Compensation Analyst", benefit: "Position data flows seamlessly into pay decisions", outcomes: ["Job architecture with salary grade linkage", "Position-based compensation planning", "Market data integration for benchmarking"] },
          { persona: "Compliance Officer", benefit: "Every document tracked, every expiry alerted", outcomes: ["Document expiry tracking with alerts", "Work permit and certification monitoring", "Complete audit trail for all changes"] },
          { persona: "Workforce Planner", benefit: "Scenario modeling with real data, not spreadsheets", outcomes: ["Headcount requests and approval workflows", "Monte Carlo workforce forecasting", "Skills gap analysis and planning"] }
        ],
        categories: [
          {
            title: "Employee Master Data",
            context: "The employee record is the foundation of all HR operations. Complete, accurate data enables every downstream process.",
            items: [
              "100+ standard fields with unlimited custom fields",
              "16+ configurable data tabs per employee",
              "Document attachments with expiry tracking",
              "Employment history and transaction log",
              "Government ID management (TRN, NIS, NHT, SSN, etc.)",
              "Dependent and emergency contact management"
            ]
          },
          {
            title: "Organization Structure",
            context: "Interactive org charts that stay current automatically. Visualize your organization across any dimension.",
            items: [
              "Multi-dimensional org visualization",
              "Date-effective org snapshots and history",
              "Department and division hierarchies",
              "Cost center management",
              "Location and site configuration",
              "Reporting relationship management"
            ]
          },
          {
            title: "Position Management",
            context: "Positions are the building blocks of workforce planning. Proper position management enables budgeting, succession, and compliance.",
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
            context: "Every employee lifecycle event—from promotion to termination—must be tracked and auditable.",
            items: [
              "Promotions and transfers with approval workflows",
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
          { type: "Automated", description: "Probation tracking and document expiry alerts" }
        ],
        integrations: [
          { module: "Payroll", description: "Employee compensation and banking data" },
          { module: "Time & Attendance", description: "Schedule assignments and time records" },
          { module: "Performance", description: "Manager relationships and goal owners" },
          { module: "Succession", description: "9-Box placement and career paths" }
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Caribbean statutory IDs (TRN, NIS, NHT) pre-configured",
            "African national ID formats supported",
            "Multi-country employment contracts and terms",
            "Regional labor law compliance tracking"
          ]
        }
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
        overview: "Comprehensive self-service portal enabling employees to manage their personal information, time, pay, and career development independently—reducing HR burden while increasing employee satisfaction.",
        badge: "75+ Capabilities",
        challenge: "HR is drowning in routine requests. Employees wait days for simple answers about their pay, leave balances, and benefits. Paper forms get lost, phone calls go to voicemail, and email inboxes overflow. Meanwhile, HR spends 70% of their time on transactional tasks instead of strategic initiatives.",
        promise: "Intelli HRM Employee Self-Service puts the power of HR in every employee's pocket. A single, intuitive portal for everything—viewing payslips, requesting leave, updating personal information, tracking goals, and managing careers. Employees get instant answers; HR gets their time back.",
        keyOutcomes: [
          { value: "80%", label: "HR Inquiries Reduced", description: "Self-service replaces routine questions", trend: "down" },
          { value: "90%", label: "Faster Request Processing", description: "Digital workflows vs. paper forms", trend: "up" },
          { value: "+25", label: "eNPS Improvement", description: "Employee satisfaction from self-service", trend: "up" },
          { value: "15 hrs", label: "Admin Time Saved Weekly", description: "Per HR team member", trend: "down" }
        ],
        personas: [
          { persona: "Employee", benefit: "I can manage my work life without waiting for HR", outcomes: ["Instant access to payslips and tax documents", "Self-service leave requests with real-time balance", "Personal information updates with approval tracking"] },
          { persona: "HR Operations", benefit: "I focus on strategy, not answering the same questions", outcomes: ["Automated change request workflows", "Reduced email and phone inquiries", "Complete audit trail for all changes"] },
          { persona: "Manager", benefit: "My team is empowered to help themselves", outcomes: ["Employees resolve own queries", "Visible approval queue", "Team coverage visibility"] },
          { persona: "IT Administrator", benefit: "One portal, fewer support tickets", outcomes: ["Single sign-on integration", "Self-service password management", "Mobile and desktop access"] }
        ],
        categories: [
          {
            title: "Personal Information",
            context: "Employees should own their data. Self-service updates with proper approval workflows reduce errors and HR burden.",
            items: [
              "Profile and contact management with change request workflows",
              "Emergency contact updates with approval routing",
              "Photo upload with verification capability",
              "Banking details management with dual-approval security",
              "Dependents and beneficiaries with lifecycle tracking",
              "Government ID viewing (TRN, NIS, NHT, SSN, BIR)"
            ]
          },
          {
            title: "Time & Leave",
            context: "Time and leave are the most frequent employee interactions. Self-service here has the highest impact on HR efficiency.",
            items: [
              "Clock in/out with geofencing and photo capture",
              "Leave request submission with balance projection",
              "Real-time balance viewing across all leave types",
              "Schedule and shift viewing with swap requests",
              "Timesheet submission and approval tracking",
              "Team calendar access for coverage visibility"
            ]
          },
          {
            title: "Pay & Benefits",
            context: "Pay and benefits questions are sensitive and time-consuming. Self-service reduces anxiety and HR workload.",
            items: [
              "Payslip viewing with drill-down details",
              "Tax document access and download (P45, P60, W-2)",
              "Benefits enrollment and annual elections",
              "Benefit claims submission with documentation",
              "Total rewards statement generation",
              "Expense claim submission with receipt upload"
            ]
          },
          {
            title: "Career & Development",
            context: "Career development shouldn't wait for annual reviews. Self-service tools enable continuous growth.",
            items: [
              "Goals viewing and progress updates",
              "Training enrollment with course catalog",
              "Internal job applications (career portal)",
              "Skill profile management and gap analysis",
              "Development plan access and tracking",
              "Continuous feedback viewing and history"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Prescriptive", description: "Personalized dashboard with smart task prioritization" },
          { type: "Conversational", description: "AI chatbot for HR questions and policy lookup" },
          { type: "Predictive", description: "Leave balance projection with usage recommendations" },
          { type: "Automated", description: "Career path suggestions based on skills and interests" }
        ],
        integrations: [
          { module: "HR Hub", description: "Policies, documents, and announcements" },
          { module: "Time & Attendance", description: "Clock entries and timesheets" },
          { module: "Leave", description: "Balances and request workflows" },
          { module: "Payroll", description: "Payslips and tax documents" },
          { module: "Performance", description: "Goals, feedback, and appraisals" }
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Regional government ID viewing and updates",
            "Country-specific tax document access",
            "Multi-language interface support",
            "Regional public holiday calendars"
          ]
        }
      },
      {
        id: "mss",
        title: "Manager Self-Service (MSS)",
        tagline: "Equip managers with real-time team insights",
        overview: "Unified manager portal providing team oversight, unified approvals, performance management, and workforce action capabilities—with AI that surfaces risks before they become crises.",
        badge: "90+ Capabilities",
        challenge: "Managers are flying blind. Team data is scattered across spreadsheets, approval requests pile up in email, and critical decisions about hiring, promotions, and performance happen without real-time insights. By the time managers notice problems—attrition, burnout, skill gaps—it's often too late to act.",
        promise: "Intelli HRM Manager Self-Service transforms managers into informed leaders. A single dashboard for team oversight, unified approvals, performance management, and workforce actions—with AI that surfaces risks before they become crises. Managers spend less time on admin and more time on leadership.",
        keyOutcomes: [
          { value: "75%", label: "Faster Approval Cycle", description: "Unified inbox + mobile approvals", trend: "up" },
          { value: "60%", label: "Manager Admin Time Reduced", description: "Consolidated workflows", trend: "down" },
          { value: "3 mo", label: "Earlier Risk Detection", description: "AI-powered team alerts", trend: "up" },
          { value: "+40%", label: "Decision Quality", description: "Data-driven recommendations", trend: "up" }
        ],
        personas: [
          { persona: "First-Line Manager", benefit: "I see my team's pulse at a glance and act before issues escalate", outcomes: ["Real-time team attendance and leave visibility", "Unified approval inbox for all requests", "AI-powered attrition and burnout alerts"] },
          { persona: "Senior Manager", benefit: "I have visibility across teams with drill-down when needed", outcomes: ["Multi-level team analytics", "Cross-team coverage planning", "Performance distribution insights"] },
          { persona: "HR Business Partner", benefit: "Managers are self-sufficient, freeing me for strategic work", outcomes: ["Managers handle routine approvals independently", "Exception-based HR escalation", "Coaching prompts for managers"] },
          { persona: "Executive", benefit: "Confident managers make better workforce decisions", outcomes: ["Reduced management overhead", "Consistent policy application", "Data-driven workforce actions"] }
        ],
        categories: [
          {
            title: "Team Overview",
            context: "Managers need a single view of their team's status. Real-time dashboards replace scattered data sources.",
            items: [
              "Team org chart with headcount and vacancy tracking",
              "Attendance summary with real-time status",
              "Leave calendar visualization with coverage gaps",
              "Direct reports quick access with profile cards",
              "Team demographics and tenure analysis",
              "Probation and milestone alerts"
            ]
          },
          {
            title: "Unified Approvals",
            context: "Approval bottlenecks damage employee experience. A unified inbox with mobile access keeps work moving.",
            items: [
              "Consolidated approval inbox across all modules",
              "Leave, time-off, and overtime approvals",
              "Expense and benefit claims approvals",
              "Training request approvals with budget visibility",
              "Requisition and headcount approvals",
              "Bulk approval actions with delegation"
            ]
          },
          {
            title: "Performance Management",
            context: "Performance management is a continuous process, not an annual event. Managers need tools for ongoing coaching.",
            items: [
              "Team goal tracking with cascading alignment",
              "Feedback and recognition delivery tools",
              "Performance review initiation and completion",
              "Calibration session participation",
              "PIP creation, tracking, and milestone management",
              "1-on-1 meeting scheduling and notes"
            ]
          },
          {
            title: "Workforce Actions",
            context: "Managers drive workforce changes. Streamlined workflows with cost visibility enable better decisions.",
            items: [
              "Promotion and transfer requests with cost modeling",
              "Compensation change requests with impact analysis",
              "Disciplinary action initiation with documentation",
              "Termination requests with offboarding trigger",
              "Onboarding task management visibility",
              "Offboarding coordination and exit interviews"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Team attrition and burnout risk alerts" },
          { type: "Prescriptive", description: "Coaching recommendations based on team dynamics" },
          { type: "Analytics", description: "Workload distribution and balance insights" },
          { type: "Predictive", description: "Succession gap detection and readiness alerts" }
        ],
        integrations: [
          { module: "ESS", description: "Employee requests and self-service actions" },
          { module: "Performance", description: "Goals, reviews, and feedback" },
          { module: "Time & Attendance", description: "Timesheet and overtime approvals" },
          { module: "Leave", description: "Leave request approvals" },
          { module: "Recruitment", description: "Requisitions and hiring" }
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Regional labor law guidance for manager decisions",
            "Country-specific approval workflows",
            "Multi-currency cost visibility",
            "Regional compliance alerts"
          ]
        }
      },
      {
        id: "time-attendance",
        title: "Time & Attendance",
        tagline: "Accurate time tracking with intelligent compliance",
        overview: "Comprehensive time management with multiple clock methods, geofencing validation, shift scheduling, overtime control, and seamless payroll integration—with AI-powered anomaly detection and compliance automation.",
        badge: "120+ Capabilities",
        challenge: "Time theft, buddy punching, overtime abuse, and union compliance violations cost organizations millions annually. Manual timesheets are error-prone, shift scheduling is a nightmare, and payroll corrections consume weeks of HR time. Without accurate time data, labor costs spiral out of control.",
        promise: "Intelli HRM Time & Attendance captures every hour with precision and intelligence. Multi-method clocking, geofencing validation, biometric verification, and AI-powered anomaly detection ensure accurate time records. Automated shift scheduling, overtime control, and seamless payroll integration transform time management from a liability into an asset.",
        keyOutcomes: [
          { value: "99.9%", label: "Time Accuracy", description: "Geofencing + biometric verification", trend: "up" },
          { value: "25%", label: "Overtime Costs Reduced", description: "Pre-approval + AI alerts", trend: "down" },
          { value: "80%", label: "Faster Payroll Processing", description: "Automated time-to-pay flow", trend: "up" },
          { value: "~0", label: "Compliance Violations", description: "Union rule automation", trend: "down" }
        ],
        personas: [
          { persona: "Employee", benefit: "Clocking is effortless, and my hours are always correct", outcomes: ["Web, mobile, and kiosk clocking options", "Real-time hour tracking and visibility", "Self-service timesheet access"] },
          { persona: "Supervisor", benefit: "I know exactly who's working and when, in real-time", outcomes: ["Real-time attendance dashboard", "Exception alerts for late arrivals", "Shift coverage visibility"] },
          { persona: "Payroll Administrator", benefit: "Time data flows to payroll without manual intervention", outcomes: ["Automated overtime calculations", "Validated time records for processing", "Exception-based review only"] },
          { persona: "HR Compliance Officer", benefit: "Labor law and CBA compliance is built-in, not bolted-on", outcomes: ["Union time rule automation", "Break and rest period enforcement", "Full audit trail for all punches"] }
        ],
        categories: [
          {
            title: "Multi-Method Clocking",
            context: "Different work environments require different clock methods. Flexibility without sacrificing accuracy.",
            items: [
              "Web, mobile, and kiosk clocking options",
              "Biometric device integration (fingerprint, facial recognition)",
              "GPS and geofencing validation with accuracy tracking",
              "Offline clock support with queue sync",
              "Photo capture on clock-in/out with face verification",
              "Break tracking with automatic enforcement"
            ]
          },
          {
            title: "Shift Management",
            context: "Complex scheduling is a major pain point. AI-assisted scheduling optimizes coverage while respecting preferences.",
            items: [
              "Shift pattern configuration with templates",
              "Rotation schedule management",
              "Shift swap requests with approval workflow",
              "Coverage planning and gap detection",
              "Open shift broadcasting and bidding",
              "Shift differentials by time/day configuration"
            ]
          },
          {
            title: "Overtime Control",
            context: "Overtime costs can spiral without controls. Pre-approval and real-time alerts keep costs in check.",
            items: [
              "Country-specific OT rules (1.5x/2x/3x)",
              "Pre-approval workflows with budget check",
              "Budget and threshold alerts",
              "Weekly/daily hour limit enforcement",
              "Overtime risk alerts with trending analysis",
              "Cost projection by overtime category"
            ]
          },
          {
            title: "Compliance & Integration",
            context: "Labor law compliance varies by country. Built-in rules ensure compliance without manual tracking.",
            items: [
              "Break and meal tracking with enforcement",
              "Labor law compliance checks",
              "CBA agreement management and rule configuration",
              "Payroll data integration",
              "Project time allocation",
              "Complete audit trail and history"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "AI-powered schedule optimization" },
          { type: "Automated", description: "Anomaly detection in punch patterns" },
          { type: "Analytics", description: "Attendance trend analysis and forecasting" },
          { type: "Prescriptive", description: "Overtime risk alerts and recommendations" }
        ],
        integrations: [
          { module: "Payroll", description: "Hours worked and overtime calculations" },
          { module: "Leave", description: "Absence and leave data synchronization" },
          { module: "Workforce", description: "Schedule assignments and employee data" }
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Caribbean overtime rules pre-configured",
            "Regional labor law compliance built-in",
            "Multi-jurisdiction shift requirements",
            "CBA rule automation for unionized workforces"
          ]
        }
      },
      {
        id: "leave",
        title: "Leave Management",
        tagline: "Flexible leave policies for every scenario",
        overview: "Comprehensive leave administration with configurable types, accrual rules, self-service requests, compliance tracking, and liability forecasting—handling every leave scenario across multiple countries.",
        badge: "80+ Capabilities",
        challenge: "Leave management is a compliance minefield. Manual balance tracking leads to errors, policy variations by country create confusion, and coverage gaps during peak vacation seasons cripple operations. Employees don't know their entitlements; managers don't know who's available; HR doesn't know their liability exposure.",
        promise: "Intelli HRM Leave Management handles every leave scenario with precision. From statutory entitlements to custom policies, from accrual calculations to liability forecasting—every leave type, every country, every rule. Employees see real-time balances; managers maintain coverage; compliance is automatic.",
        keyOutcomes: [
          { value: "100%", label: "Balance Accuracy", description: "Automated accrual calculations", trend: "up" },
          { value: "Same Day", label: "Request Processing", description: "Self-service + auto-routing", trend: "up" },
          { value: "~0", label: "Coverage Gaps", description: "Conflict detection + blackouts", trend: "down" },
          { value: "Zero", label: "Compliance Risk", description: "Statutory leave automation", trend: "down" }
        ],
        personas: [
          { persona: "Employee", benefit: "I know exactly what leave I have and can request it instantly", outcomes: ["Real-time balance viewing across all leave types", "Self-service leave requests with projections", "Transparent accrual and usage history"] },
          { persona: "Manager", benefit: "I always have coverage and can plan around absences", outcomes: ["Team leave calendar with conflict detection", "Coverage gap identification and alerts", "Blackout period enforcement"] },
          { persona: "Payroll Administrator", benefit: "Leave pay calculations are automatic and accurate", outcomes: ["Automated leave pay calculations", "Encashment processing integration", "Year-end balance processing"] },
          { persona: "HR Compliance Officer", benefit: "Statutory leave requirements are always met", outcomes: ["Country-specific statutory leave tracking", "Audit-ready leave records", "Liability forecasting and reporting"] }
        ],
        categories: [
          {
            title: "Leave Types & Configuration",
            context: "Every organization has unique leave policies. Unlimited configuration ensures the system adapts to you.",
            items: [
              "30+ configurable leave types",
              "Paid vs. unpaid leave designation",
              "Gender-specific leave types (maternity, paternity)",
              "Accrual-based vs. entitlement-based types",
              "Negative balance allowance with limits",
              "Documentation requirements per leave type"
            ]
          },
          {
            title: "Accrual Engine",
            context: "Accrual rules vary by country, tenure, and policy. A powerful accrual engine handles all scenarios.",
            items: [
              "Multiple accrual rule engines",
              "Service-based entitlement tiers",
              "Pro-ration for mid-year joins",
              "Accrual frequency configuration",
              "Accrual caps and limits",
              "Balance recalculation tools"
            ]
          },
          {
            title: "Request & Approval",
            context: "Leave requests should be fast and transparent. Self-service with smart routing keeps work moving.",
            items: [
              "Self-service leave requests",
              "Multi-level approval workflows",
              "Delegation during absence",
              "Escalation rules with SLA",
              "Document attachment support",
              "Approval history and audit trail"
            ]
          },
          {
            title: "Calendar & Compliance",
            context: "Coverage and compliance are non-negotiable. Smart calendars and statutory tracking ensure both.",
            items: [
              "Team leave calendar with conflict detection",
              "Public holiday configuration by country",
              "Blackout period management",
              "Minimum staffing rules",
              "Statutory leave reporting",
              "Absence pattern alerts"
            ]
          }
        ],
        aiCapabilities: [
          { type: "Predictive", description: "Leave pattern forecasting for staffing" },
          { type: "Prescriptive", description: "Optimal leave approval recommendations" },
          { type: "Automated", description: "Balance alerts and expiry notifications" },
          { type: "Analytics", description: "Leave liability forecasting" }
        ],
        integrations: [
          { module: "Time & Attendance", description: "Absence synchronization" },
          { module: "Payroll", description: "Leave pay calculations" },
          { module: "Workforce", description: "Tenure and eligibility data" }
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Caribbean statutory leave (Jamaica, Trinidad, Barbados)",
            "African maternity/paternity requirements",
            "Regional public holiday calendars",
            "Country-specific accrual rules"
          ]
        }
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
        tagline: "Multi-country payroll with Caribbean, Latin American, and African compliance built-in",
        overview: "Enterprise payroll processing with gross-to-net calculations, statutory compliance, and comprehensive reporting for Caribbean, Latin American, and African markets.",
        badge: "150+ Capabilities",
        challenge: "Payroll errors destroy trust. A single mistake affects employee livelihoods, creates compliance nightmares, and generates weeks of manual corrections. Multi-country operations multiply the complexity—different tax tables, statutory deductions, and filing requirements across Jamaica, Trinidad, Dominican Republic, Ghana, Nigeria, and beyond.",
        promise: "Intelli HRM Payroll is your complete pay processing command center. From gross-to-net calculations with country-specific compliance for the Caribbean, Latin America, and Africa to GL integration and bank file generation, every payrun is accurate, auditable, and on time. AI-powered anomaly detection catches errors before they happen.",
        keyOutcomes: [
          { value: "99.99%", label: "Payroll Accuracy", description: "AI anomaly detection + validation", trend: "up" },
          { value: "70%", label: "Faster Processing Time", description: "Automation vs. manual", trend: "up" },
          { value: "100%", label: "Compliance Audit Ready", description: "Full audit trail + statutory reports", trend: "up" },
          { value: "Real-Time", label: "Cost Allocation", description: "Automated GL integration", trend: "up" }
        ],
        personas: [
          { persona: "Payroll Administrator", benefit: "I process payroll with confidence knowing errors are caught before they matter", outcomes: ["AI-powered anomaly detection", "Pre-run validation checks", "Exception-based review"] },
          { persona: "Finance Controller", benefit: "GL entries and cost allocations are automatic and accurate", outcomes: ["Automated journal entries", "Cost center allocation", "Real-time financial visibility"] },
          { persona: "Compliance Officer", benefit: "Every statutory filing is on time with full documentation", outcomes: ["Country-specific statutory reports", "Government submission files", "Complete audit trail"] },
          { persona: "Employee", benefit: "My pay is always correct, and I can see every detail on my payslip", outcomes: ["Accurate, on-time payments", "Detailed payslip access", "Tax document availability"] }
        ],
        categories: [
          {
            title: "Pay Processing",
            context: "Payroll processing must be accurate, timely, and auditable. Automation reduces errors while maintaining control.",
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
            context: "Complex earning and deduction rules must be handled with precision. Formula-based calculations ensure accuracy.",
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
            context: "Regional compliance is non-negotiable. Pre-built rules for Caribbean, Latin American, and African markets reduce risk.",
            items: [
              "Caribbean: NIS, NHT, HEART, PAYE (Jamaica, Trinidad, Barbados)",
              "Latin America: AFP, TSS (Dominican Republic), IMSS (Mexico)",
              "Africa: SSNIT (Ghana), Pension (Nigeria)",
              "Tax bracket configuration by country",
              "Statutory rate band management",
              "Tax form generation (W-2, P60, IR56)"
            ]
          },
          {
            title: "Reporting & Output",
            context: "Payroll outputs must integrate seamlessly with finance, banking, and government systems.",
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
        regionalAdvantage: {
          regions: ["Caribbean", "Latin America", "Africa"],
          advantages: [
            "Full Caribbean statutory support (Jamaica NIS/NHT/PAYE/HEART, Trinidad, Barbados)",
            "Latin American compliance (Dominican Republic AFP/TSS, Mexico IMSS)",
            "African payroll (Ghana SSNIT, Nigeria pension)",
            "Multi-country tax tables and government filings"
          ]
        }
      },
      {
        id: "compensation",
        title: "Compensation",
        tagline: "Strategic compensation planning with market intelligence",
        overview: "Comprehensive compensation management including salary structures, planning cycles, market benchmarking, and pay equity analysis.",
        badge: "25+ Capabilities",
        challenge: "Compensation decisions made in spreadsheets lead to inconsistency, pay inequity, and talent loss. Without market data integration, organizations either overpay and blow budgets or underpay and lose top performers. Annual planning cycles take months of manual work.",
        promise: "Intelli HRM Compensation brings strategic intelligence to every pay decision. Market benchmarking, pay equity analysis, and budget modeling—all in one platform that ensures competitive, fair, and compliant compensation across your entire workforce.",
        keyOutcomes: [
          { value: "25%", label: "Reduced Comp Admin Time", description: "Automated planning cycles", trend: "down" },
          { value: "15%", label: "Better Budget Accuracy", description: "Data-driven planning", trend: "up" },
          { value: "100%", label: "Pay Equity Visibility", description: "Proactive gap identification", trend: "up" },
          { value: "3x", label: "Faster Planning Cycles", description: "Automated worksheets", trend: "up" }
        ],
        personas: [
          { persona: "Compensation Manager", benefit: "Data-driven decisions, not gut feel", outcomes: ["Market benchmarking integration", "Compa-ratio analysis by segment", "Budget modeling scenarios"] },
          { persona: "HR Business Partner", benefit: "Equip managers with right recommendations", outcomes: ["Manager worksheets with guardrails", "Equity alerts before approvals", "Total rewards visibility"] },
          { persona: "Finance Partner", benefit: "Budget accuracy and cost control", outcomes: ["Real-time budget tracking", "Variance alerts", "Multi-currency consolidation"] },
          { persona: "Employee", benefit: "Fair pay with transparent communication", outcomes: ["Total rewards statements", "Career-based pay progression visibility", "Clear compensation philosophy"] }
        ],
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
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Multi-currency salary structures and conversions",
            "Regional minimum wage compliance",
            "Country-specific pay equity regulations",
            "Local market data integration"
          ]
        }
      },
      {
        id: "benefits",
        title: "Benefits Administration",
        tagline: "Comprehensive benefits from enrollment to claims",
        overview: "Full lifecycle benefits management including plan configuration, open enrollment, life events, claims processing, and cost analysis.",
        badge: "45+ Capabilities",
        challenge: "Paper-based enrollment forms, manual eligibility tracking, and disconnected claims processing create compliance risks and employee frustration. HR spends weeks on open enrollment instead of strategic work, while employees struggle to understand their benefit options.",
        promise: "Intelli HRM Benefits Administration streamlines the entire benefits lifecycle—from plan design to claims resolution. Self-service enrollment, automated eligibility, and AI-powered recommendations ensure employees choose the right benefits while HR maintains full compliance.",
        keyOutcomes: [
          { value: "90%", label: "Self-Service Enrollment", description: "Employees enroll without HR help", trend: "up" },
          { value: "50%", label: "Faster Claims Processing", description: "Automated adjudication", trend: "up" },
          { value: "100%", label: "Eligibility Compliance", description: "Rules engine enforcement", trend: "up" },
          { value: "30%", label: "Reduced Admin Burden", description: "Open enrollment automation", trend: "down" }
        ],
        personas: [
          { persona: "Benefits Administrator", benefit: "Configure once, automate forever", outcomes: ["Plan configuration with versioning", "Automated eligibility enforcement", "Carrier file generation"] },
          { persona: "Employee", benefit: "I understand my options and choose wisely", outcomes: ["Plan comparison tools", "AI-powered recommendations", "Mobile enrollment experience"] },
          { persona: "HR Leader", benefit: "Cost control with employee satisfaction", outcomes: ["Utilization analytics", "Cost trend forecasting", "Competitive benchmarking"] },
          { persona: "Finance", benefit: "Predictable benefits costs", outcomes: ["Accrual tracking", "Renewal forecasting", "Budget vs. actual reporting"] }
        ],
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
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Caribbean health scheme integration (NHI, NHT)",
            "African pension fund requirements (SSNIT, PFA)",
            "Regional statutory benefit compliance",
            "Multi-country carrier integrations"
          ]
        },
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
        challenge: "Static training libraries, manual enrollment tracking, and one-size-fits-all learning paths fail to develop capabilities where they're needed most. Compliance training deadlines slip, skills gaps widen, and L&D investments lack measurable ROI.",
        promise: "Intelli HRM Learning Management delivers personalized, AI-powered learning experiences at scale. From SCORM courses to virtual classrooms, competency-based paths to compliance tracking—development is aligned to business needs with clear ROI visibility.",
        keyOutcomes: [
          { value: "40%", label: "Higher Course Completion", description: "Personalized learning paths", trend: "up" },
          { value: "100%", label: "Compliance Training Tracked", description: "Automated deadline enforcement", trend: "up" },
          { value: "50%", label: "Faster Skill Development", description: "AI-recommended content", trend: "up" },
          { value: "3x", label: "Learning Engagement", description: "Mobile and social learning", trend: "up" }
        ],
        personas: [
          { persona: "L&D Manager", benefit: "Build and deliver impactful programs at scale", outcomes: ["Multi-format content support (SCORM, video, ILT)", "Learning path configuration", "ROI and effectiveness analytics"] },
          { persona: "Employee", benefit: "Learning that fits my career and schedule", outcomes: ["Personalized recommendations", "Mobile and offline access", "Progress tracking and certificates"] },
          { persona: "Manager", benefit: "My team has the skills we need", outcomes: ["Team learning dashboards", "Skill gap visibility", "Training request approvals"] },
          { persona: "Compliance Officer", benefit: "Mandatory training tracked and enforced", outcomes: ["Deadline tracking with escalations", "Completion certificates", "Audit-ready reports"] }
        ],
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
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Regional compliance training libraries",
            "Multi-language content support",
            "Country-specific certification tracking",
            "Local regulatory training requirements"
          ]
        }
      },
      {
        id: "talent",
        title: "Talent Management",
        tagline: "Transform performance from annual event to continuous culture",
        overview: "Comprehensive talent management spanning goals, appraisals, 360 feedback, and continuous recognition. Drive performance excellence through aligned objectives and meaningful feedback.",
        badge: "50+ Capabilities",
        challenge: "Annual reviews that employees and managers dread, goals that disconnect from strategy, and feedback that comes too late to matter. Without continuous performance culture, top performers disengage, poor performance festers, and development happens by accident.",
        promise: "Intelli HRM Talent Management transforms performance from a dreaded annual event to a continuous culture of growth. Cascading goals, real-time feedback, AI-powered coaching, and fair calibration ensure every employee knows where they stand and how to improve.",
        keyOutcomes: [
          { value: "85%", label: "Goal Alignment", description: "Cascaded from company strategy", trend: "up" },
          { value: "4x", label: "More Frequent Feedback", description: "Continuous vs. annual", trend: "up" },
          { value: "25%", label: "Higher Engagement", description: "From recognition and growth", trend: "up" },
          { value: "90%", label: "Review Completion", description: "Streamlined workflows", trend: "up" }
        ],
        personas: [
          { persona: "Employee", benefit: "I know my goals and how I'm doing", outcomes: ["Clear, aligned objectives", "Real-time feedback visibility", "Career development support"] },
          { persona: "Manager", benefit: "Performance coaching is easy and impactful", outcomes: ["Team goal dashboards", "AI-assisted feedback writing", "Calibration support tools"] },
          { persona: "HR Business Partner", benefit: "Fair, consistent performance across the org", outcomes: ["Calibration session management", "Rating distribution analytics", "Bias detection alerts"] },
          { persona: "Executive", benefit: "Strategy execution through aligned goals", outcomes: ["Goal cascade visibility", "Performance distribution trends", "Talent investment ROI"] }
        ],
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
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Regional performance benchmarks",
            "Multi-language feedback templates",
            "Cultural considerations in goal-setting",
            "Country-specific calibration guidelines"
          ]
        }
      },
      {
        id: "succession",
        title: "Succession Planning",
        tagline: "Identify, develop, and retain future leaders",
        overview: "Ensure business continuity through proactive succession planning. Identify critical positions, build talent pipelines, and develop future leaders with data-driven insights.",
        badge: "35+ Capabilities",
        challenge: "Key person dependencies put the business at risk. When critical leaders leave unexpectedly, there's no ready successor. Talent reviews happen in spreadsheets that become outdated immediately, and high-potentials leave for opportunities elsewhere because their path forward isn't clear.",
        promise: "Intelli HRM Succession Planning protects your business continuity with proactive talent pipelines. Identify critical positions, nominate and develop successors, and build leadership depth—with AI that spots readiness gaps before they become risks.",
        keyOutcomes: [
          { value: "100%", label: "Critical Roles Covered", description: "Successor identification", trend: "up" },
          { value: "50%", label: "Reduced Leadership Gaps", description: "Proactive pipeline building", trend: "down" },
          { value: "30%", label: "Better Retention of HiPos", description: "Clear career visibility", trend: "up" },
          { value: "2x", label: "Faster Leadership Transitions", description: "Ready-now successors", trend: "up" }
        ],
        personas: [
          { persona: "CHRO", benefit: "Leadership pipeline visibility at a glance", outcomes: ["Bench strength dashboards", "Critical position coverage", "Diversity in pipeline metrics"] },
          { persona: "HR Business Partner", benefit: "Facilitate meaningful talent reviews", outcomes: ["9-Box talent matrix", "Readiness assessment tools", "Development tracking"] },
          { persona: "Manager", benefit: "Develop my successor with confidence", outcomes: ["Successor nomination workflows", "Development plan integration", "Mentoring relationship tracking"] },
          { persona: "High-Potential Employee", benefit: "I see my path to leadership", outcomes: ["Career path visualization", "Development opportunities", "Stretch assignment visibility"] }
        ],
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
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Regional leadership competency frameworks",
            "Multi-country talent pool visibility",
            "Cross-border succession planning",
            "Local regulatory considerations for mobility"
          ]
        }
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
        challenge: "Paper-based incident logs, expired safety certifications, and reactive compliance create dangerous gaps. When incidents occur, investigation is slow and root causes unclear. Regulatory audits expose missing documentation and inconsistent practices.",
        promise: "Intelli HRM Health & Safety transforms HSE from reactive paperwork to proactive protection. Digital incident reporting, automated certification tracking, and AI-powered risk prediction ensure a safe workplace with audit-ready compliance.",
        keyOutcomes: [
          { value: "40%", label: "Fewer Incidents", description: "Proactive risk management", trend: "down" },
          { value: "100%", label: "Certification Compliance", description: "Automated expiry tracking", trend: "up" },
          { value: "75%", label: "Faster Incident Resolution", description: "Digital investigation workflows", trend: "up" },
          { value: "Zero", label: "Audit Surprises", description: "Continuous compliance monitoring", trend: "down" }
        ],
        personas: [
          { persona: "HSE Manager", benefit: "Complete visibility into safety across all sites", outcomes: ["Incident dashboard with trends", "Certification tracking automation", "Audit management tools"] },
          { persona: "Site Manager", benefit: "Keep my team safe and compliant", outcomes: ["Real-time hazard reporting", "Safety meeting tracking", "Emergency drill management"] },
          { persona: "Employee", benefit: "Easy to report hazards and stay safe", outcomes: ["Mobile hazard reporting", "Safety training access", "Emergency procedure visibility"] },
          { persona: "Compliance Officer", benefit: "Audit-ready documentation always", outcomes: ["OSHA/regulatory reports", "Investigation audit trails", "Policy acknowledgment tracking"] }
        ],
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
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "OSHA and regional HSE compliance frameworks",
            "Country-specific incident classification",
            "Multi-jurisdiction regulatory reporting",
            "Local workplace safety requirements"
          ]
        },
        regionalNote: "OSHA compliance reporting, regional health & safety regulations, and multi-country incident classification standards"
      },
      {
        id: "employee-relations",
        title: "Employee Relations",
        tagline: "Fair, consistent, and compliant employee management",
        overview: "Manage the full spectrum of employee relations from grievances to disciplinary actions. Ensure fair treatment, maintain compliance, and support positive workplace relationships.",
        badge: "45+ Capabilities",
        challenge: "Grievances tracked in emails, inconsistent disciplinary actions, and paper-based investigations create legal exposure and damage trust. Without structured case management, similar situations receive different treatment, and institutional knowledge walks out the door.",
        promise: "Intelli HRM Employee Relations ensures fair, consistent, and compliant handling of every workplace issue. From grievance intake to resolution, disciplinary actions to exit interviews—structured workflows protect both employees and the organization.",
        keyOutcomes: [
          { value: "60%", label: "Faster Case Resolution", description: "Structured investigation workflows", trend: "up" },
          { value: "100%", label: "Consistent Treatment", description: "Policy-driven decision trees", trend: "up" },
          { value: "50%", label: "Reduced Legal Exposure", description: "Complete documentation trails", trend: "down" },
          { value: "85%", label: "Exit Interview Completion", description: "Automated scheduling", trend: "up" }
        ],
        personas: [
          { persona: "Employee Relations Specialist", benefit: "Manage cases consistently with full audit trails", outcomes: ["Centralized case management", "Investigation workflow tools", "Resolution documentation"] },
          { persona: "HR Manager", benefit: "Visibility into all ER activity with trend analysis", outcomes: ["Case dashboard and analytics", "Escalation alerts", "Union/CBA compliance tracking"] },
          { persona: "Manager", benefit: "Guidance on handling difficult situations fairly", outcomes: ["Progressive discipline guidance", "Documentation templates", "HR escalation triggers"] },
          { persona: "Employee", benefit: "My concerns are heard and addressed fairly", outcomes: ["Multiple grievance submission channels", "Status tracking visibility", "Fair appeal processes"] }
        ],
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
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Regional labor law compliance frameworks",
            "Country-specific termination requirements",
            "Union and CBA management by jurisdiction",
            "Local industrial relations regulations"
          ]
        },
        regionalNote: "Regional labor law compliance, statutory termination requirements, and industrial relations frameworks"
      },
      {
        id: "company-property",
        title: "Company Property",
        tagline: "Track and manage all employee-assigned assets",
        overview: "Comprehensive asset management from assignment to return. Track company property throughout the employee lifecycle and maintain accurate inventory records.",
        badge: "30+ Capabilities",
        challenge: "Laptops disappear when employees leave, nobody knows who has which equipment, and IT procurement happens without visibility into what's already available. Asset tracking in spreadsheets leads to write-offs, compliance gaps, and operational inefficiency.",
        promise: "Intelli HRM Company Property provides complete visibility into every asset—from provisioning to return. Integrated with onboarding and offboarding, you always know who has what, when maintenance is due, and what needs replacement.",
        keyOutcomes: [
          { value: "95%", label: "Asset Recovery Rate", description: "Offboarding integration", trend: "up" },
          { value: "100%", label: "Asset Visibility", description: "Complete inventory tracking", trend: "up" },
          { value: "30%", label: "Reduced Equipment Costs", description: "Utilization optimization", trend: "down" },
          { value: "Zero", label: "Lost Asset Write-offs", description: "Digital acknowledgments", trend: "down" }
        ],
        personas: [
          { persona: "IT Manager", benefit: "Know where every device is and its status", outcomes: ["Complete asset registry", "Maintenance scheduling", "Depreciation tracking"] },
          { persona: "HR Operations", benefit: "Seamless asset flows for hire/term", outcomes: ["Onboarding provisioning automation", "Offboarding return checklists", "Department-based kits"] },
          { persona: "Finance", benefit: "Accurate asset valuation and planning", outcomes: ["Depreciation reports", "Replacement forecasting", "Cost center allocation"] },
          { persona: "Employee", benefit: "Clear what I have and my responsibilities", outcomes: ["Digital acknowledgment", "Easy return process", "Asset request capability"] }
        ],
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
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Multi-currency asset valuation",
            "Regional depreciation standards",
            "Cross-border asset tracking",
            "Local tax implications for equipment"
          ]
        }
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
        challenge: "HR inboxes overflow with repetitive questions—leave balances, policy clarifications, form locations. Employees wait for answers they could find themselves, while HR drowns in transactional work instead of focusing on strategic initiatives.",
        promise: "Intelli HRM Help Center deflects routine inquiries through intelligent self-service. AI-powered search, conversational chatbots, and guided workflows give employees instant answers—while complex issues route to the right HR specialist automatically.",
        keyOutcomes: [
          { value: "70%", label: "Ticket Deflection", description: "Self-service resolution", trend: "up" },
          { value: "24/7", label: "Support Availability", description: "AI-powered assistance", trend: "up" },
          { value: "85%", label: "First-Contact Resolution", description: "Intelligent routing", trend: "up" },
          { value: "60%", label: "HR Time Saved", description: "Reduced routine inquiries", trend: "down" }
        ],
        personas: [
          { persona: "Employee", benefit: "Get answers instantly without waiting for HR", outcomes: ["AI chatbot for quick questions", "Searchable knowledge base", "Guided self-service workflows"] },
          { persona: "Manager", benefit: "Find HR information when I need it", outcomes: ["Policy and procedure access", "Team management guides", "Approval queue visibility"] },
          { persona: "HR Specialist", benefit: "Focus on complex issues, not routine questions", outcomes: ["Intelligent ticket routing", "Knowledge gap analytics", "CSAT tracking"] },
          { persona: "HR Leader", benefit: "Scale HR support without scaling headcount", outcomes: ["Deflection rate analytics", "Topic trending insights", "Self-service adoption metrics"] }
        ],
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
        ],
        regionalAdvantage: {
          regions: ["Caribbean", "Africa", "Global"],
          advantages: [
            "Multi-language knowledge base support",
            "Region-specific policy content",
            "Local HR practice guidance",
            "Cultural context in AI responses"
          ]
        }
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
