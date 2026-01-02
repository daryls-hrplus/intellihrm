// Centralized navigation paths mapping for all manual sections
export const NAVIGATION_PATHS: Record<string, string[]> = {
  // Part 2: Setup & Configuration
  'sec-2-1': ['Performance', 'Setup', '(See tabs below)'],
  'sec-2-2': ['Performance', 'Setup', 'Foundation', 'Rating Scales'],
  'sec-2-3': ['Performance', 'Setup', 'Foundation', 'Overall Rating Scales'],
  'sec-2-4': ['Performance', 'Setup', 'Foundation', 'Competencies'],
  'sec-2-5': ['Performance', 'Setup', 'Appraisals', 'Form Templates'],
  'sec-2-6': ['Performance', 'Setup', 'Appraisals', 'Appraisal Cycles'],
  'sec-2-7': ['Performance', 'Setup', 'Appraisals', 'Performance Categories'],
  'sec-2-8': ['Performance', 'Setup', 'Appraisals', 'Action Rules'],
  'sec-2-9': ['Performance', 'Setup', 'Integration', 'Module Connections'],

  // Part 3: Workflows
  'sec-3-1': ['Performance', 'Appraisals', 'Cycles'],
  'sec-3-2': ['Performance', 'Appraisals', 'Team Evaluations'],
  'sec-3-3': ['Employee Self-Service', 'My Performance', 'Appraisals'],

  // Part 4: Calibration
  'sec-4-1': ['Performance', 'Calibration', 'Sessions'],
  'sec-4-2': ['Performance', 'Talent', 'Nine-Box Grid'],

  // Part 5: AI Features
  'sec-5-1': ['Performance', 'Appraisals', 'AI Assistant'],
  'sec-5-2': ['Performance', 'Appraisals', 'Bias Detection'],

  // Part 6: Analytics
  'sec-6-1': ['Performance', 'Analytics', 'Appraisal Dashboard'],
  'sec-6-2': ['Performance', 'Analytics', 'Distribution Analysis'],

  // Part 7: Integration
  'sec-7-1': ['Performance', 'Setup', 'Integration', 'Overview'],
  'sec-7-2': ['Performance', 'Setup', 'Integration', 'Triggers'],
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
  'sec-6-1': [
    { sectionId: 'sec-6-2', title: 'Distribution Analysis' },
    { sectionId: 'sec-4-1', title: 'Calibration' },
  ],
  'sec-7-1': [
    { sectionId: 'sec-7-2', title: 'Downstream Triggers' },
    { sectionId: 'sec-2-8', title: 'Action Rules' },
  ],
};
