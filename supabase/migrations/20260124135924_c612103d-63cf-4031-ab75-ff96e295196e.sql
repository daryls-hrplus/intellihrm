-- Seed default goal cycle for each company
INSERT INTO public.goal_cycles (
  company_id,
  name,
  cycle_type,
  start_date,
  end_date,
  goal_setting_start,
  goal_setting_end,
  review_start,
  review_end,
  status,
  is_active
)
SELECT 
  c.id as company_id,
  '2026 Annual Goals' as name,
  'annual' as cycle_type,
  '2026-01-01'::date as start_date,
  '2026-12-31'::date as end_date,
  '2026-01-01'::date as goal_setting_start,
  '2026-01-31'::date as goal_setting_end,
  '2026-12-01'::date as review_start,
  '2026-12-31'::date as review_end,
  'active' as status,
  true as is_active
FROM public.companies c
WHERE NOT EXISTS (
  SELECT 1 FROM public.goal_cycles gc 
  WHERE gc.company_id = c.id AND gc.name = '2026 Annual Goals'
);

-- Seed 10 goal templates for each company (templates are company-specific)
INSERT INTO public.goal_templates (
  company_id,
  name,
  description,
  category,
  goal_type,
  default_weighting,
  suggested_metrics,
  is_active
)
SELECT 
  c.id as company_id,
  t.name,
  t.description,
  t.category,
  t.goal_type::goal_type,
  t.default_weighting,
  t.suggested_metrics::jsonb,
  true as is_active
FROM public.companies c
CROSS JOIN (
  VALUES
    ('Improve Team Communication', 'Enhance communication effectiveness within the team through regular meetings, clear documentation, and feedback mechanisms.', 'Leadership', 'smart_goal', 15, '{"metrics": [{"name": "Team Meeting Effectiveness", "target": "90% attendance and action item completion"}, {"name": "Feedback Scores", "target": "4.0+ on communication surveys"}]}'),
    ('Develop Leadership Skills', 'Build leadership capabilities through training, mentorship, and practical application in team settings.', 'Leadership', 'smart_goal', 20, '{"metrics": [{"name": "360 Feedback Scores", "target": "Improve leadership rating by 15%"}, {"name": "Training Completion", "target": "Complete 2 leadership courses"}]}'),
    ('Increase Customer Satisfaction', 'Improve customer experience and satisfaction through better service delivery and responsiveness.', 'Customer Focus', 'smart_goal', 15, '{"metrics": [{"name": "CSAT Score", "target": "Achieve 85%+ satisfaction"}, {"name": "NPS Improvement", "target": "Increase NPS by 10 points"}]}'),
    ('Reduce Process Cycle Time', 'Streamline workflows and eliminate bottlenecks to improve operational efficiency.', 'Innovation', 'smart_goal', 10, '{"metrics": [{"name": "Process Time Reduction", "target": "Reduce cycle time by 20%"}, {"name": "Efficiency Gains", "target": "Eliminate 3 manual steps"}]}'),
    ('Complete Professional Certification', 'Obtain industry-recognized certification to enhance professional expertise and credibility.', 'Technical', 'smart_goal', 15, '{"metrics": [{"name": "Certification Obtained", "target": "Pass certification exam"}, {"name": "Exam Score", "target": "Score 80%+ on certification"}]}'),
    ('Mentor Junior Team Members', 'Guide and develop junior colleagues through structured mentorship and knowledge sharing.', 'Leadership', 'smart_goal', 10, '{"metrics": [{"name": "Mentee Progress", "target": "2 mentees show measurable improvement"}, {"name": "Knowledge Transfer", "target": "Conduct 6 knowledge sharing sessions"}]}'),
    ('Implement Cost Savings Initiative', 'Identify and execute cost reduction opportunities while maintaining quality standards.', 'Innovation', 'smart_goal', 15, '{"metrics": [{"name": "Cost Reduction", "target": "Achieve 10% cost savings"}, {"name": "ROI", "target": "Deliver 150% ROI on initiative"}]}'),
    ('Improve Cross-Department Collaboration', 'Build stronger working relationships and collaboration across organizational boundaries.', 'Communication', 'smart_goal', 10, '{"metrics": [{"name": "Joint Projects", "target": "Complete 3 cross-functional projects"}, {"name": "Stakeholder Feedback", "target": "4.0+ collaboration rating"}]}'),
    ('Master New Technology/Tool', 'Develop proficiency in a new technology or tool relevant to role responsibilities.', 'Technical', 'smart_goal', 15, '{"metrics": [{"name": "Proficiency Assessment", "target": "Pass proficiency test"}, {"name": "Project Implementation", "target": "Apply in 2 real projects"}]}'),
    ('Achieve Quality Metrics Target', 'Meet or exceed quality standards and targets for deliverables and outputs.', 'Technical', 'smart_goal', 15, '{"metrics": [{"name": "Defect Rate", "target": "Reduce defects by 25%"}, {"name": "Quality Scores", "target": "Achieve 95%+ quality rating"}]}')
) AS t(name, description, category, goal_type, default_weighting, suggested_metrics)
WHERE NOT EXISTS (
  SELECT 1 FROM public.goal_templates gt 
  WHERE gt.company_id = c.id AND gt.name = t.name
);