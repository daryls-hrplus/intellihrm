# ADR-001: Workspace Tab Navigation System

## Status
**Accepted**

## Date
2026-01-24

## Decision Makers
- Product Architecture Team
- UX Design Team

---

## Context

HRplus serves HR professionals who routinely:
- Compare multiple employee records side-by-side
- Navigate between related records (employee → appraisal → goal → learning plan)
- Maintain context while investigating cross-module data
- Work on long-running tasks interrupted by urgent requests

Traditional single-page navigation forces users to lose context when moving between records. Browser tabs create disconnected experiences without shared state. Enterprise HR platforms (Workday, SAP SuccessFactors, Oracle HCM) have established multi-tab workspaces as the industry standard for power users.

### Forces at Play
1. **Productivity**: HR analysts spend 40%+ time navigating between records
2. **Context Preservation**: Filters, search terms, and expanded states should survive navigation
3. **Workflow Support**: Multi-record comparisons are core to compensation, performance calibration
4. **Consistency**: Users expect enterprise software to behave like their other enterprise tools
5. **Complexity**: Tab systems add state management overhead
6. **Memory**: Inactive tabs consume memory if not properly managed

---

## Decision

Implement a **Workspace Tab Navigation System** modeled after Workday and SAP SuccessFactors with the following characteristics:

### Core Architecture
- **TabContext**: Central React context managing tab state, lifecycle, and persistence
- **Permanent Dashboard Tab**: Non-closable anchor tab (DASHBOARD_TAB_ID)
- **Dynamic Record Tabs**: Opened on drill-down, closable, with state preservation
- **Session Storage**: Tabs persist across page refreshes within the same session

### Key Features
1. **Duplicate Detection**: Same record opens once; subsequent clicks focus existing tab
2. **State Persistence**: Filters, search terms, expanded rows survive tab switches
3. **Unsaved Changes Protection**: Confirmation dialogs before closing dirty tabs
4. **Keyboard Shortcuts**: Ctrl+Tab, Ctrl+W, Ctrl+1-9 for power users
5. **Role Switch Validation**: Unauthorized tabs auto-close on permission changes
6. **Session Recovery**: Tabs restored after timeout with user notification

### Implementation Components
```
src/contexts/TabContext.tsx       - Core state management
src/hooks/useTabState.ts          - Tab-scoped state hook
src/hooks/useWorkspaceNavigation.ts - Navigation utilities
src/components/layout/WorkspaceTabBar.tsx - UI component
```

---

## Consequences

### Positive
- **Improved Productivity**: Users maintain context across multi-record workflows
- **Industry Alignment**: Matches user expectations from Workday, SAP, Salesforce
- **Bookmarkable States**: URL sync enables sharing filtered views
- **Accessibility**: Full keyboard navigation and screen reader support
- **Data Protection**: Unsaved changes warnings prevent accidental data loss

### Negative
- **Memory Overhead**: Each open tab retains component state (~50KB limit per tab)
- **Complexity**: Developers must use `useTabState` instead of `useState` for persistent state
- **Testing Surface**: Additional test scenarios for tab lifecycle edge cases
- **Initial Learning**: New developers need to understand tab-aware patterns

### Neutral
- **Session Scope**: Tabs don't persist across browser sessions (by design)
- **Module Coupling**: Navigation hooks create implicit dependencies on TabContext

---

## Alternatives Considered

### Alternative A: Traditional Single-Page Navigation
**Description**: Standard React Router navigation with browser history

**Why Rejected**:
- No context preservation between records
- Forces users to repeatedly re-apply filters
- Doesn't match enterprise software expectations
- No multi-record comparison capability

### Alternative B: Browser Tab Delegation
**Description**: Open each record in a new browser tab

**Why Rejected**:
- No shared application state
- Session/auth complexity across tabs
- Users lose unified workspace view
- No keyboard shortcut control
- Memory multiplication per tab

### Alternative C: Split-Pane View
**Description**: Side-by-side panels within single page

**Why Rejected**:
- Limited to 2-3 simultaneous views
- Complex responsive behavior
- Doesn't scale to power user workflows
- Unusual UX pattern for HR software

### Alternative D: Recent Records Sidebar
**Description**: Quick-access sidebar with last N visited records

**Why Rejected**:
- Only solves navigation, not context preservation
- No true multi-record workspace
- Doesn't address filter/state persistence

---

## Implementation Guidelines

### For Page Developers
```typescript
// Use useTabState for persistent state
const [tabState, setTabState] = useTabState({
  defaultState: { searchTerm: "", filter: "all" },
  syncToUrl: ["filter"],
});

// Use useWorkspaceNavigation for drill-downs
const { navigateToRecord } = useWorkspaceNavigation();
navigateToRecord({
  route: `/employees/${id}`,
  title: employee.name,
  contextType: "employee",
  contextId: id,
  moduleCode: "WF",
});
```

### For QA
See `docs/patterns/TAB-LIFECYCLE-SPECIFICATION.md` for acceptance criteria.

---

## Related Decisions
- ADR-002: State Persistence Strategy (pending)
- ADR-003: Session Management Architecture (pending)

## References
- [Workday Navigation Patterns](https://design.workday.com/)
- [SAP Fiori Launchpad Guidelines](https://experience.sap.com/fiori-design-web/)
- [Salesforce Lightning Workspace Tabs](https://www.lightningdesignsystem.com/)
- Internal: `docs/patterns/TAB-LIFECYCLE-SPECIFICATION.md`
- Internal: `docs/guides/TAB-STATE-MIGRATION-GUIDE.md`
