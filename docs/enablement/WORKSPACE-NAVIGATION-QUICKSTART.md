# Quick Start: Workspace Navigation

## What is Workspace Navigation?

HRplus uses a **tab-based workspace** similar to Workday and SAP SuccessFactors. Instead of losing your place when you navigate, each record you open stays available in a tab at the top of your screen.

---

## How It Works

### Opening Records
When you click on an employee, appraisal, job, or any other record, it opens in a **new tab**:

1. Click a record name in any list
2. A new tab appears in the tab bar
3. Your original list stays open in its own tab

### Switching Between Tabs
- **Click** any tab to switch to it
- Your filters and scroll position are preserved when you return

### Closing Tabs
- Click the **X** button on any tab to close it
- If you have unsaved changes, you'll be asked to confirm

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Tab` | Switch to next tab |
| `Ctrl + Shift + Tab` | Switch to previous tab |
| `Ctrl + W` | Close current tab |
| `Ctrl + 1-9` | Jump to tab by position |

---

## Your Dashboard

The **Dashboard** tab is always available and cannot be closed. It's your home base for:
- Quick access to all modules
- Notifications and alerts
- Widgets and summaries

---

## What Gets Saved

When you switch tabs, HRplus remembers:

| Saved ✓ | Not Saved ✗ |
|---------|-------------|
| Search terms | Open dialogs/popups |
| Filter selections | Scroll position |
| Expanded sections | Temporary selections |
| Current page number | |

---

## Unsaved Changes

If you have unsaved work in a tab:
- A **dot indicator** appears on the tab
- You'll be warned before closing the tab
- You'll be warned before logging out

---

## Session Recovery

If your session times out:
1. Log back in as usual
2. Your tabs will be restored
3. A notice will confirm restoration

> **Note**: Form data entered before timeout may not be recovered. Save your work regularly.

---

## Tips for Power Users

### Compare Records Side-by-Side
Open multiple employee or appraisal tabs, then quickly switch between them to compare.

### Bookmark Filtered Views
Filters that sync to the URL can be bookmarked:
1. Apply your filters
2. Copy the URL from your browser
3. Return to that exact filtered view anytime

### Organize Your Workspace
- Keep frequently-used records open
- Close tabs you're done with to reduce clutter
- Use keyboard shortcuts for faster navigation

---

## Frequently Asked Questions

### Q: Why can't I close the Dashboard?
The Dashboard is your anchor point. It ensures you always have a safe place to return to.

### Q: My tabs disappeared after I changed roles. Why?
When you switch roles, tabs showing records you no longer have access to are automatically closed for security.

### Q: Can I reorder tabs?
Not currently. Tabs appear in the order you opened them.

### Q: Is there a limit to how many tabs I can open?
Practically, no. However, many open tabs may affect browser performance. We recommend closing tabs you're not actively using.

---

## Need Help?

- **Implementation Team**: See the [Tab Lifecycle Specification](/docs/patterns/TAB-LIFECYCLE-SPECIFICATION.md)
- **Developers**: See the [Migration Guide](/docs/guides/TAB-STATE-MIGRATION-GUIDE.md)
- **Architecture**: See [ADR-001](/docs/architecture/ADR-001-WORKSPACE-TAB-NAVIGATION.md)
