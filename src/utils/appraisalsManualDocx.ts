import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, WidthType, BorderStyle, AlignmentType } from "docx";
import { saveAs } from "file-saver";

const createBorderedCell = (text: string, isHeader = false) => {
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: isHeader,
            size: 20,
          }),
        ],
      }),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
    },
    shading: isHeader ? { fill: "E0E0E0" } : undefined,
  });
};

const createSectionHeader = (text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) => {
  return new Paragraph({
    text,
    heading: level,
  });
};

const createBulletParagraph = (text: string) => {
  return new Paragraph({
    children: [new TextRun({ text: `• ${text}` })],
  });
};

const createInfoCallout = (title: string, content: string) => {
  return [
    new Paragraph({
      children: [
        new TextRun({ text: `💡 ${title}: `, bold: true }),
        new TextRun({ text: content }),
      ],
    }),
    new Paragraph({ text: "" }),
  ];
};

// Comprehensive manual content data
const MANUAL_CONTENT = {
  part1: {
    title: "Part 1: Module Overview & Conceptual Foundation",
    sections: [
      {
        title: "1.1 Introduction to Appraisals in Intelli HRM",
        content: [
          "Intelli HRM Appraisals is an enterprise-grade performance management module built with three key differentiators:",
          "AI-First Approach: Embedded intelligence for bias detection, feedback assistance, and predictive insights",
          "Cross-Module Orchestration: Automatic integration with Nine-Box, Succession, Compensation, and Learning modules",
          "Regional Compliance: Built-in support for Caribbean, African, and global labor regulations",
        ],
      },
      {
        title: "1.2 Core Concepts & Terminology",
        content: [
          "CRGV Model - The weighted scoring methodology:",
          "  • Competencies (C): 20% weight - Behavioral assessments against job-level competency profiles",
          "  • Responsibilities (R): 30% weight - Job description alignment and duty fulfillment",
          "  • Goals (G): 40% weight - Achievement of SMART objectives with measurable outcomes",
          "  • Values (V): 10% weight - Cultural alignment and organizational values demonstration",
          "",
          "Key Terminology:",
          "  • Appraisal Cycle: Time-bound evaluation period (annual, semi-annual, probation)",
          "  • Participant: Employee being evaluated in an active cycle",
          "  • Evaluator: Manager or designated reviewer conducting the assessment",
          "  • Rating Scale: Numeric scoring system (typically 1-5) for component evaluation",
          "  • Overall Rating Scale: Final performance category (Exceptional to Unsatisfactory)",
          "  • Calibration Session: Cross-team rating normalization meeting",
          "  • Nine-Box Grid: Performance vs. Potential talent mapping matrix",
        ],
      },
      {
        title: "1.3 System Architecture",
        content: [
          "Core Database Tables:",
          "  • appraisal_cycles: Cycle configuration and status",
          "  • appraisal_participants: Employee-cycle enrollment records",
          "  • appraisal_evaluations: Manager ratings and comments",
          "  • performance_rating_scales: Component-level rating definitions",
          "  • overall_rating_scales: Final rating categories",
          "",
          "AI Edge Functions:",
          "  • ai-feedback-assistant: Generates improvement suggestions",
          "  • ai-bias-detection: Scans for discriminatory language",
          "  • ai-sentiment-analysis: Analyzes feedback tone",
        ],
      },
      {
        title: "1.4 User Personas & Journeys",
        content: [
          "Employee (ESS): View goals, complete self-assessment, acknowledge ratings",
          "Manager (MSS): Conduct evaluations, provide feedback, calibrate team ratings",
          "HR Partner: Configure cycles, monitor completion, run calibration sessions",
          "Executive: View talent analytics, approve high-stakes decisions",
        ],
      },
      {
        title: "1.5 Performance Management Calendar",
        content: [
          "Q1 (January-March): Goal setting, prior year close-out, development planning",
          "Q2 (April-June): Mid-year check-ins, goal progress reviews, coaching",
          "Q3 (July-September): 360 feedback collection, calibration preparation",
          "Q4 (October-December): Annual reviews, calibration sessions, merit planning",
        ],
      },
    ],
  },
  part2: {
    title: "Part 2: Setup & Configuration Guide",
    sections: [
      {
        title: "2.1 Pre-requisites Checklist",
        content: [
          "Before configuring appraisals, ensure:",
          "  ✓ Organization structure defined (departments, positions, reporting lines)",
          "  ✓ Employee profiles complete with job assignments",
          "  ✓ Competency library populated with job-level competencies",
          "  ✓ Goals module active with employee goals assigned",
          "  ✓ Manager relationships established in system",
        ],
      },
      {
        title: "2.2 Rating Scales Configuration",
        content: [
          "Navigate to Performance > Settings > Rating Scales",
          "Configure component-level rating scale (recommended 5-point):",
          "  • 5 = Exceptional (Consistently exceeds all expectations)",
          "  • 4 = Exceeds (Frequently exceeds expectations)",
          "  • 3 = Meets (Consistently meets all expectations)",
          "  • 2 = Needs Improvement (Partially meets expectations)",
          "  • 1 = Unsatisfactory (Does not meet expectations)",
        ],
      },
      {
        title: "2.3 Overall Rating Scales Setup",
        content: [
          "Define final performance categories with score thresholds:",
          "  • Exceptional: 4.5 - 5.0 (Top 10% benchmark)",
          "  • Exceeds Expectations: 3.75 - 4.49 (Top 30%)",
          "  • Meets Expectations: 2.75 - 3.74 (Core 40%)",
          "  • Needs Improvement: 1.75 - 2.74 (Bottom 15%)",
          "  • Unsatisfactory: 1.0 - 1.74 (Bottom 5%)",
        ],
      },
      {
        title: "2.4 Competency Library Integration",
        content: [
          "Link competencies to appraisal forms:",
          "  1. Navigate to Talent > Competencies",
          "  2. Assign competencies to job families or positions",
          "  3. Define proficiency levels per competency",
          "  4. Map to appraisal templates in Performance > Templates",
        ],
      },
      {
        title: "2.5 Appraisal Form Templates",
        content: [
          "Create evaluation templates with sections:",
          "  • Goals Section: Dynamic pull from Goals module",
          "  • Competencies Section: Based on job-level assignment",
          "  • Responsibilities Section: From job description",
          "  • Values Section: Organization-wide values assessment",
          "  • Comments Section: Manager narrative and development notes",
        ],
      },
      {
        title: "2.6 Appraisal Cycles Configuration",
        content: [
          "Create a new cycle:",
          "  1. Navigate to Performance > Appraisal Cycles",
          "  2. Click 'Create Cycle'",
          "  3. Configure: Name, Dates, Template, Weights",
          "  4. Set component weights (must total 100%)",
          "  5. Define evaluation deadline and response window",
          "  6. Save as Draft, then Activate when ready",
        ],
      },
      {
        title: "2.7 Performance Categories Setup",
        content: [
          "Define score-to-category mappings for downstream integrations:",
          "  • Links to compensation merit matrices",
          "  • Triggers succession pipeline updates",
          "  • Feeds nine-box grid placements",
        ],
      },
      {
        title: "2.8 Action Rules Configuration",
        content: [
          "Configure automated actions based on outcomes:",
          "  • Score < 2.0 → Auto-create PIP (Performance Improvement Plan)",
          "  • Score ≥ 4.5 → Flag for High Potential pool",
          "  • Score ≥ 4.0 → Recommend for IDP (Individual Development Plan)",
          "  • Score < 2.5 for 2 cycles → Escalate to HR",
        ],
      },
      {
        title: "2.9 Integration Rules (Downstream)",
        content: [
          "Configure automatic updates to connected modules:",
          "  • Nine-Box: Update performance axis based on final rating",
          "  • Succession: Adjust readiness scores and pipeline rankings",
          "  • Compensation: Feed merit recommendation algorithms",
          "  • Learning: Trigger competency gap training recommendations",
        ],
      },
      {
        title: "2.10 Employee Response Configuration",
        content: [
          "Configure acknowledgment and dispute workflow:",
          "  • Response window: 5-10 business days (configurable)",
          "  • Options: Acknowledge, Acknowledge with Comments, Disagree",
          "  • Disagreement triggers HR escalation workflow",
        ],
      },
      {
        title: "2.11 HR Escalation Settings",
        content: [
          "Define escalation paths for disputes:",
          "  • Level 1: HR Business Partner review",
          "  • Level 2: Department Head involvement",
          "  • Level 3: HR Director final decision",
        ],
      },
      {
        title: "2.12 Multi-Position Appraisals Setup",
        content: [
          "For employees with multiple positions:",
          "  • Aggregate Mode: Single evaluation across all positions",
          "  • Separate Mode: Individual evaluation per position",
          "  • Configure primary position weighting if applicable",
        ],
      },
    ],
  },
  part3: {
    title: "Part 3: Operational Workflows",
    sections: [
      {
        title: "3.1 Appraisal Cycle Lifecycle",
        content: [
          "Cycle Status Progression:",
          "  Draft → Active → In Progress → Completed → Closed",
          "",
          "Status Definitions:",
          "  • Draft: Configuration in progress, not visible to users",
          "  • Active: Cycle launched, participants enrolled",
          "  • In Progress: Evaluations underway",
          "  • Completed: All evaluations submitted",
          "  • Closed: Finalized, no further changes allowed",
        ],
      },
      {
        title: "3.2 Participant Enrollment",
        content: [
          "Enroll employees in active cycle:",
          "  1. Navigate to cycle > Participants tab",
          "  2. Use bulk enrollment with filters (department, location, job level)",
          "  3. Or manually add individual participants",
          "  4. Assign evaluators (defaults to direct manager)",
          "  5. Send notification to participants and evaluators",
        ],
      },
      {
        title: "3.3 Manager Evaluation Workflow",
        content: [
          "Manager evaluation steps:",
          "  1. Access pending evaluations from dashboard",
          "  2. Review employee self-assessment (if enabled)",
          "  3. Rate goals with evidence and comments",
          "  4. Assess competencies against proficiency levels",
          "  5. Evaluate responsibility fulfillment",
          "  6. Score values demonstration",
          "  7. Use AI Feedback Assistant for narrative suggestions",
          "  8. Run bias detection scan before submission",
          "  9. Submit evaluation for employee response",
        ],
      },
      {
        title: "3.4 Self-Assessment Process",
        content: [
          "Employee self-assessment workflow:",
          "  1. Receive notification when cycle opens",
          "  2. Access self-assessment form from ESS portal",
          "  3. Rate own performance against goals and competencies",
          "  4. Provide evidence and accomplishment narratives",
          "  5. Submit before manager evaluation deadline",
        ],
      },
      {
        title: "3.5 Goal Rating Process",
        content: [
          "Evaluate goal achievement:",
          "  • Review each goal's target vs. actual outcome",
          "  • Assign rating based on achievement percentage",
          "  • Add supporting evidence (metrics, documents)",
          "  • Provide constructive feedback comments",
        ],
      },
      {
        title: "3.6 Competency Assessment",
        content: [
          "Rate behavioral competencies:",
          "  • Reference proficiency level indicators",
          "  • Assess against specific behavioral examples",
          "  • Consider 360 feedback if available",
          "  • Document observed behaviors",
        ],
      },
      {
        title: "3.7 Employee Response Phase",
        content: [
          "Managing acknowledgment:",
          "  • Employee receives notification after manager submission",
          "  • Review ratings and comments in read-only mode",
          "  • Select response: Acknowledge, Comment, or Disagree",
          "  • Submit response within configured window",
          "  • Disagreements route to HR for resolution",
        ],
      },
      {
        title: "3.8 Appraisal Interview Scheduling",
        content: [
          "Schedule performance discussion:",
          "  • Recommended 30-60 minutes per employee",
          "  • Use calendar integration for scheduling",
          "  • Prepare talking points from evaluation",
          "  • Document discussion outcomes",
        ],
      },
      {
        title: "3.9 Role Change Handling",
        content: [
          "Managing mid-cycle role changes:",
          "  • Pro-rate evaluation periods by position tenure",
          "  • Involve both previous and current managers",
          "  • Document transfer of evaluation responsibility",
        ],
      },
      {
        title: "3.10 Probation Reviews",
        content: [
          "Special handling for probationary employees:",
          "  • Separate probation review cycles",
          "  • More frequent check-in cadence",
          "  • Clear pass/fail criteria definition",
          "  • Extension or confirmation workflow",
        ],
      },
    ],
  },
  part4: {
    title: "Part 4: Calibration Sessions",
    sections: [
      {
        title: "4.1 Calibration Overview",
        content: [
          "Purpose of calibration:",
          "  • Reduce rating bias across evaluators",
          "  • Ensure consistent standards application",
          "  • Align ratings to forced distribution guidelines",
          "  • Identify high performers and development needs",
        ],
      },
      {
        title: "4.2 Session Types",
        content: [
          "Calibration session formats:",
          "  • Department-level: Within single department",
          "  • Cross-functional: Across multiple departments",
          "  • Executive: Leadership team calibration",
          "  • Global: Multi-region alignment",
        ],
      },
      {
        title: "4.3 Facilitation Guide",
        content: [
          "Running effective calibration:",
          "  1. Pre-session: Distribute rating summaries",
          "  2. Review distribution curves by team",
          "  3. Discuss outliers (high and low ratings)",
          "  4. Adjust ratings based on consensus",
          "  5. Document calibration decisions",
          "  6. Finalize adjusted ratings",
        ],
      },
      {
        title: "4.4 Nine-Box Integration",
        content: [
          "Mapping to nine-box grid:",
          "  • Performance axis: Final calibrated rating",
          "  • Potential axis: Manager/HR assessment",
          "  • Automatic grid placement after calibration",
          "  • Succession pipeline implications",
        ],
      },
      {
        title: "4.5 AI-Powered Insights",
        content: [
          "AI assistance in calibration:",
          "  • Rating distribution anomaly detection",
          "  • Manager rating pattern analysis",
          "  • Bias indicator flagging",
          "  • Suggested calibration adjustments",
        ],
      },
      {
        title: "4.6 Calibration Audit Trail",
        content: [
          "Compliance documentation:",
          "  • All rating changes logged with timestamp",
          "  • Calibration session attendees recorded",
          "  • Justification notes for adjustments",
          "  • Pre/post calibration comparison reports",
        ],
      },
    ],
  },
  part5: {
    title: "Part 5: AI Features",
    sections: [
      {
        title: "5.1 AI Feedback Assistant",
        content: [
          "AI-powered feedback generation:",
          "  • Generates strength narratives from ratings",
          "  • Suggests development recommendations",
          "  • Improves comment quality and specificity",
          "  • Ensures balanced feedback structure",
        ],
      },
      {
        title: "5.2 Bias Detection",
        content: [
          "EEOC-compliant bias scanning:",
          "  • Gender-coded language detection",
          "  • Age-related stereotype flagging",
          "  • Recency bias indicators",
          "  • Halo/horn effect patterns",
          "  • Suggested neutral alternatives",
        ],
      },
      {
        title: "5.3 Sentiment Analysis",
        content: [
          "Feedback tone analysis:",
          "  • Positive/negative/neutral scoring",
          "  • Constructiveness assessment",
          "  • Clarity and specificity metrics",
          "  • Actionability rating",
        ],
      },
      {
        title: "5.4 Predictive Insights",
        content: [
          "AI predictions for workforce planning:",
          "  • Attrition risk based on performance trends",
          "  • Promotion readiness scoring",
          "  • Development investment recommendations",
          "  • Team performance forecasting",
        ],
      },
      {
        title: "5.5 Explainability & Compliance",
        content: [
          "AI governance features:",
          "  • All AI outputs include confidence scores",
          "  • Source data citations provided",
          "  • Human override always available",
          "  • Audit trail for AI-assisted decisions",
        ],
      },
      {
        title: "5.6 AI Configuration",
        content: [
          "Managing AI settings:",
          "  • Enable/disable AI features per cycle",
          "  • Configure sensitivity thresholds",
          "  • Set mandatory bias scan requirements",
          "  • Define AI usage policies",
        ],
      },
    ],
  },
  part6: {
    title: "Part 6: Analytics & Reporting",
    sections: [
      {
        title: "6.1 Appraisal Dashboard",
        content: [
          "Key performance metrics:",
          "  • Completion Rate: % of evaluations submitted",
          "  • On-Time Rate: % submitted before deadline",
          "  • Average Rating: Organization-wide score average",
          "  • Calibrated %: % of ratings post-calibration",
        ],
      },
      {
        title: "6.2 Distribution Analysis",
        content: [
          "Rating distribution reports:",
          "  • Bell curve visualization by department",
          "  • Comparison to target distribution",
          "  • Manager rating pattern analysis",
          "  • Year-over-year trend comparisons",
        ],
      },
      {
        title: "6.3 Completion Tracking",
        content: [
          "Monitoring cycle progress:",
          "  • Real-time completion dashboard",
          "  • Overdue evaluation alerts",
          "  • Manager completion rankings",
          "  • Automated reminder scheduling",
        ],
      },
      {
        title: "6.4 Export & Reporting",
        content: [
          "Available export formats:",
          "  • PDF individual appraisal reports",
          "  • Excel data exports for analysis",
          "  • PowerPoint executive summaries",
          "  • Custom report builder",
        ],
      },
    ],
  },
  part7: {
    title: "Part 7: Integration & Downstream Actions",
    sections: [
      {
        title: "7.1 Nine-Box Integration",
        content: [
          "Automatic grid updates:",
          "  • Performance rating maps to X-axis",
          "  • Potential assessment feeds Y-axis",
          "  • Grid position triggers succession actions",
          "  • Historical tracking of grid movements",
        ],
      },
      {
        title: "7.2 Succession Planning",
        content: [
          "Talent pipeline integration:",
          "  • Top performers flagged for succession pools",
          "  • Readiness scores updated from ratings",
          "  • Development plans linked to gaps",
          "  • Pipeline health metrics",
        ],
      },
      {
        title: "7.3 Compensation Integration",
        content: [
          "Merit planning connections:",
          "  • Ratings feed merit matrix recommendations",
          "  • Compa-ratio adjustments based on performance",
          "  • Bonus eligibility determination",
          "  • Budget allocation guidance",
        ],
      },
      {
        title: "7.4 Learning Recommendations",
        content: [
          "Development integration:",
          "  • Competency gaps trigger course recommendations",
          "  • IDP auto-creation for development areas",
          "  • Learning path assignments",
          "  • Skill gap analysis reports",
        ],
      },
      {
        title: "7.5 IDP/PIP Creation",
        content: [
          "Automatic plan generation:",
          "  • Low ratings trigger PIP workflow",
          "  • Development needs create IDP items",
          "  • Manager approval workflow",
          "  • Progress tracking integration",
        ],
      },
      {
        title: "7.6 Notification Triggers",
        content: [
          "Automated communications:",
          "  • Cycle launch notifications",
          "  • Evaluation reminders",
          "  • Deadline escalations",
          "  • Completion confirmations",
        ],
      },
    ],
  },
  part8: {
    title: "Part 8: Troubleshooting & Best Practices",
    sections: [
      {
        title: "8.1 Common Issues & Solutions",
        content: [
          "Frequently encountered problems:",
          "  Q: Employee not appearing in cycle?",
          "  A: Check active employment status and job assignment",
          "",
          "  Q: Goals not pulling into form?",
          "  A: Verify goal cycle alignment and goal status",
          "",
          "  Q: Cannot submit evaluation?",
          "  A: Ensure all required fields are completed",
          "",
          "  Q: Rating scale showing wrong options?",
          "  A: Check template configuration and scale assignment",
        ],
      },
      {
        title: "8.2 Best Practices",
        content: [
          "Recommendations for success:",
          "  ✓ Configure and test cycles 4-6 weeks before launch",
          "  ✓ Train managers on evaluation expectations",
          "  ✓ Set clear deadlines with reminder schedules",
          "  ✓ Run bias detection on all evaluations",
          "  ✓ Complete calibration before finalizing ratings",
          "  ✓ Document all configuration decisions",
        ],
      },
      {
        title: "8.3 Compliance Checklist",
        content: [
          "Quarterly/Annual audit requirements:",
          "  □ Rating scale definitions reviewed",
          "  □ Template weights validated",
          "  □ Calibration sessions documented",
          "  □ Employee responses archived",
          "  □ Escalation resolutions logged",
          "  □ AI bias detection reports reviewed",
        ],
      },
      {
        title: "8.4 Support Resources",
        content: [
          "Getting help:",
          "  • In-app help: Click ? icon for contextual guidance",
          "  • Knowledge base: Search for articles and tutorials",
          "  • Support tickets: Submit via Help > Contact Support",
          "  • Training: Access Learning module for courses",
        ],
      },
    ],
  },
};

export const generateAppraisalsManualDocx = async (): Promise<void> => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title Page
          new Paragraph({
            text: "Performance Appraisal - Administrator Guide",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: "HRplus Performance Management Module",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Generated: ${new Date().toLocaleDateString()}`,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Table of Contents Header
          createSectionHeader("Table of Contents"),
          new Paragraph({ text: "Part 1: Module Overview & Conceptual Foundation" }),
          new Paragraph({ text: "Part 2: Setup & Configuration Guide" }),
          new Paragraph({ text: "Part 3: Operational Workflows" }),
          new Paragraph({ text: "Part 4: Calibration Sessions" }),
          new Paragraph({ text: "Part 5: AI Features" }),
          new Paragraph({ text: "Part 6: Analytics & Reporting" }),
          new Paragraph({ text: "Part 7: Integration & Downstream Actions" }),
          new Paragraph({ text: "Part 8: Troubleshooting & Best Practices" }),
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),

          // Part 1
          createSectionHeader(MANUAL_CONTENT.part1.title),
          new Paragraph({ text: "" }),
          ...MANUAL_CONTENT.part1.sections.flatMap((section) => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
            }),
            ...section.content.map((line) => new Paragraph({ text: line })),
            new Paragraph({ text: "" }),
          ]),

          // Part 2
          createSectionHeader(MANUAL_CONTENT.part2.title),
          new Paragraph({ text: "" }),
          ...MANUAL_CONTENT.part2.sections.flatMap((section) => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
            }),
            ...section.content.map((line) => new Paragraph({ text: line })),
            new Paragraph({ text: "" }),
          ]),

          // Part 3
          createSectionHeader(MANUAL_CONTENT.part3.title),
          new Paragraph({ text: "" }),
          ...MANUAL_CONTENT.part3.sections.flatMap((section) => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
            }),
            ...section.content.map((line) => new Paragraph({ text: line })),
            new Paragraph({ text: "" }),
          ]),

          // Part 4
          createSectionHeader(MANUAL_CONTENT.part4.title),
          new Paragraph({ text: "" }),
          ...MANUAL_CONTENT.part4.sections.flatMap((section) => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
            }),
            ...section.content.map((line) => new Paragraph({ text: line })),
            new Paragraph({ text: "" }),
          ]),

          // Part 5
          createSectionHeader(MANUAL_CONTENT.part5.title),
          new Paragraph({ text: "" }),
          ...MANUAL_CONTENT.part5.sections.flatMap((section) => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
            }),
            ...section.content.map((line) => new Paragraph({ text: line })),
            new Paragraph({ text: "" }),
          ]),

          // Part 6
          createSectionHeader(MANUAL_CONTENT.part6.title),
          new Paragraph({ text: "" }),
          ...MANUAL_CONTENT.part6.sections.flatMap((section) => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
            }),
            ...section.content.map((line) => new Paragraph({ text: line })),
            new Paragraph({ text: "" }),
          ]),

          // Part 7
          createSectionHeader(MANUAL_CONTENT.part7.title),
          new Paragraph({ text: "" }),
          ...MANUAL_CONTENT.part7.sections.flatMap((section) => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
            }),
            ...section.content.map((line) => new Paragraph({ text: line })),
            new Paragraph({ text: "" }),
          ]),

          // Part 8
          createSectionHeader(MANUAL_CONTENT.part8.title),
          new Paragraph({ text: "" }),
          ...MANUAL_CONTENT.part8.sections.flatMap((section) => [
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
            }),
            ...section.content.map((line) => new Paragraph({ text: line })),
            new Paragraph({ text: "" }),
          ]),

          // Footer
          new Paragraph({ text: "" }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "© HRplus - Confidential",
                italics: true,
                size: 18,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const date = new Date().toISOString().split('T')[0];
  saveAs(blob, `appraisals-admin-manual-${date}.docx`);
};

// Export the content for PDF generation as well
export { MANUAL_CONTENT };
