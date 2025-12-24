// Comprehensive Feature Registry for HRplus Cerebra
// Single source of truth for all module features, organized by business groupings

import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

export interface FeatureDefinition {
  code: string;
  name: string;
  description: string;
  routePath: string;
  icon: string;
  tabCode: string;
  roleRequirements: string[];
  workflowSteps?: string[];
  uiElements?: string[];
  relatedFeatures?: string[];
}

export interface FeatureGroup {
  groupCode: string;
  groupName: string;
  features: FeatureDefinition[];
}

export interface ModuleDefinition {
  code: string;
  name: string;
  description: string;
  icon: string;
  routePath: string;
  roleRequirements: string[];
  groups: FeatureGroup[];
}

// ===== WORKFORCE MODULE =====
const workforceModule: ModuleDefinition = {
  code: "workforce",
  name: "Workforce Management",
  description: "Comprehensive employee and organizational structure management",
  icon: "Users",
  routePath: "/workforce",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "org_setup",
      groupName: "Organization Setup",
      features: [
        { code: "company_groups", name: "Company Groups", description: "Manage company group structures and divisions", routePath: "/workforce/company-groups", icon: "Layers", tabCode: "company_groups", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create group", "Add divisions", "Assign companies"], uiElements: ["Group list", "Division tree", "Company assignment"] },
        { code: "companies", name: "Companies", description: "Manage company entities and settings", routePath: "/workforce/companies", icon: "Building2", tabCode: "companies", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create company", "Configure settings", "Assign departments"], uiElements: ["Company grid", "Settings form", "Department list"] },
        { code: "divisions", name: "Divisions", description: "Manage company divisions and linked departments", routePath: "/workforce/divisions", icon: "Building", tabCode: "divisions", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create division", "Link departments", "Assign to company"], uiElements: ["Division list", "Department linker", "Company selector"] },
        { code: "departments", name: "Departments", description: "Manage organizational departments and sections", routePath: "/workforce/departments", icon: "FolderTree", tabCode: "departments", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create department", "Add sections", "Assign manager"], uiElements: ["Department tree", "Section editor", "Manager selector"] },
        { code: "governance", name: "Governance", description: "Manage company boards and management teams", routePath: "/workforce/governance", icon: "Shield", tabCode: "governance", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create body", "Add members", "Set authorities"], uiElements: ["Governance bodies", "Member list", "Authority settings"] },
        { code: "org_structure", name: "View Org Chart", description: "Visual organization chart with point-in-time viewing", routePath: "/workforce/org-structure", icon: "Network", tabCode: "org_structure", roleRequirements: ["admin", "hr_manager", "employee"], workflowSteps: ["Select date", "Navigate hierarchy", "View position details"], uiElements: ["Org chart canvas", "Date picker", "Position cards"] },
      ]
    },
    {
      groupCode: "job_architecture",
      groupName: "Job Architecture",
      features: [
        { code: "job_families", name: "Job Families", description: "Manage job family classifications", routePath: "/workforce/job-families", icon: "FolderTree", tabCode: "job_families", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create family", "Assign department", "Add jobs"], uiElements: ["Family list", "Department selector", "Job linker"] },
        { code: "jobs", name: "Jobs", description: "Define job definitions with responsibilities and competencies", routePath: "/workforce/jobs", icon: "Briefcase", tabCode: "jobs", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create job", "Add responsibilities", "Set competencies", "Define goals"], uiElements: ["Job grid", "Responsibility editor", "Competency matrix"] },
        { code: "competencies", name: "Competencies", description: "Manage organizational competency framework", routePath: "/workforce/competencies", icon: "Target", tabCode: "competencies", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create competency", "Define levels", "Link to jobs"], uiElements: ["Competency list", "Level editor", "Job linker"] },
        { code: "responsibilities", name: "Responsibilities", description: "Define and manage job responsibilities", routePath: "/workforce/responsibilities", icon: "ClipboardList", tabCode: "responsibilities", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create responsibility", "Set weighting", "Assign to jobs"], uiElements: ["Responsibility list", "Weight editor"] },
        { code: "positions", name: "Positions", description: "Manage positions with reporting lines and compensation", routePath: "/workforce/positions", icon: "UserCheck", tabCode: "positions", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create position", "Set reporting line", "Configure compensation"], uiElements: ["Position grid", "Org hierarchy", "Compensation form"] },
      ]
    },
    {
      groupCode: "employee_management",
      groupName: "Employee Management",
      features: [
        { code: "employees", name: "Employee Directory", description: "View and manage all employee records", routePath: "/workforce/employees", icon: "Users", tabCode: "employees", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Search employees", "View profile", "Edit details"], uiElements: ["Employee table", "Search bar", "Profile tabs"] },
        { code: "assignments", name: "Position Assignments", description: "Manage employee position assignments", routePath: "/workforce/assignments", icon: "UserCog", tabCode: "assignments", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select employee", "Assign position", "Set dates"], uiElements: ["Assignment grid", "Position selector", "Date picker"] },
        { code: "transactions", name: "Employee Transactions", description: "Process employee lifecycle transactions", routePath: "/workforce/transactions", icon: "UserPlus", tabCode: "transactions", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select transaction type", "Enter details", "Submit for approval"], uiElements: ["Transaction form", "Type selector", "Approval workflow"] },
        { code: "qualifications", name: "Qualifications", description: "Manage academic qualifications and professional certifications", routePath: "/workforce/qualifications", icon: "GraduationCap", tabCode: "qualifications", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Add qualification", "Verify credentials", "Track expiry"], uiElements: ["Qualification grid", "Verification panel", "Expiry tracker"] },
      ]
    },
    {
      groupCode: "employee_lifecycle",
      groupName: "Employee Lifecycle",
      features: [
        { code: "onboarding", name: "Onboarding", description: "Manage new hire onboarding with templates and tasks", routePath: "/workforce/onboarding", icon: "Rocket", tabCode: "onboarding", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create template", "Assign to new hire", "Track completion"], uiElements: ["Template editor", "Task checklist", "Progress tracker"] },
        { code: "offboarding", name: "Offboarding", description: "Manage employee exit process", routePath: "/workforce/offboarding", icon: "UserMinus", tabCode: "offboarding", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Initiate offboarding", "Conduct exit interview", "Collect assets"], uiElements: ["Offboarding checklist", "Exit interview form", "Asset tracker"] },
      ]
    },
    {
      groupCode: "headcount",
      groupName: "Headcount Planning",
      features: [
        { code: "headcount_requests", name: "Headcount Requests", description: "Request and approve new position headcounts", routePath: "/workforce/headcount-requests", icon: "UserPlus", tabCode: "headcount_requests", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create request", "Submit for approval", "Track status"], uiElements: ["Request form", "Approval workflow", "Status tracker"] },
        { code: "headcount_analytics", name: "Headcount Analytics", description: "Analyze headcount trends and metrics", routePath: "/workforce/headcount-analytics", icon: "PieChart", tabCode: "headcount_analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select metrics", "Apply filters", "View trends"], uiElements: ["KPI cards", "Trend charts", "Department breakdown"] },
        { code: "headcount_forecast", name: "Headcount Forecast", description: "AI-powered workforce demand forecasting", routePath: "/workforce/headcount-forecast", icon: "TrendingUp", tabCode: "headcount_forecast", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create scenario", "Set parameters", "Run forecast"], uiElements: ["Scenario builder", "Forecast charts", "What-if analysis"] },
        { code: "position_vacancies", name: "Position Vacancies", description: "Track open positions and vacancies", routePath: "/workforce/vacancies", icon: "UserX", tabCode: "position_vacancies", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View vacancies", "Filter by department", "Track fill progress"], uiElements: ["Vacancy grid", "Department filter", "Fill timeline"] },
      ]
    },
    {
      groupCode: "employee_profile",
      groupName: "Employee Profile",
      features: [
        // Core Profile Tabs
        { code: "emp_overview", name: "Profile Overview", description: "Employee summary with position and employment history", routePath: "/workforce/employees/:id/overview", icon: "User", tabCode: "emp_overview", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View summary", "Access history", "Navigate tabs"], uiElements: ["Profile card", "Position history", "Quick stats"] },
        { code: "emp_benefits", name: "Benefits", description: "Employee benefit plans, dependents and beneficiaries", routePath: "/workforce/employees/:id/benefits", icon: "Heart", tabCode: "emp_benefits", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View plans", "Manage dependents", "Update beneficiaries"], uiElements: ["Plan list", "Dependent table", "Beneficiary form"] },
        { code: "emp_branch_locations", name: "Branch Locations", description: "Assigned work locations and branches", routePath: "/workforce/employees/:id/branch-locations", icon: "MapPin", tabCode: "emp_branch_locations", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View locations", "Assign branch", "Track history"], uiElements: ["Location list", "Branch selector", "Assignment history"] },
        { code: "emp_competencies", name: "Competencies", description: "Skills and competency ratings", routePath: "/workforce/employees/:id/competencies", icon: "Target", tabCode: "emp_competencies", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View ratings", "Add competency", "Track progress"], uiElements: ["Competency grid", "Rating display", "Progress tracker"] },
        { code: "emp_contact_info", name: "Contact Information", description: "Personal, work and emergency contacts", routePath: "/workforce/employees/:id/contact-info", icon: "Phone", tabCode: "emp_contact_info", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View contacts", "Edit details", "Add emergency contact"], uiElements: ["Contact cards", "Edit forms", "Emergency list"] },
        { code: "emp_documents", name: "Documents", description: "Employee document repository", routePath: "/workforce/employees/:id/documents", icon: "FileText", tabCode: "emp_documents", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View documents", "Upload file", "Manage folders"], uiElements: ["Document grid", "Upload button", "Folder tree"] },
        { code: "emp_immigration", name: "Immigration", description: "Visa, work permits and CSME status", routePath: "/workforce/employees/:id/immigration", icon: "Globe", tabCode: "emp_immigration", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View status", "Track expiry", "Update documents"], uiElements: ["Status cards", "Expiry alerts", "Document upload"] },
        { code: "emp_interests", name: "Interests", description: "Personal interests and hobbies", routePath: "/workforce/employees/:id/interests", icon: "Star", tabCode: "emp_interests", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View interests", "Add interest", "Update preferences"], uiElements: ["Interest tags", "Add form", "Category filter"] },
        { code: "emp_languages", name: "Languages", description: "Language proficiency records", routePath: "/workforce/employees/:id/languages", icon: "Languages", tabCode: "emp_languages", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View languages", "Add language", "Set proficiency"], uiElements: ["Language list", "Proficiency selector", "Add form"] },
        { code: "emp_medical_profile", name: "Medical Profile", description: "Health and medical information", routePath: "/workforce/employees/:id/medical-profile", icon: "Stethoscope", tabCode: "emp_medical_profile", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View records", "Update info", "Track examinations"], uiElements: ["Medical summary", "Exam history", "Update form"] },
        { code: "emp_pay_info", name: "Pay Information", description: "Bank accounts and tax details", routePath: "/workforce/employees/:id/pay-info", icon: "Wallet", tabCode: "emp_pay_info", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View accounts", "Update tax info", "Manage deductions"], uiElements: ["Bank accounts", "Tax details", "Deduction list"] },
        { code: "emp_professional_info", name: "Professional Information", description: "Credentials, compliance and professional history", routePath: "/workforce/employees/:id/professional-info", icon: "Briefcase", tabCode: "emp_professional_info", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View credentials", "Track compliance", "Update history"], uiElements: ["Credential list", "Compliance status", "History timeline"] },
        { code: "emp_qualifications", name: "Qualifications", description: "Academic qualifications and certifications", routePath: "/workforce/employees/:id/qualifications", icon: "GraduationCap", tabCode: "emp_qualifications", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View qualifications", "Add credential", "Track expiry"], uiElements: ["Qualification grid", "Add form", "Expiry alerts"] },
        // Professional Info Sub-Features
        { code: "emp_compliance_legal", name: "Compliance & Legal", description: "Legal document tracking and compliance status", routePath: "/workforce/employees/:id/professional-info/compliance", icon: "Scale", tabCode: "emp_compliance_legal", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View compliance", "Update documents", "Track deadlines"], uiElements: ["Compliance grid", "Document list", "Deadline tracker"] },
        { code: "emp_credentials_memberships", name: "Credentials & Memberships", description: "Professional credentials and association memberships", routePath: "/workforce/employees/:id/professional-info/credentials", icon: "Award", tabCode: "emp_credentials_memberships", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View credentials", "Add membership", "Track renewals"], uiElements: ["Credential cards", "Membership list", "Renewal alerts"] },
        { code: "emp_references_verifications", name: "References & Verifications", description: "Employment references and background verifications", routePath: "/workforce/employees/:id/professional-info/references", icon: "CheckCircle", tabCode: "emp_references_verifications", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View references", "Request verification", "Track status"], uiElements: ["Reference list", "Verification status", "Request form"] },
        { code: "emp_agreements_signatures", name: "Agreements & Signatures", description: "Signed documents and agreement history", routePath: "/workforce/employees/:id/professional-info/agreements", icon: "FileSignature", tabCode: "emp_agreements_signatures", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View agreements", "Request signature", "Track completion"], uiElements: ["Agreement list", "Signature status", "Request workflow"] },
        { code: "emp_professional_history", name: "Professional History", description: "Prior employment and work experience", routePath: "/workforce/employees/:id/professional-info/history", icon: "History", tabCode: "emp_professional_history", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View history", "Add experience", "Verify details"], uiElements: ["History timeline", "Add form", "Verification status"] },
        // Extended Profile Features
        { code: "emp_addresses", name: "Addresses", description: "Home and mailing addresses", routePath: "/workforce/employees/:id/addresses", icon: "Home", tabCode: "emp_addresses", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View addresses", "Add address", "Set primary"], uiElements: ["Address cards", "Add form", "Primary selector"] },
        { code: "emp_bank_accounts", name: "Bank Accounts", description: "Employee payment account details", routePath: "/workforce/employees/:id/bank-accounts", icon: "Building2", tabCode: "emp_bank_accounts", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View accounts", "Add account", "Set primary"], uiElements: ["Account list", "Add form", "Primary selector"] },
        { code: "emp_beneficiaries", name: "Beneficiaries", description: "Insurance and pension beneficiaries", routePath: "/workforce/employees/:id/beneficiaries", icon: "Users", tabCode: "emp_beneficiaries", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View beneficiaries", "Add beneficiary", "Set allocation"], uiElements: ["Beneficiary list", "Add form", "Allocation editor"] },
        { code: "emp_dependents", name: "Dependents", description: "Dependent family members", routePath: "/workforce/employees/:id/dependents", icon: "Baby", tabCode: "emp_dependents", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View dependents", "Add dependent", "Link to benefits"], uiElements: ["Dependent list", "Add form", "Benefit linker"] },
        { code: "emp_emergency_contacts", name: "Emergency Contacts", description: "Emergency contact list and details", routePath: "/workforce/employees/:id/emergency-contacts", icon: "AlertCircle", tabCode: "emp_emergency_contacts", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View contacts", "Add contact", "Set priority"], uiElements: ["Contact list", "Add form", "Priority selector"] },
        { code: "emp_certificates", name: "Certificates", description: "Professional certificates and training completions", routePath: "/workforce/employees/:id/certificates", icon: "Medal", tabCode: "emp_certificates", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View certificates", "Add certificate", "Track expiry"], uiElements: ["Certificate grid", "Add form", "Expiry tracker"] },
        { code: "emp_licenses", name: "Licenses", description: "Professional and occupational licenses", routePath: "/workforce/employees/:id/licenses", icon: "FileCheck", tabCode: "emp_licenses", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View licenses", "Add license", "Track renewal"], uiElements: ["License list", "Add form", "Renewal alerts"] },
        { code: "emp_background_checks", name: "Background Checks", description: "Background check status and history", routePath: "/workforce/employees/:id/background-checks", icon: "Search", tabCode: "emp_background_checks", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View checks", "Initiate check", "Track status"], uiElements: ["Check history", "Initiate button", "Status tracker"] },
        { code: "emp_tax_allowances", name: "Tax Allowances", description: "Tax allowance claims and deductions", routePath: "/workforce/employees/:id/tax-allowances", icon: "Receipt", tabCode: "emp_tax_allowances", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View allowances", "Add claim", "Track approvals"], uiElements: ["Allowance list", "Claim form", "Approval status"] },
      ]
    },
    {
      groupCode: "analytics_planning",
      groupName: "Workforce Analytics",
      features: [
        { code: "org_changes", name: "Organization Changes", description: "Track and analyze organizational changes over time", routePath: "/workforce/org-changes", icon: "TrendingUp", tabCode: "org_changes", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select date range", "Compare periods", "View changes"], uiElements: ["Change timeline", "Comparison view", "Change details"] },
        { code: "forecasting", name: "Workforce Forecasting", description: "Predict and plan workforce needs", routePath: "/workforce/forecasting", icon: "LineChart", tabCode: "forecasting", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create scenario", "Set parameters", "Run simulation"], uiElements: ["Scenario builder", "Forecast charts", "What-if analysis"] },
        { code: "analytics", name: "Workforce Analytics", description: "Comprehensive workforce analytics dashboard", routePath: "/workforce/analytics", icon: "BarChart3", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select metrics", "Apply filters", "Export reports"], uiElements: ["KPI cards", "Charts", "Export options"] },
      ]
    }
  ]
};

// ===== LEAVE MODULE =====
const leaveModule: ModuleDefinition = {
  code: "leave",
  name: "Leave Management",
  description: "Manage employee time off including requests, approvals, and balances",
  icon: "Calendar",
  routePath: "/leave",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "self_service",
      groupName: "Self-Service",
      features: [
        { code: "my_leave", name: "My Leave", description: "View personal leave balances and history", routePath: "/leave/my-leave", icon: "Calendar", tabCode: "my_leave", roleRequirements: ["employee"], workflowSteps: ["View balances", "Check history", "See upcoming"], uiElements: ["Balance cards", "History table", "Calendar view"] },
        { code: "apply", name: "Apply for Leave", description: "Submit leave requests with date selection", routePath: "/leave/apply", icon: "CalendarPlus", tabCode: "apply", roleRequirements: ["employee"], workflowSteps: ["Select type", "Choose dates", "Add reason", "Submit"], uiElements: ["Type dropdown", "Date picker", "Reason field", "Balance display"] },
        { code: "calendar", name: "Team Calendar", description: "View team and department leave calendar", routePath: "/leave/calendar", icon: "Calendar", tabCode: "calendar", roleRequirements: ["admin", "hr_manager", "employee"], workflowSteps: ["Select view", "Filter team", "Click for details"], uiElements: ["Calendar grid", "Team filter", "Event popover"] },
      ]
    },
    {
      groupCode: "approvals_processing",
      groupName: "Approvals & Processing",
      features: [
        { code: "approvals", name: "Leave Approvals", description: "Review and approve leave requests", routePath: "/leave/approvals", icon: "CalendarCheck", tabCode: "approvals", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View pending", "Review details", "Approve/reject"], uiElements: ["Request list", "Detail panel", "Action buttons"] },
        { code: "balance_adjustments", name: "Balance Adjustments", description: "Manually adjust employee leave balances", routePath: "/leave/balance-adjustments", icon: "Settings", tabCode: "balance_adjustments", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select employee", "Choose type", "Enter adjustment"], uiElements: ["Employee selector", "Type dropdown", "Adjustment form"] },
      ]
    },
    {
      groupCode: "configuration",
      groupName: "Leave Configuration",
      features: [
        { code: "types", name: "Leave Types", description: "Configure leave types with accrual rules", routePath: "/leave/types", icon: "Settings", tabCode: "types", roleRequirements: ["admin"], workflowSteps: ["Create type", "Set accrual", "Configure rules"], uiElements: ["Type list", "Accrual form", "Rules editor"] },
        { code: "accrual_rules", name: "Accrual Rules", description: "Define leave accrual policies", routePath: "/leave/accrual-rules", icon: "TrendingUp", tabCode: "accrual_rules", roleRequirements: ["admin"], workflowSteps: ["Create rule", "Set criteria", "Assign to types"], uiElements: ["Rule builder", "Criteria form", "Type assignment"] },
        { code: "rollover_rules", name: "Rollover Rules", description: "Configure year-end rollover policies", routePath: "/leave/rollover-rules", icon: "RotateCcw", tabCode: "rollover_rules", roleRequirements: ["admin"], workflowSteps: ["Create rule", "Set limits", "Configure caps"], uiElements: ["Rule list", "Limit settings", "Cap configuration"] },
        { code: "holidays", name: "Holidays", description: "Manage country and company holidays", routePath: "/leave/holidays", icon: "PartyPopper", tabCode: "holidays", roleRequirements: ["admin"], workflowSteps: ["Add holiday", "Set date", "Assign to companies"], uiElements: ["Holiday calendar", "Date picker", "Company selector"] },
        { code: "comp_time_policies", name: "Comp Time Policies", description: "Configure compensatory time policies", routePath: "/leave/comp-time-policies", icon: "Settings", tabCode: "comp_time_policies", roleRequirements: ["admin"], workflowSteps: ["Create policy", "Set rules", "Assign scope"], uiElements: ["Policy editor", "Rules form"] },
      ]
    },
    {
      groupCode: "time_banking",
      groupName: "Time Banking",
      features: [
        { code: "compensatory_time", name: "Compensatory Time", description: "Manage earned compensatory time", routePath: "/leave/compensatory-time", icon: "Timer", tabCode: "compensatory_time", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View balances", "Record earned", "Process usage"], uiElements: ["Balance grid", "Entry form", "Usage tracker"] },
        { code: "balance_recalculation", name: "Balance Recalculation", description: "Recalculate leave balances for employees", routePath: "/leave/balance-recalculation", icon: "Calculator", tabCode: "balance_recalculation", roleRequirements: ["admin"], workflowSteps: ["Select scope", "Run calculation", "Review results"], uiElements: ["Scope selector", "Run button", "Results table"] },
      ]
    },
    {
      groupCode: "analytics",
      groupName: "Analytics",
      features: [
        { code: "analytics", name: "Leave Analytics", description: "Comprehensive leave analytics dashboard", routePath: "/leave/analytics", icon: "BarChart3", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select period", "Apply filters", "View trends"], uiElements: ["KPI cards", "Trend charts", "Distribution graphs"] },
      ]
    }
  ]
};

// ===== PAYROLL MODULE =====
const payrollModule: ModuleDefinition = {
  code: "payroll",
  name: "Payroll",
  description: "Process employee payroll including calculations, deductions, and payments",
  icon: "Wallet",
  routePath: "/payroll",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "processing",
      groupName: "Processing",
      features: [
        { code: "processing", name: "Payroll Processing", description: "Calculate and process payroll runs", routePath: "/payroll/processing", icon: "Calculator", tabCode: "processing", roleRequirements: ["admin"], workflowSteps: ["Select pay group", "Run calculation", "Review results", "Approve payroll"], uiElements: ["Pay group selector", "Calculation grid", "Approval workflow"] },
        { code: "pay_periods", name: "Pay Periods", description: "Manage pay period calendars", routePath: "/payroll/pay-periods", icon: "CalendarCheck", tabCode: "pay_periods", roleRequirements: ["admin"], workflowSteps: ["Generate periods", "Set dates", "Configure cycle"], uiElements: ["Period calendar", "Date editor", "Cycle settings"] },
        { code: "salary_overtime", name: "Pay Period Entries", description: "Manage compensation entries for pay periods", routePath: "/payroll/salary-overtime", icon: "Clock", tabCode: "salary_overtime", roleRequirements: ["admin"], workflowSteps: ["Select period", "Enter data", "Validate entries"], uiElements: ["Entry grid", "Data form", "Validation panel"] },
        { code: "regular_deductions", name: "Regular Deductions", description: "Manage recurring employee deductions", routePath: "/payroll/regular-deductions", icon: "Clock", tabCode: "regular_deductions", roleRequirements: ["admin"], workflowSteps: ["Create deduction", "Set schedule", "Track balance"], uiElements: ["Deduction list", "Schedule editor", "Balance tracker"] },
        { code: "expense_claims", name: "Expense Claims", description: "Approve expense claims for payroll", routePath: "/payroll/expense-claims", icon: "Receipt", tabCode: "expense_claims", roleRequirements: ["admin"], workflowSteps: ["Review claims", "Approve for payment", "Assign to period"], uiElements: ["Claims list", "Approval buttons", "Period selector"] },
      ]
    },
    {
      groupCode: "configuration",
      groupName: "Configuration",
      features: [
        { code: "pay_groups", name: "Pay Groups", description: "Configure pay groups and frequencies", routePath: "/payroll/pay-groups", icon: "Users", tabCode: "pay_groups", roleRequirements: ["admin"], workflowSteps: ["Create group", "Set frequency", "Assign employees"], uiElements: ["Group list", "Frequency selector", "Employee assignment"] },
        { code: "pay_elements", name: "Pay Elements", description: "Define pay element types", routePath: "/payroll/pay-elements", icon: "DollarSign", tabCode: "pay_elements", roleRequirements: ["admin"], workflowSteps: ["Create element", "Set type", "Configure rules"], uiElements: ["Element list", "Type selector", "Rules form"] },
        { code: "tax_config", name: "Tax Configuration", description: "Configure tax brackets and rates", routePath: "/payroll/tax-config", icon: "Receipt", tabCode: "tax_config", roleRequirements: ["admin"], workflowSteps: ["Select country", "Configure brackets", "Set rates"], uiElements: ["Country selector", "Bracket editor", "Rate inputs"] },
        { code: "statutory_types", name: "Statutory Deduction Types", description: "Manage country-level statutory deductions", routePath: "/payroll/statutory-deduction-types", icon: "FileSpreadsheet", tabCode: "statutory_types", roleRequirements: ["admin"], workflowSteps: ["Select country", "Add type", "Configure rules"], uiElements: ["Country filter", "Type list", "Rules editor"] },
        { code: "tax_allowances", name: "Tax Allowances", description: "Manage non-taxable allowances", routePath: "/payroll/tax-allowances", icon: "Receipt", tabCode: "tax_allowances", roleRequirements: ["admin"], workflowSteps: ["Create allowance", "Set limits", "Assign eligibility"], uiElements: ["Allowance list", "Limit editor", "Eligibility form"] },
        { code: "templates", name: "Payslip Templates", description: "Configure payslip branding and layout", routePath: "/payroll/templates", icon: "Palette", tabCode: "templates", roleRequirements: ["admin"], workflowSteps: ["Select template", "Configure branding", "Preview output"], uiElements: ["Template selector", "Branding editor", "Preview panel"] },
        { code: "holidays", name: "Holidays Calendar", description: "Manage holidays for payroll calculations", routePath: "/payroll/holidays", icon: "PartyPopper", tabCode: "holidays", roleRequirements: ["admin"], workflowSteps: ["Add holiday", "Set dates", "Configure scope"], uiElements: ["Holiday calendar", "Date picker", "Scope selector"] },
      ]
    },
    {
      groupCode: "integration",
      groupName: "Integration",
      features: [
        { code: "benefit_mappings", name: "Benefit Payroll Mappings", description: "Map benefit plans to pay elements", routePath: "/payroll/benefit-mappings", icon: "Link", tabCode: "benefit_mappings", roleRequirements: ["admin"], workflowSteps: ["Select plan", "Map to element", "Configure rules"], uiElements: ["Plan list", "Mapping editor", "Rules form"] },
        { code: "leave_payment_config", name: "Leave Payment Config", description: "Configure leave payment rules", routePath: "/payroll/leave-payment-config", icon: "Settings", tabCode: "leave_payment_config", roleRequirements: ["admin"], workflowSteps: ["Select leave type", "Set payment rules", "Configure mapping"], uiElements: ["Type selector", "Rules form", "Mapping editor"] },
        { code: "leave_buyout", name: "Leave Buyout", description: "Manage leave balance buyout agreements", routePath: "/payroll/leave-buyout", icon: "DollarSign", tabCode: "leave_buyout", roleRequirements: ["admin"], workflowSteps: ["Create agreement", "Set rate", "Process payment"], uiElements: ["Agreement form", "Rate editor", "Payment tracker"] },
        { code: "gl_interface", name: "GL Interface", description: "General ledger integration and journal entries", routePath: "/payroll/gl", icon: "BookOpen", tabCode: "gl_interface", roleRequirements: ["admin"], workflowSteps: ["Configure mapping", "Generate entries", "Export to GL"], uiElements: ["Mapping editor", "Entry generator", "Export panel"] },
        { code: "bank_file_builder", name: "Bank File Builder", description: "AI-powered bank file configuration", routePath: "/payroll/bank-file-builder", icon: "FileSpreadsheet", tabCode: "bank_file_builder", roleRequirements: ["admin"], workflowSteps: ["Upload spec", "Configure format", "Generate file"], uiElements: ["Spec uploader", "Format editor", "File generator"] },
      ]
    },
    {
      groupCode: "reporting",
      groupName: "Reporting & Analytics",
      features: [
        { code: "reports", name: "Payroll Reports", description: "Generate payroll reports", routePath: "/payroll/reports", icon: "FileSpreadsheet", tabCode: "reports", roleRequirements: ["admin"], workflowSteps: ["Select report", "Set parameters", "Generate output"], uiElements: ["Report selector", "Parameter form", "Output viewer"] },
        { code: "year_end", name: "Year-End Processing", description: "Process year-end payroll", routePath: "/payroll/year-end", icon: "FileSpreadsheet", tabCode: "year_end", roleRequirements: ["admin"], workflowSteps: ["Select year", "Run processing", "Generate forms"], uiElements: ["Year selector", "Processing wizard", "Form generator"] },
        { code: "archive_settings", name: "Archive Settings", description: "Configure payroll data archiving", routePath: "/payroll/archive-settings", icon: "Archive", tabCode: "archive_settings", roleRequirements: ["admin"], workflowSteps: ["Set retention", "Configure schedule", "Run archive"], uiElements: ["Retention settings", "Schedule editor", "Archive trigger"] },
      ]
    }
  ]
};

// ===== TIME & ATTENDANCE MODULE =====
const timeAttendanceModule: ModuleDefinition = {
  code: "time_attendance",
  name: "Time & Attendance",
  description: "Track employee time, attendance, and scheduling",
  icon: "Clock",
  routePath: "/time-attendance",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "daily_operations",
      groupName: "Daily Operations",
      features: [
        { code: "tracking", name: "Time Tracking", description: "Real-time employee time tracking", routePath: "/time-attendance/tracking", icon: "Timer", tabCode: "tracking", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View active", "Clock in/out", "Edit entries"], uiElements: ["Active tracker", "Clock buttons", "Entry editor"] },
        { code: "records", name: "Attendance Records", description: "View and manage attendance records", routePath: "/time-attendance/records", icon: "ClipboardList", tabCode: "records", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select date range", "Filter employees", "Export data"], uiElements: ["Records table", "Date picker", "Filter panel"] },
        { code: "live", name: "Live Dashboard", description: "Real-time attendance monitoring", routePath: "/time-attendance/live", icon: "UserCheck", tabCode: "live", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Monitor status", "View locations", "Check alerts"], uiElements: ["Status grid", "Location map", "Alert panel"] },
        { code: "exceptions", name: "Attendance Exceptions", description: "Review and resolve attendance exceptions", routePath: "/time-attendance/exceptions", icon: "AlertCircle", tabCode: "exceptions", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View exceptions", "Review details", "Resolve issue"], uiElements: ["Exception list", "Detail panel", "Resolution form"] },
      ]
    },
    {
      groupCode: "scheduling",
      groupName: "Scheduling",
      features: [
        { code: "schedules", name: "Work Schedules", description: "Create and manage work schedules", routePath: "/time-attendance/schedules", icon: "Calendar", tabCode: "schedules", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create schedule", "Assign employees", "Publish"], uiElements: ["Schedule grid", "Assignment panel", "Publish button"] },
        { code: "shifts", name: "Shift Management", description: "Define and manage shift patterns", routePath: "/time-attendance/shifts", icon: "Sun", tabCode: "shifts", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create shift", "Set times", "Configure rules"], uiElements: ["Shift list", "Time editor", "Rules form"] },
        { code: "overtime", name: "Overtime Management", description: "Track and approve overtime", routePath: "/time-attendance/overtime", icon: "Clock", tabCode: "overtime", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Review requests", "Approve overtime", "Track hours"], uiElements: ["Request list", "Approval buttons", "Hours tracker"] },
      ]
    },
    {
      groupCode: "project_time",
      groupName: "Project Time",
      features: [
        { code: "projects", name: "Project Time", description: "Track time against projects", routePath: "/time-attendance/projects", icon: "Briefcase", tabCode: "projects", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select project", "Log time", "Review entries"], uiElements: ["Project list", "Time entry", "Entry review"] },
        { code: "timesheet_approvals", name: "Timesheet Approvals", description: "Review and approve timesheets", routePath: "/time-attendance/timesheet-approvals", icon: "ClipboardList", tabCode: "timesheet_approvals", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View pending", "Review entries", "Approve/reject"], uiElements: ["Pending list", "Entry details", "Action buttons"] },
      ]
    },
    {
      groupCode: "configuration",
      groupName: "Configuration",
      features: [
        { code: "policies", name: "Attendance Policies", description: "Configure attendance policies", routePath: "/time-attendance/policies", icon: "Settings", tabCode: "policies", roleRequirements: ["admin"], workflowSteps: ["Create policy", "Set rules", "Assign scope"], uiElements: ["Policy list", "Rules editor", "Scope selector"] },
        { code: "devices", name: "Time Devices", description: "Manage time clock devices", routePath: "/time-attendance/devices", icon: "Settings", tabCode: "devices", roleRequirements: ["admin"], workflowSteps: ["Add device", "Configure settings", "Monitor status"], uiElements: ["Device list", "Settings form", "Status monitor"] },
        { code: "geofencing", name: "Geofencing", description: "Configure location-based clock-in zones", routePath: "/time-attendance/geofencing", icon: "MapPin", tabCode: "geofencing", roleRequirements: ["admin"], workflowSteps: ["Create zone", "Set boundary", "Configure rules"], uiElements: ["Zone map", "Boundary editor", "Rules form"] },
        { code: "import", name: "Data Import", description: "Import attendance data from external sources", routePath: "/time-attendance/import", icon: "ClipboardList", tabCode: "import", roleRequirements: ["admin"], workflowSteps: ["Upload file", "Map fields", "Validate data"], uiElements: ["File uploader", "Mapping editor", "Validation panel"] },
      ]
    },
    {
      groupCode: "analytics",
      groupName: "Analytics",
      features: [
        { code: "analytics", name: "Attendance Analytics", description: "Comprehensive attendance analytics", routePath: "/time-attendance/analytics", icon: "TrendingUp", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select metrics", "Apply filters", "View trends"], uiElements: ["KPI cards", "Trend charts", "Breakdown tables"] },
      ]
    }
  ]
};

// ===== TRAINING MODULE =====
const trainingModule: ModuleDefinition = {
  code: "training",
  name: "Training & Development",
  description: "Learning management system for employee training and development",
  icon: "GraduationCap",
  routePath: "/training",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "course_development",
      groupName: "Course Development & Delivery",
      features: [
        { code: "content_authoring", name: "Content Authoring", description: "Create and edit training content", routePath: "/training/content-authoring", icon: "PenTool", tabCode: "content-authoring", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create content", "Add modules", "Publish"], uiElements: ["Content editor", "Module builder", "Publish controls"] },
        { code: "virtual_classroom", name: "Virtual Classroom", description: "Manage virtual training sessions", routePath: "/training/virtual-classroom", icon: "Monitor", tabCode: "virtual-classroom", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Schedule session", "Set up room", "Manage attendance"], uiElements: ["Session scheduler", "Room settings", "Attendance list"] },
        { code: "live_sessions", name: "Live Sessions", description: "Manage live training sessions", routePath: "/training/sessions", icon: "Video", tabCode: "sessions", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create session", "Send invites", "Conduct training"], uiElements: ["Session list", "Invite manager", "Attendance tracker"] },
        { code: "course_competencies", name: "Course Competencies", description: "Link courses to competencies", routePath: "/training/course-competencies", icon: "Link", tabCode: "course-competencies", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select course", "Link competencies", "Set levels"], uiElements: ["Course selector", "Competency linker", "Level editor"] },
        { code: "lms", name: "LMS Settings", description: "Configure LMS settings", routePath: "/admin/lms", icon: "Settings", tabCode: "lms", roleRequirements: ["admin"], workflowSteps: ["Configure settings", "Set defaults", "Manage integration"], uiElements: ["Settings form", "Default editor", "Integration panel"] },
      ]
    },
    {
      groupCode: "learning_development",
      groupName: "Learning & Development",
      features: [
        { code: "catalog", name: "Course Catalog", description: "Browse available training courses", routePath: "/training/catalog", icon: "BookOpen", tabCode: "catalog", roleRequirements: ["admin", "hr_manager", "employee"], workflowSteps: ["Browse courses", "View details", "Enroll"], uiElements: ["Course cards", "Detail modal", "Enroll button"] },
        { code: "employee_learning", name: "Employee Learning", description: "Manage employee course enrollments", routePath: "/training/employee-learning", icon: "GraduationCap", tabCode: "employee-learning", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select employee", "Assign courses", "Track progress"], uiElements: ["Employee selector", "Course assignment", "Progress tracker"] },
        { code: "employee_certifications", name: "Employee Certifications", description: "Manage employee certifications", routePath: "/training/employee-certifications", icon: "Award", tabCode: "employee-certifications", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View certifications", "Issue certificate", "Track expiry"], uiElements: ["Certification grid", "Issue form", "Expiry tracker"] },
        { code: "learning_paths", name: "Learning Paths", description: "Create structured learning journeys", routePath: "/training/learning-paths", icon: "Route", tabCode: "learning-paths", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create path", "Add courses", "Set sequence"], uiElements: ["Path builder", "Course list", "Sequence editor"] },
      ]
    },
    {
      groupCode: "planning_assessment",
      groupName: "Planning & Assessment",
      features: [
        { code: "needs", name: "Training Needs", description: "Identify training needs", routePath: "/training/needs", icon: "TrendingUp", tabCode: "needs", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Assess needs", "Prioritize", "Plan training"], uiElements: ["Needs assessment", "Priority matrix", "Planning tool"] },
        { code: "gap_analysis", name: "Skills Gap Analysis", description: "Analyze skills gaps across organization", routePath: "/training/gap-analysis", icon: "Target", tabCode: "gap-analysis", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Define requirements", "Assess current", "Identify gaps"], uiElements: ["Requirements editor", "Assessment tool", "Gap report"] },
        { code: "evaluations", name: "Training Evaluations", description: "Evaluate training effectiveness", routePath: "/training/evaluations", icon: "ClipboardCheck", tabCode: "evaluations", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create evaluation", "Collect feedback", "Analyze results"], uiElements: ["Evaluation form", "Feedback collector", "Results dashboard"] },
        { code: "compliance", name: "Compliance Training", description: "Track mandatory compliance training", routePath: "/training/compliance", icon: "Shield", tabCode: "compliance", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Define requirements", "Assign training", "Track completion"], uiElements: ["Requirements list", "Assignment panel", "Completion tracker"] },
        { code: "recertification", name: "Recertification", description: "Manage certification renewals", routePath: "/training/recertification", icon: "RefreshCw", tabCode: "recertification", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Track expiry", "Send reminders", "Process renewal"], uiElements: ["Expiry tracker", "Reminder system", "Renewal form"] },
      ]
    },
    {
      groupCode: "operations",
      groupName: "Operations",
      features: [
        { code: "requests", name: "Training Requests", description: "Manage training requests", routePath: "/training/requests", icon: "FileText", tabCode: "requests", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Review requests", "Approve/reject", "Schedule training"], uiElements: ["Request list", "Action buttons", "Scheduler"] },
        { code: "external", name: "External Training", description: "Manage external training providers", routePath: "/training/external", icon: "ExternalLink", tabCode: "external", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Add provider", "Register training", "Track costs"], uiElements: ["Provider list", "Registration form", "Cost tracker"] },
        { code: "instructors", name: "Instructors", description: "Manage training instructors", routePath: "/training/instructors", icon: "Users", tabCode: "instructors", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Add instructor", "Assign courses", "Track performance"], uiElements: ["Instructor list", "Course assignment", "Performance metrics"] },
        { code: "budgets", name: "Training Budgets", description: "Manage training budgets", routePath: "/training/budgets", icon: "DollarSign", tabCode: "budgets", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Set budget", "Track spending", "Forecast needs"], uiElements: ["Budget form", "Spending tracker", "Forecast chart"] },
        { code: "calendar", name: "Training Calendar", description: "View training schedule", routePath: "/training/calendar", icon: "Calendar", tabCode: "calendar", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View schedule", "Add sessions", "Manage conflicts"], uiElements: ["Calendar view", "Session form", "Conflict resolver"] },
      ]
    },
    {
      groupCode: "analytics",
      groupName: "Analytics",
      features: [
        { code: "analytics", name: "Training Analytics", description: "Comprehensive training analytics", routePath: "/training/analytics", icon: "BarChart3", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select metrics", "Apply filters", "Export reports"], uiElements: ["KPI cards", "Charts", "Export options"] },
      ]
    }
  ]
};

// ===== PERFORMANCE MODULE =====
const performanceModule: ModuleDefinition = {
  code: "performance",
  name: "Performance Management",
  description: "Employee performance appraisals, goals, and feedback",
  icon: "Target",
  routePath: "/performance",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "appraisals",
      groupName: "Appraisals",
      features: [
        { code: "cycles", name: "Appraisal Cycles", description: "Manage performance appraisal cycles", routePath: "/performance/cycles", icon: "Calendar", tabCode: "cycles", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create cycle", "Set dates", "Assign participants"], uiElements: ["Cycle list", "Date picker", "Participant assignment"] },
        { code: "evaluations", name: "Performance Evaluations", description: "Conduct employee performance evaluations", routePath: "/performance/evaluations", icon: "ClipboardCheck", tabCode: "evaluations", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select employee", "Rate performance", "Submit evaluation"], uiElements: ["Employee selector", "Rating form", "Submit button"] },
        { code: "calibration", name: "Calibration Sessions", description: "Calibrate performance ratings across teams", routePath: "/performance/calibration", icon: "Scale", tabCode: "calibration", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Schedule session", "Review ratings", "Adjust scores"], uiElements: ["Session scheduler", "Rating comparison", "Adjustment panel"] },
      ]
    },
    {
      groupCode: "goals_feedback",
      groupName: "Goals & Feedback",
      features: [
        { code: "goals", name: "Goal Management", description: "Set and track employee goals", routePath: "/performance/goals", icon: "Target", tabCode: "goals", roleRequirements: ["admin", "hr_manager", "employee"], workflowSteps: ["Create goal", "Set targets", "Track progress"], uiElements: ["Goal list", "Target editor", "Progress tracker"] },
        { code: "360_feedback", name: "360-Degree Feedback", description: "Collect multi-rater feedback", routePath: "/performance/360-feedback", icon: "Users", tabCode: "360-feedback", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create cycle", "Select reviewers", "Collect feedback"], uiElements: ["Cycle manager", "Reviewer selector", "Feedback form"] },
        { code: "continuous_feedback", name: "Continuous Feedback", description: "Real-time feedback and recognition", routePath: "/performance/continuous-feedback", icon: "MessageCircle", tabCode: "continuous-feedback", roleRequirements: ["admin", "hr_manager", "employee"], workflowSteps: ["Give feedback", "Request feedback", "View history"], uiElements: ["Feedback form", "Request button", "History list"] },
      ]
    },
    {
      groupCode: "analytics",
      groupName: "Analytics",
      features: [
        { code: "analytics", name: "Performance Analytics", description: "Analyze performance trends", routePath: "/performance/analytics", icon: "BarChart3", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select metrics", "Apply filters", "View trends"], uiElements: ["KPI cards", "Trend charts", "Distribution graphs"] },
        { code: "nine_box", name: "9-Box Grid", description: "Talent assessment using 9-box grid", routePath: "/performance/nine-box", icon: "LayoutGrid", tabCode: "nine-box", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Plot employees", "Review positions", "Plan development"], uiElements: ["9-box grid", "Employee cards", "Action panel"] },
      ]
    }
  ]
};

// ===== ESS MODULE =====
const essModule: ModuleDefinition = {
  code: "ess",
  name: "Employee Self Service",
  description: "Self-service portal for employees",
  icon: "User",
  routePath: "/ess",
  roleRequirements: ["employee"],
  groups: [
    {
      groupCode: "personal",
      groupName: "Personal Information",
      features: [
        { code: "profile", name: "My Profile", description: "View and update personal information", routePath: "/ess/profile", icon: "User", tabCode: "profile", roleRequirements: ["employee"], workflowSteps: ["View profile", "Edit information", "Upload documents"], uiElements: ["Profile tabs", "Edit forms", "Document uploader"] },
        { code: "documents", name: "My Documents", description: "Access personal HR documents", routePath: "/ess/documents", icon: "FileText", tabCode: "documents", roleRequirements: ["employee"], workflowSteps: ["Browse documents", "Download files", "Upload new"], uiElements: ["Document list", "Download button", "Upload form"] },
      ]
    },
    {
      groupCode: "time_leave",
      groupName: "Time & Leave",
      features: [
        { code: "leave", name: "My Leave", description: "Manage leave requests", routePath: "/ess/leave", icon: "Calendar", tabCode: "leave", roleRequirements: ["employee"], workflowSteps: ["Check balance", "Submit request", "Track status"], uiElements: ["Balance cards", "Request form", "Status tracker"] },
        { code: "timesheet", name: "My Timesheet", description: "Submit and track timesheets", routePath: "/ess/timesheet", icon: "Clock", tabCode: "timesheet", roleRequirements: ["employee"], workflowSteps: ["Enter time", "Submit timesheet", "View history"], uiElements: ["Time entry", "Submit button", "History list"] },
      ]
    },
    {
      groupCode: "compensation",
      groupName: "Compensation",
      features: [
        { code: "payslips", name: "My Payslips", description: "View and download payslips", routePath: "/ess/payslips", icon: "Receipt", tabCode: "payslips", roleRequirements: ["employee"], workflowSteps: ["Select period", "View payslip", "Download PDF"], uiElements: ["Period list", "Payslip viewer", "Download button"] },
        { code: "benefits", name: "My Benefits", description: "View and manage benefit enrollments", routePath: "/ess/benefits", icon: "Heart", tabCode: "benefits", roleRequirements: ["employee"], workflowSteps: ["View plans", "Enroll/change", "Submit claims"], uiElements: ["Plan cards", "Enrollment form", "Claims list"] },
      ]
    },
    {
      groupCode: "development",
      groupName: "Development",
      features: [
        { code: "learning", name: "My Learning", description: "Access training courses", routePath: "/ess/learning", icon: "BookOpen", tabCode: "learning", roleRequirements: ["employee"], workflowSteps: ["Browse courses", "Start learning", "Track progress"], uiElements: ["Course cards", "Learning player", "Progress bar"] },
        { code: "goals", name: "My Goals", description: "View and track personal goals", routePath: "/ess/goals", icon: "Target", tabCode: "goals", roleRequirements: ["employee"], workflowSteps: ["View goals", "Update progress", "Request review"], uiElements: ["Goal list", "Progress editor", "Review request"] },
        { code: "qualifications", name: "My Qualifications", description: "Manage qualifications and certifications", routePath: "/ess/qualifications", icon: "Award", tabCode: "qualifications", roleRequirements: ["employee"], workflowSteps: ["Add qualification", "Upload proof", "Track expiry"], uiElements: ["Qualification list", "Upload form", "Expiry tracker"] },
      ]
    }
  ]
};

// ===== MSS MODULE =====
const mssModule: ModuleDefinition = {
  code: "mss",
  name: "Manager Self Service",
  description: "Self-service portal for managers",
  icon: "Users",
  routePath: "/mss",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "team_management",
      groupName: "Team Management",
      features: [
        { code: "team", name: "My Team", description: "View and manage direct reports", routePath: "/mss/team", icon: "Users", tabCode: "team", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View team", "Check status", "Take action"], uiElements: ["Team grid", "Status cards", "Action menu"] },
        { code: "direct_reports_goals", name: "Team Goals", description: "View and manage team goals", routePath: "/mss/direct-reports-goals", icon: "Target", tabCode: "direct-reports-goals", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View goals", "Track progress", "Provide feedback"], uiElements: ["Goal list", "Progress tracker", "Feedback form"] },
      ]
    },
    {
      groupCode: "approvals",
      groupName: "Approvals",
      features: [
        { code: "leave_approvals", name: "Leave Approvals", description: "Approve team leave requests", routePath: "/mss/leave-approvals", icon: "CalendarCheck", tabCode: "leave-approvals", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View requests", "Review details", "Approve/reject"], uiElements: ["Request list", "Detail panel", "Action buttons"] },
        { code: "timesheet_approvals", name: "Timesheet Approvals", description: "Approve team timesheets", routePath: "/mss/timesheet-approvals", icon: "Clock", tabCode: "timesheet-approvals", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View timesheets", "Review entries", "Approve/reject"], uiElements: ["Timesheet list", "Entry review", "Action buttons"] },
        { code: "expense_approvals", name: "Expense Approvals", description: "Approve team expense claims", routePath: "/mss/expense-approvals", icon: "Receipt", tabCode: "expense-approvals", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View claims", "Review receipts", "Approve/reject"], uiElements: ["Claims list", "Receipt viewer", "Action buttons"] },
      ]
    },
    {
      groupCode: "team_lifecycle",
      groupName: "Team Lifecycle",
      features: [
        { code: "onboarding_tracking", name: "Onboarding Tracking", description: "Track new hire onboarding", routePath: "/mss/onboarding", icon: "Rocket", tabCode: "onboarding", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View progress", "Assign tasks", "Complete onboarding"], uiElements: ["Progress tracker", "Task list", "Completion form"] },
        { code: "offboarding_tracking", name: "Offboarding Tracking", description: "Track employee offboarding", routePath: "/mss/offboarding", icon: "UserMinus", tabCode: "offboarding", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View tasks", "Complete items", "Finalize exit"], uiElements: ["Task list", "Completion form", "Exit summary"] },
      ]
    }
  ]
};

// ===== ADMIN MODULE =====
const adminModule: ModuleDefinition = {
  code: "admin",
  name: "Admin & Security",
  description: "System administration and security settings",
  icon: "Settings",
  routePath: "/admin",
  roleRequirements: ["admin"],
  groups: [
    {
      groupCode: "user_management",
      groupName: "User Management",
      features: [
        { code: "users", name: "User Management", description: "Manage system users", routePath: "/admin/users", icon: "Users", tabCode: "users", roleRequirements: ["admin"], workflowSteps: ["View users", "Create user", "Assign roles"], uiElements: ["User table", "User form", "Role assignment"] },
        { code: "roles", name: "Role Management", description: "Configure roles and permissions", routePath: "/admin/roles", icon: "Shield", tabCode: "roles", roleRequirements: ["admin"], workflowSteps: ["View roles", "Create role", "Set permissions"], uiElements: ["Role list", "Permission matrix", "Assignment panel"] },
        { code: "permissions", name: "Granular Permissions", description: "Configure fine-grained permissions", routePath: "/admin/permissions", icon: "Lock", tabCode: "permissions", roleRequirements: ["admin"], workflowSteps: ["Select role", "Configure access", "Save changes"], uiElements: ["Role selector", "Permission editor", "Save button"] },
      ]
    },
    {
      groupCode: "security",
      groupName: "Security",
      features: [
        { code: "audit_logs", name: "Audit Logs", description: "View system audit trail", routePath: "/admin/audit-logs", icon: "FileSearch", tabCode: "audit-logs", roleRequirements: ["admin"], workflowSteps: ["Set date range", "Filter actions", "Export logs"], uiElements: ["Log table", "Filter panel", "Export button"] },
        { code: "password_policies", name: "Password Policies", description: "Configure password requirements", routePath: "/admin/password-policies", icon: "Key", tabCode: "password-policies", roleRequirements: ["admin"], workflowSteps: ["Set requirements", "Configure expiry", "Save policy"], uiElements: ["Policy form", "Expiry settings", "Save button"] },
      ]
    },
    {
      groupCode: "system_config",
      groupName: "System Configuration",
      features: [
        { code: "settings", name: "System Settings", description: "Configure system-wide settings", routePath: "/admin/settings", icon: "Settings", tabCode: "settings", roleRequirements: ["admin"], workflowSteps: ["Select category", "Configure options", "Save changes"], uiElements: ["Category tabs", "Settings form", "Save button"] },
        { code: "lookup_values", name: "Lookup Values", description: "Manage system lookup data", routePath: "/admin/lookup-values", icon: "Database", tabCode: "lookup-values", roleRequirements: ["admin"], workflowSteps: ["Select category", "Add values", "Manage items"], uiElements: ["Category selector", "Value list", "Add form"] },
        { code: "workflows", name: "Workflow Configuration", description: "Configure approval workflows", routePath: "/admin/workflows", icon: "GitBranch", tabCode: "workflows", roleRequirements: ["admin"], workflowSteps: ["Create workflow", "Add steps", "Assign approvers"], uiElements: ["Workflow builder", "Step editor", "Approver selector"] },
      ]
    }
  ]
};

// ===== RECRUITMENT MODULE =====
const recruitmentModule: ModuleDefinition = {
  code: "recruitment",
  name: "Recruitment",
  description: "End-to-end talent acquisition and hiring management",
  icon: "UserPlus",
  routePath: "/recruitment",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "job_management",
      groupName: "Job Management",
      features: [
        { code: "requisitions", name: "Job Requisitions", description: "Create and manage job requisitions", routePath: "/recruitment/requisitions", icon: "FileText", tabCode: "requisitions", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create requisition", "Get approval", "Post job"], uiElements: ["Requisition form", "Approval workflow", "Job posting"] },
        { code: "job_postings", name: "Job Postings", description: "Manage job postings across channels", routePath: "/recruitment/job-postings", icon: "Megaphone", tabCode: "job_postings", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create posting", "Select channels", "Publish"], uiElements: ["Posting editor", "Channel selector", "Publish button"] },
        { code: "job_templates", name: "Job Templates", description: "Create reusable job description templates", routePath: "/recruitment/templates", icon: "FileCheck", tabCode: "job_templates", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create template", "Define sections", "Save for reuse"], uiElements: ["Template editor", "Section builder"] },
      ]
    },
    {
      groupCode: "candidate_management",
      groupName: "Candidate Management",
      features: [
        { code: "candidates", name: "Candidate Pool", description: "Manage candidate database", routePath: "/recruitment/candidates", icon: "Users", tabCode: "candidates", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Search candidates", "View profile", "Track status"], uiElements: ["Candidate table", "Profile view", "Status tracker"] },
        { code: "applications", name: "Applications", description: "Review and process job applications", routePath: "/recruitment/applications", icon: "Inbox", tabCode: "applications", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Review application", "Screen candidate", "Move to next stage"], uiElements: ["Application list", "Screening form", "Stage selector"] },
        { code: "talent_pools", name: "Talent Pools", description: "Organize candidates into talent pools", routePath: "/recruitment/talent-pools", icon: "FolderHeart", tabCode: "talent_pools", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create pool", "Add candidates", "Nurture talent"], uiElements: ["Pool list", "Candidate assignment", "Communication tools"] },
      ]
    },
    {
      groupCode: "hiring_process",
      groupName: "Hiring Process",
      features: [
        { code: "interviews", name: "Interview Scheduling", description: "Schedule and manage interviews", routePath: "/recruitment/interviews", icon: "Calendar", tabCode: "interviews", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Schedule interview", "Assign interviewers", "Collect feedback"], uiElements: ["Calendar view", "Interviewer selector", "Feedback form"] },
        { code: "assessments", name: "Assessments", description: "Manage candidate assessments and tests", routePath: "/recruitment/assessments", icon: "ClipboardCheck", tabCode: "assessments", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Assign assessment", "Track completion", "Review results"], uiElements: ["Assessment library", "Assignment panel", "Results viewer"] },
        { code: "offers", name: "Offer Management", description: "Create and manage job offers", routePath: "/recruitment/offers", icon: "FileSignature", tabCode: "offers", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create offer", "Get approval", "Send to candidate"], uiElements: ["Offer builder", "Approval workflow", "E-signature"] },
      ]
    },
    {
      groupCode: "analytics",
      groupName: "Analytics",
      features: [
        { code: "analytics", name: "Recruitment Analytics", description: "Track recruitment metrics and KPIs", routePath: "/recruitment/analytics", icon: "BarChart3", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select metrics", "View dashboard", "Export reports"], uiElements: ["KPI cards", "Charts", "Report export"] },
        { code: "pipeline", name: "Hiring Pipeline", description: "Visualize candidate pipeline", routePath: "/recruitment/pipeline", icon: "GitBranch", tabCode: "pipeline", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View pipeline", "Move candidates", "Track progress"], uiElements: ["Kanban board", "Stage cards", "Drag-drop interface"] },
      ]
    }
  ]
};

// ===== HEALTH & SAFETY (HSE) MODULE =====
const hseModule: ModuleDefinition = {
  code: "hse",
  name: "Health & Safety",
  description: "Occupational health and safety management",
  icon: "HeartPulse",
  routePath: "/hse",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "incident_management",
      groupName: "Incident Management",
      features: [
        { code: "incidents", name: "Incident Reports", description: "Report and track workplace incidents", routePath: "/hse/incidents", icon: "AlertTriangle", tabCode: "incidents", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Report incident", "Investigate", "Close case"], uiElements: ["Incident form", "Investigation panel", "Case tracker"] },
        { code: "investigations", name: "Investigations", description: "Conduct incident investigations", routePath: "/hse/investigations", icon: "Search", tabCode: "investigations", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Assign investigator", "Document findings", "Recommend actions"], uiElements: ["Investigation form", "Evidence upload", "Findings report"] },
      ]
    },
    {
      groupCode: "risk_safety",
      groupName: "Risk & Safety",
      features: [
        { code: "risk_assessments", name: "Risk Assessments", description: "Identify and assess workplace risks", routePath: "/hse/risk-assessments", icon: "ShieldAlert", tabCode: "risk_assessments", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Identify hazards", "Assess risk", "Define controls"], uiElements: ["Risk matrix", "Hazard list", "Control measures"] },
        { code: "safety_training", name: "Safety Training", description: "Manage safety training requirements", routePath: "/hse/safety-training", icon: "GraduationCap", tabCode: "safety_training", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Assign training", "Track completion", "Certify employee"], uiElements: ["Training list", "Completion tracker", "Certificate generator"] },
        { code: "safety_policies", name: "Safety Policies", description: "Manage safety policies and procedures", routePath: "/hse/policies", icon: "FileText", tabCode: "safety_policies", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create policy", "Publish", "Track acknowledgments"], uiElements: ["Policy editor", "Publish button", "Acknowledgment tracker"] },
      ]
    },
    {
      groupCode: "compliance",
      groupName: "Compliance",
      features: [
        { code: "compliance", name: "Compliance Management", description: "Track regulatory compliance", routePath: "/hse/compliance", icon: "CheckSquare", tabCode: "compliance", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Define requirements", "Audit compliance", "Report status"], uiElements: ["Requirement list", "Audit checklist", "Compliance dashboard"] },
        { code: "audits", name: "Safety Audits", description: "Conduct and track safety audits", routePath: "/hse/audits", icon: "ClipboardCheck", tabCode: "audits", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Schedule audit", "Conduct inspection", "Document findings"], uiElements: ["Audit calendar", "Checklist", "Findings report"] },
      ]
    },
    {
      groupCode: "analytics",
      groupName: "Analytics",
      features: [
        { code: "analytics", name: "HSE Analytics", description: "Safety metrics and analytics", routePath: "/hse/analytics", icon: "BarChart3", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View metrics", "Analyze trends", "Generate reports"], uiElements: ["KPI cards", "Trend charts", "Report builder"] },
      ]
    }
  ]
};

// ===== EMPLOYEE RELATIONS MODULE =====
const employeeRelationsModule: ModuleDefinition = {
  code: "employee_relations",
  name: "Employee Relations",
  description: "Manage employee relations, grievances, and workplace culture",
  icon: "Heart",
  routePath: "/employee-relations",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "case_management",
      groupName: "Case Management",
      features: [
        { code: "cases", name: "Case Management", description: "Track employee relations cases", routePath: "/employee-relations/cases", icon: "Briefcase", tabCode: "cases", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Open case", "Investigate", "Resolve"], uiElements: ["Case list", "Detail view", "Resolution form"] },
        { code: "grievances", name: "Grievances", description: "Handle employee grievances", routePath: "/employee-relations/grievances", icon: "MessageSquareWarning", tabCode: "grievances", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Receive grievance", "Review", "Take action"], uiElements: ["Grievance form", "Review panel", "Action tracker"] },
        { code: "disciplinary", name: "Disciplinary Actions", description: "Manage disciplinary processes", routePath: "/employee-relations/disciplinary", icon: "AlertOctagon", tabCode: "disciplinary", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Document issue", "Issue warning", "Track progress"], uiElements: ["Action form", "Warning letters", "History tracker"] },
      ]
    },
    {
      groupCode: "engagement",
      groupName: "Engagement",
      features: [
        { code: "recognition", name: "Recognition Programs", description: "Employee recognition and rewards", routePath: "/employee-relations/recognition", icon: "Award", tabCode: "recognition", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Nominate employee", "Approve recognition", "Award"], uiElements: ["Nomination form", "Approval workflow", "Award tracker"] },
        { code: "surveys", name: "Employee Surveys", description: "Conduct employee surveys", routePath: "/employee-relations/surveys", icon: "ClipboardList", tabCode: "surveys", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create survey", "Distribute", "Analyze results"], uiElements: ["Survey builder", "Distribution panel", "Results dashboard"] },
        { code: "wellness", name: "Wellness Programs", description: "Manage employee wellness initiatives", routePath: "/employee-relations/wellness", icon: "HeartHandshake", tabCode: "wellness", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create program", "Enroll employees", "Track participation"], uiElements: ["Program list", "Enrollment form", "Participation tracker"] },
      ]
    },
    {
      groupCode: "exit",
      groupName: "Exit Management",
      features: [
        { code: "exit_interviews", name: "Exit Interviews", description: "Conduct exit interviews", routePath: "/employee-relations/exit-interviews", icon: "LogOut", tabCode: "exit_interviews", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Schedule interview", "Conduct interview", "Document feedback"], uiElements: ["Interview scheduler", "Questionnaire", "Feedback form"] },
      ]
    },
    {
      groupCode: "analytics",
      groupName: "Analytics",
      features: [
        { code: "analytics", name: "ER Analytics", description: "Employee relations analytics", routePath: "/employee-relations/analytics", icon: "BarChart3", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View metrics", "Analyze trends", "Generate reports"], uiElements: ["KPI cards", "Charts", "Report export"] },
      ]
    }
  ]
};

// ===== COMPANY PROPERTY MODULE =====
const companyPropertyModule: ModuleDefinition = {
  code: "company_property",
  name: "Company Property",
  description: "Manage company assets and property assigned to employees",
  icon: "Package",
  routePath: "/company-property",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "asset_management",
      groupName: "Asset Management",
      features: [
        { code: "assets", name: "Asset Inventory", description: "Manage company asset inventory", routePath: "/company-property/assets", icon: "Box", tabCode: "assets", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Add asset", "Track status", "Update details"], uiElements: ["Asset table", "Detail form", "Status tracker"] },
        { code: "categories", name: "Asset Categories", description: "Define asset categories", routePath: "/company-property/categories", icon: "FolderTree", tabCode: "categories", roleRequirements: ["admin"], workflowSteps: ["Create category", "Set attributes", "Organize assets"], uiElements: ["Category list", "Attribute editor"] },
      ]
    },
    {
      groupCode: "assignment",
      groupName: "Assignment",
      features: [
        { code: "assignments", name: "Asset Assignments", description: "Assign assets to employees", routePath: "/company-property/assignments", icon: "UserCheck", tabCode: "assignments", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select asset", "Assign employee", "Document handover"], uiElements: ["Assignment form", "Handover document", "History log"] },
        { code: "returns", name: "Asset Returns", description: "Process asset returns", routePath: "/company-property/returns", icon: "RotateCcw", tabCode: "returns", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Initiate return", "Inspect condition", "Complete return"], uiElements: ["Return form", "Condition checklist", "Sign-off"] },
      ]
    },
    {
      groupCode: "maintenance",
      groupName: "Maintenance",
      features: [
        { code: "maintenance", name: "Maintenance Schedule", description: "Schedule asset maintenance", routePath: "/company-property/maintenance", icon: "Wrench", tabCode: "maintenance", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Schedule maintenance", "Track completion", "Update records"], uiElements: ["Maintenance calendar", "Work order form", "Completion tracker"] },
        { code: "depreciation", name: "Asset Depreciation", description: "Track asset depreciation", routePath: "/company-property/depreciation", icon: "TrendingDown", tabCode: "depreciation", roleRequirements: ["admin"], workflowSteps: ["Set depreciation method", "Calculate value", "Generate reports"], uiElements: ["Depreciation settings", "Value calculator", "Report generator"] },
      ]
    },
    {
      groupCode: "analytics",
      groupName: "Analytics",
      features: [
        { code: "analytics", name: "Property Analytics", description: "Asset analytics and reporting", routePath: "/company-property/analytics", icon: "BarChart3", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View metrics", "Analyze usage", "Generate reports"], uiElements: ["KPI cards", "Charts", "Report export"] },
      ]
    }
  ]
};

// ===== SUCCESSION PLANNING MODULE =====
const successionModule: ModuleDefinition = {
  code: "succession",
  name: "Succession Planning",
  description: "Identify and develop future leaders and critical role successors",
  icon: "TrendingUp",
  routePath: "/succession",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "talent_assessment",
      groupName: "Talent Assessment",
      features: [
        { code: "nine_box", name: "Nine Box Grid", description: "Assess talent using 9-box matrix", routePath: "/succession/nine-box", icon: "Grid3x3", tabCode: "nine_box", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Rate performance", "Assess potential", "Place in grid"], uiElements: ["9-box grid", "Employee placement", "Notes panel"] },
        { code: "talent_pools", name: "Talent Pools", description: "Manage high-potential talent pools", routePath: "/succession/talent-pools", icon: "Users", tabCode: "talent_pools", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create pool", "Add talent", "Track development"], uiElements: ["Pool list", "Talent cards", "Development tracker"] },
        { code: "flight_risk", name: "Flight Risk Tracking", description: "Identify and mitigate flight risks", routePath: "/succession/flight-risk", icon: "AlertTriangle", tabCode: "flight_risk", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Assess risk factors", "Score employees", "Plan retention"], uiElements: ["Risk dashboard", "Factor scores", "Retention plans"] },
      ]
    },
    {
      groupCode: "succession_plans",
      groupName: "Succession Plans",
      features: [
        { code: "plans", name: "Succession Plans", description: "Create and manage succession plans", routePath: "/succession/plans", icon: "GitBranch", tabCode: "plans", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Identify key positions", "Nominate successors", "Track readiness"], uiElements: ["Position list", "Successor cards", "Readiness tracker"] },
        { code: "key_positions", name: "Key Position Risk", description: "Assess key position risk", routePath: "/succession/key-positions", icon: "Star", tabCode: "key_positions", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Identify critical roles", "Assess risk", "Prioritize planning"], uiElements: ["Position matrix", "Risk scores", "Action items"] },
        { code: "bench_strength", name: "Bench Strength", description: "Analyze organizational bench strength", routePath: "/succession/bench-strength", icon: "BarChart3", tabCode: "bench_strength", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Analyze coverage", "Identify gaps", "Plan development"], uiElements: ["Coverage charts", "Gap analysis", "Action plans"] },
      ]
    },
    {
      groupCode: "development",
      groupName: "Development",
      features: [
        { code: "career_paths", name: "Career Paths", description: "Define career progression paths", routePath: "/succession/career-paths", icon: "Route", tabCode: "career_paths", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create path", "Define milestones", "Link to jobs"], uiElements: ["Path builder", "Milestone editor", "Job linker"] },
        { code: "idps", name: "Individual Development Plans", description: "Create employee development plans", routePath: "/succession/idps", icon: "Target", tabCode: "idps", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create IDP", "Set goals", "Track progress"], uiElements: ["IDP form", "Goal tracker", "Progress charts"] },
        { code: "mentorship", name: "Mentorship Programs", description: "Manage mentorship programs", routePath: "/succession/mentorship", icon: "Users", tabCode: "mentorship", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create program", "Match pairs", "Track sessions"], uiElements: ["Program list", "Matching tool", "Session tracker"] },
      ]
    },
    {
      groupCode: "analytics",
      groupName: "Analytics",
      features: [
        { code: "analytics", name: "Succession Analytics", description: "Succession planning analytics", routePath: "/succession/analytics", icon: "BarChart3", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View metrics", "Analyze pipeline", "Generate reports"], uiElements: ["KPI cards", "Pipeline charts", "Report export"] },
      ]
    }
  ]
};

// ===== HR HUB MODULE =====
const hrHubModule: ModuleDefinition = {
  code: "hr_hub",
  name: "HR Hub",
  description: "Central hub for HR operations and quick actions",
  icon: "LayoutDashboard",
  routePath: "/hr-hub",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "operations",
      groupName: "HR Operations",
      features: [
        { code: "dashboard", name: "HR Dashboard", description: "Central HR operations dashboard", routePath: "/hr-hub", icon: "LayoutDashboard", tabCode: "dashboard", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View overview", "Access quick actions", "Monitor metrics"], uiElements: ["KPI cards", "Quick action buttons", "Alerts panel"] },
        { code: "pending_actions", name: "Pending Actions", description: "View and process pending HR actions", routePath: "/hr-hub/pending-actions", icon: "Clock", tabCode: "pending_actions", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View pending", "Take action", "Track completion"], uiElements: ["Action list", "Action buttons", "Status tracker"] },
        { code: "reminders", name: "HR Reminders", description: "Manage HR reminders and notifications", routePath: "/hr-hub/reminders", icon: "Bell", tabCode: "reminders", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create reminder", "Set schedule", "Track delivery"], uiElements: ["Reminder list", "Schedule form", "Delivery log"] },
      ]
    },
    {
      groupCode: "employee_services",
      groupName: "Employee Services",
      features: [
        { code: "helpdesk", name: "HR Helpdesk", description: "Manage HR support tickets", routePath: "/hr-hub/helpdesk", icon: "LifeBuoy", tabCode: "helpdesk", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View tickets", "Respond", "Resolve"], uiElements: ["Ticket list", "Response form", "Resolution tracker"] },
        { code: "documents", name: "Document Requests", description: "Process employee document requests", routePath: "/hr-hub/documents", icon: "FileText", tabCode: "documents", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View requests", "Generate document", "Deliver"], uiElements: ["Request list", "Document generator", "Delivery tracker"] },
      ]
    },
    {
      groupCode: "compliance",
      groupName: "Compliance",
      features: [
        { code: "compliance_calendar", name: "Compliance Calendar", description: "Track compliance deadlines", routePath: "/hr-hub/compliance-calendar", icon: "Calendar", tabCode: "compliance_calendar", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View deadlines", "Set reminders", "Track completion"], uiElements: ["Calendar view", "Deadline list", "Reminder settings"] },
        { code: "reports", name: "HR Reports", description: "Generate HR compliance reports", routePath: "/hr-hub/reports", icon: "FileBarChart", tabCode: "reports", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select report", "Set parameters", "Generate"], uiElements: ["Report list", "Parameter form", "Export button"] },
      ]
    }
  ]
};

// ===== COMPENSATION MODULE =====
const compensationModule: ModuleDefinition = {
  code: "compensation",
  name: "Compensation",
  description: "Manage employee compensation, salary structures, and pay elements",
  icon: "DollarSign",
  routePath: "/compensation",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "salary_structure",
      groupName: "Salary Structure",
      features: [
        { code: "salary_grades", name: "Salary Grades", description: "Define salary grade structures", routePath: "/compensation/salary-grades", icon: "Layers", tabCode: "salary_grades", roleRequirements: ["admin"], workflowSteps: ["Create grade", "Set ranges", "Assign to jobs"], uiElements: ["Grade list", "Range editor", "Job assignment"] },
        { code: "pay_elements", name: "Pay Elements", description: "Configure pay element types", routePath: "/compensation/pay-elements", icon: "List", tabCode: "pay_elements", roleRequirements: ["admin"], workflowSteps: ["Create element", "Set calculation", "Configure rules"], uiElements: ["Element list", "Calculation form", "Rules editor"] },
        { code: "position_compensation", name: "Position Compensation", description: "Set compensation for positions", routePath: "/compensation/positions", icon: "Briefcase", tabCode: "position_compensation", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select position", "Set base", "Add elements"], uiElements: ["Position list", "Compensation form", "Element assignment"] },
      ]
    },
    {
      groupCode: "employee_compensation",
      groupName: "Employee Compensation",
      features: [
        { code: "employee_comp", name: "Employee Compensation", description: "Manage individual employee compensation", routePath: "/compensation/employees", icon: "User", tabCode: "employee_comp", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select employee", "Review current", "Make adjustments"], uiElements: ["Employee search", "Compensation summary", "Adjustment form"] },
        { code: "salary_reviews", name: "Salary Reviews", description: "Process salary review cycles", routePath: "/compensation/reviews", icon: "RefreshCw", tabCode: "salary_reviews", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create cycle", "Submit recommendations", "Approve changes"], uiElements: ["Cycle manager", "Recommendation form", "Approval workflow"] },
        { code: "comp_history", name: "Compensation History", description: "View compensation change history", routePath: "/compensation/history", icon: "History", tabCode: "comp_history", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select employee", "View history", "Export data"], uiElements: ["Employee selector", "History timeline", "Export button"] },
      ]
    },
    {
      groupCode: "planning",
      groupName: "Planning",
      features: [
        { code: "budgets", name: "Compensation Budgets", description: "Plan and track compensation budgets", routePath: "/compensation/budgets", icon: "PiggyBank", tabCode: "budgets", roleRequirements: ["admin"], workflowSteps: ["Create budget", "Allocate funds", "Track spending"], uiElements: ["Budget form", "Allocation matrix", "Spending tracker"] },
        { code: "modeling", name: "Compensation Modeling", description: "Model compensation scenarios", routePath: "/compensation/modeling", icon: "Calculator", tabCode: "modeling", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create scenario", "Adjust parameters", "Compare results"], uiElements: ["Scenario builder", "Parameter sliders", "Comparison charts"] },
      ]
    },
    {
      groupCode: "analytics",
      groupName: "Analytics",
      features: [
        { code: "analytics", name: "Compensation Analytics", description: "Analyze compensation data", routePath: "/compensation/analytics", icon: "BarChart3", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Select metrics", "Apply filters", "View insights"], uiElements: ["KPI cards", "Charts", "Benchmark data"] },
        { code: "equity_analysis", name: "Pay Equity Analysis", description: "Analyze pay equity across groups", routePath: "/compensation/equity", icon: "Scale", tabCode: "equity_analysis", roleRequirements: ["admin"], workflowSteps: ["Select groups", "Run analysis", "Review gaps"], uiElements: ["Group selector", "Gap analysis", "Action recommendations"] },
      ]
    }
  ]
};

// ===== BENEFITS MODULE =====
const benefitsModule: ModuleDefinition = {
  code: "benefits",
  name: "Benefits",
  description: "Manage employee benefits, enrollments, and plans",
  icon: "Gift",
  routePath: "/benefits",
  roleRequirements: ["admin", "hr_manager"],
  groups: [
    {
      groupCode: "plan_management",
      groupName: "Plan Management",
      features: [
        { code: "plans", name: "Benefit Plans", description: "Configure benefit plans", routePath: "/benefits/plans", icon: "FileText", tabCode: "plans", roleRequirements: ["admin"], workflowSteps: ["Create plan", "Set coverage", "Configure costs"], uiElements: ["Plan list", "Coverage editor", "Cost settings"] },
        { code: "categories", name: "Benefit Categories", description: "Manage benefit categories", routePath: "/benefits/categories", icon: "FolderTree", tabCode: "categories", roleRequirements: ["admin"], workflowSteps: ["Create category", "Add plans", "Set order"], uiElements: ["Category list", "Plan assignment", "Order controls"] },
        { code: "providers", name: "Benefit Providers", description: "Manage benefit providers", routePath: "/benefits/providers", icon: "Building", tabCode: "providers", roleRequirements: ["admin"], workflowSteps: ["Add provider", "Set contacts", "Link plans"], uiElements: ["Provider list", "Contact form", "Plan linker"] },
      ]
    },
    {
      groupCode: "enrollment",
      groupName: "Enrollment",
      features: [
        { code: "enrollment_periods", name: "Enrollment Periods", description: "Configure open enrollment periods", routePath: "/benefits/enrollment-periods", icon: "Calendar", tabCode: "enrollment_periods", roleRequirements: ["admin"], workflowSteps: ["Create period", "Set dates", "Configure rules"], uiElements: ["Period calendar", "Date picker", "Rules form"] },
        { code: "enrollments", name: "Employee Enrollments", description: "Manage employee benefit enrollments", routePath: "/benefits/enrollments", icon: "UserCheck", tabCode: "enrollments", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View enrollments", "Process changes", "Confirm coverage"], uiElements: ["Enrollment list", "Change form", "Confirmation panel"] },
        { code: "life_events", name: "Life Events", description: "Process qualifying life events", routePath: "/benefits/life-events", icon: "HeartHandshake", tabCode: "life_events", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Receive event", "Verify documentation", "Process changes"], uiElements: ["Event list", "Document uploader", "Change processor"] },
      ]
    },
    {
      groupCode: "claims",
      groupName: "Claims",
      features: [
        { code: "claims", name: "Benefit Claims", description: "Process benefit claims", routePath: "/benefits/claims", icon: "Receipt", tabCode: "claims", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Submit claim", "Review", "Process payment"], uiElements: ["Claim form", "Review panel", "Payment tracker"] },
        { code: "dependents", name: "Dependents", description: "Manage employee dependents", routePath: "/benefits/dependents", icon: "Users", tabCode: "dependents", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Add dependent", "Verify eligibility", "Enroll in plans"], uiElements: ["Dependent list", "Eligibility checker", "Enrollment form"] },
      ]
    },
    {
      groupCode: "analytics",
      groupName: "Analytics",
      features: [
        { code: "analytics", name: "Benefits Analytics", description: "Analyze benefits data and costs", routePath: "/benefits/analytics", icon: "BarChart3", tabCode: "analytics", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["View metrics", "Analyze utilization", "Generate reports"], uiElements: ["KPI cards", "Utilization charts", "Cost reports"] },
      ]
    }
  ]
};

// ===== DASHBOARD MODULE =====
const dashboardModule: ModuleDefinition = {
  code: "dashboard",
  name: "Dashboard",
  description: "Main application dashboard with overview and quick access",
  icon: "LayoutDashboard",
  routePath: "/dashboard",
  roleRequirements: ["admin", "hr_manager", "employee"],
  groups: [
    {
      groupCode: "overview",
      groupName: "Overview",
      features: [
        { code: "main", name: "Main Dashboard", description: "Central application dashboard", routePath: "/dashboard", icon: "LayoutDashboard", tabCode: "main", roleRequirements: ["admin", "hr_manager", "employee"], workflowSteps: ["View metrics", "Access modules", "Check notifications"], uiElements: ["KPI cards", "Module links", "Notification panel"] },
        { code: "quick_actions", name: "Quick Actions", description: "Frequently used actions", routePath: "/dashboard/quick-actions", icon: "Zap", tabCode: "quick_actions", roleRequirements: ["admin", "hr_manager", "employee"], workflowSteps: ["Select action", "Complete task", "View confirmation"], uiElements: ["Action buttons", "Task forms", "Confirmation messages"] },
      ]
    },
    {
      groupCode: "widgets",
      groupName: "Widgets",
      features: [
        { code: "announcements", name: "Announcements", description: "Company announcements and news", routePath: "/dashboard/announcements", icon: "Megaphone", tabCode: "announcements", roleRequirements: ["admin", "hr_manager", "employee"], workflowSteps: ["View announcements", "Read details", "Acknowledge"], uiElements: ["Announcement list", "Detail view", "Acknowledge button"] },
        { code: "calendar", name: "Calendar Widget", description: "Upcoming events and deadlines", routePath: "/dashboard/calendar", icon: "Calendar", tabCode: "calendar", roleRequirements: ["admin", "hr_manager", "employee"], workflowSteps: ["View calendar", "Click event", "View details"], uiElements: ["Calendar widget", "Event popover", "Detail panel"] },
        { code: "tasks", name: "My Tasks", description: "Personal task list", routePath: "/dashboard/tasks", icon: "CheckSquare", tabCode: "tasks", roleRequirements: ["admin", "hr_manager", "employee"], workflowSteps: ["View tasks", "Mark complete", "Add notes"], uiElements: ["Task list", "Checkbox", "Notes field"] },
      ]
    }
  ]
};

// ===== COMPLETE REGISTRY =====
export const FEATURE_REGISTRY: ModuleDefinition[] = [
  dashboardModule,
  workforceModule,
  leaveModule,
  compensationModule,
  payrollModule,
  timeAttendanceModule,
  benefitsModule,
  trainingModule,
  performanceModule,
  successionModule,
  recruitmentModule,
  hseModule,
  employeeRelationsModule,
  companyPropertyModule,
  hrHubModule,
  essModule,
  mssModule,
  adminModule,
];

// ===== UTILITY FUNCTIONS =====

export function getModuleByCode(code: string): ModuleDefinition | undefined {
  return FEATURE_REGISTRY.find(m => m.code === code);
}

export function getFeatureByCode(moduleCode: string, featureCode: string): FeatureDefinition | undefined {
  const module = getModuleByCode(moduleCode);
  if (!module) return undefined;
  
  for (const group of module.groups) {
    const feature = group.features.find(f => f.code === featureCode);
    if (feature) return feature;
  }
  return undefined;
}

export function getAllFeatures(): { module: ModuleDefinition; group: FeatureGroup; feature: FeatureDefinition }[] {
  const result: { module: ModuleDefinition; group: FeatureGroup; feature: FeatureDefinition }[] = [];
  
  FEATURE_REGISTRY.forEach(module => {
    module.groups.forEach(group => {
      group.features.forEach(feature => {
        result.push({ module, group, feature });
      });
    });
  });
  
  return result;
}

export function getModuleFeaturesFlat(moduleCode: string): FeatureDefinition[] {
  const module = getModuleByCode(moduleCode);
  if (!module) return [];
  
  return module.groups.flatMap(g => g.features);
}

export function getFeatureCount(moduleCode: string): number {
  const module = getModuleByCode(moduleCode);
  if (!module) return 0;
  
  return module.groups.reduce((sum, g) => sum + g.features.length, 0);
}

export function getTotalFeatureCount(): number {
  return FEATURE_REGISTRY.reduce((sum, m) => sum + getFeatureCount(m.code), 0);
}

export function searchFeatures(query: string): { module: ModuleDefinition; group: FeatureGroup; feature: FeatureDefinition }[] {
  const lowerQuery = query.toLowerCase();
  return getAllFeatures().filter(({ feature }) => 
    feature.name.toLowerCase().includes(lowerQuery) ||
    feature.description.toLowerCase().includes(lowerQuery) ||
    feature.code.toLowerCase().includes(lowerQuery)
  );
}
