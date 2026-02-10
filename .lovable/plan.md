

# Update Admin & Security and HR Hub Capability Components

## Problem

Same root cause as Workforce: the section components render hardcoded content and do not read from `capabilitiesData.ts`. The data file was updated but the two Prologue rendering components were not.

## Changes Required

### File 1: `src/components/enablement/product-capabilities/sections/prologue/AdminSecurityCapabilities.tsx`

#### 1. Update badge (line 21)
Change `"75+ Capabilities"` to `"95+ Capabilities"`

#### 2. Expand "Organizational Scope Controls" (lines 156-167)
Add 2 items:
- Cross-company reporting relationships for corporate groups, joint ventures, and managed services
- Company tag management with creation, assignment, and access-control integration

#### 3. Add new category: "ESS Administration" (~4 items)
Insert after "Approval Workflows & Delegation" block (after line 181):
- ESS module enablement with per-company on/off toggles for self-service features
- ESS approval policy configuration with auto-approve, HR review, and full workflow modes
- ESS field-level permissions controlling employee view/edit access per data domain
- ESS setup wizard with guided configuration and validation checks

Icon: `UserCog` (already imported)

#### 4. Add new category: "Platform Configuration" (~8 items)
Insert after ESS Administration:
- Custom field engine with field type configuration, module assignment, validation rules, and display ordering
- Brand customization with color scheme wizard, preset themes, and advanced CSS variable controls
- Translation management console with AI-assisted generation, bulk import/export, and coverage analytics
- Currency management with exchange rates, base currency configuration, and multi-currency support
- Territory management with geographic hierarchy, region definitions, and territory-based scoping
- Data management tools with sample data population, selective purge by module, and environment reset
- System-wide notification preferences and delivery channel configuration
- Platform health monitoring with usage analytics and capacity metrics

Icon: `Settings` (already imported)

#### 5. Add new category: "Multi-Tenant & Client Management" (~5 items)
Insert after Platform Configuration:
- Client registry with organization profiles, contact management, and status tracking
- Client provisioning workflows with environment setup and configuration templates
- Demo environment management with data seeding and automated teardown
- Prospect journey tracking with pipeline stages and conversion analytics
- Subscription management with plan tiers, billing cycles, and usage metering

Icon: `Briefcase` (already imported)

---

### File 2: `src/components/enablement/product-capabilities/sections/prologue/HRHubCapabilities.tsx`

#### 1. Update badge (line 25)
Change `"70+ Capabilities"` to `"85+ Capabilities"`

#### 2. Expand "Daily Operations" (lines 106-117)
Add 1 item:
- Employee directory privacy configuration with field-level visibility controls per data type

#### 3. Expand "Organization & Configuration" (lines 193-204)
Add 2 items:
- Reference data catalog with browsable system-wide lookup data, usage tracking, and data lineage
- Company values management with definitions, icons, alignment to recognition programs, and performance frameworks

#### 4. Add new category: "Company Intranet" (~5 items)
Insert after "Integration Hub" block (after line 232):
- Intranet content management with rich text articles, media embedding, and category organization
- Company announcement publishing with targeted audience selection and scheduling
- Banner management with priority ordering, display rules, and expiry dates
- Company-scoped content visibility with multi-entity publishing controls
- Content pinning, archival, and read-receipt tracking with analytics

Icon: `Globe` or `Newspaper` (needs import from lucide-react)

---

## What Does Not Change

- `capabilitiesData.ts` -- already updated
- `TableOfContents.tsx` -- already updated
- `ProductCapabilitiesDocument.tsx` -- already updated
- `WorkforceCapabilities.tsx` -- already updated
- `RecruitmentCapabilities.tsx` -- already up to date
- `OnboardingCapabilities.tsx` -- already up to date
- `OffboardingCapabilities.tsx` -- already up to date

## Note on Build OOM

The OOM error is a pre-existing infrastructure issue (9,697 modules, 3GB heap limit). These text-only edits do not add modules or imports.

