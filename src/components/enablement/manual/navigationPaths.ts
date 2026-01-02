// Centralized navigation paths mapping for all Appraisals manual sections
export const NAVIGATION_PATHS: Record<string, string[]> = {
  // Part 2: Setup & Configuration - Foundation (2.1-2.4)
  'sec-2-1': ['Performance', 'Setup', '(Multiple areas)'],
  'sec-2-2': ['Performance', 'Setup', 'Foundation', 'Rating Scales'],
  'sec-2-3': ['Performance', 'Setup', 'Foundation', 'Overall Rating Scales'],
  'sec-2-4': ['Performance', 'Setup', 'Foundation', 'Competencies'],
  
  // Part 2: Setup & Configuration - Appraisals (2.5-2.14)
  'sec-2-5': ['Performance', 'Setup', 'Appraisals', 'Form Templates'],
  'sec-2-6': ['Performance', 'Setup', 'Appraisals', 'Appraisal Cycles'],
  'sec-2-7': ['Performance', 'Setup', 'Appraisals', 'Performance Categories'],
  'sec-2-8': ['Performance', 'Setup', 'Appraisals', 'Action Rules'],
  'sec-2-9': ['Performance', 'Setup', 'Integration', 'Integration Rules'],
  'sec-2-10': ['Performance', 'Setup', 'Appraisals', 'Employee Response'],
  'sec-2-11': ['Performance', 'Setup', 'Appraisals', 'HR Escalations'],
  'sec-2-12': ['Performance', 'Setup', 'Appraisals', 'Appraisal Cycles', 'Multi-Position'],
  'sec-2-13': ['Performance', 'Setup', 'Appraisals', 'Index Settings'],
  'sec-2-14': ['Performance', 'Setup', 'Appraisals', 'Benchmarks'],

  // Part 3: Workflows
  'sec-3-1': ['Performance', 'Appraisals', 'Cycles'],
  'sec-3-2': ['Performance', 'Appraisals', 'Cycles', 'Enrollment'],
  'sec-3-3': ['Manager Self-Service', 'Team Appraisals'],
  'sec-3-4': ['Employee Self-Service', 'My Performance', 'Appraisals'],
  'sec-3-5': ['Performance', 'Appraisals', 'Goal Rating'],
  'sec-3-6': ['Performance', 'Appraisals', 'Competency Assessment'],
  'sec-3-7': ['Employee Self-Service', 'My Performance', 'Response'],
  'sec-3-8': ['Manager Self-Service', 'Team Appraisals', 'Interviews'],
  'sec-3-9': ['Performance', 'Appraisals', 'Role Changes'],
  'sec-3-10': ['Performance', 'Appraisals', 'Finalization'],

  // Part 4: Calibration Sessions
  'sec-4-1': ['Performance', 'Calibration', 'Overview'],
  'sec-4-2': ['Performance', 'Calibration', 'Sessions', 'Create'],
  'sec-4-3': ['Performance', 'Calibration', 'Sessions', 'Workspace'],
  'sec-4-4': ['Performance', 'Calibration', 'AI Insights'],
  'sec-4-5': ['Performance', 'Talent', 'Nine-Box Grid'],
  'sec-4-6': ['Performance', 'Calibration', 'Audit Trail'],

  // Part 5: AI Features & Intelligence
  'sec-5-1': ['Performance', 'Appraisals', 'AI Assistant', 'Overview'],
  'sec-5-2': ['Performance', 'Appraisals', 'AI Assistant', 'Strengths Generator'],
  'sec-5-3': ['Performance', 'Appraisals', 'AI Assistant', 'Development Suggestions'],
  'sec-5-4': ['Performance', 'Appraisals', 'AI Assistant', 'Bias Detection'],
  'sec-5-5': ['Performance', 'Appraisals', 'AI Assistant', 'Comment Quality'],
  'sec-5-6': ['Performance', 'Intelligence Hub'],
  // Part 6: Analytics & Reporting
  'sec-6-1': ['Performance', 'Intelligence Hub'],
  'sec-6-2': ['Performance', 'Intelligence Hub', 'Appraisals'],
  'sec-6-3': ['Performance', 'Intelligence Hub', 'Appraisals', 'Distribution'],
  'sec-6-4': ['Performance', 'Intelligence Hub', 'Appraisals', 'Patterns'],

  // Part 7: Integration
  'sec-7-1': ['Performance', 'Setup', 'Integration', 'Overview'],
  'sec-7-2': ['Performance', 'Setup', 'Integration', 'Triggers'],
  'sec-7-7': ['Performance', 'Intelligence Hub', 'Integrations'],

  // Part 8: Troubleshooting & Best Practices
  'sec-8-1': ['Support', 'Troubleshooting', 'Common Issues'],
  'sec-8-2': ['Support', 'Best Practices'],
  'sec-8-3': ['Admin', 'Security', 'Access Control'],
  'sec-8-4': ['Admin', 'Compliance', 'Audit'],
  'sec-8-5': ['Support', 'Troubleshooting', 'Integration'],
  'sec-8-6': ['Admin', 'Performance', 'Optimization'],
  'sec-8-7': ['Admin', 'Data Quality', 'Validation'],
  'sec-8-8': ['Support', 'Escalation', 'Procedures'],
};

// Related topics mapping for cross-referencing
export const RELATED_TOPICS: Record<string, { sectionId: string; title: string }[]> = {
  'sec-2-2': [
    { sectionId: 'sec-2-3', title: 'Overall Rating Scales' },
    { sectionId: 'sec-4-1', title: 'Calibration' },
  ],
  'sec-2-3': [
    { sectionId: 'sec-2-2', title: 'Rating Scales' },
    { sectionId: 'sec-7-1', title: 'Integration Overview' },
  ],
  'sec-2-4': [
    { sectionId: 'sec-2-5', title: 'Form Templates' },
    { sectionId: 'sec-3-2', title: 'Manager Workflow' },
  ],
  'sec-2-5': [
    { sectionId: 'sec-2-4', title: 'Competency Library' },
    { sectionId: 'sec-2-6', title: 'Appraisal Cycles' },
  ],
  'sec-2-6': [
    { sectionId: 'sec-2-5', title: 'Form Templates' },
    { sectionId: 'sec-3-1', title: 'Cycle Lifecycle' },
  ],
  'sec-2-7': [
    { sectionId: 'sec-2-14', title: 'Benchmarks Configuration' },
    { sectionId: 'sec-4-1', title: 'Calibration Sessions' },
  ],
  'sec-2-13': [
    { sectionId: 'sec-4-2', title: 'Nine-Box Grid' },
    { sectionId: 'sec-7-1', title: 'Integration Overview' },
  ],
  'sec-2-14': [
    { sectionId: 'sec-2-7', title: 'Performance Categories' },
    { sectionId: 'sec-4-1', title: 'Calibration Sessions' },
  ],
  'sec-3-1': [
    { sectionId: 'sec-2-6', title: 'Cycle Configuration' },
    { sectionId: 'sec-3-2', title: 'Manager Workflow' },
  ],
  'sec-3-2': [
    { sectionId: 'sec-5-1', title: 'AI Feedback Assistant' },
    { sectionId: 'sec-3-3', title: 'Employee Response' },
  ],
  'sec-4-1': [
    { sectionId: 'sec-4-2', title: 'Nine-Box Grid' },
    { sectionId: 'sec-6-2', title: 'Distribution Analysis' },
  ],
  'sec-5-1': [
    { sectionId: 'sec-5-2', title: 'Bias Detection' },
    { sectionId: 'sec-3-2', title: 'Manager Workflow' },
  ],
  'sec-5-6': [
    { sectionId: 'sec-6-1', title: 'Intelligence Hub Dashboard' },
    { sectionId: 'sec-6-4', title: 'Trend Analysis & Predictions' },
    { sectionId: 'sec-5-1', title: 'AI Feedback Assistant' },
  ],
  'sec-6-1': [
    { sectionId: 'sec-6-2', title: 'Performance Distribution' },
    { sectionId: 'sec-6-3', title: 'Manager Scoring Patterns' },
    { sectionId: 'sec-6-4', title: 'Trend Analysis & Predictions' },
    { sectionId: 'sec-5-6', title: 'AI Analytics Overview' },
  ],
  'sec-6-2': [
    { sectionId: 'sec-6-1', title: 'Intelligence Hub Dashboard' },
    { sectionId: 'sec-6-3', title: 'Manager Scoring Patterns' },
    { sectionId: 'sec-4-1', title: 'Calibration Sessions' },
  ],
  'sec-6-3': [
    { sectionId: 'sec-6-1', title: 'Intelligence Hub Dashboard' },
    { sectionId: 'sec-6-2', title: 'Performance Distribution' },
    { sectionId: 'sec-6-4', title: 'Trend Analysis & Predictions' },
    { sectionId: 'sec-4-1', title: 'Calibration Sessions' },
  ],
  'sec-6-4': [
    { sectionId: 'sec-6-1', title: 'Intelligence Hub Dashboard' },
    { sectionId: 'sec-6-2', title: 'Performance Distribution' },
    { sectionId: 'sec-5-6', title: 'AI Analytics Overview' },
  ],
  'sec-7-1': [
    { sectionId: 'sec-7-2', title: 'Nine-Box & Succession' },
    { sectionId: 'sec-7-3', title: 'IDP/PIP Auto-Creation' },
    { sectionId: 'sec-7-4', title: 'Compensation Integration' },
    { sectionId: 'sec-7-5', title: 'Learning & Development' },
    { sectionId: 'sec-7-6', title: 'Notification Orchestration' },
  ],
  'sec-7-2': [
    { sectionId: 'sec-7-1', title: 'Integration Overview' },
    { sectionId: 'sec-7-3', title: 'IDP/PIP Auto-Creation' },
    { sectionId: 'sec-4-1', title: 'Calibration Sessions' },
  ],
  'sec-7-3': [
    { sectionId: 'sec-7-1', title: 'Integration Overview' },
    { sectionId: 'sec-7-2', title: 'Nine-Box & Succession' },
    { sectionId: 'sec-7-4', title: 'Compensation Integration' },
  ],
  'sec-7-4': [
    { sectionId: 'sec-7-1', title: 'Integration Overview' },
    { sectionId: 'sec-7-3', title: 'IDP/PIP Auto-Creation' },
    { sectionId: 'sec-7-5', title: 'Learning & Development' },
  ],
  'sec-7-5': [
    { sectionId: 'sec-7-1', title: 'Integration Overview' },
    { sectionId: 'sec-7-3', title: 'IDP/PIP Auto-Creation' },
    { sectionId: 'sec-7-4', title: 'Compensation Integration' },
  ],
  'sec-7-6': [
    { sectionId: 'sec-7-1', title: 'Integration Overview' },
    { sectionId: 'sec-7-2', title: 'Nine-Box & Succession' },
    { sectionId: 'sec-2-8', title: 'Action Rules' },
  ],
};
