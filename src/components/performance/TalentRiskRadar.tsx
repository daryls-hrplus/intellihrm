import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Minus,
  Users,
  Brain,
  RefreshCw,
  Shield,
  UserX,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTalentRiskAnalysis } from '@/hooks/useTalentRiskAnalysis';
import { TalentRiskList } from './TalentRiskList';
import { RiskInterventionDialog } from './RiskInterventionDialog';
import { RiskTrendChart } from './RiskTrendChart';

interface TalentRiskRadarProps {
  companyId?: string;
  departmentId?: string;
}

export function TalentRiskRadar({ companyId, departmentId }: TalentRiskRadarProps) {
  const { profile } = useAuth();
  const effectiveCompanyId = companyId || profile?.company_id;
  
  const {
    storedRisks,
    riskSummary,
    interventions,
    isLoadingRisks,
    runAnalysis,
    isAnalyzing
  } = useTalentRiskAnalysis(effectiveCompanyId);

  const [selectedRisk, setSelectedRisk] = useState<typeof storedRisks[0] | null>(null);
  const [showInterventionDialog, setShowInterventionDialog] = useState(false);

  const handleRunAnalysis = () => {
    runAnalysis({ departmentId });
  };

  const getRiskIcon = (category: string) => {
    switch (category) {
      case 'flight_risk': return <UserX className="h-4 w-4" />;
      case 'performance_decline': return <TrendingDown className="h-4 w-4" />;
      case 'disengagement': return <Activity className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with AI Analysis Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Talent Risk Radar</h2>
            <p className="text-sm text-muted-foreground">
              AI-powered risk detection and intervention recommendations
            </p>
          </div>
        </div>
        <Button 
          onClick={handleRunAnalysis} 
          disabled={isAnalyzing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
        </Button>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Assessed</p>
                <p className="text-2xl font-bold">{riskSummary.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">{riskSummary.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">High Risk</p>
                <p className="text-2xl font-bold text-orange-500">{riskSummary.high}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Medium</p>
                <p className="text-2xl font-bold text-yellow-600">{riskSummary.medium}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{riskSummary.low}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Risk Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-40">
                <UserX className="h-4 w-4 text-destructive" />
                <span className="text-sm">Flight Risk</span>
              </div>
              <Progress 
                value={riskSummary.total > 0 ? (riskSummary.byCategory.flight_risk / riskSummary.total) * 100 : 0} 
                className="flex-1"
              />
              <span className="text-sm font-medium w-12 text-right">
                {riskSummary.byCategory.flight_risk}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-40">
                <TrendingDown className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Performance</span>
              </div>
              <Progress 
                value={riskSummary.total > 0 ? (riskSummary.byCategory.performance_decline / riskSummary.total) * 100 : 0} 
                className="flex-1"
              />
              <span className="text-sm font-medium w-12 text-right">
                {riskSummary.byCategory.performance_decline}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-40">
                <Activity className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Disengagement</span>
              </div>
              <Progress 
                value={riskSummary.total > 0 ? (riskSummary.byCategory.disengagement / riskSummary.total) * 100 : 0} 
                className="flex-1"
              />
              <span className="text-sm font-medium w-12 text-right">
                {riskSummary.byCategory.disengagement}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="risks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risks">At-Risk Employees</TabsTrigger>
          <TabsTrigger value="trends">Risk Trends</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
        </TabsList>

        <TabsContent value="risks">
          <TalentRiskList 
            risks={storedRisks || []}
            isLoading={isLoadingRisks}
            onSelectRisk={(risk) => {
              setSelectedRisk(risk);
              setShowInterventionDialog(true);
            }}
            getRiskColor={getRiskColor}
            getRiskIcon={getRiskIcon}
            getTrendIcon={getTrendIcon}
          />
        </TabsContent>

        <TabsContent value="trends">
          <RiskTrendChart companyId={effectiveCompanyId} />
        </TabsContent>

        <TabsContent value="interventions">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Interventions</CardTitle>
            </CardHeader>
            <CardContent>
              {interventions && interventions.length > 0 ? (
                <div className="space-y-3">
                  {interventions.slice(0, 10).map((intervention: any) => (
                    <div 
                      key={intervention.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {intervention.profiles?.first_name} {intervention.profiles?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {intervention.intervention_type}: {intervention.description}
                        </p>
                      </div>
                      <Badge variant={
                        intervention.status === 'completed' ? 'default' :
                        intervention.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {intervention.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No active interventions. Select an at-risk employee to create one.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Intervention Dialog */}
      {selectedRisk && (
        <RiskInterventionDialog
          open={showInterventionDialog}
          onOpenChange={setShowInterventionDialog}
          risk={selectedRisk}
          companyId={effectiveCompanyId}
        />
      )}
    </div>
  );
}
