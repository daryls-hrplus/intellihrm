import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../components/FieldReferenceTable';
import { StepByStep, Step } from '../../../components/StepByStep';
import { BusinessRules, BusinessRule } from '../../../components/BusinessRules';
import { 
  Shield, 
  Settings, 
  ChevronRight, 
  CheckCircle,
  Info,
  AlertTriangle,
  TrendingDown,
  Clock,
  UserMinus,
  Plane
} from 'lucide-react';

export function PositionRiskAssessment() {
  const keyPositionRiskFields: FieldDefinition[] = [
    { name: 'id', required: true, type: 'UUID', description: 'Primary key, auto-generated', validation: 'System-assigned' },
    { name: 'company_id', required: true, type: 'UUID', description: 'Reference to company', validation: 'Must be valid company' },
    { name: 'position_id', required: true, type: 'UUID', description: 'Reference to job/position record', validation: 'Must be key position' },
    { name: 'is_key_position', required: true, type: 'Boolean', description: 'Confirmation that position is key', defaultValue: 'true' },
    { name: 'criticality_level', required: true, type: 'Text', description: 'Business criticality level', defaultValue: 'medium', validation: 'low, medium, high, critical' },
    { name: 'vacancy_risk', required: true, type: 'Text', description: 'Risk level of position becoming vacant', defaultValue: 'medium', validation: 'low, medium, high' },
    { name: 'impact_if_vacant', required: false, type: 'Text', description: 'Description of business impact if position becomes vacant' },
    { name: 'current_incumbent_id', required: false, type: 'UUID', description: 'Reference to current employee in position' },
    { name: 'retirement_risk', required: false, type: 'Text', description: 'Risk of retirement within planning horizon', validation: 'none, low, medium, high' },
    { name: 'flight_risk', required: false, type: 'Text', description: 'Risk of voluntary departure', validation: 'none, low, medium, high' },
    { name: 'market_competitiveness', required: false, type: 'Text', description: 'How competitive is compensation vs. market', validation: 'below, at, above' },
    { name: 'risk_notes', required: false, type: 'Text', description: 'Additional risk factors and mitigation notes' },
    { name: 'last_assessed_at', required: false, type: 'Timestamp', description: 'When risk was last assessed' },
    { name: 'assessed_by', required: false, type: 'UUID', description: 'User who performed assessment' },
    { name: 'created_at', required: true, type: 'Timestamp', description: 'Record creation timestamp', defaultValue: 'now()' },
    { name: 'updated_at', required: true, type: 'Timestamp', description: 'Last modification timestamp', defaultValue: 'now()' }
  ];

  const assessRiskSteps: Step[] = [
    {
      title: 'Access Position Risk Assessment',
      description: 'Navigate to the risk assessment interface.',
      substeps: [
        'Go to Performance → Succession → Key Positions',
        'Click on a key position to open details',
        'Navigate to the "Risk Assessment" tab or section'
      ],
      expectedResult: 'Risk assessment form is displayed for the position'
    },
    {
      title: 'Set Criticality Level',
      description: 'Evaluate the business criticality of the position.',
      substeps: [
        'Review the criticality level options: Low, Medium, High, Critical',
        'Consider strategic importance, revenue impact, and operational dependency',
        'Select the appropriate criticality level'
      ],
      notes: [
        'Critical: C-suite, revenue-generating executives, unique expertise',
        'High: Senior management, key technical leaders',
        'Medium: Mid-management, specialized roles',
        'Low: Support functions with available successors'
      ],
      expectedResult: 'Criticality level is set with appropriate classification'
    },
    {
      title: 'Assess Vacancy Risk',
      description: 'Determine the likelihood of the position becoming vacant.',
      substeps: [
        'Review current incumbent tenure and career trajectory',
        'Consider retirement timeline, competitive offers, and engagement signals',
        'Select vacancy risk level: Low, Medium, High'
      ],
      expectedResult: 'Vacancy risk is assessed based on incumbent factors'
    },
    {
      title: 'Evaluate Retirement Risk',
      description: 'Assess the retirement risk for the current incumbent.',
      substeps: [
        'Review incumbent age and years of service',
        'Check if retirement conversations have occurred',
        'Consider pension eligibility and retirement benefits',
        'Select retirement risk level: None, Low, Medium, High'
      ],
      notes: [
        'High retirement risk typically within 2 years',
        'Medium retirement risk within 3-5 years',
        'Integrate with workforce planning data if available'
      ],
      expectedResult: 'Retirement risk is documented'
    },
    {
      title: 'Assess Flight Risk',
      description: 'Evaluate the risk of voluntary departure.',
      substeps: [
        'Review recent performance ratings and engagement scores',
        'Consider market demand for the role and skills',
        'Check compensation competitiveness',
        'Select flight risk level: None, Low, Medium, High'
      ],
      expectedResult: 'Flight risk is assessed and documented'
    },
    {
      title: 'Document Impact and Notes',
      description: 'Capture the business impact and additional risk factors.',
      substeps: [
        'Describe the business impact if the position becomes vacant',
        'Note any specific risk factors or mitigation strategies',
        'Include relevant context for succession planning',
        'Save the risk assessment'
      ],
      expectedResult: 'Complete risk assessment is saved with documentation'
    }
  ];

  const riskLevelDefinitions = [
    { level: 'Critical', color: 'bg-red-500', description: 'Position is essential to business survival. Vacancy would cause significant disruption or revenue loss within days.' },
    { level: 'High', color: 'bg-orange-500', description: 'Position is crucial to major business functions. Vacancy would impact operations within weeks.' },
    { level: 'Medium', color: 'bg-amber-500', description: 'Position is important but has some coverage. Vacancy would require adjustments but not crisis response.' },
    { level: 'Low', color: 'bg-green-500', description: 'Position is supportive. Vacancy could be managed through redistribution or external hire.' }
  ];

  const vacancyRiskFactors = [
    { factor: 'Retirement Proximity', icon: Clock, description: 'How close is incumbent to retirement eligibility or stated retirement date?' },
    { factor: 'Flight Risk Signals', icon: Plane, description: 'Is incumbent being recruited? Low engagement? Recent compensation concerns?' },
    { factor: 'Market Demand', icon: TrendingDown, description: 'Is this skillset in high demand with limited talent supply?' },
    { factor: 'Incumbent Tenure', icon: UserMinus, description: 'Long tenure may indicate stability; short tenure may signal fit issues.' }
  ];

  const businessRules: BusinessRule[] = [
    { rule: 'Key position required', enforcement: 'System', description: 'Risk assessment can only be created for positions marked as key.' },
    { rule: 'One assessment per position', enforcement: 'System', description: 'Each position has a single risk assessment record; updates replace previous values.' },
    { rule: 'Incumbent reference optional', enforcement: 'System', description: 'Position may be vacant; current_incumbent_id can be null.' },
    { rule: 'Assessment audit trail', enforcement: 'System', description: 'All changes logged with timestamp and assessor ID.' },
    { rule: 'Annual review recommended', enforcement: 'Policy', description: 'Risk assessments should be reviewed at least annually or upon incumbent change.' },
    { rule: 'Feeds calculated risk', enforcement: 'System', description: 'Risk assessment values contribute to succession plan calculated_risk_level.' }
  ];

  return (
    <section id="sec-6-3" data-manual-anchor="sec-6-3" className="scroll-mt-32 space-y-6">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">6.3 Position Risk Assessment</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Evaluate criticality, vacancy risk, and impact for key positions
        </p>
      </div>

      {/* Learning Objectives */}
      <LearningObjectives
        objectives={[
          'Apply the 4-level criticality scale to key positions',
          'Assess vacancy risk factors including retirement and flight risk',
          'Document business impact for succession planning prioritization',
          'Interpret risk assessment data for succession plan targeting'
        ]}
      />

      {/* Navigation Path */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4 text-primary" />
            <span className="font-medium">Navigation:</span>
            <Badge variant="outline">Performance</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Succession</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="outline">Key Positions</Badge>
            <ChevronRight className="h-3 w-3" />
            <Badge variant="secondary">Risk Assessment</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Criticality Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            Criticality Level Definitions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Criticality levels help prioritize succession planning efforts. Higher criticality 
            positions should have more robust succession coverage.
          </p>

          <div className="space-y-3">
            {riskLevelDefinitions.map((level) => (
              <div key={level.level} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-3 h-3 rounded-full ${level.color} flex-shrink-0 mt-1`} />
                <div>
                  <h5 className="font-medium text-sm">{level.level}</h5>
                  <p className="text-xs text-muted-foreground">{level.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vacancy Risk Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Vacancy Risk Factors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Multiple factors contribute to the likelihood of a position becoming vacant. 
            Consider all relevant factors when assessing vacancy risk.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {vacancyRiskFactors.map((item) => (
              <div key={item.factor} className="p-3 border rounded-lg flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h5 className="font-medium text-sm">{item.factor}</h5>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-primary" />
            key_position_risks Table Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FieldReferenceTable fields={keyPositionRiskFields} />
        </CardContent>
      </Card>

      {/* Step-by-Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-primary" />
            Assess Position Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StepByStep steps={assessRiskSteps} title="" />
        </CardContent>
      </Card>

      {/* Risk Matrix Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingDown className="h-5 w-5 text-primary" />
            Risk Priority Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Combine criticality and vacancy risk to prioritize succession planning efforts. 
            Focus first on positions in the upper-right quadrant.
          </p>

          {/* Matrix Visualization */}
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-4">
              <div className="p-2 bg-muted text-xs font-medium text-center border-b border-r">Vacancy Risk ↓</div>
              <div className="p-2 bg-muted text-xs font-medium text-center border-b border-r">Low Criticality</div>
              <div className="p-2 bg-muted text-xs font-medium text-center border-b border-r">Medium Criticality</div>
              <div className="p-2 bg-muted text-xs font-medium text-center border-b">High/Critical</div>
              
              <div className="p-2 bg-muted text-xs font-medium text-center border-r">High</div>
              <div className="p-3 bg-amber-100 dark:bg-amber-950/30 text-xs text-center border-r">Medium Priority</div>
              <div className="p-3 bg-orange-100 dark:bg-orange-950/30 text-xs text-center border-r">High Priority</div>
              <div className="p-3 bg-red-100 dark:bg-red-950/30 text-xs text-center font-medium">URGENT</div>
              
              <div className="p-2 bg-muted text-xs font-medium text-center border-r">Medium</div>
              <div className="p-3 bg-green-100 dark:bg-green-950/30 text-xs text-center border-r">Monitor</div>
              <div className="p-3 bg-amber-100 dark:bg-amber-950/30 text-xs text-center border-r">Medium Priority</div>
              <div className="p-3 bg-orange-100 dark:bg-orange-950/30 text-xs text-center">High Priority</div>
              
              <div className="p-2 bg-muted text-xs font-medium text-center border-r">Low</div>
              <div className="p-3 bg-green-100 dark:bg-green-950/30 text-xs text-center border-r">Low Priority</div>
              <div className="p-3 bg-green-100 dark:bg-green-950/30 text-xs text-center border-r">Monitor</div>
              <div className="p-3 bg-amber-100 dark:bg-amber-950/30 text-xs text-center">Medium Priority</div>
            </div>
          </div>

          <div className="p-3 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 rounded-r-lg">
            <p className="text-sm text-foreground flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Priority Action:</strong> Positions marked URGENT should have succession 
                plans with at least one "Ready Now" candidate. High Priority positions should have 
                plans with candidates in the development pipeline.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <BusinessRules rules={businessRules} />

      {/* Best Practices */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-800 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            Risk Assessment Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              'Reassess risk quarterly for high-criticality positions',
              'Update risk assessment when incumbent changes or announces retirement',
              'Involve managers in flight risk assessment as they have direct visibility',
              'Document specific risk factors, not just levels, to guide mitigation',
              'Integrate with compensation data to identify market competitiveness issues',
              'Use risk data to prioritize succession planning and development investments'
            ].map((practice, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>{practice}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
