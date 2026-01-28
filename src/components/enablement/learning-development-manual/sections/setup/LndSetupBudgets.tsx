import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Building2, Calendar } from 'lucide-react';
import { 
  LearningObjectives, 
  FieldReferenceTable,
  StepByStep,
  ConfigurationExample,
  BusinessRules,
  TipCallout,
  InfoCallout,
  ScreenshotPlaceholder,
  type FieldDefinition,
  type Step,
  type ExampleConfig,
  type BusinessRule
} from '@/components/enablement/manual/components';

export function LndSetupBudgets() {
  const learningObjectives = [
    'Configure departmental training budgets',
    'Track allocated vs. spent amounts',
    'Set up fiscal year budget cycles',
    'Monitor budget utilization and forecasting'
  ];

  const budgetFields: FieldDefinition[] = [
    {
      name: 'company_id',
      required: true,
      type: 'uuid',
      description: 'Company scope for budget'
    },
    {
      name: 'department_id',
      required: false,
      type: 'uuid',
      description: 'Department (null = company-wide budget)',
      defaultValue: 'null'
    },
    {
      name: 'fiscal_year',
      required: true,
      type: 'number',
      description: 'Budget fiscal year',
      validation: 'Valid year (e.g., 2024)'
    },
    {
      name: 'allocated_amount',
      required: true,
      type: 'number',
      description: 'Total budget allocation',
      validation: 'Decimal >= 0'
    },
    {
      name: 'spent_amount',
      required: true,
      type: 'number',
      description: 'Amount consumed by approved training',
      defaultValue: '0',
      validation: 'Decimal >= 0'
    },
    {
      name: 'reserved_amount',
      required: false,
      type: 'number',
      description: 'Amount reserved for pending approvals',
      defaultValue: '0'
    },
    {
      name: 'currency',
      required: false,
      type: 'text',
      description: 'Budget currency code',
      defaultValue: 'USD'
    },
    {
      name: 'notes',
      required: false,
      type: 'text',
      description: 'Budget notes and justification'
    },
    {
      name: 'is_active',
      required: true,
      type: 'boolean',
      description: 'Budget active for current fiscal year',
      defaultValue: 'true'
    }
  ];

  const createBudgetSteps: Step[] = [
    {
      title: 'Navigate to Budget Management',
      description: 'Go to Training → Budgets from the main navigation.',
      expectedResult: 'Budget overview displays'
    },
    {
      title: 'Click Create Budget',
      description: 'Click "Add Budget" to create a new training budget.',
      expectedResult: 'Budget creation form opens'
    },
    {
      title: 'Select Scope',
      description: 'Choose company-wide or department-specific budget.',
      substeps: [
        'Company-wide: Leave department empty',
        'Department: Select specific department'
      ]
    },
    {
      title: 'Set Fiscal Year',
      description: 'Enter the fiscal year for this budget.',
      notes: ['Align with company fiscal calendar']
    },
    {
      title: 'Enter Allocation',
      description: 'Set the total budget amount for the year.',
      substeps: [
        'Consider historical spend patterns',
        'Include anticipated training initiatives',
        'Add buffer for unplanned needs'
      ]
    },
    {
      title: 'Set Currency',
      description: 'Select the budget currency.',
      expectedResult: 'Currency set for all budget calculations'
    },
    {
      title: 'Add Notes',
      description: 'Document budget justification and priorities.',
      notes: ['Helpful for year-end reviews and audits']
    },
    {
      title: 'Save Budget',
      description: 'Save and activate the budget.',
      expectedResult: 'Budget available for training cost tracking'
    }
  ];

  const budgetExamples: ExampleConfig[] = [
    {
      title: 'Company-Wide Training Budget',
      context: 'Central budget for cross-departmental training initiatives',
      values: [
        { field: 'Department', value: 'None (company-wide)' },
        { field: 'Fiscal Year', value: '2024' },
        { field: 'Allocation', value: '$150,000 USD' },
        { field: 'Notes', value: 'Covers leadership programs, compliance training' }
      ],
      outcome: 'Central fund for company initiatives, tracked separately from departments'
    },
    {
      title: 'IT Department Budget',
      context: 'Technical training budget for IT team certifications',
      values: [
        { field: 'Department', value: 'Information Technology' },
        { field: 'Fiscal Year', value: '2024' },
        { field: 'Allocation', value: '$45,000 USD' },
        { field: 'Notes', value: 'Cloud certifications, security training, technical courses' }
      ],
      outcome: 'Dedicated IT training fund with department-level tracking'
    },
    {
      title: 'Sales Team Budget',
      context: 'Sales skill development and product training',
      values: [
        { field: 'Department', value: 'Sales' },
        { field: 'Fiscal Year', value: '2024' },
        { field: 'Allocation', value: '$30,000 USD' },
        { field: 'Notes', value: 'Sales methodology training, product launches, conferences' }
      ],
      outcome: 'Sales-specific training tracked against department goals'
    }
  ];

  const budgetRules: BusinessRule[] = [
    {
      rule: 'Training requests check available budget',
      enforcement: 'System',
      description: 'When training request submitted, system validates sufficient budget remains (allocated - spent - reserved).'
    },
    {
      rule: 'Approved requests deduct from budget',
      enforcement: 'System',
      description: 'Approved training costs automatically deducted from appropriate budget (department or company).'
    },
    {
      rule: 'Budget cannot go negative',
      enforcement: 'Policy',
      description: 'Requests exceeding available budget require management approval or budget transfer.'
    },
    {
      rule: 'Fiscal year budgets auto-close',
      enforcement: 'Advisory',
      description: 'Create new budgets for each fiscal year; unspent amounts do not automatically roll over.'
    },
    {
      rule: 'Department budgets roll up to company',
      enforcement: 'System',
      description: 'Company-wide reports aggregate all department budgets for total spend visibility.'
    }
  ];

  return (
    <section id="sec-2-10" data-manual-anchor="sec-2-10" className="space-y-6">
      <h2 className="text-2xl font-bold">2.10 Training Budgets</h2>
      
      <LearningObjectives objectives={learningObjectives} />

      <p className="text-muted-foreground">
        Training budgets enable financial tracking of learning investments at company and 
        department levels. Budget management integrates with training requests to validate 
        spending and provide visibility into training ROI.
      </p>

      <InfoCallout title="Prerequisites">
        Department-level budgets require departments to be configured in the Workforce 
        module. Company fiscal year settings should align with budget year definitions.
      </InfoCallout>

      {/* Budget Overview Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Budget Tracking Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div className="p-4 border rounded-lg text-center">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">$50,000</div>
              <div className="text-muted-foreground">Allocated</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">$32,500</div>
              <div className="text-muted-foreground">Spent (65%)</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold">$5,000</div>
              <div className="text-muted-foreground">Reserved</div>
            </div>
            <div className="p-4 border rounded-lg text-center bg-green-50 dark:bg-green-950/20">
              <div className="text-2xl font-bold text-green-600">$12,500</div>
              <div className="text-muted-foreground">Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={budgetFields} 
        title="training_budgets Table Schema" 
      />

      <StepByStep 
        steps={createBudgetSteps} 
        title="Creating a Training Budget" 
      />

      <ScreenshotPlaceholder 
        caption="Figure 2.10.1: Budget Management Dashboard"
        alt="Training budget overview with allocation, spend, and forecasting"
      />

      <ConfigurationExample 
        examples={budgetExamples}
        title="Budget Configuration Examples"
      />

      <BusinessRules 
        rules={budgetRules}
        title="Budget Management Business Rules"
      />

      <TipCallout title="Budget Planning Best Practices">
        <ul className="space-y-1 mt-2">
          <li>• Base allocations on historical spend plus anticipated initiatives</li>
          <li>• Include 10-15% buffer for unplanned training needs</li>
          <li>• Review utilization quarterly and reallocate as needed</li>
          <li>• Track external vs. internal training costs separately</li>
          <li>• Document ROI metrics for budget justification</li>
        </ul>
      </TipCallout>
    </section>
  );
}
