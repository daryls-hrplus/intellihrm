-- Add enterprise enrollment management fields to lms_courses
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS allow_self_enrollment boolean DEFAULT true;
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS max_enrollments integer;
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS enrollment_start_date date;
ALTER TABLE lms_courses ADD COLUMN IF NOT EXISTS enrollment_end_date date;

COMMENT ON COLUMN lms_courses.allow_self_enrollment IS 'Allows employees to enroll without manager approval';
COMMENT ON COLUMN lms_courses.max_enrollments IS 'Maximum active enrollments (null = unlimited)';
COMMENT ON COLUMN lms_courses.enrollment_start_date IS 'Date when self-enrollment opens';
COMMENT ON COLUMN lms_courses.enrollment_end_date IS 'Date when self-enrollment closes';

-- Add enhanced learner experience options to lms_quizzes
ALTER TABLE lms_quizzes ADD COLUMN IF NOT EXISTS shuffle_options boolean DEFAULT false;
ALTER TABLE lms_quizzes ADD COLUMN IF NOT EXISTS show_explanations boolean DEFAULT true;
ALTER TABLE lms_quizzes ADD COLUMN IF NOT EXISTS allow_review boolean DEFAULT true;

COMMENT ON COLUMN lms_quizzes.shuffle_options IS 'Randomize answer options within each question';
COMMENT ON COLUMN lms_quizzes.show_explanations IS 'Display answer explanations after submission';
COMMENT ON COLUMN lms_quizzes.allow_review IS 'Allow learners to review answers before submitting';

-- Add multi-tenant support to lms_categories
ALTER TABLE lms_categories ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id);
CREATE INDEX IF NOT EXISTS idx_lms_categories_company ON lms_categories(company_id);

COMMENT ON COLUMN lms_categories.company_id IS 'Company-specific category (null = global/shared)';