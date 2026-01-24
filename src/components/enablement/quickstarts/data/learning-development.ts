import {
  GraduationCap,
  UserCog,
  MonitorCog,
  Briefcase,
  Settings,
  BookOpen,
  FolderTree,
} from "lucide-react";
import type { QuickStartData } from "@/types/quickstart";

export const LND_QUICKSTART_DATA: QuickStartData = {
  // Module identity
  moduleCode: "LND",
  title: "L&D Quick Start Guide",
  subtitle: "Get your Learning Management System up and running with your first course",
  icon: GraduationCap,
  colorClass: "emerald",
  
  // Time estimates
  quickSetupTime: "15-30 minutes",
  fullConfigTime: "2-4 hours",
  
  // Breadcrumb configuration
  breadcrumbLabel: "Learning & Development",
  
  // Roles
  roles: [
    {
      role: "Primary Owner",
      title: "HR Administrator or L&D Manager",
      icon: UserCog,
      responsibility: "Completes all setup steps, configures courses",
    },
    {
      role: "Supporting Role",
      title: "IT Administrator",
      icon: MonitorCog,
      responsibility: "Assists with SSO, integrations, technical setup",
    },
    {
      role: "Content Creator",
      title: "Subject Matter Expert",
      icon: Briefcase,
      responsibility: "Provides course content, reviews materials",
    },
  ],
  
  // Prerequisites
  prerequisites: [
    {
      id: "competency-library",
      title: "Competency Library Populated",
      description: "At least core competencies should be defined for course-to-skill mapping",
      required: true,
      href: "/performance/setup?tab=competencies",
      module: "Performance",
    },
    {
      id: "job-profiles",
      title: "Job Profiles Configured",
      description: "Job profiles enable role-based learning path recommendations",
      required: true,
      href: "/workforce/positions",
      module: "Workforce",
    },
    {
      id: "employee-records",
      title: "Employee Records Created",
      description: "Employees must exist to be enrolled in courses",
      required: true,
      href: "/workforce/employees",
      module: "Workforce",
    },
    {
      id: "manager-hierarchy",
      title: "Manager Hierarchy Established",
      description: "Required for manager-assigned training and approval workflows",
      required: true,
      href: "/workforce/org-chart",
      module: "Workforce",
    },
    {
      id: "departments",
      title: "Departments Defined",
      description: "Enables department-level training assignments and reporting",
      required: false,
      href: "/workforce/departments",
      module: "Workforce",
    },
  ],
  
  // Common Pitfalls
  pitfalls: [
    {
      issue: "Publishing before testing",
      prevention: "Always use draft mode first and enroll yourself as a test learner before making courses available",
    },
    {
      issue: "Skipping competency mapping",
      prevention: "Courses without skill links won't feed AI recommendations or appear in development plans",
    },
    {
      issue: "No manager hierarchy set",
      prevention: "Manager-assigned training workflows will fail; verify org chart is complete first",
    },
    {
      issue: "Missing course prerequisites",
      prevention: "Define learning path sequences before creating dependent courses",
    },
  ],
  
  // Content Strategy Questions
  contentStrategyQuestions: [
    "Will you use external content providers (LinkedIn Learning, Udemy for Business)?",
    "What mix of video vs. document vs. instructor-led training (ILT)?",
    "Will you create learning paths or standalone courses?",
    "How will you handle compliance training vs. professional development?",
  ],
  
  // Setup Steps
  setupSteps: [
    {
      id: "step-1",
      title: "Navigate to LMS Admin",
      description: "Access the Learning Management System administration panel",
      estimatedTime: "2 min",
      substeps: [
        "Go to Admin Dashboard",
        "Click on 'LMS Management' under Platform Settings",
      ],
      href: "/admin/lms-management",
    },
    {
      id: "step-2",
      title: "Configure Course Categories",
      description: "Create logical groupings for your training content",
      estimatedTime: "5 min",
      substeps: [
        "Click 'Add Category'",
        "Enter category name (e.g., 'Compliance', 'Technical Skills', 'Leadership')",
        "Add description and icon",
        "Set display order",
      ],
      expectedResult: "At least 3 categories visible in the category list",
    },
    {
      id: "step-3",
      title: "Create Your First Course",
      description: "Set up a basic course with modules and lessons",
      estimatedTime: "10 min",
      substeps: [
        "Click 'Create Course' button",
        "Enter course title and description",
        "Select category and set difficulty level",
        "Add at least one module with 2-3 lessons",
        "Configure course duration estimate",
      ],
      expectedResult: "Course appears in the course catalog with 'Draft' status",
    },
    {
      id: "step-4",
      title: "Add Quiz or Assessment",
      description: "Create knowledge checks for your course",
      estimatedTime: "8 min",
      substeps: [
        "Open your created course",
        "Navigate to 'Assessments' tab",
        "Click 'Add Quiz'",
        "Add 3-5 multiple choice questions",
        "Set passing score (typically 70-80%)",
      ],
      expectedResult: "Quiz linked to course with questions visible",
    },
    {
      id: "step-5",
      title: "Publish and Test",
      description: "Make the course available and verify learner experience",
      estimatedTime: "5 min",
      substeps: [
        "Review course content and structure",
        "Click 'Publish' to make course available",
        "Enroll yourself as a test learner",
        "Complete the course and quiz",
        "Verify completion is recorded",
      ],
      expectedResult: "Course completion and quiz score recorded in your training history",
    },
  ],
  
  // Rollout Options
  rolloutOptions: [
    { id: "soft", label: "Soft Launch", description: "Start with 5-10 pilot users, gather feedback, iterate" },
    { id: "department", label: "Department Rollout", description: "Launch to one department first, then expand" },
    { id: "full", label: "Full Launch", description: "Open to all employees immediately" },
  ],
  rolloutRecommendation: "Start with Soft Launch to gather feedback before expanding organization-wide.",
  
  // Verification Checks
  verificationChecks: [
    "Course appears in Training Dashboard catalog",
    "Employees can self-enroll (if enabled)",
    "Progress tracking shows lesson completion",
    "Quiz scores are recorded correctly",
    "Certificates generate upon completion (if configured)",
    "Manager can view team training status",
  ],
  
  // Integration Checklist
  integrationChecklist: [
    { id: "sso", label: "SSO/Authentication configured", required: true },
    { id: "hris", label: "HR System sync enabled (employee data)", required: true },
    { id: "content", label: "External content providers connected", required: false },
    { id: "notifications", label: "Email notifications configured", required: true },
    { id: "calendar", label: "Calendar integration for ILT sessions", required: false },
  ],
  
  // Success Metrics
  successMetrics: [
    { metric: "Course Enrollment Rate", target: "50% in first month", howToMeasure: "LMS Analytics Dashboard" },
    { metric: "Completion Rate", target: "70%+", howToMeasure: "Course Reports" },
    { metric: "Learner Satisfaction", target: "4/5 stars", howToMeasure: "Post-course surveys" },
    { metric: "Time to First Completion", target: "< 7 days", howToMeasure: "Enrollment-to-completion tracking" },
  ],
  
  // Next Steps
  nextSteps: [
    {
      label: "Configure Advanced LMS Settings",
      href: "/admin/lms-management",
      icon: Settings,
    },
    {
      label: "View Training Dashboard (Learner View)",
      href: "/training",
      icon: BookOpen,
    },
    {
      label: "View Full L&D Documentation",
      href: "/enablement/modules/learning-development",
      icon: FolderTree,
    },
  ],
};
