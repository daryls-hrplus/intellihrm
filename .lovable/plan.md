

# Help Center Reorganization Plan
## Industry-Standard Layout with Route Fixes

---

## Executive Summary

This plan addresses four key issues with the Help Center:
1. **404 Error**: Fix broken Knowledge Base route (`/help/knowledge-base` → `/help/kb`)
2. **Remove "Browse by Module"**: Remove this section entirely from the UI (the kb_categories data can remain for future use)
3. **Tab Navigation**: Ensure Help Center opens as its own workspace tab, not under Enablement
4. **Reorganize Layout**: Implement an industry-standard Help Center structure

---

## Part 1: Issues Analysis

### Issue 1: Knowledge Base 404 Error

| Current State | Problem |
|---------------|---------|
| Quick Access link: `/help/knowledge-base` | Route doesn't exist |
| Actual route: `/help/kb` | Links are broken |
| All "Browse by Module" links: `/help/knowledge-base?category=...` | Also broken |

**Root Cause**: Route mismatch between UI links and App.tsx routing

### Issue 2: Browse by Module Section

The section currently shows kb_categories from the database, but:
- Links point to non-existent route
- Even if fixed, this duplicates the Knowledge Base page functionality
- Categories are better discovered within the KB page itself

**Decision**: Remove from Help Center landing page (keep data for KB page)

### Issue 3: Tab Navigation Context

When navigating to `/help` from another module, it may inherit the previous tab's context due to workspace navigation behavior. This needs explicit tab opening.

### Issue 4: Layout Assessment

Current layout vs. Industry best practices:

```text
CURRENT LAYOUT:
┌──────────────────────────────────────────┐
│ Hero + Search                            │
├──────────────────────────────────────────┤
│ Quick Access (4 cards)                   │
├──────────────────────────────────────────┤
│ Additional Resources (4 cards)           │
├──────────────────────────────────────────┤
│ Browse by Module │ Popular Articles      │
│ (Categories)     │ + AI Chat CTA         │
│                  │ + Contact Support     │
└──────────────────────────────────────────┘

INDUSTRY STANDARD (Zendesk/Slack/Intercom pattern):
┌──────────────────────────────────────────┐
│ Hero + Search (prominent)                │
├──────────────────────────────────────────┤
│ Quick Actions (AI Chat, Submit Ticket)   │
├──────────────────────────────────────────┤
│ Resource Categories (3-6 cards)          │
├──────────────────────────────────────────┤
│ Popular Articles   │ Need More Help?     │
└──────────────────────────────────────────┘
```

---

## Part 2: Proposed Industry-Standard Layout

### New Help Center Structure

```text
┌────────────────────────────────────────────────────────────────┐
│  🔵 Help Center                                                │
│  Find answers, get support, and learn how to make the most of  │
│  Intelli HRM                                                   │
│                                                                │
│  [🔍 Search for help articles...              ] [Search]       │
│                                                                │
│  [AI Assistant - Get instant answers] [Submit a Ticket]        │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  HELP RESOURCES                                                │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ 📚 Knowledge    │  │ 🎬 Video        │  │ 🚀 Getting      │ │
│  │    Base         │  │    Tutorials    │  │    Started      │ │
│  │                 │  │                 │  │                 │ │
│  │ Browse all help │  │ Step-by-step    │  │ New user guides │ │
│  │ articles        │  │ video guides    │  │ and onboarding  │ │
│  │ (324 articles)  │  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ ❓ FAQs         │  │ 📋 Release      │  │ 🎫 My Tickets   │ │
│  │                 │  │    Notes        │  │                 │ │
│  │ Frequently      │  │                 │  │ View your       │ │
│  │ asked questions │  │ Latest updates  │  │ support tickets │ │
│  │                 │  │ and features    │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  📈 POPULAR ARTICLES               │  💬 STILL NEED HELP?     │
│                                    │                          │
│  • How to Submit a Leave Request   │  Can't find what you're  │
│  • How to Reset Your Password      │  looking for?            │
│  • Setting Up Your Profile         │                          │
│  • Viewing Pay Statements          │  [Chat with AI ✨]       │
│  • Requesting Time Off             │  [Submit a Ticket 🎫]    │
│                                    │                          │
└────────────────────────────────────────────────────────────────┘
```

---

## Part 3: Technical Implementation

### Step 1: Fix Route References

**File:** `src/pages/help/HelpCenterPage.tsx`

Update all broken links from `/help/knowledge-base` to `/help/kb`:

| Current | Fixed |
|---------|-------|
| `/help/knowledge-base` | `/help/kb` |
| `/help/knowledge-base?category=...` | `/help/kb?category=...` |

### Step 2: Remove "Browse by Module" Section

**File:** `src/pages/help/HelpCenterPage.tsx`

Remove the entire "Browse by Module" card section (lines ~254-295):
- Remove the `categories` state and `fetchData` for categories
- Remove the "Browse by Module" Card component
- Keep the grid layout but remove the lg:col-span-2 section

### Step 3: Reorganize Layout

**File:** `src/pages/help/HelpCenterPage.tsx`

Restructure the page with this component hierarchy:

```tsx
<AppLayout>
  {/* Hero Section with Search - KEEP, enhance */}
  
  {/* Primary Actions - NEW: AI Chat + Submit Ticket prominently */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <AIAssistantCard /> {/* Large, prominent */}
    <SubmitTicketCard /> {/* Large, prominent */}
  </div>
  
  {/* Resource Categories - 6 cards in 2x3 grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <ResourceCard title="Knowledge Base" href="/help/kb" articleCount={324} />
    <ResourceCard title="Video Tutorials" href="/help/kb?category=training-learning" />
    <ResourceCard title="Getting Started" href="/help/kb?category=getting-started" />
    <ResourceCard title="FAQs" href="/help/kb?category=policies-compliance" />
    <ResourceCard title="Release Notes" href="/help/kb?category=admin-security" />
    <ResourceCard title="My Tickets" href="/help/tickets" />
  </div>
  
  {/* Bottom Section: Popular Articles + Contact */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <PopularArticles className="lg:col-span-2" />
    <NeedMoreHelp />
  </div>
</AppLayout>
```

### Step 4: Fix Tab Navigation

**File:** `src/components/layout/AppSidebar.tsx`

Ensure the Help sidebar link uses proper workspace navigation:

```tsx
// Already uses NavLink with moduleCode: "help"
// The workspace tab system should handle this automatically
// BUT we may need to ensure HelpCenterPage uses useWorkspaceNavigation
```

**File:** `src/pages/help/HelpCenterPage.tsx`

Add workspace navigation hooks to ensure proper tab behavior:

```tsx
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";

// Use navigateToList for internal navigation
const { navigateToList } = useWorkspaceNavigation();
```

### Step 5: Update KnowledgeBasePage Internal Links

**File:** `src/pages/help/KnowledgeBasePage.tsx`

Update self-referencing links from `/help/knowledge-base` to `/help/kb`.

### Step 6: Update HelpCenterOverlayPanel

**File:** `src/components/overlays/HelpCenterOverlayPanel.tsx`

Update all `/help/knowledge-base` references to `/help/kb`.

---

## Part 4: Files to Modify

| File | Changes |
|------|---------|
| `src/pages/help/HelpCenterPage.tsx` | Major refactor: fix routes, remove Browse by Module, reorganize layout |
| `src/pages/help/KnowledgeBasePage.tsx` | Fix internal route references |
| `src/components/overlays/HelpCenterOverlayPanel.tsx` | Fix route references |

---

## Part 5: Database Considerations

### Keep kb_categories Table
The `kb_categories` table contains valid module categorization data with 324 published articles. This data should be preserved for:
- KnowledgeBasePage sidebar navigation
- Category-based filtering
- Future Help Center enhancements

**No database changes required** - only UI changes to remove "Browse by Module" from the landing page.

---

## Part 6: Industry Best Practices Applied

| Best Practice | Implementation |
|---------------|----------------|
| **Prominent Search** | Keep hero search, enhance visibility |
| **Clear Primary Actions** | AI Chat + Submit Ticket as large CTAs |
| **Logical Categories** | 6 resource cards organized by user need |
| **Popular Content** | Featured articles section |
| **Multiple Support Paths** | AI, KB, Tickets all accessible |
| **Breadcrumb Navigation** | Already implemented in sub-pages |
| **Self-Service First** | AI and KB before tickets |

---

## Part 7: Visual Comparison

### Before (Current)
- 4 Quick Access cards
- 4 Additional Resources cards  
- Browse by Module grid (BROKEN)
- Popular Articles sidebar
- AI Chat CTA (small)
- Contact Support (small)

### After (Proposed)
- 2 Primary Action cards (AI + Tickets) - PROMINENT
- 6 Resource Category cards - ORGANIZED
- Popular Articles (2/3 width)
- Need More Help sidebar (1/3 width) - CLEAR ESCALATION PATH

---

## Summary

| Issue | Solution |
|-------|----------|
| Knowledge Base 404 | Fix all routes from `/help/knowledge-base` to `/help/kb` |
| Browse by Module broken | Remove section from landing page (keep data for KB page) |
| Tab navigation context | Ensure proper workspace navigation hooks |
| Layout improvement | Reorganize to industry-standard hierarchy with prominent AI/Tickets CTAs |

This reorganization aligns with patterns from Zendesk, Slack, and Intercom help centers while fixing the immediate technical issues.

