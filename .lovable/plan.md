
# L&D Manual Chapter 3: Industry-Standard Vendor & External Training Management

## Executive Summary

Chapter 3 currently documents **phantom tables** (`training_agencies`, `training_agency_courses`, `training_agency_course_dates`) that **DO NOT EXIST** in the database. This plan creates a comprehensive industry-aligned chapter that:

1. Creates the missing database tables to enable enterprise-grade vendor management
2. Rewrites all documentation to align with actual (new) schema
3. Follows Workday vendor lifecycle methodology (Selection → Onboarding → Performance → Offboarding)

---

## Part 1: Industry Standard Gap Analysis

### Current State vs Industry Standard

| Industry Requirement | Current System | Gap |
|---------------------|----------------|-----|
| Vendor Registry | No dedicated table | CRITICAL |
| Vendor Performance Tracking | No structure | CRITICAL |
| Vendor Course Catalog | None | CRITICAL |
| Session Scheduling | None | HIGH |
| Cost Management | Partial (training_requests.estimated_cost) | MEDIUM |
| External Training Records | EXISTS (21 fields) | ALIGNED |
| Training Requests | EXISTS (27 fields) | ALIGNED |
| External Instructors | EXISTS (training_instructors) | ALIGNED |
| Evaluations | EXISTS (training_evaluations) | ALIGNED |

### Industry Standards Reference (Workday/Cornerstone)

Based on research, enterprise LMS vendor management requires:

1. **Vendor Lifecycle Management**
   - Selection criteria and scoring
   - Onboarding and contracting
   - Performance monitoring with KPIs
   - Renewal/offboarding decisions

2. **Tiered Vendor Classification**
   - Strategic vendors (quarterly reviews, executive sponsorship)
   - Operational vendors (standard monitoring)
   - Transactional vendors (automated tracking)

3. **Centralized Governance**
   - Single owner per vendor relationship
   - Cross-functional visibility (L&D, Finance, Legal)
   - Consistent reporting and escalation

---

## Part 2: Database Schema Creation

### 2.1 New Table: `training_vendors` (Vendor Registry)

Creates the enterprise vendor management registry:

```sql
CREATE TABLE training_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  vendor_type TEXT NOT NULL DEFAULT 'standard', -- strategic, operational, transactional
  website_url TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  specializations TEXT[],
  accreditations TEXT[],
  is_preferred BOOLEAN NOT NULL DEFAULT false,
  contract_start_date DATE,
  contract_end_date DATE,
  contract_value NUMERIC,
  payment_terms TEXT,
  performance_score NUMERIC, -- 0-100 composite score
  last_review_date DATE,
  next_review_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- active, under_review, suspended, terminated
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, code)
);
```

**Fields: 25**

### 2.2 New Table: `training_vendor_courses` (Vendor Course Catalog)

```sql
CREATE TABLE training_vendor_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES training_vendors(id) ON DELETE CASCADE,
  course_code TEXT,
  course_name TEXT NOT NULL,
  description TEXT,
  delivery_method TEXT NOT NULL DEFAULT 'in_person', -- in_person, virtual, hybrid, self_paced
  duration_hours NUMERIC,
  duration_days INTEGER,
  certification_name TEXT,
  certification_validity_months INTEGER,
  target_audience TEXT,
  prerequisites TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Fields: 15**

### 2.3 New Table: `training_vendor_sessions` (Session Scheduling)

```sql
CREATE TABLE training_vendor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_course_id UUID NOT NULL REFERENCES training_vendor_courses(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  timezone TEXT DEFAULT 'UTC',
  location TEXT,
  location_type TEXT DEFAULT 'in_person', -- in_person, virtual, hybrid
  meeting_url TEXT,
  capacity INTEGER,
  registered_count INTEGER NOT NULL DEFAULT 0,
  waitlist_count INTEGER NOT NULL DEFAULT 0,
  registration_deadline DATE,
  cancellation_deadline DATE,
  cost_per_person NUMERIC,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, confirmed, in_progress, completed, cancelled
  instructor_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Fields: 21**

### 2.4 New Table: `training_vendor_costs` (Cost Breakdown)

```sql
CREATE TABLE training_vendor_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_course_id UUID REFERENCES training_vendor_courses(id),
  vendor_session_id UUID REFERENCES training_vendor_sessions(id),
  cost_type TEXT NOT NULL, -- tuition, materials, travel, accommodation, certification_fee
  description TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  is_per_person BOOLEAN NOT NULL DEFAULT true,
  is_included BOOLEAN NOT NULL DEFAULT false, -- included in base price
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Fields: 11**

### 2.5 New Table: `training_vendor_reviews` (Performance Tracking)

```sql
CREATE TABLE training_vendor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES training_vendors(id) ON DELETE CASCADE,
  review_type TEXT NOT NULL, -- quarterly, annual, incident, renewal
  review_date DATE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id),
  overall_score NUMERIC, -- 0-100
  quality_score NUMERIC,
  delivery_score NUMERIC,
  value_score NUMERIC,
  responsiveness_score NUMERIC,
  findings JSONB,
  recommendations JSONB,
  action_items JSONB,
  next_review_date DATE,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, submitted, approved
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Fields: 17**

---

## Part 3: Chapter 3 Documentation Rewrite

### New Section Structure (Industry-Aligned)

Following Workday's vendor lifecycle methodology:

| Section | Title | Focus Area |
|---------|-------|------------|
| 3.1 | External Training & Vendor Concepts | Overview, terminology, lifecycle model |
| 3.2 | Vendor Registry & Classification | training_vendors table, tiering |
| 3.3 | Vendor Selection & Onboarding | Selection criteria, contracting |
| 3.4 | Vendor Course Catalog | training_vendor_courses, offerings |
| 3.5 | Session Scheduling & Capacity | training_vendor_sessions, waitlists |
| 3.6 | Cost Management & Budgets | training_vendor_costs, budget integration |
| 3.7 | Training Request Workflow | Request lifecycle, approvals |
| 3.8 | External Training Records | external_training_records, history |
| 3.9 | Vendor Performance Management | Reviews, scorecards, KPIs |
| 3.10 | Certifications & Credentials | External certifications, expiry |
| 3.11 | Multi-Company Vendor Sharing | Group-level vendor relationships |
| 3.12 | Integration with Training Needs | Gap-based vendor recommendations |

**Total: 12 sections (expanded from 9)**

### Detailed Section Content

#### 3.1 External Training & Vendor Concepts (~350 lines)
- Vendor vs Agency terminology clarification
- 4-stage vendor lifecycle diagram (Selection → Onboarding → Performance → Offboarding)
- Strategic, Operational, Transactional tier definitions
- Data model overview with actual tables
- When to use external training vs internal LMS
- Industry benchmarks (ATD, SHRM data)

#### 3.2 Vendor Registry & Classification (~400 lines)
- Full field reference for `training_vendors` (25 fields)
- Step-by-step: Creating a vendor
- Vendor type classification guidelines
- Preferred vendor designation criteria
- Contract management fields
- Status lifecycle (active → under_review → suspended → terminated)

#### 3.3 Vendor Selection & Onboarding (~300 lines)
- Selection criteria checklist
- Weighted scoring model template
- Due diligence requirements
- Contract setup workflow
- Kickoff meeting agenda template
- Compliance alignment checklist

#### 3.4 Vendor Course Catalog (~350 lines)
- Full field reference for `training_vendor_courses` (15 fields)
- Step-by-step: Adding vendor courses
- Delivery method guidelines
- Certification linking
- Prerequisites configuration
- Target audience mapping

#### 3.5 Session Scheduling & Capacity (~350 lines)
- Full field reference for `training_vendor_sessions` (21 fields)
- Session status workflow diagram
- Capacity management rules
- Waitlist automation
- Cancellation handling
- Calendar integration

#### 3.6 Cost Management & Budgets (~300 lines)
- Full field reference for `training_vendor_costs` (11 fields)
- Cost type breakdown
- Per-person vs fixed costs
- Multi-currency handling
- Budget deduction workflow
- Cost forecasting

#### 3.7 Training Request Workflow (~400 lines)
- Full field reference for `training_requests` (27 fields)
- Request lifecycle diagram
- Approval chain configuration
- Source types (manual, gap_analysis, appraisal)
- Request status transitions
- Manager and HR approval workflows

#### 3.8 External Training Records (~350 lines)
- Full field reference for `external_training_records` (21 fields)
- Step-by-step: Recording external training
- Skills acquired mapping
- Certificate upload workflow
- Training history aggregation
- UI navigation paths

#### 3.9 Vendor Performance Management (~350 lines)
- Full field reference for `training_vendor_reviews` (17 fields)
- Review type definitions (quarterly, annual, incident)
- Scoring methodology (quality, delivery, value, responsiveness)
- Performance dashboard components
- Action item tracking
- Vendor improvement plans

#### 3.10 Certifications & Credentials (~250 lines)
- External certification tracking
- Expiry date management
- Renewal workflows
- Certificate URL storage
- Integration with employee profiles

#### 3.11 Multi-Company Vendor Sharing (~250 lines)
- Group-level vendor relationships
- Volume discount tracking
- Shared vs company-specific vendors
- Cross-company enrollment
- Budget allocation by entity

#### 3.12 Integration with Training Needs (~250 lines)
- Gap-based vendor recommendations
- Training needs analysis integration
- AI-powered vendor matching
- Competency-to-vendor course mapping
- Automated request generation

---

## Part 4: Implementation Files

### Database Migration
- **File:** `supabase/migrations/[timestamp]_create_vendor_management_tables.sql`
- **Creates:** 5 new tables, indexes, RLS policies

### Manual Components to Create/Update

| File | Action | Est. Lines |
|------|--------|------------|
| `LndAgencySection.tsx` | REWRITE as parent | 80 |
| `sections/agency/index.ts` | UPDATE exports | 25 |
| `sections/agency/LndVendorConcepts.tsx` | CREATE (replaces LndAgencyConcepts) | 350 |
| `sections/agency/LndVendorRegistry.tsx` | CREATE (replaces LndAgencySetup) | 400 |
| `sections/agency/LndVendorSelection.tsx` | CREATE (new section) | 300 |
| `sections/agency/LndVendorCourses.tsx` | CREATE (replaces LndAgencyCourseLinking) | 350 |
| `sections/agency/LndVendorSessions.tsx` | CREATE (replaces LndAgencySessionDates) | 350 |
| `sections/agency/LndVendorCosts.tsx` | CREATE (replaces LndAgencyCourseCosts) | 300 |
| `sections/agency/LndTrainingRequests.tsx` | CREATE (new section) | 400 |
| `sections/agency/LndExternalRecords.tsx` | CREATE (new section) | 350 |
| `sections/agency/LndVendorPerformance.tsx` | CREATE (replaces LndAgencyRatings) | 350 |
| `sections/agency/LndExternalCertifications.tsx` | CREATE (replaces LndAgencyCertificates) | 250 |
| `sections/agency/LndVendorSharing.tsx` | CREATE (replaces LndAgencyMultiCompany) | 250 |
| `sections/agency/LndVendorIntegration.tsx` | CREATE (replaces LndAgencyCompetencies) | 250 |

### TOC Update
- **File:** `src/types/learningDevelopmentManual.ts`
- **Changes:** Update Chapter 3 section titles and add 3 new sections

---

## Part 5: Implementation Sequence

### Phase 1: Database Foundation
1. Create database migration with 5 new tables
2. Add RLS policies for multi-tenant security
3. Create indexes for performance

### Phase 2: Documentation Components
1. Create 12 new modular section components
2. Rewrite parent `LndAgencySection.tsx`
3. Update exports in `index.ts`
4. Update TOC in `learningDevelopmentManual.ts`

### Phase 3: UI Integration (Future)
1. Create VendorManagementPage
2. Add vendor CRUD operations
3. Integrate with training request workflow
4. Add vendor performance dashboard

---

## Summary: Gap Closure

| Gap Area | Before | After |
|----------|--------|-------|
| Vendor Registry | None (phantom table) | Full 25-field table |
| Vendor Courses | None (phantom table) | Full 15-field table |
| Session Scheduling | None (phantom table) | Full 21-field table |
| Cost Tracking | Partial | Full 11-field dedicated table |
| Performance Reviews | None | Full 17-field table |
| Documentation Sections | 9 placeholders | 12 comprehensive sections |
| Industry Alignment | ~30% | ~95% |

**Total New Database Fields:** 89 fields across 5 tables
**Total Documentation:** ~3,700 lines across 12 sections
