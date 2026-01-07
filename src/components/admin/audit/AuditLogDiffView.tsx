import { Json } from "@/integrations/supabase/types";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Minus, Plus } from "lucide-react";

interface AuditLogDiffViewProps {
  oldValues: Json | null;
  newValues: Json | null;
  action: string;
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
};

const formatFieldName = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export function AuditLogDiffView({ oldValues, newValues, action }: AuditLogDiffViewProps) {
  const oldObj = (oldValues as Record<string, unknown>) || {};
  const newObj = (newValues as Record<string, unknown>) || {};
  
  const allKeys = [...new Set([...Object.keys(oldObj), ...Object.keys(newObj)])].sort();
  
  if (allKeys.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No data changes recorded</p>
    );
  }

  // For CREATE actions, only show new values
  if (action === 'CREATE') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Plus className="h-4 w-4 text-green-700" />
          <span>New record created:</span>
        </div>
        <div className="border rounded-lg overflow-hidden">
          {Object.entries(newObj).map(([key, value], idx) => (
            <div 
              key={key} 
              className={`flex ${idx !== 0 ? 'border-t' : ''}`}
            >
              <div className="w-1/3 px-4 py-3 bg-muted font-medium text-sm">
                {formatFieldName(key)}
              </div>
              <div className="w-2/3 px-4 py-3 bg-green-100 dark:bg-green-900/40">
                <code className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap break-all">
                  {formatValue(value)}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // For DELETE actions, only show old values
  if (action === 'DELETE') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Minus className="h-4 w-4 text-red-700" />
          <span>Record deleted:</span>
        </div>
        <div className="border rounded-lg overflow-hidden">
          {Object.entries(oldObj).map(([key, value], idx) => (
            <div 
              key={key} 
              className={`flex ${idx !== 0 ? 'border-t' : ''}`}
            >
              <div className="w-1/3 px-4 py-3 bg-muted font-medium text-sm">
                {formatFieldName(key)}
              </div>
              <div className="w-2/3 px-4 py-3 bg-red-100 dark:bg-red-900/40">
                <code className="text-sm text-red-800 dark:text-red-200 line-through whitespace-pre-wrap break-all">
                  {formatValue(value)}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // For UPDATE actions, show diff
  const changedKeys = allKeys.filter(key => 
    JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])
  );
  const unchangedKeys = allKeys.filter(key => 
    JSON.stringify(oldObj[key]) === JSON.stringify(newObj[key])
  );

  return (
    <div className="space-y-4">
      {changedKeys.length > 0 && (
        <div className="space-y-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {changedKeys.length} field{changedKeys.length > 1 ? 's' : ''} changed
          </Badge>
          
          <div className="border rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex bg-muted border-b font-medium text-sm">
              <div className="w-1/4 px-4 py-2">Field</div>
              <div className="w-5/12 px-4 py-2">Before</div>
              <div className="w-auto px-2 py-2"></div>
              <div className="w-5/12 px-4 py-2">After</div>
            </div>
            
            {/* Rows */}
            {changedKeys.map((key, idx) => (
              <div 
                key={key} 
                className={`flex items-stretch ${idx !== 0 ? 'border-t' : ''}`}
              >
                <div className="w-1/4 px-4 py-3 bg-muted/50 font-medium text-sm flex items-center">
                  {formatFieldName(key)}
                </div>
                <div className="w-5/12 px-4 py-3 bg-red-50 dark:bg-red-950/50 flex items-center">
                  <code className="text-sm text-red-800 dark:text-red-300 font-semibold whitespace-pre-wrap break-all">
                    {formatValue(oldObj[key])}
                  </code>
                </div>
                <div className="w-auto px-2 py-3 flex items-center justify-center bg-muted/30">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="w-5/12 px-4 py-3 bg-green-50 dark:bg-green-950/50 flex items-center">
                  <code className="text-sm text-green-800 dark:text-green-300 font-semibold whitespace-pre-wrap break-all">
                    {formatValue(newObj[key])}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unchangedKeys.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground py-2">
            Show {unchangedKeys.length} unchanged field{unchangedKeys.length > 1 ? 's' : ''}
          </summary>
          <div className="border rounded-lg overflow-hidden mt-2">
            {unchangedKeys.map((key, idx) => (
              <div 
                key={key} 
                className={`flex ${idx !== 0 ? 'border-t' : ''} opacity-70`}
              >
                <div className="w-1/3 px-4 py-2 bg-muted font-medium text-sm">
                  {formatFieldName(key)}
                </div>
                <div className="w-2/3 px-4 py-2">
                  <code className="text-sm whitespace-pre-wrap break-all">
                    {formatValue(oldObj[key])}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
