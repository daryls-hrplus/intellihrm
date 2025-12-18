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
        { code: "departments", name: "Departments", description: "Manage organizational departments and sections", routePath: "/workforce/departments", icon: "FolderTree", tabCode: "departments", roleRequirements: ["admin", "hr_manager"], workflowSteps: ["Create department", "Add sections", "Assign manager"], uiElements: ["Department tree", "Section editor", "Manager selector"] },
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
      groupCode: "analytics_planning",
      groupName: "Analytics & Planning",
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

// ===== COMPLETE REGISTRY =====
export const FEATURE_REGISTRY: ModuleDefinition[] = [
  workforceModule,
  leaveModule,
  payrollModule,
  timeAttendanceModule,
  trainingModule,
  performanceModule,
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
