-- Compliance Document Templates table
CREATE TABLE compliance_document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('performance', 'disciplinary', 'separation', 'grievance', 'employment', 'general')),
  jurisdiction TEXT NOT NULL DEFAULT 'global',
  country_code TEXT,
  description TEXT,
  template_content TEXT NOT NULL,
  required_variables JSONB NOT NULL DEFAULT '[]',
  signature_requirements JSONB NOT NULL DEFAULT '[]',
  retention_period_years INTEGER DEFAULT 7,
  workflow_template_id UUID REFERENCES workflow_templates(id),
  linked_letter_template_id UUID REFERENCES letter_templates(id),
  legal_reference TEXT,
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  company_id UUID REFERENCES companies(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Compliance Document Instances table
CREATE TABLE compliance_document_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES compliance_document_templates(id) NOT NULL,
  employee_id UUID REFERENCES profiles(id) NOT NULL,
  company_id UUID REFERENCES companies(id) NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('disciplinary', 'grievance', 'appraisal', 'termination', 'pip', 'manual')),
  source_id UUID,
  workflow_instance_id UUID REFERENCES workflow_instances(id),
  workflow_letter_id UUID REFERENCES workflow_letters(id),
  generated_content TEXT NOT NULL,
  variable_values JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'pending_signatures', 'signed', 'archived', 'cancelled')),
  retention_expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bridge table for compliance items to document templates
CREATE TABLE compliance_item_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance_item_id UUID REFERENCES compliance_items(id) ON DELETE CASCADE NOT NULL,
  document_template_id UUID REFERENCES compliance_document_templates(id) NOT NULL,
  scope TEXT DEFAULT 'all_employees' CHECK (scope IN ('all_employees', 'department', 'specific')),
  scope_filter JSONB,
  required_by DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(compliance_item_id, document_template_id)
);

-- Add compliance document links to existing tables
ALTER TABLE er_disciplinary_actions 
ADD COLUMN IF NOT EXISTS compliance_document_id UUID REFERENCES compliance_document_instances(id);

ALTER TABLE grievances 
ADD COLUMN IF NOT EXISTS resolution_document_id UUID REFERENCES compliance_document_instances(id);

-- Enable RLS
ALTER TABLE compliance_document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_document_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_item_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_document_templates
CREATE POLICY "Users can view active templates" ON compliance_document_templates
FOR SELECT USING (is_active = true OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create templates" ON compliance_document_templates
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Template creators can update" ON compliance_document_templates
FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for compliance_document_instances
CREATE POLICY "Users can view company documents" ON compliance_document_instances
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create documents" ON compliance_document_instances
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Document creators can update" ON compliance_document_instances
FOR UPDATE USING (auth.uid() = created_by);

-- RLS Policies for compliance_item_documents
CREATE POLICY "Users can view item documents" ON compliance_item_documents
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can manage item documents" ON compliance_item_documents
FOR ALL USING (auth.uid() IS NOT NULL);

-- Seed templates for Caribbean, Ghana, Nigeria, Global
INSERT INTO compliance_document_templates (code, name, category, jurisdiction, country_code, description, template_content, required_variables, legal_reference) VALUES
-- Trinidad & Tobago
('TT-VERBAL-WARNING', 'Verbal Warning Record', 'disciplinary', 'caribbean', 'TT', 'Record of verbal warning issued to employee', '<div class="document"><h1>VERBAL WARNING RECORD</h1><p>Date: {{date}}</p><p>Employee: {{employee_name}}</p><p>Department: {{department}}</p><p>This confirms that a verbal warning was issued regarding: {{reason}}</p><p>Expected improvement: {{expected_improvement}}</p><p>Review date: {{review_date}}</p></div>', '["date", "employee_name", "department", "reason", "expected_improvement", "review_date"]', 'Industrial Relations Act'),
('TT-WRITTEN-WARNING', 'Written Warning Letter', 'disciplinary', 'caribbean', 'TT', 'Formal written warning for misconduct or performance issues', '<div class="document"><h1>WRITTEN WARNING</h1><p>Date: {{date}}</p><p>To: {{employee_name}}</p><p>Employee ID: {{employee_id}}</p><p>Department: {{department}}</p><p>RE: Written Warning</p><p>This letter serves as a formal written warning regarding {{reason}}.</p><p>Details of incident: {{incident_details}}</p><p>You are required to: {{corrective_action}}</p><p>Failure to improve may result in further disciplinary action up to and including termination.</p><p>Manager Signature: _______________</p><p>Employee Acknowledgment: _______________</p></div>', '["date", "employee_name", "employee_id", "department", "reason", "incident_details", "corrective_action"]', 'Industrial Relations Act Chapter 88:01'),
('TT-FINAL-WARNING', 'Final Warning Letter', 'disciplinary', 'caribbean', 'TT', 'Final warning before termination', '<div class="document"><h1>FINAL WARNING</h1><p>Date: {{date}}</p><p>To: {{employee_name}}</p><p>This is your FINAL WARNING. Any further incidents will result in immediate termination.</p><p>Previous warnings: {{previous_warnings}}</p><p>Current issue: {{current_issue}}</p></div>', '["date", "employee_name", "previous_warnings", "current_issue"]', 'Industrial Relations Act'),
('TT-TERMINATION', 'Termination Letter', 'separation', 'caribbean', 'TT', 'Employment termination notice', '<div class="document"><h1>TERMINATION OF EMPLOYMENT</h1><p>Date: {{date}}</p><p>To: {{employee_name}}</p><p>Your employment is terminated effective {{effective_date}} due to: {{reason}}</p><p>Final pay details: {{final_pay}}</p></div>', '["date", "employee_name", "effective_date", "reason", "final_pay"]', 'Industrial Relations Act'),

-- Jamaica
('JM-WRITTEN-WARNING', 'Written Warning Letter', 'disciplinary', 'caribbean', 'JM', 'Formal written warning per Jamaican labour law', '<div class="document"><h1>WRITTEN WARNING</h1><p>Date: {{date}}</p><p>Employee: {{employee_name}}</p><p>This formal warning is issued for: {{reason}}</p><p>Improvement required by: {{deadline}}</p></div>', '["date", "employee_name", "reason", "deadline"]', 'Labour Relations and Industrial Disputes Act'),
('JM-TERMINATION', 'Termination Notice', 'separation', 'caribbean', 'JM', 'Employment termination per Jamaican law', '<div class="document"><h1>TERMINATION NOTICE</h1><p>Your employment ends on {{effective_date}}.</p><p>Reason: {{reason}}</p><p>Entitlements: {{entitlements}}</p></div>', '["effective_date", "reason", "entitlements"]', 'Employment (Termination and Redundancy Payments) Act'),

-- Barbados
('BB-WARNING', 'Warning Letter', 'disciplinary', 'caribbean', 'BB', 'Formal warning per Barbados employment law', '<div class="document"><h1>WARNING NOTICE</h1><p>Date: {{date}}</p><p>Employee: {{employee_name}}</p><p>Warning Type: {{warning_type}}</p><p>Reason: {{reason}}</p></div>', '["date", "employee_name", "warning_type", "reason"]', 'Employment Rights Act'),
('BB-PERF-REVIEW', 'Performance Review Acknowledgment', 'performance', 'caribbean', 'BB', 'Acknowledgment of performance review discussion', '<div class="document"><h1>PERFORMANCE REVIEW ACKNOWLEDGMENT</h1><p>Employee: {{employee_name}}</p><p>Review Period: {{review_period}}</p><p>Rating: {{rating}}</p><p>Comments: {{comments}}</p></div>', '["employee_name", "review_period", "rating", "comments"]', 'Employment Rights Act 2012'),

-- Ghana
('GH-QUERY-LETTER', 'Query Letter', 'disciplinary', 'africa', 'GH', 'Formal query letter per Ghana Labour Act', '<div class="document"><h1>QUERY LETTER</h1><p>Date: {{date}}</p><p>To: {{employee_name}}</p><p>Staff ID: {{staff_id}}</p><p>You are hereby queried on the following matter: {{matter}}</p><p>You are required to respond in writing within 48 hours.</p><p>Failure to respond will be treated as an admission of the allegations.</p></div>', '["date", "employee_name", "staff_id", "matter"]', 'Labour Act 2003 (Act 651)'),
('GH-WARNING-LETTER', 'Warning Letter', 'disciplinary', 'africa', 'GH', 'Formal warning per Ghana Labour Act', '<div class="document"><h1>WARNING LETTER</h1><p>Date: {{date}}</p><p>To: {{employee_name}}</p><p>Following your response to our query dated {{query_date}}, you are hereby issued a {{warning_level}} warning.</p><p>Reason: {{reason}}</p></div>', '["date", "employee_name", "query_date", "warning_level", "reason"]', 'Labour Act 2003 (Act 651)'),
('GH-TERMINATION', 'Termination Letter', 'separation', 'africa', 'GH', 'Employment termination per Ghana Labour Act Section 15', '<div class="document"><h1>TERMINATION OF EMPLOYMENT</h1><p>Date: {{date}}</p><p>To: {{employee_name}}</p><p>In accordance with Section 15 of the Labour Act 2003, your employment is terminated.</p><p>Effective Date: {{effective_date}}</p><p>Reason: {{reason}}</p><p>Notice Period: {{notice_period}}</p><p>Final Entitlements: {{entitlements}}</p></div>', '["date", "employee_name", "effective_date", "reason", "notice_period", "entitlements"]', 'Labour Act 2003 Section 15'),
('GH-PIP-NOTICE', 'Performance Improvement Plan Notice', 'performance', 'africa', 'GH', 'PIP notification per Ghana labour standards', '<div class="document"><h1>PERFORMANCE IMPROVEMENT PLAN</h1><p>Employee: {{employee_name}}</p><p>Department: {{department}}</p><p>PIP Duration: {{start_date}} to {{end_date}}</p><p>Areas for Improvement: {{improvement_areas}}</p><p>Success Criteria: {{success_criteria}}</p></div>', '["employee_name", "department", "start_date", "end_date", "improvement_areas", "success_criteria"]', 'National Labour Commission Guidelines'),

-- Nigeria
('NG-QUERY-LETTER', 'Query Letter', 'disciplinary', 'africa', 'NG', 'Formal query per Nigerian Labour Act', '<div class="document"><h1>QUERY</h1><p>Date: {{date}}</p><p>To: {{employee_name}}</p><p>Staff Number: {{staff_number}}</p><p>You are hereby required to explain in writing the following: {{allegation}}</p><p>Your response is expected within 48 hours.</p></div>', '["date", "employee_name", "staff_number", "allegation"]', 'Nigerian Labour Act'),
('NG-WARNING-1ST', 'First Warning Letter', 'disciplinary', 'africa', 'NG', 'First warning per Nigerian Labour Act', '<div class="document"><h1>FIRST WARNING LETTER</h1><p>Date: {{date}}</p><p>Employee: {{employee_name}}</p><p>This serves as your first warning for: {{offense}}</p><p>Any recurrence will attract stricter disciplinary measures.</p></div>', '["date", "employee_name", "offense"]', 'Labour Act CAP L1 LFN 2004'),
('NG-WARNING-FINAL', 'Final Warning Letter', 'disciplinary', 'africa', 'NG', 'Final warning before termination', '<div class="document"><h1>FINAL WARNING</h1><p>Date: {{date}}</p><p>To: {{employee_name}}</p><p>This is your FINAL WARNING. Previous warnings: {{previous_warnings}}</p><p>Current offense: {{current_offense}}</p><p>Any further misconduct will result in summary dismissal.</p></div>', '["date", "employee_name", "previous_warnings", "current_offense"]', 'Labour Act CAP L1 LFN 2004'),
('NG-TERMINATION', 'Termination Letter', 'separation', 'africa', 'NG', 'Employment termination per Nigerian law', '<div class="document"><h1>TERMINATION OF APPOINTMENT</h1><p>Date: {{date}}</p><p>To: {{employee_name}}</p><p>Your appointment is hereby terminated effective {{effective_date}}.</p><p>Reason: {{reason}}</p><p>In lieu of notice: {{notice_payment}}</p></div>', '["date", "employee_name", "effective_date", "reason", "notice_payment"]', 'Nigerian Labour Law'),

-- Global Templates
('GLOBAL-PIP', 'Performance Improvement Plan', 'performance', 'global', NULL, 'Standard PIP template applicable globally', '<div class="document"><h1>PERFORMANCE IMPROVEMENT PLAN</h1><p>Employee: {{employee_name}}</p><p>Manager: {{manager_name}}</p><p>Duration: {{duration}}</p><p>Performance Gaps: {{performance_gaps}}</p><p>Improvement Goals: {{improvement_goals}}</p><p>Support Provided: {{support}}</p><p>Review Schedule: {{review_schedule}}</p><p>Consequences: {{consequences}}</p></div>', '["employee_name", "manager_name", "duration", "performance_gaps", "improvement_goals", "support", "review_schedule", "consequences"]', NULL),
('GLOBAL-PERF-SIGNOFF', 'Performance Review Sign-off', 'performance', 'global', NULL, 'Standard performance review acknowledgment', '<div class="document"><h1>PERFORMANCE REVIEW ACKNOWLEDGMENT</h1><p>Employee: {{employee_name}}</p><p>Review Period: {{review_period}}</p><p>Overall Rating: {{overall_rating}}</p><p>Key Achievements: {{achievements}}</p><p>Development Areas: {{development_areas}}</p><p>Goals for Next Period: {{next_goals}}</p></div>', '["employee_name", "review_period", "overall_rating", "achievements", "development_areas", "next_goals"]', NULL),
('GLOBAL-PROBATION-CONFIRM', 'Probation Confirmation', 'employment', 'global', NULL, 'Confirmation of successful probation completion', '<div class="document"><h1>CONFIRMATION OF EMPLOYMENT</h1><p>Date: {{date}}</p><p>Dear {{employee_name}},</p><p>We are pleased to confirm that you have successfully completed your probationary period effective {{confirmation_date}}.</p><p>Your employment is now confirmed as permanent.</p></div>', '["date", "employee_name", "confirmation_date"]', NULL),
('GLOBAL-PROBATION-EXTEND', 'Probation Extension', 'employment', 'global', NULL, 'Notice of probation period extension', '<div class="document"><h1>PROBATION EXTENSION NOTICE</h1><p>Date: {{date}}</p><p>Dear {{employee_name}},</p><p>Your probation period is extended by {{extension_period}} until {{new_end_date}}.</p><p>Reason: {{reason}}</p><p>Areas requiring improvement: {{improvement_areas}}</p></div>', '["date", "employee_name", "extension_period", "new_end_date", "reason", "improvement_areas"]', NULL),
('GLOBAL-GRIEVANCE-RESPONSE', 'Grievance Response', 'grievance', 'global', NULL, 'Formal response to employee grievance', '<div class="document"><h1>GRIEVANCE OUTCOME NOTIFICATION</h1><p>Date: {{date}}</p><p>To: {{employee_name}}</p><p>Reference: {{grievance_ref}}</p><p>Following investigation of your grievance dated {{grievance_date}}, we have reached the following decision:</p><p>Outcome: {{outcome}}</p><p>Reasoning: {{reasoning}}</p><p>Actions to be taken: {{actions}}</p><p>You have the right to appeal within {{appeal_period}} days.</p></div>', '["date", "employee_name", "grievance_ref", "grievance_date", "outcome", "reasoning", "actions", "appeal_period"]', NULL);

-- Create indexes
CREATE INDEX idx_compliance_templates_category ON compliance_document_templates(category);
CREATE INDEX idx_compliance_templates_jurisdiction ON compliance_document_templates(jurisdiction);
CREATE INDEX idx_compliance_templates_country ON compliance_document_templates(country_code);
CREATE INDEX idx_compliance_instances_employee ON compliance_document_instances(employee_id);
CREATE INDEX idx_compliance_instances_source ON compliance_document_instances(source_type, source_id);
CREATE INDEX idx_compliance_instances_status ON compliance_document_instances(status);

-- Update timestamp trigger
CREATE TRIGGER update_compliance_templates_updated_at
  BEFORE UPDATE ON compliance_document_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_instances_updated_at
  BEFORE UPDATE ON compliance_document_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();