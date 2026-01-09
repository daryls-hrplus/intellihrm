import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../manual/components/LearningObjectives';
import { StepByStep, Step } from '../../../manual/components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../manual/components/FieldReferenceTable';
import { BusinessRules, BusinessRule } from '../../../manual/components/BusinessRules';
import { TipCallout, WarningCallout, ComplianceCallout, InfoCallout } from '../../../manual/components/Callout';
import { ScreenshotPlaceholder } from '../../../manual/components/ScreenshotPlaceholder';
import { 
  Users, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Building,
  MapPin,
  Briefcase,
  Filter
} from 'lucide-react';

const learningObjectives = [
  'Design eligibility rules that accurately reflect organizational benefit policies',
  'Configure waiting periods with appropriate calculation methods',
  'Set up employment type and classification-based eligibility',
  'Test and validate eligibility rules before plan activation'
];

const eligibilityCriteria = [
  {
    criterion: 'Employment Type',
    icon: Briefcase,
    description: 'Full-time, Part-time, Temporary, Seasonal',
    examples: ['Full-time only', 'Full-time + Part-time (20+ hours)', 'All employment types']
  },
  {
    criterion: 'Employment Classification',
    icon: Users,
    description: 'Regular, Contract, Consultant, Intern',
    examples: ['Regular employees only', 'Regular + Fixed-term contract', 'Exclude interns']
  },
  {
    criterion: 'Location/Country',
    icon: MapPin,
    description: 'Geographic restrictions on plan eligibility',
    examples: ['US employees only', 'Caribbean region', 'Exclude specific countries']
  },
  {
    criterion: 'Department/Division',
    icon: Building,
    description: 'Organizational unit restrictions',
    examples: ['Corporate only', 'Exclude union employees', 'Sales division only']
  },
  {
    criterion: 'Job Level/Grade',
    icon: Filter,
    description: 'Position-based eligibility',
    examples: ['Manager and above', 'Executive tier', 'All job levels']
  },
  {
    criterion: 'Hours Worked',
    icon: Clock,
    description: 'Minimum work hours requirement',
    examples: ['30+ hours/week', '20+ hours/week', 'No minimum']
  }
];

const waitingPeriodConfigs = [
  {
    name: 'Date of Hire',
    description: 'Eligibility date is hire date + waiting period days',
    example: 'Hired Jan 15 + 30 days = Eligible Feb 14',
    bestFor: 'Simple calculations, immediate coverage after waiting period'
  },
  {
    name: 'First of Month Following',
    description: 'Eligibility begins first of month after hire date + waiting period',
    example: 'Hired Jan 15 + 30 days = Feb 14, Eligible Mar 1',
    bestFor: 'Aligning with carrier billing cycles, cleaner administration'
  },
  {
    name: 'First of Month Following Hire',
    description: 'Eligibility begins first of month after hire date (no additional waiting)',
    example: 'Hired Jan 15 = Eligible Feb 1',
    bestFor: 'Competitive benefit programs, rapid coverage'
  },
  {
    name: 'First of Quarter Following',
    description: 'Eligibility begins first day of next quarter after hire + waiting period',
    example: 'Hired Jan 15 + 30 days = Eligible Apr 1',
    bestFor: 'Quarterly plan administration, simplified enrollment windows'
  }
];

const eligibilityFields: FieldDefinition[] = [
  {
    name: 'Employment Type',
    required: false,
    type: 'Multi-select',
    description: 'Employment types eligible for this plan',
    defaultValue: 'All Types',
    validation: 'At least one type must be selected if filtering'
  },
  {
    name: 'Employment Classification',
    required: false,
    type: 'Multi-select',
    description: 'Employment classifications eligible for this plan',
    defaultValue: 'All Classifications',
    validation: 'At least one classification must be selected if filtering'
  },
  {
    name: 'Eligible Locations',
    required: false,
    type: 'Multi-select',
    description: 'Countries or locations where plan is offered',
    defaultValue: 'All Locations',
    validation: 'Must match configured work locations'
  },
  {
    name: 'Eligible Departments',
    required: false,
    type: 'Multi-select',
    description: 'Departments or divisions eligible for this plan',
    defaultValue: 'All Departments',
    validation: 'Must match configured organizational units'
  },
  {
    name: 'Minimum Hours/Week',
    required: false,
    type: 'Integer',
    description: 'Minimum weekly work hours for eligibility',
    defaultValue: 'None',
    validation: '0-168 hours'
  },
  {
    name: 'Job Level Minimum',
    required: false,
    type: 'Reference',
    description: 'Minimum job level/grade for eligibility',
    defaultValue: 'None',
    validation: 'Must be valid job level in system'
  },
  {
    name: 'Job Level Maximum',
    required: false,
    type: 'Reference',
    description: 'Maximum job level/grade for eligibility',
    defaultValue: 'None',
    validation: 'Must be ≥ minimum if both specified'
  },
  {
    name: 'Waiting Period Days',
    required: true,
    type: 'Integer',
    description: 'Days from hire before eligibility begins',
    defaultValue: '0',
    validation: '0-365 days'
  },
  {
    name: 'Waiting Period Basis',
    required: true,
    type: 'Enum',
    description: 'How waiting period calculates eligibility date',
    defaultValue: 'Date of Hire',
    validation: 'Date of Hire | First of Month Following | First of Quarter'
  },
  {
    name: 'Rehire Waiting Period',
    required: false,
    type: 'Enum',
    description: 'Waiting period treatment for rehired employees',
    defaultValue: 'Full Waiting Period',
    validation: 'Full | Waived if within 30 days | Waived if within 1 year | Always Waived'
  },
  {
    name: 'Age Minimum',
    required: false,
    type: 'Integer',
    description: 'Minimum age for plan eligibility',
    defaultValue: 'None',
    validation: '0-120'
  },
  {
    name: 'Age Maximum',
    required: false,
    type: 'Integer',
    description: 'Maximum age for plan eligibility',
    defaultValue: 'None',
    validation: 'Must be ≥ minimum if both specified'
  }
];

const eligibilityRules: BusinessRule[] = [
  {
    rule: 'Eligibility changes process on effective date',
    enforcement: 'System',
    description: 'When employee data changes (location, hours, classification), system re-evaluates eligibility as of the change effective date.'
  },
  {
    rule: 'ACA affordability threshold applies to medical plans',
    enforcement: 'System',
    description: 'For US medical plans, system flags employees meeting ACA full-time definition (30+ hours/week average) for compliance tracking.'
  },
  {
    rule: 'Waiting period cannot exceed 90 days for ACA purposes',
    enforcement: 'Policy',
    description: 'US medical plans cannot impose waiting periods exceeding 90 days for ACA compliance. System provides warning if exceeded.'
  },
  {
    rule: 'Eligibility must be non-discriminatory',
    enforcement: 'Policy',
    description: 'Eligibility rules should not create prohibited discrimination based on protected characteristics. HR must review custom rules.'
  },
  {
    rule: 'Termination ends eligibility immediately unless COBRA applies',
    enforcement: 'System',
    description: 'System terminates coverage on employment end date. COBRA/continuation events triggered automatically for eligible plans.'
  }
];

const eligibilitySteps: Step[] = [
  {
    title: 'Define Employee Criteria',
    description: 'Select which employee populations are eligible for this plan.',
    substeps: [
      'Choose Employment Types (Full-time, Part-time, etc.)',
      'Select Employment Classifications (Regular, Contract, etc.)',
      'Optionally restrict by Location, Department, or Job Level',
      'Set minimum hours per week if applicable'
    ],
    expectedResult: 'Criteria summary shows number of currently eligible employees'
  },
  {
    title: 'Configure Waiting Period',
    description: 'Set the time between hire and eligibility.',
    substeps: [
      'Enter waiting period in days (0 for immediate eligibility)',
      'Select calculation basis (Date of Hire, First of Month, etc.)',
      'Configure rehire waiting period treatment',
      'Review example calculations displayed in UI'
    ],
    expectedResult: 'Waiting period configuration saved with sample date calculations shown'
  },
  {
    title: 'Set Age Restrictions (if applicable)',
    description: 'Configure age-based eligibility for applicable plans.',
    substeps: [
      'Set minimum age if required by plan (e.g., 21 for some life insurance)',
      'Set maximum age if applicable (e.g., 65 for some disability plans)',
      'Review age discrimination implications with HR/Legal'
    ],
    expectedResult: 'Age criteria added to eligibility rules'
  },
  {
    title: 'Test Eligibility Rules',
    description: 'Validate configuration against actual employee data.',
    substeps: [
      'Click "Preview Eligible Employees" button',
      'Review list of employees who currently meet criteria',
      'Identify any unexpected inclusions or exclusions',
      'Adjust rules as needed and re-test'
    ],
    expectedResult: 'Eligibility preview matches expected employee population'
  }
];

export function PlansEligibility() {
  return (
    <div id="ben-sec-3-4" className="scroll-mt-24 space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">3.4 Eligibility & Waiting Periods</h3>
        <p className="text-muted-foreground">
          Eligibility rules determine which employees can enroll in a benefit plan. Proper 
          configuration ensures the right employees have access to appropriate benefits while 
          maintaining compliance with regulatory requirements.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Eligibility Criteria Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Eligibility Criteria Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eligibilityCriteria.map((criteria, index) => {
              const IconComponent = criteria.icon;
              return (
                <div key={index} className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">{criteria.criterion}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{criteria.description}</p>
                  <div className="space-y-1">
                    {criteria.examples.map((example, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Waiting Period Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Waiting Period Calculation Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {waitingPeriodConfigs.map((config, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="font-medium">{config.name}</div>
                    <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">{config.example}</code>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {config.bestFor}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <InfoCallout title="Eligibility Engine">
        HRplus continuously evaluates employee eligibility based on configured rules. When 
        employee data changes (promotion, location transfer, hours change), the system 
        automatically updates eligibility status and can trigger enrollment or termination 
        workflows.
      </InfoCallout>

      <StepByStep steps={eligibilitySteps} title="Eligibility Configuration Procedure" />

      <ScreenshotPlaceholder 
        alt="Eligibility rule builder showing criteria selection and employee preview"
        caption="Eligibility Rule Builder"
      />

      <FieldReferenceTable fields={eligibilityFields} title="Eligibility Configuration Fields" />

      <BusinessRules rules={eligibilityRules} />

      <ComplianceCallout title="ACA Compliance (US)">
        For US operations, the Affordable Care Act requires employers to offer affordable 
        medical coverage to employees averaging 30+ hours per week. HRplus tracks ACA 
        measurement periods and generates required IRS forms (1094-C, 1095-C). Configure 
        ACA settings in <strong>Benefits → Compliance → ACA Setup</strong>.
      </ComplianceCallout>

      <WarningCallout title="Eligibility Rule Changes">
        Changing eligibility rules on an active plan affects enrollment status. Employees 
        who become ineligible may lose coverage. Always review impact analysis before 
        saving changes to eligibility rules on active plans.
      </WarningCallout>

      <TipCallout title="Rule Testing Best Practice">
        Before activating a new plan, use the "Preview Eligible Employees" feature to 
        validate your eligibility rules. Export the list and have department managers 
        confirm the included employees are correct. This prevents enrollment issues after launch.
      </TipCallout>

      {/* Regional Considerations */}
      <Card>
        <CardHeader>
          <CardTitle>Regional Eligibility Considerations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
              <h4 className="font-medium text-cyan-900 dark:text-cyan-100 mb-2">Caribbean</h4>
              <ul className="text-sm text-cyan-800 dark:text-cyan-200 space-y-1">
                <li>• Multi-island eligibility may require location-specific plans</li>
                <li>• Consider cross-border employment arrangements</li>
                <li>• Local statutory benefits may override plan eligibility</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Africa (Ghana/Nigeria)</h4>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <li>• Statutory benefits (SSNIT, NSITF) apply from Day 1</li>
                <li>• No waiting period allowed for mandatory contributions</li>
                <li>• Expatriate vs. local employee eligibility differences</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
