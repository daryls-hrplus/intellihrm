// Platform Capabilities Registry - Intelli HRM Differentiators
// Decision-maker focused terminology for competitive positioning

export type CapabilityCategory = 
  | 'talent-intelligence'      // AI-powered talent decisions
  | 'workforce-analytics'      // Dynamic BI and reporting
  | 'process-automation'       // Intelligent workflow automation
  | 'compliance-governance'    // Regulatory compliance and audit
  | 'employee-experience'      // Self-service and engagement
  | 'global-operations';       // Multi-entity, multi-country

export type CapabilityTag = 
  | 'ai-powered'               // Uses AI/ML for predictions or recommendations
  | 'predictive-analytics'     // Forecasts future outcomes
  | 'prescriptive-guidance'    // Recommends specific actions
  | 'generative-ai'            // Creates content (reports, documentation)
  | 'dynamic-dashboards'       // Self-service BI and visualization
  | 'intelligent-automation'   // Auto-processes based on rules/AI
  | 'workflow-orchestration'   // Multi-step approval routing
  | 'real-time-processing'     // Immediate data updates
  | 'compliance-tracking'      // Regulatory requirement monitoring
  | 'audit-ready'              // Full audit trail with exports
  | 'self-service'             // Employee/Manager portals
  | 'mobile-enabled'           // Mobile-responsive design
  | 'multi-company'            // Cross-entity operations
  | 'temporal-tracking'        // Point-in-time historical views
  | 'cross-module';            // Integrates multiple HR domains

export interface AIFeatureDetail {
  type: 'predictive' | 'prescriptive' | 'generative' | 'automation' | 'conversational';
  name: string;
  businessValue: string;  // HR-friendly value statement
}

export interface PlatformCapability {
  code: string;
  name: string;
  category: CapabilityCategory;
  description: string;
  icon: string;
  businessValue: string;           // Why executives care
  competitorGap: string;           // How this compares to legacy HRIS
  keyFeatures: string[];           // Feature codes with this capability
  industryImpact: string;          // Quantifiable benefit claim
}

// ===== PLATFORM CAPABILITIES REGISTRY =====
export const PLATFORM_CAPABILITIES: PlatformCapability[] = [
  // TALENT INTELLIGENCE
  {
    code: 'ai_workforce_planning',
    name: 'AI-Powered Workforce Planning',
    category: 'talent-intelligence',
    description: 'Predict future workforce needs with Monte Carlo simulation, scenario modeling, and what-if analysis',
    icon: 'Brain',
    businessValue: 'Make proactive talent decisions based on data-driven forecasts, not reactive hiring',
    competitorGap: 'Built-in predictive analytics vs. separate add-on tools in legacy systems',
    keyFeatures: ['forecasting', 'succession_plans', 'flight_risk'],
    industryImpact: 'Organizations using AI workforce planning reduce time-to-fill by 35%'
  },
  {
    code: 'ai_talent_assessment',
    name: 'Intelligent Talent Assessment',
    category: 'talent-intelligence',
    description: 'AI-calibrated 9-Box Grid placement, succession readiness scoring, and leadership pipeline analysis',
    icon: 'Target',
    businessValue: 'Identify high-potential talent and leadership gaps before they impact business continuity',
    competitorGap: 'Automated calibration vs. manual talent reviews in traditional systems',
    keyFeatures: ['nine_box', 'talent_pools', 'bench_strength', 'succession_plans'],
    industryImpact: 'Companies with AI talent assessment see 40% improvement in internal promotion success rates'
  },
  {
    code: 'ai_recruitment',
    name: 'Intelligent Candidate Matching',
    category: 'talent-intelligence',
    description: 'AI-powered candidate screening, bias-aware matching, and quality-of-hire predictions',
    icon: 'UserSearch',
    businessValue: 'Hire better candidates faster while reducing unconscious bias in selection',
    competitorGap: 'Native AI matching vs. third-party ATS integration required',
    keyFeatures: ['applications', 'candidate_pipeline', 'assessments'],
    industryImpact: 'AI recruitment reduces time-to-hire by 50% and improves quality-of-hire scores by 25%'
  },
  {
    code: 'ai_performance_insights',
    name: 'Continuous Performance Intelligence',
    category: 'talent-intelligence',
    description: 'Real-time performance sensing, coaching prompts for managers, and development recommendations',
    icon: 'TrendingUp',
    businessValue: 'Transform annual reviews into continuous feedback with AI-guided manager coaching',
    competitorGap: 'Proactive coaching prompts vs. static review forms in legacy systems',
    keyFeatures: ['appraisal_cycles', 'feedback_360', 'individual_goals'],
    industryImpact: 'Continuous performance management increases employee engagement by 30%'
  },
  {
    code: 'ai_hr_assistant',
    name: 'AI HR Assistant (Conversational HR)',
    category: 'talent-intelligence',
    description: 'Policy-aware chatbot with company SOP integration, escalation protocols, and role-based responses',
    icon: 'MessageSquare',
    businessValue: 'Reduce HR ticket volume by 40% with intelligent self-service that knows your policies',
    competitorGap: 'Company policy-aware vs. generic HR chatbots that give incorrect answers',
    keyFeatures: ['ess_dashboard', 'mss_dashboard', 'hr_hub'],
    industryImpact: 'AI HR assistants handle 60% of routine inquiries without human intervention'
  },

  // WORKFORCE ANALYTICS
  {
    code: 'dynamic_bi',
    name: 'Dynamic Business Intelligence',
    category: 'workforce-analytics',
    description: 'Self-service dashboard creation, drag-and-drop widgets, and AI-generated analytics insights',
    icon: 'BarChart3',
    businessValue: 'Create executive-ready HR analytics in minutes without IT dependency',
    competitorGap: 'Built-in BI builder vs. separate reporting licenses required (SAP, Oracle)',
    keyFeatures: ['analytics', 'leave_analytics', 'payroll_analytics', 'hse_analytics'],
    industryImpact: 'Self-service analytics reduces report generation time by 80%'
  },
  {
    code: 'ai_report_writer',
    name: 'AI Report Generation',
    category: 'workforce-analytics',
    description: 'Natural language report creation, automated narrative generation, and smart data visualization',
    icon: 'FileText',
    businessValue: 'Transform complex HR data into board-ready reports with AI-generated insights',
    competitorGap: 'Generative AI reports vs. manual report building in traditional systems',
    keyFeatures: ['ai_reports', 'workforce_reports', 'payroll_reports'],
    industryImpact: 'AI-generated reports save 10+ hours per week for HR analysts'
  },
  {
    code: 'point_in_time_analytics',
    name: 'Historical Point-in-Time Analysis',
    category: 'workforce-analytics',
    description: 'View organizational structure, headcount, and compensation as of any date in history',
    icon: 'Clock',
    businessValue: 'Answer "what did we look like on X date" questions instantly for audits and analysis',
    competitorGap: 'Native temporal queries vs. data warehouse exports required',
    keyFeatures: ['org_structure', 'org_changes', 'analytics'],
    industryImpact: 'Point-in-time capability eliminates 90% of ad-hoc data requests for historical analysis'
  },

  // PROCESS AUTOMATION
  {
    code: 'workflow_engine',
    name: 'Configurable Workflow Engine',
    category: 'process-automation',
    description: 'Multi-step approvals, escalation rules, delegation, digital signatures, and auto-termination',
    icon: 'GitBranch',
    businessValue: 'Automate any HR approval process with configurable routing and SLA enforcement',
    competitorGap: 'No-code workflow builder vs. IT-dependent customization',
    keyFeatures: ['workflow_templates', 'workflow_instances', 'approval_delegations'],
    industryImpact: 'Workflow automation reduces approval cycle times by 60%'
  },
  {
    code: 'ai_payroll',
    name: 'Intelligent Payroll Processing',
    category: 'process-automation',
    description: 'AI-powered anomaly detection, tax bracket extraction, bank file generation, and pre-payroll validation',
    icon: 'Wallet',
    businessValue: 'Reduce payroll errors to near-zero with AI validation and compliance checks',
    competitorGap: 'Proactive error detection vs. post-processing corrections in legacy systems',
    keyFeatures: ['processing', 'tax_config', 'bank_files'],
    industryImpact: 'AI payroll validation reduces payroll errors by 95%'
  },
  {
    code: 'overnight_processing',
    name: 'Automated Overnight Processing',
    category: 'process-automation',
    description: 'Scheduled leave accruals, benefit calculations, compliance checks, and notification dispatching',
    icon: 'Moon',
    businessValue: 'Set-and-forget automation that keeps HR data current without manual intervention',
    competitorGap: 'Native scheduling vs. external job schedulers required',
    keyFeatures: ['leave_scheduling', 'benefit_auto_enrollment', 'reminders'],
    industryImpact: 'Automated processing eliminates 20+ hours of manual HR administration weekly'
  },
  {
    code: 'smart_reminders',
    name: 'Intelligent Reminder System',
    category: 'process-automation',
    description: 'Auto-detected reminders for expirations, compliance deadlines, and employee milestones',
    icon: 'Bell',
    businessValue: 'Never miss critical HR deadlines with proactive alerts for certifications, contracts, and milestones',
    competitorGap: 'Auto-generated reminders vs. manual calendar management',
    keyFeatures: ['reminders', 'qualifications', 'contracts'],
    industryImpact: 'Automated reminders reduce compliance violations by 75%'
  },

  // COMPLIANCE & GOVERNANCE
  {
    code: 'compliance_intelligence',
    name: 'Compliance Intelligence',
    category: 'compliance-governance',
    description: 'Multi-country labor law compliance, regulatory tracking, and policy enforcement',
    icon: 'Shield',
    businessValue: 'Stay compliant across Caribbean, Africa, and global operations with built-in regional expertise',
    competitorGap: 'Regional compliance built-in vs. localization add-ons',
    keyFeatures: ['compliance_management', 'statutory_types', 'policies'],
    industryImpact: 'Built-in compliance reduces regulatory penalty risk by 90%'
  },
  {
    code: 'audit_trail',
    name: 'Enterprise Audit Trail',
    category: 'compliance-governance',
    description: 'Complete change history, data access logging, PII tracking, and exportable audit reports',
    icon: 'FileSearch',
    businessValue: 'Pass any audit with comprehensive who-did-what-when tracking across all HR data',
    competitorGap: 'Native audit logging vs. third-party audit tools',
    keyFeatures: ['audit_logs', 'pii_access', 'access_control'],
    industryImpact: 'Complete audit trails reduce audit preparation time by 70%'
  },
  {
    code: 'policy_rag',
    name: 'Policy-Aware AI (RAG)',
    category: 'compliance-governance',
    description: 'AI responses enriched with company policies, SOPs, and regulatory requirements',
    icon: 'BookOpen',
    businessValue: 'Ensure every AI response aligns with your company policies and local regulations',
    competitorGap: 'Policy-trained AI vs. generic responses',
    keyFeatures: ['policy_documents', 'ai_assistant', 'help_center'],
    industryImpact: 'Policy-aware AI ensures 99% policy-compliant responses'
  },

  // EMPLOYEE EXPERIENCE
  {
    code: 'self_service_portals',
    name: 'Employee & Manager Self-Service',
    category: 'employee-experience',
    description: 'Comprehensive ESS/MSS portals with leave requests, payslips, team management, and approvals',
    icon: 'Users',
    businessValue: 'Empower employees and managers with 24/7 access to HR services',
    competitorGap: 'Full-featured portals vs. limited self-service in basic systems',
    keyFeatures: ['ess_dashboard', 'mss_dashboard', 'my_leave', 'my_payslips'],
    industryImpact: 'Self-service reduces HR administrative workload by 50%'
  },
  {
    code: 'structured_onboarding',
    name: 'Structured Onboarding & Offboarding',
    category: 'employee-experience',
    description: 'Template-based onboarding with task tracking, buddy assignment, and completion analytics',
    icon: 'Rocket',
    businessValue: 'Accelerate new hire productivity with consistent, trackable onboarding experiences',
    competitorGap: 'Native workflow tracking vs. checklist documents',
    keyFeatures: ['onboarding', 'offboarding', 'onboarding_templates'],
    industryImpact: 'Structured onboarding improves new hire retention by 25%'
  },
  {
    code: 'career_development',
    name: 'Career Development & Learning Paths',
    category: 'employee-experience',
    description: 'Individual development plans, career paths, mentorship matching, and learning integration',
    icon: 'GraduationCap',
    businessValue: 'Retain top talent by showing clear career progression and development opportunities',
    competitorGap: 'Integrated career planning vs. separate LMS systems',
    keyFeatures: ['career_paths', 'idps', 'mentorship', 'training_catalog'],
    industryImpact: 'Career development programs increase employee retention by 34%'
  },

  // GLOBAL OPERATIONS
  {
    code: 'multi_entity',
    name: 'Multi-Company Operations',
    category: 'global-operations',
    description: 'Manage multiple companies, divisions, and subsidiaries with consolidated reporting',
    icon: 'Building2',
    businessValue: 'Operate as one HR function across multiple legal entities with unified analytics',
    competitorGap: 'Native multi-entity vs. separate instances per company',
    keyFeatures: ['company_groups', 'companies', 'divisions'],
    industryImpact: 'Multi-entity support reduces HR admin overhead by 40% for holding companies'
  },
  {
    code: 'regional_payroll',
    name: 'Caribbean & Africa Payroll',
    category: 'global-operations',
    description: 'Pre-configured statutory deductions, tax tables, and labor law compliance for regional markets',
    icon: 'Globe',
    businessValue: 'Process payroll in Caribbean and African markets without localization projects',
    competitorGap: 'Regional expertise built-in vs. expensive localization implementations',
    keyFeatures: ['statutory_types', 'tax_config', 'bank_files'],
    industryImpact: 'Regional payroll support eliminates 6-12 month localization timelines'
  },
  {
    code: 'multi_language',
    name: 'Multi-Language Support',
    category: 'global-operations',
    description: 'Full interface translation for English, Spanish, French, and Arabic with RTL support',
    icon: 'Languages',
    businessValue: 'Deploy globally with native language experiences for all employee populations',
    competitorGap: 'Built-in translations vs. translation add-ons',
    keyFeatures: ['i18n', 'language_settings', 'translations'],
    industryImpact: 'Multi-language support increases employee adoption by 45%'
  }
];

// ===== CAPABILITY TAGS FOR FEATURES =====
// Map features to their capability tags for filtering and display
export interface FeatureCapabilities {
  featureCode: string;
  capabilities: CapabilityTag[];
  aiFeatures?: AIFeatureDetail[];
  decisionMakerValue?: string;
  differentiatorLevel: 'standard' | 'advanced' | 'unique';
}

export const FEATURE_CAPABILITIES: FeatureCapabilities[] = [
  // WORKFORCE AI FEATURES
  {
    featureCode: 'forecasting',
    capabilities: ['ai-powered', 'predictive-analytics', 'dynamic-dashboards'],
    aiFeatures: [
      { type: 'predictive', name: 'Monte Carlo Simulation', businessValue: 'Model workforce scenarios with statistical confidence intervals' },
      { type: 'predictive', name: 'What-If Analysis', businessValue: 'Test hiring and attrition assumptions before committing resources' },
      { type: 'predictive', name: 'Sensitivity Analysis', businessValue: 'Identify which factors most impact workforce outcomes' }
    ],
    decisionMakerValue: 'Predict future workforce needs with data-driven scenarios, reducing reactive hiring',
    differentiatorLevel: 'unique'
  },
  {
    featureCode: 'org_structure',
    capabilities: ['temporal-tracking', 'dynamic-dashboards', 'multi-company'],
    decisionMakerValue: 'View your organization as it existed on any date for audits and analysis',
    differentiatorLevel: 'advanced'
  },
  {
    featureCode: 'analytics',
    capabilities: ['dynamic-dashboards', 'real-time-processing', 'multi-company'],
    aiFeatures: [
      { type: 'generative', name: 'AI Dashboard Builder', businessValue: 'Create custom analytics without technical skills' }
    ],
    decisionMakerValue: 'Build executive dashboards in minutes, not weeks',
    differentiatorLevel: 'advanced'
  },
  
  // PAYROLL AI FEATURES
  {
    featureCode: 'processing',
    capabilities: ['intelligent-automation', 'workflow-orchestration', 'audit-ready'],
    aiFeatures: [
      { type: 'automation', name: 'Anomaly Detection', businessValue: 'Catch payroll errors before they reach employees' },
      { type: 'automation', name: 'Pre-Payroll Validation', businessValue: 'Validate all data before calculation begins' }
    ],
    decisionMakerValue: 'Reduce payroll errors to near-zero with AI-powered validation',
    differentiatorLevel: 'unique'
  },
  {
    featureCode: 'tax_config',
    capabilities: ['ai-powered', 'compliance-tracking', 'multi-company'],
    aiFeatures: [
      { type: 'generative', name: 'AI Tax Bracket Extraction', businessValue: 'Upload tax documents and auto-configure brackets' }
    ],
    decisionMakerValue: 'Configure complex tax rules in minutes by uploading government documents',
    differentiatorLevel: 'unique'
  },
  {
    featureCode: 'bank_files',
    capabilities: ['ai-powered', 'intelligent-automation'],
    aiFeatures: [
      { type: 'generative', name: 'AI Bank File Builder', businessValue: 'Auto-configure bank file formats from specification documents' }
    ],
    decisionMakerValue: 'Set up any bank file format without manual mapping',
    differentiatorLevel: 'unique'
  },

  // SUCCESSION PLANNING AI FEATURES
  {
    featureCode: 'nine_box',
    capabilities: ['ai-powered', 'predictive-analytics', 'dynamic-dashboards'],
    aiFeatures: [
      { type: 'prescriptive', name: 'AI Calibration Suggestions', businessValue: 'Reduce bias in talent ratings with AI-guided calibration' }
    ],
    decisionMakerValue: 'Objectively assess talent potential with AI-assisted calibration',
    differentiatorLevel: 'advanced'
  },
  {
    featureCode: 'succession_plans',
    capabilities: ['predictive-analytics', 'workflow-orchestration', 'cross-module'],
    aiFeatures: [
      { type: 'predictive', name: 'Readiness Scoring', businessValue: 'Predict when successors will be ready for promotion' }
    ],
    decisionMakerValue: 'Ensure business continuity with data-driven succession readiness',
    differentiatorLevel: 'advanced'
  },
  {
    featureCode: 'flight_risk',
    capabilities: ['ai-powered', 'predictive-analytics'],
    aiFeatures: [
      { type: 'predictive', name: 'Attrition Risk Prediction', businessValue: 'Identify at-risk employees before they resign' }
    ],
    decisionMakerValue: 'Retain key talent by identifying flight risks early',
    differentiatorLevel: 'unique'
  },
  {
    featureCode: 'bench_strength',
    capabilities: ['predictive-analytics', 'dynamic-dashboards', 'cross-module'],
    decisionMakerValue: 'Visualize talent pipeline depth for critical roles',
    differentiatorLevel: 'advanced'
  },

  // LEAVE MANAGEMENT
  {
    featureCode: 'apply',
    capabilities: ['self-service', 'workflow-orchestration', 'real-time-processing'],
    decisionMakerValue: 'Employees submit leave requests with real-time balance visibility',
    differentiatorLevel: 'standard'
  },
  {
    featureCode: 'approvals',
    capabilities: ['workflow-orchestration', 'intelligent-automation'],
    aiFeatures: [
      { type: 'automation', name: 'Overlap Detection', businessValue: 'Alert managers to team coverage gaps automatically' }
    ],
    decisionMakerValue: 'Approve leave with full team coverage visibility',
    differentiatorLevel: 'advanced'
  },
  {
    featureCode: 'leave_analytics',
    capabilities: ['dynamic-dashboards', 'predictive-analytics', 'multi-company'],
    decisionMakerValue: 'Identify leave patterns and predict peak absence periods',
    differentiatorLevel: 'advanced'
  },

  // PERFORMANCE MANAGEMENT
  {
    featureCode: 'appraisal_cycles',
    capabilities: ['workflow-orchestration', 'cross-module', 'audit-ready'],
    aiFeatures: [
      { type: 'prescriptive', name: 'Manager Coaching Prompts', businessValue: 'Guide managers with AI-suggested feedback approaches' }
    ],
    decisionMakerValue: 'Transform annual reviews into development conversations',
    differentiatorLevel: 'advanced'
  },
  {
    featureCode: 'feedback_360',
    capabilities: ['workflow-orchestration', 'audit-ready'],
    decisionMakerValue: 'Gather multi-source feedback with full anonymity protection',
    differentiatorLevel: 'standard'
  },

  // RECRUITMENT
  {
    featureCode: 'applications',
    capabilities: ['ai-powered', 'workflow-orchestration'],
    aiFeatures: [
      { type: 'predictive', name: 'AI Candidate Matching', businessValue: 'Rank candidates based on job fit and success prediction' },
      { type: 'automation', name: 'Bias Detection', businessValue: 'Flag potentially biased selection patterns' }
    ],
    decisionMakerValue: 'Hire better candidates faster with AI-powered screening',
    differentiatorLevel: 'unique'
  },

  // TRAINING
  {
    featureCode: 'training_catalog',
    capabilities: ['self-service', 'cross-module', 'compliance-tracking'],
    decisionMakerValue: 'Centralize all learning resources with compliance tracking',
    differentiatorLevel: 'standard'
  },
  {
    featureCode: 'training_analytics',
    capabilities: ['dynamic-dashboards', 'compliance-tracking'],
    decisionMakerValue: 'Track training completion and compliance gaps',
    differentiatorLevel: 'standard'
  },

  // BENEFITS
  {
    featureCode: 'benefit_plans',
    capabilities: ['multi-company', 'workflow-orchestration'],
    decisionMakerValue: 'Manage diverse benefit programs across multiple entities',
    differentiatorLevel: 'standard'
  },
  {
    featureCode: 'benefit_enrollment',
    capabilities: ['self-service', 'intelligent-automation'],
    aiFeatures: [
      { type: 'automation', name: 'Auto-Enrollment Rules', businessValue: 'Automatically enroll eligible employees based on criteria' }
    ],
    decisionMakerValue: 'Reduce enrollment errors with rule-based automation',
    differentiatorLevel: 'advanced'
  },

  // HSE
  {
    featureCode: 'incident_management',
    capabilities: ['workflow-orchestration', 'compliance-tracking', 'audit-ready'],
    decisionMakerValue: 'Track incidents from report to resolution with full compliance',
    differentiatorLevel: 'standard'
  },
  {
    featureCode: 'hse_compliance',
    capabilities: ['compliance-tracking', 'intelligent-automation', 'audit-ready'],
    decisionMakerValue: 'Stay ahead of safety regulations with proactive tracking',
    differentiatorLevel: 'advanced'
  },

  // EMPLOYEE RELATIONS
  {
    featureCode: 'case_management',
    capabilities: ['workflow-orchestration', 'audit-ready', 'compliance-tracking'],
    decisionMakerValue: 'Handle sensitive cases with full documentation and confidentiality',
    differentiatorLevel: 'standard'
  },
  {
    featureCode: 'recognition_programs',
    capabilities: ['self-service', 'cross-module'],
    decisionMakerValue: 'Foster engagement with peer-to-peer recognition',
    differentiatorLevel: 'standard'
  },

  // TIME & ATTENDANCE
  {
    featureCode: 'time_clock',
    capabilities: ['real-time-processing', 'mobile-enabled', 'intelligent-automation'],
    aiFeatures: [
      { type: 'automation', name: 'Geofence Validation', businessValue: 'Ensure clock-ins only from approved locations' },
      { type: 'automation', name: 'Face Recognition', businessValue: 'Verify employee identity during clock-in' }
    ],
    decisionMakerValue: 'Eliminate time theft with location and biometric verification',
    differentiatorLevel: 'advanced'
  },
  {
    featureCode: 'attendance_analytics',
    capabilities: ['dynamic-dashboards', 'predictive-analytics'],
    aiFeatures: [
      { type: 'predictive', name: 'Burnout Indicators', businessValue: 'Identify employees at risk of burnout from attendance patterns' }
    ],
    decisionMakerValue: 'Protect workforce wellbeing with early warning indicators',
    differentiatorLevel: 'unique'
  },

  // COMPENSATION
  {
    featureCode: 'position_compensation',
    capabilities: ['multi-company', 'audit-ready', 'temporal-tracking'],
    decisionMakerValue: 'Configure position-based pay with full history tracking',
    differentiatorLevel: 'standard'
  },
  {
    featureCode: 'employee_compensation',
    capabilities: ['audit-ready', 'temporal-tracking', 'workflow-orchestration'],
    decisionMakerValue: 'Manage individual pay with approval workflows and audit trails',
    differentiatorLevel: 'standard'
  },

  // WORKFLOW SYSTEM
  {
    featureCode: 'workflow_templates',
    capabilities: ['workflow-orchestration', 'intelligent-automation', 'compliance-tracking'],
    decisionMakerValue: 'Configure any approval process without IT involvement',
    differentiatorLevel: 'advanced'
  },

  // SELF-SERVICE PORTALS
  {
    featureCode: 'ess_dashboard',
    capabilities: ['self-service', 'ai-powered', 'mobile-enabled'],
    aiFeatures: [
      { type: 'conversational', name: 'AI HR Assistant', businessValue: 'Answer employee questions 24/7 with policy-aware responses' }
    ],
    decisionMakerValue: 'Empower employees with 24/7 self-service access',
    differentiatorLevel: 'standard'
  },
  {
    featureCode: 'mss_dashboard',
    capabilities: ['self-service', 'ai-powered', 'workflow-orchestration'],
    aiFeatures: [
      { type: 'prescriptive', name: 'Team Insights', businessValue: 'Surface team risks and opportunities proactively' }
    ],
    decisionMakerValue: 'Give managers the insights they need to lead effectively',
    differentiatorLevel: 'advanced'
  },

  // QUALIFICATIONS
  {
    featureCode: 'qualifications',
    capabilities: ['compliance-tracking', 'intelligent-automation', 'audit-ready'],
    aiFeatures: [
      { type: 'automation', name: 'Expiry Alerts', businessValue: 'Automatic reminders before certifications expire' }
    ],
    decisionMakerValue: 'Maintain workforce compliance with credential tracking',
    differentiatorLevel: 'standard'
  },

  // ONBOARDING/OFFBOARDING
  {
    featureCode: 'onboarding',
    capabilities: ['workflow-orchestration', 'intelligent-automation', 'cross-module'],
    decisionMakerValue: 'Accelerate new hire productivity with structured onboarding',
    differentiatorLevel: 'advanced'
  },
  {
    featureCode: 'offboarding',
    capabilities: ['workflow-orchestration', 'compliance-tracking', 'audit-ready'],
    decisionMakerValue: 'Protect company assets and data during employee exits',
    differentiatorLevel: 'advanced'
  }
];

// Helper functions
export const getCapabilityByCode = (code: string): PlatformCapability | undefined => {
  return PLATFORM_CAPABILITIES.find(c => c.code === code);
};

export const getCapabilitiesByCategory = (category: CapabilityCategory): PlatformCapability[] => {
  return PLATFORM_CAPABILITIES.filter(c => c.category === category);
};

export const getFeatureCapabilities = (featureCode: string): FeatureCapabilities | undefined => {
  return FEATURE_CAPABILITIES.find(f => f.featureCode === featureCode);
};

export const getFeaturesWithCapability = (capability: CapabilityTag): string[] => {
  return FEATURE_CAPABILITIES
    .filter(f => f.capabilities.includes(capability))
    .map(f => f.featureCode);
};

export const getUniqueFeatures = (): FeatureCapabilities[] => {
  return FEATURE_CAPABILITIES.filter(f => f.differentiatorLevel === 'unique');
};

export const getAIPoweredFeatures = (): FeatureCapabilities[] => {
  return FEATURE_CAPABILITIES.filter(f => f.capabilities.includes('ai-powered') || f.aiFeatures?.length);
};

// Category labels for UI
export const CAPABILITY_CATEGORY_LABELS: Record<CapabilityCategory, { label: string; description: string; icon: string }> = {
  'talent-intelligence': {
    label: 'Talent Intelligence',
    description: 'AI-powered talent decisions and workforce planning',
    icon: 'Brain'
  },
  'workforce-analytics': {
    label: 'Workforce Analytics',
    description: 'Dynamic BI, reporting, and data visualization',
    icon: 'BarChart3'
  },
  'process-automation': {
    label: 'Process Automation',
    description: 'Intelligent workflow and task automation',
    icon: 'Zap'
  },
  'compliance-governance': {
    label: 'Compliance & Governance',
    description: 'Regulatory compliance and audit readiness',
    icon: 'Shield'
  },
  'employee-experience': {
    label: 'Employee Experience',
    description: 'Self-service portals and engagement tools',
    icon: 'Users'
  },
  'global-operations': {
    label: 'Global Operations',
    description: 'Multi-entity, multi-country HR management',
    icon: 'Globe'
  }
};

// Capability tag labels for UI
export const CAPABILITY_TAG_LABELS: Record<CapabilityTag, { label: string; color: string; description: string }> = {
  'ai-powered': { label: 'AI-Powered', color: 'bg-purple-500', description: 'Uses artificial intelligence for predictions, recommendations, or automation' },
  'predictive-analytics': { label: 'Predictive Analytics', color: 'bg-blue-500', description: 'Forecasts future outcomes based on historical data patterns' },
  'prescriptive-guidance': { label: 'Prescriptive Guidance', color: 'bg-indigo-500', description: 'Recommends specific actions based on analysis' },
  'generative-ai': { label: 'Generative AI', color: 'bg-violet-500', description: 'Creates content such as reports, documentation, or recommendations' },
  'dynamic-dashboards': { label: 'Dynamic Dashboards', color: 'bg-cyan-500', description: 'Self-service business intelligence and visualization' },
  'intelligent-automation': { label: 'Intelligent Automation', color: 'bg-green-500', description: 'Auto-processes tasks based on rules or AI decisions' },
  'workflow-orchestration': { label: 'Workflow Orchestration', color: 'bg-amber-500', description: 'Multi-step approval routing and process coordination' },
  'real-time-processing': { label: 'Real-Time', color: 'bg-red-500', description: 'Immediate data updates and live processing' },
  'compliance-tracking': { label: 'Compliance Tracking', color: 'bg-emerald-500', description: 'Monitors regulatory requirements and policy adherence' },
  'audit-ready': { label: 'Audit Ready', color: 'bg-slate-500', description: 'Full audit trail with export capabilities' },
  'self-service': { label: 'Self-Service', color: 'bg-teal-500', description: 'Employee and manager portal functionality' },
  'mobile-enabled': { label: 'Mobile Enabled', color: 'bg-pink-500', description: 'Responsive design for mobile devices' },
  'multi-company': { label: 'Multi-Company', color: 'bg-orange-500', description: 'Cross-entity operations and multi-tenant support' },
  'temporal-tracking': { label: 'Historical Tracking', color: 'bg-yellow-500', description: 'Point-in-time views and historical data analysis' },
  'cross-module': { label: 'Cross-Module', color: 'bg-rose-500', description: 'Integrates data and workflows across HR domains' }
};
