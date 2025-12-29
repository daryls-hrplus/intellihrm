import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertTriangle, CheckCircle2, Clock, Eye } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { useCBAViolations, useUpdateCBAViolation, type CBAViolation } from '@/hooks/useCBAData';

interface CBAViolationsTabProps {
  agreementId: string;
  companyId: string;
}

export function CBAViolationsTab({ agreementId, companyId }: CBAViolationsTabProps) {
  const { t } = useTranslation();
  const { data: violations = [], isLoading } = useCBAViolations(companyId, agreementId);
  const updateViolation = useUpdateCBAViolation();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-500/20 text-blue-600',
      medium: 'bg-yellow-500/20 text-yellow-600',
      high: 'bg-orange-500/20 text-orange-600',
      critical: 'bg-red-500/20 text-red-600',
    };
    return colors[severity] || colors.medium;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-red-500/20 text-red-600',
      under_review: 'bg-yellow-500/20 text-yellow-600',
      resolved: 'bg-green-500/20 text-green-600',
      disputed: 'bg-purple-500/20 text-purple-600',
      escalated: 'bg-orange-500/20 text-orange-600',
    };
    return colors[status] || colors.open;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'resolved': return <CheckCircle2 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (violationId: string, newStatus: string) => {
    updateViolation.mutate({
      id: violationId,
      status: newStatus,
      resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null,
    });
  };

  const filteredViolations = violations.filter(v => 
    statusFilter === 'all' || v.status === statusFilter
  );

  const openCount = violations.filter(v => v.status === 'open').length;
  const reviewCount = violations.filter(v => v.status === 'under_review').length;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <p className="text-muted-foreground">
            {violations.length} violation{violations.length !== 1 ? 's' : ''} detected
          </p>
          {openCount > 0 && (
            <Badge variant="destructive">{openCount} open</Badge>
          )}
          {reviewCount > 0 && (
            <Badge variant="secondary">{reviewCount} under review</Badge>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredViolations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" />
            <p className="text-muted-foreground">
              {statusFilter === 'all' 
                ? 'No CBA violations detected. Great job maintaining compliance!'
                : `No ${statusFilter.replace('_', ' ')} violations`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Rule</TableHead>
              <TableHead>Affected Employee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredViolations.map((violation) => (
              <TableRow key={violation.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{formatDateForDisplay(violation.violation_date)}</p>
                    <p className="text-xs text-muted-foreground">
                      Detected: {new Date(violation.detected_at).toLocaleDateString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getSeverityColor(violation.severity)}>
                    {violation.severity}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <p className="truncate">{violation.description}</p>
                </TableCell>
                <TableCell>
                  {violation.rule?.rule_name || '-'}
                </TableCell>
                <TableCell>
                  {violation.affected_employee?.full_name || '-'}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(violation.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(violation.status)}
                      {violation.status.replace('_', ' ')}
                    </span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select 
                    value={violation.status} 
                    onValueChange={(v) => handleStatusChange(violation.id, v)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="disputed">Disputed</SelectItem>
                      <SelectItem value="escalated">Escalated</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
