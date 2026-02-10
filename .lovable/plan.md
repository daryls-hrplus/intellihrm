

# Fix: Update TOC and Document to Reflect New Capability Counts

## Problem

The capability data in `capabilitiesData.ts` was updated with new categories and items, but two other files have **hardcoded capability counts** that were not updated to match:

1. **`TableOfContents.tsx`** — The sidebar TOC shows old counts (e.g., "Recruitment (75+)", "Workforce Management (60+)")
2. **`ProductCapabilitiesDocument.tsx`** — The Act divider summaries show old counts in the `modules` prop

## Changes Required

### File 1: `src/components/enablement/product-capabilities/components/TableOfContents.tsx`

Update the `PRODUCT_CAPABILITIES_TOC` array with corrected counts:

| Entry | Old | New |
|-------|-----|-----|
| Admin & Security | 80+ | 95+ |
| HR Hub | 70+ | 85+ |
| Prologue total | (implicit) | Update if shown |
| Recruitment | 75+ | 110+ |
| Workforce Management | 60+ | 195+ |
| Act 1 total | 245+ | 415+ |

Lines affected: 121-134

### File 2: `src/components/enablement/product-capabilities/ProductCapabilitiesDocument.tsx`

Update the `modules` array on the Act 1 divider (line 129):

Old: `["Recruitment (75+)", "Onboarding (55+)", "Offboarding (55+)", "Workforce Management (60+)"]`
New: `["Recruitment (110+)", "Onboarding (55+)", "Offboarding (55+)", "Workforce Management (195+)"]`

Also check the Prologue divider (line 97) -- currently shows no counts, so likely fine.

### No Other Files Needed

The `capabilitiesData.ts` file itself was already updated in the previous edit. The section components render dynamically from that data. Only these two hardcoded references need syncing.

## Note on Build OOM

The OOM error is a pre-existing infrastructure issue (9,697 modules exceeding the 3GB heap limit) unrelated to these content changes. These edits will not increase module count.
