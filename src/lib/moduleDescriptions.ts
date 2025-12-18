// Rich module descriptions for decision-maker guides and documentation

export interface ModuleEnrichment {
  code: string;
  businessContext: string;
  keyBenefits: string[];
  targetUsers: string[];
  strategicValue: string;
  integrationPoints: string[];
}

export interface FeatureEnrichment {
  code: string;
  detailedDescription: string;
  businessBenefit: string;
  userValue: string;
}

export const MODULE_ENRICHMENTS: Record<string, ModuleEnrichment> = {
  workforce: {
    code: "workforce",
    businessContext: "The Workforce Management module serves as the foundation of your HR operations, centralizing all employee data, organizational structures, and position management. It enables strategic workforce planning while maintaining accurate, compliant employee records across all business units.",
    keyBenefits: [
      "Unified employee data management across all locations and entities",
      "Real-time organizational structure visualization and historical tracking",
      "Streamlined onboarding and offboarding with customizable workflows",
      "AI-powered workforce forecasting for strategic planning",
      "Point-in-time reporting for compliance and audit requirements"
    ],
    targetUsers: ["HR Directors", "HR Business Partners", "Department Managers", "Compliance Officers"],
    strategicValue: "Reduces administrative overhead by up to 40% while improving data accuracy and enabling proactive workforce planning decisions.",
    integrationPoints: ["Payroll", "Benefits", "Performance Management", "Succession Planning"]
  },
  leave: {
    code: "leave",
    businessContext: "Leave Management provides comprehensive time-off administration supporting multiple leave types, accrual methods, and regional compliance requirements. The system automates leave calculations, enforces policies consistently, and empowers employees with self-service capabilities.",
    keyBenefits: [
      "Automated leave accrual calculations with configurable rules",
      "Real-time leave balance visibility for employees and managers",
      "Configurable approval workflows with delegation support",
      "Multi-territory compliance with regional leave regulations",
      "Leave forecasting for operational planning"
    ],
    targetUsers: ["Employees", "Managers", "HR Administrators", "Payroll Teams"],
    strategicValue: "Eliminates manual leave tracking errors and reduces leave administration time by 60%, while ensuring policy compliance.",
    integrationPoints: ["Payroll", "Time & Attendance", "Workforce Management"]
  },
  payroll: {
    code: "payroll",
    businessContext: "The Payroll module delivers accurate, compliant compensation processing across multiple countries, pay groups, and frequencies. It supports complex pay scenarios including multi-position employees, statutory deductions, and automated bank file generation.",
    keyBenefits: [
      "Multi-currency, multi-country payroll processing",
      "Automated statutory deduction calculations",
      "Configurable pay elements and earning codes",
      "Bank file generation for major financial institutions",
      "Complete audit trail for regulatory compliance"
    ],
    targetUsers: ["Payroll Managers", "Finance Teams", "Compliance Officers", "HR Directors"],
    strategicValue: "Reduces payroll processing time by 50% while ensuring 99.9% calculation accuracy and full regulatory compliance.",
    integrationPoints: ["Benefits", "Time & Attendance", "Leave Management", "Compensation"]
  },
  compensation: {
    code: "compensation",
    businessContext: "Compensation Management enables strategic total rewards planning, from salary structures and pay grades to merit increases and bonus programs. It ensures pay equity while providing tools for competitive compensation analysis.",
    keyBenefits: [
      "Structured salary bands and pay grade management",
      "Compensation simulation and budget modeling",
      "Pay equity analysis and reporting",
      "Merit and bonus planning with approval workflows",
      "Total compensation statement generation"
    ],
    targetUsers: ["Compensation Analysts", "HR Directors", "Finance Leaders", "Department Heads"],
    strategicValue: "Enables data-driven compensation decisions that improve talent retention while maintaining budget control and pay equity.",
    integrationPoints: ["Payroll", "Performance Management", "Workforce Management"]
  },
  benefits: {
    code: "benefits",
    businessContext: "Benefits Administration streamlines enrollment, eligibility tracking, and claims management for all employee benefit programs. It supports both open enrollment and qualifying life events while integrating seamlessly with payroll deductions.",
    keyBenefits: [
      "Automated eligibility tracking and waiting period management",
      "Self-service enrollment with dependent coverage",
      "Life event processing with enrollment windows",
      "Claims submission and tracking",
      "Benefits cost analysis and reporting"
    ],
    targetUsers: ["Benefits Administrators", "Employees", "HR Managers", "Finance Teams"],
    strategicValue: "Reduces benefits administration costs by 35% while improving employee satisfaction through self-service capabilities.",
    integrationPoints: ["Payroll", "Workforce Management", "Employee Self-Service"]
  },
  time_attendance: {
    code: "time_attendance",
    businessContext: "Time & Attendance captures employee work hours through multiple methods including geofenced clock-in, biometric verification, and mobile access. It ensures accurate time tracking for payroll processing while monitoring attendance patterns.",
    keyBenefits: [
      "Geofenced time capture with location verification",
      "Facial recognition for identity confirmation",
      "Real-time attendance monitoring and alerts",
      "Overtime tracking and policy enforcement",
      "Seamless integration with payroll calculations"
    ],
    targetUsers: ["Operations Managers", "Supervisors", "Payroll Teams", "HR Administrators"],
    strategicValue: "Eliminates time theft and buddy punching while reducing timesheet errors by 90% and accelerating payroll processing.",
    integrationPoints: ["Payroll", "Leave Management", "Workforce Management"]
  },
  training: {
    code: "training",
    businessContext: "The Training & Development module manages all aspects of employee learning, from mandatory compliance training to professional development. It tracks certifications, manages training schedules, and measures learning effectiveness.",
    keyBenefits: [
      "Course catalog with enrollment management",
      "Certification tracking with renewal reminders",
      "Training compliance monitoring and reporting",
      "Learning path creation for career development",
      "Training effectiveness analytics"
    ],
    targetUsers: ["Learning & Development Teams", "Managers", "Compliance Officers", "Employees"],
    strategicValue: "Ensures 100% compliance training completion while reducing training administration time by 45%.",
    integrationPoints: ["Succession Planning", "Performance Management", "Qualifications"]
  },
  performance: {
    code: "performance",
    businessContext: "Performance Management enables continuous performance evaluation through goal setting, competency assessments, and structured review cycles. It supports both traditional annual reviews and modern continuous feedback approaches.",
    keyBenefits: [
      "Configurable appraisal cycles with weighted criteria",
      "Goal cascading from organizational to individual level",
      "360-degree feedback with anonymity controls",
      "Calibration tools for fair performance ratings",
      "Performance trend analysis and insights"
    ],
    targetUsers: ["Managers", "Employees", "HR Business Partners", "Executive Leadership"],
    strategicValue: "Increases employee engagement by 25% while providing data-driven insights for talent decisions.",
    integrationPoints: ["Compensation", "Succession Planning", "Training"]
  },
  succession: {
    code: "succession",
    businessContext: "Succession Planning identifies and develops future leaders through talent assessment, career pathing, and development planning. It ensures business continuity by maintaining a pipeline of ready-now successors for critical roles.",
    keyBenefits: [
      "Nine-box talent assessment and categorization",
      "Succession pool management with readiness tracking",
      "Individual development plan creation",
      "Mentorship program facilitation",
      "Flight risk identification and mitigation"
    ],
    targetUsers: ["HR Directors", "Executive Leadership", "Talent Management Teams", "Senior Managers"],
    strategicValue: "Reduces leadership vacancy risk by 60% and decreases external hiring costs for critical positions.",
    integrationPoints: ["Performance Management", "Training", "Workforce Management"]
  },
  recruitment: {
    code: "recruitment",
    businessContext: "Recruitment Management streamlines the entire hiring process from requisition creation through candidate onboarding. It includes applicant tracking, interview scheduling, and offer management with full compliance documentation.",
    keyBenefits: [
      "Job requisition workflow with budget approval",
      "Applicant tracking with stage management",
      "Interview scheduling with calendar integration",
      "Assessment and screening tools",
      "Offer letter generation and e-signatures"
    ],
    targetUsers: ["Recruiters", "Hiring Managers", "HR Business Partners", "Interviewers"],
    strategicValue: "Reduces time-to-hire by 30% while improving candidate quality through structured evaluation processes.",
    integrationPoints: ["Workforce Management", "Onboarding", "Compensation"]
  },
  hse: {
    code: "hse",
    businessContext: "Health, Safety & Environment (HSE) manages workplace safety programs, incident reporting, and regulatory compliance. It helps organizations prevent workplace injuries while meeting OSHA and other regulatory requirements.",
    keyBenefits: [
      "Incident reporting with investigation workflows",
      "Risk assessment and hazard identification",
      "Safety training tracking and compliance",
      "Regulatory audit management",
      "Safety policy acknowledgment tracking"
    ],
    targetUsers: ["Safety Officers", "Operations Managers", "HR Administrators", "Employees"],
    strategicValue: "Reduces workplace incidents by 40% while ensuring regulatory compliance and avoiding costly penalties.",
    integrationPoints: ["Training", "Workforce Management", "Employee Relations"]
  },
  employee_relations: {
    code: "employee_relations",
    businessContext: "Employee Relations manages workplace investigations, disciplinary actions, grievances, and recognition programs. It ensures consistent policy enforcement while maintaining comprehensive documentation for legal protection.",
    keyBenefits: [
      "Case management with investigation tracking",
      "Disciplinary action documentation and follow-up",
      "Grievance handling with resolution workflows",
      "Employee recognition and awards programs",
      "Exit interview collection and analysis"
    ],
    targetUsers: ["HR Business Partners", "Employee Relations Specialists", "Managers", "Legal Teams"],
    strategicValue: "Reduces legal exposure through consistent documentation while improving workplace culture through recognition programs.",
    integrationPoints: ["Workforce Management", "Performance Management", "Offboarding"]
  },
  property: {
    code: "property",
    businessContext: "Company Property Management tracks all assets assigned to employees including equipment, vehicles, and access credentials. It ensures proper asset allocation and retrieval throughout the employee lifecycle.",
    keyBenefits: [
      "Asset inventory with employee assignment",
      "Check-out and return processing",
      "Asset condition tracking and depreciation",
      "Automated retrieval reminders for offboarding",
      "Asset utilization reporting"
    ],
    targetUsers: ["IT Teams", "Facilities Managers", "HR Administrators", "Finance Teams"],
    strategicValue: "Reduces asset loss by 50% and ensures complete asset retrieval during employee separation.",
    integrationPoints: ["Workforce Management", "Onboarding", "Offboarding"]
  },
  admin: {
    code: "admin",
    businessContext: "System Administration provides centralized control over security, permissions, workflows, and system configuration. It enables granular access control while maintaining audit trails for compliance requirements.",
    keyBenefits: [
      "Role-based access control with granular permissions",
      "Workflow configuration and management",
      "Audit log viewing and compliance reporting",
      "System settings and branding customization",
      "User management and security policies"
    ],
    targetUsers: ["System Administrators", "IT Security", "HR Directors", "Compliance Officers"],
    strategicValue: "Ensures data security and regulatory compliance while enabling efficient system administration.",
    integrationPoints: ["All Modules"]
  },
  ess: {
    code: "ess",
    businessContext: "Employee Self-Service empowers employees to manage their own HR transactions including personal information updates, leave requests, and document access. It reduces HR administrative burden while improving employee experience.",
    keyBenefits: [
      "Personal information management",
      "Leave request submission and balance viewing",
      "Pay statement access and tax document downloads",
      "Benefits enrollment and claims submission",
      "Training enrollment and certification viewing"
    ],
    targetUsers: ["All Employees"],
    strategicValue: "Reduces HR service requests by 70% while improving employee satisfaction and engagement.",
    integrationPoints: ["All Employee-Facing Modules"]
  },
  mss: {
    code: "mss",
    businessContext: "Manager Self-Service provides managers with tools to effectively lead their teams including approval workflows, team analytics, and performance management. It enables data-driven management decisions.",
    keyBenefits: [
      "Team leave and request approvals",
      "Direct report performance management",
      "Team analytics and headcount visibility",
      "Onboarding and offboarding task management",
      "Recognition and feedback submission"
    ],
    targetUsers: ["People Managers", "Team Leads", "Department Heads"],
    strategicValue: "Improves management efficiency by 35% while enabling proactive team leadership through real-time insights.",
    integrationPoints: ["Workforce Management", "Performance", "Leave", "Time & Attendance"]
  }
};

// Feature-level enrichments for detailed descriptions
export const FEATURE_ENRICHMENTS: Record<string, FeatureEnrichment> = {
  company_groups: {
    code: "company_groups",
    detailedDescription: "Establish and manage hierarchical company group structures, including divisions and subsidiaries. Define reporting relationships between entities and configure shared services arrangements.",
    businessBenefit: "Enables consolidated reporting and governance across complex organizational structures.",
    userValue: "Single view of entire corporate structure with drill-down capabilities."
  },
  org_structure: {
    code: "org_structure",
    detailedDescription: "Interactive organizational chart with point-in-time viewing capability. Compare organizational states between any two dates to visualize changes, additions, and removals.",
    businessBenefit: "Supports compliance audits and enables historical analysis of organizational evolution.",
    userValue: "Visual understanding of reporting lines and organizational hierarchy at any point in time."
  },
  forecasting: {
    code: "forecasting",
    detailedDescription: "AI-powered workforce forecasting with scenario planning, what-if analysis, and Monte Carlo simulations. Model the impact of business changes on headcount and labor costs.",
    businessBenefit: "Data-driven workforce planning that aligns staffing with business strategy.",
    userValue: "Predictive insights for proactive talent acquisition and capacity planning."
  },
  onboarding: {
    code: "onboarding",
    detailedDescription: "Customizable onboarding templates by job type with automated task assignment to employees, managers, HR, and buddies. Track completion progress and ensure consistent new hire experience.",
    businessBenefit: "Accelerates time-to-productivity for new hires while ensuring compliance completion.",
    userValue: "Clear roadmap for new employees with all required tasks in one place."
  },
  qualifications: {
    code: "qualifications",
    detailedDescription: "Comprehensive credential management including academic degrees, professional certifications, and licenses. Track verification status, expiry dates, and continuing education requirements.",
    businessBenefit: "Ensures workforce compliance with credential requirements and reduces liability.",
    userValue: "Self-service qualification management with automated renewal reminders."
  }
};

export function getModuleEnrichment(moduleCode: string): ModuleEnrichment | undefined {
  return MODULE_ENRICHMENTS[moduleCode];
}

export function getFeatureEnrichment(featureCode: string): FeatureEnrichment | undefined {
  return FEATURE_ENRICHMENTS[featureCode];
}
