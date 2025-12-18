// Detailed feature enrichments with comprehensive examples for decision-maker documentation
// These descriptions should leave no questions unanswered

export interface DetailedFeatureEnrichment {
  code: string;
  detailedDescription: string;
  examples: string[];
  businessBenefit: string;
  userValue: string;
  keyCapabilities: string[];
}

export const DETAILED_FEATURE_ENRICHMENTS: Record<string, DetailedFeatureEnrichment> = {
  // ===== WORKFORCE MODULE =====
  company_groups: {
    code: "company_groups",
    detailedDescription: "Establish and manage hierarchical company group structures, including holding companies, divisions, and subsidiaries. Define reporting relationships between legal entities and configure shared services arrangements for multi-entity organizations.",
    examples: [
      "Create a holding company 'Acme Corporation' with three divisions: 'North America', 'Europe', and 'Asia Pacific'",
      "Assign subsidiary companies to each division (e.g., 'Acme USA Inc.' under 'North America')",
      "Configure shared HR services where one HR team manages multiple entities",
      "Track different fiscal year configurations per division"
    ],
    businessBenefit: "Enables consolidated reporting and governance across complex organizational structures while maintaining legal entity separation.",
    userValue: "Single view of entire corporate structure with drill-down capabilities to any entity level.",
    keyCapabilities: ["Multi-level hierarchy", "Division management", "Entity assignment", "Shared services configuration"]
  },
  
  departments: {
    code: "departments",
    detailedDescription: "Create and manage organizational departments (business units) and their sub-sections. Define department managers, cost centers, and reporting structures. Departments are mandatory organizational units under companies.",
    examples: [
      "Create department 'Human Resources' with sections: 'Talent Acquisition', 'Employee Relations', 'Compensation & Benefits'",
      "Assign cost center 'CC-HR-001' to the HR department for budget tracking",
      "Set validity dates to track departmental reorganizations over time",
      "Link departments to specific office locations for space planning"
    ],
    businessBenefit: "Clear organizational boundaries for budgeting, reporting, and accountability.",
    userValue: "Easy navigation of organizational structure with clear reporting lines.",
    keyCapabilities: ["Section management", "Cost center assignment", "Manager designation", "Historical tracking"]
  },

  org_structure: {
    code: "org_structure",
    detailedDescription: "Interactive organizational chart with point-in-time viewing capability. Compare organizational states between any two dates to visualize changes, additions, and removals. Navigate hierarchies, view position details, and understand reporting relationships.",
    examples: [
      "View the organization as it existed on January 1, 2024 vs. today",
      "Identify positions that were added, removed, or moved between two dates (shown in green/red)",
      "Drill down from CEO to any employee in the hierarchy",
      "Export org charts for presentations or compliance documentation"
    ],
    businessBenefit: "Supports compliance audits and enables historical analysis of organizational evolution for strategic planning.",
    userValue: "Visual understanding of reporting lines and organizational hierarchy at any point in time.",
    keyCapabilities: ["Point-in-time viewing", "Change comparison", "Interactive navigation", "Position details"]
  },

  job_families: {
    code: "job_families",
    detailedDescription: "Group related jobs into families for career pathing and compensation analysis. Job families represent functional career tracks within the organization (e.g., Engineering, Sales, Operations) and are linked to specific departments.",
    examples: [
      "Create job family 'Software Engineering' containing: Junior Developer, Developer, Senior Developer, Staff Engineer, Principal Engineer",
      "Create job family 'Sales' with progression: Sales Rep → Account Executive → Sales Manager → Sales Director",
      "Link 'Finance' job family to the Finance department",
      "Define competency requirements that apply across all jobs in a family"
    ],
    businessBenefit: "Enables structured career pathing and ensures compensation consistency within functional areas.",
    userValue: "Clear career progression paths with defined competency requirements at each level.",
    keyCapabilities: ["Career track definition", "Department linking", "Competency inheritance", "Temporal validity"]
  },

  jobs: {
    code: "jobs",
    detailedDescription: "Define comprehensive job definitions including responsibilities (weighted percentage), competency requirements, and goals. Jobs are templates that positions are based on. Each job has grade levels, standard hours, and work period configurations.",
    examples: [
      "Create 'Senior Developer' job with responsibilities: Code Development (40%), Code Review (25%), Mentoring (20%), Architecture (15%)",
      "Require competencies: Programming (Advanced), System Design (Intermediate), Communication (Intermediate)",
      "Set annual goals: Deliver 3 major features, Mentor 2 junior developers, Reduce technical debt by 10%",
      "Configure as Grade 7, 40 hours/week, Monthly pay period"
    ],
    businessBenefit: "Standardized job definitions ensure consistency in hiring, performance evaluation, and compensation decisions.",
    userValue: "Clear expectations with weighted responsibilities and defined competency requirements.",
    keyCapabilities: ["Responsibility weighting", "Competency requirements", "Goal templates", "Grade/level assignment"]
  },

  competencies: {
    code: "competencies",
    detailedDescription: "Define organizational competencies with proficiency levels. Competencies are skills or behaviors that employees need to demonstrate. Each competency has multiple levels (e.g., Basic, Intermediate, Advanced, Expert) with specific behavioral indicators.",
    examples: [
      "Create 'Leadership' competency with levels: Emerging Leader → Developing Leader → Established Leader → Executive Leader",
      "Define 'Technical Problem Solving' with levels: Follows guidance → Works independently → Leads others → Sets organizational standards",
      "Create 'Customer Focus' for sales roles with behavioral indicators at each level",
      "Link 'Data Analysis' competency to Finance and Analytics job families"
    ],
    businessBenefit: "Objective framework for assessing employee capabilities and identifying development needs.",
    userValue: "Clear understanding of required skills at each career level with specific behavioral expectations.",
    keyCapabilities: ["Multi-level definitions", "Behavioral indicators", "Job linking", "Assessment support"]
  },

  positions: {
    code: "positions",
    detailedDescription: "Create specific positions within the organization by instantiating jobs. Each position has a unique place in the org chart, reports to another position, and has its own compensation range. Positions can be filled or vacant.",
    examples: [
      "Create position 'Senior Developer - Mobile Team' reporting to 'Engineering Manager'",
      "Set position compensation: Base salary $120,000-$150,000, Annual bonus target 15%",
      "Mark position as 'Key Position' for succession planning",
      "Configure position as remote-eligible with home office equipment allowance"
    ],
    businessBenefit: "Precise workforce planning with clear headcount tracking and compensation budgeting.",
    userValue: "Understand exactly where each role fits in the organization with defined compensation.",
    keyCapabilities: ["Org chart placement", "Compensation configuration", "Key position flagging", "Remote/location settings"]
  },

  employees: {
    code: "employees",
    detailedDescription: "Comprehensive employee directory with 16 profile tabs covering all aspects of employee information. View and manage personal details, addresses, bank information, dependents, emergency contacts, qualifications, documents, and more.",
    examples: [
      "View employee profile with tabs: Overview, Addresses, Bank, Beneficiaries, Certificates, Contacts, Dependents, Documents...",
      "Add multiple addresses (home, mailing, work) with primary designation",
      "Track employee qualifications with verification status and expiry dates",
      "Manage emergency contacts with relationship and priority"
    ],
    businessBenefit: "Single source of truth for all employee data with complete audit trail.",
    userValue: "All employee information accessible in one place with easy navigation.",
    keyCapabilities: ["16 profile tabs", "Document management", "Qualification tracking", "Audit history"]
  },

  transactions: {
    code: "transactions",
    detailedDescription: "Process all employee lifecycle transactions: Hire, Confirmation, Probation Extension, Acting Assignment, Promotion, Transfer, and Termination. Each transaction type has specific workflows and can optionally trigger approval processes.",
    examples: [
      "Process new hire with start date, position assignment, and compensation",
      "Confirm employee after successful probation period",
      "Promote employee from 'Developer' to 'Senior Developer' with salary increase",
      "Transfer employee from 'New York Office' to 'London Office' with relocation package"
    ],
    businessBenefit: "Standardized employee lifecycle management with consistent process and documentation.",
    userValue: "Clear workflow for all employee changes with approval tracking.",
    keyCapabilities: ["Multiple transaction types", "Workflow integration", "Effective dating", "Document generation"]
  },

  qualifications: {
    code: "qualifications",
    detailedDescription: "Manage academic qualifications, professional certifications, and licenses. Track verification status, expiry dates, and continuing education requirements. Support bulk upload from CSV and integration with accrediting bodies.",
    examples: [
      "Record academic degree: MBA from Harvard Business School, verified in 2020",
      "Track certification: PMP expires December 2025, requires 60 PDUs every 3 years",
      "Add license: CPA License NY State #12345, requires annual renewal",
      "Bulk import 500 employee qualifications from CSV file"
    ],
    businessBenefit: "Ensures workforce compliance with credential requirements and reduces liability risk.",
    userValue: "Self-service qualification management with automated renewal reminders.",
    keyCapabilities: ["Verification workflow", "Expiry tracking", "Bulk upload", "Accrediting body validation"]
  },

  onboarding: {
    code: "onboarding",
    detailedDescription: "Create customizable onboarding templates by job type with tasks assigned to different roles: Employee, Manager, HR, or Buddy. Track completion progress with deadlines and ensure consistent new hire experience.",
    examples: [
      "Create template 'Software Developer Onboarding' with 30 tasks over 90 days",
      "Employee tasks: Complete I-9, Set up workstation, Complete security training",
      "Manager tasks: Schedule 30/60/90 day check-ins, Assign initial project",
      "HR tasks: Process benefits enrollment, Order equipment, Create system accounts"
    ],
    businessBenefit: "Accelerates time-to-productivity for new hires while ensuring compliance completion.",
    userValue: "Clear roadmap for new employees with all required tasks in one place.",
    keyCapabilities: ["Template management", "Multi-role assignment", "Progress tracking", "Deadline monitoring"]
  },

  forecasting: {
    code: "forecasting",
    detailedDescription: "AI-powered workforce forecasting with multiple analysis methods: Headcount Forecasting, Scenario Planning, What-If Analysis, Monte Carlo Simulation, Sensitivity Analysis, and Stress Testing. Model the impact of business changes on workforce.",
    examples: [
      "Forecast headcount needs for 20% revenue growth in next 12 months",
      "Create scenario: 'Acquire competitor' - model integration headcount impacts",
      "What-if analysis: What happens to costs if attrition increases to 25%?",
      "Monte Carlo: Simulate 1000 workforce scenarios to identify risk ranges"
    ],
    businessBenefit: "Data-driven workforce planning that aligns staffing with business strategy.",
    userValue: "Predictive insights for proactive talent acquisition and capacity planning.",
    keyCapabilities: ["AI predictions", "Scenario comparison", "Monte Carlo simulation", "Risk analysis"]
  },

  // ===== ADMIN MODULE =====
  granular_permissions: {
    code: "granular_permissions",
    detailedDescription: "Configure fine-grained permissions at module, tab, and action levels. Control View, Create, Edit, and Delete access separately. Permissions default to ON and admins remove access as needed. Supports organizational hierarchy restrictions.",
    examples: [
      "Allow HR Manager to View employee payroll but not Edit or Delete",
      "Grant Recruiter Create access only to Recruitment module, not Payroll",
      "Restrict Finance team to only View Benefits, not Edit enrollment",
      "Limit manager access to only their direct reports' data"
    ],
    businessBenefit: "Precise access control ensuring data security while enabling role-appropriate functionality.",
    userValue: "Access exactly what you need without seeing irrelevant or restricted information.",
    keyCapabilities: ["Module-level control", "Tab-level control", "Action-level control", "Org hierarchy scoping"]
  },

  roles: {
    code: "roles",
    detailedDescription: "Create and manage user roles with assigned permissions. System includes default roles (Administrator, HR Manager, Employee) that cannot be deleted. Custom roles can inherit from defaults and have specific permission overrides.",
    examples: [
      "Create 'Payroll Specialist' role with full Payroll access but no Recruitment access",
      "Create 'Department Manager' role with MSS access and team-only visibility",
      "Create 'Benefits Administrator' role limited to Benefits module only",
      "Assign multiple roles to a user (e.g., 'Recruiter' + 'Trainer')"
    ],
    businessBenefit: "Flexible role-based security that matches organizational structure and responsibilities.",
    userValue: "Clear understanding of what each role can access and why.",
    keyCapabilities: ["Role creation", "Permission assignment", "Multi-role support", "Role inheritance"]
  },

  workflows: {
    code: "workflows",
    detailedDescription: "Configure multi-step approval workflows with routing rules. Support for escalation, delegation, auto-termination, and digital signatures. Templates define approval chains that can be triggered by various transactions.",
    examples: [
      "Create 3-step leave approval: Manager → HR → Director (for leaves > 10 days)",
      "Configure escalation: If no response in 48 hours, escalate to next level",
      "Set delegation: When manager is on leave, redirect to acting manager",
      "Require digital signature confirmation for salary change approvals"
    ],
    businessBenefit: "Consistent, auditable approval processes that enforce business rules automatically.",
    userValue: "Know exactly who needs to approve and track where requests are in the process.",
    keyCapabilities: ["Multi-step routing", "Escalation rules", "Delegation support", "Digital signatures"]
  },

  audit_logs: {
    code: "audit_logs",
    detailedDescription: "Complete audit trail of all system actions: data entry, edits, deletions, and viewing of sensitive data. Tracks user, timestamp, IP address, and before/after values. Searchable and exportable for compliance reporting.",
    examples: [
      "Track who viewed employee salary information and when",
      "See all changes made to employee John Smith's record in last 30 days",
      "Export audit log for SOX compliance review",
      "Alert when PII accessed by users without PII permission (5+ times/hour)"
    ],
    businessBenefit: "Complete compliance coverage with tamper-evident audit trails for regulatory requirements.",
    userValue: "Confidence that all actions are tracked and accountable.",
    keyCapabilities: ["Action tracking", "Before/after values", "IP logging", "Export capability"]
  },

  security_settings: {
    code: "security_settings",
    detailedDescription: "Configure enterprise security policies: password requirements (length, complexity, history, expiration), session timeouts, MFA enforcement, and first-login password change. Daily notifications prompt users approaching password expiry.",
    examples: [
      "Require passwords: 12+ characters, uppercase, lowercase, number, special character",
      "Prevent reuse of last 10 passwords",
      "Force password change every 90 days with warnings starting at 14 days",
      "Enable MFA for all users accessing sensitive payroll data"
    ],
    businessBenefit: "Enterprise-grade security protecting sensitive HR and payroll data.",
    userValue: "Secure access with clear security requirements and timely reminders.",
    keyCapabilities: ["Password policies", "Session management", "MFA configuration", "Expiry notifications"]
  },

  // ===== LEAVE MODULE =====
  leave_types: {
    code: "leave_types",
    detailedDescription: "Configure custom leave types beyond standard vacation/sick. Each type has accrual method (days or hours), carryover rules, gender applicability, and approval requirements. Support for regional compliance variations.",
    examples: [
      "Create 'Annual Leave' accruing 1.25 days per month with 5-day carryover max",
      "Create 'Maternity Leave' - 16 weeks, female only, no accrual required",
      "Create 'Paternity Leave' - 2 weeks, male only, taken within 3 months of birth",
      "Create 'Sick Leave' accruing 1 day per month, no carryover"
    ],
    businessBenefit: "Complete flexibility to match leave policies to regional requirements and company culture.",
    userValue: "Clear understanding of all available leave types and their rules.",
    keyCapabilities: ["Custom types", "Accrual configuration", "Gender restrictions", "Carryover rules"]
  },

  leave_requests: {
    code: "leave_requests",
    detailedDescription: "Submit and manage leave requests with real-time balance display. Shows current balance, year-to-date usage, and pending requests. Workflow integration routes approvals through configured chains with conflict detection.",
    examples: [
      "Request 5 days annual leave showing: Balance 15 days, Used 8 days, Pending 2 days",
      "System warns: '3 team members already approved for requested dates'",
      "Manager sees leave request with employee's full leave history for context",
      "Partial day requests: Request 4 hours sick leave for afternoon"
    ],
    businessBenefit: "Streamlined leave management with visibility to prevent staffing conflicts.",
    userValue: "Easy request submission with immediate visibility of balances and status.",
    keyCapabilities: ["Balance display", "Conflict detection", "Workflow routing", "Partial day support"]
  },

  leave_balances: {
    code: "leave_balances",
    detailedDescription: "Track employee leave balances with opening balance, annual entitlement, earned, taken, and available. Supports adjustments with audit trail. Overnight processing handles accruals and year-end rollovers automatically.",
    examples: [
      "View balance: Opening 5, Entitlement 20, Earned 10, Taken 8, Available 27",
      "Add manual adjustment: +2 days for special recognition with manager note",
      "Year-end rollover: Carry forward 5 of 12 remaining days (per policy max)",
      "New hire proration: Started July 1 = 50% of annual entitlement"
    ],
    businessBenefit: "Accurate leave tracking with automated calculations and clear audit trail.",
    userValue: "Complete visibility of leave entitlement and usage at any time.",
    keyCapabilities: ["Balance tracking", "Adjustment audit", "Overnight processing", "Proration rules"]
  },

  // ===== PAYROLL MODULE =====
  pay_groups: {
    code: "pay_groups",
    detailedDescription: "Organize employees into pay groups by payment frequency: Weekly, Biweekly, Semimonthly, or Monthly. Each pay group processes independently with its own calendar. Supports National Insurance tracking for UK/Ireland operations.",
    examples: [
      "Create 'Monthly Salaried' pay group for exempt employees",
      "Create 'Weekly Hourly' pay group for non-exempt workers",
      "Configure 'UK Monthly' with National Insurance Monday counting enabled",
      "Assign employee to pay group with start date matching position assignment"
    ],
    businessBenefit: "Flexible payroll organization supporting multiple pay frequencies and regional requirements.",
    userValue: "Clear understanding of pay schedule and processing dates.",
    keyCapabilities: ["Multiple frequencies", "NI support", "Calendar generation", "Position linking"]
  },

  payroll_processing: {
    code: "payroll_processing",
    detailedDescription: "Process payroll with concurrent operation support for multiple pay groups. Full data lock during processing prevents changes. Includes calculation, approval, and finalization stages with recalculation controls.",
    examples: [
      "Calculate payroll for 'Monthly Salaried' - 450 employees in 3 minutes",
      "Warning banner: 'Pay Group Locked for Processing' prevents data changes",
      "Recalculate before approval: Operator can directly recalculate",
      "Recalculate after approval: Requires supervisor authorization"
    ],
    businessBenefit: "Accurate, efficient payroll processing with appropriate controls and audit trails.",
    userValue: "Clear processing workflow with visibility of lock status and approval requirements.",
    keyCapabilities: ["Concurrent processing", "Data locking", "Recalculation control", "Approval workflow"]
  },

  pay_elements: {
    code: "pay_elements",
    detailedDescription: "Define earnings and deduction codes for payroll calculations. Each element has a type (earning/deduction), calculation method, tax treatment, and display properties. Supports recurring and one-time elements.",
    examples: [
      "Create 'Base Salary' earning - monthly, taxable, appears on payslip",
      "Create 'Health Insurance' deduction - pre-tax, calculated as % of salary",
      "Create 'Overtime' earning - calculated at 1.5x hourly rate",
      "Create 'Bonus' earning - one-time, taxable at supplemental rate"
    ],
    businessBenefit: "Flexible compensation structure supporting any earnings/deduction requirement.",
    userValue: "Clear payslip showing all earnings and deductions with correct calculations.",
    keyCapabilities: ["Multiple types", "Tax treatment", "Calculation methods", "Display configuration"]
  },

  tax_configuration: {
    code: "tax_configuration",
    detailedDescription: "Configure country-specific tax rules, brackets, and rates. Supports AI-assisted bracket extraction from tax documents. Manages statutory deduction types and rate bands with effective dating.",
    examples: [
      "Upload 2024 IRS tax tables - AI extracts brackets automatically",
      "Configure PAYE rates for UK with multiple tax codes",
      "Set up National Insurance contribution rates by earnings band",
      "Define state income tax rates for employees in different states"
    ],
    businessBenefit: "Accurate tax calculations compliant with current regulations across jurisdictions.",
    userValue: "Correct tax withholding automatically calculated based on location and earnings.",
    keyCapabilities: ["AI bracket extraction", "Multi-country support", "Effective dating", "Statutory rates"]
  },

  bank_files: {
    code: "bank_files",
    detailedDescription: "Generate bank payment files for direct deposit. Supports multiple bank formats with AI-assisted configuration from bank specification documents. Permission-controlled generation by company and pay group.",
    examples: [
      "Upload HSBC file format specification - AI creates configuration automatically",
      "Generate ACH file for US bank payments",
      "Generate BACS file for UK bank payments",
      "Preview and validate file before submitting to bank"
    ],
    businessBenefit: "Automated payment file generation reducing manual effort and errors.",
    userValue: "One-click payment file generation in correct bank format.",
    keyCapabilities: ["AI configuration", "Multiple formats", "Permission control", "Validation preview"]
  },

  payslips: {
    code: "payslips",
    detailedDescription: "Generate and distribute employee payslips with company branding. Configurable templates include logo, colors, and company information. PDF generation with secure access for employees in self-service portal.",
    examples: [
      "Configure template with company logo, address, and brand colors",
      "Generate payslips for entire pay group with one click",
      "Employee downloads payslip PDF from self-service portal",
      "View historical payslips for any past pay period"
    ],
    businessBenefit: "Professional, branded payslips delivered efficiently with secure employee access.",
    userValue: "Easy access to current and historical payslips anytime.",
    keyCapabilities: ["Branding configuration", "PDF generation", "Self-service access", "Historical archive"]
  },

  // ===== COMPENSATION MODULE =====
  employee_compensation: {
    code: "employee_compensation",
    detailedDescription: "Define employee-specific compensation overriding position defaults. Includes base salary, allowances, and pay elements. Compensation is protected once payroll has been processed - cannot delete or change dates that were already paid.",
    examples: [
      "Set John's base salary at $125,000 (above position midpoint of $110,000)",
      "Add housing allowance of $1,500/month for NYC-based employee",
      "Add car allowance of $500/month for sales representative",
      "System prevents deletion: 'Cannot delete - payroll already paid for this period'"
    ],
    businessBenefit: "Individual pay flexibility while maintaining audit trail and payroll integrity.",
    userValue: "Clear view of total compensation with all elements and effective dates.",
    keyCapabilities: ["Position override", "Pay element assignment", "Payroll protection", "Effective dating"]
  },

  salary_structures: {
    code: "salary_structures",
    detailedDescription: "Define salary grades, bands, and ranges for compensation management. Each grade has minimum, midpoint, and maximum values. Supports multiple structures for different employee populations or geographies.",
    examples: [
      "Create Grade 5: Min $80,000, Mid $100,000, Max $120,000",
      "Create separate structures for US, UK, and India markets",
      "Define promotional guidelines: Move to midpoint of new grade",
      "Flag employees below minimum or above maximum for review"
    ],
    businessBenefit: "Structured compensation framework ensuring internal equity and market competitiveness.",
    userValue: "Understanding of pay range for current role and career advancement potential.",
    keyCapabilities: ["Grade definition", "Geographic variations", "Equity analysis", "Progression rules"]
  },

  // ===== BENEFITS MODULE =====
  benefit_plans: {
    code: "benefit_plans",
    detailedDescription: "Configure benefit plans with eligibility rules, contribution structures, and coverage levels. Supports both fixed amount and percentage-based contributions. Integrates with payroll for automatic deductions.",
    examples: [
      "Create 'Medical PPO' plan: Employee pays $200/month, Employer pays $800/month",
      "Create 'Dental' plan: Employee pays 2% of salary, Employer matches",
      "Set eligibility: Full-time employees after 30-day waiting period",
      "Define coverage levels: Employee Only, Employee + Spouse, Family"
    ],
    businessBenefit: "Flexible benefit configuration meeting diverse workforce needs with controlled costs.",
    userValue: "Clear understanding of available benefits, costs, and coverage options.",
    keyCapabilities: ["Contribution types", "Eligibility rules", "Coverage levels", "Payroll integration"]
  },

  benefit_enrollment: {
    code: "benefit_enrollment",
    detailedDescription: "Manage employee benefit enrollments through open enrollment periods or qualifying life events. Includes dependent coverage, auto-enrollment rules, and eligibility verification. Self-service enrollment in ESS portal.",
    examples: [
      "Annual open enrollment: October 1-31, effective January 1",
      "Life event: Marriage triggers 30-day enrollment window for spouse coverage",
      "Auto-enroll: All new hires automatically enrolled in basic life insurance",
      "Add dependents: Spouse and 2 children to medical plan"
    ],
    businessBenefit: "Streamlined enrollment process with compliance safeguards and accurate coverage.",
    userValue: "Easy self-service enrollment with clear deadlines and coverage options.",
    keyCapabilities: ["Enrollment periods", "Life events", "Auto-enrollment", "Dependent management"]
  },

  // ===== PERFORMANCE MODULE =====
  appraisal_cycles: {
    code: "appraisal_cycles",
    detailedDescription: "Configure performance review cycles with weighted evaluation criteria: Goals, Competencies, and Responsibilities. Set rating scales, review periods, and participation rules. Supports both annual reviews and probation evaluations.",
    examples: [
      "Annual Review 2024: Goals 50%, Competencies 30%, Responsibilities 20%",
      "Rating scale: 1-5 where 3=Meets Expectations, 5=Exceeds",
      "Probation Review: 90-day review for new hires focused on competencies",
      "Manager Review: Special cycle for manager-level employees with 360 feedback"
    ],
    businessBenefit: "Standardized, fair performance evaluation enabling data-driven talent decisions.",
    userValue: "Clear evaluation criteria and expectations with transparent scoring.",
    keyCapabilities: ["Weighted criteria", "Rating scales", "Cycle types", "360 feedback support"]
  },

  goals: {
    code: "goals",
    detailedDescription: "Create and track individual goals with measurable targets. Goals can be suggested from job templates or created custom. Supports goal cascading from organizational to team to individual level with progress tracking.",
    examples: [
      "Suggested from job: 'Deliver 3 major features by Q4' (from Senior Developer job)",
      "Custom goal: 'Improve customer satisfaction score from 85% to 92%'",
      "Cascaded goal: 'Increase revenue 20%' → 'Close $2M in new business'",
      "Progress tracking: Goal 75% complete with 2 months remaining"
    ],
    businessBenefit: "Aligned objectives from organizational strategy to individual accountability.",
    userValue: "Clear goals with suggested templates and visible progress tracking.",
    keyCapabilities: ["Job suggestions", "Goal cascading", "Progress tracking", "Manager review"]
  },

  // ===== TIME & ATTENDANCE MODULE =====
  time_clock: {
    code: "time_clock",
    detailedDescription: "Multiple clock-in methods including web, mobile, and kiosk. Supports geofencing to verify location and optional facial recognition for identity confirmation. Real-time monitoring with exception alerts.",
    examples: [
      "Geofenced clock-in: Employee can only clock in within 100m of office location",
      "Facial recognition: Photo captured and matched to enrolled template",
      "Mobile clock-in for field workers with GPS location logging",
      "Kiosk mode for shared terminal with badge tap or PIN"
    ],
    businessBenefit: "Accurate time capture with fraud prevention and location verification.",
    userValue: "Convenient clock-in options with clear status visibility.",
    keyCapabilities: ["Geofencing", "Facial recognition", "Mobile access", "Kiosk mode"]
  },

  attendance_policies: {
    code: "attendance_policies",
    detailedDescription: "Configure attendance rules including grace periods, late thresholds, overtime rules, and break requirements. Policies can vary by employee group with automatic exception flagging for review.",
    examples: [
      "Grace period: 5 minutes after shift start before marked late",
      "Late threshold: 15+ minutes triggers automatic deduction",
      "Overtime: Automatic 1.5x after 40 hours/week",
      "Break requirement: Minimum 30-minute break after 6 hours"
    ],
    businessBenefit: "Consistent policy enforcement with automated calculations and exception handling.",
    userValue: "Clear attendance expectations with fair, transparent rule application.",
    keyCapabilities: ["Grace periods", "Overtime rules", "Break enforcement", "Exception flagging"]
  },

  // ===== HSE MODULE =====
  incidents: {
    code: "incidents",
    detailedDescription: "Report and investigate workplace safety incidents. Includes incident classification, root cause analysis, corrective actions, and regulatory reporting. Supports workflow routing for serious incidents.",
    examples: [
      "Report slip and fall: Minor injury, first aid only, no lost time",
      "Report equipment malfunction: Near miss, no injury, requires investigation",
      "OSHA-reportable incident: Lost time injury requiring Form 300 logging",
      "Investigation: Root cause identified, 3 corrective actions assigned"
    ],
    businessBenefit: "Proactive safety management reducing incidents and ensuring regulatory compliance.",
    userValue: "Easy incident reporting with clear follow-up and resolution tracking.",
    keyCapabilities: ["Incident types", "Investigation workflow", "OSHA reporting", "Corrective actions"]
  },

  risk_assessments: {
    code: "risk_assessments",
    detailedDescription: "Identify and assess workplace hazards with risk scoring and mitigation planning. Track control measures and reassessment schedules. Supports multiple assessment methodologies.",
    examples: [
      "Assess 'Working at Height' risk: Severity 4, Likelihood 3 = Score 12 (High)",
      "Control measure: Require harness for work above 2 meters",
      "Reassess quarterly or after any related incident",
      "Link risk to affected positions and required training"
    ],
    businessBenefit: "Systematic hazard identification and risk reduction protecting employees.",
    userValue: "Awareness of workplace risks and required precautions.",
    keyCapabilities: ["Risk scoring", "Control measures", "Reassessment scheduling", "Position linking"]
  },

  // ===== EMPLOYEE RELATIONS MODULE =====
  case_management: {
    code: "case_management",
    detailedDescription: "Track employee relations cases including grievances, complaints, and workplace disputes. Maintains confidential case notes, evidence, and resolution outcomes. Full audit trail for legal protection.",
    examples: [
      "Open harassment complaint case with confidential status",
      "Track investigation: Interviews completed, evidence reviewed, findings documented",
      "Link related cases for pattern identification",
      "Close case with resolution: Formal warning issued, documented in employee file"
    ],
    businessBenefit: "Consistent, documented case handling reducing legal exposure.",
    userValue: "Confidential avenue to raise concerns with clear process and outcomes.",
    keyCapabilities: ["Confidential handling", "Evidence tracking", "Case linking", "Resolution documentation"]
  },

  recognition: {
    code: "recognition",
    detailedDescription: "Employee recognition and awards programs with nominations, approvals, and award distribution. Supports peer-to-peer recognition, manager recognition, and formal award ceremonies.",
    examples: [
      "Peer recognition: 'Kudos' with points redeemable for rewards",
      "Manager recognition: 'Spot Bonus' for exceptional performance",
      "Formal award: 'Employee of the Quarter' with nomination and voting",
      "Service milestone: Automatic recognition at 5, 10, 15 year anniversaries"
    ],
    businessBenefit: "Improved employee engagement and retention through meaningful recognition.",
    userValue: "Visible appreciation with tangible rewards and career documentation.",
    keyCapabilities: ["Multiple programs", "Nomination workflow", "Points/rewards", "Milestone automation"]
  },

  // ===== RECRUITMENT MODULE =====
  job_requisitions: {
    code: "job_requisitions",
    detailedDescription: "Create and manage hiring requests with position details, budget approval, and job posting. Requisitions link to positions and include compensation ranges, requirements, and hiring timeline.",
    examples: [
      "Create requisition for 'Senior Developer' position with $120K-$150K range",
      "Route for approval: Hiring Manager → Finance → HR Director",
      "Post to job boards: LinkedIn, Indeed, Company careers page",
      "Track budget impact: 1 of 3 approved headcount for department"
    ],
    businessBenefit: "Controlled hiring process with budget visibility and approval governance.",
    userValue: "Clear hiring approval status and timeline expectations.",
    keyCapabilities: ["Position linking", "Budget approval", "Job posting", "Headcount tracking"]
  },

  applications: {
    code: "applications",
    detailedDescription: "Track candidates through hiring pipeline stages: Applied, Screening, Interview, Offer, Hired. Manage application source tracking, assessment results, and interview feedback with collaborative hiring team access.",
    examples: [
      "Stage progression: Applied → Phone Screen → Technical Interview → Onsite → Offer",
      "Source tracking: LinkedIn (35%), Indeed (25%), Referral (40%)",
      "Interview scorecard: Technical 4/5, Culture fit 5/5, Overall 4.5/5",
      "Multiple interviewers collaborate on single candidate evaluation"
    ],
    businessBenefit: "Efficient hiring process with data-driven candidate evaluation.",
    userValue: "Clear pipeline visibility with collaborative evaluation tools.",
    keyCapabilities: ["Stage management", "Source tracking", "Scorecards", "Collaboration"]
  },

  // ===== SUCCESSION MODULE =====
  succession_plans: {
    code: "succession_plans",
    detailedDescription: "Identify and develop successors for key positions. Track readiness levels (Ready Now, Ready 1-2 Years, Development Needed) and development plans. Supports multiple successor candidates per position.",
    examples: [
      "CFO Position: 2 candidates identified - VP Finance (Ready 1-2 Years), Controller (Development Needed)",
      "Develop plan: VP Finance needs Board presentation experience, assign to Q4 meeting",
      "Track readiness: Quarterly assessment of successor progress",
      "Risk alert: No successor identified for CEO - Critical gap"
    ],
    businessBenefit: "Business continuity assurance with proactive leadership development.",
    userValue: "Clear career advancement path with defined development requirements.",
    keyCapabilities: ["Readiness tracking", "Multiple successors", "Development planning", "Gap identification"]
  },

  nine_box: {
    code: "nine_box",
    detailedDescription: "Assess talent using Performance (Low/Medium/High) vs. Potential (Low/Medium/High) grid. Categorize employees for targeted development and succession planning. Supports calibration across managers.",
    examples: [
      "High Performance + High Potential = 'Star' → Accelerated development, succession candidate",
      "High Performance + Low Potential = 'Workhorse' → Recognize and retain, lateral moves",
      "Low Performance + High Potential = 'Inconsistent Player' → Coaching and development focus",
      "Calibration session: Managers align ratings across departments"
    ],
    businessBenefit: "Objective talent segmentation enabling targeted investment in development.",
    userValue: "Understanding of potential and career growth trajectory.",
    keyCapabilities: ["9-box grid", "Talent categories", "Calibration support", "Development linking"]
  },

  // ===== TRAINING MODULE =====
  courses: {
    code: "courses",
    detailedDescription: "Manage course catalog with delivery methods (online, classroom, blended), duration, prerequisites, and capacity limits. Track course history and effectiveness ratings.",
    examples: [
      "Create 'Leadership Fundamentals' course: 2-day classroom, capacity 20",
      "Create 'Compliance Training' course: Online, self-paced, mandatory for all employees",
      "Prerequisites: Must complete 'Management Basics' before 'Advanced Leadership'",
      "Effectiveness: Post-course assessment score 4.2/5.0"
    ],
    businessBenefit: "Structured learning catalog ensuring consistent training quality and tracking.",
    userValue: "Clear course options with prerequisites and expected outcomes.",
    keyCapabilities: ["Multiple formats", "Prerequisites", "Capacity management", "Effectiveness tracking"]
  },

  certifications: {
    code: "certifications",
    detailedDescription: "Track professional certifications with expiry dates, renewal requirements, and continuing education credits. Automated reminders before expiry and compliance reporting.",
    examples: [
      "Track PMP certification: Expires Dec 2025, requires 60 PDUs",
      "Track CPA license: Annual renewal, state-specific requirements",
      "Reminder: '30 days until CPR certification expires - schedule renewal'",
      "Compliance report: 95% of required certifications current"
    ],
    businessBenefit: "Workforce compliance assurance with proactive renewal management.",
    userValue: "Automated reminders preventing certification lapses.",
    keyCapabilities: ["Expiry tracking", "Renewal requirements", "Automated reminders", "Compliance reporting"]
  }
};

// Function to get enriched feature description with examples
export function getDetailedFeatureEnrichment(featureCode: string): DetailedFeatureEnrichment | undefined {
  return DETAILED_FEATURE_ENRICHMENTS[featureCode];
}

// Function to build comprehensive feature description for documentation
export function buildFeatureDocumentation(featureCode: string, featureName: string, baseDescription: string): string {
  const enrichment = DETAILED_FEATURE_ENRICHMENTS[featureCode];
  
  if (!enrichment) {
    return baseDescription;
  }
  
  let doc = enrichment.detailedDescription;
  
  if (enrichment.examples && enrichment.examples.length > 0) {
    doc += "\n\nExamples:\n";
    enrichment.examples.forEach((example, index) => {
      doc += `• ${example}\n`;
    });
  }
  
  if (enrichment.keyCapabilities && enrichment.keyCapabilities.length > 0) {
    doc += `\nKey Capabilities: ${enrichment.keyCapabilities.join(", ")}`;
  }
  
  return doc;
}
