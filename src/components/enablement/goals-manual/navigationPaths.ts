// Centralized navigation paths mapping for all Goals manual sections
export const GOALS_NAVIGATION_PATHS: Record<string, string[]> = {
  // Part 2: Setup & Configuration
  'goal-sec-2-1': ['Performance', 'Setup', 'Goals', 'Goal Cycles'],
  'goal-sec-2-2': ['Performance', 'Setup', 'Goals', 'Goal Templates'],
  'goal-sec-2-3': ['Performance', 'Setup', 'Goals', 'Locking Rules'],
  'goal-sec-2-4': ['Performance', 'Setup', 'Goals', 'Check-in Cadence'],
  'goal-sec-2-5': ['Performance', 'Setup', 'Goals', 'Rating Config'],

  // Part 3: Workflows
  'goal-sec-3-1': ['Performance', 'Goals', 'My Goals'],
  'goal-sec-3-2': ['Performance', 'Goals', 'Team Goals'],
  'goal-sec-3-3': ['Performance', 'Goals', 'Goal Approval'],

  // Part 4: OKR Framework
  'goal-sec-4-1': ['Performance', 'Goals', 'OKR Setup'],
  'goal-sec-4-2': ['Performance', 'Goals', 'Key Results'],
  'goal-sec-4-3': ['Performance', 'Goals', 'Alignment View'],

  // Part 5: Analytics
  'goal-sec-5-1': ['Performance', 'Analytics', 'Goal Progress'],
  'goal-sec-5-2': ['Performance', 'Analytics', 'Completion Reports'],

  // Part 6: Integration
  'goal-sec-6-1': ['Performance', 'Setup', 'Integration', 'Appraisals Link'],
  'goal-sec-6-2': ['Performance', 'Setup', 'Integration', 'Compensation Link'],
};

// Related topics mapping for cross-referencing
export const GOALS_RELATED_TOPICS: Record<string, { sectionId: string; title: string }[]> = {
  'goal-sec-2-1': [
    { sectionId: 'goal-sec-2-2', title: 'Goal Templates' },
    { sectionId: 'goal-sec-3-1', title: 'Employee Goal Entry' },
  ],
  'goal-sec-2-2': [
    { sectionId: 'goal-sec-2-1', title: 'Goal Cycles' },
    { sectionId: 'goal-sec-4-1', title: 'OKR Framework' },
  ],
  'goal-sec-2-3': [
    { sectionId: 'goal-sec-2-4', title: 'Check-in Cadence' },
    { sectionId: 'goal-sec-3-3', title: 'Goal Approval' },
  ],
  'goal-sec-4-1': [
    { sectionId: 'goal-sec-4-2', title: 'Key Results' },
    { sectionId: 'goal-sec-4-3', title: 'Alignment View' },
  ],
  'goal-sec-5-1': [
    { sectionId: 'goal-sec-5-2', title: 'Completion Reports' },
    { sectionId: 'goal-sec-6-1', title: 'Appraisals Integration' },
  ],
  'goal-sec-6-1': [
    { sectionId: 'goal-sec-6-2', title: 'Compensation Integration' },
    { sectionId: 'goal-sec-2-5', title: 'Goal Rating Config' },
  ],
};
