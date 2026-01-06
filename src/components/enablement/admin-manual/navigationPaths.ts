// Navigation paths for Admin & Security Manual sections
// Provides breadcrumb navigation for each section

export const ADMIN_SECURITY_NAVIGATION_PATHS: Record<string, string[]> = {
  // Part 1: Overview
  'admin-sec-1-1': ['Enablement', 'Admin & Security Manual', 'Module Overview'],
  'admin-sec-1-2': ['Enablement', 'Admin & Security Manual', 'Core Concepts'],
  'admin-sec-1-3': ['Enablement', 'Admin & Security Manual', 'System Architecture'],
  'admin-sec-1-4': ['Enablement', 'Admin & Security Manual', 'User Personas'],
  'admin-sec-1-5': ['Enablement', 'Admin & Security Manual', 'Security Calendar'],
  
  // Part 2: Foundation Setup
  'admin-sec-2-1': ['Admin', 'Organization & Structure', 'Prerequisites'],
  'admin-sec-2-2': ['Admin', 'Organization & Structure', 'Territories'],
  'admin-sec-2-3': ['Admin', 'Organization & Structure', 'Company Groups'],
  'admin-sec-2-4': ['Admin', 'Organization & Structure', 'Companies'],
  'admin-sec-2-5': ['Admin', 'Organization & Structure', 'Divisions'],
  'admin-sec-2-6': ['Admin', 'Organization & Structure', 'Departments'],
  'admin-sec-2-7': ['Admin', 'Organization & Structure', 'Sections'],
  'admin-sec-2-8': ['Admin', 'Organization & Structure', 'Branch Locations'],
  
  // Part 3: Users & Roles
  'admin-sec-3-1': ['Admin', 'Users, Roles & Access', 'Administrator Levels'],
  'admin-sec-3-2': ['Admin', 'Users, Roles & Access', 'Role Architecture'],
  'admin-sec-3-3': ['Admin', 'Users, Roles & Access', 'Creating Roles'],
  'admin-sec-3-4': ['Admin', 'Users, Roles & Access', 'Permission Groups'],
  'admin-sec-3-5': ['Admin', 'Users, Roles & Access', 'Granular Permissions'],
  'admin-sec-3-6': ['Admin', 'Users, Roles & Access', 'User Management'],
  'admin-sec-3-7': ['Admin', 'Users, Roles & Access', 'Access Requests'],
  'admin-sec-3-8': ['Admin', 'Users, Roles & Access', 'Auto-Approval'],
  
  // Part 4: Security
  'admin-sec-4-1': ['Admin', 'Security & Governance', 'Authentication'],
  'admin-sec-4-2': ['Admin', 'Security & Governance', 'MFA'],
  'admin-sec-4-3': ['Admin', 'Security & Governance', 'Password Policies'],
  'admin-sec-4-4': ['Admin', 'Security & Governance', 'Session Management'],
  'admin-sec-4-5': ['Admin', 'Security & Governance', 'Data Access Controls'],
  'admin-sec-4-6': ['Admin', 'Security & Governance', 'Audit Logging'],
  'admin-sec-4-7': ['Admin', 'Security & Governance', 'Security Monitoring'],
  
  // Part 5: System Configuration
  'admin-sec-5-1': ['Admin', 'System & Platform', 'System Settings'],
  'admin-sec-5-2': ['Admin', 'System & Platform', 'Lookup Values'],
  'admin-sec-5-3': ['Admin', 'System & Platform', 'Currencies'],
  'admin-sec-5-4': ['Admin', 'System & Platform', 'Custom Fields'],
  'admin-sec-5-5': ['Admin', 'System & Platform', 'Notifications'],
  'admin-sec-5-6': ['Admin', 'System & Platform', 'Dashboard Ordering'],
  
  // Part 6: AI Governance
  'admin-sec-6-1': ['Admin', 'AI Governance', 'AI System Settings'],
  'admin-sec-6-2': ['Admin', 'AI Governance', 'AI Guardrails'],
  'admin-sec-6-3': ['Admin', 'AI Governance', 'AI Budget'],
  'admin-sec-6-4': ['Admin', 'AI Governance', 'ISO 42001'],
  
  // Part 7: Compliance
  'admin-sec-7-1': ['Admin', 'Security & Governance', 'Regulatory Framework'],
  'admin-sec-7-2': ['Admin', 'Security & Governance', 'Audit Trail'],
  'admin-sec-7-3': ['Admin', 'Security & Governance', 'Access Certification'],
  'admin-sec-7-4': ['Admin', 'Security & Governance', 'Compliance Reporting'],
  
  // Part 8: Troubleshooting
  'admin-sec-8-1': ['Enablement', 'Admin & Security Manual', 'Troubleshooting', 'Configuration'],
  'admin-sec-8-2': ['Enablement', 'Admin & Security Manual', 'Troubleshooting', 'Access'],
  'admin-sec-8-3': ['Enablement', 'Admin & Security Manual', 'Troubleshooting', 'Performance'],
  'admin-sec-8-4': ['Enablement', 'Admin & Security Manual', 'Troubleshooting', 'Incidents']
};

// Related topics for cross-referencing
export const ADMIN_SECURITY_RELATED_TOPICS: Record<string, { sectionId: string; title: string }[]> = {
  'admin-sec-1-1': [
    { sectionId: 'admin-sec-1-2', title: 'Core Concepts & Terminology' },
    { sectionId: 'admin-sec-1-4', title: 'User Personas & Journeys' },
    { sectionId: 'admin-sec-2-1', title: 'Prerequisites Checklist' }
  ],
  'admin-sec-1-2': [
    { sectionId: 'admin-sec-3-1', title: 'Administrator Levels' },
    { sectionId: 'admin-sec-3-2', title: 'Role Architecture' },
    { sectionId: 'admin-sec-3-5', title: 'Granular Permissions (RBP)' }
  ],
  'admin-sec-1-3': [
    { sectionId: 'admin-sec-2-4', title: 'Companies Configuration' },
    { sectionId: 'admin-sec-4-1', title: 'Authentication Settings' },
    { sectionId: 'admin-sec-6-1', title: 'AI System Settings' }
  ],
  'admin-sec-2-1': [
    { sectionId: 'admin-sec-2-2', title: 'Territories Configuration' },
    { sectionId: 'admin-sec-2-4', title: 'Companies Configuration' },
    { sectionId: 'admin-sec-3-6', title: 'User Account Management' }
  ],
  'admin-sec-2-4': [
    { sectionId: 'admin-sec-2-6', title: 'Departments Configuration' },
    { sectionId: 'admin-sec-2-8', title: 'Branch Locations' },
    { sectionId: 'admin-sec-7-1', title: 'Regulatory Framework' }
  ],
  'admin-sec-3-1': [
    { sectionId: 'admin-sec-3-2', title: 'Role Architecture' },
    { sectionId: 'admin-sec-3-3', title: 'Creating and Managing Roles' },
    { sectionId: 'admin-sec-4-2', title: 'Multi-Factor Authentication' }
  ],
  'admin-sec-3-3': [
    { sectionId: 'admin-sec-3-5', title: 'Granular Permissions (RBP)' },
    { sectionId: 'admin-sec-3-6', title: 'User Account Management' },
    { sectionId: 'admin-sec-4-5', title: 'Data Access Controls' }
  ],
  'admin-sec-3-5': [
    { sectionId: 'admin-sec-3-3', title: 'Creating and Managing Roles' },
    { sectionId: 'admin-sec-4-5', title: 'Data Access Controls' },
    { sectionId: 'admin-sec-7-3', title: 'Access Certification' }
  ],
  'admin-sec-4-1': [
    { sectionId: 'admin-sec-4-2', title: 'Multi-Factor Authentication' },
    { sectionId: 'admin-sec-4-3', title: 'Password Policies' },
    { sectionId: 'admin-sec-4-4', title: 'Session Management' }
  ],
  'admin-sec-4-2': [
    { sectionId: 'admin-sec-4-1', title: 'Authentication Settings' },
    { sectionId: 'admin-sec-8-2', title: 'User Access Problems' },
    { sectionId: 'admin-sec-3-1', title: 'Administrator Levels' }
  ],
  'admin-sec-4-5': [
    { sectionId: 'admin-sec-3-5', title: 'Granular Permissions (RBP)' },
    { sectionId: 'admin-sec-4-6', title: 'Audit Logging' },
    { sectionId: 'admin-sec-7-1', title: 'Regulatory Framework' }
  ],
  'admin-sec-4-6': [
    { sectionId: 'admin-sec-4-7', title: 'Security Monitoring' },
    { sectionId: 'admin-sec-7-2', title: 'Audit Trail Management' },
    { sectionId: 'admin-sec-7-4', title: 'Compliance Reporting' }
  ],
  'admin-sec-6-1': [
    { sectionId: 'admin-sec-6-2', title: 'AI Guardrails Configuration' },
    { sectionId: 'admin-sec-6-3', title: 'AI Budget Management' },
    { sectionId: 'admin-sec-6-4', title: 'ISO 42001 Compliance' }
  ],
  'admin-sec-6-2': [
    { sectionId: 'admin-sec-6-1', title: 'AI System Settings' },
    { sectionId: 'admin-sec-6-4', title: 'ISO 42001 Compliance' },
    { sectionId: 'admin-sec-4-5', title: 'Data Access Controls' }
  ],
  'admin-sec-7-1': [
    { sectionId: 'admin-sec-4-5', title: 'Data Access Controls' },
    { sectionId: 'admin-sec-7-2', title: 'Audit Trail Management' },
    { sectionId: 'admin-sec-7-4', title: 'Compliance Reporting' }
  ],
  'admin-sec-7-3': [
    { sectionId: 'admin-sec-3-5', title: 'Granular Permissions (RBP)' },
    { sectionId: 'admin-sec-4-6', title: 'Audit Logging' },
    { sectionId: 'admin-sec-7-4', title: 'Compliance Reporting' }
  ],
  'admin-sec-8-1': [
    { sectionId: 'admin-sec-2-1', title: 'Prerequisites Checklist' },
    { sectionId: 'admin-sec-2-6', title: 'Departments Configuration' },
    { sectionId: 'admin-sec-3-3', title: 'Creating and Managing Roles' }
  ],
  'admin-sec-8-2': [
    { sectionId: 'admin-sec-4-1', title: 'Authentication Settings' },
    { sectionId: 'admin-sec-4-2', title: 'Multi-Factor Authentication' },
    { sectionId: 'admin-sec-3-6', title: 'User Account Management' }
  ],
  'admin-sec-8-4': [
    { sectionId: 'admin-sec-4-6', title: 'Audit Logging' },
    { sectionId: 'admin-sec-4-7', title: 'Security Monitoring' },
    { sectionId: 'admin-sec-7-2', title: 'Audit Trail Management' }
  ]
};
