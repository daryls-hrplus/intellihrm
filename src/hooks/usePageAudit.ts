import { useEffect, useRef } from 'react';
import { useAuditLog } from '@/hooks/useAuditLog';

/**
 * Hook for consistent page view audit logging across the application.
 * Automatically logs a VIEW action when the page mounts.
 * 
 * @param entityType - The type of entity/page being viewed (e.g., 'payroll_processing', 'leave_dashboard')
 * @param module - The module this page belongs to (e.g., 'Payroll', 'Leave', 'Admin')
 * @param options - Optional entity details
 */
export function usePageAudit(
  entityType: string,
  module: string,
  options?: {
    entityId?: string;
    entityName?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const { logView } = useAuditLog();
  const hasLogged = useRef(false);

  useEffect(() => {
    if (!hasLogged.current) {
      hasLogged.current = true;
      logView(entityType, options?.entityId, options?.entityName, {
        ...options?.metadata,
        module,
      });
    }
  }, [entityType, module, options?.entityId, options?.entityName]);

  return null;
}
