-- =========================================================
-- PART 2: SEED L&D WORKFLOW TEMPLATES AND STEPS
-- =========================================================

DO $$
DECLARE
  v_system_user_id UUID;
  v_template_id UUID;
BEGIN
  SELECT id INTO v_system_user_id FROM profiles WHERE email LIKE '%admin%' LIMIT 1;
  IF v_system_user_id IS NULL THEN
    SELECT id INTO v_system_user_id FROM profiles LIMIT 1;
  END IF;
  
  -- ===============================================
  -- 1. TRAINING REQUEST APPROVAL (Update Existing)
  -- ===============================================
  
  SELECT id INTO v_template_id FROM workflow_templates WHERE code = 'TRAINING_REQUEST_APPROVAL';
  
  IF v_template_id IS NOT NULL THEN
    -- Add Step 1: Manager Approval
    INSERT INTO workflow_steps (
      template_id, step_order, name, description, approver_type,
      use_reporting_line, requires_signature, requires_comment,
      can_delegate, escalation_hours, sla_warning_hours, is_active
    )
    SELECT 
      v_template_id, 1, 'Manager Approval',
      'Direct manager reviews training relevance, timing, and cost justification',
      'manager', true, false, false, true, 24, 16, true
    WHERE NOT EXISTS (
      SELECT 1 FROM workflow_steps ws 
      WHERE ws.template_id = v_template_id AND ws.step_order = 1
    );
    
    -- Add Step 2: HR Learning Review
    INSERT INTO workflow_steps (
      template_id, step_order, name, description, approver_type,
      use_reporting_line, requires_signature, requires_comment,
      can_delegate, escalation_hours, sla_warning_hours, is_active
    )
    SELECT 
      v_template_id, 2, 'HR Learning Review',
      'HR validates training provider, negotiates rates, and confirms budget availability',
      'hr', false, false, true, true, 48, 24, true
    WHERE NOT EXISTS (
      SELECT 1 FROM workflow_steps ws 
      WHERE ws.template_id = v_template_id AND ws.step_order = 2
    );
    
    -- Add Step 3: Finance Approval
    INSERT INTO workflow_steps (
      template_id, step_order, name, description, approver_type,
      use_reporting_line, requires_signature, requires_comment,
      can_delegate, escalation_hours, sla_warning_hours, is_active
    )
    SELECT 
      v_template_id, 3, 'Finance Approval',
      'Finance reviews budget impact for training requests exceeding $2,500',
      'role', false, false, true, false, 72, 48, true
    WHERE NOT EXISTS (
      SELECT 1 FROM workflow_steps ws 
      WHERE ws.template_id = v_template_id AND ws.step_order = 3
    );
  END IF;

  -- ===============================================
  -- 2. CERTIFICATION REQUEST APPROVAL
  -- ===============================================
  
  INSERT INTO workflow_templates (
    name, code, category, description, is_global, is_active,
    requires_signature, requires_letter, auto_terminate_hours,
    allow_return_to_previous, created_by, start_date
  )
  SELECT
    'Certification Request Approval',
    'CERTIFICATION_REQUEST_APPROVAL',
    'certification_request'::workflow_category,
    'Approval workflow for professional certification exams and renewals (AWS, PMP, SHRM, etc.)',
    true, true, false, false, 168, true, v_system_user_id, CURRENT_DATE
  WHERE NOT EXISTS (
    SELECT 1 FROM workflow_templates WHERE code = 'CERTIFICATION_REQUEST_APPROVAL'
  );
  
  SELECT id INTO v_template_id FROM workflow_templates WHERE code = 'CERTIFICATION_REQUEST_APPROVAL';
  
  IF v_template_id IS NOT NULL THEN
    INSERT INTO workflow_steps (
      template_id, step_order, name, description, approver_type,
      use_reporting_line, requires_signature, requires_comment,
      can_delegate, escalation_hours, sla_warning_hours, is_active
    )
    SELECT 
      v_template_id, 1, 'Manager Approval',
      'Manager confirms certification aligns with role requirements and approves study time allocation',
      'manager', true, false, false, true, 24, 16, true
    WHERE NOT EXISTS (
      SELECT 1 FROM workflow_steps ws WHERE ws.template_id = v_template_id AND ws.step_order = 1
    );
    
    INSERT INTO workflow_steps (
      template_id, step_order, name, description, approver_type,
      use_reporting_line, requires_signature, requires_comment,
      can_delegate, escalation_hours, sla_warning_hours, is_active
    )
    SELECT 
      v_template_id, 2, 'HR Learning Approval',
      'HR Learning team validates certification provider and registers employee for exam',
      'hr', false, false, false, true, 48, 24, true
    WHERE NOT EXISTS (
      SELECT 1 FROM workflow_steps ws WHERE ws.template_id = v_template_id AND ws.step_order = 2
    );
  END IF;

  -- ===============================================
  -- 3. EXTERNAL TRAINING VERIFICATION
  -- ===============================================
  
  INSERT INTO workflow_templates (
    name, code, category, description, is_global, is_active,
    requires_signature, requires_letter, auto_terminate_hours,
    allow_return_to_previous, created_by, start_date
  )
  SELECT
    'External Training Verification',
    'EXTERNAL_TRAINING_VERIFICATION',
    'external_training'::workflow_category,
    'HR verification workflow for employee-submitted external training records before transcript inclusion',
    true, true, false, false, 168, true, v_system_user_id, CURRENT_DATE
  WHERE NOT EXISTS (
    SELECT 1 FROM workflow_templates WHERE code = 'EXTERNAL_TRAINING_VERIFICATION'
  );
  
  SELECT id INTO v_template_id FROM workflow_templates WHERE code = 'EXTERNAL_TRAINING_VERIFICATION';
  
  IF v_template_id IS NOT NULL THEN
    INSERT INTO workflow_steps (
      template_id, step_order, name, description, approver_type,
      use_reporting_line, requires_signature, requires_comment,
      can_delegate, escalation_hours, sla_warning_hours, is_active
    )
    SELECT 
      v_template_id, 1, 'HR Verification',
      'HR validates training completion certificate, duration, and provider legitimacy',
      'hr', false, false, true, true, 72, 48, true
    WHERE NOT EXISTS (
      SELECT 1 FROM workflow_steps ws WHERE ws.template_id = v_template_id
    );
  END IF;

  -- ===============================================
  -- 4. RECERTIFICATION REQUEST APPROVAL
  -- ===============================================
  
  INSERT INTO workflow_templates (
    name, code, category, description, is_global, is_active,
    requires_signature, requires_letter, auto_terminate_hours,
    allow_return_to_previous, created_by, start_date
  )
  SELECT
    'Recertification Request Approval',
    'RECERTIFICATION_REQUEST_APPROVAL',
    'recertification_request'::workflow_category,
    'Streamlined approval for certification renewal requests triggered by expiry reminders',
    true, true, false, false, 120, true, v_system_user_id, CURRENT_DATE
  WHERE NOT EXISTS (
    SELECT 1 FROM workflow_templates WHERE code = 'RECERTIFICATION_REQUEST_APPROVAL'
  );
  
  SELECT id INTO v_template_id FROM workflow_templates WHERE code = 'RECERTIFICATION_REQUEST_APPROVAL';
  
  IF v_template_id IS NOT NULL THEN
    INSERT INTO workflow_steps (
      template_id, step_order, name, description, approver_type,
      use_reporting_line, requires_signature, requires_comment,
      can_delegate, escalation_hours, sla_warning_hours, is_active
    )
    SELECT 
      v_template_id, 1, 'Manager Approval',
      'Manager confirms continued need for certification and approves renewal cost',
      'manager', true, false, false, true, 48, 24, true
    WHERE NOT EXISTS (
      SELECT 1 FROM workflow_steps ws WHERE ws.template_id = v_template_id
    );
  END IF;

  -- ===============================================
  -- 5. TRAINING BUDGET EXCEPTION
  -- ===============================================
  
  INSERT INTO workflow_templates (
    name, code, category, description, is_global, is_active,
    requires_signature, requires_letter, auto_terminate_hours,
    allow_return_to_previous, created_by, start_date
  )
  SELECT
    'Training Budget Exception Request',
    'TRAINING_BUDGET_EXCEPTION',
    'training_budget'::workflow_category,
    'Multi-level approval for training requests that exceed department budget allocation',
    true, true, false, false, 240, true, v_system_user_id, CURRENT_DATE
  WHERE NOT EXISTS (
    SELECT 1 FROM workflow_templates WHERE code = 'TRAINING_BUDGET_EXCEPTION'
  );
  
  SELECT id INTO v_template_id FROM workflow_templates WHERE code = 'TRAINING_BUDGET_EXCEPTION';
  
  IF v_template_id IS NOT NULL THEN
    INSERT INTO workflow_steps (
      template_id, step_order, name, description, approver_type,
      use_reporting_line, requires_signature, requires_comment,
      can_delegate, escalation_hours, sla_warning_hours, is_active
    )
    SELECT 
      v_template_id, 1, 'Department Head Approval',
      'Department head confirms training priority and willingness to reallocate budget',
      'manager', true, false, true, false, 48, 24, true
    WHERE NOT EXISTS (
      SELECT 1 FROM workflow_steps ws WHERE ws.template_id = v_template_id AND ws.step_order = 1
    );
    
    INSERT INTO workflow_steps (
      template_id, step_order, name, description, approver_type,
      use_reporting_line, requires_signature, requires_comment,
      can_delegate, escalation_hours, sla_warning_hours, is_active
    )
    SELECT 
      v_template_id, 2, 'HR Budget Review',
      'HR reviews company-wide training budget and recommends approval or alternative timing',
      'hr', false, false, true, true, 48, 24, true
    WHERE NOT EXISTS (
      SELECT 1 FROM workflow_steps ws WHERE ws.template_id = v_template_id AND ws.step_order = 2
    );
    
    INSERT INTO workflow_steps (
      template_id, step_order, name, description, approver_type,
      use_reporting_line, requires_signature, requires_comment,
      can_delegate, escalation_hours, sla_warning_hours, is_active
    )
    SELECT 
      v_template_id, 3, 'Finance Approval',
      'Finance validates budget exception and approves funding source',
      'role', false, true, true, false, 72, 48, true
    WHERE NOT EXISTS (
      SELECT 1 FROM workflow_steps ws WHERE ws.template_id = v_template_id AND ws.step_order = 3
    );
  END IF;

END $$;