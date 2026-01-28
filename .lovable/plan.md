
# Remove HRplus References from L&D Manual

## Overview
Remove all "HRplus" brand references from the Learning & Development Manual's Legacy Migration section while keeping the migration guide generic and useful for any legacy system migration.

## Changes Required

### File: `src/components/enablement/learning-development-manual/sections/overview/LndLegacyMigration.tsx`

**2 changes needed:**

1. **Line 70-73** - Update introductory paragraph:
   - **Current:** "Organizations migrating from HRplus Training or similar legacy systems will find this mapping guide..."
   - **New:** "Organizations migrating from legacy training management systems will find this mapping guide essential for understanding how existing concepts translate to Intelli HRM L&D."

2. **Line 89** - Update table column header:
   - **Current:** "Legacy (HRplus)"
   - **New:** "Legacy System"

## Summary
- Total files to modify: **1**
- Total line changes: **2**
- No other files contain HRplus references in the L&D manual
