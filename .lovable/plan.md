
# Add Feature Registry and Product Capabilities to Enablement Navigation

## Overview

Two critical reference documents are currently inaccessible from the Enablement Hub UI:

1. **Feature Registry** - The code-defined single source of truth for all 1,200+ features
2. **Product Capabilities Document** - The business-facing document showing 25 modules and 1,675+ capabilities

Both have working routes but were removed from the navigation during consolidation. This plan restores their visibility in the Reference Library section.

---

## Current State

### Enablement Hub - Reference Library Section
Currently shows 6 items:
- Administrator Manuals
- Quick Start Guides
- Implementation Checklists
- Module Documentation
- Enablement Artifacts
- Platform Standards

### Hidden but Working Routes
| Document | Route | Status |
|----------|-------|--------|
| Product Capabilities | `/enablement/product-capabilities` | Route works, not linked |
| Route Registry | `/enablement/route-registry` | Route works, not linked |
| Feature Database | `/enablement/feature-database` | Redirects to Release Center |

---

## Proposed Changes

### File 1: `src/pages/enablement/EnablementHubPage.tsx`

Add two new entries to the Reference Library section:

```typescript
{
  titleKey: "3. Reference Library",
  items: [
    // ... existing items ...
    
    // NEW: Product Capabilities Document
    {
      title: "Product Capabilities",
      description: "25 modules, 1,675+ capabilities by employee lifecycle",
      href: "/enablement/product-capabilities",
      icon: FileText,
      color: "bg-orange-500/10 text-orange-500",
      badge: "1,675+ Capabilities",
    },
    
    // NEW: Feature Registry
    {
      title: "Feature Registry",
      description: "Code-defined feature definitions and route mappings",
      href: "/enablement/route-registry",
      icon: Database,
      color: "bg-indigo-500/10 text-indigo-500",
      badge: "Developer Reference",
    },
  ],
},
```

---

## Updated Reference Library Structure

After implementation, the Reference Library section will show:

| Item | Description | Audience |
|------|-------------|----------|
| Administrator Manuals | 10 comprehensive admin guides (515+ sections) | Administrators |
| Quick Start Guides | Get modules running in 10-30 minutes | Implementers |
| Implementation Checklists | Prerequisites and go-live readiness | Project Managers |
| Module Documentation | Browse all content by module | All Users |
| Enablement Artifacts | Single source of truth for all content | Content Authors |
| Platform Standards | 5 enterprise patterns | Developers |
| **Product Capabilities** (NEW) | 25 modules, 1,675+ capabilities | Sales, Executives |
| **Feature Registry** (NEW) | Code-defined feature definitions | Developers |

---

## Technical Details

### Icons to Import
Add to the imports in `EnablementHubPage.tsx`:
```typescript
import { Database } from "lucide-react";
```

### No Route Changes Required
Both routes already exist and work:
- `/enablement/product-capabilities` → `ProductCapabilitiesPage`
- `/enablement/route-registry` → `RouteRegistryPage`

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Discoverability** | Critical reference documents visible from main navigation |
| **Coverage Analysis** | Content Creation Studio agent can reference these documents |
| **Developer Access** | Route Registry provides feature-to-route mapping visibility |
| **Sales Enablement** | Product Capabilities document accessible for demos |
| **Single Source of Truth** | Feature Registry shows authoritative feature definitions |

---

## Files Summary

| File | Action | Changes |
|------|--------|---------|
| `src/pages/enablement/EnablementHubPage.tsx` | MODIFY | Add 2 items to Reference Library section, import Database icon |

---

## Implementation Notes

1. The Feature Registry page (`RouteRegistryPage`) shows:
   - Feature sync status (code vs database)
   - Route validation
   - Product capabilities validation
   - Orphan feature management

2. The Product Capabilities page shows:
   - Executive summary
   - 25 modules organized by Act (Prologue, Act 1-4)
   - AI capabilities per module
   - Regional advantages
   - PDF export and print functionality

Both are essential for the Documentation Agent to perform accurate coverage analysis.
