

# Add Missing ESS Employee Relations Tabs + Fix Build

## Problem
The ESS Employee Relations page (`MyEmployeeRelationsPage.tsx`) is missing 2 of the 6 planned tabs:
1. **My Disciplinary** -- Employee should see their disciplinary history and acknowledge actions
2. **My Exit Interview** -- Employee should see their exit interview details if one exists

Additionally, there is a build **out-of-memory error** that needs resolution (likely from heavy imports in capabilities documents).

## Changes

### 1. Update `useEmployeeRelations.ts` Hook
Add two new queries:
- `disciplinaryActions`: Query `er_disciplinary_actions` filtered by `employee_id = user.id`
- `exitInterviews`: Query `er_exit_interviews` filtered by `employee_id = user.id`

Add one new mutation:
- `acknowledgeDisciplinary`: Update `er_disciplinary_actions` to set `acknowledged = true` and `acknowledged_at = now()`

### 2. Update `MyEmployeeRelationsPage.tsx`
Add two new tabs to the existing 4:

**Tab: My Disciplinary**
- Table view: action type, date, status, description, acknowledged status
- "Acknowledge" button for unacknowledged actions (inserts timestamp)
- Empty state: "No disciplinary actions on record"
- Add KPI card for count at top

**Tab: My Exit Interview**
- Card view: interview date, interviewer, status, satisfaction rating
- Read-only (employees cannot edit exit interviews)
- Empty state: "No exit interview scheduled"

Update tab ordering to match enterprise lifecycle:
1. My Recognition
2. My Cases
3. My Disciplinary (new)
4. Surveys
5. Wellness
6. Exit Interview (new)

Update summary cards: expand from 4 to 5 (add "Disciplinary Actions" count).

### 3. Fix Out-of-Memory Build Error
Investigate and optimize heavy imports in the capabilities document components. Likely fix: ensure no circular imports or duplicate large component trees.

### Technical Details

**Files modified:**
- `src/hooks/useEmployeeRelations.ts` -- add disciplinary + exit interview queries/mutations
- `src/pages/ess/MyEmployeeRelationsPage.tsx` -- add 2 new tabs, update KPI cards

**Database tables used (no schema changes needed):**
- `er_disciplinary_actions` (columns: employee_id, action_type, description, status, acknowledged, acknowledged_at, action_date)
- `er_exit_interviews` (columns: employee_id, interview_date, interviewer_id, status, overall_satisfaction)

