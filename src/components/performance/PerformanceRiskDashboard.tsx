import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertTriangle, 
  TrendingDown, 
  Award, 
  Clock, 
  Users, 
  RefreshCw,
  ShieldAlert,
  Target,
  Brain,
  MoreVertical,
  CheckCircle,
  Eye,
  FileText,
  UserCheck
} from 'lucide-react';
import { usePerformanceRiskAnalyzer } from '@/hooks/performance/usePerformanceRiskAnalyzer';
import { 
  RISK_TYPE_LABELS, 
  RISK_TYPE_DESCRIPTIONS,
  RISK_LEVEL_BADGE_VARIANTS,
  type PerformanceRiskType,
  type EmployeePerformanceRisk
} from '@/types/performanceRisks';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { ToxicHighPerformerAlert } from './ToxicHighPerformerAlert';
import { SkillsDecayWarning } from './SkillsDecayWarning';
import { formatDistanceToNow } from 'date-fns';

// Internal RiskListItem component
function RiskListItem({ 
  risk, 
  onAcknowledge, 
  onResolve, 
  onCreateIDP 
}: { 
  risk: EmployeePerformanceRisk; 
  onAcknowledge: (id: string) => void;
  onResolve: (params: { riskId: string }) => void;
  onCreateIDP: (params: { riskId: string; interventionType: string }) => void;
}) {
  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={risk.employee?.avatar_url} />
          <AvatarFallback>{getInitials(risk.employee?.full_name || '')}</AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{risk.employee?.full_name || 'Unknown'}</span>
            <Badge variant={RISK_LEVEL_BADGE_VARIANTS[risk.risk_level]}>
              {risk.risk_level}
            </Badge>
            {risk.is_acknowledged && (
              <Badge variant="outline" className="text-xs">Acknowledged</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{RISK_TYPE_LABELS[risk.risk_type]}</span>
            <span>•</span>
            <span>Score: {risk.risk_score?.toFixed(0)}/100</span>
            {risk.consecutive_underperformance_count > 0 && (
              <>
                <span>•</span>
                <span>{risk.consecutive_underperformance_count} consecutive cycles</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Detected {formatDistanceToNow(new Date(risk.first_detected_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {risk.succession_impact !== 'none' && (
          <Badge variant={risk.succession_impact === 'excluded' ? 'destructive' : 'outline'} className="mr-2">
            Succession: {risk.succession_impact}
          </Badge>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            {!risk.is_acknowledged && (
              <DropdownMenuItem onClick={() => onAcknowledge(risk.id)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Acknowledge
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onCreateIDP({ riskId: risk.id, interventionType: 'idp' })}>
              <FileText className="h-4 w-4 mr-2" />
              Create IDP
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onResolve({ riskId: risk.id })} className="text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Resolved
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

interface PerformanceRiskDashboardProps {
  companyId?: string;
}

export function PerformanceRiskDashboard({ companyId }: PerformanceRiskDashboardProps) {
  const {
    risks,
    riskSummary,
    isLoadingRisks,
    analyzing,
    analyzeCompany,
    getHighRisks,
    getCriticalRisks,
    acknowledgeRisk,
    resolveRisk,
    triggerIntervention
  } = usePerformanceRiskAnalyzer({ companyId });

  const criticalRisks = getCriticalRisks();
  const highRisks = getHighRisks();
  const toxicHPRisks = risks.filter(r => r.risk_type === 'toxic_high_performer');
  const skillsDecayRisks = risks.filter(r => r.risk_type === 'skills_decay');

  const getRiskTypeIcon = (type: PerformanceRiskType) => {
    switch (type) {
      case 'chronic_underperformance':
        return <TrendingDown className="h-4 w-4" />;
      case 'skills_decay':
        return <Clock className="h-4 w-4" />;
      case 'toxic_high_performer':
        return <Award className="h-4 w-4" />;
      case 'declining_trend':
        return <TrendingDown className="h-4 w-4" />;
      case 'competency_gap':
        return <Target className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {criticalRisks.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <ShieldAlert className="h-5 w-5" />
            <span className="font-semibold">{criticalRisks.length} Critical Risk{criticalRisks.length > 1 ? 's' : ''} Detected</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Immediate attention required for employees with critical performance risks.
          </p>
        </div>
      )}

      {/* Toxic High Performer Alerts */}
      {toxicHPRisks.length > 0 && (
        <ToxicHighPerformerAlert risks={toxicHPRisks} />
      )}

      {/* Skills Decay Warnings */}
      {skillsDecayRisks.length > 0 && (
        <SkillsDecayWarning risks={skillsDecayRisks} />
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskSummary.total_risks}</div>
            <p className="text-xs text-muted-foreground">
              Across {riskSummary.affected_employees_count} employees
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{riskSummary.by_level.critical}</div>
            <p className="text-xs text-muted-foreground">Immediate action needed</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{riskSummary.by_level.high}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{riskSummary.by_level.medium}</div>
            <p className="text-xs text-muted-foreground">Monitor closely</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{riskSummary.by_level.low}</div>
            <p className="text-xs text-muted-foreground">Awareness only</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Type Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Risk Type Distribution</CardTitle>
              <CardDescription>Breakdown of performance risks by category</CardDescription>
            </div>
            <Button 
              onClick={() => analyzeCompany()} 
              disabled={analyzing || !companyId}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(RISK_TYPE_LABELS).map(([type, label]) => {
              const count = riskSummary.by_type[type as PerformanceRiskType] || 0;
              return (
                <div 
                  key={type} 
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-3">
                    {getRiskTypeIcon(type as PerformanceRiskType)}
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">
                        {RISK_TYPE_DESCRIPTIONS[type as PerformanceRiskType]}
                      </p>
                    </div>
                  </div>
                  <Badge variant={count > 0 ? 'default' : 'secondary'}>
                    {count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="all-risks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-risks">All Risks</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="all-risks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Performance Risk Registry ({risks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRisks ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : risks.length === 0 ? (
                <div className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="text-lg font-medium">No Active Performance Risks</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    All employees are performing within expected parameters
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {risks.map(risk => (
                    <RiskListItem 
                      key={risk.id}
                      risk={risk}
                      onAcknowledge={acknowledgeRisk}
                      onResolve={resolveRisk}
                      onCreateIDP={triggerIntervention}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <PerformanceTrendChart companyId={companyId} />
        </TabsContent>

        <TabsContent value="ai-insights">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Generated Insights
              </CardTitle>
              <CardDescription>
                AI recommendations for addressing performance risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {highRisks.filter(r => r.ai_recommendation).map(risk => (
                  <div key={risk.id} className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={RISK_LEVEL_BADGE_VARIANTS[risk.risk_level]}>
                        {risk.risk_level}
                      </Badge>
                      <span className="font-medium">{risk.employee?.full_name}</span>
                      <span className="text-sm text-muted-foreground">
                        - {RISK_TYPE_LABELS[risk.risk_type]}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{risk.ai_recommendation}</p>
                  </div>
                ))}
                {highRisks.filter(r => r.ai_recommendation).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Run analysis to generate AI insights for high-risk employees
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
