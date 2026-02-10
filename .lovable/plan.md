

# Update WorkforceCapabilities.tsx to Close Remaining Gaps

## Problem

The `WorkforceCapabilities.tsx` component renders hardcoded `<CapabilityCategory>` blocks -- it does **not** read from `capabilitiesData.ts`. While the data file was updated with new categories, the actual rendered document still shows the old 10 categories. Three entirely new categories are missing, and several existing ones need expanded items.

## Root Cause

Each section component (e.g., `WorkforceCapabilities.tsx`, `RecruitmentCapabilities.tsx`) maintains its own hardcoded capability items. The `capabilitiesData.ts` file serves as a reference/registry but is not consumed by the section components for rendering.

Recruitment, Onboarding, and Offboarding components were already up to date. Only **Workforce Management** has gaps.

## Changes (Single File)

**File:** `src/components/enablement/product-capabilities/sections/act1/WorkforceCapabilities.tsx`

### 1. Add new category: "Corporate Governance" (4 items)
Insert after the existing "Compliance & Documentation" category (around line 240):

- Board of directors management with member profiles and term tracking
- Management team composition and reporting structure
- Board meeting scheduling and attendance tracking
- Governance compliance reporting and oversight

Requires importing `Landmark` icon from lucide-react.

### 2. Add new category: "Capability Framework" (5 items)
Insert after Corporate Governance:

- Skills registry with proficiency levels and behavioral indicators
- Competency framework management with job linkage
- Organizational values definition with recognition alignment
- Capability audit filters for governance gap identification
- Capability-to-position mapping for talent architecture

Requires importing `Puzzle` or `Boxes` icon from lucide-react.

### 3. Add new category: "Employee Assignments" (4 items)
Insert after Capability Framework:

- Multi-assignment management with concurrent position support
- Acting and secondment assignment tracking with date ranges
- Primary vs. secondary assignment designation
- Assignment history and timeline visualization

Requires importing `UserCog` icon (already imported).

### 4. Expand "Organization Structure" category (line 144-156)
Add items for divisions, org changes, and config:

- Division management with hierarchical parent-child relationships
- Org changes reporting with historical comparison
- Org structure configuration with hierarchy rule management

### 5. Expand "Employee Master Data" category (line 116-128)
Add items for qualifications and responsibilities:

- Responsibility catalog with categorization and ownership
- Academic qualification tracking with institution and date management
- Professional certification management with expiry alerts

### 6. Expand "Position Management" category (line 158-170)
Add items for position control and vacancies:

- Position control dashboard with fill rate analytics
- Vacancy-to-requisition conversion workflow with recruitment linkage

### 7. Expand "Lifecycle Transactions" category (line 186-198)
Add items for transaction dashboard and expanded types:

- Transaction dashboard with module-based categorization (Entry, Movement, Exit, Compensation, Status)
- Contract extensions and conversions
- Probation confirmation and extension processing

### 8. Update module badge
Update the `badge` prop on the `ModuleCapabilityCard` (line 30 area) from whatever the current value is to `"195+ Capabilities"`.

## What Does Not Change

- `capabilitiesData.ts` -- already updated
- `TableOfContents.tsx` -- already updated
- `ProductCapabilitiesDocument.tsx` -- already updated
- `RecruitmentCapabilities.tsx` -- already has all needed categories
- `OffboardingCapabilities.tsx` -- already has all needed categories
- `OnboardingCapabilities.tsx` -- no gaps identified

## Note on Build Error

The OOM error (heap out of memory during build) is a pre-existing infrastructure issue caused by the project's 9,697 modules exceeding the 3GB heap limit. It is unrelated to these content changes.
