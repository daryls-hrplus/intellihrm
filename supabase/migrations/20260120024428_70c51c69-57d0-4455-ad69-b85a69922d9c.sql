-- Update all roles to use the simplified 3-type model

-- hr, business, commercial, internal -> custom (or seeded if is_seeded is true)
UPDATE roles SET role_type = CASE 
  WHEN is_seeded = true THEN 'seeded'
  ELSE 'custom'
END
WHERE role_type IN ('hr', 'business', 'commercial', 'internal', 'self_service');

-- System roles (truly untouchable)
UPDATE roles SET role_type = 'system' 
WHERE code IN ('system_admin', 'support_readonly');

-- Seeded/Template roles (pre-configured, limited editing, cannot delete)
UPDATE roles SET role_type = 'seeded', is_seeded = true 
WHERE code IN ('employee', 'hr_manager', 'admin', 'hr_admin', 'manager', 'executive', 'billing_admin', 'enablement_admin');

-- All remaining become custom
UPDATE roles SET role_type = 'custom' 
WHERE role_type NOT IN ('system', 'seeded');

-- Add new constraint with only 3 valid types
ALTER TABLE roles ADD CONSTRAINT roles_role_type_check 
  CHECK (role_type IN ('system', 'seeded', 'custom'));

-- ==========================================================================
-- Seed PII Access for the 3 core roles that were missing it
-- ==========================================================================

-- Employee PII Access (no access to others' data)
INSERT INTO role_pii_access (role_id, pii_level, access_personal_details, access_compensation, access_banking, access_medical, access_disciplinary, masking_enabled, export_permission, jit_access_required, approval_required_for_full)
SELECT id, 'none', false, false, false, false, false, false, 'none', false, false
FROM roles WHERE code = 'employee'
ON CONFLICT (role_id) DO UPDATE SET
  pii_level = 'none',
  access_personal_details = false,
  access_compensation = false,
  access_banking = false,
  access_medical = false,
  access_disciplinary = false,
  masking_enabled = false,
  export_permission = 'none',
  updated_at = now();

-- HR Manager PII Access (team-level access)
INSERT INTO role_pii_access (role_id, pii_level, access_personal_details, access_compensation, access_banking, access_medical, access_disciplinary, masking_enabled, export_permission, jit_access_required, approval_required_for_full)
SELECT id, 'limited', true, true, false, false, true, true, 'approval_required', false, false
FROM roles WHERE code = 'hr_manager'
ON CONFLICT (role_id) DO UPDATE SET
  pii_level = 'limited',
  access_personal_details = true,
  access_compensation = true,
  access_banking = false,
  access_medical = false,
  access_disciplinary = true,
  masking_enabled = true,
  export_permission = 'approval_required',
  updated_at = now();

-- Administrator PII Access (full access)
INSERT INTO role_pii_access (role_id, pii_level, access_personal_details, access_compensation, access_banking, access_medical, access_disciplinary, masking_enabled, export_permission, jit_access_required, approval_required_for_full)
SELECT id, 'full', true, true, true, true, true, false, 'allowed', false, false
FROM roles WHERE code = 'admin'
ON CONFLICT (role_id) DO UPDATE SET
  pii_level = 'full',
  access_personal_details = true,
  access_compensation = true,
  access_banking = true,
  access_medical = true,
  access_disciplinary = true,
  masking_enabled = false,
  export_permission = 'allowed',
  updated_at = now();

-- ==========================================================================
-- Seed Container Access for the 3 core roles (with proper casting)
-- ==========================================================================

-- Employee Container Access (minimal - only documentation)
INSERT INTO role_container_access (role_id, container_code, permission_level)
SELECT r.id, c.code, c.level::admin_container_permission
FROM roles r
CROSS JOIN (VALUES 
  ('org_structure', 'none'),
  ('users_roles_access', 'none'),
  ('security_governance', 'none'),
  ('system_platform_config', 'none'),
  ('strategic_planning', 'none'),
  ('analytics_insights', 'none'),
  ('documentation_enablement', 'view'),
  ('billing_subscriptions', 'none')
) AS c(code, level)
WHERE r.code = 'employee'
ON CONFLICT (role_id, container_code) DO UPDATE SET
  permission_level = EXCLUDED.permission_level,
  updated_at = now();

-- HR Manager Container Access
INSERT INTO role_container_access (role_id, container_code, permission_level)
SELECT r.id, c.code, c.level::admin_container_permission
FROM roles r
CROSS JOIN (VALUES 
  ('org_structure', 'view'),
  ('users_roles_access', 'view'),
  ('security_governance', 'none'),
  ('system_platform_config', 'none'),
  ('strategic_planning', 'view'),
  ('analytics_insights', 'view'),
  ('documentation_enablement', 'view'),
  ('billing_subscriptions', 'none')
) AS c(code, level)
WHERE r.code = 'hr_manager'
ON CONFLICT (role_id, container_code) DO UPDATE SET
  permission_level = EXCLUDED.permission_level,
  updated_at = now();

-- Administrator Container Access
INSERT INTO role_container_access (role_id, container_code, permission_level)
SELECT r.id, c.code, c.level::admin_container_permission
FROM roles r
CROSS JOIN (VALUES 
  ('org_structure', 'configure'),
  ('users_roles_access', 'configure'),
  ('security_governance', 'configure'),
  ('system_platform_config', 'configure'),
  ('strategic_planning', 'configure'),
  ('analytics_insights', 'configure'),
  ('documentation_enablement', 'configure'),
  ('billing_subscriptions', 'view')
) AS c(code, level)
WHERE r.code = 'admin'
ON CONFLICT (role_id, container_code) DO UPDATE SET
  permission_level = EXCLUDED.permission_level,
  updated_at = now();

-- ==========================================================================
-- Update role descriptions for clarity
-- ==========================================================================

UPDATE roles SET description = 'Standard employee self-service access. Can view and update own personal information through ESS.'
WHERE code = 'employee';

UPDATE roles SET description = 'HR management access with team oversight capabilities.'
WHERE code = 'hr_manager';

UPDATE roles SET description = 'General administrative access for system configuration and user management.'
WHERE code = 'admin';