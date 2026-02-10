

# Update Act 2 Module Capabilities: ESS, MSS, Time and Attendance, Leave Management

## Summary

After comparing the actual implemented pages against the rendered capability components, I found gaps across all four Act 2 modules. Additionally, the Table of Contents shows severely outdated counts that don't match even the current component badges.

---

## Gap Analysis

### ESS (Current badge: 75+, TOC shows: 45+)

**Missing entirely from document:**

| Gap | Source Page | Description |
|-----|-----------|-------------|
| Immigration & Permits | MyImmigrationPage.tsx | Work permit, visa, and immigration document management |
| Medical Information | MyMedicalInfoPage.tsx | Employee medical profile with conditions and emergency info |
| My Interests | MyInterestsPage.tsx | Personal interests for culture and team-building alignment |
| My Transactions | MyTransactionsPage.tsx (429 lines) | Full transaction history with module-based categorization and filtering |
| My Change Requests | MyChangeRequestsPage.tsx (676 lines) | Change request submission, tracking, document upload, and status monitoring |
| My HSE | MyHSEPage.tsx | Health and safety self-service (incident reporting, training compliance) |
| My Employee Relations | MyEmployeeRelationsPage.tsx | Grievance submission, case tracking from employee perspective |
| My Property | MyPropertyPage.tsx | Assigned company assets viewing and return coordination |
| My Calendar | MyCalendarPage.tsx | Personal work calendar with leave, meetings, and milestones |
| Professional Info (expanded) | MyProfessionalInfoPage.tsx | 5-tab view: credentials/memberships, agreements/signatures, professional history, compliance status, languages |

**Recommendation:** Add new category "Lifecycle & Requests" covering transactions, change requests, onboarding/offboarding self-service. Expand "Personal Information" with immigration, medical, interests. Add items to existing categories for HSE, Employee Relations, and Property self-service. Update badge to **90+ Capabilities**.

---

### MSS (Current badge: 90+, TOC shows: 50+)

**Missing entirely from document:**

| Gap | Source Page | Description |
|-----|-----------|-------------|
| Payroll Consolidation | MssPayrollConsolidationPage.tsx (343 lines) | Team payroll summary across entities with variance analysis and cost trends |
| Readiness Assessment | MssReadinessAssessmentPage.tsx | Succession readiness assessment for direct reports |
| Talent Pool Nomination | MssNominateTalentPoolPage.tsx | Manager-driven talent pool nomination with justification |
| Equity Dashboard | MssEquityPage.tsx | Team pay equity analysis with gap identification |
| Team Reminders | MssRemindersPage.tsx | Manager reminder/to-do management for team actions |

**Recommendation:** Expand "Workforce Actions" with payroll consolidation. Add items to "Development & Succession" for readiness assessments and talent nomination. Add compa-ratio and equity items to existing categories. Update badge to **100+ Capabilities**.

---

### Time and Attendance (Current badge: 120+, TOC shows: 45+)

**Missing or under-documented shift sub-features:**

| Gap | Source Page | Description |
|-----|-----------|-------------|
| Fatigue Management | FatigueManagementPage.tsx | Fatigue risk scoring, rest period enforcement, consecutive shift limits |
| AI Scheduler | AISchedulerPage.tsx | AI-powered schedule generation with demand forecasting |
| Multi-Location Scheduling | MultiLocationSchedulePage.tsx | Cross-site schedule coordination and resource sharing |
| Shift Bidding | ShiftBiddingPage.tsx | Employee shift preference bidding with seniority rules |
| Shift Calendar | ShiftCalendarPage.tsx | Visual shift calendar with drag-and-drop assignment |
| Shift Templates | ShiftTemplatesPage.tsx | Reusable shift pattern templates |
| Shift Assignments | ShiftAssignmentsPage.tsx | Employee-to-shift assignment management |
| Shift Coverage | ShiftCoveragePage.tsx | Coverage gap detection and fill recommendations |
| Rotation Patterns | RotationPatternsPage.tsx | Complex rotation pattern configuration |
| Payment Rules | PaymentRulesPage.tsx | Shift-specific payment rule configuration |
| Rounding Rules | RoundingRulesPage.tsx | Shift-level punch rounding overrides |

**Recommendation:** Expand "Shift Management" with templates, assignments, calendar, rotation patterns, and payment/rounding rules. Add new category "Advanced Scheduling" with AI scheduler, multi-location, fatigue management, and shift bidding. Update badge to **135+ Capabilities**.

---

### Leave Management (Current badge: 80+, TOC shows: 40+)

**Missing or under-documented:**

| Gap | Source Page | Description |
|-----|-----------|-------------|
| Leave Years/Periods | LeaveYearsPage.tsx (572 lines) | Leave year definition, period locking, year-end processing, multi-year support |
| Conflict Rules | LeaveConflictRulesPage.tsx (439 lines) | Detailed conflict rule engine (department limits, role restrictions, concurrent leave caps) |
| Pro-rata Settings | LeaveProrataSettingsPage.tsx (288 lines) | Granular pro-rata calculation methods per leave type with company-level config |
| Comp Time Policies | CompTimePoliciesPage.tsx | Compensatory time policy configuration linked to overtime |
| Compensatory Time | CompensatoryTimePage.tsx | Comp time balance management and usage tracking |
| Balance Recalculation | LeaveBalanceRecalculationPage.tsx | Bulk balance recalculation with audit logging |

**Recommendation:** Add new category "Leave Year & Period Management" with year definitions, period locking, and year-end processing. Expand "Accrual Engine" with pro-rata settings. Expand "Blackout & Conflict Management" with conflict rule engine details. Add comp time items. Update badge to **95+ Capabilities**.

---

## Changes Required (4 files)

### File 1: `ESSCapabilities.tsx`
- Update badge: "75+" to "90+"
- Expand "Personal Information": add immigration/permits, medical info, interests
- Expand "Career & Development": add competencies self-assessment and skill gap viewer
- Expand "Communications & Documents": add personal calendar
- Add new category: **"Lifecycle & Requests"** (~6 items): My Transactions dashboard, Change request submission/tracking, Onboarding task checklist, Offboarding task coordination, Request status with document uploads, Historical request archive
- Add new category: **"Cross-Module Self-Service"** (~4 items): HSE incident reporting and training compliance, Employee relations grievance submission, Company property viewing and returns, Professional info management (credentials, agreements, languages)

### File 2: `MSSCapabilities.tsx`
- Update badge: "90+" to "100+"
- Expand "Workforce Actions": add team payroll consolidation view, team reminders
- Expand "Development & Succession": add readiness assessments, talent pool nomination
- Expand "Team Analytics": add compa-ratio monitoring, pay equity analysis

### File 3: `TimeAttendanceCapabilities.tsx`
- Update badge: "120+" to "135+"
- Expand "Shift Management": add shift templates, shift assignments, shift calendar, rotation patterns, payment rules, rounding rule overrides
- Add new category: **"Advanced Scheduling"** (~5 items): AI-powered schedule generation, multi-location coordination, fatigue management with rest enforcement, shift bidding with seniority, coverage gap detection and fill recommendations

### File 4: `LeaveCapabilities.tsx`
- Update badge: "80+" to "95+"
- Add new category: **"Leave Year & Period Management"** (~5 items): Leave year definitions with fiscal/calendar alignment, period locking and finalization, year-end processing automation, multi-year balance tracking, leave period transition rules
- Expand "Accrual Engine": add pro-rata calculation methods with company-level configuration
- Expand "Blackout & Conflict Management": add conflict rule engine with department limits, role restrictions, concurrent leave caps
- Expand "Balance Management": add bulk recalculation with audit
- Add items for compensatory time policies

### File 5: `TableOfContents.tsx`
- Update Act 2 counts:
  - ESS: "45+" to "90+"
  - MSS: "50+" to "100+"
  - Time and Attendance: "45+" to "135+"
  - Leave: "40+" to "95+"
  - Act 2 total: "180+" to "420+"

### File 6: `ProductCapabilitiesDocument.tsx`
- Update Act 2 divider `modules` prop with new counts: `["Employee Self-Service (90+)", "Manager Self-Service (100+)", "Time & Attendance (135+)", "Leave Management (95+)"]`

---

## Technical Notes

- All changes are text/content only -- no new imports needed except potentially one icon for new categories
- The OOM build error is pre-existing (9,697 modules, 3GB heap limit) and unrelated to these changes
- Same root cause as previous fixes: section components render hardcoded content, not from `capabilitiesData.ts`

