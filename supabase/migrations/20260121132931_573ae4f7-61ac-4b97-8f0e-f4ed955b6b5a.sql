-- Enhanced Option A: Fix responsibility_id FK and add kra_snapshot_id for flexible evidence linking

-- Step 1: Drop the incorrect FK constraint on responsibility_id
ALTER TABLE performance_evidence 
  DROP CONSTRAINT IF EXISTS performance_evidence_responsibility_id_fkey;

-- Step 2: Add correct FK to responsibilities table (for responsibility-level evidence)
ALTER TABLE performance_evidence 
  ADD CONSTRAINT performance_evidence_responsibility_id_fkey 
  FOREIGN KEY (responsibility_id) 
  REFERENCES responsibilities(id) ON DELETE SET NULL;

-- Step 3: Add new column for KRA-level evidence linking (for detailed appraisals)
ALTER TABLE performance_evidence 
  ADD COLUMN IF NOT EXISTS kra_snapshot_id UUID REFERENCES appraisal_kra_snapshots(id) ON DELETE SET NULL;

-- Step 4: Add index for efficient KRA evidence lookups
CREATE INDEX IF NOT EXISTS idx_performance_evidence_kra_snapshot 
  ON performance_evidence(kra_snapshot_id) 
  WHERE kra_snapshot_id IS NOT NULL;

-- Step 5: Add comment explaining the dual-linking strategy
COMMENT ON COLUMN performance_evidence.responsibility_id IS 
  'Links evidence to responsibility-level appraisal items. Used when appraisal is configured at responsibility (task) level.';

COMMENT ON COLUMN performance_evidence.kra_snapshot_id IS 
  'Links evidence to KRA-level appraisal items. Used when appraisal is configured for detailed KRA-based evaluation.';