

# Product Capabilities Document -- Gap Analysis: Admin & Security + HR Hub

## Summary

After comparing the actual implemented pages in `/src/pages/admin/` and `/src/pages/hr-hub/` against the current Product Capabilities document (`capabilitiesData.ts`), I identified **15 functional areas** that exist in the codebase but are either missing entirely or insufficiently covered in the document.

---

## Module 1: Admin & Security -- Gaps Found

The current document covers 8 categories with ~75 capabilities. The following implemented features are **not documented or under-documented**:

### Gap 1: ESS Administration Hub (MISSING)
**Page:** `ESSAdministrationPage.tsx`
A dedicated administration console with three tabs:
- **Module Enablement** -- toggle ESS modules on/off per company
- **Approval Policies** -- configure approval modes (auto-approve, HR review, full workflow) per request type
- **Field Permissions** -- control which fields employees can view/edit in self-service

This is a significant governance feature (referenced in memory as "access-control-and-ess-administration-standard") that has no dedicated mention in the capabilities doc. The existing "Approval Workflows" category touches on approvals generically but doesn't address ESS-specific configuration.

**Recommendation:** Add new category "Employee Self-Service Administration" under Admin & Security, or add items to existing "Role-Based Access Control" / "Data Access" categories.

### Gap 2: Company Relationships (MISSING)
**Page:** `CompanyRelationshipsPage.tsx`
Cross-company reporting relationships for corporate groups, joint ventures, and managed services. This is distinct from the existing "Organizational Scope Controls" which only mentions company-level access restrictions.

**Recommendation:** Add to "Organizational Scope Controls" category: "Cross-company reporting relationships for corporate groups, joint ventures, and managed services"

### Gap 3: Company Tags (MISSING)
**Page:** `CompanyTagsPage.tsx`
Tagging system for companies. The doc mentions "company tag-based access controls" but doesn't describe the tag management itself.

**Recommendation:** Add to "Organizational Scope Controls": "Company tag management with creation, assignment, and access-control integration"

### Gap 4: Currency Management (MISSING)
**Page:** `CurrencyManagementPage.tsx` (676 lines)
Full currency management with exchange rates, base currency configuration, and multi-currency support. This is foundational platform configuration not captured anywhere.

**Recommendation:** Add new items to "Organizational Scope Controls" or create a new "Platform Configuration" category covering currency management, exchange rate maintenance, and group base currency settings.

### Gap 5: Territories Management (MISSING)
**Page:** `TerritoriesPage.tsx` (490 lines)
Geographic territory definitions with hierarchy and assignment. Not mentioned in the document.

**Recommendation:** Add to "Organizational Scope Controls": "Territory management with geographic hierarchy, region definitions, and territory-based access scoping"

### Gap 6: Custom Fields Configuration (MISSING)
**Page:** `AdminCustomFieldsPage.tsx`
Admin-configurable custom fields per module. The Workforce module mentions "unlimited custom fields" for employees, but the Admin & Security module doesn't document the custom field engine itself.

**Recommendation:** Add to a new "Platform Configuration" category: "Custom field engine with field type configuration, module assignment, validation rules, and display ordering"

### Gap 7: Branding & Color Scheme (MISSING)
**Page:** `AdminColorSchemePage.tsx`
Brand wizard, color presets, and advanced color customization. Zero mention in the document.

**Recommendation:** Add to "Platform Configuration": "Brand customization with color scheme wizard, preset themes, and advanced CSS variable controls"

### Gap 8: Translation Management (MISSING)
**Page:** `TranslationsPage.tsx` (1,031 lines)
Full translation management with AI-assisted translation generation, import/export, and multi-language support. The doc mentions "Multi-language" in cross-cutting concerns but doesn't describe the actual management interface.

**Recommendation:** Add to "Platform Configuration": "Translation management console with AI-assisted generation, bulk import/export, language-specific overrides, and coverage analytics"

### Gap 9: Data Management (MISSING)
**Page:** `DataManagementPage.tsx` (643 lines)
Data population and purge tools for demo/test environments. This is an implementation/admin tooling feature.

**Recommendation:** Add to "Platform Configuration": "Data management tools with sample data population, selective data purge by module, and environment reset capabilities"

### Gap 10: Client Provisioning & Registry (MISSING)
**Pages:** `ClientRegistryPage.tsx`, `ClientProvisioningPage.tsx`, `ClientDetailPage.tsx`, `ProspectJourneyPage.tsx`, `DemoManagementPage.tsx`, `SubscriptionManagementPage.tsx`
Complete SaaS client lifecycle management. This is a platform-level capability for multi-tenant deployments.

**Recommendation:** Add a new category "Multi-Tenant & Client Management" with items covering client registry, provisioning workflows, demo environment management, prospect journey tracking, and subscription management.

---

## Module 2: HR Hub -- Gaps Found

The current document covers 8 categories with ~70 capabilities. The following are missing:

### Gap 11: Company Intranet (MISSING)
**Page:** `IntranetAdminPage.tsx` (928 lines)
Full intranet system with announcements, banners, content management, and company-scoped publishing. This is a substantial feature with no mention in the document.

**Recommendation:** Add new category "Company Intranet" with items: content management, announcement publishing, banner management, company-scoped visibility, and pinning/scheduling.

### Gap 12: Directory Privacy Configuration (MISSING)
**Page:** `DirectoryPrivacyConfigPage.tsx` (470 lines)
Granular privacy controls for the employee directory -- which fields are visible, to whom, per field type (phone, email, etc.).

**Recommendation:** Add to "Communication & Support" or "Daily Operations": "Employee directory privacy configuration with field-level visibility controls per data type (phone, email, department, hire date)"

### Gap 13: Reference Data Catalog (MISSING)
**Page:** `ReferenceDataCatalogPage.tsx`
A browsable catalog of all reference/lookup data in the system.

**Recommendation:** Add to "Organization & Configuration": "Reference data catalog with browsable system-wide lookup data, usage tracking, and data lineage"

### Gap 14: Recognition Analytics (UNDER-DOCUMENTED)
**Page:** `RecognitionAnalyticsPage.tsx`
The doc mentions "Recognition analytics with program effectiveness, leaderboards, and values alignment" as one line item, but the actual implementation is a full analytics dashboard. Consider expanding.

**Recommendation:** Minor -- current coverage is adequate as a line item.

### Gap 15: Company Values Management (MISSING)
**Page:** `CompanyValuesPage.tsx`
Define and manage organizational values that feed into recognition programs and performance management. Not documented.

**Recommendation:** Add to HR Hub "Organization & Configuration" or Admin "Organizational Scope Controls": "Company values management with definitions, icons, alignment to recognition programs, and performance frameworks"

---

## Proposed Changes to `capabilitiesData.ts`

### For Admin & Security module:
1. **Add new category: "Platform Configuration"** with ~8 items covering:
   - Custom field engine
   - Brand/color scheme customization
   - Translation management with AI generation
   - Currency management with exchange rates
   - Territory management
   - Data management tools
2. **Add new category: "ESS Administration"** with ~4 items covering module enablement, approval policies, field permissions, and setup wizard
3. **Add new category: "Multi-Tenant & Client Management"** with ~5 items covering client registry, provisioning, demo management, prospect tracking, subscriptions
4. **Expand "Organizational Scope Controls"** with 2-3 items for company relationships, tag management

### For HR Hub module:
1. **Add new category: "Company Intranet"** with ~5 items covering content management, announcements, banners, company-scoped publishing
2. **Expand "Organization & Configuration"** with items for reference data catalog, company values management
3. **Expand "Daily Operations"** with directory privacy configuration

### Badge Updates:
- Admin & Security: Update from "75+ Capabilities" to "95+ Capabilities"
- HR Hub: Update from "70+ Capabilities" to "85+ Capabilities"
- Executive Summary stats: Update total from "1,675+" to "1,710+" (approximate)

---

## Technical Implementation

All changes are confined to a single file:
- `src/components/enablement/product-capabilities/data/capabilitiesData.ts`

Each gap translates to either:
- New `CapabilityCategoryData` entries added to the `categories` array of the relevant module
- New items added to existing category `items` arrays
- Updated badge strings

No structural or schema changes needed. The existing PDF export, table of contents, and web rendering will automatically pick up the new content.

