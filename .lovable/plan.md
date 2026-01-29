
# Implementation Plan: L&D Manual Chapter 5 - Sections D, E, F (5.12-5.23)

## Summary

Create the remaining 12 comprehensive documentation components for Chapter 5 (Compliance Training), completing Sections D, E, and F as per the approved plan. This includes full HSE integration documentation with database field references.

---

## Files to Create

### Section D: Escalation & Enforcement (5.12-5.15)

| File | Section | Key Content |
|------|---------|-------------|
| `LndComplianceEscalationRules.tsx` | 5.12 | Escalation tier configuration (1-4), SLA definitions, notification chains, escalation_level field tracking |
| `LndComplianceGracePeriodOps.tsx` | 5.13 | Grace period configuration, extension requests, time tracking, manager override workflows |
| `LndComplianceNonCompliance.tsx` | 5.14 | Non-compliance consequences matrix, policy enforcement actions, system flags, HR linkage |
| `LndComplianceHRIntervention.tsx` | 5.15 | HR workflow integration, disciplinary linkage, intervention tracking, escalation resolution |

### Section E: Audit & Reporting (5.16-5.19)

| File | Section | Key Content |
|------|---------|-------------|
| `LndComplianceAuditTrail.tsx` | 5.16 | Audit log schema, retention policies, tamper-proof logging, query patterns |
| `LndComplianceRegulatoryReports.tsx` | 5.17 | OSHA 300A integration, standard report templates, export formats, scheduling |
| `LndComplianceEvidencePackage.tsx` | 5.18 | Audit preparation workflows, evidence assembly, documentation packages, regulator interface |
| `LndComplianceHistoricalRecords.tsx` | 5.19 | Data archival, retention schedules, GDPR compliance, historical query access |

### Section F: HSE & Industry Compliance (5.20-5.23)

| File | Section | Key Content |
|------|---------|-------------|
| `LndComplianceHSEIntegration.tsx` | 5.20 | **Full HSE-LMS bidirectional integration**: `hse_safety_training` (17 fields) ↔ `lms_courses` linkage, `hse_training_records` (15 fields) sync with `lms_enrollments` |
| `LndComplianceIncidentTraining.tsx` | 5.21 | **Incident-triggered training**: `hse_incidents.corrective_actions` → training request workflow, remedial training automation |
| `LndComplianceOSHA.tsx` | 5.22 | **OSHA certification tracking**: `hse_osha_logs` (22 fields), OSHA 10/30-Hour, `is_osha_reportable` flag integration, OSHA 300A report generation |
| `LndComplianceCaribbean.tsx` | 5.23 | Caribbean regional requirements: Jamaica OSHA Act, Trinidad OSH Act, Barbados Safety & Health at Work Act, regional calendar compliance |

---

## Files to Modify

### 1. `sections/compliance/index.ts`
Add 12 new exports for Sections D-F:
```typescript
// Section D: Escalation & Enforcement (5.12-5.15)
export { LndComplianceEscalationRules } from './LndComplianceEscalationRules';
export { LndComplianceGracePeriodOps } from './LndComplianceGracePeriodOps';
export { LndComplianceNonCompliance } from './LndComplianceNonCompliance';
export { LndComplianceHRIntervention } from './LndComplianceHRIntervention';

// Section E: Audit & Reporting (5.16-5.19)
export { LndComplianceAuditTrail } from './LndComplianceAuditTrail';
export { LndComplianceRegulatoryReports } from './LndComplianceRegulatoryReports';
export { LndComplianceEvidencePackage } from './LndComplianceEvidencePackage';
export { LndComplianceHistoricalRecords } from './LndComplianceHistoricalRecords';

// Section F: HSE & Industry Compliance (5.20-5.23)
export { LndComplianceHSEIntegration } from './LndComplianceHSEIntegration';
export { LndComplianceIncidentTraining } from './LndComplianceIncidentTraining';
export { LndComplianceOSHA } from './LndComplianceOSHA';
export { LndComplianceCaribbean } from './LndComplianceCaribbean';
```

### 2. `LndComplianceSection.tsx`
Replace placeholder Cards (lines 113-154) with actual component imports and renders for Sections D, E, and F.

---

## Database Tables Documented

| Table | Fields | Section |
|-------|--------|---------|
| `hse_safety_training` | 17 fields | 5.20 |
| `hse_training_records` | 15 fields | 5.20, 5.21 |
| `hse_incidents` | 30+ fields | 5.21 |
| `hse_osha_logs` | 22 fields | 5.22 |

---

## Component Content Standards

Each component will include:

1. **Learning Objectives** (3-5 bullets)
2. **Database Field Reference Table** (where applicable)
3. **ASCII Workflow/Architecture Diagrams**
4. **Step-by-Step Configuration Procedures**
5. **Business Rules & Validation Logic**
6. **Notification Event Integration**
7. **Access Control Matrix** (role-based permissions)

---

## Technical Implementation Details

### Section 5.20: HSE Training Integration

```text
hse_safety_training.lms_course_id ──FK──> lms_courses.id

Sync Flow:
1. HSE Officer creates safety training requirement
2. Links to LMS course via lms_course_id
3. System auto-assigns employees matching:
   - applicable_departments[]
   - applicable_positions[]
4. LMS enrollment created with source='hse'
5. Completion syncs back to hse_training_records
6. Expiry tracked in both systems (frequency_months)
```

### Section 5.21: Incident-Triggered Training

```text
hse_incidents.corrective_actions → training_requests

Trigger Conditions:
- Near-miss incidents: Auto-enroll in safety refresher
- Recordable injuries: Mandatory retraining
- OSHA reportable: Full certification review

Fields Used:
- hse_incidents.incident_type
- hse_incidents.corrective_actions
- hse_incidents.is_osha_reportable
- hse_incidents.is_recordable
```

### Section 5.22: OSHA & Safety Certification

```text
hse_osha_logs Schema (22 fields):
- log_year, establishment_name, naics_code
- total_deaths, total_days_away, total_job_transfer
- injury_cases (JSONB), illness_cases (JSONB)
- certification_date, certified_by, status

Integration: Training gaps flagged in OSHA 300A generation
```

---

## Summary

| Category | Count |
|----------|-------|
| New Components | 12 |
| Modified Files | 2 |
| Database Tables Documented | 4 |
| Total Chapter 5 Sections | 23 (complete) |
