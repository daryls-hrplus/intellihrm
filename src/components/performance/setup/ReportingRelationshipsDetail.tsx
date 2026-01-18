import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Users, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  CheckCircle2,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ReportingRelationshipsSummary } from '@/hooks/useAppraisalReadiness';

interface ReportingRelationshipsDetailProps {
  data: ReportingRelationshipsSummary;
  companyId: string;
}

export function ReportingRelationshipsDetail({ data, companyId }: ReportingRelationshipsDetailProps) {
  const navigate = useNavigate();
  const [showMissing, setShowMissing] = useState(false);
  
  const isHealthy = data.readinessPercent >= 90;
  const isComplete = data.readinessPercent === 100;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Reporting Relationships</CardTitle>
          </div>
          {isComplete ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          ) : (
            <Badge variant="outline" className={cn(
              isHealthy ? 'bg-amber-500/10 text-amber-600 border-amber-200' : 'bg-destructive/10 text-destructive border-destructive/20'
            )}>
              <AlertTriangle className="h-3 w-3 mr-1" />
              {data.missing} Missing
            </Badge>
          )}
        </div>
        <CardDescription>
          Positions must have supervisors assigned for appraisal routing and approval workflows
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{data.total}</div>
            <div className="text-xs text-muted-foreground">Total Positions</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.configured}</div>
            <div className="text-xs text-muted-foreground">Configured</div>
          </div>
          <div className={cn(
            "text-center p-3 rounded-lg",
            data.missing > 0 ? "bg-destructive/10" : "bg-muted/50"
          )}>
            <div className={cn("text-2xl font-bold", data.missing > 0 && "text-destructive")}>
              {data.missing}
            </div>
            <div className="text-xs text-muted-foreground">Missing</div>
          </div>
          <div className={cn(
            "text-center p-3 rounded-lg",
            isComplete ? "bg-green-500/10" : isHealthy ? "bg-amber-500/10" : "bg-destructive/10"
          )}>
            <div className={cn(
              "text-2xl font-bold",
              isComplete ? "text-green-600" : isHealthy ? "text-amber-600" : "text-destructive"
            )}>
              {data.readinessPercent}%
            </div>
            <div className="text-xs text-muted-foreground">Ready</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress 
            value={data.readinessPercent} 
            className={cn(
              "h-2",
              isComplete ? "[&>div]:bg-green-500" : isHealthy ? "[&>div]:bg-amber-500" : "[&>div]:bg-destructive"
            )}
          />
          <p className="text-xs text-muted-foreground text-right">
            {isHealthy ? 
              (isComplete ? 'All positions have reporting lines configured' : 'Nearly complete - review missing positions') :
              'Critical: Many positions missing supervisors'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/admin/positions?company=${companyId}`)}
          >
            <Users className="h-4 w-4 mr-2" />
            View Positions
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/hr-hub/imports/hr-data')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Update Reporting Lines
          </Button>
        </div>

        {/* Missing Positions List */}
        {data.missing > 0 && (
          <Collapsible open={showMissing} onOpenChange={setShowMissing}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>Positions Missing Supervisor ({data.missing})</span>
                {showMissing ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.missingPositions.slice(0, 10).map((position) => (
                      <TableRow key={position.id}>
                        <TableCell className="font-mono text-sm">{position.code}</TableCell>
                        <TableCell>{position.title}</TableCell>
                        <TableCell className="text-muted-foreground">{position.departmentName}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/admin/positions?position=${position.id}`)}
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.missingPositions.length > 10 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground text-sm">
                          +{data.missingPositions.length - 10} more positions
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <strong>Note:</strong> Top-level positions (CEO, Managing Director) may not require a supervisor.
              </p>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
