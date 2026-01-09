import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LearningObjectives } from '../../../manual/components/LearningObjectives';
import { StepByStep, Step } from '../../../manual/components/StepByStep';
import { FieldReferenceTable, FieldDefinition } from '../../../manual/components/FieldReferenceTable';
import { ConfigurationExample, ExampleConfig } from '../../../manual/components/ConfigurationExample';
import { WarningCallout, TipCallout, SecurityCallout } from '../../../manual/components/Callout';
import { ScreenshotPlaceholder } from '../../../manual/components/ScreenshotPlaceholder';
import { FileText, Settings, CheckCircle } from 'lucide-react';

const learningObjectives = [
  'Navigate the plan creation wizard from start to finish',
  'Configure all required and optional plan fields correctly',
  'Understand plan status lifecycle and activation requirements',
  'Apply configuration patterns for different plan types'
];

const planCreationSteps: Step[] = [
  {
    title: 'Access Plan Management',
    description: 'Navigate to Benefits Administration → Plan Management from the main menu.',
    substeps: [
      'Ensure you have Benefits Administrator role permissions',
      'Click "Create New Plan" button in the top action bar',
      'Select the plan category (Medical, Dental, Vision, etc.)'
    ],
    expectedResult: 'Plan creation wizard opens with category pre-selected'
  },
  {
    title: 'Enter Basic Plan Information',
    description: 'Complete the Plan Details section with identifying information.',
    substeps: [
      'Enter unique Plan Code (e.g., MED-PPO-2024-STD)',
      'Enter Plan Name for employee display',
      'Select Plan Type from category-specific options',
      'Choose Carrier/Provider from configured providers',
      'Enter Plan Year dates (typically calendar or fiscal year)',
      'Set Description for employee communications'
    ],
    expectedResult: 'Basic information validated with no errors'
  },
  {
    title: 'Configure Eligibility Rules',
    description: 'Define who can enroll in this plan.',
    substeps: [
      'Select eligible Employee Types (Full-time, Part-time, etc.)',
      'Set Employment Classifications (Regular, Contract, etc.)',
      'Define Location restrictions if applicable',
      'Set Department or Cost Center restrictions',
      'Configure Job Level/Grade eligibility if needed'
    ],
    expectedResult: 'Eligibility criteria defined, employee count preview shown'
  },
  {
    title: 'Set Waiting Periods',
    description: 'Configure enrollment waiting period rules.',
    substeps: [
      'Set New Hire waiting period (e.g., 30, 60, 90 days)',
      'Choose waiting period basis (Date of Hire or First of Month)',
      'Configure rehire waiting period rules',
      'Set life event waiting periods if different from new hire'
    ],
    expectedResult: 'Waiting periods configured with example calculation displayed'
  },
  {
    title: 'Define Coverage Levels',
    description: 'Configure the coverage tiers available for this plan.',
    substeps: [
      'Enable coverage levels (Employee Only, EE+Spouse, EE+Child(ren), Family)',
      'Set coverage level display names if customizing',
      'Configure dependent eligibility per coverage level',
      'Set maximum dependents per coverage level if applicable'
    ],
    expectedResult: 'Coverage matrix displayed with enabled tiers highlighted'
  },
  {
    title: 'Configure Contributions',
    description: 'Set up employer and employee cost sharing.',
    substeps: [
      'Choose contribution structure (Flat Amount, Percentage, Tiered)',
      'Enter Employee contribution amounts per coverage level',
      'Enter Employer contribution amounts per coverage level',
      'Set contribution frequency (per pay period, monthly, annual)',
      'Configure pre-tax/post-tax treatment'
    ],
    expectedResult: 'Contribution summary table populated with all amounts'
  },
  {
    title: 'Add Plan Documents',
    description: 'Upload required plan documentation.',
    substeps: [
      'Upload Summary Plan Description (SPD)',
      'Upload Summary of Benefits and Coverage (SBC) if applicable',
      'Add carrier benefit booklet or certificate',
      'Upload any supplemental documentation'
    ],
    expectedResult: 'Documents attached and viewable in plan record'
  },
  {
    title: 'Configure Enrollment Settings',
    description: 'Set enrollment behavior and restrictions.',
    substeps: [
      'Set default enrollment option (Opt-in vs Auto-enroll)',
      'Configure evidence of insurability requirements',
      'Set guarantee issue limits if applicable',
      'Configure beneficiary requirements'
    ],
    expectedResult: 'Enrollment settings saved and validated'
  },
  {
    title: 'Review and Activate',
    description: 'Validate configuration and set plan status.',
    substeps: [
      'Review configuration summary for accuracy',
      'Run validation check to identify any issues',
      'Resolve any validation warnings or errors',
      'Set plan status to Active (or keep as Draft for testing)'
    ],
    expectedResult: 'Plan created with selected status, confirmation message displayed'
  }
];

const planFields: FieldDefinition[] = [
  {
    name: 'Plan Code',
    required: true,
    type: 'String',
    description: 'Unique identifier for the plan, used in integrations and reporting',
    validation: 'Alphanumeric, hyphens allowed, 5-20 characters, must be unique'
  },
  {
    name: 'Plan Name',
    required: true,
    type: 'String',
    description: 'Display name shown to employees during enrollment',
    validation: 'Max 100 characters'
  },
  {
    name: 'Plan Type',
    required: true,
    type: 'Enum',
    description: 'Classification determining plan behavior and compliance rules',
    validation: 'Must match category selection'
  },
  {
    name: 'Carrier',
    required: true,
    type: 'Reference',
    description: 'Insurance carrier or plan administrator',
    validation: 'Must be active provider in system'
  },
  {
    name: 'Plan Year Start',
    required: true,
    type: 'Date',
    description: 'First day of the plan year',
    validation: 'Cannot overlap with existing plan year for same plan code'
  },
  {
    name: 'Plan Year End',
    required: true,
    type: 'Date',
    description: 'Last day of the plan year',
    validation: 'Must be after Plan Year Start'
  },
  {
    name: 'Effective Date',
    required: true,
    type: 'Date',
    description: 'Date plan becomes available for enrollment',
    defaultValue: 'Plan Year Start',
    validation: 'Must be within plan year'
  },
  {
    name: 'Description',
    required: false,
    type: 'Text',
    description: 'Detailed description for employee communications',
    defaultValue: 'None',
    validation: 'Max 2000 characters, HTML supported'
  },
  {
    name: 'Waiting Period Days',
    required: true,
    type: 'Integer',
    description: 'Days before new hire is eligible',
    defaultValue: '0',
    validation: '0-365'
  },
  {
    name: 'Waiting Period Basis',
    required: true,
    type: 'Enum',
    description: 'How waiting period is calculated',
    defaultValue: 'Date of Hire',
    validation: 'Date of Hire | First of Month Following'
  },
  {
    name: 'Auto Enroll',
    required: false,
    type: 'Boolean',
    description: 'Automatically enroll eligible employees',
    defaultValue: 'false',
    validation: 'Requires default coverage level if true'
  },
  {
    name: 'Evidence of Insurability',
    required: false,
    type: 'Boolean',
    description: 'Requires EOI for enrollment above certain amounts',
    defaultValue: 'false',
    validation: 'Requires EOI threshold configuration if true'
  },
  {
    name: 'Guarantee Issue Amount',
    required: false,
    type: 'Currency',
    description: 'Maximum coverage amount without EOI',
    defaultValue: 'None',
    validation: 'Required if EOI is enabled'
  },
  {
    name: 'Requires Beneficiary',
    required: false,
    type: 'Boolean',
    description: 'Beneficiary designation required for enrollment',
    defaultValue: 'false',
    validation: 'Recommended true for life/AD&D plans'
  },
  {
    name: 'Status',
    required: true,
    type: 'Enum',
    description: 'Plan lifecycle status',
    defaultValue: 'Draft',
    validation: 'Draft | Active | Inactive | Archived'
  }
];

const configurationExamples: ExampleConfig[] = [
  {
    title: 'Medical PPO - Standard Tier',
    context: 'Mid-size US company offering PPO medical with 30-day waiting period',
    values: [
      { field: 'Plan Code', value: 'MED-PPO-2024-STD' },
      { field: 'Plan Type', value: 'Medical (PPO)' },
      { field: 'Waiting Period', value: '30 days, First of Month Following' },
      { field: 'Coverage Levels', value: 'EE, EE+SP, EE+CH, FAM' },
      { field: 'Contribution Type', value: 'Flat Amount per Pay Period' },
      { field: 'Auto Enroll', value: 'false' }
    ],
    outcome: 'Employees can elect PPO coverage starting first of month after 30 days from hire. Four coverage tiers with bi-weekly payroll deductions.'
  },
  {
    title: 'Caribbean Group Health Scheme',
    context: 'Regional organization with employees across multiple Caribbean islands',
    values: [
      { field: 'Plan Code', value: 'GRP-HLTH-2024-CAR' },
      { field: 'Plan Type', value: 'Group Health Scheme' },
      { field: 'Waiting Period', value: '0 days, Date of Hire' },
      { field: 'Coverage Levels', value: 'Single, Family' },
      { field: 'Contribution Type', value: 'Percentage of Salary' },
      { field: 'Eligible Locations', value: 'Jamaica, Barbados, Trinidad' }
    ],
    outcome: 'Immediate coverage for employees across three islands. Simplified two-tier structure with income-based contributions.'
  },
  {
    title: 'Nigerian Tier 2 Pension',
    context: 'Nigerian subsidiary setting up mandatory pension contributions',
    values: [
      { field: 'Plan Code', value: 'PEN-T2-2024-NGA' },
      { field: 'Plan Type', value: 'Pension Plan (Statutory)' },
      { field: 'Waiting Period', value: '0 days' },
      { field: 'Coverage Levels', value: 'Employee Only' },
      { field: 'Employee Contribution', value: '8% of Basic + Housing + Transport' },
      { field: 'Employer Contribution', value: '10% of Basic + Housing + Transport' },
      { field: 'Auto Enroll', value: 'true' }
    ],
    outcome: 'All employees auto-enrolled per PenCom regulations. 18% total contribution split between employee and employer.'
  }
];

export function PlansCreation() {
  return (
    <div id="ben-sec-3-2" className="scroll-mt-24 space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">3.2 Plan Creation Wizard</h3>
        <p className="text-muted-foreground">
          The plan creation wizard guides administrators through comprehensive plan configuration. 
          Each plan type has specific requirements, but the workflow remains consistent across 
          all benefit categories.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Plan Creation Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Creating a benefit plan involves configuring eligibility rules, coverage options, 
            contribution structures, and enrollment settings. Plans can be created as drafts 
            for testing before activation.
          </p>
          <ScreenshotPlaceholder 
            alt="Plan creation wizard showing step navigation and form fields"
          />
        </CardContent>
      </Card>

      <WarningCallout title="Plan Code Immutability">
        Once a plan is created, the Plan Code cannot be changed. Plan codes are used in 
        carrier integrations, payroll feeds, and historical reporting. Choose a consistent 
        naming convention before creating plans.
      </WarningCallout>

      <StepByStep 
        steps={planCreationSteps} 
        title="Plan Creation Procedure" 
      />

      <FieldReferenceTable 
        fields={planFields} 
        title="Plan Configuration Fields" 
      />

      <ConfigurationExample 
        examples={configurationExamples}
        title="Plan Configuration Scenarios"
      />

      <SecurityCallout title="Access Control">
        Plan creation and modification requires the <strong>Benefits Administrator</strong> role. 
        All plan changes are logged in the audit trail with the user, timestamp, and before/after 
        values. Changes to active plans may require approval workflow depending on configuration.
      </SecurityCallout>

      <TipCallout title="Draft Plans for Testing">
        Create plans in Draft status to test eligibility rules and contribution calculations 
        before making them available to employees. Use the "Preview Eligible Employees" 
        function to validate your configuration.
      </TipCallout>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Plan Activation Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Required Before Activation</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  All required fields completed
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  At least one coverage level enabled
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Contribution amounts configured
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Carrier/Provider assigned
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Recommended Before Activation</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Plan documents uploaded
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Eligibility rules tested
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Contribution calculations verified
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Carrier integration tested
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
