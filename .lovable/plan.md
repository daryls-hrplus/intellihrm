

# L&D Workflow Template Seeding Plan
## Industry-Aligned HR Hub Integration

---

## Executive Summary

This plan implements **industry-standard L&D workflow templates** seeded in the HR Hub workflow engine, aligned with best practices from Workday Learning, SAP SuccessFactors, and Cornerstone OnDemand. The current `TRAINING_REQUEST_APPROVAL` template exists but has **0 steps configured**, leaving L&D workflows disconnected from the unified HR Hub approval engine.

---

## Current State Analysis

| Component | Status | Gap |
|-----------|--------|-----|
| `TRAINING_REQUEST_APPROVAL` template | EXISTS (0 steps) | No approval chain configured |
| `training_request` workflow category | EXISTS in enum | Not actively used |
| `learning_approval` category | EXISTS in enum | No templates using it |
| `certification_request` workflow code | DEFINED in module structure | No template exists |
| Cost-based routing | DOCUMENTED | Not implemented |
| Multi-level approval chain | DOCUMENTED | Not seeded |

---

## Industry-Standard L&D Workflows to Seed

### 1. Training Request Approval (Cost-Based Routing)

**Industry Pattern (Workday/SAP):** Training requests route through different approval chains based on cost thresholds.

| Cost Tier | Approval Chain | SLA |
|-----------|---------------|-----|
| < $500 | Manager only | 24h |
| $500 - $2,500 | Manager → HR | 24h + 48h |
| $2,500 - $10,000 | Manager → HR → Finance | 24h + 48h + 24h |
| > $10,000 | Manager → HR → Finance → Executive | 24h + 48h + 24h + 72h |

**Template:** `TRAINING_REQUEST_APPROVAL` (update existing)

### 2. Certification Request Approval (NEW)

**Industry Pattern:** Professional certifications (AWS, PMP, SHRM) require pre-approval due to exam fees and study time allocation.

| Step | Approver | SLA | Escalation |
|------|----------|-----|------------|
| 1 | Direct Manager | 24h | Skip to HR |
| 2 | HR Learning Team | 48h | Auto-approve |

**Template:** `CERTIFICATION_REQUEST_APPROVAL` (create new)

### 3. External Training Record Verification (NEW)

**Industry Pattern:** Employee-submitted external training requires HR verification before appearing on official transcript.

| Step | Approver | SLA | Escalation |
|------|----------|-----|------------|
| 1 | HR Learning Team | 72h | Send reminder |

**Template:** `EXTERNAL_TRAINING_VERIFICATION` (create new)

### 4. Recertification Request Approval (NEW)

**Industry Pattern:** Expiring certifications trigger auto-requests that need streamlined approval.

| Step | Approver | SLA | Escalation |
|------|----------|-----|------------|
| 1 | Direct Manager | 48h | Auto-approve (if mandatory) |

**Template:** `RECERTIFICATION_REQUEST_APPROVAL` (create new)

### 5. Training Budget Exception Request (NEW)

**Industry Pattern:** Requests exceeding department training budget caps require CFO/Finance approval.

| Step | Approver | SLA | Escalation |
|------|----------|-----|------------|
| 1 | Department Head | 48h | Skip to HR |
| 2 | HR Budget Manager | 48h | Notify Finance |
| 3 | Finance Approval | 72h | Escalate to CFO |

**Template:** `TRAINING_BUDGET_EXCEPTION` (create new)

---

## Database Changes Required

### A. Add New Workflow Category Enum Values

```sql
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'certification_request';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'external_training';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'recertification_request';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'training_budget';
```

### B. Seed Workflow Templates (5 total)

1. **Update existing TRAINING_REQUEST_APPROVAL** with 3 default steps
2. **Create CERTIFICATION_REQUEST_APPROVAL** with 2 steps
3. **Create EXTERNAL_TRAINING_VERIFICATION** with 1 step
4. **Create RECERTIFICATION_REQUEST_APPROVAL** with 1 step
5. **Create TRAINING_BUDGET_EXCEPTION** with 3 steps

### C. Seed Workflow Steps (10 total steps across 5 templates)

Each step includes:
- `step_order` - Sequence in chain
- `name` - Display name
- `description` - What this step does
- `approver_type` - manager | hr | role
- `use_reporting_line` - TRUE for manager steps
- `requires_comment` - TRUE for rejections
- `escalation_hours` - SLA deadline
- `sla_warning_hours` - Warning threshold
- `can_delegate` - Allow delegation

---

## Implementation Details

### Phase 1: Migration SQL

**File:** `supabase/migrations/XXXXXX_seed_lnd_workflow_templates.sql`

```sql
-- =========================================================
-- LEARNING & DEVELOPMENT WORKFLOW TEMPLATES SEED
-- Industry-aligned templates following Workday/SAP patterns
-- =========================================================

-- Add new workflow categories for L&D
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'certification_request';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'external_training';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'recertification_request';
ALTER TYPE workflow_category ADD VALUE IF NOT EXISTS 'training_budget';

-- Get system user for created_by
DO $$
DECLARE
  v_system_user_id UUID;
BEGIN
  SELECT id INTO v_system_user_id FROM profiles WHERE email LIKE '%admin%' LIMIT 1;
  IF v_system_user_id IS NULL THEN
    SELECT id INTO v_system_user_id FROM profiles LIMIT 1;
  END IF;
  
  -- ===============================================
  -- 1. TRAINING REQUEST APPROVAL (Update Existing)
  -- ===============================================
  
  -- Add Step 1: Manager Approval
  INSERT INTO workflow_steps (
    template_id, step_order, name, description, approver_type,
    use_reporting_line, requires_signature, requires_comment,
    can_delegate, escalation_hours, sla_warning_hours, is_active
  )
  SELECT 
    wt.id, 1, 'Manager Approval',
    'Direct manager reviews training relevance, timing, and cost justification',
    'manager', true, false, false, true, 24, 16, true
  FROM workflow_templates wt
  WHERE wt.code = 'TRAINING_REQUEST_APPROVAL'
  AND NOT EXISTS (
    SELECT 1 FROM workflow_steps ws 
    WHERE ws.template_id = wt.id AND ws.step_order = 1
  );
  
  -- Add Step 2: HR Learning Review
  INSERT INTO workflow_steps (
    template_id, step_order, name, description, approver_type,
    use_reporting_line, requires_signature, requires_comment,
    can_delegate, escalation_hours, sla_warning_hours, is_active
  )
  SELECT 
    wt.id, 2, 'HR Learning Review',
    'HR validates training provider, negotiates rates, and confirms budget availability',
    'hr', false, false, true, true, 48, 24, true
  FROM workflow_templates wt
  WHERE wt.code = 'TRAINING_REQUEST_APPROVAL'
  AND EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 1)
  AND NOT EXISTS (
    SELECT 1 FROM workflow_steps ws 
    WHERE ws.template_id = wt.id AND ws.step_order = 2
  );
  
  -- Add Step 3: Finance Approval (for high-cost training)
  INSERT INTO workflow_steps (
    template_id, step_order, name, description, approver_type,
    use_reporting_line, requires_signature, requires_comment,
    can_delegate, escalation_hours, sla_warning_hours, is_active
  )
  SELECT 
    wt.id, 3, 'Finance Approval',
    'Finance reviews budget impact for training requests exceeding $2,500',
    'role', false, false, true, false, 72, 48, true
  FROM workflow_templates wt
  WHERE wt.code = 'TRAINING_REQUEST_APPROVAL'
  AND EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 2)
  AND NOT EXISTS (
    SELECT 1 FROM workflow_steps ws 
    WHERE ws.template_id = wt.id AND ws.step_order = 3
  );

  -- ===============================================
  -- 2. CERTIFICATION REQUEST APPROVAL (New Template)
  -- ===============================================
  
  INSERT INTO workflow_templates (
    name, code, category, description, is_global, is_active,
    requires_signature, requires_letter, auto_terminate_hours,
    allow_return_to_previous, created_by, start_date
  )
  SELECT
    'Certification Request Approval',
    'CERTIFICATION_REQUEST_APPROVAL',
    'certification_request'::workflow_category,
    'Approval workflow for professional certification exams and renewals (AWS, PMP, SHRM, etc.)',
    true, true, false, false, 168, true, v_system_user_id, CURRENT_DATE
  WHERE NOT EXISTS (
    SELECT 1 FROM workflow_templates WHERE code = 'CERTIFICATION_REQUEST_APPROVAL'
  );
  
  -- Certification Step 1: Manager
  INSERT INTO workflow_steps (
    template_id, step_order, name, description, approver_type,
    use_reporting_line, requires_signature, requires_comment,
    can_delegate, escalation_hours, sla_warning_hours, is_active
  )
  SELECT 
    wt.id, 1, 'Manager Approval',
    'Manager confirms certification aligns with role requirements and approves study time allocation',
    'manager', true, false, false, true, 24, 16, true
  FROM workflow_templates wt
  WHERE wt.code = 'CERTIFICATION_REQUEST_APPROVAL'
  AND NOT EXISTS (
    SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id
  );
  
  -- Certification Step 2: HR Learning
  INSERT INTO workflow_steps (
    template_id, step_order, name, description, approver_type,
    use_reporting_line, requires_signature, requires_comment,
    can_delegate, escalation_hours, sla_warning_hours, is_active
  )
  SELECT 
    wt.id, 2, 'HR Learning Approval',
    'HR Learning team validates certification provider and registers employee for exam',
    'hr', false, false, false, true, 48, 24, true
  FROM workflow_templates wt
  WHERE wt.code = 'CERTIFICATION_REQUEST_APPROVAL'
  AND EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 1)
  AND NOT EXISTS (
    SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 2
  );

  -- ===============================================
  -- 3. EXTERNAL TRAINING VERIFICATION (New Template)
  -- ===============================================
  
  INSERT INTO workflow_templates (
    name, code, category, description, is_global, is_active,
    requires_signature, requires_letter, auto_terminate_hours,
    allow_return_to_previous, created_by, start_date
  )
  SELECT
    'External Training Verification',
    'EXTERNAL_TRAINING_VERIFICATION',
    'external_training'::workflow_category,
    'HR verification workflow for employee-submitted external training records before transcript inclusion',
    true, true, false, false, 168, true, v_system_user_id, CURRENT_DATE
  WHERE NOT EXISTS (
    SELECT 1 FROM workflow_templates WHERE code = 'EXTERNAL_TRAINING_VERIFICATION'
  );
  
  -- External Training Step 1: HR Verification
  INSERT INTO workflow_steps (
    template_id, step_order, name, description, approver_type,
    use_reporting_line, requires_signature, requires_comment,
    can_delegate, escalation_hours, sla_warning_hours, is_active
  )
  SELECT 
    wt.id, 1, 'HR Verification',
    'HR validates training completion certificate, duration, and provider legitimacy',
    'hr', false, false, true, true, 72, 48, true
  FROM workflow_templates wt
  WHERE wt.code = 'EXTERNAL_TRAINING_VERIFICATION'
  AND NOT EXISTS (
    SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id
  );

  -- ===============================================
  -- 4. RECERTIFICATION REQUEST APPROVAL (New Template)
  -- ===============================================
  
  INSERT INTO workflow_templates (
    name, code, category, description, is_global, is_active,
    requires_signature, requires_letter, auto_terminate_hours,
    allow_return_to_previous, created_by, start_date
  )
  SELECT
    'Recertification Request Approval',
    'RECERTIFICATION_REQUEST_APPROVAL',
    'recertification_request'::workflow_category,
    'Streamlined approval for certification renewal requests triggered by expiry reminders',
    true, true, false, false, 120, true, v_system_user_id, CURRENT_DATE
  WHERE NOT EXISTS (
    SELECT 1 FROM workflow_templates WHERE code = 'RECERTIFICATION_REQUEST_APPROVAL'
  );
  
  -- Recertification Step 1: Manager
  INSERT INTO workflow_steps (
    template_id, step_order, name, description, approver_type,
    use_reporting_line, requires_signature, requires_comment,
    can_delegate, escalation_hours, sla_warning_hours, is_active
  )
  SELECT 
    wt.id, 1, 'Manager Approval',
    'Manager confirms continued need for certification and approves renewal cost',
    'manager', true, false, false, true, 48, 24, true
  FROM workflow_templates wt
  WHERE wt.code = 'RECERTIFICATION_REQUEST_APPROVAL'
  AND NOT EXISTS (
    SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id
  );

  -- ===============================================
  -- 5. TRAINING BUDGET EXCEPTION (New Template)
  -- ===============================================
  
  INSERT INTO workflow_templates (
    name, code, category, description, is_global, is_active,
    requires_signature, requires_letter, auto_terminate_hours,
    allow_return_to_previous, created_by, start_date
  )
  SELECT
    'Training Budget Exception Request',
    'TRAINING_BUDGET_EXCEPTION',
    'training_budget'::workflow_category,
    'Multi-level approval for training requests that exceed department budget allocation',
    true, true, false, false, 240, true, v_system_user_id, CURRENT_DATE
  WHERE NOT EXISTS (
    SELECT 1 FROM workflow_templates WHERE code = 'TRAINING_BUDGET_EXCEPTION'
  );
  
  -- Budget Exception Step 1: Department Head
  INSERT INTO workflow_steps (
    template_id, step_order, name, description, approver_type,
    use_reporting_line, requires_signature, requires_comment,
    can_delegate, escalation_hours, sla_warning_hours, is_active
  )
  SELECT 
    wt.id, 1, 'Department Head Approval',
    'Department head confirms training priority and willingness to reallocate budget',
    'manager', true, false, true, false, 48, 24, true
  FROM workflow_templates wt
  WHERE wt.code = 'TRAINING_BUDGET_EXCEPTION'
  AND NOT EXISTS (
    SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id
  );
  
  -- Budget Exception Step 2: HR Budget Review
  INSERT INTO workflow_steps (
    template_id, step_order, name, description, approver_type,
    use_reporting_line, requires_signature, requires_comment,
    can_delegate, escalation_hours, sla_warning_hours, is_active
  )
  SELECT 
    wt.id, 2, 'HR Budget Review',
    'HR reviews company-wide training budget and recommends approval or alternative timing',
    'hr', false, false, true, true, 48, 24, true
  FROM workflow_templates wt
  WHERE wt.code = 'TRAINING_BUDGET_EXCEPTION'
  AND EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 1)
  AND NOT EXISTS (
    SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 2
  );
  
  -- Budget Exception Step 3: Finance Approval
  INSERT INTO workflow_steps (
    template_id, step_order, name, description, approver_type,
    use_reporting_line, requires_signature, requires_comment,
    can_delegate, escalation_hours, sla_warning_hours, is_active
  )
  SELECT 
    wt.id, 3, 'Finance Approval',
    'Finance validates budget exception and approves funding source',
    'role', false, true, true, false, 72, 48, true
  FROM workflow_templates wt
  WHERE wt.code = 'TRAINING_BUDGET_EXCEPTION'
  AND EXISTS (SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 2)
  AND NOT EXISTS (
    SELECT 1 FROM workflow_steps ws WHERE ws.template_id = wt.id AND ws.step_order = 3
  );

END $$;
```

### Phase 2: Update Workflow Module Structure

**File:** `src/constants/workflowModuleStructure.ts`

Add new workflow definitions to the Training & Learning module:

```typescript
{
  id: "training",
  name: "Training & Learning",
  icon: GraduationCap,
  categories: [
    {
      id: "training_requests",
      name: "Training Requests",
      color: "indigo",
      icon: Award,
      workflows: [
        { code: "training_request", name: "Training Request", transactionTypeCode: null },
        { code: "certification_request", name: "Certification Request", transactionTypeCode: null },
        { code: "recertification_request", name: "Recertification Request", transactionTypeCode: null },
        { code: "training_budget", name: "Budget Exception Request", transactionTypeCode: null }
      ]
    },
    {
      id: "training_records",
      name: "Training Records",
      color: "teal",
      icon: FileCheck,
      workflows: [
        { code: "external_training", name: "External Training Verification", transactionTypeCode: null }
      ]
    }
  ]
}
```

### Phase 3: Update Documentation

**File:** `src/components/enablement/learning-development-manual/sections/workflows/LndWorkflowHRHubIntegration.tsx`

Update the documentation to reflect the newly seeded templates:

1. Change the amber warning alert to a green success alert confirming templates are configured
2. Add a reference table showing all 5 L&D workflow templates
3. Document cost-threshold routing logic
4. Add configuration steps for each template

---

## Summary of Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/XXXXXX_seed_lnd_workflow_templates.sql` | CREATE | Seed 5 templates + 10 steps |
| `src/constants/workflowModuleStructure.ts` | UPDATE | Add 4 new workflow definitions |
| `LndWorkflowHRHubIntegration.tsx` | UPDATE | Reflect seeded templates in documentation |

---

## Industry Alignment Verification

| Standard | Alignment |
|----------|-----------|
| **Workday Learning** | Cost-based routing, multi-level approval, HR validation step |
| **SAP SuccessFactors** | Certification tracking, recertification workflow, budget controls |
| **Cornerstone OnDemand** | External training verification, transcript integrity |
| **ISO 21001** | Learning management system governance, audit trail |

---

## Post-Implementation Verification

After migration runs:

```sql
-- Verify template step counts
SELECT 
  wt.name,
  wt.code,
  wt.category,
  COUNT(ws.id) as step_count
FROM workflow_templates wt
LEFT JOIN workflow_steps ws ON ws.template_id = wt.id
WHERE wt.code IN (
  'TRAINING_REQUEST_APPROVAL',
  'CERTIFICATION_REQUEST_APPROVAL',
  'EXTERNAL_TRAINING_VERIFICATION',
  'RECERTIFICATION_REQUEST_APPROVAL',
  'TRAINING_BUDGET_EXCEPTION'
)
GROUP BY wt.id
ORDER BY wt.code;
```

Expected results:
- TRAINING_REQUEST_APPROVAL: 3 steps
- CERTIFICATION_REQUEST_APPROVAL: 2 steps
- EXTERNAL_TRAINING_VERIFICATION: 1 step
- RECERTIFICATION_REQUEST_APPROVAL: 1 step
- TRAINING_BUDGET_EXCEPTION: 3 steps

