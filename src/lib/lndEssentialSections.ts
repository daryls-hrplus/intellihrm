// Top 20 Essential Sections for L&D Quick Start Mode
// These are the most critical procedures for getting started with L&D

export const LND_ESSENTIAL_SECTION_IDS = new Set([
  // Chapter 1: Foundational Understanding
  'sec-1-1', // Introduction to L&D
  'sec-1-2', // Core Concepts & Terminology
  
  // Chapter 2: Core Setup (Most Essential)
  'sec-2-2', // Course Categories Setup
  'sec-2-3', // Course Creation & Structure
  'sec-2-4', // Modules & Lessons
  'sec-2-5', // Quiz Configuration
  'sec-2-6', // Learning Paths
  'sec-2-7', // Competency Mapping
  'sec-2-8', // Compliance Training Rules
  'sec-2-14', // Certificate Templates
  
  // Chapter 3: Vendor Management Essentials
  'sec-3-2', // Vendor Registry & Classification
  'sec-3-4', // Vendor Course Catalog
  
  // Chapter 4: Core Workflows
  'sec-4-1', // Learner Journey Overview
  'sec-4-2', // Enrollment Management
  'sec-4-5', // Course Completion & Evaluation
  'sec-4-6', // Certificate Issuance
  'sec-4-11', // HR/Manager Bulk Assignments
  
  // Chapter 5: Compliance Essentials
  'sec-5-1', // Regulatory Compliance Overview
  'sec-5-4', // Bulk Assignment Procedures
]);

// Quick descriptions for the essential sections
export const ESSENTIAL_SECTION_DESCRIPTIONS: Record<string, string> = {
  'sec-1-1': 'Understand the module\'s purpose and value',
  'sec-1-2': 'Learn key terminology and concepts',
  'sec-2-2': 'Organize your training content',
  'sec-2-3': 'Build your first course',
  'sec-2-4': 'Structure course content',
  'sec-2-5': 'Add assessments and quizzes',
  'sec-2-6': 'Create learning journeys',
  'sec-2-7': 'Link training to skills',
  'sec-2-8': 'Set up mandatory training',
  'sec-2-14': 'Design completion certificates',
  'sec-3-2': 'Add external training providers',
  'sec-3-4': 'Configure vendor courses',
  'sec-4-1': 'Understand the learner experience',
  'sec-4-2': 'Manage course enrollments',
  'sec-4-5': 'Track completions and feedback',
  'sec-4-6': 'Issue and verify certificates',
  'sec-4-11': 'Assign training to teams',
  'sec-5-1': 'Understand compliance requirements',
  'sec-5-4': 'Assign compliance training at scale',
};

export function isEssentialSection(sectionId: string): boolean {
  return LND_ESSENTIAL_SECTION_IDS.has(sectionId);
}

export const ESSENTIAL_SECTION_COUNT = LND_ESSENTIAL_SECTION_IDS.size;
