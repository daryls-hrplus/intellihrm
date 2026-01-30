

# Prevent Duplicate Template Usage in Automation Rules

## Status: ✅ COMPLETED

## Overview
Added logic to prevent users from creating duplicate automation rules for templates that are already in use. When a template is already linked to an automation rule for the selected company, a visual indicator is shown and the "Use in Rule" button is replaced with "Edit Rule" that navigates to the existing rule.

---

## Implemented Changes

### 1. `src/components/reminders/ReminderEmailTemplates.tsx`
- Added `templateUsage` state (Map) to track which templates are linked to rules
- Added `fetchTemplateUsage()` function to query `reminder_rules` for templates with `email_template_id`
- Added `onEditRule` prop to allow parent to handle edit navigation
- Updated `renderTemplateCard()` to:
  - Show "In Use" badge (green with Zap icon) next to templates already linked to rules
  - Conditionally render "Use in Rule" button only for templates NOT in use
  - Conditionally render "Edit Rule" button for templates that ARE in use

### 2. `src/pages/hr-hub/HRRemindersPage.tsx`
- Added `handleEditRule` callback that switches to "rules" tab and opens edit dialog
- Passed `onEditRule` prop to `ReminderEmailTemplates` component

---

## UI Result

| State | Badge | Button |
|-------|-------|--------|
| Template **not** in use | None | "Use in Rule" (primary) |
| Template **in use** | "In Use" (green badge with Zap icon) | "Edit Rule" (secondary) |

---

## No Database Changes Required
This uses existing `reminder_rules.email_template_id` relationship.
