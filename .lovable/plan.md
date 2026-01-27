
# Succession Manual Chapter 7: Risk Management - Comprehensive Review & Update Plan

## Executive Summary

Chapter 7 (Risk Management) is currently in **placeholder state** with only 4 generic sections (~55 lines total). This audit reveals significant structural, content, and industry-alignment issues requiring a complete rewrite to match the comprehensive modular pattern used in other chapters (Foundation: 10 sections, Succession Plans: 10 sections, Analytics: 12 sections).

---

## Part 1: Current State Analysis

### Current Chapter 7 Structure (Placeholder)

| Section | Title | Status |
|---------|-------|--------|
| 7.1 | Flight Risk Assessment | Empty placeholder |
| 7.2 | Retention Risk Matrix | Empty placeholder |
| 7.3 | Key Position Vacancy Risk | Empty placeholder |
| 7.4 | Bench Strength Analysis | Empty placeholder |

**Total Lines:** ~55 (placeholder content only)

### Industry Standard Risk Management Framework

The industry-standard risk management module in succession planning follows this logical sequence:

```text
1. Risk Framework Overview & Terminology (Foundation)
2. Key Position Identification & Criticality (Assessment)
3. Vacancy Risk Assessment (Triggers)
4. Flight Risk Assessment - Employee Level (Detection)
5. Retention Risk Matrix - Position Level (Prioritization)
6. Risk Mitigation & Action Planning (Response)
7. Risk Monitoring & Review Cadence (Governance)
8. AI-Assisted Risk Prediction (Automation)
9. Integration with Succession Planning (Cross-Module)
10. Troubleshooting & FAQs (Support)
```

---

## Part 2: Duplication Analysis

### Critical Content Overlaps Identified

| Content Area | Chapter 7 (Planned) | Other Chapters | Resolution |
|--------------|---------------------|----------------|------------|
| Flight Risk Assessment | Sec 7.4 | **Ch 10.4** (fully documented) | Remove from Ch 7, add cross-reference |
| Retention Risk Matrix | Sec 7.2 | **Ch 10.4** (fully documented) | Remove from Ch 7, add cross-reference |
| Bench Strength Analysis | Sec 7.4 | **Ch 10.3** (fully documented) | Remove from Ch 7, add cross-reference |
| Key Position Risk | Sec 7.3 | **Ch 6.3** (fully documented) | Cross-reference only |
| Position Criticality | N/A | **Ch 6.4** (succession_plans table) | Reference existing |

### Content Currently in Chapter 10 (Analytics)

Chapter 10 already comprehensively documents:
- **10.3 Bench Strength Analysis**: Coverage algorithm, depth metrics, UI component
- **10.4 Flight Risk & Retention Reporting**: Risk of Loss, Impact of Loss, Retention Risk Matrix, all 13 fields of `flight_risk_assessments`, standard risk factors, analytics metrics

### Content in Chapter 6 (Succession Planning Workflow)

Chapter 6 already documents:
- **6.2 Key Position Identification**: `jobs.is_key_position` flag
- **6.3 Position Risk Assessment**: Full `key_position_risks` table (17 fields), criticality levels, vacancy risk factors

---

## Part 3: Proposed New Chapter 7 Structure

### Recommended Focus: Operational Risk Management

Rather than duplicating analytical content from Chapter 10 and configuration content from Chapter 6, Chapter 7 should focus on **operational risk management workflows and governance** - the day-to-day execution and review processes.

### Proposed 10-Section Structure

```text
Part 7: Risk Management (~75 min read)
├── 7.1 Risk Management Overview
│   └── Framework introduction, chapter scope, cross-module dependencies
├── 7.2 Risk Terminology & Standards
│   └── Industry definitions (Oracle HCM, SAP SF), Risk of Loss vs Impact of Loss
├── 7.3 Employee Flight Risk Assessment Workflow
│   └── Operational workflow: detect, assess, document, action (FlightRiskTab.tsx)
├── 7.4 Retention Strategy & Action Planning
│   └── Retention actions, intervention types, escalation paths
├── 7.5 Position Vacancy Risk Monitoring
│   └── Retirement risk, market demand, tenure analysis, early warning system
├── 7.6 Risk Review Cadence & Governance
│   └── Monthly/quarterly review cycles, stakeholder roles, SLA compliance
├── 7.7 Risk Mitigation Playbooks
│   └── Standard response templates by risk level, escalation matrix
├── 7.8 AI-Assisted Risk Prediction
│   └── Predictive indicators, talent signals integration, confidence scoring
├── 7.9 Cross-Module Risk Integration
│   └── Links to Compensation, Learning, Performance, Workforce
└── 7.10 Risk Management Troubleshooting
    └── Common issues, data quality, calculation discrepancies
```

---

## Part 4: Database Schema Coverage

### Tables to Document in Chapter 7

| Table | Field Count | Coverage Location |
|-------|-------------|-------------------|
| `flight_risk_assessments` | 13 | Sec 7.3 (workflow context) |
| `key_position_risks` | 17 | Sec 7.5 (cross-ref to Ch 6.3) |

### New Fields to Emphasize (Operational Focus)

From `flight_risk_assessments`:
- `risk_factors` (JSONB) - Standard risk factor selection
- `retention_actions` - Action planning documentation
- `next_review_date` - Review cadence compliance
- `is_current` - Historical assessment tracking

---

## Part 5: UI Components to Document

| Component | Location | Chapter 7 Section |
|-----------|----------|-------------------|
| `FlightRiskTab.tsx` | src/components/succession/ | 7.3 (workflow) |
| `KeyPositionsTab.tsx` | src/components/succession/ | 7.5 (cross-ref) |
| `RetentionRiskMatrix.tsx` | src/components/succession/ | 7.4 (strategy) |
| `BenchStrengthTab.tsx` | src/components/succession/ | Cross-ref to Ch 10.3 |

---

## Part 6: Files to Create

### New Section Components (10 files)

| File | Location | Purpose |
|------|----------|---------|
| `RiskOverview.tsx` | `sections/risk/` | Sec 7.1 |
| `RiskTerminologyStandards.tsx` | `sections/risk/` | Sec 7.2 |
| `FlightRiskWorkflow.tsx` | `sections/risk/` | Sec 7.3 |
| `RetentionStrategyPlanning.tsx` | `sections/risk/` | Sec 7.4 |
| `VacancyRiskMonitoring.tsx` | `sections/risk/` | Sec 7.5 |
| `RiskReviewGovernance.tsx` | `sections/risk/` | Sec 7.6 |
| `RiskMitigationPlaybooks.tsx` | `sections/risk/` | Sec 7.7 |
| `AIAssistedRiskPrediction.tsx` | `sections/risk/` | Sec 7.8 |
| `CrossModuleRiskIntegration.tsx` | `sections/risk/` | Sec 7.9 |
| `RiskTroubleshooting.tsx` | `sections/risk/` | Sec 7.10 |
| `index.ts` | `sections/risk/` | Exports |

### Files to Modify

| File | Change |
|------|--------|
| `SuccessionRiskSection.tsx` | Replace placeholders with modular imports |
| `src/types/successionManual.ts` | Update TOC with 10 subsections |

---

## Part 7: Section Content Specifications

### Section 7.1: Risk Management Overview

**Content:**
- Chapter scope and purpose (operational focus vs. analytical)
- Industry framework (SAP SuccessFactors Risk & Retention model)
- Cross-chapter dependencies map
- Key performance indicators for risk management

**Cross-References:**
- Ch 6.3: Position Risk Assessment (configuration)
- Ch 10.3-10.4: Analytics and reporting

---

### Section 7.2: Risk Terminology & Standards

**Content:**
- Industry definitions (Oracle HCM pattern):
  - **Risk of Loss**: Probability employee will leave
  - **Impact of Loss**: Business consequence of departure
  - **Retention Risk**: Combined Risk × Impact assessment
- Risk level definitions (Critical, High, Medium, Low)
- Standard risk factors with categories

**Industry Alignment:** Oracle HCM, SAP SuccessFactors, Visier, SHRM

---

### Section 7.3: Employee Flight Risk Assessment Workflow

**Content:**
- Step-by-step workflow: Identify → Assess → Document → Action → Review
- FlightRiskTab.tsx UI walkthrough
- Field reference table (13 fields from `flight_risk_assessments`)
- Standard risk factors (10 predefined options)
- Retention action documentation
- is_current flag lifecycle

**UI Component:** `FlightRiskTab.tsx`
**Navigation:** Succession → Flight Risk

---

### Section 7.4: Retention Strategy & Action Planning

**Content:**
- Retention action categories:
  - Compensation adjustments
  - Career development opportunities
  - Work-life balance improvements
  - Manager relationship interventions
  - Executive retention conversations
- Escalation paths by risk level
- RetentionRiskMatrix.tsx visualization
- Action tracking and follow-up

**Business Rules:**
- High/Critical risk requires documented retention action within 48 hours
- All actions must have owner and due date
- Escalation to executive sponsor for Critical risk

---

### Section 7.5: Position Vacancy Risk Monitoring

**Content:**
- Vacancy risk triggers:
  - Retirement proximity (age + tenure analysis)
  - Flight risk signals from employees
  - Market demand for skills
  - Contract/assignment end dates
- KeyPositionsTab.tsx integration
- Early warning system configuration
- Cross-reference to Ch 6.3 for key_position_risks table

**Data Sources:**
- `key_position_risks.retirement_risk`
- `key_position_risks.flight_risk`
- `key_position_risks.vacancy_risk`

---

### Section 7.6: Risk Review Cadence & Governance

**Content:**
- Review cycle recommendations:
  - Critical positions: Monthly
  - High-risk employees: Bi-weekly
  - Standard monitoring: Quarterly
- Stakeholder roles (HR, Manager, Executive)
- `next_review_date` compliance tracking
- Meeting templates and agenda items
- Audit trail requirements (SOC 2)

**Industry Benchmark:** SHRM recommends quarterly talent risk reviews

---

### Section 7.7: Risk Mitigation Playbooks

**Content:**
- Standard response templates by risk level:
  - Low: Monitor + development plan
  - Medium: Manager check-in + career conversation
  - High: HR escalation + retention action plan
  - Critical: Executive intervention + counteroffer protocol
- Escalation matrix with SLAs
- Success metrics (retention rate improvement)

---

### Section 7.8: AI-Assisted Risk Prediction

**Content:**
- Talent signal integration for predictive risk
- Confidence scoring for AI recommendations
- Signal-to-risk mapping configuration
- AI-suggested risk levels with override capability
- Cross-reference to Ch 3 (Nine-Box signal mappings)

**Data Sources:**
- `talent_signal_snapshots` - Leading indicators
- `nine_box_signal_mappings` - Risk factor weights

---

### Section 7.9: Cross-Module Risk Integration

**Content:**
- Integration touchpoints:
  - **Compensation**: Below-market salary triggers
  - **Performance**: Declining ratings correlation
  - **Learning**: Stalled development indicators
  - **Workforce**: Tenure milestones, position changes
- Event-driven notifications
- Data flow architecture diagram

---

### Section 7.10: Risk Management Troubleshooting

**Content:**
- Common issues:
  - Risk level not updating
  - Missing retention actions
  - is_current flag conflicts
  - Review date overdue alerts
  - Data quality gaps
- Resolution procedures
- FAQ section

---

## Part 8: TOC Update for successionManual.ts

```typescript
// PART 7: RISK MANAGEMENT (~75 min)
{
  id: 'part-7',
  sectionNumber: '7',
  title: 'Risk Management',
  description: 'Operational risk management workflows, retention strategies, review governance, and AI-assisted prediction.',
  contentLevel: 'procedure',
  estimatedReadTime: 75,
  targetRoles: ['Admin', 'HR Partner', 'Manager'],
  subsections: [
    { id: 'sec-7-1', sectionNumber: '7.1', title: 'Risk Management Overview', ... },
    { id: 'sec-7-2', sectionNumber: '7.2', title: 'Risk Terminology & Standards', ... },
    { id: 'sec-7-3', sectionNumber: '7.3', title: 'Employee Flight Risk Assessment Workflow', ... },
    { id: 'sec-7-4', sectionNumber: '7.4', title: 'Retention Strategy & Action Planning', ... },
    { id: 'sec-7-5', sectionNumber: '7.5', title: 'Position Vacancy Risk Monitoring', ... },
    { id: 'sec-7-6', sectionNumber: '7.6', title: 'Risk Review Cadence & Governance', ... },
    { id: 'sec-7-7', sectionNumber: '7.7', title: 'Risk Mitigation Playbooks', ... },
    { id: 'sec-7-8', sectionNumber: '7.8', title: 'AI-Assisted Risk Prediction', ... },
    { id: 'sec-7-9', sectionNumber: '7.9', title: 'Cross-Module Risk Integration', ... },
    { id: 'sec-7-10', sectionNumber: '7.10', title: 'Risk Management Troubleshooting', ... }
  ]
}
```

---

## Part 9: Implementation Phases

### Phase 1: Structure & Foundation (1-2 hours)
- Create `src/components/enablement/manual/succession/sections/risk/` directory
- Create `index.ts` with all exports
- Update `SuccessionRiskSection.tsx` to import modular sections
- Update TOC in `successionManual.ts`

### Phase 2: Core Risk Sections (7.1-7.5) (4-5 hours)
- RiskOverview.tsx - Framework and cross-references
- RiskTerminologyStandards.tsx - Industry definitions
- FlightRiskWorkflow.tsx - Operational workflow with UI mapping
- RetentionStrategyPlanning.tsx - Action categories and escalation
- VacancyRiskMonitoring.tsx - Position-level monitoring

### Phase 3: Governance & Automation (7.6-7.8) (2-3 hours)
- RiskReviewGovernance.tsx - Review cycles and stakeholder roles
- RiskMitigationPlaybooks.tsx - Response templates
- AIAssistedRiskPrediction.tsx - Predictive analytics integration

### Phase 4: Integration & Support (7.9-7.10) (1-2 hours)
- CrossModuleRiskIntegration.tsx - Integration touchpoints
- RiskTroubleshooting.tsx - Common issues and FAQs

---

## Part 10: Quality Metrics After Implementation

| Metric | Current | Target |
|--------|---------|--------|
| Documented sections | 4 (placeholders) | 10 (comprehensive) |
| Lines of content | ~55 | ~2,500 |
| Field references | 0 | 30+ fields |
| UI component coverage | 0 | 4 components |
| Industry terminology alignment | 0% | 100% |
| Cross-references to other chapters | 0 | 8+ links |
| Troubleshooting guides | 0 | 10+ issues |
| Step-by-step workflows | 0 | 5+ procedures |

---

## Part 11: Estimated Effort

| Phase | Files | Lines | Time |
|-------|-------|-------|------|
| Phase 1: Structure | 3 | ~150 | 1-2 hours |
| Phase 2: Core Sections | 5 | ~1,200 | 4-5 hours |
| Phase 3: Governance | 3 | ~700 | 2-3 hours |
| Phase 4: Support | 2 | ~450 | 1-2 hours |
| **Total** | **13** | **~2,500** | **8-12 hours** |

---

## Part 12: Key Differentiators from Other Chapters

| Chapter | Focus | Chapter 7 Differentiation |
|---------|-------|---------------------------|
| Ch 6 (Succession Plans) | Configuration & Setup | Operational workflow execution |
| Ch 10 (Analytics) | Reporting & Metrics | Action planning & governance |
| Ch 7 (Risk) | Workflows & Governance | Day-to-day risk management processes |

This restructuring ensures Chapter 7 provides unique value as the **operational guide** for risk management, while properly cross-referencing analytical content in Chapter 10 and configuration content in Chapter 6.
