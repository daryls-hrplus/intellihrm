import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, FileText, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDateForDisplay } from '@/utils/dateUtils';
import { useCBAClausesByAgreement, useCBARules, useCBAViolations, useCBAAmendments } from '@/hooks/useCBAData';

interface CBAOverviewTabProps {
  agreement: {
    id: string;
    title: string;
    agreement_number: string | null;
    description: string | null;
    effective_date: string;
    expiry_date: string | null;
    status: string;
    wage_provisions: string | null;
    benefits_provisions: string | null;
    working_conditions: string | null;
    unions?: { name: string };
  };
  companyId: string;
}

export function CBAOverviewTab({ agreement, companyId }: CBAOverviewTabProps) {
  const { t } = useTranslation();
  
  const { data: articles = [] } = useCBAClausesByAgreement(agreement.id);
  const { data: rules = [] } = useCBARules(agreement.id);
  const { data: violations = [] } = useCBAViolations(companyId, agreement.id);
  const { data: amendments = [] } = useCBAAmendments(agreement.id);

  const totalClauses = articles.reduce((sum, art) => sum + (art.cba_clauses?.length || 0), 0);
  const activeRules = rules.filter(r => r.is_active).length;
  const openViolations = violations.filter(v => v.status === 'open' || v.status === 'under_review').length;
  const activeAmendments = amendments.filter(a => a.status === 'active').length;

  // Calculate days until expiry
  const daysUntilExpiry = agreement.expiry_date 
    ? Math.ceil((new Date(agreement.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-600',
      active: 'bg-green-500/20 text-green-600',
      expired: 'bg-red-500/20 text-red-600',
      in_negotiation: 'bg-yellow-500/20 text-yellow-600',
      pending_approval: 'bg-blue-500/20 text-blue-600',
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {daysUntilExpiry !== null && daysUntilExpiry <= 90 && daysUntilExpiry > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-700">Agreement Expiring Soon</p>
                <p className="text-sm text-yellow-600">
                  This agreement expires in {daysUntilExpiry} days. Consider starting renewal negotiations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Articles & Clauses</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              {articles.length} / {totalClauses}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {articles.length} articles with {totalClauses} clauses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Enforceable Rules</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Scale className="h-5 w-5 text-muted-foreground" />
              {activeRules} / {rules.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {activeRules} active rules for automation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Compliance Status</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {openViolations === 0 ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              {openViolations === 0 ? 'Compliant' : `${openViolations} Issues`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {violations.length} total violations tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Amendments</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {activeAmendments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Active side letters & amendments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agreement Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agreement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge className={getStatusColor(agreement.status)}>
                {agreement.status.replace('_', ' ')}
              </Badge>
            </div>
            
            {agreement.agreement_number && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Agreement Number</span>
                <span className="font-mono">{agreement.agreement_number}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Union</span>
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {agreement.unions?.name || 'N/A'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Effective Date</span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDateForDisplay(agreement.effective_date)}
              </span>
            </div>
            
            {agreement.expiry_date && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expiry Date</span>
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateForDisplay(agreement.expiry_date)}
                </span>
              </div>
            )}

            {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
              <div className="pt-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Time Remaining</span>
                  <span>{daysUntilExpiry} days</span>
                </div>
                <Progress 
                  value={Math.max(0, Math.min(100, (daysUntilExpiry / 365) * 100))} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Key Provisions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {agreement.wage_provisions && (
              <div>
                <h4 className="text-sm font-medium mb-1">Wage Provisions</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {agreement.wage_provisions}
                </p>
              </div>
            )}
            
            {agreement.benefits_provisions && (
              <div>
                <h4 className="text-sm font-medium mb-1">Benefits</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {agreement.benefits_provisions}
                </p>
              </div>
            )}
            
            {agreement.working_conditions && (
              <div>
                <h4 className="text-sm font-medium mb-1">Working Conditions</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {agreement.working_conditions}
                </p>
              </div>
            )}

            {!agreement.wage_provisions && !agreement.benefits_provisions && !agreement.working_conditions && (
              <p className="text-muted-foreground text-center py-4">
                No provisions documented yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {agreement.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{agreement.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
