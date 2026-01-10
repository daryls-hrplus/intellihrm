// Navigation paths and cross-module references for Time and Attendance Manual

export const TIME_ATTENDANCE_NAVIGATION_PATHS: Record<string, string[]> = {
  'ta-part-1': ['Time & Attendance', 'Overview'],
  'ta-part-2': ['Time & Attendance', 'Foundation Setup'],
  'ta-part-3': ['Time & Attendance', 'Shift Management'],
  'ta-part-4': ['Time & Attendance', 'Daily Operations'],
  'ta-part-5': ['Time & Attendance', 'Advanced Scheduling'],
  'ta-part-6': ['Time & Attendance', 'Project Time'],
  'ta-part-7': ['Time & Attendance', 'Compliance'],
  'ta-part-8': ['Time & Attendance', 'Analytics'],
  'ta-part-9': ['Time & Attendance', 'ESS/MSS'],
  'ta-part-10': ['Time & Attendance', 'Troubleshooting'],
};

export const TIME_ATTENDANCE_RELATED_TOPICS: Record<string, { sectionId: string; title: string; module?: string; manualPath?: string }[]> = {
  'ta-sec-2-1': [
    { sectionId: 'wf-sec-2-8', title: 'Branch Locations', module: 'Workforce', manualPath: '/enablement/manuals/workforce' },
    { sectionId: 'wf-sec-4-1', title: 'Employee Records', module: 'Workforce', manualPath: '/enablement/manuals/workforce' },
  ],
  'ta-sec-3-5': [
    { sectionId: 'wf-sec-4-4', title: 'Employment Assignments', module: 'Workforce', manualPath: '/enablement/manuals/workforce' },
  ],
  'ta-sec-6-4': [
    { sectionId: 'payroll-rates', title: 'Payroll Rate Configuration', module: 'Payroll', manualPath: '/enablement/manuals/payroll' },
  ],
  'ta-sec-7-4': [
    { sectionId: 'compliance-labor', title: 'Labor Law Compliance', module: 'Admin & Security', manualPath: '/enablement/manuals/admin-security' },
  ],
};

// Cross-module references to Payroll and Workforce
export const TIME_ATTENDANCE_PAYROLL_REFERENCES: Record<string, { 
  type: 'data_flow' | 'dependency' | 'integration'; 
  payrollSection: string; 
  title: string; 
  description: string 
}> = {
  'ta-sec-3-8': {
    type: 'data_flow',
    payrollSection: 'payroll-earnings',
    title: 'Payment Rules → Payroll Earnings',
    description: 'Time payment rules flow to payroll as earning types for gross pay calculation.'
  },
  'ta-sec-6-6': {
    type: 'data_flow',
    payrollSection: 'payroll-timesheet',
    title: 'Approved Timesheets → Payroll Processing',
    description: 'Approved project timesheets are transmitted to payroll for payment processing.'
  },
  'ta-sec-7-2': {
    type: 'dependency',
    payrollSection: 'payroll-overtime',
    title: 'Overtime Rules → Payroll OT Calculation',
    description: 'Overtime configuration must align with payroll overtime pay calculations.'
  },
};

export const TIME_ATTENDANCE_WORKFORCE_REFERENCES: Record<string, { 
  type: 'dependency' | 'integration' | 'data_source'; 
  workforceSection: string; 
  title: string; 
  description: string 
}> = {
  'ta-sec-2-4': {
    type: 'dependency',
    workforceSection: 'wf-sec-2-8',
    title: 'Geofencing ← Branch Locations',
    description: 'Geofence boundaries are defined based on branch location coordinates from Workforce.'
  },
  'ta-sec-3-5': {
    type: 'data_source',
    workforceSection: 'wf-sec-4-4',
    title: 'Shift Assignments ← Employee Assignments',
    description: 'Employees available for shift assignment are determined by active employment assignments.'
  },
  'ta-sec-5-4': {
    type: 'integration',
    workforceSection: 'wf-sec-2-6',
    title: 'Coverage Requirements ← Department Structure',
    description: 'Minimum staffing levels are configured per department defined in Workforce.'
  },
};
