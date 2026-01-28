

# L&D Manual Chapter 3: Full Industry Alignment Implementation Plan

## Scope

Close ALL gaps between documentation, database schema, and industry standards with the exception of:
- Content Marketplace (Future Roadmap)
- Vendor API Integration (Future Roadmap)
- Automated Session Booking (Future Roadmap)

---

## Phase 1: Database Schema Enhancements

### 1.1 Add Missing Fields to Existing Tables

**Table: `training_vendors`**
| Field | Type | Purpose |
|-------|------|---------|
| `group_id` | UUID | Multi-company vendor sharing |
| `sla_document_url` | TEXT | Service level agreement document |

**Table: `training_vendor_sessions`**
| Field | Type | Purpose |
|-------|------|---------|
| `minimum_attendees` | INTEGER | Threshold for session confirmation |
| `confirmation_deadline` | DATE | Deadline to confirm session runs |

**Table: `training_vendor_courses`**
| Field | Type | Purpose |
|-------|------|---------|
| `base_price` | NUMERIC | Course-level pricing (separate from session) |
| `currency` | TEXT | Base price currency |

### 1.2 Create New Tables

**Table: `training_vendor_contacts` (Multi-contact support)**
```sql
CREATE TABLE training_vendor_contacts (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES training_vendors(id),
  contact_type TEXT, -- primary, billing, technical, escalation
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Table: `vendor_session_enrollments` (Session enrollment tracking)**
```sql
CREATE TABLE vendor_session_enrollments (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES training_vendor_sessions(id),
  employee_id UUID REFERENCES employees(id),
  training_request_id UUID REFERENCES training_requests(id),
  status TEXT, -- registered, waitlisted, confirmed, attended, no_show, cancelled
  registered_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  attended BOOLEAN,
  notes TEXT
);
```

**Table: `vendor_session_waitlist` (Waitlist management)**
```sql
CREATE TABLE vendor_session_waitlist (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES training_vendor_sessions(id),
  employee_id UUID REFERENCES employees(id),
  training_request_id UUID REFERENCES training_requests(id),
  position INTEGER NOT NULL,
  added_at TIMESTAMPTZ DEFAULT now(),
  promoted_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  status TEXT DEFAULT 'waiting' -- waiting, promoted, expired, cancelled
);
```

**Table: `vendor_volume_discounts` (Tiered pricing)**
```sql
CREATE TABLE vendor_volume_discounts (
  id UUID PRIMARY KEY,
  vendor_id UUID REFERENCES training_vendors(id),
  min_enrollments INTEGER NOT NULL,
  max_enrollments INTEGER,
  discount_percentage NUMERIC NOT NULL,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Phase 2: Expand Thin Documentation Sections

### 2.1 Section 3.9: Vendor Performance Management
**Current**: 130 lines (conceptual only)
**Add**:
- Full `training_vendor_reviews` field reference table (17 fields)
- Full `training_evaluations` field reference (learner feedback link)
- Full `training_evaluation_responses` field reference
- Performance score calculation methodology
- Review workflow diagram
- Action item tracking process

### 2.2 Section 3.10: Certifications & Credentials
**Current**: 71 lines (thin)
**Add**:
- Certificate fields from `external_training_records` (certificate_received, certificate_url, certificate_expiry_date)
- Certificate fields from `training_vendor_courses` (certification_name, certification_validity_months)
- Step-by-step: Uploading certificates
- Recertification workflow automation
- Compliance alert configuration

### 2.3 Section 3.11: Multi-Company Vendor Sharing
**Current**: 70 lines (conceptual)
**Add**:
- New `group_id` field documentation
- Cross-company enrollment tracking
- Volume discount aggregation logic
- Per-company budget isolation
- Group-level reporting

### 2.4 Section 3.12: Integration with Training Needs
**Current**: 69 lines (conceptual)
**Add**:
- `training_needs` table field reference (16 fields)
- `training_needs_analysis` table field reference
- `competency_course_mappings` field reference
- AI recommendation workflow diagram
- Gap-to-course matching algorithm

---

## Phase 3: Add Missing Field Documentation

### 3.1 Section 3.7: Training Request Workflow

**Add missing `training_requests` fields (6 fields)**:
| Field | Type | Description |
|-------|------|-------------|
| `company_id` | UUID | Company scope |
| `approved_by` | UUID | Final approver |
| `approved_at` | Timestamp | Approval timestamp |
| `rejection_reason` | Text | Reason if rejected |
| `workflow_instance_id` | UUID | Link to workflow engine |
| `source_module` | Text | Originating module |

**Add new subsection 3.7.1: Request Approvals**
- Full `training_request_approvals` field reference (8 fields)
- Approval chain configuration
- Escalation rules
- SLA tracking

### 3.2 Section 3.6: Cost Management & Budgets

**Add full `training_budgets` field reference (10 fields)**:
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| company_id | UUID | Company scope |
| department_id | UUID | Department scope (optional) |
| fiscal_year | INTEGER | Budget year |
| allocated_amount | NUMERIC | Total budget |
| spent_amount | NUMERIC | Year-to-date spend |
| committed_amount | NUMERIC | Approved but not spent |
| currency | TEXT | Budget currency |
| created_at | TIMESTAMPTZ | Record creation |
| updated_at | TIMESTAMPTZ | Last update |

**Add new subsection: Volume Discounts**
- `vendor_volume_discounts` table field reference
- Discount tier configuration
- Automatic discount application

---

## Phase 4: Create New Documentation Sections

### 4.1 Section 3.13: External Instructors

**New file**: `LndExternalInstructors.tsx`

**Content (~300 lines)**:
- Learning objectives
- `training_instructors` field reference (14 fields)
- Internal vs External instructor distinction
- Step-by-step: Adding external instructor
- Specialization management
- Hourly rate configuration
- Instructor assignment to sessions
- Instructor performance tracking

### 4.2 Section 3.14: Session Enrollments & Waitlists

**New file**: `LndSessionEnrollments.tsx`

**Content (~280 lines)**:
- Learning objectives
- `vendor_session_enrollments` field reference (10 fields)
- `vendor_session_waitlist` field reference (8 fields)
- Enrollment workflow diagram
- Waitlist promotion automation
- No-show tracking
- Attendance confirmation

### 4.3 Section 3.15: Vendor Contacts Management

**New file**: `LndVendorContacts.tsx`

**Content (~200 lines)**:
- Learning objectives
- `training_vendor_contacts` field reference (9 fields)
- Contact type definitions
- Primary contact designation
- Escalation path configuration

### 4.4 Section 3.16: Vendor Offboarding

**New file**: `LndVendorOffboarding.tsx`

**Content (~220 lines)**:
- Learning objectives
- Offboarding triggers (contract end, performance issues, business decision)
- Data retention requirements
- Historical record preservation
- Transition planning checklist
- Knowledge transfer process

---

## Phase 5: Update Parent Component & Exports

### 5.1 Update `LndAgencySection.tsx`

- Import 4 new section components
- Update header: "16 Sections" (was 12)
- Update read time: "~120 min" (was 90)
- Update table count: "9 Database Tables" (was 5)

### 5.2 Update `sections/agency/index.ts`

Add exports for new components:
```typescript
export { LndExternalInstructors } from './LndExternalInstructors';
export { LndSessionEnrollments } from './LndSessionEnrollments';
export { LndVendorContacts } from './LndVendorContacts';
export { LndVendorOffboarding } from './LndVendorOffboarding';
```

---

## Phase 6: Update TOC Structure

### 6.1 Add 4 New Sections to `learningDevelopmentManual.ts`

```typescript
{
  id: 'sec-3-13',
  sectionNumber: '3.13',
  title: 'External Instructors',
  description: 'Manage external training instructors, specializations, and rates',
  contentLevel: 'procedure',
  estimatedReadTime: 7,
  targetRoles: ['Admin', 'L&D Admin']
},
{
  id: 'sec-3-14',
  sectionNumber: '3.14',
  title: 'Session Enrollments & Waitlists',
  description: 'Employee enrollment tracking, waitlist management, and attendance',
  contentLevel: 'procedure',
  estimatedReadTime: 7,
  targetRoles: ['Admin', 'L&D Admin']
},
{
  id: 'sec-3-15',
  sectionNumber: '3.15',
  title: 'Vendor Contacts Management',
  description: 'Multiple contact types, escalation paths, and communication',
  contentLevel: 'procedure',
  estimatedReadTime: 5,
  targetRoles: ['Admin', 'L&D Admin']
},
{
  id: 'sec-3-16',
  sectionNumber: '3.16',
  title: 'Vendor Offboarding',
  description: 'Contract termination, data retention, and transition planning',
  contentLevel: 'procedure',
  estimatedReadTime: 5,
  targetRoles: ['Admin', 'L&D Admin']
}
```

### 6.2 Update Chapter Metadata

- Total sections: 16 (was 12)
- Estimated read time: 120 min (was 90)
- Database tables: 9 (was 5)

---

## Phase 7: Document UI Roadmap

### 7.1 Add UI Roadmap Section to Documentation

Note in Section 3.1 (Concepts) or create new section:

**Planned UI Pages (Future Release)**:
| Page | Route | Purpose |
|------|-------|---------|
| VendorManagementPage | /training/vendors | Vendor registry CRUD |
| VendorDetailPage | /training/vendors/:id | Vendor profile with tabs |
| VendorCoursesTab | Embedded | Course catalog management |
| VendorSessionsTab | Embedded | Session scheduling |
| VendorReviewsTab | Embedded | Performance reviews |
| VendorContactsTab | Embedded | Contact management |

**Future Roadmap Items** (Not in current scope):
- Content Marketplace integration
- Vendor API Integration (xAPI, LTI)
- Automated Session Booking

---

## Implementation Summary

### Database Changes
| Change Type | Count |
|-------------|-------|
| New fields in existing tables | 6 fields |
| New tables | 4 tables |
| New indexes | ~8 |
| New RLS policies | ~8 |

### Documentation Changes
| Change Type | Files | Lines Added |
|-------------|-------|-------------|
| Expand thin sections (3.9-3.12) | 4 | +450 |
| Add missing fields (3.6, 3.7) | 2 | +150 |
| New sections (3.13-3.16) | 4 | +1,000 |
| Parent component updates | 2 | +50 |
| TOC updates | 1 | +60 |
| **TOTAL** | 13 | **~1,710 lines** |

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/xxx_vendor_schema_enhancements.sql` | CREATE |
| `LndVendorPerformance.tsx` | EXPAND |
| `LndExternalCertifications.tsx` | EXPAND |
| `LndVendorSharing.tsx` | EXPAND |
| `LndVendorIntegration.tsx` | EXPAND |
| `LndTrainingRequests.tsx` | ADD FIELDS |
| `LndVendorCosts.tsx` | ADD BUDGETS |
| `LndExternalInstructors.tsx` | CREATE |
| `LndSessionEnrollments.tsx` | CREATE |
| `LndVendorContacts.tsx` | CREATE |
| `LndVendorOffboarding.tsx` | CREATE |
| `index.ts` | UPDATE EXPORTS |
| `LndAgencySection.tsx` | UPDATE PARENT |
| `learningDevelopmentManual.ts` | UPDATE TOC |

---

## Gap Closure Summary

| Gap Category | Before | After | Status |
|--------------|--------|-------|--------|
| Documentation sections | 12 | 16 | CLOSED |
| Thin sections expanded | 4 thin | 0 thin | CLOSED |
| Missing field docs | ~30 fields | 0 | CLOSED |
| Missing tables | 2 | 0 | CLOSED |
| Schema multi-company | No group_id | Has group_id | CLOSED |
| Schema enrollments | None | Full tracking | CLOSED |
| Schema waitlists | count only | Full table | CLOSED |
| Schema volume discounts | None | Full table | CLOSED |
| Schema vendor contacts | Single | Multiple | CLOSED |
| Vendor offboarding | None | Documented | CLOSED |
| UI pages | None | Documented as planned | NOTED |
| Content Marketplace | None | Future roadmap | DEFERRED |
| Vendor API Integration | None | Future roadmap | DEFERRED |
| Automated Session Booking | None | Future roadmap | DEFERRED |

**Industry alignment: ~95%** (excluding 3 deferred features)

