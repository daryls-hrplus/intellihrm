

# Update Act 3 Capabilities: Payroll, Compensation, Benefits

## Root Cause

Same issue as Act 2: the Table of Contents counts were never updated when the capability components were expanded. Additionally, 15+ Payroll pages and a few Compensation/Benefits pages have no representation in the hardcoded component content.

## Gap Analysis

### Payroll (Badge: 150+, TOC: 60+ -- severely outdated)

**Missing pages not covered in document:**

| Page | What's Missing |
|------|---------------|
| LeaveBalanceBuyoutPage | Leave balance buyout/cash-out processing |
| LeavePaymentConfigPage | Leave-to-payroll payment configuration |
| PayrollExpenseClaimsPage | Expense claim payroll integration |
| HistoricalPayrollImportPage | Historical payroll data migration |
| OpeningBalancesPage | Opening balance setup for new implementations |
| PayrollArchiveSettingsPage | Archive retention and purge configuration |
| PayrollCountryDocumentationPage | Country-specific payroll documentation hub |
| SemiMonthlyPayrollRulesPage | Semi-monthly pay period rule configuration |
| StatutoryPayElementMappingsPage | Statutory element-to-pay-code mappings |
| PayPeriodPayrollEntriesPage | Period-specific payroll entry management |
| PayrollHolidaysPage | Public holiday calendar for payroll calculations |
| PayGroupsPage | Pay group configuration and assignment |
| PayPeriodsPage | Pay period definition and scheduling |
| CountryPayrollYearSetupPage | Country-specific payroll year configuration |
| PaymentRulesConfigPage | Payment rule engine configuration |

**Recommendation:** Add 2 new categories ("Pay Period & Group Configuration" ~6 items, "Implementation & Data Management" ~5 items) and expand existing categories with 4-5 items. No badge change needed (150+ already accurate).

### Compensation (Badge: 100+, TOC: 50+ -- severely outdated)

**Minor gaps:**

| Page | What's Missing |
|------|---------------|
| CompensationFTEReconciliationPage | FTE reconciliation with headcount analysis |
| MinimumWageConfigPage | Minimum wage rule configuration (separate from monitoring) |

**Recommendation:** Add 1 item to "Position Budgeting" for FTE reconciliation and 1 item to "Compensation Analytics" for minimum wage configuration. No badge change needed.

### Benefits (Badge: 95+, TOC: 40+ -- severely outdated)

**Minor gaps -- pages exist but specific features not called out:**

| Page | What's Missing |
|------|---------------|
| PlanComparisonPage | Side-by-side plan comparison tool |
| BenefitCalculatorPage | Employee benefit cost calculator |
| OpenEnrollmentTrackerPage | Enrollment progress tracking dashboard |
| WaitingPeriodTrackingPage | Waiting period status monitoring |

**Recommendation:** Add 2 items to "Enrollment Management" (plan comparison tool, enrollment tracker) and 2 items to "Eligibility & Rules" (benefit calculator, waiting period tracking). No badge change needed.

---

## Changes Required

### File 1: `PayrollCapabilities.tsx`

#### 1. Add new category: "Pay Period & Group Configuration" (~6 items)
Insert after "Earnings Configuration" block:
- Pay group creation with employee assignment and scheduling rules
- Pay period definition with frequency options (weekly, bi-weekly, semi-monthly, monthly)
- Semi-monthly payroll rules with split-period calculations
- Public holiday calendar management with payroll impact rules
- Country-specific payroll year setup with fiscal period alignment
- Payment rule engine with conditional logic and priority ordering

Icon: `Calendar` (needs import)

#### 2. Add new category: "Implementation & Data Management" (~5 items)
Insert after "Year-End Processing" block:
- Historical payroll data import with validation and reconciliation
- Opening balance setup for mid-year implementations
- Payroll archive settings with retention policies and purge scheduling
- Country-specific payroll documentation and compliance reference hub
- Pay period payroll entry management with bulk upload support

Icon: `Database` (needs import)

#### 3. Expand "Statutory Compliance"
Add:
- Statutory pay element-to-pay-code mapping configuration

#### 4. Expand "Time & Attendance Integration"
Add:
- Leave balance buyout and cash-out processing
- Leave-to-payroll payment configuration rules

#### 5. Expand "Deductions & Garnishments" or add to relevant category
Add:
- Expense claim reimbursement through payroll

### File 2: `CompensationCapabilities.tsx`

#### 1. Expand "Position Budgeting & Planning"
Add:
- FTE reconciliation with headcount analysis and variance reporting

#### 2. Expand "Compensation Analytics"
Add:
- Minimum wage rule configuration with jurisdiction-specific thresholds

### File 3: `BenefitsCapabilities.tsx`

#### 1. Expand "Enrollment Management"
Add:
- Side-by-side plan comparison tool with cost modeling
- Open enrollment progress tracker with completion analytics

#### 2. Expand "Eligibility & Rules"
Add:
- Benefit cost calculator for employee decision support

#### 3. Expand "Cost Analysis & Projections"
Add:
- Waiting period status monitoring with auto-enrollment triggers

### File 4: `TableOfContents.tsx`

Update Act 3 counts to match component badges:
- Payroll: "60+" to "150+"
- Compensation: "50+" to "100+"
- Benefits: "40+" to "95+"
- Act 3 total: "150+" to "345+"

### File 5: `ProductCapabilitiesDocument.tsx`

Update Act 3 divider `modules` prop:
```
["Payroll (150+)", "Compensation (100+)", "Benefits (95+)"]
```

---

## What Does Not Change

- `capabilitiesData.ts` -- not the rendering source for these sections
- Component badges -- already accurate (150+, 100+, 95+)
- Value stories, personas, AI highlights, integrations -- already comprehensive

## Technical Notes

- Two new icon imports needed in PayrollCapabilities: `Calendar` (already in lucide-react), `Database`
- All changes are text-only content additions
- The OOM build error is pre-existing and unrelated to these changes
