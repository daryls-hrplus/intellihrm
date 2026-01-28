
# Learning & Development Manual - Chapter 2 (Setup) Comprehensive Update Plan

## Current State Analysis

### Problem Summary
The current `LndSetupSection.tsx` is only **35 lines** with:
- Section 2.1: Basic 4-item checklist (no detail)
- Section 2.2: 1 paragraph placeholder
- Section 2.3: 1 paragraph placeholder
- Sections 2.4-2.16: Loop generating 13 identical placeholder sections with "Configuration details available in full documentation"

This is **completely inadequate** for an implementation manual.

### Expected Standard (matching Workforce Foundation sections)
Each setup section should include:
- LearningObjectives component
- Field reference tables with all database fields
- Step-by-step configuration guides
- Configuration examples with real values
- Business rules documentation
- Warning/Tip callouts
- Screenshot placeholders
- Implementation sequence dependencies

---

## Implementation Plan

### Phase 1: Create Modular Section Structure

Create modular components matching the Workforce Foundation pattern:

```
src/components/enablement/learning-development-manual/
├── sections/
│   └── setup/
│       ├── index.ts
│       ├── LndSetupPrerequisites.tsx      (~300 lines)
│       ├── LndSetupCategories.tsx         (~250 lines)
│       ├── LndSetupCourses.tsx            (~450 lines)
│       ├── LndSetupModulesLessons.tsx     (~400 lines)
│       ├── LndSetupQuizzes.tsx            (~400 lines)
│       ├── LndSetupLearningPaths.tsx      (~350 lines)
│       ├── LndSetupCompetencyMapping.tsx  (~250 lines)
│       ├── LndSetupCompliance.tsx         (~350 lines)
│       ├── LndSetupInstructors.tsx        (~300 lines)
│       ├── LndSetupBudgets.tsx            (~250 lines)
│       ├── LndSetupEvaluations.tsx        (~300 lines)
│       ├── LndSetupGamification.tsx       (~350 lines)
│       ├── LndSetupScormXapi.tsx          (~300 lines)
│       ├── LndSetupCertificates.tsx       (~250 lines)
│       ├── LndSetupTrainingRequests.tsx   (~250 lines)
│       └── LndSetupCompanySettings.tsx    (~200 lines)
```

---

### Phase 2: Section 2.1 - Prerequisites & Implementation Sequence

**File:** `LndSetupPrerequisites.tsx`

**Content:**

1. **Learning Objectives**
   - Understand all prerequisites before configuring L&D module
   - Verify cross-module dependencies are established
   - Plan configuration sequence based on organizational complexity

2. **Cross-Module Dependencies Card**
   | Dependency | Source Module | Required For | Status Check |
   |------------|---------------|--------------|--------------|
   | Employee Records | Workforce | Enrollments, Assignments | Profiles table populated |
   | Manager Hierarchy | Workforce | Request Approvals, Team Views | Reporting structure set |
   | Departments | Workforce | Budget Allocation, Compliance Targeting | Department codes exist |
   | Competency Framework | Performance | Course-Competency Mapping | Competencies defined |
   | Approval Workflows | HR Hub | Training Requests | Workflow templates configured |

3. **Pre-Configuration Checklist**
   - Employee data imported with active status
   - Department structure finalized
   - Competency framework populated (optional but recommended)
   - Company fiscal year configured (for budgets)
   - Approval workflow templates created (for requests)

4. **Implementation Sequence Table**
   | Step | Entity | Required | Dependency | Admin Route |
   |------|--------|----------|------------|-------------|
   | 1 | Categories | Yes | None | Admin → LMS → Categories |
   | 2 | Courses | Yes | Categories | Admin → LMS → Courses |
   | 3 | Modules | Yes | Courses | Course drill-down |
   | 4 | Lessons | Yes | Modules | Module drill-down |
   | 5 | Quizzes | Optional | Courses | Admin → LMS → Quizzes |
   | 6 | Learning Paths | Optional | Courses | Training → Learning Paths |
   | 7 | Competency Mapping | Optional | Courses + Competencies | Training → Course Competencies |
   | 8 | Compliance Rules | Optional | Courses | Training → Compliance |
   | 9 | Instructors | Optional | None | Training → Instructors |
   | 10 | Budgets | Optional | Departments | Training → Budgets |
   | 11 | Evaluations | Optional | None | Training → Evaluations |
   | 12 | Badges | Optional | Courses | Admin → Gamification |
   | 13 | SCORM Packages | Optional | Courses | Course settings |
   | 14 | Certificate Templates | Optional | Courses | Admin → Certificates |

5. **WarningCallout**: "Complete Workforce setup before L&D. Missing employee records prevent enrollment operations."

---

### Phase 3: Section 2.2 - Course Categories

**File:** `LndSetupCategories.tsx`

**Content:**

1. **Learning Objectives**
   - Create logical course groupings for catalog organization
   - Configure category codes and display ordering
   - Understand category hierarchy best practices

2. **Field Reference Table - lms_categories**
   | Field | Type | Required | Description | Validation |
   |-------|------|----------|-------------|------------|
   | code | Text | Yes | Unique identifier for the category | 2-20 chars, uppercase |
   | name | Text | Yes | Display name in course catalog | 2-100 chars |
   | description | Text | No | Category description for learners | Max 500 chars |
   | icon | Text | No | Lucide icon name for visual display | Valid icon name |
   | display_order | Number | Yes | Sort position in category list | Default: 0 |
   | is_active | Boolean | Yes | Show category in course catalog | Default: true |

3. **Step-by-Step: Creating a Category**
   1. Navigate to Admin → LMS Management → Categories tab
   2. Click "Add Category" button
   3. Enter category code (e.g., COMPLIANCE, TECH, LEADERSHIP)
   4. Enter display name
   5. Add description (appears in catalog)
   6. Select icon (optional)
   7. Set display order for sorting
   8. Save category

4. **Configuration Examples**
   - Example 1: Compliance Training (COMPLIANCE, "Compliance & Regulatory", order: 1)
   - Example 2: Technical Skills (TECH, "Technical & IT Skills", order: 2)
   - Example 3: Leadership (LEADERSHIP, "Leadership & Management", order: 3)
   - Example 4: Soft Skills (SOFTSKILLS, "Professional Development", order: 4)

5. **Business Rules**
   - Category codes must be unique system-wide
   - Inactive categories hide associated courses from catalog
   - Deleting category requires reassigning or deleting courses first

6. **TipCallout**: "Start with 4-6 broad categories. Subcategorization can be achieved through course naming conventions or tags."

---

### Phase 4: Section 2.3 - Course Creation

**File:** `LndSetupCourses.tsx`

**Content:**

1. **Learning Objectives**
   - Create courses with proper metadata configuration
   - Configure difficulty levels, duration, and passing scores
   - Set up mandatory vs. optional course designations
   - Understand course publishing workflow

2. **Field Reference Table - lms_courses**
   | Field | Type | Required | Description | Default |
   |-------|------|----------|-------------|---------|
   | code | Text | Yes | Unique course identifier | - |
   | title | Text | Yes | Course title displayed to learners | - |
   | description | Text | No | Course overview and objectives | - |
   | category_id | UUID | No | Link to category | - |
   | company_id | UUID | No | Company-specific course (null = global) | null |
   | difficulty_level | Select | Yes | beginner/intermediate/advanced | beginner |
   | duration_minutes | Number | No | Estimated completion time | - |
   | passing_score | Number | No | Minimum score for completion | 70 |
   | thumbnail_url | URL | No | Course card image | - |
   | certificate_template | Text | No | Certificate template identifier | - |
   | is_published | Boolean | Yes | Visible in course catalog | false |
   | is_mandatory | Boolean | Yes | Required training flag | false |
   | created_by | UUID | Yes | Creator user ID | Current user |

3. **Difficulty Level Guidelines**
   | Level | Target Audience | Duration | Prerequisites |
   |-------|-----------------|----------|---------------|
   | Beginner | New employees, role changes | < 60 min | None |
   | Intermediate | Experienced staff, skill building | 1-3 hours | Related beginner course |
   | Advanced | Subject matter experts, leadership | 3+ hours | Intermediate courses |

4. **Step-by-Step: Creating a Course**
   1. Navigate to Admin → LMS Management → Courses tab
   2. Click "Add Course"
   3. Enter course code (e.g., ONBOARD-001)
   4. Enter course title
   5. Write description with learning objectives
   6. Select category
   7. Set difficulty level
   8. Enter estimated duration
   9. Configure passing score (if applicable)
   10. Set mandatory flag if compliance-related
   11. Leave unpublished until content complete
   12. Save course

5. **Configuration Examples**
   - Example 1: New Employee Orientation (ONBOARD-001, Beginner, 90 min, Mandatory)
   - Example 2: Data Privacy Fundamentals (GDPR-101, Intermediate, 45 min, Mandatory)
   - Example 3: Project Management Skills (PM-201, Intermediate, 180 min, Optional)

6. **Business Rules**
   - Course codes must be unique
   - Unpublished courses not visible in catalog
   - Mandatory courses can be auto-assigned via compliance rules
   - Passing score of 0 means completion-only (no assessment required)
   - Company-specific courses only visible to that company's employees

7. **WarningCallout**: "Do not publish courses until modules and lessons are complete. Published courses appear immediately in the catalog."

---

### Phase 5: Section 2.4 - Modules & Lessons

**File:** `LndSetupModulesLessons.tsx`

**Content:**

1. **Learning Objectives**
   - Understand the Course → Module → Lesson hierarchy
   - Create logically organized module structures
   - Configure different lesson content types
   - Set proper display ordering

2. **Hierarchy Diagram (ASCII)**
   ```
   Course (GDPR-101)
   ├── Module 1: Introduction to GDPR
   │   ├── Lesson 1.1: What is GDPR? (video)
   │   ├── Lesson 1.2: Key Principles (text)
   │   └── Lesson 1.3: Knowledge Check (quiz)
   ├── Module 2: Data Subject Rights
   │   ├── Lesson 2.1: Overview (video)
   │   └── Lesson 2.2: Practical Examples (document)
   └── Module 3: Assessment
       └── Lesson 3.1: Final Quiz (quiz)
   ```

3. **Field Reference Table - lms_modules**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | course_id | UUID | Yes | Parent course reference |
   | title | Text | Yes | Module title |
   | description | Text | No | Module overview |
   | display_order | Number | Yes | Sequence within course |
   | is_published | Boolean | Yes | Module visibility |

4. **Field Reference Table - lms_lessons**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | module_id | UUID | Yes | Parent module reference |
   | title | Text | Yes | Lesson title |
   | content_type | Select | Yes | text/video/document/quiz/scorm |
   | content | Text | No | Rich text content (for text type) |
   | video_url | URL | No | Video URL (for video type) |
   | document_url | URL | No | Document URL (for document type) |
   | quiz_id | UUID | No | Linked quiz (for quiz type) |
   | duration_minutes | Number | No | Estimated lesson duration |
   | display_order | Number | Yes | Sequence within module |
   | is_published | Boolean | Yes | Lesson visibility |

5. **Content Type Guidelines**
   | Type | Use Case | Best Practices |
   |------|----------|----------------|
   | text | Explanatory content, policies | Use headers, bullet points, keep under 1000 words |
   | video | Demonstrations, presentations | 5-10 min segments, include captions |
   | document | References, procedures | PDF format, version control |
   | quiz | Knowledge checks | 5-10 questions per lesson quiz |
   | scorm | External eLearning content | SCORM 1.2 or 2004 compliant |

6. **Step-by-Step: Creating Module Structure**
   1. Open course from Admin → LMS Management → Courses
   2. Click course row → "View Modules"
   3. Click "Add Module"
   4. Enter module title and description
   5. Set display order
   6. Save module
   7. Repeat for all modules in logical sequence

7. **Step-by-Step: Adding Lessons**
   1. From module list, click module row → "View Lessons"
   2. Click "Add Lesson"
   3. Enter lesson title
   4. Select content type
   5. Add content based on type selected
   6. Set duration estimate
   7. Set display order
   8. Save lesson

8. **TipCallout**: "Structure courses with 3-5 modules. Each module should represent a discrete learning unit with 2-5 lessons."

---

### Phase 6: Section 2.5 - Quiz Configuration

**File:** `LndSetupQuizzes.tsx`

**Content:**

1. **Learning Objectives**
   - Create assessments with various question types
   - Configure passing scores and attempt limits
   - Set up question randomization
   - Link quizzes to lessons

2. **Field Reference Table - lms_quizzes**
   | Field | Type | Required | Description | Default |
   |-------|------|----------|-------------|---------|
   | course_id | UUID | Yes | Associated course | - |
   | title | Text | Yes | Quiz title | - |
   | description | Text | No | Quiz instructions | - |
   | passing_score | Number | Yes | Minimum % to pass | 70 |
   | time_limit_minutes | Number | No | Time limit (null = unlimited) | null |
   | max_attempts | Number | No | Attempt limit (null = unlimited) | null |
   | shuffle_questions | Boolean | Yes | Randomize question order | false |
   | show_correct_answers | Boolean | Yes | Show answers after submission | true |
   | is_published | Boolean | Yes | Quiz availability | false |

3. **Field Reference Table - lms_quiz_questions**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | quiz_id | UUID | Yes | Parent quiz |
   | question_text | Text | Yes | The question |
   | question_type | Select | Yes | multiple_choice/true_false/multi_select |
   | options | JSON | Yes | Answer options array |
   | correct_answer | JSON | Yes | Correct answer(s) |
   | points | Number | Yes | Points for correct answer |
   | display_order | Number | Yes | Question sequence |
   | explanation | Text | No | Answer explanation |

4. **Question Type Specifications**
   | Type | Options Format | Correct Answer Format |
   |------|----------------|----------------------|
   | multiple_choice | ["A", "B", "C", "D"] | "B" |
   | true_false | ["True", "False"] | "True" |
   | multi_select | ["A", "B", "C", "D"] | ["A", "C"] |

5. **Step-by-Step: Creating a Quiz**
   1. Navigate to Admin → LMS Management → Quizzes tab
   2. Click "Add Quiz"
   3. Select course for this quiz
   4. Enter quiz title and instructions
   5. Set passing score (e.g., 80%)
   6. Configure time limit (optional)
   7. Set max attempts (e.g., 3)
   8. Enable shuffle if desired
   9. Save quiz
   10. Add questions via "Manage Questions"

6. **Quiz Configuration Examples**
   - Knowledge Check: 5 questions, 70% pass, unlimited attempts, show answers
   - Final Assessment: 20 questions, 80% pass, 3 attempts, 30 min limit
   - Certification Exam: 50 questions, 85% pass, 2 attempts, 60 min, shuffle

7. **Business Rules**
   - Quizzes require at least one question to be valid
   - Time limit enforced client-side with server validation
   - Failed attempts logged with detailed answer breakdown
   - Passing quiz triggers certificate generation (if configured)

---

### Phase 7: Section 2.6 - Learning Paths

**File:** `LndSetupLearningPaths.tsx`

**Content:**

1. **Learning Objectives**
   - Create structured learning journeys
   - Configure course sequences with prerequisites
   - Set up mandatory vs. optional path courses
   - Manage path enrollments

2. **Field Reference Table - learning_paths**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | code | Text | Yes | Unique path identifier |
   | name | Text | Yes | Path display name |
   | description | Text | No | Path overview |
   | company_id | UUID | Yes | Company association |
   | estimated_duration_hours | Number | No | Total path duration |
   | target_audience | Text | No | Intended learner profile |
   | is_mandatory | Boolean | No | Required completion |
   | is_active | Boolean | Yes | Path availability |

3. **Field Reference Table - learning_path_courses**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | learning_path_id | UUID | Yes | Parent path |
   | course_id | UUID | Yes | Course in path |
   | sequence_order | Number | Yes | Position in path |
   | is_required | Boolean | No | Mandatory for completion |

4. **Learning Path Examples**
   - New Manager Development: Leadership Basics → Team Management → Performance Coaching
   - IT Security Track: Security Awareness → Data Protection → Incident Response
   - Sales Onboarding: Company Overview → Product Training → Sales Process

5. **Configuration Guidelines**
   - Limit paths to 4-8 courses for completion rates
   - Mark 60-80% of courses as required
   - Set realistic duration estimates
   - Use target audience field for filtering

---

### Phase 8: Section 2.7 - Competency Mapping

**File:** `LndSetupCompetencyMapping.tsx`

**Content:**

1. **Learning Objectives**
   - Link courses to competency framework
   - Configure gap-based course recommendations
   - Enable AI-driven learning suggestions

2. **Field Reference Table - competency_course_mappings**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | company_id | UUID | No | Company-specific mapping |
   | competency_id | UUID | Yes | Linked competency |
   | course_id | UUID | Yes | Linked course |
   | is_mandatory | Boolean | No | Auto-assign when gap detected |
   | min_gap_level | Number | No | Minimum gap to trigger (1-5) |
   | notes | Text | No | Mapping rationale |

3. **Integration with Performance Module**
   - When competency gaps identified in appraisals
   - System recommends mapped courses
   - Optional auto-enrollment for mandatory mappings
   - Progress feeds back to competency tracking

---

### Phase 9: Section 2.8 - Compliance Training Rules

**File:** `LndSetupCompliance.tsx`

**Content:**

1. **Learning Objectives**
   - Configure mandatory training rules
   - Set up recertification periods
   - Target training by department/position
   - Manage compliance assignments

2. **Field Reference Table - compliance_training**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | company_id | UUID | Yes | Company scope |
   | name | Text | Yes | Compliance rule name |
   | description | Text | No | Rule description |
   | course_id | UUID | Yes | Required course |
   | is_mandatory | Boolean | Yes | Enforced completion |
   | is_active | Boolean | Yes | Rule active status |
   | frequency_months | Number | No | Recertification period |
   | grace_period_days | Number | No | Days after due date |
   | applies_to_all | Boolean | No | All employees |
   | target_departments | UUID[] | No | Specific departments |
   | target_positions | UUID[] | No | Specific positions |

3. **Compliance Configuration Examples**
   - Annual Safety Training: All employees, 12-month frequency, 30-day grace
   - GDPR for IT Staff: IT Department, 24-month frequency
   - Anti-Harassment: All employees, 12-month, mandatory

4. **Assignment Lifecycle**
   - Rule creates assignments for matching employees
   - Reminders sent before due date
   - Escalation after grace period
   - Exemptions tracked with reason

---

### Phase 10: Section 2.9 - Instructors

**File:** `LndSetupInstructors.tsx`

**Content:**

1. **Learning Objectives**
   - Register internal and external instructors
   - Configure instructor profiles and specializations
   - Set up hourly rates for budget tracking

2. **Field Reference Table - training_instructors**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | company_id | UUID | Yes | Company association |
   | name | Text | Yes | Instructor name |
   | instructor_type | Select | Yes | internal/external |
   | employee_id | UUID | No | Link to employee (internal) |
   | email | Text | No | Contact email |
   | phone | Text | No | Contact phone |
   | bio | Text | No | Instructor biography |
   | specializations | Text[] | No | Expertise areas |
   | hourly_rate | Number | No | Cost per hour |
   | currency | Text | No | Rate currency |
   | is_active | Boolean | Yes | Instructor availability |

---

### Phase 11: Section 2.10 - Training Budgets

**File:** `LndSetupBudgets.tsx`

**Content:**

1. **Learning Objectives**
   - Configure departmental training budgets
   - Track allocated vs. spent amounts
   - Set up fiscal year budget cycles

2. **Field Reference Table - training_budgets**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | company_id | UUID | Yes | Company scope |
   | department_id | UUID | No | Department (null = company-wide) |
   | fiscal_year | Number | Yes | Budget year |
   | allocated_amount | Number | Yes | Budget allocation |
   | spent_amount | Number | Yes | Amount used |
   | currency | Text | No | Budget currency |
   | notes | Text | No | Budget notes |

---

### Phase 12: Section 2.11 - Training Evaluations

**File:** `LndSetupEvaluations.tsx`

**Content:**

1. **Learning Objectives**
   - Create post-training evaluation forms
   - Configure Kirkpatrick evaluation levels
   - Set up evaluation question templates

2. **Field Reference Table - training_evaluations**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | company_id | UUID | Yes | Company scope |
   | name | Text | Yes | Evaluation form name |
   | description | Text | No | Form description |
   | evaluation_level | Number | Yes | Kirkpatrick level (1-4) |
   | questions | JSON | Yes | Question definitions |
   | is_active | Boolean | Yes | Form availability |

3. **Kirkpatrick Levels**
   - Level 1: Reaction (learner satisfaction)
   - Level 2: Learning (knowledge gained)
   - Level 3: Behavior (application on job)
   - Level 4: Results (business impact)

---

### Phase 13: Section 2.12 - Badges & Gamification

**File:** `LndSetupGamification.tsx`

**Content:**

1. **Learning Objectives**
   - Configure achievement badges
   - Set up point systems
   - Create leaderboards for engagement

2. **Field Reference Table - lms_badges**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | company_id | UUID | No | Company-specific badge |
   | name | Text | Yes | Badge name |
   | description | Text | No | Badge description |
   | badge_type | Select | Yes | course_completion/milestone/special |
   | icon_url | URL | No | Badge image |
   | criteria | JSON | Yes | Earning criteria |
   | points | Number | Yes | Points awarded |
   | is_active | Boolean | Yes | Badge availability |

3. **Badge Type Examples**
   - Course Completion: Earned when specific course completed
   - Milestone: Earned at 5, 10, 25, 50 courses completed
   - Special: Manual award for achievements

---

### Phase 14: Section 2.13 - SCORM/xAPI Integration

**File:** `LndSetupScormXapi.tsx`

**Content:**

1. **Learning Objectives**
   - Upload and configure SCORM packages
   - Understand SCORM tracking parameters
   - Configure xAPI statement storage

2. **Field Reference Table - lms_scorm_packages**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | course_id | UUID | Yes | Associated course |
   | package_url | URL | Yes | SCORM package location |
   | scorm_version | Select | Yes | 1.2/2004 |
   | entry_point | Text | No | Launch file |
   | manifest_data | JSON | No | imsmanifest.xml data |
   | is_active | Boolean | Yes | Package availability |

3. **SCORM Tracking Fields (lms_scorm_tracking)**
   - cmi_data, completion_status, success_status
   - score_raw, score_min, score_max, score_scaled
   - session_time, total_time, location, suspend_data

---

### Phase 15: Section 2.14 - Certificate Templates

**File:** `LndSetupCertificates.tsx`

**Content:**

1. **Learning Objectives**
   - Create certificate templates
   - Configure certificate generation triggers
   - Set up expiration policies

2. **Field Reference Table - training_certificate_templates**
   | Field | Type | Required | Description |
   |-------|------|----------|-------------|
   | company_id | UUID | No | Company-specific template |
   | name | Text | Yes | Template name |
   | template_html | Text | No | HTML template |
   | background_image_url | URL | No | Certificate background |
   | is_default | Boolean | No | Default for company |
   | is_active | Boolean | No | Template availability |

---

### Phase 16: Section 2.15 - Training Requests Configuration

**File:** `LndSetupTrainingRequests.tsx`

**Content:**

1. **Learning Objectives**
   - Configure training request approval workflows
   - Set up request types and statuses
   - Enable integration with HR Hub workflows

2. **Training Request Flow**
   - Employee submits request
   - Manager approval (Level 1)
   - HR approval (Level 2, if cost threshold exceeded)
   - Budget deduction
   - Enrollment or external booking

---

### Phase 17: Section 2.16 - Company L&D Settings

**File:** `LndSetupCompanySettings.tsx`

**Content:**

1. **Learning Objectives**
   - Configure company-wide L&D defaults
   - Set notification preferences
   - Enable/disable module features

2. **Configuration Options**
   - Default passing score
   - Certificate expiry period
   - Self-enrollment permissions
   - Manager enrollment permissions
   - Gamification on/off
   - Compliance notifications

---

## Phase 18: Update Parent Component

Update `LndSetupSection.tsx` to compose all modular sections:

```tsx
import {
  LndSetupPrerequisites,
  LndSetupCategories,
  LndSetupCourses,
  LndSetupModulesLessons,
  LndSetupQuizzes,
  LndSetupLearningPaths,
  LndSetupCompetencyMapping,
  LndSetupCompliance,
  LndSetupInstructors,
  LndSetupBudgets,
  LndSetupEvaluations,
  LndSetupGamification,
  LndSetupScormXapi,
  LndSetupCertificates,
  LndSetupTrainingRequests,
  LndSetupCompanySettings
} from './sections/setup';

export function LndSetupSection() {
  return (
    <div className="space-y-12">
      <LndSetupPrerequisites />
      <LndSetupCategories />
      <LndSetupCourses />
      <LndSetupModulesLessons />
      <LndSetupQuizzes />
      <LndSetupLearningPaths />
      <LndSetupCompetencyMapping />
      <LndSetupCompliance />
      <LndSetupInstructors />
      <LndSetupBudgets />
      <LndSetupEvaluations />
      <LndSetupGamification />
      <LndSetupScormXapi />
      <LndSetupCertificates />
      <LndSetupTrainingRequests />
      <LndSetupCompanySettings />
    </div>
  );
}
```

---

## Technical Implementation Summary

### Files to Create (17 new files)
1. `sections/setup/index.ts`
2. `sections/setup/LndSetupPrerequisites.tsx`
3. `sections/setup/LndSetupCategories.tsx`
4. `sections/setup/LndSetupCourses.tsx`
5. `sections/setup/LndSetupModulesLessons.tsx`
6. `sections/setup/LndSetupQuizzes.tsx`
7. `sections/setup/LndSetupLearningPaths.tsx`
8. `sections/setup/LndSetupCompetencyMapping.tsx`
9. `sections/setup/LndSetupCompliance.tsx`
10. `sections/setup/LndSetupInstructors.tsx`
11. `sections/setup/LndSetupBudgets.tsx`
12. `sections/setup/LndSetupEvaluations.tsx`
13. `sections/setup/LndSetupGamification.tsx`
14. `sections/setup/LndSetupScormXapi.tsx`
15. `sections/setup/LndSetupCertificates.tsx`
16. `sections/setup/LndSetupTrainingRequests.tsx`
17. `sections/setup/LndSetupCompanySettings.tsx`

### Files to Update (1 file)
1. `LndSetupSection.tsx` - Refactor to use modular sections

### Shared Components to Use
- LearningObjectives
- FieldReferenceTable
- StepByStep
- ConfigurationExample
- BusinessRules
- TipCallout / WarningCallout
- ScreenshotPlaceholder

### Estimated Line Counts
| File | Lines | Description |
|------|-------|-------------|
| LndSetupPrerequisites.tsx | ~300 | Dependencies, checklist, sequence |
| LndSetupCategories.tsx | ~250 | Category fields, steps, examples |
| LndSetupCourses.tsx | ~450 | Course config, difficulty, publishing |
| LndSetupModulesLessons.tsx | ~400 | Hierarchy, content types |
| LndSetupQuizzes.tsx | ~400 | Quiz config, questions, attempts |
| LndSetupLearningPaths.tsx | ~350 | Path creation, course sequences |
| LndSetupCompetencyMapping.tsx | ~250 | Competency-course links |
| LndSetupCompliance.tsx | ~350 | Compliance rules, targeting |
| LndSetupInstructors.tsx | ~300 | Instructor profiles, rates |
| LndSetupBudgets.tsx | ~250 | Budget allocation, tracking |
| LndSetupEvaluations.tsx | ~300 | Evaluation forms, Kirkpatrick |
| LndSetupGamification.tsx | ~350 | Badges, points, leaderboards |
| LndSetupScormXapi.tsx | ~300 | SCORM packages, tracking |
| LndSetupCertificates.tsx | ~250 | Certificate templates |
| LndSetupTrainingRequests.tsx | ~250 | Request workflow config |
| LndSetupCompanySettings.tsx | ~200 | Global L&D settings |
| **Total** | **~4,900** | vs. current 35 lines |

---

## Summary

This plan transforms L&D Manual Chapter 2 from a **35-line placeholder** to a **~4,900-line enterprise implementation guide** with:

- **140x content increase** (35 → 4,900+ lines)
- **16 modular section components** (vs. 1 placeholder component)
- **Complete field reference tables** for 20+ database tables
- **Step-by-step configuration guides** for every entity
- **Real-world configuration examples**
- **Business rules documentation**
- **Industry-standard implementation sequence**
- **Cross-module dependency mapping**
- **Kirkpatrick evaluation framework**
- **SCORM/xAPI technical specifications**
