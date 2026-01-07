/**
 * Get the risk level for an audit action
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

const sensitiveEntityTypes = [
  'payroll', 'compensation', 'salary', 'bank_details', 'bank_account',
  'employee', 'profile', 'profiles', 'user', 'users',
  'role', 'roles', 'permission', 'permissions',
  'company', 'companies', 'organization',
  'api_key', 'secret', 'credential', 'auth'
];

const piiEntityTypes = [
  'employee', 'profile', 'profiles', 'user', 'users',
  'candidate', 'candidates', 'application', 'applications',
  'dependent', 'beneficiary', 'emergency_contact'
];

export function getRiskLevel(action: string, entityType: string): RiskLevel {
  const normalizedEntity = entityType.toLowerCase();
  
  // Critical: Deleting sensitive data
  if (action === 'DELETE' && sensitiveEntityTypes.some(t => normalizedEntity.includes(t))) {
    return 'critical';
  }
  
  // High: Updating payroll/compensation or exporting PII
  if (action === 'UPDATE' && ['payroll', 'compensation', 'salary', 'bank'].some(t => normalizedEntity.includes(t))) {
    return 'high';
  }
  
  if (action === 'EXPORT' && piiEntityTypes.some(t => normalizedEntity.includes(t))) {
    return 'high';
  }
  
  // Medium: Any delete or role/permission changes
  if (action === 'DELETE') {
    return 'medium';
  }
  
  if (['role', 'permission', 'access'].some(t => normalizedEntity.includes(t))) {
    return 'medium';
  }
  
  // Low: Everything else
  return 'low';
}

export function getRiskBadgeStyles(level: RiskLevel): string {
  switch (level) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800';
  }
}

/**
 * Get navigation link for an entity
 */
export function getEntityLink(entityType: string, entityId: string | null): string | null {
  if (!entityId) return null;
  
  const normalizedType = entityType.toLowerCase();
  
  const linkMap: Record<string, string> = {
    'employee': `/employee/${entityId}`,
    'profile': `/employee/${entityId}`,
    'profiles': `/employee/${entityId}`,
    'role': `/admin/roles/${entityId}`,
    'roles': `/admin/roles/${entityId}`,
    'job_requisition': `/recruitment/job-board/${entityId}`,
    'job_requisitions': `/recruitment/job-board/${entityId}`,
    'candidate': `/recruitment/candidates/${entityId}`,
    'candidates': `/recruitment/candidates/${entityId}`,
    'application': `/recruitment/applications/${entityId}`,
    'applications': `/recruitment/applications/${entityId}`,
    'leave_request': `/time/leave/${entityId}`,
    'leave_requests': `/time/leave/${entityId}`,
    'implementation_step': `/admin/implementation-handbook`,
    'implementation_sub_task': `/admin/implementation-handbook`,
    'company': `/admin/companies/${entityId}`,
    'companies': `/admin/companies/${entityId}`,
    'department': `/admin/departments/${entityId}`,
    'departments': `/admin/departments/${entityId}`,
    'policy': `/compliance/policies/${entityId}`,
    'policies': `/compliance/policies/${entityId}`,
    'training': `/learning/courses/${entityId}`,
    'course': `/learning/courses/${entityId}`,
    'courses': `/learning/courses/${entityId}`,
    'appraisal': `/performance/appraisals/${entityId}`,
    'appraisals': `/performance/appraisals/${entityId}`,
    'goal': `/performance/goals/${entityId}`,
    'goals': `/performance/goals/${entityId}`,
  };

  // Check for exact match first
  if (linkMap[normalizedType]) {
    return linkMap[normalizedType];
  }

  // Check for partial match
  for (const [key, link] of Object.entries(linkMap)) {
    if (normalizedType.includes(key) || key.includes(normalizedType)) {
      return link;
    }
  }

  return null;
}

/**
 * Format entity type for display
 */
export function formatEntityType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
