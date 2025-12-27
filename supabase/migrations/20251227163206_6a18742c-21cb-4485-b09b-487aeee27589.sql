
-- Seed master_skills_library with the HRplus Deep Pack skills
INSERT INTO master_skills_library (skill_name, skill_type, category, description, source, is_active, reuse_level)
VALUES
-- Manager Family Skills
('Budgeting & Cost Control', 'skill', 'Functional', 'Builds budgets; tracks spend; manages variance', 'HRplus Deep Pack', true, 'sector-specific'),
('People Management', 'skill', 'Leadership', 'Coaches, supervises, and develops team members', 'HRplus Deep Pack', true, 'cross-sector'),
('KPI & Reporting', 'skill', 'Functional', 'Tracks KPIs; produces reports; drives actions', 'HRplus Deep Pack', true, 'cross-sector'),
('Risk Management', 'skill', 'Functional', 'Identifies, assesses, mitigates risks', 'HRplus Deep Pack', true, 'cross-sector'),
('Vendor & Contract Management', 'skill', 'Functional', 'Manages suppliers and SLAs', 'HRplus Deep Pack', true, 'sector-specific'),
('Operational Planning', 'skill', 'Functional', 'Plans resources, schedules, and workloads', 'HRplus Deep Pack', true, 'cross-sector'),
('Quality Management', 'skill', 'Functional', 'Maintains quality controls and documentation', 'HRplus Deep Pack', true, 'cross-sector'),
('Stakeholder Alignment', 'skill', 'Functional', 'Aligns expectations across stakeholders', 'HRplus Deep Pack', true, 'cross-sector'),
('Requirements Gathering', 'skill', 'Functional', 'Elicits and documents requirements', 'HRplus Deep Pack', true, 'cross-sector'),
('Data Analysis', 'skill', 'Technical', 'Analyses data for patterns and insights', 'HRplus Deep Pack', true, 'cross-sector'),
('Process Mapping', 'skill', 'Functional', 'Maps processes and identifies improvements', 'HRplus Deep Pack', true, 'cross-sector'),
('Documentation', 'skill', 'Functional', 'Produces clear documentation and SOPs', 'HRplus Deep Pack', true, 'cross-sector'),
('Presentation & Storytelling', 'transversal', 'Behavioral', 'Presents findings with evidence and clarity', 'HRplus Deep Pack', true, 'cross-sector'),
('Quality Assurance', 'skill', 'Functional', 'Verifies accuracy and compliance of outputs', 'HRplus Deep Pack', true, 'cross-sector'),
('Basic Statistics', 'knowledge', 'Technical', 'Applies basic statistical methods appropriately', 'HRplus Deep Pack', true, 'cross-sector'),
('Stakeholder Interviews', 'transversal', 'Behavioral', 'Runs structured interviews and workshops', 'HRplus Deep Pack', true, 'cross-sector'),
('Technical Design', 'skill', 'Technical', 'Designs solutions that meet constraints', 'HRplus Deep Pack', true, 'sector-specific'),
('Troubleshooting', 'skill', 'Technical', 'Diagnoses faults and implements fixes', 'HRplus Deep Pack', true, 'cross-sector'),
('Preventive Maintenance', 'skill', 'Technical', 'Performs inspections and preventive tasks', 'HRplus Deep Pack', true, 'sector-specific'),
('Quality Standards', 'knowledge', 'Compliance', 'Applies standards and QC checks', 'HRplus Deep Pack', true, 'cross-sector'),
('Change Control', 'knowledge', 'Compliance', 'Follows change procedures and documentation', 'HRplus Deep Pack', true, 'cross-sector'),
('Technical Documentation', 'skill', 'Functional', 'Uses and updates technical manuals/records', 'HRplus Deep Pack', true, 'cross-sector'),
('Tools & Calibration', 'skill', 'Technical', 'Uses tools safely; understands calibration basics', 'HRplus Deep Pack', true, 'sector-specific'),
('Incident Response Basics', 'skill', 'Functional', 'Responds to incidents and escalates properly', 'HRplus Deep Pack', true, 'cross-sector'),
('Service Delivery', 'skill', 'Functional', 'Delivers consistent service and resolves queries', 'HRplus Deep Pack', true, 'cross-sector'),
('Complaint Handling', 'transversal', 'Behavioral', 'De-escalates issues and resolves fairly', 'HRplus Deep Pack', true, 'cross-sector'),
('Record Keeping', 'skill', 'Functional', 'Maintains accurate records', 'HRplus Deep Pack', true, 'cross-sector'),
('Product/Service Knowledge', 'knowledge', 'Technical', 'Explains offerings, terms, limitations', 'HRplus Deep Pack', true, 'sector-specific'),
('Quality & Courtesy', 'transversal', 'Behavioral', 'Maintains professional conduct', 'HRplus Deep Pack', true, 'cross-sector'),
('Queue & Workflow Management', 'skill', 'Functional', 'Manages throughput and prioritisation', 'HRplus Deep Pack', true, 'cross-sector'),
('Escalation Management', 'skill', 'Functional', 'Escalates appropriately with context', 'HRplus Deep Pack', true, 'cross-sector'),
('Basic Data Entry Accuracy', 'skill', 'Functional', 'Enters data accurately and consistently', 'HRplus Deep Pack', true, 'cross-sector'),
('HSE Compliance', 'knowledge', 'Compliance', 'Follows safety rules; reports incidents and hazards', 'Regulatory/Industry', true, 'cross-sector'),
('Data Protection & Confidentiality', 'knowledge', 'Compliance', 'Protects personal/sensitive information', 'Regulatory/Industry', true, 'cross-sector'),
('Anti-Fraud & Anti-Corruption', 'knowledge', 'Compliance', 'Recognises and reports fraud/bribery risks', 'Regulatory/Industry', true, 'cross-sector'),
('Transaction Processing', 'skill', 'Technical', 'Processes banking transactions accurately with controls', 'Industry Practice', true, 'sector-specific'),
('KYC / Customer Due Diligence', 'knowledge', 'Compliance', 'Verifies customer identity and meets onboarding rules', 'Regulatory/Industry', true, 'sector-specific'),
('AML Monitoring', 'knowledge', 'Compliance', 'Recognises red flags; supports AML reporting', 'Regulatory/Industry', true, 'sector-specific'),
('Credit Assessment', 'skill', 'Technical', 'Assesses affordability and repayment risk', 'Industry Practice', true, 'sector-specific'),
('Regulatory Reporting', 'knowledge', 'Compliance', 'Supports statutory/regulatory reporting requirements', 'Regulatory/Industry', true, 'sector-specific'),
('Policy Underwriting', 'skill', 'Technical', 'Evaluates risk and prices policies', 'Industry Practice', true, 'sector-specific'),
('Claims Processing', 'skill', 'Functional', 'Validates claims and follows procedures', 'Industry Practice', true, 'sector-specific'),
('Risk Assessment', 'skill', 'Functional', 'Assesses and mitigates risk exposures', 'Industry Practice', true, 'sector-specific'),
('SDLC Execution', 'skill', 'Technical', 'Plans/builds/tests/releases with quality gates', 'Industry Practice', true, 'sector-specific'),
('API Integration', 'skill', 'Technical', 'Designs and integrates services/APIs', 'Industry Practice', true, 'sector-specific'),
('Version Control (Git)', 'skill', 'Technical', 'Uses branching/merge practices for collaboration', 'Industry Practice', true, 'sector-specific'),
('Testing & Debugging', 'skill', 'Technical', 'Creates tests and resolves defects systematically', 'Industry Practice', true, 'sector-specific'),
('Security by Design', 'knowledge', 'Technical', 'Applies secure patterns and access controls', 'Industry Practice', true, 'sector-specific'),
('Site Coordination', 'skill', 'Functional', 'Coordinates trades, schedules, and site logistics', 'Industry Practice', true, 'sector-specific'),
('Building Codes & Standards', 'knowledge', 'Compliance', 'Applies codes and standards in designs/works', 'Regulatory/Industry', true, 'sector-specific'),
('BOQ & Cost Estimation', 'skill', 'Technical', 'Prepares cost estimates and BOQs', 'Industry Practice', true, 'sector-specific'),
('Inspection & QA/QC', 'skill', 'Compliance', 'Inspects work and manages non-conformance', 'Industry Practice', true, 'sector-specific'),
('Public Service Procedures', 'knowledge', 'Compliance', 'Applies public sector rules, approvals, and documentation', 'Industry Practice', true, 'sector-specific'),
('Records & Archive Control', 'knowledge', 'Compliance', 'Maintains secure and retrievable records', 'Industry Practice', true, 'sector-specific'),
('Policy Drafting', 'skill', 'Functional', 'Drafts policy briefs and supporting documents', 'Industry Practice', true, 'sector-specific'),
('Clinical Documentation', 'knowledge', 'Compliance', 'Maintains accurate patient/client records', 'Regulatory/Industry', true, 'sector-specific'),
('Patient Safety', 'knowledge', 'Compliance', 'Uses checklists and escalation to protect patients', 'Regulatory/Industry', true, 'sector-specific'),
('Infection Prevention & Control', 'knowledge', 'Compliance', 'Applies IPC procedures', 'Regulatory/Industry', true, 'sector-specific'),
('GxP / GMP Compliance', 'knowledge', 'Compliance', 'Applies GMP documentation and discipline', 'Regulatory/Industry', true, 'sector-specific'),
('Quality Control Testing', 'skill', 'Technical', 'Performs QC testing and interprets results', 'Industry Practice', true, 'sector-specific'),
('Validation & Qualification', 'knowledge', 'Compliance', 'Supports validation activities and evidence', 'Industry Practice', true, 'sector-specific'),
('Warehouse Operations', 'skill', 'Functional', 'Receiving, put-away, pick/pack, dispatch', 'Industry Practice', true, 'sector-specific'),
('Route Planning', 'skill', 'Technical', 'Plans routes/schedules and load efficiency', 'Industry Practice', true, 'sector-specific'),
('Customs & Trade Basics', 'knowledge', 'Compliance', 'Supports customs documentation and compliance', 'Regulatory/Industry', true, 'sector-specific'),
('Shipping Documentation', 'skill', 'Functional', 'Prepares manifests, bills of lading and shipping docs', 'Industry Practice', true, 'sector-specific'),
('Port Operations Safety', 'knowledge', 'Compliance', 'Applies port/terminal safety and ISPS basics', 'Regulatory/Industry', true, 'sector-specific'),
('Asset Operations', 'skill', 'Technical', 'Operates equipment safely with monitoring', 'Industry Practice', true, 'sector-specific'),
('SCADA / Monitoring', 'skill', 'Technical', 'Uses monitoring systems for operations and alarms', 'Industry Practice', true, 'sector-specific'),
('Permit to Work', 'knowledge', 'Compliance', 'Applies PTW/isolation procedures', 'Regulatory/Industry', true, 'sector-specific'),
('Water Treatment Processes', 'skill', 'Technical', 'Operates treatment, filtration and dosing', 'Industry Practice', true, 'sector-specific'),
('Water Quality Testing', 'skill', 'Technical', 'Tests and records key parameters', 'Industry Practice', true, 'sector-specific'),
('Process Operations', 'skill', 'Technical', 'Operates process equipment and controls', 'Industry Practice', true, 'sector-specific'),
('Integrity & Inspection Basics', 'knowledge', 'Compliance', 'Supports inspection findings and integrity controls', 'Regulatory/Industry', true, 'sector-specific'),
('POS Operations', 'skill', 'Technical', 'Operates POS and handles transactions accurately', 'Industry Practice', true, 'sector-specific'),
('Merchandising', 'skill', 'Functional', 'Maintains planograms and presentation standards', 'Industry Practice', true, 'sector-specific'),
('Loss Prevention', 'knowledge', 'Compliance', 'Applies shrink control and security procedures', 'Industry Practice', true, 'sector-specific'),
('Food Safety & Hygiene', 'knowledge', 'Compliance', 'Applies sanitation and food safety controls', 'Regulatory/Industry', true, 'sector-specific'),
('HACCP Fundamentals', 'knowledge', 'Compliance', 'Supports HACCP controls and documentation', 'Industry Practice', true, 'sector-specific'),
('Guest Experience', 'skill', 'Functional', 'Delivers guest service standards consistently', 'Industry Practice', true, 'sector-specific'),
('Reservations / PMS Systems', 'skill', 'Technical', 'Uses booking and property management systems', 'Industry Practice', true, 'sector-specific'),
('Network Operations', 'skill', 'Technical', 'Monitors and restores network service', 'Industry Practice', true, 'sector-specific'),
('Provisioning & Activation', 'skill', 'Functional', 'Activates services and resolves provisioning faults', 'Industry Practice', true, 'sector-specific'),
('Safety & Compliance (Aviation)', 'knowledge', 'Compliance', 'Applies aviation safety and compliance procedures', 'Regulatory/Industry', true, 'sector-specific'),
('Ground Operations Coordination', 'skill', 'Functional', 'Coordinates ground handling and turnaround activities', 'Industry Practice', true, 'sector-specific'),
('Access Control', 'knowledge', 'Compliance', 'Controls entry, checks IDs, maintains logs', 'Industry Practice', true, 'sector-specific'),
('Incident Reporting', 'knowledge', 'Compliance', 'Records incidents accurately and escalates properly', 'Industry Practice', true, 'sector-specific'),
('Environmental Monitoring', 'skill', 'Technical', 'Collects and interprets environmental data', 'Industry Practice', true, 'sector-specific'),
('Environmental Compliance', 'knowledge', 'Compliance', 'Applies permits and environmental rules', 'Regulatory/Industry', true, 'sector-specific'),
('Creative Production', 'skill', 'Technical', 'Plans and delivers creative outputs to brief', 'Industry Practice', true, 'sector-specific'),
('Rights & Licensing Basics', 'knowledge', 'Compliance', 'Understands usage rights and licensing constraints', 'Industry Practice', true, 'sector-specific')
ON CONFLICT DO NOTHING;

-- Seed master_competencies_library with core competencies
INSERT INTO master_competencies_library (competency_name, competency_type, category, description, source, is_active)
VALUES
('Communication', 'behavioral', 'Behavioral', 'Conveys information clearly to varied audiences', 'Industry Practice', true),
('Customer Focus', 'behavioral', 'Behavioral', 'Builds trust and responds to customer/client needs', 'Industry Practice', true),
('Teamwork', 'behavioral', 'Behavioral', 'Collaborates effectively across functions', 'Industry Practice', true),
('Problem Solving', 'behavioral', 'Behavioral', 'Diagnoses issues and implements practical solutions', 'Industry Practice', true),
('Planning & Prioritisation', 'functional', 'Functional', 'Plans work, manages time, meets deadlines', 'Industry Practice', true),
('Integrity & Ethics', 'behavioral', 'Compliance', 'Acts with honesty; follows codes and policies', 'Industry Practice', true),
('Data Literacy', 'technical', 'Technical', 'Uses data to inform decisions and spot trends', 'Industry Practice', true),
('Continuous Improvement', 'functional', 'Functional', 'Improves quality/cost/cycle time in own area', 'Industry Practice', true),
('Stakeholder Management', 'functional', 'Functional', 'Manages expectations and relationships', 'Industry Practice', true),
('Leadership', 'leadership', 'Leadership', 'Guides others and manages performance', 'Industry Practice', true),
('Adaptability', 'behavioral', 'Behavioral', 'Adjusts approach when circumstances change', 'Industry Practice', true),
('Innovation', 'behavioral', 'Behavioral', 'Generates new ideas and approaches', 'Industry Practice', true),
('Decision Making', 'functional', 'Functional', 'Makes timely decisions with available information', 'Industry Practice', true),
('Accountability', 'behavioral', 'Behavioral', 'Takes ownership of results and commitments', 'Industry Practice', true),
('Collaboration', 'behavioral', 'Behavioral', 'Works effectively with diverse teams', 'Industry Practice', true)
ON CONFLICT DO NOTHING;

-- Update industry_tags for sector-specific skills
UPDATE master_skills_library SET industry_tags = ARRAY['BANK', 'INS', 'FINS'] 
WHERE skill_name IN ('Transaction Processing', 'KYC / Customer Due Diligence', 'AML Monitoring', 'Credit Assessment', 'Regulatory Reporting');

UPDATE master_skills_library SET industry_tags = ARRAY['INS'] 
WHERE skill_name IN ('Policy Underwriting', 'Claims Processing', 'Risk Assessment');

UPDATE master_skills_library SET industry_tags = ARRAY['TECH'] 
WHERE skill_name IN ('SDLC Execution', 'API Integration', 'Version Control (Git)', 'Testing & Debugging', 'Security by Design');

UPDATE master_skills_library SET industry_tags = ARRAY['CONS'] 
WHERE skill_name IN ('Site Coordination', 'Building Codes & Standards', 'BOQ & Cost Estimation', 'Inspection & QA/QC');

UPDATE master_skills_library SET industry_tags = ARRAY['GOV'] 
WHERE skill_name IN ('Public Service Procedures', 'Records & Archive Control', 'Policy Drafting');

UPDATE master_skills_library SET industry_tags = ARRAY['HLTH'] 
WHERE skill_name IN ('Clinical Documentation', 'Patient Safety', 'Infection Prevention & Control');

UPDATE master_skills_library SET industry_tags = ARRAY['PHAR'] 
WHERE skill_name IN ('GxP / GMP Compliance', 'Quality Control Testing', 'Validation & Qualification');

UPDATE master_skills_library SET industry_tags = ARRAY['LOG'] 
WHERE skill_name IN ('Warehouse Operations', 'Route Planning', 'Customs & Trade Basics');

UPDATE master_skills_library SET industry_tags = ARRAY['SHIP'] 
WHERE skill_name IN ('Shipping Documentation', 'Port Operations Safety');

UPDATE master_skills_library SET industry_tags = ARRAY['ENUT'] 
WHERE skill_name IN ('Asset Operations', 'SCADA / Monitoring', 'Permit to Work');

UPDATE master_skills_library SET industry_tags = ARRAY['WATR'] 
WHERE skill_name IN ('Water Treatment Processes', 'Water Quality Testing');

UPDATE master_skills_library SET industry_tags = ARRAY['OILG'] 
WHERE skill_name IN ('Process Operations', 'Integrity & Inspection Basics');

UPDATE master_skills_library SET industry_tags = ARRAY['RETL'] 
WHERE skill_name IN ('POS Operations', 'Merchandising', 'Loss Prevention');

UPDATE master_skills_library SET industry_tags = ARRAY['FOOD'] 
WHERE skill_name IN ('Food Safety & Hygiene', 'HACCP Fundamentals');

UPDATE master_skills_library SET industry_tags = ARRAY['HOSP'] 
WHERE skill_name IN ('Guest Experience', 'Reservations / PMS Systems');

UPDATE master_skills_library SET industry_tags = ARRAY['TEL'] 
WHERE skill_name IN ('Network Operations', 'Provisioning & Activation');

UPDATE master_skills_library SET industry_tags = ARRAY['AVIA'] 
WHERE skill_name IN ('Safety & Compliance (Aviation)', 'Ground Operations Coordination');

UPDATE master_skills_library SET industry_tags = ARRAY['SECU'] 
WHERE skill_name IN ('Access Control', 'Incident Reporting');

UPDATE master_skills_library SET industry_tags = ARRAY['ENVI'] 
WHERE skill_name IN ('Environmental Monitoring', 'Environmental Compliance');

UPDATE master_skills_library SET industry_tags = ARRAY['ARTS'] 
WHERE skill_name IN ('Creative Production', 'Rights & Licensing Basics');

-- Insert mappings for cross-cutting skills (apply to all industries)
INSERT INTO master_industry_skills (industry_id, skill_id, relevance_score)
SELECT 
  mi.id as industry_id,
  ms.id as skill_id,
  80 as relevance_score
FROM master_industries mi
CROSS JOIN master_skills_library ms
WHERE ms.reuse_level = 'cross-sector'
ON CONFLICT DO NOTHING;

-- Insert mappings for sector-specific skills based on industry_tags
INSERT INTO master_industry_skills (industry_id, skill_id, relevance_score)
SELECT 
  mi.id as industry_id,
  ms.id as skill_id,
  100 as relevance_score
FROM master_industries mi
JOIN master_skills_library ms ON mi.code = ANY(ms.industry_tags)
WHERE ms.reuse_level = 'sector-specific'
ON CONFLICT DO NOTHING;
