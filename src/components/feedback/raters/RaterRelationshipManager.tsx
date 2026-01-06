import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, AlertTriangle } from 'lucide-react';

interface RaterRelationship {
  id: string;
  request_id: string;
  relationship_type: string;
  confidence_weight: number;
  interaction_frequency: string;
  relationship_duration_months: number;
  created_at: string;
}

interface RaterException {
  id: string;
  request_id: string;
  exception_type: string;
  reason: string;
  handled_by: string | null;
  handled_at: string | null;
  created_at: string;
}

interface RaterRelationshipManagerProps {
  employeeId: string;
  companyId: string;
  cycleId?: string;
}

export function RaterRelationshipManager({
  employeeId,
  companyId,
  cycleId,
}: RaterRelationshipManagerProps) {
  const queryClient = useQueryClient();
  const [isExceptionOpen, setIsExceptionOpen] = useState(false);

  const { data: relationships, isLoading } = useQuery({
    queryKey: ['rater-relationships', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rater_relationships')
        .select('*')
        .order('relationship_type');
      if (error) throw error;
      return data as RaterRelationship[];
    },
  });

  const { data: exceptions } = useQuery({
    queryKey: ['rater-exceptions', employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rater_exceptions')
        .select('*');
      if (error) throw error;
      return data as RaterException[];
    },
  });

  const byType = relationships?.reduce((acc, r) => {
    if (!acc[r.relationship_type]) acc[r.relationship_type] = [];
    acc[r.relationship_type].push(r);
    return acc;
  }, {} as Record<string, RaterRelationship[]>) || {};

  const getRelationshipLabel = (type: string) => {
    const labels: Record<string, string> = {
      manager: 'Manager',
      direct_report: 'Direct Reports',
      peer: 'Peers',
      cross_functional: 'Cross-Functional',
      external: 'External',
      skip_level: 'Skip-Level',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Rater Relationships</h3>
          <p className="text-sm text-muted-foreground">
            Manage who provides feedback for this employee
          </p>
        </div>
        <Dialog open={isExceptionOpen} onOpenChange={setIsExceptionOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Exceptions
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Exceptions</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {exceptions?.map((exc) => (
                <div key={exc.id} className="p-2 bg-muted rounded text-sm">
                  <div className="font-medium">{exc.exception_type}</div>
                  <div className="text-muted-foreground">{exc.reason}</div>
                </div>
              )) || <p className="text-muted-foreground text-sm">No exceptions</p>}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byType).map(([type, raters]) => (
            <Card key={type}>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">
                  {getRelationshipLabel(type)} ({raters.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {raters.map((rel) => (
                      <TableRow key={rel.id}>
                        <TableCell className="font-mono text-xs">
                          {rel.request_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>{rel.interaction_frequency}</TableCell>
                        <TableCell>{rel.relationship_duration_months} months</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {(rel.confidence_weight * 100).toFixed(0)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
