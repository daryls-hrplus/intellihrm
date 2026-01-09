-- Update Benefits Administrator Manual sections with relevant feature codes
-- Section 1.x - Overview (Dashboard focus)
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_dashboard'] WHERE id = 'f28e33c2-d6e3-4954-8ef3-bb8d16f7168b';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_dashboard'] WHERE id = 'a24d4dee-c5a7-41f7-8b9a-4d05c3bc9bc1';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_dashboard', 'benefit_plans', 'enrollments'] WHERE id = '76119043-0ecd-4a94-b66a-0bae515acf1e';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_dashboard'] WHERE id = '2165fb0c-33a4-4ffd-bdbf-d151de9526f2';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_dashboard', 'enrollments'] WHERE id = '2b666488-0219-4706-a63a-4b2cab648a4c';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_enrollment_periods', 'ben_open_enrollment'] WHERE id = '2607e3b3-dae3-4bcc-8ee7-9035f5e03345';

-- Section 2.x - Setup (Plan setup, eligibility, periods)
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_plan_setup', 'ben_eligibility_rules', 'ben_enrollment_periods'] WHERE id = 'b9b3c148-2345-4e8b-a97f-1559094ff21d';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_plan_setup'] WHERE id = 'cdc22538-b51d-495d-89cd-7b5389c17dc4';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_plan_setup', 'ben_eligibility_rules', 'ben_enrollment_periods'] WHERE id = 'df239373-2018-43a6-a7af-dea2c6c31b85';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_plan_setup'] WHERE id = '00dd7f36-9fe4-4386-a728-4163b96b8638';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_providers'] WHERE id = '5f7ae6f9-d962-4720-8827-a1dc6b94b94d';

-- Section 3.x - Workflows (Enrollments, claims, life events)
UPDATE manual_sections SET source_feature_codes = ARRAY['enrollments', 'claims', 'ben_life_events', 'ben_open_enrollment'] WHERE id = '6c612dc4-9189-4d5b-b368-21a24503e3e1';
UPDATE manual_sections SET source_feature_codes = ARRAY['enrollments', 'claims', 'ben_life_events', 'ben_open_enrollment'] WHERE id = '58f05ed4-34f5-48c8-9bcc-eeab26dbf19b';
UPDATE manual_sections SET source_feature_codes = ARRAY['enrollments', 'ben_open_enrollment'] WHERE id = '14b303a1-a3ba-4fc3-beda-2f5c0bb889ed';
UPDATE manual_sections SET source_feature_codes = ARRAY['enrollments', 'ben_dependents', 'claims'] WHERE id = '7a07b45a-e93e-45ff-8d0b-f053b65bb26d';

-- Section 4.x - Advanced (Dependents, providers, bulk)
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_dependents', 'ben_providers', 'benefit_plans'] WHERE id = '688ef392-f9c0-4fd3-ad02-bb7f3f5b5657';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_eligibility_rules', 'ben_plan_setup'] WHERE id = '3bfa76d4-3b4c-4dd9-9bf2-89136b58d3a9';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_life_events', 'ben_open_enrollment'] WHERE id = '3841ddf2-1c56-4a9d-a53b-c28937c164de';
UPDATE manual_sections SET source_feature_codes = ARRAY['enrollments', 'ben_dependents'] WHERE id = '2b7a8ba8-d567-4604-b5e8-35918f29459d';

-- Section 5.x - AI Features
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_dashboard'] WHERE id = 'd950aa9a-ce47-4173-8f48-e945d1f0f44b';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_dashboard'] WHERE id = '45440b5e-3498-4f6c-a59c-d20812f7b70c';
UPDATE manual_sections SET source_feature_codes = ARRAY['enrollments', 'benefit_plans'] WHERE id = '80f3987e-9e33-49be-958d-6dcf4421ba9c';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_cost_analysis', 'ben_utilization'] WHERE id = 'd9c4f395-7a43-4822-9c43-a9b357630448';

-- Section 6.x - Analytics (Reports, compliance, costs)
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_reports', 'ben_utilization', 'ben_cost_analysis', 'ben_compliance'] WHERE id = 'b07f255a-d974-432f-a97c-4d7ea41395eb';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_reports'] WHERE id = '71c1a3b4-1e10-4cc6-99d7-851dd0fa1f1e';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_dashboard'] WHERE id = '264cd365-147d-4195-95c4-ac263472138b';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_reports', 'ben_cost_analysis'] WHERE id = '105bc53e-0c23-45b9-bf84-bcd04281dd0f';

-- Section 7.x - Integration
UPDATE manual_sections SET source_feature_codes = ARRAY['enrollments', 'claims', 'ben_providers'] WHERE id = 'f1621a4a-7303-4b30-804d-5282271135e2';
UPDATE manual_sections SET source_feature_codes = ARRAY['enrollments', 'claims'] WHERE id = '9948e504-979f-4645-95e6-2f2b58385dc5';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_providers', 'claims'] WHERE id = '1dc7c4fc-157b-4871-a397-e6c35e087fbb';
UPDATE manual_sections SET source_feature_codes = ARRAY['enrollments', 'ben_dependents'] WHERE id = 'faf5ea2e-bd21-45d0-9ea9-f5caa684f06e';

-- Section 8.x - FAQ (All features)
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_dashboard', 'enrollments', 'claims', 'ben_life_events', 'ben_open_enrollment', 'ben_dependents', 'ben_providers'] WHERE id = '6104e406-d93e-422c-a949-a1326263adae';
UPDATE manual_sections SET source_feature_codes = ARRAY['enrollments', 'claims', 'ben_life_events'] WHERE id = '7f6afe07-bd5d-432a-857f-26cb659a1b3d';
UPDATE manual_sections SET source_feature_codes = ARRAY['enrollments', 'claims', 'ben_open_enrollment', 'ben_eligibility_rules'] WHERE id = 'c7b03ec0-8732-4119-b23f-978dae923641';
UPDATE manual_sections SET source_feature_codes = ARRAY['ben_dashboard'] WHERE id = 'dcc307f4-7550-4c7a-b6e9-df44bd514986';