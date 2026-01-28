

# Learning & Development Administrator Manual - Generation Plan

## Executive Summary

This plan creates a comprehensive **Learning & Development Administrator Manual** that documents both the legacy HRplus Training module features (ensuring continuity) and the new Intelli HRM LMS capabilities (highlighting enhancements). The manual will cover **62 database tables**, **28 UI pages**, and provide a bi-directional gap analysis.

---

## Gap Analysis: Legacy HRplus vs Intelli HRM

### Features Migrated from Legacy (Covered in Manual)

| Legacy Feature | Intelli HRM Equivalent | Status | Notes |
|----------------|------------------------|--------|-------|
| Training Types | `lms_categories` | Implemented | Renamed to Categories |
| Training Courses | `lms_courses` | Implemented | Enhanced with thumbnails, prerequisites |
| Training Staff | `training_instructors` | Implemented | Now supports internal/external flag |
| Course Costs | `training_budgets` | Partial | Budget tracking exists, cost types need table |
| Training Requests | `training_requests` + `training_request_approvals` | Implemented | Full workflow support |
| Training History | `lms_enrollments` + `external_training_records` | Implemented | Import via admin UI |
| Competency Mapping | `course_competencies` | Implemented | Bidirectional mapping |
| Training Calendar | `/training/calendar` | Implemented | Full calendar view |
| Course Evaluation | `training_evaluations` + `training_evaluation_responses` | Implemented | Post-training feedback |
| Certification | `lms_certificates` + `training_certificate_templates` | Implemented | Template-based generation |
| Gap Analysis | `/training/gap-analysis` | Enhanced | AI-powered recommendations |

### Legacy Features Requiring Documentation (Gaps to Address)

| Legacy Feature | Current Status | Recommendation |
|----------------|----------------|----------------|
| Training Agencies | Not in DB | Create `training_agencies` table for external providers |
| Agency-Course Link | Not in DB | Create `training_agency_courses` junction table |
| Delivery Methods | Inline in courses | Create `training_delivery_methods` lookup table |
| Rating Codes | Not in DB | Create `training_rating_codes` for agency ratings |
| Reject Reasons | Not in DB | Create `training_reject_reasons` lookup |
| Cancel Reasons | Not in DB | Create `training_cancel_reasons` lookup |
| Cost Types | Not in DB | Create `training_cost_types` lookup |
| Training Events | Not in DB | Create `training_events` for scheduled periods |

### New Intelli HRM Features (Not in Legacy)

| New Feature | Tables | UI Pages | Industry Alignment |
|-------------|--------|----------|-------------------|
| Course → Module → Lesson Hierarchy | `lms_modules`, `lms_lessons` | Course Viewer | Workday Learning, SAP SuccessFactors |
| Quiz/Assessment Engine | `lms_quizzes`, `lms_quiz_questions`, `lms_quiz_attempts` | Quiz Page | Industry standard |
| Learning Paths | `learning_paths`, `learning_path_courses`, `learning_path_enrollments` | Learning Paths Page | Workday Career Journeys |
| Gamification | `lms_badges`, `lms_user_badges`, `lms_user_points`, `lms_point_transactions`, `lms_leaderboards` | Employee Learning | Modern LMS standard |
| SCORM/xAPI Tracking | `lms_scorm_packages`, `lms_scorm_tracking`, `lms_xapi_statements` | Admin LMS | eLearning compliance |
| Discussion Forums | `lms_discussion_forums`, `lms_discussion_threads`, `lms_discussion_replies` | Course Viewer | Social learning |
| Bookmarks/Notes | `lms_bookmarks`, `lms_notes` | Course Viewer | Self-paced enhancement |
| Compliance Automation | `compliance_training`, `compliance_training_assignments` | Compliance Page | Regulatory alignment |
| Interactive Training | `training_content`, `training_branch_rules`, `training_remediation` | Interactive Training | Branching scenarios |
| Virtual Classroom | Virtual Sessions | Virtual Classroom Page | Remote learning |
| AI Recommendations | Via edge functions | Gap Analysis | Workday Skills Cloud alignment |

---

## Table of Contents Structure (9 Chapters + Appendices)

### Chapter 1: Module Overview & Conceptual Foundation (~70 min)

| Section | Title | Description | Legacy Reference |
|---------|-------|-------------|------------------|
| 1.1 | Introduction to Learning & Development | Purpose, positioning, strategic value, document scope | Overview of the Training Module |
| 1.2 | Core Concepts & Terminology | Course, Module, Lesson, Enrollment, Learning Path, SCORM, Competency | Glossary of Training Terms (A-Z) |
| 1.3 | User Personas & Journeys | Employee, Manager, L&D Admin, HR Partner, Executive, Training Staff journeys | A Guide to Using the Training Module |
| 1.4 | System Architecture | Data model covering 62 tables across 9 domains | N/A (NEW) |
| 1.5 | L&D Calendar & Planning Cycle | Annual training planning, quarterly reviews, compliance deadlines | Training Calendar |
| 1.6 | Legacy Migration Guide | Mapping HRplus Training concepts to Intelli HRM L&D | Training Module Updates |

### Chapter 2: Setup & Configuration Guide (~100 min)

| Section | Title | Description | Legacy Reference |
|---------|-------|-------------|------------------|
| 2.1 | Prerequisites Checklist | Competency framework, job profiles, employee records | Introduction and Key Concepts |
| 2.2 | Course Categories Setup | Create logical groupings (Training Types) | How to setup Training Types? |
| 2.3 | Course Creation & Structure | Course → Module → Lesson hierarchy | How to set up Training Courses? |
| 2.4 | Delivery Methods Configuration | In-person, Online, VILT, Blended, OJT | How to set up Delivery Methods? |
| 2.5 | Rating Codes Setup | Course/agency quality ratings | How to set up Rating Codes? |
| 2.6 | Cost Types Configuration | Direct, indirect, support costs | How to set up Cost Types? |
| 2.7 | Reject Reasons Setup | Training request rejection codes | How to set up Reject Reasons |
| 2.8 | Cancel Reasons Setup | Training cancellation codes | How to set up Cancel Reasons? |
| 2.9 | Training Staff Assignment | L&D administrators by company | How to set up Training Staff? |
| 2.10 | Quiz & Assessment Configuration | Question types, passing scores, retakes | N/A (NEW) |
| 2.11 | Learning Paths Setup | Structured journeys, prerequisites | N/A (NEW) |
| 2.12 | Competency-Course Mapping | Link courses to skills | Search By Competencies |
| 2.13 | Compliance Training Rules | Mandatory training, recertification | N/A (NEW) |
| 2.14 | Budget Configuration | Department/company budgets | Cost Types context |
| 2.15 | Instructor Management | Internal/external instructors | Training Staff |
| 2.16 | Certificate Templates | Design templates, dynamic fields | N/A (NEW) |
| 2.17 | SCORM/xAPI Package Configuration | Import packages, tracking | N/A (NEW) |

### Chapter 3: Training Agency Management (~60 min)

| Section | Title | Description | Legacy Reference |
|---------|-------|-------------|------------------|
| 3.1 | Training Agency Concepts | External providers, accreditation | Managing Training Agencies |
| 3.2 | Agency Setup | Create agency profiles, contacts | How to Set Up Training Agencies |
| 3.3 | Agency-Course Linking | Link courses to agencies | How to Link an Agency to a Course |
| 3.4 | Course Dates & Sessions | Scheduling, registration deadlines | Enter Course Details |
| 3.5 | Course Costs Configuration | Cost items, currencies | Enter Course Costs |
| 3.6 | Agency Certificates | Certificate definitions | Enter Certificates |
| 3.7 | Competencies to be Gained | Learning outcomes | Competencies to be Gained |
| 3.8 | Multi-Company Agency Sharing | Company access controls | Company using Agency |
| 3.9 | Agency Ratings & Reviews | Quality assessment | Agency Rating |

### Chapter 4: Operational Workflows (~90 min)

| Section | Title | Description | Legacy Reference |
|---------|-------|-------------|------------------|
| 4.1 | Course Lifecycle Management | Draft → Published → Archived | N/A (NEW) |
| 4.2 | Enrollment Management | Self-enrollment, assignment, waitlists | Training Requests workflow |
| 4.3 | Training Request by Gap Analysis | Competency-based requests | How to Create a Training Request by Job Gap Analysis |
| 4.4 | Training Request via Performance Appraisal | Appraisal-triggered training | How to Create a Training Request via Performance Appraisal |
| 4.5 | Training Request via Self-Service | Employee-initiated requests | How to View Training Requests by Self-Service |
| 4.6 | Training Request via Onboarding | Auto-enrollment | How to setup Training Requests by Onboarding |
| 4.7 | HR-Initiated Training Requests | Bulk enrollment | How to Create Training Requests generated by HR |
| 4.8 | Training Invitations | Manager-to-employee invitations | How to Invite an Employee to Request Training |
| 4.9 | Progress Tracking & Reminders | Lesson progress, due dates | N/A (NEW) |
| 4.10 | Assessment & Quiz Delivery | Quiz attempts, scoring | N/A (NEW) |
| 4.11 | Course Completion & Evaluation | Submit evaluation | How to Complete a Training Course and Submit an Evaluation |
| 4.12 | Certification Issuance | Certificate generation | N/A (NEW) |
| 4.13 | Training History Management | Record keeping, import | How to Record an Employee's Training History |
| 4.14 | External Training Records | Record external training | External training management |
| 4.15 | Training Calendar Operations | Schedule, conflicts | Training Calendar |

### Chapter 5: Compliance & Recertification (~70 min)

| Section | Title | Description | Legacy Reference |
|---------|-------|-------------|------------------|
| 5.1 | Compliance Training Framework | Mandatory training requirements | N/A (NEW) |
| 5.2 | Target Audience Rules | Department-based, position-based assignments | N/A (NEW) |
| 5.3 | Recertification Management | Expiry tracking, automatic re-enrollment | N/A (NEW) |
| 5.4 | Compliance Dashboard | Completion rates, overdue tracking | N/A (NEW) |
| 5.5 | Audit Trail & Documentation | Records retention, SOC 2 alignment | Training Audit |
| 5.6 | Regional Compliance Variations | Multi-country requirements | N/A (NEW) |

### Chapter 6: AI Features & Intelligence (~55 min)

| Section | Title | Description | Legacy Reference |
|---------|-------|-------------|------------------|
| 6.1 | AI-Powered Course Recommendations | Skill gap analysis | Automated Gap Analysis |
| 6.2 | Competency Gap Detection | Automated gap identification | Job Gap Analysis |
| 6.3 | Training Needs Analysis | AI-driven forecasting | N/A (NEW) |
| 6.4 | Intelligent Quiz Generation | AI-assisted questions | N/A (NEW) |
| 6.5 | Learning Analytics Predictions | Completion probability | N/A (NEW) |
| 6.6 | AI Governance & Explainability | ISO 42001 alignment | N/A (NEW) |

### Chapter 7: Analytics & Reporting (~50 min)

| Section | Title | Description | Legacy Reference |
|---------|-------|-------------|------------------|
| 7.1 | Training Analytics Dashboard | KPIs, completion rates | Reports, Pivots |
| 7.2 | Learner Progress Reports | Individual progress | Training History |
| 7.3 | Course Effectiveness Metrics | Quiz scores, evaluations | Course Evaluation |
| 7.4 | Budget Utilization Reports | Spending vs. budget | Cost tracking |
| 7.5 | Compliance Reporting | Mandatory training status | N/A (NEW) |
| 7.6 | Manager Team Training View | Team completion status | N/A (NEW) |
| 7.7 | AI-Powered BI Reports | AIModuleReportBuilder | HRplus BI |

### Chapter 8: Integration & Downstream Impacts (~65 min)

| Section | Title | Description | Legacy Reference |
|---------|-------|-------------|------------------|
| 8.1 | Onboarding Integration | Auto-enrollment triggers | Training Requests by Onboarding |
| 8.2 | Appraisal Integration | Performance-driven training | Training Request via Performance Appraisal |
| 8.3 | Competency Framework Sync | Bidirectional updates | Competencies to be Gained |
| 8.4 | Succession Planning Link | Candidate development | Succession Planning |
| 8.5 | Career Development Integration | Learning paths to career paths | N/A (NEW) |
| 8.6 | TalentLMS Integration | External LMS sync | HRplus-Talent LMS Integration |
| 8.7 | Calendar & Notification Integration | Email reminders | N/A (NEW) |
| 8.8 | Workflow Engine Integration | Custom approval workflows | Workflow for Approval Process |

### Chapter 9: Troubleshooting & Best Practices (~45 min)

| Section | Title | Description | Legacy Reference |
|---------|-------|-------------|------------------|
| 9.1 | Common Setup Issues | Category, course, enrollment errors | Training FAQs |
| 9.2 | Course Visibility Issues | Why courses don't appear | Why can't I see the course? |
| 9.3 | Progress Tracking Issues | Lesson progress, SCORM | N/A (NEW) |
| 9.4 | Quiz & Assessment Issues | Scoring, retakes | N/A (NEW) |
| 9.5 | Certificate Generation Issues | Template rendering | N/A (NEW) |
| 9.6 | Integration Troubleshooting | Onboarding sync, appraisal triggers | N/A (NEW) |
| 9.7 | Best Practices | Content design, learner engagement | N/A (NEW) |

### Appendices

| Appendix | Title | Description |
|----------|-------|-------------|
| A | Quick Reference Cards | Role-based checklists (Employee, Manager, L&D Admin, HR Partner, Training Staff) |
| B | Architecture Diagrams | ER diagrams, integration flows, SCORM tracking model |
| C | Legacy Migration Mapping | HRplus → Intelli HRM field mapping table |
| D | Glossary | 80+ L&D/LMS terms (expanded from legacy) |
| E | Version History | Changelog tracking manual updates |

---

## Database Tables to Document (62 Total)

### Core LMS Tables (18)
`lms_categories`, `lms_courses`, `lms_modules`, `lms_lessons`, `lms_quizzes`, `lms_quiz_questions`, `lms_enrollments`, `lms_lesson_progress`, `lms_quiz_attempts`, `lms_certificates`, `lms_course_prerequisites`, `lms_course_reviews`, `lms_review_helpful`, `lms_discussion_forums`, `lms_discussion_threads`, `lms_discussion_replies`, `lms_bookmarks`, `lms_notes`

### Learning Paths (3)
`learning_paths`, `learning_path_courses`, `learning_path_enrollments`

### Compliance (4)
`compliance_training`, `compliance_training_assignments`, `compliance_items`, `compliance_document_templates`

### Training Operations (18)
`training_requests`, `training_request_approvals`, `training_budgets`, `training_instructors`, `training_evaluations`, `training_evaluation_responses`, `training_analytics`, `training_needs`, `training_needs_analysis`, `training_programs`, `training_certificate_templates`, `training_enrollments`, `training_modules`, `training_content`, `training_content_progress`, `training_branch_rules`, `training_quiz_questions`, `training_quiz_attempts`

### SCORM/xAPI (3)
`lms_scorm_packages`, `lms_scorm_tracking`, `lms_xapi_statements`

### Gamification (5)
`lms_badges`, `lms_user_badges`, `lms_user_points`, `lms_point_transactions`, `lms_leaderboards`

### Competency Integration (2)
`course_competencies`, `course_instructors`

### NEW Tables Required (9) - Legacy Alignment
`training_agencies`, `training_agency_courses`, `training_delivery_methods`, `training_rating_codes`, `training_reject_reasons`, `training_cancel_reasons`, `training_cost_types`, `training_events`, `external_training_records`

---

## Implementation Files to Create

### Type Definition
```
src/types/learningDevelopmentManual.ts
```

### Manual Page
```
src/pages/enablement/LearningDevelopmentManualPage.tsx
```

### Section Components (9 chapters + appendices = ~65 components)
```
src/components/enablement/learning-development-manual/
├── index.ts
├── LndManualOverviewSection.tsx
├── LndManualSetupSection.tsx
├── LndManualAgencySection.tsx
├── LndManualWorkflowsSection.tsx
├── LndManualComplianceSection.tsx
├── LndManualAISection.tsx
├── LndManualAnalyticsSection.tsx
├── LndManualIntegrationSection.tsx
├── LndManualTroubleshootingSection.tsx
├── LndManualAppendices.tsx
└── sections/
    ├── overview/
    │   ├── LndOverviewIntroduction.tsx
    │   ├── LndOverviewCoreConcepts.tsx
    │   ├── LndOverviewPersonas.tsx
    │   ├── LndOverviewArchitecture.tsx
    │   ├── LndOverviewCalendar.tsx
    │   └── LndOverviewLegacyMigration.tsx
    ├── setup/ (17 sections)
    ├── agency/ (9 sections)
    ├── workflows/ (15 sections)
    ├── compliance/ (6 sections)
    ├── ai-features/ (6 sections)
    ├── analytics/ (7 sections)
    ├── integration/ (8 sections)
    ├── troubleshooting/ (7 sections)
    └── appendices/
        ├── LndQuickReference.tsx
        ├── LndArchitectureDiagrams.tsx
        ├── LndLegacyMigrationMapping.tsx
        ├── LndGlossary.tsx
        └── LndVersionHistory.tsx
```

### Route Registration
```
src/routes/lazyPages.ts - Add lazy import
src/App.tsx - Add route at /enablement/manuals/learning-development
```

### Enablement Integration
```
src/pages/enablement/ModuleManualsIndexPage.tsx - Add L&D manual card
src/services/kb/categoryManualMapping.ts - Add training-learning mapping
```

---

## Technical Specifications

### Read Time Estimates
| Chapter | Sections | Est. Read Time |
|---------|----------|----------------|
| 1. Overview | 6 | 70 min |
| 2. Setup | 17 | 100 min |
| 3. Agency Management | 9 | 60 min |
| 4. Workflows | 15 | 90 min |
| 5. Compliance | 6 | 70 min |
| 6. AI Features | 6 | 55 min |
| 7. Analytics | 7 | 50 min |
| 8. Integration | 8 | 65 min |
| 9. Troubleshooting | 7 | 45 min |
| Appendices | 5 | 40 min |
| **Total** | **86** | **~645 min (~10.75 hours)** |

### Industry Alignment
- **Workday Learning**: Learning Paths, Skills Cloud integration
- **SAP SuccessFactors Learning**: Compliance tracking, course hierarchy
- **Cornerstone OnDemand**: SCORM/xAPI, gamification
- **LinkedIn Learning**: External provider integration pattern

### Content Quality Standards
- Flesch-Kincaid Grade 8-10 readability
- Maximum 40 words per description
- Database field references for all technical sections
- Cross-reference to legacy HRplus documentation where applicable
- All competitor references neutralized (use "Industry Standard" or "Enterprise Pattern")

---

## Database Migration Plan (Legacy Gaps)

### Phase 1: Lookup Tables
```sql
-- Training Delivery Methods (from legacy)
CREATE TABLE training_delivery_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  code VARCHAR(10) NOT NULL,
  name VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Training Rating Codes (for agencies)
CREATE TABLE training_rating_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  code VARCHAR(10) NOT NULL,
  name VARCHAR(35) NOT NULL,
  points INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reject/Cancel Reasons
CREATE TABLE training_reject_reasons (...);
CREATE TABLE training_cancel_reasons (...);
CREATE TABLE training_cost_types (...);
```

### Phase 2: Training Agency Management
```sql
-- Training Agencies (external providers)
CREATE TABLE training_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  address_line1 TEXT, address_line2 TEXT, address_line3 TEXT,
  state VARCHAR(50), zip VARCHAR(20),
  country_id UUID REFERENCES countries(id),
  email VARCHAR(100), website VARCHAR(200),
  telephone VARCHAR(30), fax VARCHAR(30),
  contact_name VARCHAR(100), contact_title VARCHAR(100),
  rating_code_id UUID REFERENCES training_rating_codes(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Agency-Company Access
CREATE TABLE training_agency_companies (
  agency_id UUID REFERENCES training_agencies(id),
  company_id UUID REFERENCES companies(id),
  PRIMARY KEY (agency_id, company_id)
);

-- Agency Courses (linking agencies to courses)
CREATE TABLE training_agency_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES training_agencies(id),
  course_id UUID REFERENCES lms_courses(id),
  delivery_method_id UUID REFERENCES training_delivery_methods(id),
  lecturer_name VARCHAR(100),
  date_from DATE, date_to DATE,
  start_time TIME, end_time TIME,
  registration_closing_date DATE,
  min_class_size INTEGER, max_class_size INTEGER,
  duration_value NUMERIC, duration_type VARCHAR(20),
  contact_hours NUMERIC,
  is_certification_course BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Phase 3: Training Events
```sql
-- Training Events (scheduled periods)
CREATE TABLE training_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Deliverables Summary

1. **Administrator Manual**: 9 chapters + 5 appendices (~86 sections, 645 min read time)
2. **Database Migrations**: 9 new tables for legacy feature parity
3. **Component Library**: ~65 React components
4. **Route Registration**: `/enablement/manuals/learning-development`
5. **Gap Analysis Documentation**: Legacy → Intelli HRM mapping in Appendix C
6. **Glossary**: 80+ terms (expanded from legacy 50 terms)

