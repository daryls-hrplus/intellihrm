import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Json } from "@/integrations/supabase/types";

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT' | 'LOGIN' | 'LOGOUT';

interface AuditLogParams {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  entityName?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export function useAuditLog() {
  const { user } = useAuth();

  const logAction = async ({
    action,
    entityType,
    entityId,
    entityName,
    oldValues,
    newValues,
    metadata,
  }: AuditLogParams) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: user.id,
          action,
          entity_type: entityType,
          entity_id: entityId,
          entity_name: entityName,
          old_values: oldValues as Json,
          new_values: newValues as Json,
          metadata: {
            ...metadata,
            user_agent: navigator.userAgent,
            source: 'frontend',
          } as Json,
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Failed to log audit event:', error);
        return null;
      }

      return data?.id;
    } catch (err) {
      console.error('Audit log error:', err);
      return null;
    }
  };

  const logView = (entityType: string, entityId?: string, entityName?: string, metadata?: Record<string, unknown>) =>
    logAction({ action: 'VIEW', entityType, entityId, entityName, metadata });

  const logExport = (entityType: string, metadata?: Record<string, unknown>) =>
    logAction({ action: 'EXPORT', entityType, metadata });

  const logLogin = () =>
    logAction({ action: 'LOGIN', entityType: 'session' });

  const logLogout = () =>
    logAction({ action: 'LOGOUT', entityType: 'session' });

  return {
    logAction,
    logView,
    logExport,
    logLogin,
    logLogout,
  };
}
