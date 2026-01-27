
# Reset All Administrator Manuals to Version 1.0

## Overview

Since the application has not been released, all administrator manuals should be set to version 1.0 to indicate pre-release status. This aligns with industry-standard pre-release versioning practices where all development work contributes to the initial version until an official launch occurs.

---

## Industry Context

Enterprise software documentation (Workday, SAP SuccessFactors, ServiceNow) typically follows this versioning approach:

| Phase | Version | Meaning |
|-------|---------|---------|
| **Pre-Release Development** | 1.0.0-dev, 1.0.0-rc1, or simply 1.0 | All changes contribute to v1.0 until launch |
| **Initial Release** | 1.0.0 | First production-ready version |
| **Maintenance Updates** | 1.0.1, 1.0.2 | Bug fixes, minor clarifications |
| **Feature Updates** | 1.1.0, 1.2.0 | New sections, expanded content |
| **Major Revisions** | 2.0.0 | Significant restructuring or new module capabilities |

**Current State Issue**: Version numbers like 2.4, 2.7 imply multiple production releases have occurred, which misrepresents the documentation maturity to internal stakeholders and future customers.

---

## Files to Modify

### 1. Central Manual Definitions (Badge Display)
**File:** `src/constants/manualsStructure.ts`

All manuals will be set to `version: "1.0"`:

| Manual ID | Current Version | New Version |
|-----------|-----------------|-------------|
| admin-security | 2.4 | 1.0 |
| hr-hub | 2.4 | 1.0 |
| workforce | 2.4 | 1.0 |
| time-attendance | 2.4 | 1.0 |
| benefits | 2.4 | 1.0 |
| appraisals | 2.4 | 1.0 |
| goals | 2.4 | 1.0 |
| feedback-360 | 2.5 | 1.0 |
| succession | 1.0 | 1.0 (no change) |
| career-development | 1.0 | 1.0 (no change) |

### 2. Publishing Hook Configurations
**File:** `src/hooks/useManualPublishing.ts`

Update `MANUAL_CONFIGS` to use `version: 'v1.0.0'` for all manuals.

### 3. Version History Components (10 files)

Each manual's version history will be consolidated to show a single v1.0.0 entry with all current capabilities, plus a "Draft History" section for internal reference.

| Component File | Action |
|----------------|--------|
| `ManualVersionHistory.tsx` (Appraisals) | Reset to v1.0.0 |
| `HRHubManualVersionHistory.tsx` | Reset to v1.0.0 |
| `WorkforceManualVersionHistory.tsx` | Reset to v1.0.0 |
| `TimeAttendanceManualVersionHistory.tsx` | Reset to v1.0.0 |
| `BenefitsManualVersionHistory.tsx` | Reset to v1.0.0 |
| `F360VersionHistory.tsx` | Reset to v1.0.0 |
| `SuccessionVersionHistory.tsx` | Already at 1.x, reset to 1.0.0 |
| `CareerDevVersionHistory.tsx` | Already at 1.0.0 (no change) |

---

## Version History Structure (Post-Reset)

Each manual's version history will show:

```text
VERSION HISTORY
───────────────────────────────────────────────────

v1.0.0 (Current)
│
├── Status: Pre-Release
├── Last Updated: [Current Date]
├── Capabilities: [Full list of current features]
│
└── Note: This documentation is being prepared for initial release.
          All updates contribute to version 1.0 until product launch.
```

### Internal Draft History (Hidden from End Users)

For internal reference, a collapsed "Draft History" section will preserve the development changelog:

```text
DRAFT HISTORY (Internal Reference)
───────────────────────────────────────────────────

Build 7 (2026-01-23)
├── Reorganized chapters
├── Added calibration sections
└── [etc.]

Build 6 (2026-01-13)
├── Added values assessment
└── [etc.]
```

This maintains audit trail for internal stakeholders while presenting a clean v1.0 to external audiences.

---

## Technical Implementation

### Step 1: Update manualsStructure.ts

Change all version values to "1.0":

```typescript
// src/constants/manualsStructure.ts
manuals: [
  {
    id: "admin-security",
    // ... other properties
    version: "1.0",  // Changed from "2.4"
  },
  // ... repeat for all manuals
]
```

### Step 2: Update useManualPublishing.ts

```typescript
// src/hooks/useManualPublishing.ts
export const MANUAL_CONFIGS = [
  {
    id: 'admin-security',
    name: 'Admin & Security - Administrator Guide',
    version: 'v1.0.0',  // Changed from 'v1.3.0'
    // ...
  },
  // ... repeat for all manuals
];
```

### Step 3: Standardize Version History Components

Each version history component will be updated to:

1. Show v1.0.0 as the current version
2. Include "Pre-Release" status badge
3. List all current capabilities as part of v1.0
4. Add collapsible "Draft History" for internal changelog preservation

Example structure:

```typescript
const VERSION_HISTORY = [
  {
    version: '1.0.0',
    date: '2026-01-27',
    status: 'pre-release',
    changes: [
      'Initial release of [Manual Name]',
      'Complete documentation of all current features',
      // ... comprehensive feature list
    ],
  },
];

const DRAFT_HISTORY = [
  {
    build: '7',
    date: '2026-01-23',
    changes: ['Reorganized chapters...'],
  },
  // ... preserved development history
];
```

---

## Post-Implementation: Version Lifecycle

Once you are ready to launch:

1. **Pre-Release (Current)**: All manuals at v1.0.0 (Pre-Release status)
2. **GA Release**: Remove "Pre-Release" status, version remains 1.0.0
3. **First Update Post-GA**: Increment to 1.0.1 (patch) or 1.1.0 (minor feature)
4. **Major Module Overhaul**: Increment to 2.0.0

Publishing to Help Center:
- First publish: Creates KB articles at v1.0.0
- Subsequent updates (while still in 1.0): Patches remain at 1.0.x
- You control when to increment to 1.1.0 or 2.0.0

---

## Summary of Changes

| Change Type | Count | Files |
|-------------|-------|-------|
| Manual definition versions | 8 | manualsStructure.ts |
| Publishing config versions | 5 | useManualPublishing.ts |
| Version history resets | 8 | *VersionHistory.tsx components |
| **Total Files** | **10** | |

All manuals will display v1.0 in badges, cards, and version history, establishing a clean pre-release baseline.
