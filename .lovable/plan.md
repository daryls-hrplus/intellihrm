
## Right-Side Icon-Only Workspace Tab Bar

This plan moves the workspace tabs from the horizontal header bar to a vertical bar on the right side of the screen, using icon-only tabs with tooltips for page names.

---

### Visual Comparison

```text
CURRENT LAYOUT:
+------------------+-------------------------------------------------------+
|                  | Header (logos, trial banner, icons)                   |
|                  +-------------------------------------------------------+
|    Left          | [🏠] [👤 HR Hub] [👥 Workforce] [🎯 Performance]      |
|    Sidebar       +-------------------------------------------------------+
|    (Nav)         |                                                       |
|                  |              PAGE CONTENT                             |
|                  |                                                       |
+------------------+-------------------------------------------------------+

PROPOSED LAYOUT:
+------------------+------------------------------------------+----+
|                  | Header (logos, trial banner, icons)      |    |
|                  +------------------------------------------+ 🏠 |
|    Left          |                                          +----+
|    Sidebar       |              PAGE CONTENT                | 👤 |
|    (Nav)         |                                          +----+
|                  |                                          | 👥 |
|                  |                                          +----+
|                  |                                          | 🎯 |
+------------------+------------------------------------------+----+
                                                           (Icon tabs)
```

---

### Implementation Summary

| Component | Change |
|-----------|--------|
| `WorkspaceTabSidebar.tsx` | New vertical tab bar component (icon-only with tooltips) |
| `ProtectedLayout.tsx` | Replace `WorkspaceTabBar` with `WorkspaceTabSidebar`, adjust layout structure |
| `SortableTab.tsx` | Add vertical orientation support |

---

### Technical Details

#### 1. Create `WorkspaceTabSidebar.tsx`

A new component for the right-side vertical tab bar:

| Feature | Implementation |
|---------|----------------|
| Icon-only tabs | Fixed 44x44px square buttons, icon centered |
| Tooltips | Enhanced tooltip showing title, subtitle, context type, unsaved status |
| Vertical scrolling | Scroll arrows when tabs exceed viewport height |
| Drag-and-drop | Vertical list sorting strategy via @dnd-kit |
| Close button | Small X overlay on hover (positioned top-right corner) |
| Unsaved indicator | Orange dot in top-left corner of tab |
| Active indicator | Left border highlight + background color |

Structure:
```tsx
<aside className="fixed right-0 top-0 h-screen w-14 bg-muted/30 border-l z-40">
  {/* Scroll up arrow if needed */}
  <DndContext>
    <SortableContext items={tabs} strategy={verticalListSortingStrategy}>
      <div className="flex flex-col items-center py-2 overflow-y-auto">
        {tabs.map(tab => (
          <SortableTab key={tab.id} tab={tab} orientation="vertical">
            <Tooltip>
              <TooltipTrigger>
                <button className="w-10 h-10 flex items-center justify-center">
                  <TabIcon />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{tab.title}</p>
                {tab.subtitle && <p>{tab.subtitle}</p>}
                {tab.hasUnsavedChanges && <p>Has unsaved changes</p>}
              </TooltipContent>
            </Tooltip>
          </SortableTab>
        ))}
      </div>
    </SortableContext>
  </DndContext>
  {/* Scroll down arrow if needed */}
</aside>
```

#### 2. Update `ProtectedLayout.tsx`

Adjust the layout grid to accommodate the right sidebar:

From:
```tsx
<main className="lg:pl-64 transition-all duration-300">
  <div className="min-h-screen p-4 lg:p-8">
    <AppHeader />
    <WorkspaceTabBar />
    <Outlet />
  </div>
</main>
```

To:
```tsx
<main className="lg:pl-64 lg:pr-14 transition-all duration-300">
  <div className="min-h-screen p-4 lg:p-8">
    <AppHeader />
    <Outlet />
  </div>
</main>
<WorkspaceTabSidebar />
```

Key changes:
- Add `lg:pr-14` to main content to make room for the right tab bar
- Remove `WorkspaceTabBar` import and usage
- Add `WorkspaceTabSidebar` after the main content

#### 3. Update `SortableTab.tsx`

Add orientation prop for vertical dragging:

```tsx
interface SortableTabProps {
  tab: WorkspaceTab;
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
}

// Adjust cursor and styles based on orientation
const style: React.CSSProperties = {
  transform: CSS.Transform.toString(transform),
  transition,
  cursor: tab.isPinned ? "default" : orientation === "vertical" ? "ns-resize" : "grab",
};
```

---

### Tooltip Content Structure

Each icon tab will show a rich tooltip on hover (positioned to the left):

| Element | Description |
|---------|-------------|
| Title | Bold page name (e.g., "HR Hub") |
| Subtitle | If present (e.g., "John Smith - Employee") |
| Context type | Capitalized entity type (e.g., "Employee") |
| Unsaved warning | Orange text if tab has unsaved changes |

---

### Visual Styling

| Property | Value |
|----------|-------|
| Right sidebar width | 56px (w-14) |
| Tab button size | 40x40px |
| Tab spacing | 4px gap |
| Active indicator | 2px left border (primary color) + slightly darker background |
| Hover state | Background highlight + close button appears |
| Scroll arrows | ChevronUp / ChevronDown at top/bottom |

---

### Fallback Icon Handling

When a tab has no defined icon:
- Use `FileText` as the default fallback icon
- Ensures every tab is visually represented

---

### Mobile Behavior

On small screens (below lg breakpoint):
- The right tab bar is hidden by default
- Users navigate via standard routing or can access tabs via a floating button/panel (optional enhancement)

---

### Files Summary

| Action | File |
|--------|------|
| Create | `src/components/layout/WorkspaceTabSidebar.tsx` |
| Modify | `src/components/layout/ProtectedLayout.tsx` |
| Modify | `src/components/layout/SortableTab.tsx` |

