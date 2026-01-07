import { Json } from "@/integrations/supabase/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Plus className="h-4 w-4 text-green-600" />
          <span>New record created with the following values:</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Field</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(newObj).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{formatFieldName(key)}</TableCell>
                <TableCell className="text-green-600 dark:text-green-400">
                  <pre className="text-xs whitespace-pre-wrap font-mono bg-green-50 dark:bg-green-950/30 p-2 rounded">
                    {formatValue(value)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // For DELETE actions, only show old values
  if (action === 'DELETE') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Minus className="h-4 w-4 text-red-600" />
          <span>Record deleted with the following values:</span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Field</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(oldObj).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{formatFieldName(key)}</TableCell>
                <TableCell className="text-red-600 dark:text-red-400">
                  <pre className="text-xs whitespace-pre-wrap font-mono bg-red-50 dark:bg-red-950/30 p-2 rounded line-through">
                    {formatValue(value)}
                  </pre>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30">
              {changedKeys.length} field{changedKeys.length > 1 ? 's' : ''} changed
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Field</TableHead>
                <TableHead className="w-5/12">Before</TableHead>
                <TableHead className="w-auto px-2"></TableHead>
                <TableHead className="w-5/12">After</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {changedKeys.map((key) => (
                <TableRow key={key} className="bg-yellow-50/50 dark:bg-yellow-950/10">
                  <TableCell className="font-medium">{formatFieldName(key)}</TableCell>
                  <TableCell>
                    <pre className="text-xs whitespace-pre-wrap font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2 rounded">
                      {formatValue(oldObj[key])}
                    </pre>
                  </TableCell>
                  <TableCell className="px-2">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <pre className="text-xs whitespace-pre-wrap font-mono text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-2 rounded">
                      {formatValue(newObj[key])}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {unchangedKeys.length > 0 && (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Show {unchangedKeys.length} unchanged field{unchangedKeys.length > 1 ? 's' : ''}
          </summary>
          <Table className="mt-2">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unchangedKeys.map((key) => (
                <TableRow key={key} className="opacity-60">
                  <TableCell className="font-medium">{formatFieldName(key)}</TableCell>
                  <TableCell>
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {formatValue(oldObj[key])}
                    </pre>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </details>
      )}
    </div>
  );
}
