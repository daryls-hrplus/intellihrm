-- Fix is_system flag: Only true system roles should have is_system = true
-- System roles (truly untouchable - cannot modify at all)
UPDATE roles SET is_system = true WHERE code IN ('system_admin', 'support_readonly');

-- Template/Seeded roles are NOT system roles (can customize permissions)
UPDATE roles SET is_system = false 
WHERE code IN ('employee', 'admin', 'hr_admin', 'hr_manager', 'manager', 'executive', 'billing_admin', 'enablement_admin');