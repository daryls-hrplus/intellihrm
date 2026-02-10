

# Reorganize HSE Dashboard Categories to ISO 45001 Standard

## Analysis Summary

After reviewing all 32 database tables, 20 UI pages, and the dashboard grouping, the HSE module is **functionally complete** -- no missing pages or database gaps. The only issue is the **dashboard category organization** does not follow the ISO 45001 safety management lifecycle, which creates confusion for safety professionals.

## Current vs. Proposed Dashboard Organization

### Current Layout (6 groups with misplacements)

```text
Incident Management          Training & Compliance
  - Incidents                   - Safety Training
  - Near-Miss                   - Compliance         <-- wrong group
  - Safety Observations         - Toolbox Talks

Risk Prevention              Emergency Response
  - Risk Assessment              - Emergency Response
  - Inspections                  - First Aid
  - PPE Management               - Workers' Comp    <-- wrong group
  - SDS/Chemicals                - Permit to Work   <-- wrong group
  - Lock-out/Tag-out

Analytics                    Health & Safety Setup
  - HSE Analytics                - Safety Policies
                                 - OSHA Reporting   <-- wrong group
                                 - Ergonomics       <-- wrong group
```

### Proposed Layout (7 groups, ISO 45001 aligned)

```text
Incident Management          Hazard Controls
  - Incidents                   - SDS/Chemicals
  - Near-Miss Reports           - Lock-out/Tag-out
  - Safety Observations         - Permit to Work
                                - PPE Management

Risk & Compliance            Training & Awareness
  - Risk Assessment              - Safety Training
  - Workplace Inspections        - Toolbox Talks
  - Compliance

Emergency Preparedness       Claims & Recovery
  - Emergency Response           - Workers' Compensation
  - First Aid

Workplace Wellness           Governance & Reporting
  - Ergonomics                   - Safety Policies
                                 - OSHA Reporting
                                 - HSE Analytics
```

## Rationale (ISO 45001 PDCA Cycle)

| Group | ISO 45001 Phase | Why |
|-------|----------------|-----|
| Incident Management | Check | Reactive event capture -- what happened |
| Risk & Compliance | Plan | Proactive risk identification and regulatory tracking |
| Hazard Controls | Do | Active controls for specific hazard types |
| Training & Awareness | Do | Ensuring worker competency |
| Emergency Preparedness | Do | Preparing for emergency events |
| Claims & Recovery | Act | Post-incident claims and return-to-work |
| Workplace Wellness | Do | Proactive health management |
| Governance & Reporting | Act | Policies, regulatory reporting, and intelligence |

## Changes Required

### File 1: `HSEDashboardPage.tsx`

Restructure the `sections` array (lines 104-129) from 6 groups to 8 groups:

**New sections array:**

1. **"Incident Management"**: incidents, nearMiss, safetyObservations (unchanged)
2. **"Risk & Compliance"**: riskAssessment, inspections, compliance (compliance moved from Training)
3. **"Hazard Controls"**: chemicals, loto, permitToWork, ppe (permit-to-work moved from Emergency)
4. **"Training & Awareness"**: safetyTraining, toolboxTalks (compliance removed)
5. **"Emergency Preparedness"**: emergencyResponse, firstAid (workers' comp and permit removed)
6. **"Claims & Recovery"**: workersComp (new standalone group)
7. **"Workplace Wellness"**: ergonomics (moved from Setup)
8. **"Governance & Reporting"**: policies, oshaReporting, analytics (analytics moved from standalone group, ergonomics removed)

### No Other File Changes

- No database changes needed
- No route changes needed
- No page-level changes needed
- The capabilities document update will be a separate task after this reorganization is approved

## Technical Notes

- This is a text-only change to the `sections` array in `HSEDashboardPage.tsx` (lines 104-129)
- All module references (`allModules.*`) remain identical -- only their grouping changes
- The `GroupedModuleCards` component already supports any number of sections
- The build OOM error is pre-existing and unrelated

