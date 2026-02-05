
## Fix TypeScript Build Errors in Route Group Files

The build is failing because several lazy import paths in the new route group files don't match the actual file locations in the project. This plan corrects all import paths to match the existing file structure.

---

### Changes Required

#### 1. Fix `src/routes/groups/essRoutes.tsx`
- **Line 53**: Change `EssNotificationPreferencesPage` to import from `@/pages/ess/NotificationPreferencesPage` (the file is named `NotificationPreferencesPage.tsx`, not `EssNotificationPreferencesPage.tsx`)

#### 2. Fix `src/routes/groups/hrHubRoutes.tsx`
- **Line 8**: Change import path from `@/pages/hr-hub/ESSChangeRequestsPage` to `@/pages/hr/ESSChangeRequestsPage` (the file lives in the `/hr` folder, not `/hr-hub`)

#### 3. Fix `src/routes/groups/miscProtectedRoutes.tsx`
- **Line 21**: Change `SystemAuditLogsPage` to import from `@/pages/system/AuditLogsPage` (the file is named `AuditLogsPage.tsx`, not `SystemAuditLogsPage.tsx`)

#### 4. Fix `src/routes/groups/timeAttendanceRoutes.tsx`
This file has two categories of errors:

**A. Shift sub-pages (lines 10-23)** - These files are in a `/shifts` subfolder:
| Current Import | Correct Import |
|---|---|
| `@/pages/time-attendance/ShiftsPage` | `@/pages/time-attendance/shifts/ShiftsPage` |
| `@/pages/time-attendance/RoundingRulesPage` | `@/pages/time-attendance/shifts/RoundingRulesPage` |
| `@/pages/time-attendance/PaymentRulesPage` | `@/pages/time-attendance/shifts/PaymentRulesPage` |
| `@/pages/time-attendance/ShiftAssignmentsPage` | `@/pages/time-attendance/shifts/ShiftAssignmentsPage` |
| `@/pages/time-attendance/ShiftCalendarPage` | `@/pages/time-attendance/shifts/ShiftCalendarPage` |
| `@/pages/time-attendance/ShiftSwapRequestsPage` | `@/pages/time-attendance/shifts/ShiftSwapRequestsPage` |
| `@/pages/time-attendance/OpenShiftBoardPage` | `@/pages/time-attendance/shifts/OpenShiftBoardPage` |
| `@/pages/time-attendance/ShiftTemplatesPage` | `@/pages/time-attendance/shifts/ShiftTemplatesPage` |
| `@/pages/time-attendance/RotationPatternsPage` | `@/pages/time-attendance/shifts/RotationPatternsPage` |
| `@/pages/time-attendance/FatigueManagementPage` | `@/pages/time-attendance/shifts/FatigueManagementPage` |
| `@/pages/time-attendance/ShiftCoveragePage` | `@/pages/time-attendance/shifts/ShiftCoveragePage` |
| `@/pages/time-attendance/ShiftBiddingPage` | `@/pages/time-attendance/shifts/ShiftBiddingPage` |
| `@/pages/time-attendance/AISchedulerPage` | `@/pages/time-attendance/shifts/AISchedulerPage` |
| `@/pages/time-attendance/MultiLocationSchedulePage` | `@/pages/time-attendance/shifts/MultiLocationSchedulePage` |

**B. Time module pages (lines 43-48)** - These files are in `/time`, not `/time-attendance`:
| Current Import | Correct Import |
|---|---|
| `@/pages/time-attendance/ShiftDifferentialsPage` | `@/pages/time/ShiftDifferentialsPage` |
| `@/pages/time-attendance/GeofenceLocationsPage` | `@/pages/time/GeofenceLocationsPage` |
| `@/pages/time-attendance/FaceVerificationPage` | `@/pages/time/FaceVerificationPage` |
| `@/pages/time-attendance/ProjectCostDashboardPage` | `@/pages/time/ProjectCostDashboardPage` |
| `@/pages/time-attendance/ProjectCostConfigPage` | `@/pages/time/ProjectCostConfigPage` |
| `@/pages/time-attendance/CostAllocationPage` | `@/pages/time/CostAllocationPage` |

---

### Technical Details

All changes are import path corrections only. No logic or routing changes are needed. After these fixes:
- TypeScript will resolve all modules correctly
- The build will proceed past the transformation phase
- The chunking strategy will split the bundle to prevent memory exhaustion

### Files to Modify
1. `src/routes/groups/essRoutes.tsx` (1 import fix)
2. `src/routes/groups/hrHubRoutes.tsx` (1 import fix)
3. `src/routes/groups/miscProtectedRoutes.tsx` (1 import fix)
4. `src/routes/groups/timeAttendanceRoutes.tsx` (20 import fixes)
