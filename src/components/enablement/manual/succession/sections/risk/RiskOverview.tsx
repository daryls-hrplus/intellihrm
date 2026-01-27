import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { 
  Shield, 
  Target, 
  ArrowRight,
  Info,
  TrendingDown,
  Users,
  AlertTriangle,
  LineChart,
  Settings,
  CheckCircle
} from 'lucide-react';

export function RiskOverview() {
  const chapterObjectives = [
    'Understand the operational risk management framework and its role in succession planning',
    'Distinguish between configuration (Ch 6) and operational execution (Ch 7)',
    'Navigate the complete risk lifecycle: identify, assess, monitor, mitigate, review',
    'Apply industry-standard risk terminology (Oracle HCM, SAP SuccessFactors patterns)'
  ];

  const crossModuleDependencies = [
    { module: 'Chapter 3: Nine-Box', dependency: 'Talent signal mappings feed risk prediction', direction: 'inbound' },
    { module: 'Chapter 6: Succession Plans', dependency: 'Position risk assessment configuration', direction: 'inbound' },
    { module: 'Chapter 10: Analytics', dependency: 'Risk metrics and trend visualization', direction: 'outbound' },
    { module: 'Compensation Module', dependency: 'Market competitiveness data', direction: 'inbound' },
    { module: 'Performance Module', dependency: 'Engagement and rating signals', direction: 'inbound' },
    { module: 'Learning Module', dependency: 'Development intervention tracking', direction: 'outbound' },
  ];

  return (
    <section id="sec-7-1" data-manual-anchor="sec-7-1" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">7.1 Risk Management Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Framework introduction, chapter scope, and cross-module dependencies
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives objectives={chapterObjectives} />

      {/* Chapter Focus */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertTitle>Chapter 7 Focus: Operational Risk Management</AlertTitle>
        <AlertDescription>
          <p className="mt-2 text-sm">
            This chapter focuses on <strong>day-to-day risk management operations</strong> — the 
            workflows, governance, and actions that HR practitioners execute to proactively manage 
            talent risk. For configuration and setup, refer to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>Chapter 6.3:</strong> Position Risk Assessment (key_position_risks table setup)</li>
            <li><strong>Chapter 10.4:</strong> Flight Risk & Retention Analytics (reporting and metrics)</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Risk Management Framework */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Risk Management Framework
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The operational risk management lifecycle follows a five-stage continuous process:
          </p>

          {/* Risk Lifecycle Stages */}
          <div className="flex flex-wrap items-center justify-center gap-2 p-4 border rounded-lg bg-muted/30">
            {[
              { stage: '1. Identify', icon: AlertTriangle, color: 'bg-red-500' },
              { stage: '2. Assess', icon: Target, color: 'bg-orange-500' },
              { stage: '3. Monitor', icon: LineChart, color: 'bg-amber-500' },
              { stage: '4. Mitigate', icon: Shield, color: 'bg-blue-500' },
              { stage: '5. Review', icon: Settings, color: 'bg-green-500' },
            ].map((item, index, arr) => (
              <div key={item.stage} className="flex items-center gap-2">
                <div className={`px-3 py-2 rounded-lg ${item.color} text-white flex items-center gap-2`}>
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.stage}</span>
                </div>
                {index < arr.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[
              { stage: 'Identify', desc: 'Detect risk signals from performance, engagement, and market data', section: '7.3, 7.5' },
              { stage: 'Assess', desc: 'Evaluate severity using Risk of Loss × Impact of Loss matrix', section: '7.2, 7.3' },
              { stage: 'Monitor', desc: 'Track risk indicators and review cadence compliance', section: '7.5, 7.6' },
              { stage: 'Mitigate', desc: 'Execute retention actions and development interventions', section: '7.4, 7.7' },
              { stage: 'Review', desc: 'Conduct governance reviews and update assessments', section: '7.6' },
              { stage: 'Predict', desc: 'Leverage AI for early warning and proactive intervention', section: '7.8' },
            ].map((item) => (
              <div key={item.stage} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-medium text-sm">{item.stage}</h5>
                  <Badge variant="outline" className="text-xs">§{item.section}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cross-Module Dependencies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Cross-Module Dependencies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Risk management integrates data from multiple modules to provide comprehensive risk intelligence:
          </p>

          <div className="space-y-3">
            {crossModuleDependencies.map((dep, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <Badge 
                  variant={dep.direction === 'inbound' ? 'default' : 'secondary'}
                  className="w-20 justify-center"
                >
                  {dep.direction === 'inbound' ? '← Input' : 'Output →'}
                </Badge>
                <div className="flex-1">
                  <h5 className="font-medium text-sm">{dep.module}</h5>
                  <p className="text-xs text-muted-foreground">{dep.dependency}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-primary" />
            Risk Management KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { metric: 'High/Critical Risk Rate', target: '< 15%', desc: 'Percentage of assessed employees at high/critical flight risk' },
              { metric: 'Retention Action Coverage', target: '≥ 90%', desc: 'High-risk employees with documented retention actions' },
              { metric: 'Assessment Currency', target: '≥ 80%', desc: 'Assessments updated within 90 days' },
              { metric: 'Successor Flight Risk', target: '< 10%', desc: 'Succession candidates at elevated flight risk' },
            ].map((kpi) => (
              <div key={kpi.metric} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-medium text-sm">{kpi.metric}</h5>
                  <Badge className="bg-green-500/20 text-green-700">{kpi.target}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{kpi.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chapter Structure */}
      <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-blue-800 dark:text-blue-300">
            <Info className="h-5 w-5" />
            Chapter 7 Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              { section: '7.1', title: 'Risk Management Overview', focus: 'Framework & dependencies' },
              { section: '7.2', title: 'Risk Terminology & Standards', focus: 'Industry definitions' },
              { section: '7.3', title: 'Flight Risk Assessment Workflow', focus: 'Operational procedures' },
              { section: '7.4', title: 'Retention Strategy & Action Planning', focus: 'Intervention management' },
              { section: '7.5', title: 'Position Vacancy Risk Monitoring', focus: 'Position-level tracking' },
              { section: '7.6', title: 'Risk Review Cadence & Governance', focus: 'Review cycles & roles' },
              { section: '7.7', title: 'Risk Mitigation Playbooks', focus: 'Response templates' },
              { section: '7.8', title: 'AI-Assisted Risk Prediction', focus: 'Predictive analytics' },
              { section: '7.9', title: 'Cross-Module Risk Integration', focus: 'Integration touchpoints' },
              { section: '7.10', title: 'Risk Management Troubleshooting', focus: 'Common issues & FAQs' },
            ].map((item) => (
              <div key={item.section} className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="w-12 justify-center">{item.section}</Badge>
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">— {item.focus}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Industry Alignment */}
      <Alert variant="default">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Industry Alignment</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><strong>Oracle HCM:</strong> Risk of Loss × Impact of Loss dual-axis framework</li>
            <li><strong>SAP SuccessFactors:</strong> Retention risk matrix prioritization</li>
            <li><strong>Workday:</strong> Proactive retention action workflows</li>
            <li><strong>SHRM:</strong> Quarterly talent risk review recommendations</li>
          </ul>
        </AlertDescription>
      </Alert>
    </section>
  );
}
