import {
  Clock,
  UserCog,
  MonitorCog,
  DollarSign,
  Settings,
  BookOpen,
  FolderTree,
  MapPin,
  Smartphone,
  Calendar,
} from "lucide-react";
import type { QuickStartData } from "@/types/quickstart";

export const TA_QUICKSTART_DATA: QuickStartData = {
  // Module identity
  moduleCode: "TA",
  title: "Time & Attendance Quick Start Guide",
  subtitle: "Get your time tracking system running with your first clock-in in 20 minutes",
  icon: Clock,
  colorClass: "amber",
  
  // Time estimates
  quickSetupTime: "20-30 minutes",
  fullConfigTime: "3-5 hours",
  
  // Breadcrumb configuration
  breadcrumbLabel: "Time & Attendance",
  
  // Roles
  roles: [
    {
      role: "Primary Owner",
      title: "Time Administrator",
      icon: UserCog,
      responsibility: "Configures policies, devices, schedules, and attendance rules",
    },
    {
      role: "Supporting Role",
      title: "IT Administrator",
      icon: MonitorCog,
      responsibility: "Assists with device setup, network config, and integrations",
    },
    {
      role: "Supporting Role",
      title: "Payroll Administrator",
      icon: DollarSign,
      responsibility: "Validates overtime rules, pay periods, and payroll sync",
    },
  ],
  
  // Prerequisites
  prerequisites: [
    {
      id: "employee-records",
      title: "Employee Records Created",
      description: "Employees must exist in the system to clock in and be assigned shifts",
      required: true,
      href: "/workforce/employees",
      module: "Workforce",
    },
    {
      id: "locations",
      title: "Locations/Branches Configured",
      description: "Work locations are required for geofencing and device assignment",
      required: true,
      href: "/workforce/locations",
      module: "Workforce",
    },
    {
      id: "pay-periods",
      title: "Pay Periods Defined",
      description: "Pay period schedule needed for timesheet submissions and OT calculations",
      required: true,
      href: "/payroll/setup?tab=periods",
      module: "Payroll",
    },
    {
      id: "manager-hierarchy",
      title: "Manager Hierarchy Established",
      description: "Required for timesheet approvals, OT requests, and team dashboards",
      required: true,
      href: "/workforce/org-chart",
      module: "Workforce",
    },
    {
      id: "departments",
      title: "Departments Defined",
      description: "Enables department-level scheduling and attendance reporting",
      required: false,
      href: "/workforce/departments",
      module: "Workforce",
    },
  ],
  
  // Common Pitfalls
  pitfalls: [
    {
      issue: "Enabling face verification before employee enrollment",
      prevention: "Always complete employee face enrollment before requiring face verification for clock-in",
    },
    {
      issue: "Deploying geofencing without accurate GPS coordinates",
      prevention: "Verify location coordinates on a map and test with mobile device before enabling enforcement",
    },
    {
      issue: "Setting OT thresholds without payroll alignment",
      prevention: "Confirm overtime calculation rules match payroll system configuration before go-live",
    },
    {
      issue: "No grace period configured for clock-in",
      prevention: "Set reasonable grace periods (5-15 min) to avoid excessive late arrival exceptions",
    },
    {
      issue: "Missing rounding rules causing pay discrepancies",
      prevention: "Configure rounding rules that comply with local labor laws and match payroll expectations",
    },
  ],
  
  // Content Strategy Questions
  contentStrategyQuestions: [
    "What clock-in methods will you support? (mobile, web, biometric, card, kiosk)",
    "Will employees work from multiple locations requiring geofence validation?",
    "What are your overtime rules? (daily, weekly, consecutive days)",
    "Do you need shift differentials for night/weekend work?",
    "Will you allow employee self-service for shift swaps and open shifts?",
    "Are there CBA (union) rules that affect overtime or scheduling?",
  ],
  
  // Setup Steps
  setupSteps: [
    {
      id: "step-1",
      title: "Configure Attendance Policy",
      description: "Define your time tracking rules: rounding, grace periods, and OT thresholds",
      estimatedTime: "5 min",
      substeps: [
        "Go to Time & Attendance > Setup > Policies",
        "Create or edit the default attendance policy",
        "Set clock-in rounding (e.g., nearest 15 minutes)",
        "Configure grace period for late arrivals (e.g., 5 minutes)",
        "Set weekly overtime threshold (e.g., 40 hours)",
      ],
      expectedResult: "Attendance policy saved with rounding and OT rules active",
      href: "/time-attendance/setup?tab=policies",
    },
    {
      id: "step-2",
      title: "Set Up First Location Geofence",
      description: "Create a GPS boundary for your primary work location",
      estimatedTime: "5 min",
      substeps: [
        "Navigate to Time & Attendance > Geofencing",
        "Click 'Add Geofence Location'",
        "Select your headquarters or primary location",
        "Set radius (typically 100-200 meters)",
        "Enable enforcement for mobile clock-ins",
      ],
      expectedResult: "Geofence visible on map with correct radius",
      href: "/time-attendance/geofencing",
    },
    {
      id: "step-3",
      title: "Enable Mobile Clock-In",
      description: "Configure the mobile app for employee time capture",
      estimatedTime: "3 min",
      substeps: [
        "Go to Time & Attendance > Setup > Clock Methods",
        "Enable 'Mobile GPS' clock method",
        "Link to configured geofence locations",
        "Set face verification requirement (optional)",
      ],
      expectedResult: "Mobile clock-in enabled in employee app",
      href: "/time-attendance/setup?tab=clock-methods",
    },
    {
      id: "step-4",
      title: "Create First Shift Template",
      description: "Define a reusable work schedule pattern",
      estimatedTime: "5 min",
      substeps: [
        "Navigate to Time & Attendance > Shifts > Templates",
        "Click 'Create Template'",
        "Enter name (e.g., 'Standard Day Shift')",
        "Set start time (9:00 AM) and end time (5:00 PM)",
        "Add lunch break (12:00 PM - 1:00 PM, unpaid)",
      ],
      expectedResult: "Shift template visible in template list",
      href: "/time-attendance/shifts/templates",
    },
    {
      id: "step-5",
      title: "Assign Employees and Test",
      description: "Assign the shift to employees and verify clock-in works",
      estimatedTime: "7 min",
      substeps: [
        "Go to Time & Attendance > Shifts > Assignments",
        "Select your shift template",
        "Assign yourself or a test employee",
        "Open mobile app and perform test clock-in",
        "Verify punch appears in Time Records",
      ],
      expectedResult: "Clock entry recorded with correct time and location",
      href: "/time-attendance/shifts/assignments",
    },
  ],
  
  // Rollout Options
  rolloutOptions: [
    { id: "pilot", label: "Pilot Launch", description: "Start with one department/location to validate configuration" },
    { id: "phased", label: "Phased Rollout", description: "Roll out by location or department over 2-4 weeks" },
    { id: "full", label: "Full Launch", description: "Company-wide deployment with all features enabled" },
  ],
  rolloutRecommendation: "Start with Pilot Launch at one location to validate geofences, policies, and payroll sync before expanding.",
  
  // Verification Checks
  verificationChecks: [
    "Test clock-in records punch with correct time",
    "Geofence validation passes when inside boundary",
    "Geofence validation fails when outside boundary",
    "Grace period correctly handles late arrivals",
    "Rounding applies as configured",
    "Attendance exception triggers for missed punch",
    "Manager can view team attendance dashboard",
    "Timesheet shows aggregated hours correctly",
  ],
  
  // Integration Checklist
  integrationChecklist: [
    { id: "hris", label: "Employee records synced from Workforce", required: true },
    { id: "locations", label: "Work locations imported with GPS coordinates", required: true },
    { id: "payroll", label: "Pay periods aligned with Payroll module", required: true },
    { id: "mobile", label: "Mobile app deployed to test users", required: true },
    { id: "biometric", label: "Biometric devices configured (if applicable)", required: false },
    { id: "notifications", label: "Email/push notifications for exceptions enabled", required: false },
  ],
  
  // Success Metrics
  successMetrics: [
    { metric: "First Successful Clock-In", target: "Within 1 hour of setup", howToMeasure: "Time Records page" },
    { metric: "Punch Accuracy Rate", target: "98%+", howToMeasure: "Exceptions Dashboard" },
    { metric: "Exception Rate", target: "< 5% of punches", howToMeasure: "Attendance Exceptions report" },
    { metric: "Mobile Adoption", target: "> 80% of employees", howToMeasure: "Clock Method breakdown report" },
  ],
  
  // Next Steps
  nextSteps: [
    {
      label: "Configure Advanced Shift Patterns",
      href: "/time-attendance/shifts/rotations",
      icon: Calendar,
    },
    {
      label: "Set Up Geofencing for All Locations",
      href: "/time-attendance/geofencing",
      icon: MapPin,
    },
    {
      label: "Enable Face Verification",
      href: "/time-attendance/face-verification",
      icon: Smartphone,
    },
    {
      label: "View Full T&A Documentation",
      href: "/enablement/modules/time-attendance",
      icon: FolderTree,
    },
  ],
};
