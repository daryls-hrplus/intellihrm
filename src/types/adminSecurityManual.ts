// Admin & Security Administrator Manual Types
// Enterprise-grade documentation structure following SAP/Workday/Oracle HCM standards

import { ManualSection, IndustryContext } from './adminManual';

// Admin & Security specific interfaces
export interface AdminContainerDefinition {
  code: string;
  label: string;
  description: string;
  category: 'foundation' | 'access' | 'security' | 'system' | 'ai';
}

export interface SecurityDomain {
  code: string;
  label: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface AdminRoleLevel {
  level: number;
  name: string;
  description: string;
  capabilities: string[];
  restrictions: string[];
}

// Admin & Security Manual Structure - 8 Parts
export const ADMIN_SECURITY_MANUAL_STRUCTURE: ManualSection[] = [
  // Part 1: Module Overview & Conceptual Foundation
  {
    id: 'admin-part-1',
    sectionNumber: '1',
    title: 'Module Overview & Conceptual Foundation',
    description: 'Introduction to Admin & Security, core concepts, and system architecture',
    contentLevel: 'overview',
    estimatedReadTime: 35,
    targetRoles: ['All'],
    subsections: [
      {
        id: 'admin-sec-1-1',
        sectionNumber: '1.1',
        title: 'Introduction to Admin & Security in Intelli HRM',
        description: 'Executive summary, business value, and key differentiators',
        contentLevel: 'overview',
        estimatedReadTime: 10,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Enterprise HRMS administration standards (SAP SuccessFactors, Workday)'
        }
      },
      {
        id: 'admin-sec-1-2',
        sectionNumber: '1.2',
        title: 'Core Concepts & Terminology',
        description: 'Administrator hierarchy, permission model, security domains, and key definitions',
        contentLevel: 'concept',
        estimatedReadTime: 15,
        targetRoles: ['Super Admin', 'Security Admin', 'HR Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial onboarding',
          benchmark: 'Role-Based Permissions (RBP) as industry standard'
        }
      },
      {
        id: 'admin-sec-1-3',
        sectionNumber: '1.3',
        title: 'System Architecture',
        description: 'Data model, multi-tenancy design, security boundaries, and integration points',
        contentLevel: 'reference',
        estimatedReadTime: 20,
        targetRoles: ['Super Admin', 'Consultant'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Implementation phase',
          benchmark: 'Enterprise multi-tenant architecture standards'
        }
      },
      {
        id: 'admin-sec-1-4',
        sectionNumber: '1.4',
        title: 'User Personas & Journeys',
        description: 'Super Admin, Security Admin, HR Admin, and Implementation Consultant workflows',
        contentLevel: 'overview',
        estimatedReadTime: 10,
        targetRoles: ['All'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Training sessions',
          benchmark: 'Industry-standard admin persona definitions'
        }
      },
      {
        id: 'admin-sec-1-5',
        sectionNumber: '1.5',
        title: 'Security Compliance Calendar',
        description: 'Annual security review cycle, quarterly certifications, and monthly audit checks',
        contentLevel: 'overview',
        estimatedReadTime: 10,
        targetRoles: ['Security Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Continuous (annual/quarterly/monthly)',
          timing: 'Throughout the year',
          benchmark: 'SOC 2 Type II, ISO 27001 compliance cycles',
          compliance: ['GDPR', 'SOC 2', 'ISO 27001', 'Regional data protection']
        }
      }
    ]
  },
  
  // Part 2: Foundation Setup (Organization Hierarchy)
  {
    id: 'admin-part-2',
    sectionNumber: '2',
    title: 'Foundation Setup',
    description: 'Complete organization hierarchy configuration from territories to sections',
    contentLevel: 'procedure',
    estimatedReadTime: 75,
    targetRoles: ['Super Admin', 'HR Admin', 'Consultant'],
    subsections: [
      {
        id: 'admin-sec-2-1',
        sectionNumber: '2.1',
        title: 'Prerequisites Checklist',
        description: 'Dependencies, data requirements, and pre-setup validation',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Super Admin', 'Consultant'],
        industryContext: {
          frequency: 'One-time during implementation',
          timing: '4-6 weeks before go-live',
          benchmark: 'Enterprise implementation methodology (SAP Activate, Workday Deploy)'
        }
      },
      {
        id: 'admin-sec-2-2',
        sectionNumber: '2.2',
        title: 'Territories Configuration',
        description: 'Geographic regions for grouping companies and compliance boundaries',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'One-time setup, annual review',
          timing: 'Pre-implementation',
          benchmark: 'Multi-country enterprise structures'
        }
      },
      {
        id: 'admin-sec-2-3',
        sectionNumber: '2.3',
        title: 'Company Groups Configuration',
        description: 'Holding company structures and group-level inheritance',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'One-time setup, M&A updates',
          timing: 'Pre-implementation',
          benchmark: 'Consolidated reporting structures'
        }
      },
      {
        id: 'admin-sec-2-4',
        sectionNumber: '2.4',
        title: 'Companies Configuration',
        description: 'Individual legal entity setup with country-specific requirements',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Super Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Per legal entity, annual validation',
          timing: 'Pre-implementation',
          benchmark: 'Legal entity compliance (Caribbean, Africa, Global)',
          compliance: ['Tax registration', 'Labor board registration', 'Data residency']
        }
      },
      {
        id: 'admin-sec-2-5',
        sectionNumber: '2.5',
        title: 'Divisions Configuration',
        description: 'Optional organizational layer for large enterprises',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Super Admin', 'HR Admin'],
        industryContext: {
          frequency: 'As needed for complex structures',
          timing: 'Post company setup',
          benchmark: 'Optional layer for 500+ employee companies'
        }
      },
      {
        id: 'admin-sec-2-6',
        sectionNumber: '2.6',
        title: 'Departments Configuration',
        description: 'Mandatory business unit setup with cost center linking',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Super Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Initial setup, ongoing maintenance',
          timing: 'Post company setup',
          benchmark: 'Aligns with GL cost center structure'
        }
      },
      {
        id: 'admin-sec-2-7',
        sectionNumber: '2.7',
        title: 'Sections Configuration',
        description: 'Sub-department groupings and team-level organization',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Super Admin', 'HR Admin'],
        industryContext: {
          frequency: 'As needed for complex departments',
          timing: 'Post department setup',
          benchmark: 'Optional sub-unit for large departments'
        }
      },
      {
        id: 'admin-sec-2-8',
        sectionNumber: '2.8',
        title: 'Branch Locations Configuration',
        description: 'Physical office setup with geofencing and time zones',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Super Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Per location, ongoing updates',
          timing: 'Post company setup',
          benchmark: 'Address standardization, GPS coordinates for mobile attendance'
        }
      }
    ]
  },
  
  // Part 3: Users & Roles Configuration
  {
    id: 'admin-part-3',
    sectionNumber: '3',
    title: 'Users & Roles Configuration',
    description: 'Complete guide to role architecture, permissions, and user management',
    contentLevel: 'procedure',
    estimatedReadTime: 95,
    targetRoles: ['Super Admin', 'Security Admin', 'HR Admin'],
    subsections: [
      {
        id: 'admin-sec-3-1',
        sectionNumber: '3.1',
        title: 'Administrator Levels',
        description: 'Super Admin, Security Admin, Module Admin, and HR User capabilities',
        contentLevel: 'concept',
        estimatedReadTime: 12,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'Reference material',
          timing: 'Initial training',
          benchmark: 'Principle of least privilege, segregation of duties'
        }
      },
      {
        id: 'admin-sec-3-2',
        sectionNumber: '3.2',
        title: 'Role Architecture',
        description: 'Role types (System, Seeded, Custom), inheritance, and tenant visibility',
        contentLevel: 'concept',
        estimatedReadTime: 15,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'Reference material, annual review',
          timing: 'Initial setup',
          benchmark: 'SAP RBP model, Workday Security Groups'
        }
      },
      {
        id: 'admin-sec-3-3',
        sectionNumber: '3.3',
        title: 'Creating and Managing Roles',
        description: 'Step-by-step role creation with menu, PII, and container permissions',
        contentLevel: 'procedure',
        estimatedReadTime: 20,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'As needed, quarterly review',
          timing: 'Post foundation setup',
          benchmark: 'Role lifecycle: Create → Assign → Monitor → Deprecate'
        }
      },
      {
        id: 'admin-sec-3-4',
        sectionNumber: '3.4',
        title: 'Permission Groups Configuration',
        description: 'Grouping users for bulk permission assignment',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Post role setup',
          benchmark: 'Dynamic vs static group membership'
        }
      },
      {
        id: 'admin-sec-3-5',
        sectionNumber: '3.5',
        title: 'Granular Permissions (RBP)',
        description: 'Module, tab, action, and field-level access controls',
        contentLevel: 'procedure',
        estimatedReadTime: 18,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'Per role, quarterly audit',
          timing: 'Role configuration',
          benchmark: 'CRUD permissions at entity level (View/Create/Edit/Delete)'
        }
      },
      {
        id: 'admin-sec-3-6',
        sectionNumber: '3.6',
        title: 'User Account Management',
        description: 'Creating users, provisioning, and account lifecycle',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['HR Admin', 'Security Admin'],
        industryContext: {
          frequency: 'Ongoing (new hires, changes, terminations)',
          timing: 'Post role setup',
          benchmark: 'Joiner-Mover-Leaver processes'
        }
      },
      {
        id: 'admin-sec-3-7',
        sectionNumber: '3.7',
        title: 'Access Request Workflow',
        description: 'Self-service access requests with approval routing',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['HR Admin', 'Security Admin'],
        industryContext: {
          frequency: 'Per request',
          timing: 'Ongoing operations',
          benchmark: 'ITIL access management process'
        }
      },
      {
        id: 'admin-sec-3-8',
        sectionNumber: '3.8',
        title: 'Auto-Approval Rules',
        description: 'Configuring automated approval for routine access requests',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Security Admin'],
        industryContext: {
          frequency: 'Initial setup, periodic review',
          timing: 'Post access request setup',
          benchmark: 'Risk-based auto-approval with audit trail'
        }
      }
    ]
  },
  
  // Part 4: Security Configuration
  {
    id: 'admin-part-4',
    sectionNumber: '4',
    title: 'Security Configuration',
    description: 'Authentication, MFA, password policies, and security monitoring',
    contentLevel: 'procedure',
    estimatedReadTime: 80,
    targetRoles: ['Super Admin', 'Security Admin'],
    subsections: [
      {
        id: 'admin-sec-4-1',
        sectionNumber: '4.1',
        title: 'Authentication Settings',
        description: 'SSO configuration with SAML 2.0 and OAuth 2.0',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'One-time setup, certificate renewal',
          timing: 'Pre-go-live',
          benchmark: 'SAML 2.0, OAuth 2.0, OIDC standards',
          compliance: ['SSO certificate rotation every 1-3 years']
        }
      },
      {
        id: 'admin-sec-4-2',
        sectionNumber: '4.2',
        title: 'Multi-Factor Authentication (MFA)',
        description: 'MFA policy configuration and enforcement rules',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'One-time setup, policy updates',
          timing: 'Pre-go-live or security upgrade',
          benchmark: 'TOTP-based MFA, hardware key support',
          compliance: ['SOC 2 requirement', 'GDPR recommended']
        }
      },
      {
        id: 'admin-sec-4-3',
        sectionNumber: '4.3',
        title: 'Password Policies',
        description: 'Complexity, history, expiry, and lockout configuration',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'One-time setup, annual review',
          timing: 'Pre-go-live',
          benchmark: 'NIST 800-63B guidelines, 12+ character minimum'
        }
      },
      {
        id: 'admin-sec-4-4',
        sectionNumber: '4.4',
        title: 'Session Management',
        description: 'Session timeout, concurrent session policies, and forced logout',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Security Admin'],
        industryContext: {
          frequency: 'Initial setup, policy updates',
          timing: 'Pre-go-live',
          benchmark: '15-30 minute idle timeout for sensitive systems'
        }
      },
      {
        id: 'admin-sec-4-5',
        sectionNumber: '4.5',
        title: 'Data Access Controls',
        description: 'PII viewing permissions, masking rules, and export restrictions',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'Role-based configuration',
          timing: 'Post role setup',
          benchmark: 'Data classification: Public, Internal, Confidential, Restricted',
          compliance: ['GDPR Article 25', 'Data minimization principle']
        }
      },
      {
        id: 'admin-sec-4-6',
        sectionNumber: '4.6',
        title: 'Audit Logging Configuration',
        description: 'Event categories, retention policies, and alert thresholds',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'Initial setup, periodic review',
          timing: 'Pre-go-live',
          benchmark: '90-day minimum retention, 7-year for regulated industries',
          compliance: ['SOC 2 logging requirements', 'GDPR access logs']
        }
      },
      {
        id: 'admin-sec-4-7',
        sectionNumber: '4.7',
        title: 'Security Monitoring Dashboard',
        description: 'Real-time metrics, failed login tracking, and compliance indicators',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Security Admin'],
        industryContext: {
          frequency: 'Daily/weekly monitoring',
          timing: 'Post-go-live operations',
          benchmark: 'Security KPIs: Failed logins, permission changes, suspicious activity'
        }
      }
    ]
  },
  
  // Part 5: System Configuration
  {
    id: 'admin-part-5',
    sectionNumber: '5',
    title: 'System Configuration',
    description: 'System settings, lookup values, currencies, and custom fields',
    contentLevel: 'procedure',
    estimatedReadTime: 50,
    targetRoles: ['Super Admin', 'HR Admin'],
    subsections: [
      {
        id: 'admin-sec-5-1',
        sectionNumber: '5.1',
        title: 'System Settings',
        description: 'Branding, notifications, language defaults, and date formats',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'Initial setup, rebranding events',
          timing: 'Pre-go-live',
          benchmark: 'White-label customization options'
        }
      },
      {
        id: 'admin-sec-5-2',
        sectionNumber: '5.2',
        title: 'Lookup Values Configuration',
        description: 'Status types, reason codes, and custom dropdown values',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Super Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Initial setup, ongoing maintenance',
          timing: 'Pre-go-live and as needed',
          benchmark: 'Consistent value lists across modules'
        }
      },
      {
        id: 'admin-sec-5-3',
        sectionNumber: '5.3',
        title: 'Currency Management',
        description: 'Base currency, multi-currency enablement, and exchange rates',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'Initial setup, rate updates',
          timing: 'Pre-go-live for multi-currency orgs',
          benchmark: 'ISO 4217 currency codes, monthly rate updates'
        }
      },
      {
        id: 'admin-sec-5-4',
        sectionNumber: '5.4',
        title: 'Custom Fields Configuration',
        description: 'Extending entities with organization-specific fields',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Super Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed for customization',
          timing: 'Implementation or enhancement projects',
          benchmark: 'Maintain upgrade path, avoid over-customization'
        }
      },
      {
        id: 'admin-sec-5-5',
        sectionNumber: '5.5',
        title: 'Notification Templates',
        description: 'Email and in-app notification configuration',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Super Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Initial setup, ongoing updates',
          timing: 'Pre-go-live',
          benchmark: 'Role-based notification preferences'
        }
      },
      {
        id: 'admin-sec-5-6',
        sectionNumber: '5.6',
        title: 'Dashboard Module Ordering',
        description: 'Module visibility and card layout by role',
        contentLevel: 'procedure',
        estimatedReadTime: 8,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'Initial setup, role updates',
          timing: 'Post module configuration',
          benchmark: 'Role-based progressive disclosure'
        }
      }
    ]
  },
  
  // Part 6: AI Governance & Compliance
  {
    id: 'admin-part-6',
    sectionNumber: '6',
    title: 'AI Governance & Compliance',
    description: 'AI system settings, guardrails, budget management, and ISO 42001',
    contentLevel: 'procedure',
    estimatedReadTime: 50,
    targetRoles: ['Super Admin', 'Security Admin'],
    subsections: [
      {
        id: 'admin-sec-6-1',
        sectionNumber: '6.1',
        title: 'AI System Settings',
        description: 'AI enablement, allowed models, and token limits',
        contentLevel: 'procedure',
        estimatedReadTime: 12,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'Initial setup, model updates',
          timing: 'AI feature activation',
          benchmark: 'Responsible AI deployment principles'
        }
      },
      {
        id: 'admin-sec-6-2',
        sectionNumber: '6.2',
        title: 'AI Guardrails Configuration',
        description: 'Role security, policy compliance, PII protection, and escalation',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'Initial setup, periodic review',
          timing: 'Pre-AI deployment',
          benchmark: 'AI safety and ethics guidelines',
          compliance: ['ISO 42001', 'EU AI Act considerations']
        }
      },
      {
        id: 'admin-sec-6-3',
        sectionNumber: '6.3',
        title: 'AI Budget Management',
        description: 'Budget tiers, user assignments, and usage tracking',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Super Admin'],
        industryContext: {
          frequency: 'Monthly review, quarterly adjustments',
          timing: 'Post-AI enablement',
          benchmark: 'Cost allocation by role tier'
        }
      },
      {
        id: 'admin-sec-6-4',
        sectionNumber: '6.4',
        title: 'ISO 42001 Compliance',
        description: 'AI risk assessment, bias detection, model governance, and audit documentation',
        contentLevel: 'procedure',
        estimatedReadTime: 15,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'Continuous monitoring, annual certification',
          timing: 'Ongoing compliance',
          benchmark: 'ISO/IEC 42001 AI Management System',
          compliance: ['ISO 42001', 'AI transparency requirements']
        }
      }
    ]
  },
  
  // Part 7: Compliance & Audit
  {
    id: 'admin-part-7',
    sectionNumber: '7',
    title: 'Compliance & Audit',
    description: 'Regulatory framework, audit trail management, access certification, and reporting',
    contentLevel: 'procedure',
    estimatedReadTime: 35,
    targetRoles: ['Super Admin', 'Security Admin', 'HR Admin'],
    subsections: [
      {
        id: 'admin-sec-7-1',
        sectionNumber: '7.1',
        title: 'Regulatory Framework',
        description: 'GDPR, Caribbean data protection, Africa data residency, industry requirements',
        contentLevel: 'reference',
        estimatedReadTime: 12,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'Reference material, regulatory updates',
          timing: 'Compliance planning',
          benchmark: 'Regional labor law compliance',
          compliance: ['GDPR', 'Jamaica DPA', 'Ghana DPA', 'Nigeria NDPR']
        }
      },
      {
        id: 'admin-sec-7-2',
        sectionNumber: '7.2',
        title: 'Audit Trail Management',
        description: 'Event types, retention, investigation procedures, and legal holds',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Security Admin'],
        industryContext: {
          frequency: 'Ongoing operations',
          timing: 'Post-go-live',
          benchmark: 'Immutable audit logs with chain of custody'
        }
      },
      {
        id: 'admin-sec-7-3',
        sectionNumber: '7.3',
        title: 'Access Certification',
        description: 'Periodic access reviews, manager certification, and remediation',
        contentLevel: 'procedure',
        estimatedReadTime: 10,
        targetRoles: ['Security Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Quarterly for high-risk, annual for standard',
          timing: 'Scheduled review cycles',
          benchmark: 'User access review (UAR) best practices'
        }
      },
      {
        id: 'admin-sec-7-4',
        sectionNumber: '7.4',
        title: 'Compliance Reporting',
        description: 'SOC 2, ISO 27001 alignment, audit readiness dashboards',
        contentLevel: 'reference',
        estimatedReadTime: 8,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'Annual certification, ongoing monitoring',
          timing: 'Audit preparation',
          benchmark: 'SOC 2 Type II controls, ISO 27001 ISMS'
        }
      }
    ]
  },
  
  // Part 8: Troubleshooting & FAQs
  {
    id: 'admin-part-8',
    sectionNumber: '8',
    title: 'Troubleshooting & FAQs',
    description: 'Common issues, resolution steps, and frequently asked questions',
    contentLevel: 'troubleshooting',
    estimatedReadTime: 25,
    targetRoles: ['All'],
    subsections: [
      {
        id: 'admin-sec-8-1',
        sectionNumber: '8.1',
        title: 'Common Configuration Issues',
        description: 'Organization hierarchy, role assignment, and permission inheritance problems',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 8,
        targetRoles: ['Super Admin', 'HR Admin'],
        industryContext: {
          frequency: 'As needed',
          timing: 'During setup or support',
          benchmark: 'Root cause analysis methodology'
        }
      },
      {
        id: 'admin-sec-8-2',
        sectionNumber: '8.2',
        title: 'User Access Problems',
        description: 'Login failures, MFA issues, permission denied errors',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 8,
        targetRoles: ['Security Admin', 'HR Admin'],
        industryContext: {
          frequency: 'Ongoing support',
          timing: 'User reported issues',
          benchmark: 'Tiered support escalation'
        }
      },
      {
        id: 'admin-sec-8-3',
        sectionNumber: '8.3',
        title: 'Performance Optimization',
        description: 'Large organization handling, permission calculation, dashboard performance',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 6,
        targetRoles: ['Super Admin', 'Consultant'],
        industryContext: {
          frequency: 'As needed',
          timing: 'Performance issues',
          benchmark: 'Sub-second response time targets'
        }
      },
      {
        id: 'admin-sec-8-4',
        sectionNumber: '8.4',
        title: 'Security Incident Response',
        description: 'Breach procedures, account compromise, emergency access',
        contentLevel: 'troubleshooting',
        estimatedReadTime: 8,
        targetRoles: ['Super Admin', 'Security Admin'],
        industryContext: {
          frequency: 'As needed (hopefully never)',
          timing: 'Security incidents',
          benchmark: 'NIST Incident Response framework',
          compliance: ['72-hour GDPR breach notification']
        }
      }
    ]
  }
];

// Quick Reference Cards for Admin & Security
export const ADMIN_SECURITY_QUICK_REFERENCE_CARDS = [
  {
    id: 'qr-admin-levels',
    title: 'Administrator Levels',
    category: 'access',
    content: [
      { label: 'Super Admin', description: 'Full system access, emergency break-glass, compliance oversight' },
      { label: 'Security Admin', description: 'Role management, access audits, MFA configuration' },
      { label: 'HR Admin', description: 'User management, day-to-day operations, reporting' },
      { label: 'Module Admin', description: 'Specific module configuration within assigned scope' }
    ]
  },
  {
    id: 'qr-permission-matrix',
    title: 'Permission Matrix',
    category: 'access',
    content: [
      { label: 'View', description: 'Read-only access to data and configurations' },
      { label: 'Create', description: 'Ability to add new records' },
      { label: 'Edit', description: 'Modify existing records within scope' },
      { label: 'Delete', description: 'Remove records (often restricted)' },
      { label: 'Configure', description: 'Change system settings and rules' },
      { label: 'Approve', description: 'Authorize changes or requests' }
    ]
  },
  {
    id: 'qr-security-checklist',
    title: 'Security Checklist',
    category: 'security',
    content: [
      { label: 'MFA Enabled', description: 'Multi-factor authentication active for all admins' },
      { label: 'Password Policy', description: '12+ chars, complexity, 90-day rotation' },
      { label: 'SSO Configured', description: 'Single sign-on with corporate IdP' },
      { label: 'Audit Logging', description: 'All critical actions logged and retained' },
      { label: 'Access Reviews', description: 'Quarterly certification completed' }
    ]
  },
  {
    id: 'qr-pii-levels',
    title: 'PII Access Levels',
    category: 'security',
    content: [
      { label: 'None', description: 'No access to personally identifiable information' },
      { label: 'Masked', description: 'See partial data only (last 4 digits, etc.)' },
      { label: 'Limited', description: 'Access to name, email, job info only' },
      { label: 'Full', description: 'Complete PII access (requires justification)' }
    ]
  },
  {
    id: 'qr-org-hierarchy',
    title: 'Organization Hierarchy',
    category: 'foundation',
    content: [
      { label: 'Territory', description: 'Geographic regions (e.g., Caribbean, West Africa)' },
      { label: 'Company Group', description: 'Holding company for multiple entities' },
      { label: 'Company', description: 'Individual legal entity' },
      { label: 'Division', description: 'Optional large organizational unit' },
      { label: 'Department', description: 'Mandatory business unit' },
      { label: 'Section', description: 'Optional sub-department grouping' }
    ]
  },
  {
    id: 'qr-troubleshooting',
    title: 'Troubleshooting Decision Tree',
    category: 'support',
    content: [
      { label: 'Cannot Login', description: 'Check: Password → MFA → Account Status → SSO' },
      { label: 'Permission Denied', description: 'Check: Role Assignment → Granular Permissions → Cache' },
      { label: 'Missing Data', description: 'Check: Company Filter → Role Scope → Data Load' },
      { label: 'Slow Performance', description: 'Check: User Count → Permission Complexity → Browser' }
    ]
  }
];

// Security domains for reference
export const SECURITY_DOMAINS: SecurityDomain[] = [
  { code: 'authentication', label: 'Authentication', description: 'Login methods, SSO, MFA', riskLevel: 'critical' },
  { code: 'authorization', label: 'Authorization', description: 'Permissions, roles, access control', riskLevel: 'critical' },
  { code: 'audit', label: 'Audit', description: 'Logging, monitoring, compliance', riskLevel: 'high' },
  { code: 'data_protection', label: 'Data Protection', description: 'PII, encryption, masking', riskLevel: 'critical' },
  { code: 'session', label: 'Session Management', description: 'Timeouts, concurrent sessions', riskLevel: 'medium' }
];

// Administrator role levels
export const ADMIN_ROLE_LEVELS: AdminRoleLevel[] = [
  {
    level: 1,
    name: 'Super Admin',
    description: 'Highest level of system access with full configuration capabilities',
    capabilities: [
      'All system configuration',
      'Emergency break-glass access',
      'SSO and authentication settings',
      'AI governance controls',
      'Compliance oversight'
    ],
    restrictions: [
      'Actions fully audited',
      'Requires MFA',
      'Limited to 1-2 per organization'
    ]
  },
  {
    level: 2,
    name: 'Security Admin',
    description: 'Manages security policies, roles, and access controls',
    capabilities: [
      'Role management',
      'Permission configuration',
      'Access certification',
      'Security monitoring',
      'Audit log review'
    ],
    restrictions: [
      'Cannot modify own permissions',
      'Cannot access AI governance',
      'Requires Super Admin approval for sensitive changes'
    ]
  },
  {
    level: 3,
    name: 'HR Admin',
    description: 'Manages HR operations and user accounts',
    capabilities: [
      'User account management',
      'Module-level configuration',
      'Reporting and analytics',
      'Workflow management',
      'Notification settings'
    ],
    restrictions: [
      'Cannot modify security policies',
      'Limited PII access based on role',
      'Cannot create admin roles'
    ]
  },
  {
    level: 4,
    name: 'Module Admin',
    description: 'Specialized admin for specific HR modules',
    capabilities: [
      'Module-specific configuration',
      'Module reporting',
      'User support within module'
    ],
    restrictions: [
      'Access limited to assigned module(s)',
      'Cannot modify org structure',
      'Reports to HR Admin or Security Admin'
    ]
  }
];

// Admin container definitions with categories
export const ADMIN_CONTAINERS: AdminContainerDefinition[] = [
  { code: 'org_structure', label: 'Organization & Structure', description: 'Departments, divisions, positions, and org chart management', category: 'foundation' },
  { code: 'users_roles_access', label: 'Users, Roles & Access', description: 'User accounts, role assignments, and access controls', category: 'access' },
  { code: 'security_governance', label: 'Security & Governance', description: 'Security policies, audit logs, and governance settings', category: 'security' },
  { code: 'system_platform_config', label: 'System & Platform Configuration', description: 'System settings, integrations, and platform configuration', category: 'system' },
  { code: 'analytics_insights', label: 'Analytics & Insights', description: 'Workforce analytics, dashboards, reports, and AI-powered insights', category: 'system' },
  { code: 'ai_governance', label: 'AI Governance', description: 'AI settings, guardrails, and compliance controls', category: 'ai' }
];
