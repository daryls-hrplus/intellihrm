# Tab Lifecycle Specification

## Pattern Name
**Workspace Tab Navigation**

## Version
1.0.0 | Updated: 2026-01-24

---

## Problem Statement

HR professionals need to:
- Work with multiple records simultaneously
- Preserve context (filters, search, expanded states) when switching between records
- Navigate complex cross-module workflows without losing progress
- Recover gracefully from session timeouts and permission changes

---

## Solution Overview

A persistent tab bar below the application header that:
- Opens new tabs for record drill-downs
- Maintains exactly one active tab at a time
- Preserves tab-scoped state across switches
- Provides keyboard shortcuts for power users
- Validates tab access on permission changes

---

## Lifecycle States

### 1. Tab Created
**Trigger**: User clicks drill-down link, navigates to record detail, or opens module

**System Actions**:
1. Generate unique tab ID (`crypto.randomUUID()`)
2. Check for existing tab with same `contextType` + `contextId`
3. If duplicate found → focus existing tab (skip creation)
4. If new → add to tabs array with initial properties
5. Set as active tab
6. Navigate to tab route
7. Persist to session storage

**Initial Properties**:
```typescript
{
  id: string;
  route: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  moduleCode: string;
  contextId?: string;
  contextType?: string;
  isPinned: boolean;
  hasUnsavedChanges: boolean;
  lastActiveAt: number;
  state?: Record<string, unknown>;
}
```

### 2. Tab Active
**Trigger**: User clicks tab, keyboard shortcut, or programmatic focus

**System Actions**:
1. Set `activeTabId` to this tab's ID
2. Update `lastActiveAt` timestamp
3. Navigate to tab's route (if not already there)
4. Render tab content (component mounts or updates)
5. Restore tab-scoped state via `useTabState`

**Rendering Rules**:
- Only active tab's content is rendered
- Inactive tabs are unmounted (state preserved in TabContext)
- Active tab has visual indicator (background, border)

### 3. Tab Inactive
**Trigger**: Another tab becomes active

**System Actions**:
1. Serialize current component state to tab's `state` property
2. Unmount component (React default behavior)
3. Visual indicator changes to inactive style
4. State remains in memory via TabContext

**State Preservation Rules**:

| State Type | Persisted | Serialized to Storage | Example |
|------------|-----------|----------------------|---------|
| Filters | ✅ Yes | ✅ Yes | Company selector, status filter |
| Search terms | ✅ Yes | ✅ Yes | Search input value |
| Pagination | ✅ Yes | ✅ Yes | Current page, page size |
| Expanded rows | ✅ Yes | ✅ Yes | Accordion/collapsible state |
| Selected items | ✅ Yes | ⚠️ Limited | Multi-select checkboxes |
| Scroll position | ❌ No | ❌ No | Scroll offset |
| Modal open state | ❌ No | ❌ No | Dialog visibility |
| Form draft data | ⚠️ Optional | ⚠️ Optional | Unsaved form fields |
| Temporary UI state | ❌ No | ❌ No | Hover states, tooltips |

### 4. Tab Closing (Unsaved Changes Flow)
**Trigger**: User clicks X button, Ctrl+W, or programmatic close

**Decision Tree**:
```
Has unsaved changes?
├── No → Execute close immediately
└── Yes → Show TabCloseConfirmDialog
    ├── User cancels → Keep tab open
    └── User confirms → Execute close
```

**TabCloseConfirmDialog Content**:
- Title: "Unsaved Changes"
- Message: "You have unsaved changes in [Tab Name]. Are you sure you want to close?"
- Actions: "Cancel" (secondary), "Close Without Saving" (destructive)

### 5. Tab Closed
**Trigger**: Close confirmed (either directly or after dialog)

**System Actions**:
1. Remove tab from tabs array
2. Clear tab state from storage
3. Determine focus target:
   - If active tab closed → focus most recently active remaining tab
   - If inactive tab closed → keep current active tab
4. Navigate to new active tab's route
5. Persist updated tabs to session storage
6. Announce to screen readers: "Closed [Tab Name] tab"

**Focus Transfer Priority**:
1. Tab with highest `lastActiveAt` (excluding closed tab)
2. Dashboard tab (always available as fallback)

---

## Behavior Matrix

| Trigger | Precondition | Action | Result |
|---------|--------------|--------|--------|
| Click menu item | Tab doesn't exist | Create new tab | Tab opens, becomes active |
| Click menu item | Tab exists (same route) | Focus existing | Existing tab becomes active |
| Click record link | Record not open | Create record tab | Detail tab opens |
| Click record link | Record already open | Focus existing | Existing tab becomes active |
| Click tab | Tab inactive | Focus tab | Tab becomes active, content renders |
| Click tab | Tab already active | No action | No change |
| Click tab X | No unsaved changes | Close tab | Tab removed, focus transfers |
| Click tab X | Has unsaved changes | Show dialog | User decides |
| Ctrl+W | Active tab closable | Initiate close | Same as click X |
| Ctrl+W | Active tab pinned | No action | Pinned tabs cannot close |
| Ctrl+Tab | Multiple tabs | Focus next tab | Next tab becomes active |
| Ctrl+Shift+Tab | Multiple tabs | Focus previous | Previous tab becomes active |
| Ctrl+1-9 | Tab at index exists | Focus by index | Indexed tab becomes active |
| Browser refresh | Tabs in storage | Restore tabs | All tabs restored, active preserved |
| Session timeout | User re-authenticates | Restore tabs | Tabs restored, recovery notice shown |
| Role change | Tabs may be invalid | Validate all tabs | Invalid tabs closed, user notified |
| Logout click | Tabs have unsaved | Show warning | User confirms or cancels |

---

## URL Synchronization

### Synced Parameters
Specified via `syncToUrl` option in `useTabState`:

```typescript
const [state, setState] = useTabState({
  defaultState: { companyId: "", status: "active" },
  syncToUrl: ["companyId", "status"], // These sync to URL
});
```

### URL Format
```
/workforce/employees?companyId=abc-123&status=active
```

### Sync Behavior
- **On tab focus**: URL updates to reflect tab state
- **On state change**: URL updates in real-time (replace, not push)
- **On direct URL access**: State initializes from URL parameters
- **On browser back/forward**: State updates from URL

---

## Session Storage Schema

### Storage Key
`hrplus-workspace-tabs`

### Serialized Format
```typescript
interface SerializedTabs {
  version: number;
  tabs: SerializedTab[];
  activeTabId: string;
  savedAt: number;
}

interface SerializedTab {
  id: string;
  route: string;
  title: string;
  subtitle?: string;
  moduleCode: string;
  contextId?: string;
  contextType?: string;
  isPinned: boolean;
  hasUnsavedChanges: boolean;
  lastActiveAt: number;
  state?: Record<string, unknown>;
}
```

### Size Limits
- Maximum state per tab: 50KB
- Maximum total storage: 5MB (browser limit)
- Compression: Not currently implemented

---

## Edge Cases

### Session Timeout Recovery
1. User session expires while tabs are open
2. User logs back in
3. System detects existing tab storage
4. Tabs restore with preserved state
5. `SessionRecoveryNotice` displays:
   - If no unsaved changes: "Session restored. X tabs recovered."
   - If unsaved existed: "Session restored. Some changes may not have been saved."

### Role/Company Switch
1. User changes role or company context
2. `useTabPermissionValidator` evaluates each tab
3. Tabs for inaccessible modules are identified
4. Invalid tabs are closed automatically
5. `TabsClosedNotice` displays: "X tabs closed due to permission changes"
6. Focus transfers to Dashboard

### Logout with Unsaved Changes
1. User clicks logout
2. `useLogoutWithTabValidation` checks all tabs
3. If unsaved changes exist:
   - `LogoutWarningDialog` displays
   - Lists tabs with unsaved changes
   - User confirms or cancels
4. If confirmed or no unsaved: proceed with logout

### Browser Beforeunload
1. User attempts to close browser/navigate away
2. If any tab has `hasUnsavedChanges: true`:
   - Browser shows native confirmation dialog
   - User confirms or cancels

---

## Accessibility Requirements

### ARIA Attributes
```html
<div role="tablist" aria-label="Workspace tabs">
  <button
    role="tab"
    aria-selected="true|false"
    aria-controls="panel-{id}"
    tabindex="0|-1"
  >
    <span class="sr-only">{title}, {hasUnsavedChanges ? 'has unsaved changes' : ''}</span>
  </button>
</div>
<div role="tabpanel" id="panel-{id}" aria-labelledby="tab-{id}">
  <!-- Tab content -->
</div>
```

### Keyboard Navigation
| Key | Action |
|-----|--------|
| Tab | Move focus between tab bar and content |
| Arrow Left/Right | Move between tabs (when tab bar focused) |
| Enter/Space | Activate focused tab |
| Ctrl+Tab | Focus next tab |
| Ctrl+Shift+Tab | Focus previous tab |
| Ctrl+W | Close active tab |
| Ctrl+1-9 | Focus tab by position |

### Screen Reader Announcements
Live region announces:
- "Opened [Tab Name] tab"
- "Closed [Tab Name] tab"
- "Now viewing [Tab Name]"
- "X tabs closed due to permission changes"

---

## Acceptance Criteria Checklist

### Core Functionality
- [ ] New record drill-down opens in new tab
- [ ] Clicking existing record focuses its tab (no duplicate)
- [ ] Tab close removes tab and transfers focus
- [ ] Dashboard tab cannot be closed
- [ ] Tabs persist across page refresh
- [ ] Ctrl+Tab cycles through tabs
- [ ] Ctrl+W closes active tab (if closable)

### State Persistence
- [ ] Filters survive tab switch
- [ ] Search terms survive tab switch
- [ ] Expanded rows survive tab switch
- [ ] State restores after page refresh
- [ ] URL reflects synced state keys

### Data Protection
- [ ] Unsaved changes show indicator on tab
- [ ] Closing dirty tab shows confirmation
- [ ] Logout with dirty tabs shows warning
- [ ] Browser close with dirty tabs shows warning

### Accessibility
- [ ] Tab bar navigable via keyboard
- [ ] ARIA roles correctly applied
- [ ] Screen reader announces tab changes
- [ ] Focus visible indicator on all interactive elements

### Edge Cases
- [ ] Role switch closes unauthorized tabs
- [ ] Session recovery restores tabs
- [ ] Recovery notice displays appropriately
- [ ] Permission-closed tabs show notification

---

## Related Documents
- `docs/architecture/ADR-001-WORKSPACE-TAB-NAVIGATION.md`
- `docs/guides/TAB-STATE-MIGRATION-GUIDE.md`
