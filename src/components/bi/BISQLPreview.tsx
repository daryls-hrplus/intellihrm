import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Play, 
  Loader2, 
  Code2, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BISQLPreviewProps {
  sql: string;
  onSQLChange?: (sql: string) => void;
  module?: string;
  widgetConfig?: Record<string, unknown>;
}

interface PreviewResult {
  success: boolean;
  data: Record<string, unknown>[];
  columns: string[];
  rowCount: number;
  error?: string;
}

export function BISQLPreview({ sql, onSQLChange, module, widgetConfig }: BISQLPreviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewResult, setPreviewResult] = useState<PreviewResult | null>(null);

  const executePreview = async () => {
    if (!sql?.trim()) {
      toast.error('No SQL query to preview');
      return;
    }

    setIsLoading(true);
    setPreviewResult(null);

    try {
      // Use RPC to execute the SQL safely (limit to 10 rows for preview)
      const limitedSql = sql.replace(/;\s*$/, '').trim();
      const previewSql = `SELECT * FROM (${limitedSql}) AS preview_data LIMIT 10`;

      const { data, error } = await supabase.rpc('execute_report_sql', {
        sql_query: previewSql
      });

      if (error) {
        setPreviewResult({
          success: false,
          data: [],
          columns: [],
          rowCount: 0,
          error: error.message
        });
        return;
      }

      const results = (data || []) as Record<string, unknown>[];
      const columns = results.length > 0 ? Object.keys(results[0]) : [];

      setPreviewResult({
        success: true,
        data: results,
        columns,
        rowCount: results.length
      });

      toast.success(`Preview loaded: ${results.length} rows`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to execute SQL';
      setPreviewResult({
        success: false,
        data: [],
        columns: [],
        rowCount: 0,
        error: message
      });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSQL = async () => {
    if (!widgetConfig) {
      toast.error('No widget configuration available');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('bi-ai-assistant', {
        body: {
          action: 'generate_sql',
          prompt: JSON.stringify(widgetConfig),
          module: module || 'general',
          dataSources: [],
          currentConfig: widgetConfig
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Failed to generate SQL');

      const result = data.result;
      if (result.sql && onSQLChange) {
        onSQLChange(result.sql);
        toast.success('SQL generated! Click Preview to test it.');
      }
    } catch (error) {
      console.error('Generate SQL error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate SQL');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4" />
            SQL Preview
          </div>
          <div className="flex gap-2">
            {widgetConfig && onSQLChange && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateSQL}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3 mr-1" />
                )}
                Generate SQL
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={executePreview}
              disabled={isLoading || !sql?.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              Preview
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sql && (
          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto max-h-32 font-mono">
            {sql}
          </pre>
        )}

        {previewResult && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {previewResult.success ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Query executed successfully</span>
                  <Badge variant="secondary">{previewResult.rowCount} rows</Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">Query failed</span>
                </>
              )}
            </div>

            {previewResult.error && (
              <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                {previewResult.error}
              </div>
            )}

            {previewResult.success && previewResult.data.length > 0 && (
              <ScrollArea className="h-48 border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewResult.columns.map(col => (
                        <TableHead key={col} className="text-xs font-medium">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewResult.data.map((row, i) => (
                      <TableRow key={i}>
                        {previewResult.columns.map(col => (
                          <TableCell key={col} className="text-xs py-1">
                            {formatValue(row[col])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}

            {previewResult.success && previewResult.data.length === 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                Query returned no results
              </div>
            )}
          </div>
        )}

        {!sql && !previewResult && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Add a custom SQL query to preview the data
          </div>
        )}
      </CardContent>
    </Card>
  );
}
