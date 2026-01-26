
# Phase 2 & 3 Implementation Plan: Chapter 5 Gap Closure

## Executive Summary

This plan implements **Phase 2 (Code Enhancements)** and **Phase 3 (Types Metadata Update)** from the Chapter 5 Gap Audit to align the codebase with the documented functionality. These changes will enforce the documented member status lifecycle, persist development recommendations, and add essential status management functions.

---

## Phase 2: Code Enhancements

### 2.1 Database Migration - Add Status Constraint & Development Notes Field

**Purpose:** Enforce the 6-stage status lifecycle documented in Section 5.4 and persist the "Recommended Development" field from the MSS nomination form.

**SQL Migration:**
```sql
-- Add CHECK constraint to enforce allowed statuses
ALTER TABLE talent_pool_members 
DROP CONSTRAINT IF EXISTS talent_pool_members_status_check;

ALTER TABLE talent_pool_members 
ADD CONSTRAINT talent_pool_members_status_check 
CHECK (status IN ('active', 'nominated', 'approved', 'rejected', 'graduated', 'removed'));

-- Add development_notes field for manager recommendations
ALTER TABLE talent_pool_members 
ADD COLUMN IF NOT EXISTS development_notes TEXT NULL;

-- Add comment for documentation
COMMENT ON COLUMN talent_pool_members.development_notes IS 'Manager-recommended development activities captured during nomination';
```

**Rationale:**
- The MssNominateTalentPoolPage already inserts with `status = 'nominated'`
- The constraint formalizes the lifecycle: `nominated` → `approved`/`rejected` → `active` → `graduated`/`removed`
- The `development_notes` field captures the existing UI field that was not being persisted

---

### 2.2 Hook Enhancement - Add updateMemberStatus Function

**File:** `src/hooks/useSuccession.ts`

**New Function:**
```typescript
const updateMemberStatus = async (
  memberId: string, 
  newStatus: 'active' | 'nominated' | 'approved' | 'rejected' | 'graduated' | 'removed',
  endDate?: string
): Promise<boolean> => {
  try {
    const updates: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // Set end_date for terminal statuses
    if (['graduated', 'removed', 'rejected'].includes(newStatus) && !endDate) {
      updates.end_date = new Date().toISOString().split('T')[0];
    } else if (endDate) {
      updates.end_date = endDate;
    }

    const { error } = await supabase
      .from('talent_pool_members')
      .update(updates)
      .eq('id', memberId);

    if (error) throw error;

    const statusMessages: Record<string, string> = {
      active: 'Member is now active',
      approved: 'Nomination approved',
      rejected: 'Nomination declined',
      graduated: 'Member graduated to succession plan',
      removed: 'Member removed from pool',
    };
    toast.success(statusMessages[newStatus] || 'Status updated');
    return true;
  } catch (error: any) {
    toast.error('Failed to update status: ' + error.message);
    return false;
  }
};
```

**Changes to Interface:**
```typescript
export interface TalentPoolMember {
  id: string;
  pool_id: string;
  employee_id: string;
  added_by: string | null;
  reason: string | null;
  status: 'active' | 'nominated' | 'approved' | 'rejected' | 'graduated' | 'removed';
  start_date: string;
  end_date: string | null;
  development_notes: string | null;  // NEW
  employee?: { ... };
}
```

**Export Addition:**
```typescript
return {
  // ... existing exports
  updateMemberStatus,  // NEW
};
```

---

### 2.3 UI Enhancement - Add Status Change Dropdown to TalentPoolsTab

**File:** `src/components/succession/TalentPoolsTab.tsx`

**Changes:**
1. Import `updateMemberStatus` from useSuccession hook
2. Replace the "Remove" (Trash2) button with a status dropdown
3. Add proper status transitions based on current state

**UI Changes:**
```tsx
// In the members table, replace:
<Button size="sm" variant="ghost" onClick={() => handleRemoveMember(member.id)}>
  <Trash2 className="h-4 w-4 text-destructive" />
</Button>

// With:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button size="sm" variant="ghost">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    {member.status === 'nominated' && (
      <>
        <DropdownMenuItem onClick={() => handleStatusChange(member.id, 'approved')}>
          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange(member.id, 'rejected')}>
          <XCircle className="h-4 w-4 mr-2 text-red-500" />
          Reject
        </DropdownMenuItem>
      </>
    )}
    {(member.status === 'active' || member.status === 'approved') && (
      <>
        <DropdownMenuItem onClick={() => handleStatusChange(member.id, 'graduated')}>
          <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
          Graduate to Succession
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </>
    )}
    <DropdownMenuItem 
      onClick={() => handleStatusChange(member.id, 'removed')}
      className="text-destructive"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Remove from Pool
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**New Handler:**
```typescript
const handleStatusChange = async (memberId: string, newStatus: string) => {
  const statusLabels: Record<string, string> = {
    approved: 'approve this nomination',
    rejected: 'reject this nomination',
    graduated: 'graduate this member to succession planning',
    removed: 'remove this member from the pool',
  };
  
  if (!confirm(`Are you sure you want to ${statusLabels[newStatus]}?`)) return;
  
  const result = await updateMemberStatus(memberId, newStatus as any);
  if (result && selectedPool) {
    loadMembers(selectedPool.id);
    loadPools();
  }
};
```

---

### 2.4 MSS Page Enhancement - Persist Development Recommendations

**File:** `src/pages/mss/MssNominateTalentPoolPage.tsx`

**Changes to handleSubmitNomination:**
```typescript
const handleSubmitNomination = async () => {
  if (!selectedMember || !nominationForm.talent_pool_id) {
    toast.error("Please select a talent pool");
    return;
  }

  setSubmitting(true);
  
  const { error } = await (supabase
    .from('talent_pool_members') as any)
    .insert({
      pool_id: nominationForm.talent_pool_id,
      employee_id: selectedMember.id,
      added_by: profile?.id,
      status: 'nominated',
      reason: nominationForm.justification,
      development_notes: nominationForm.recommended_development || null,  // NEW
    });

  if (error) {
    toast.error("Failed to submit nomination");
  } else {
    toast.success(`${selectedMember.full_name} nominated to talent pool`);
    setDialogOpen(false);
    await loadData();
  }
  setSubmitting(false);
};
```

---

## Phase 3: Types Metadata Update

### 3.1 Update successionManual.ts Part 5 Metadata

**File:** `src/types/successionManual.ts`

**Updated Description (lines 533-536):**
```typescript
{
  id: 'part-5',
  sectionNumber: '5',
  title: 'Talent Pool Management',
  description: 'Create, configure, and manage talent pools including nomination workflows, HR review processes, evidence-based decision support, and integration with supporting evidence tables (talent_profile_evidence, talent_signal_snapshots, talent_signal_definitions).',
  contentLevel: 'procedure',
  estimatedReadTime: 90,
  targetRoles: ['Admin', 'HR Partner', 'Manager'],
```

**Updated Section 5.4 Description:**
```typescript
{
  id: 'sec-5-4',
  sectionNumber: '5.4',
  title: 'Member Management',
  description: 'Add, review, approve, graduate, and remove talent pool members with 6-stage status lifecycle (nominated → approved/rejected → active → graduated/removed). Includes DB-enforced status constraint.',
  contentLevel: 'procedure',
  estimatedReadTime: 12,
  targetRoles: ['Admin', 'HR Partner'],
  industryContext: {
    frequency: 'Quarterly review',
    timing: 'Ongoing operations',
    benchmark: 'Active pool management with formal status transitions'
  }
}
```

**Updated Section 5.5 Description:**
```typescript
{
  id: 'sec-5-5',
  sectionNumber: '5.5',
  title: 'Manager Nomination Workflow',
  description: 'MSS-driven talent nomination with justification requirements, development recommendations (persisted to development_notes field), and notification triggers',
  contentLevel: 'procedure',
  estimatedReadTime: 15,
  targetRoles: ['Manager'],
  industryContext: {
    frequency: 'Per nomination',
    timing: 'Ongoing operations',
    benchmark: 'Manager-initiated talent identification with development planning'
  }
}
```

**Updated Section 5.7 Description:**
```typescript
{
  id: 'sec-5-7',
  sectionNumber: '5.7',
  title: 'Evidence-Based Decision Support',
  description: 'Talent signals, evidence snapshots, signal summary calculations, and leadership indicators. Integrates with talent_profile_evidence (13 fields), talent_signal_snapshots (18 fields), and talent_signal_definitions (15 fields) tables.',
  contentLevel: 'reference',
  estimatedReadTime: 10,
  targetRoles: ['Admin', 'HR Partner'],
  industryContext: {
    frequency: 'Reference',
    timing: 'During review',
    benchmark: 'McKinsey evidence-based talent decisions'
  }
}
```

---

## Implementation Summary

| Phase | Task | File | Type |
|-------|------|------|------|
| 2.1 | Add status CHECK constraint | DB Migration | Schema |
| 2.1 | Add development_notes column | DB Migration | Schema |
| 2.2 | Add updateMemberStatus function | useSuccession.ts | Hook |
| 2.2 | Add development_notes to TalentPoolMember interface | useSuccession.ts | Type |
| 2.3 | Replace delete button with status dropdown | TalentPoolsTab.tsx | UI |
| 2.3 | Add handleStatusChange handler | TalentPoolsTab.tsx | UI |
| 2.4 | Persist development_notes in nomination | MssNominateTalentPoolPage.tsx | UI |
| 3.1 | Update Part 5 main description | successionManual.ts | Metadata |
| 3.1 | Update Section 5.4 description | successionManual.ts | Metadata |
| 3.1 | Update Section 5.5 description | successionManual.ts | Metadata |
| 3.1 | Update Section 5.7 description | successionManual.ts | Metadata |

---

## Expected Outcomes

After implementation:

1. **Database Constraint:** Status values are now DB-enforced, preventing invalid states
2. **Development Recommendations:** Manager development suggestions are persisted and available for HR review
3. **Status Workflow:** HR can now approve/reject nominations; members can be graduated to succession plans
4. **Type Safety:** TypeScript interfaces reflect the actual DB schema including new field
5. **Documentation Alignment:** The successionManual.ts metadata accurately reflects the implementation including:
   - 6-stage status lifecycle
   - development_notes persistence
   - Supporting evidence table integration

---

## Validation Checklist

Post-implementation verification:

- [ ] DB migration applied successfully
- [ ] Status constraint prevents invalid status values
- [ ] development_notes column exists in talent_pool_members
- [ ] MssNominateTalentPoolPage saves development recommendations
- [ ] TalentPoolsTab shows status dropdown with appropriate actions
- [ ] Approve/Reject options appear for 'nominated' members
- [ ] Graduate option appears for 'active'/'approved' members
- [ ] successionManual.ts reflects actual implementation
- [ ] Documentation sections 5.4, 5.5, 5.7 match new behavior

