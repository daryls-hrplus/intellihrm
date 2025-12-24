// Tour Target Registry - CSS selector mappings for all modules
// Used for AI tour generation to target specific UI elements

export interface TourTarget {
  selector: string;
  description: string;
  commonPlacements: ("top" | "bottom" | "left" | "right")[];
}

export interface ModuleTourTargets {
  [elementKey: string]: TourTarget;
}

export interface TourTargetRegistry {
  [moduleCode: string]: ModuleTourTargets;
}

export const TOUR_TARGET_REGISTRY: TourTargetRegistry = {
  // ===== WORKFORCE MODULE =====
  workforce: {
    stats_cards: {
      selector: '[data-tour="workforce-stats"]',
      description: "Main statistics cards showing employee counts",
      commonPlacements: ["bottom"],
    },
    module_cards: {
      selector: '[data-tour="workforce-modules"]',
      description: "Module navigation cards",
      commonPlacements: ["top", "bottom"],
    },
    employee_search: {
      selector: '[data-tour="employee-search"]',
      description: "Employee search input",
      commonPlacements: ["bottom"],
    },
    employee_table: {
      selector: '[data-tour="employee-table"]',
      description: "Employee data table",
      commonPlacements: ["top"],
    },
    add_employee_btn: {
      selector: '[data-tour="add-employee-btn"]',
      description: "Add new employee button",
      commonPlacements: ["left", "bottom"],
    },
    org_chart_canvas: {
      selector: '[data-tour="org-chart-canvas"]',
      description: "Organization chart visualization",
      commonPlacements: ["top", "bottom"],
    },
    position_tree: {
      selector: '[data-tour="position-tree"]',
      description: "Position hierarchy tree",
      commonPlacements: ["right"],
    },
    department_list: {
      selector: '[data-tour="department-list"]',
      description: "Department listing",
      commonPlacements: ["right"],
    },
  },

  // ===== LEAVE MODULE =====
  leave: {
    balance_cards: {
      selector: '[data-tour="leave-balance"]',
      description: "Leave balance summary cards",
      commonPlacements: ["bottom"],
    },
    submit_request: {
      selector: '[data-tour="submit-request"]',
      description: "Submit leave request button",
      commonPlacements: ["left", "bottom"],
    },
    leave_calendar: {
      selector: '[data-tour="leave-calendar"]',
      description: "Team leave calendar view",
      commonPlacements: ["top"],
    },
    request_form: {
      selector: '[data-tour="request-form"]',
      description: "Leave request form",
      commonPlacements: ["right"],
    },
    approval_queue: {
      selector: '[data-tour="approval-queue"]',
      description: "Pending approvals list",
      commonPlacements: ["top"],
    },
    leave_types: {
      selector: '[data-tour="leave-types"]',
      description: "Leave type configuration",
      commonPlacements: ["right"],
    },
  },

  // ===== PAYROLL MODULE =====
  payroll: {
    pay_period_selector: {
      selector: '[data-tour="pay-period-selector"]',
      description: "Pay period selection",
      commonPlacements: ["bottom"],
    },
    run_payroll_btn: {
      selector: '[data-tour="run-payroll"]',
      description: "Run payroll button",
      commonPlacements: ["left"],
    },
    payroll_summary: {
      selector: '[data-tour="payroll-summary"]',
      description: "Payroll run summary cards",
      commonPlacements: ["bottom"],
    },
    employee_payslips: {
      selector: '[data-tour="employee-payslips"]',
      description: "Employee payslips table",
      commonPlacements: ["top"],
    },
    deductions_panel: {
      selector: '[data-tour="deductions-panel"]',
      description: "Deductions configuration",
      commonPlacements: ["right"],
    },
    tax_config: {
      selector: '[data-tour="tax-config"]',
      description: "Tax configuration section",
      commonPlacements: ["right"],
    },
  },

  // ===== PERFORMANCE MODULE =====
  performance: {
    cycle_selector: {
      selector: '[data-tour="cycle-selector"]',
      description: "Appraisal cycle selection",
      commonPlacements: ["bottom"],
    },
    evaluation_form: {
      selector: '[data-tour="evaluation-form"]',
      description: "Performance evaluation form",
      commonPlacements: ["right"],
    },
    rating_scale: {
      selector: '[data-tour="rating-scale"]',
      description: "Rating scale indicators",
      commonPlacements: ["left"],
    },
    goals_list: {
      selector: '[data-tour="goals-list"]',
      description: "Employee goals listing",
      commonPlacements: ["top"],
    },
    feedback_panel: {
      selector: '[data-tour="feedback-panel"]',
      description: "Feedback submission panel",
      commonPlacements: ["right"],
    },
    nine_box: {
      selector: '[data-tour="nine-box"]',
      description: "9-box talent matrix",
      commonPlacements: ["top", "bottom"],
    },
  },

  // ===== RECRUITMENT MODULE =====
  recruitment: {
    requisition_list: {
      selector: '[data-tour="requisition-list"]',
      description: "Job requisitions listing",
      commonPlacements: ["right"],
    },
    create_requisition: {
      selector: '[data-tour="create-requisition"]',
      description: "Create new requisition button",
      commonPlacements: ["left"],
    },
    candidate_pipeline: {
      selector: '[data-tour="candidate-pipeline"]',
      description: "Candidate pipeline board",
      commonPlacements: ["top"],
    },
    applicant_card: {
      selector: '[data-tour="applicant-card"]',
      description: "Applicant information card",
      commonPlacements: ["right"],
    },
    interview_scheduler: {
      selector: '[data-tour="interview-scheduler"]',
      description: "Interview scheduling panel",
      commonPlacements: ["left"],
    },
    offer_form: {
      selector: '[data-tour="offer-form"]',
      description: "Offer letter generation",
      commonPlacements: ["right"],
    },
  },

  // ===== TIME & ATTENDANCE MODULE =====
  time_attendance: {
    clock_button: {
      selector: '[data-tour="clock-button"]',
      description: "Clock in/out button",
      commonPlacements: ["bottom"],
    },
    time_entries: {
      selector: '[data-tour="time-entries"]',
      description: "Time entries table",
      commonPlacements: ["top"],
    },
    schedule_grid: {
      selector: '[data-tour="schedule-grid"]',
      description: "Work schedule grid",
      commonPlacements: ["top"],
    },
    exception_alerts: {
      selector: '[data-tour="exception-alerts"]',
      description: "Attendance exceptions",
      commonPlacements: ["right"],
    },
    overtime_tracker: {
      selector: '[data-tour="overtime-tracker"]',
      description: "Overtime tracking panel",
      commonPlacements: ["left"],
    },
  },

  // ===== TRAINING MODULE =====
  training: {
    course_catalog: {
      selector: '[data-tour="course-catalog"]',
      description: "Course catalog grid",
      commonPlacements: ["top"],
    },
    enroll_button: {
      selector: '[data-tour="enroll-button"]',
      description: "Course enrollment button",
      commonPlacements: ["left"],
    },
    learning_path: {
      selector: '[data-tour="learning-path"]',
      description: "Learning path progress",
      commonPlacements: ["right"],
    },
    certification_status: {
      selector: '[data-tour="certification-status"]',
      description: "Certification status cards",
      commonPlacements: ["bottom"],
    },
    training_calendar: {
      selector: '[data-tour="training-calendar"]',
      description: "Training session calendar",
      commonPlacements: ["top"],
    },
  },

  // ===== BENEFITS MODULE =====
  benefits: {
    plan_cards: {
      selector: '[data-tour="plan-cards"]',
      description: "Available benefit plans",
      commonPlacements: ["bottom"],
    },
    enrollment_wizard: {
      selector: '[data-tour="enrollment-wizard"]',
      description: "Enrollment wizard steps",
      commonPlacements: ["right"],
    },
    dependent_list: {
      selector: '[data-tour="dependent-list"]',
      description: "Dependents listing",
      commonPlacements: ["top"],
    },
    claims_history: {
      selector: '[data-tour="claims-history"]',
      description: "Claims history table",
      commonPlacements: ["top"],
    },
  },

  // ===== COMPENSATION MODULE =====
  compensation: {
    salary_bands: {
      selector: '[data-tour="salary-bands"]',
      description: "Salary band visualization",
      commonPlacements: ["top"],
    },
    compa_ratio: {
      selector: '[data-tour="compa-ratio"]',
      description: "Compa-ratio indicators",
      commonPlacements: ["right"],
    },
    salary_planning: {
      selector: '[data-tour="salary-planning"]',
      description: "Salary planning grid",
      commonPlacements: ["top"],
    },
    budget_tracker: {
      selector: '[data-tour="budget-tracker"]',
      description: "Compensation budget tracker",
      commonPlacements: ["bottom"],
    },
  },

  // ===== SUCCESSION MODULE =====
  succession: {
    talent_pool: {
      selector: '[data-tour="talent-pool"]',
      description: "Talent pool visualization",
      commonPlacements: ["top"],
    },
    succession_plan: {
      selector: '[data-tour="succession-plan"]',
      description: "Succession plan details",
      commonPlacements: ["right"],
    },
    readiness_matrix: {
      selector: '[data-tour="readiness-matrix"]',
      description: "Successor readiness matrix",
      commonPlacements: ["top"],
    },
    development_plan: {
      selector: '[data-tour="development-plan"]',
      description: "Development plan actions",
      commonPlacements: ["right"],
    },
  },

  // ===== EMPLOYEE RELATIONS MODULE =====
  employee_relations: {
    grievance_form: {
      selector: '[data-tour="grievance-form"]',
      description: "Grievance submission form",
      commonPlacements: ["right"],
    },
    case_list: {
      selector: '[data-tour="case-list"]',
      description: "Cases listing table",
      commonPlacements: ["top"],
    },
    investigation_panel: {
      selector: '[data-tour="investigation-panel"]',
      description: "Investigation details",
      commonPlacements: ["right"],
    },
  },

  // ===== HSE MODULE =====
  hse: {
    incident_form: {
      selector: '[data-tour="incident-form"]',
      description: "Incident report form",
      commonPlacements: ["right"],
    },
    safety_dashboard: {
      selector: '[data-tour="safety-dashboard"]',
      description: "Safety metrics dashboard",
      commonPlacements: ["top"],
    },
    hazard_register: {
      selector: '[data-tour="hazard-register"]',
      description: "Hazard register table",
      commonPlacements: ["top"],
    },
  },

  // ===== ADMIN MODULE =====
  admin: {
    user_management: {
      selector: '[data-tour="user-management"]',
      description: "User management table",
      commonPlacements: ["top"],
    },
    role_editor: {
      selector: '[data-tour="role-editor"]',
      description: "Role permissions editor",
      commonPlacements: ["right"],
    },
    company_settings: {
      selector: '[data-tour="company-settings"]',
      description: "Company settings form",
      commonPlacements: ["right"],
    },
    audit_log: {
      selector: '[data-tour="audit-log"]',
      description: "Audit log viewer",
      commonPlacements: ["top"],
    },
  },

  // ===== DASHBOARD MODULE =====
  dashboard: {
    kpi_cards: {
      selector: '[data-tour="kpi-cards"]',
      description: "Key performance indicators",
      commonPlacements: ["bottom"],
    },
    quick_actions: {
      selector: '[data-tour="quick-actions"]',
      description: "Quick action buttons",
      commonPlacements: ["bottom"],
    },
    notifications: {
      selector: '[data-tour="notifications"]',
      description: "Notifications panel",
      commonPlacements: ["left"],
    },
    announcements: {
      selector: '[data-tour="announcements"]',
      description: "Company announcements",
      commonPlacements: ["top"],
    },
  },
};

/**
 * Get tour targets for a specific module
 */
export function getModuleTourTargets(moduleCode: string): ModuleTourTargets | undefined {
  return TOUR_TARGET_REGISTRY[moduleCode];
}

/**
 * Get all selectors for a module as an array
 */
export function getModuleSelectors(moduleCode: string): string[] {
  const targets = TOUR_TARGET_REGISTRY[moduleCode];
  if (!targets) return [];
  return Object.values(targets).map((t) => t.selector);
}

/**
 * Get selector descriptions for AI prompting
 */
export function getModuleSelectorDescriptions(moduleCode: string): string {
  const targets = TOUR_TARGET_REGISTRY[moduleCode];
  if (!targets) return "";
  return Object.entries(targets)
    .map(([key, target]) => `${target.selector} - ${target.description}`)
    .join("\n");
}

/**
 * Check if a selector matches the registry pattern
 */
export function isValidTourSelector(selector: string): boolean {
  // Check if it's a data-tour attribute selector
  if (selector.match(/\[data-tour="[^"]+"\]/)) return true;
  // Check if it's a semantic selector
  if (selector.match(/^(h[1-6]|button|input|table|\[role=".+"\]|\.[\w-]+)/)) return true;
  return false;
}
