import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart3,
  Shield,
  Loader2,
  ExternalLink
} from "lucide-react";

interface QuarterlyReport {
  period: string;
  executive_summary: {
    total_ai_interactions: number;
    compliance_score: number;
    risk_score_trend: string;
    key_achievements: string[];
    areas_of_concern: string[];
  };
  risk_management: {
    total_risk_assessments: number;
    high_risk_percentage: number;
    human_review_compliance: number;
    mitigation_effectiveness: number;
  };
  bias_governance: {
    total_incidents: number;
    resolution_rate: number;
    recurring_patterns: string[];
    remediation_actions_taken: number;
  };
  model_registry: {
    total_active_models: number;
    compliant_models: number;
    audits_completed: number;
    audits_overdue: number;
  };
  human_oversight: {
    total_reviews_required: number;
    reviews_completed: number;
    overrides_count: number;
    override_approval_rate: number;
  };
  recommendations: string[];
  compliance_status: 'fully_compliant' | 'partially_compliant' | 'non_compliant';
}

interface GovernanceMetric {
  id: string;
  metric_date: string;
  metric_type: string;
  total_interactions: number | null;
  high_risk_interactions: number | null;
  compliance_rate: number | null;
  bias_incidents_detected: number | null;
  avg_risk_score: number | null;
}

interface CompanyDocument {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export function AIComplianceReportsPanel() {
  // Fetch quarterly reports from ai_governance_metrics
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ['ai-governance-quarterly-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_governance_metrics')
        .select('*')
        .eq('metric_type', 'quarterly_report')
        .order('metric_date', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch governance metrics for trends
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['ai-governance-metrics-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_governance_metrics')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(90);
      
      if (error) throw error;
      return data as GovernanceMetric[];
    }
  });

  const isLoading = reportsLoading || metricsLoading;

  // Calculate summary stats from metrics
  const calculateSummary = () => {
    if (!metrics || metrics.length === 0) {
      return {
        avgCompliance: 0,
        totalInteractions: 0,
        totalBiasIncidents: 0,
        complianceTrend: 'stable' as const
      };
    }

    const dailyMetrics = metrics.filter(m => m.metric_type === 'daily');
    const complianceRates = dailyMetrics
      .map(m => m.compliance_rate)
      .filter((r): r is number => r !== null);
    
    const avgCompliance = complianceRates.length > 0
      ? Math.round(complianceRates.reduce((a, b) => a + b, 0) / complianceRates.length)
      : 0;
    
    const totalInteractions = dailyMetrics.reduce((sum, m) => sum + (m.total_interactions || 0), 0);
    const totalBiasIncidents = dailyMetrics.reduce((sum, m) => sum + (m.bias_incidents_detected || 0), 0);
    
    // Calculate trend from last 30 days vs previous 30 days
    const recentMetrics = dailyMetrics.slice(0, 30);
    const olderMetrics = dailyMetrics.slice(30, 60);
    
    const recentAvg = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + (m.compliance_rate || 0), 0) / recentMetrics.length
      : 0;
    const olderAvg = olderMetrics.length > 0
      ? olderMetrics.reduce((sum, m) => sum + (m.compliance_rate || 0), 0) / olderMetrics.length
      : recentAvg;
    
    let complianceTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.05) complianceTrend = 'improving';
    else if (recentAvg < olderAvg * 0.95) complianceTrend = 'declining';
    
    return { avgCompliance, totalInteractions, totalBiasIncidents, complianceTrend };
  };

  const summary = calculateSummary();

  const parseReportContent = (content: string): QuarterlyReport | null => {
    try {
      return JSON.parse(content);
    } catch {
      return null;
    }
  };

  const getComplianceStatusBadge = (status: string) => {
    switch (status) {
      case 'fully_compliant':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" /> Fully Compliant</Badge>;
      case 'partially_compliant':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20"><AlertTriangle className="h-3 w-3 mr-1" /> Partially Compliant</Badge>;
      case 'non_compliant':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Non-Compliant</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'declining':
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          AI Compliance Reports
        </CardTitle>
        <CardDescription>
          ISO 42001 quarterly reports and compliance gap analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="checklist" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                ISO 42001 Checklist
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Avg Compliance</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-bold">{summary.avgCompliance}%</span>
                      {getTrendIcon(summary.complianceTrend)}
                    </div>
                    <Progress value={summary.avgCompliance} className="mt-2" />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Total Interactions</div>
                    <div className="text-2xl font-bold mt-1">{summary.totalInteractions.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">Last 90 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Bias Incidents</div>
                    <div className="text-2xl font-bold mt-1">{summary.totalBiasIncidents}</div>
                    <p className="text-xs text-muted-foreground mt-1">Detected this period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Reports Generated</div>
                    <div className="text-2xl font-bold mt-1">{reports?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Quarterly reports</p>
                  </CardContent>
                </Card>
              </div>

              {/* Latest Report Summary */}
              {reports && reports.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Latest Report: {reports[0].metric_date}</span>
                      {getComplianceStatusBadge(
                        (reports[0].compliance_rate || 0) >= 90 ? 'fully_compliant' :
                        (reports[0].compliance_rate || 0) >= 70 ? 'partially_compliant' : 'non_compliant'
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Compliance Score</span>
                        <p className="text-xl font-bold">{reports[0].compliance_rate || 0}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Interactions</span>
                        <p className="text-xl font-bold">{reports[0].total_interactions || 0}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">High Risk</span>
                        <p className="text-xl font-bold">{reports[0].high_risk_interactions || 0}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bias Incidents</span>
                        <p className="text-xl font-bold">{reports[0].bias_incidents_detected || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              {reports && reports.length > 0 ? (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary opacity-70" />
                        <div>
                          <h4 className="font-medium">Quarterly Report - {report.metric_date}</h4>
                          <p className="text-sm text-muted-foreground">
                            Generated {format(new Date(report.created_at || report.metric_date), "MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getComplianceStatusBadge(
                          (report.compliance_rate || 0) >= 90 ? 'fully_compliant' :
                          (report.compliance_rate || 0) >= 70 ? 'partially_compliant' : 'non_compliant'
                        )}
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No quarterly reports generated yet</p>
                  <p className="text-sm">Reports are generated automatically at the start of each quarter</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="checklist" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ISO 42001 Compliance Checklist</CardTitle>
                  <CardDescription>Key requirements for AI Management System compliance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { clause: '5.1', title: 'Leadership & Commitment', status: 'compliant', description: 'AI governance dashboard established' },
                      { clause: '6.1', title: 'Risk Assessment', status: 'compliant', description: 'Automated risk scoring on all AI interactions' },
                      { clause: '6.3', title: 'Bias Prevention', status: 'compliant', description: 'Bias detection and incident tracking active' },
                      { clause: '7.2', title: 'Competence', status: 'partial', description: 'Training records for AI operators needed' },
                      { clause: '8.2', title: 'AI Model Lifecycle', status: 'compliant', description: 'Model registry with audit tracking' },
                      { clause: '9.1', title: 'Monitoring & Measurement', status: 'compliant', description: 'Daily, weekly, monthly automated monitoring' },
                      { clause: '9.2', title: 'Internal Audit', status: 'compliant', description: 'Monthly audit checks scheduled' },
                      { clause: '9.3', title: 'Management Review', status: 'compliant', description: 'Quarterly reports auto-generated' },
                      { clause: '10.2', title: 'Nonconformity & Corrective Action', status: 'compliant', description: 'Incident tracking and remediation workflow' }
                    ].map((item) => (
                      <div key={item.clause} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.status === 'compliant' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          )}
                          <div>
                            <span className="font-medium">Clause {item.clause}: {item.title}</span>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <Badge variant={item.status === 'compliant' ? 'default' : 'secondary'}>
                          {item.status === 'compliant' ? 'Met' : 'Partial'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}