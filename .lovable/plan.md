

# Fix Manual Version Discrepancy - Sync Database with Pre-Release Standard

## Problem Summary

The Content Creation Studio's Manual Content selector is displaying **outdated versions** (e.g., "v1.3.0") because it reads from the `manual_definitions` database table, which was never updated when the v1.0.0 pre-release reset was established.

| Manual | Version in DB | Should Be |
|--------|--------------|-----------|
| Admin & Security | 1.4.0 | 1.0.0 |
| Performance Appraisal | 1.3.0 | 1.0.0 |
| Workforce | 1.3.0 | 1.0.0 |
| HR Hub | 1.3.0 | 1.0.0 |
| Goals | 1.3.0 | 1.0.0 |
| Benefits Administrator | 1.0.0 | Already correct |

### Root Cause

- **Static config** (`MANUAL_CONFIGS` in `useManualPublishing.ts`): Shows correct v1.0.0
- **Database** (`manual_definitions` table): Has old versions (1.3.0, 1.4.0)
- **Content Creation Studio** (`ManualContentSelector`): Reads from database, shows wrong versions

---

## Solution

### Part 1: Database Update (Immediate Fix)

Run a SQL migration to reset all manual versions to `1.0.0` to align with the pre-release documentation standard.

```sql
UPDATE manual_definitions
SET current_version = '1.0.0',
    updated_at = NOW()
WHERE current_version != '1.0.0';
```

This will update:
- admin-security: 1.4.0 → 1.0.0
- appraisals: 1.3.0 → 1.0.0
- workforce: 1.3.0 → 1.0.0
- hr-hub: 1.3.0 → 1.0.0
- goals: 1.3.0 → 1.0.0

### Part 2: Version Source Consistency (Long-term Fix)

To prevent future discrepancies, update the `ManualContentSelector` to optionally use the `MANUAL_CONFIGS` as the source of truth for versions, with database as fallback. This ensures the UI displays consistent versions everywhere.

**Option A (Recommended)**: Keep database as source but ensure future version bumps follow the version freeze logic

**Option B**: Add a version override from `MANUAL_CONFIGS` when fetching manuals

---

## Implementation Steps

### Step 1: Run Database Migration

Update all manual definitions to v1.0.0:

```sql
UPDATE manual_definitions
SET current_version = '1.0.0',
    updated_at = NOW()
WHERE current_version != '1.0.0'
  AND manual_code IN ('admin-security', 'appraisals', 'workforce', 'hr-hub', 'goals');
```

### Step 2: Clean Up Duplicate Entries

The database query also showed some duplicate/test entries that should be cleaned up:
- `ben_ad` (Benefits Administrator Manual) - possibly a test entry
- `h` (HR Hub Admin Guide) - duplicate of hr-hub

```sql
DELETE FROM manual_definitions
WHERE manual_code IN ('ben_ad', 'h');
```

### Step 3: Verify Version Freeze Logic

Ensure that when manuals are regenerated via the Content Creation Agent, the version bump respects the pre-release version freeze (only patch increments allowed during pre-release).

The `useRegenerateManual` hook already supports `versionBump` parameter - this should be enforced to only allow `patch` during pre-release.

---

## Expected Outcome

After migration:
- Content Creation Studio shows "Performance Appraisal - Administrator Guide v1.0.0"
- All 10 Administrator Manuals display v1.0.0
- Duplicate/test manual entries are removed
- Version display is consistent between:
  - Administrator Manuals page (MANUAL_CONFIGS)
  - Content Creation Studio (manual_definitions DB)
  - Publishing wizard (uses both sources)

---

## Files Modified

| File | Changes |
|------|---------|
| **Database migration** | Reset `current_version` to `1.0.0` for all manuals |
| **Database cleanup** | Remove duplicate/test manual definitions |

No code file changes required - this is purely a data correction to align the database with the documented pre-release standard.

