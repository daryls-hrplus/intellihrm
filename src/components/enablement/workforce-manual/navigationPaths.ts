// Workforce Manual Navigation Paths and Cross-Module References

export const WORKFORCE_NAVIGATION_PATHS: Record<string, string[]> = {
  'wf-sec-2-1': ['Part 2: Foundation Setup', 'Prerequisites Checklist'],
  'wf-sec-2-4': ['Part 2: Foundation Setup', 'Companies Configuration'],
  'wf-sec-2-6': ['Part 2: Foundation Setup', 'Departments Configuration'],
  'wf-sec-2-8': ['Part 2: Foundation Setup', 'Branch Locations Setup'],
  'wf-sec-2-10': ['Part 2: Foundation Setup', 'Governance & Board Setup'],
  'wf-sec-3-5': ['Part 3: Job Architecture', 'Qualifications Management'],
};

export const WORKFORCE_RELATED_TOPICS: Record<string, { sectionId: string; title: string; module?: string; manualPath?: string }[]> = {
  'wf-sec-2-1': [
    { sectionId: 'hh-sec-3-4', title: 'SOP Management', module: 'HR Hub', manualPath: '/enablement/manuals/hr-hub' },
    { sectionId: 'wf-sec-2-2', title: 'Territories Configuration' },
  ],
  'wf-sec-2-4': [
    { sectionId: 'hh-sec-5-1', title: 'Compliance Tracker Setup', module: 'HR Hub', manualPath: '/enablement/manuals/hr-hub' },
    { sectionId: 'wf-sec-2-5', title: 'Divisions Configuration' },
  ],
  'wf-sec-2-6': [
    { sectionId: 'hh-sec-5-2', title: 'Transaction Workflow Settings', module: 'HR Hub', manualPath: '/enablement/manuals/hr-hub' },
    { sectionId: 'wf-sec-2-7', title: 'Sections Configuration' },
  ],
  'wf-sec-2-8': [
    { sectionId: 'hh-sec-4-1', title: 'Calendar Setup', module: 'HR Hub', manualPath: '/enablement/manuals/hr-hub' },
    { sectionId: 'wf-sec-2-9', title: 'Org Chart Configuration' },
  ],
  'wf-sec-2-10': [
    { sectionId: 'hh-sec-3-2', title: 'Policy Documents', module: 'HR Hub', manualPath: '/enablement/manuals/hr-hub' },
  ],
  'wf-sec-3-5': [
    { sectionId: 'hh-sec-5-1', title: 'Compliance Tracker for Certification Expiry', module: 'HR Hub', manualPath: '/enablement/manuals/hr-hub' },
    { sectionId: 'wf-sec-3-6', title: 'Responsibilities Templates' },
  ],
};

// HR Hub cross-references for Workforce sections
export const WORKFORCE_HR_HUB_REFERENCES = {
  'wf-sec-2-1': {
    type: 'see_also' as const,
    hrHubSection: 'hh-sec-3-4',
    title: 'SOP Management',
    description: 'Document standard operating procedures for organizational processes'
  },
  'wf-sec-2-4': {
    type: 'integration' as const,
    hrHubSection: 'hh-sec-5-1',
    title: 'Compliance Tracker Setup',
    description: 'Configure company-specific compliance requirements and deadlines'
  },
  'wf-sec-2-6': {
    type: 'dependency' as const,
    hrHubSection: 'hh-sec-5-2',
    title: 'Transaction Workflow Settings',
    description: 'Approval workflows route based on department hierarchy'
  },
  'wf-sec-2-8': {
    type: 'see_also' as const,
    hrHubSection: 'hh-sec-4-1',
    title: 'Calendar Setup',
    description: 'Location-based calendar events and holidays'
  },
  'wf-sec-3-5': {
    type: 'integration' as const,
    hrHubSection: 'hh-sec-5-1',
    title: 'Compliance Tracker',
    description: 'Certification expiry tracking feeds into compliance monitoring'
  }
};
