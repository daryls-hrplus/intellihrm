import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../manual/components/LearningObjectives';
import { FieldReferenceTable, FieldDefinition } from '../../../manual/components/FieldReferenceTable';
import { ConfigurationExample, ExampleConfig } from '../../../manual/components/ConfigurationExample';
import { BusinessRules, BusinessRule } from '../../../manual/components/BusinessRules';
import { TipCallout, WarningCallout, ComplianceCallout, InfoCallout } from '../../../manual/components/Callout';
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  Layers, 
  ArrowRight,
  Building,
  User,
  Wallet
} from 'lucide-react';

const learningObjectives = [
  'Configure flat amount, percentage, and tiered contribution structures',
  'Set up employer and employee cost sharing correctly',
  'Apply pre-tax and post-tax treatment appropriately',
  'Integrate contributions with payroll processing cycles'
];

const contributionTypes = [
  {
    type: 'Flat Amount',
    icon: DollarSign,
    description: 'Fixed dollar/currency amount per period regardless of salary',
    bestFor: 'Standard benefit plans with uniform pricing',
    example: '$150/month employee, $350/month employer',
    pros: ['Simple to understand', 'Predictable costs', 'Easy budgeting'],
    cons: ['May be regressive for lower-paid employees', 'Doesn\'t scale with salary']
  },
  {
    type: 'Percentage of Salary',
    icon: Percent,
    description: 'Contribution calculated as percentage of base salary or total compensation',
    bestFor: 'Retirement plans, statutory contributions, income-proportional benefits',
    example: '6% employee + 6% employer match on 401(k)',
    pros: ['Scales with income', 'Equitable across salary levels', 'Common for pensions'],
    cons: ['Variable employer costs', 'May need caps for high earners']
  },
  {
    type: 'Tiered Structure',
    icon: Layers,
    description: 'Different contribution amounts based on salary bands, tenure, or other criteria',
    bestFor: 'Organizations wanting progressive benefit costs',
    example: 'Band A: $100, Band B: $150, Band C: $200 employee contribution',
    pros: ['Flexible cost allocation', 'Can address equity concerns', 'Incentivizes tenure'],
    cons: ['More complex to administer', 'Requires clear tier definitions']
  }
];

const contributionFields: FieldDefinition[] = [
  {
    name: 'Contribution Type',
    required: true,
    type: 'Enum',
    description: 'How contribution amounts are calculated',
    validation: 'Flat Amount | Percentage | Tiered'
  },
  {
    name: 'Employee Amount',
    required: true,
    type: 'Currency/Percent',
    description: 'Employee\'s share of the premium/contribution',
    defaultValue: '0',
    validation: 'Must be ≥ 0, type matches Contribution Type'
  },
  {
    name: 'Employer Amount',
    required: true,
    type: 'Currency/Percent',
    description: 'Employer\'s share of the premium/contribution',
    defaultValue: '0',
    validation: 'Must be ≥ 0, type matches Contribution Type'
  },
  {
    name: 'Frequency',
    required: true,
    type: 'Enum',
    description: 'How often contributions are deducted/applied',
    defaultValue: 'Per Pay Period',
    validation: 'Per Pay Period | Monthly | Annual'
  },
  {
    name: 'Pre-Tax Treatment',
    required: true,
    type: 'Boolean',
    description: 'Whether employee contributions are pre-tax (Section 125)',
    defaultValue: 'true',
    validation: 'Must be false for post-tax benefits (Roth, certain life insurance)'
  },
  {
    name: 'Salary Basis',
    required: false,
    type: 'Enum',
    description: 'Salary component used for percentage calculations',
    defaultValue: 'Base Salary',
    validation: 'Base Salary | Total Compensation | Custom Definition'
  },
  {
    name: 'Annual Maximum',
    required: false,
    type: 'Currency',
    description: 'Cap on annual contributions (employee or combined)',
    validation: 'Must align with IRS/regulatory limits where applicable'
  },
  {
    name: 'Employer Match Formula',
    required: false,
    type: 'Formula',
    description: 'Employer matching structure for retirement plans',
    validation: 'Valid formula syntax (e.g., "100% of first 3% + 50% of next 2%")'
  },
  {
    name: 'Imputed Income Threshold',
    required: false,
    type: 'Currency',
    description: 'Coverage amount above which employer cost becomes taxable income',
    defaultValue: '$50,000',
    validation: 'Per IRS regulations for group term life'
  }
];

const businessRules: BusinessRule[] = [
  {
    rule: 'Contribution frequency must align with payroll frequency',
    enforcement: 'System',
    description: 'If payroll runs bi-weekly, contributions must be configured for bi-weekly deduction. System validates alignment during plan setup.'
  },
  {
    rule: 'Pre-tax contributions require Section 125 plan document',
    enforcement: 'Policy',
    description: 'Employer must have a valid cafeteria plan (Section 125) in place. HR must verify documentation before enabling pre-tax treatment.'
  },
  {
    rule: 'Percentage contributions must have salary basis defined',
    enforcement: 'System',
    description: 'When Contribution Type is Percentage, the Salary Basis field becomes required. System prevents saving without selection.'
  },
  {
    rule: 'Employer match formulas must not exceed IRS annual limits',
    enforcement: 'System',
    description: 'For 401(k) and similar plans, system validates projected contributions against annual limits ($23,000 employee + $46,000 employer for 2024).'
  },
  {
    rule: 'Imputed income applies to group term life over $50,000',
    enforcement: 'System',
    description: 'Employer-paid life insurance coverage exceeding $50,000 generates imputed income. System calculates and reports to payroll.'
  },
  {
    rule: 'Statutory contributions must meet minimum percentages',
    enforcement: 'System',
    description: 'For SSNIT (Ghana), NSITF (Nigeria), and other mandatory schemes, system enforces minimum contribution percentages per regulation.'
  }
];

const configurationExamples: ExampleConfig[] = [
  {
    title: 'Standard Medical - 80/20 Split',
    context: 'Employer pays 80% of premium, employee pays 20%',
    values: [
      { field: 'Contribution Type', value: 'Flat Amount' },
      { field: 'EE Only - Employee', value: '$100/month' },
      { field: 'EE Only - Employer', value: '$400/month' },
      { field: 'Family - Employee', value: '$300/month' },
      { field: 'Family - Employer', value: '$1,200/month' },
      { field: 'Frequency', value: 'Per Pay Period (24 periods/year)' },
      { field: 'Pre-Tax', value: 'Yes (Section 125)' }
    ],
    outcome: 'Employee sees bi-weekly deductions of $50 (EE Only) or $150 (Family). Pre-tax reduces taxable income.'
  },
  {
    title: '401(k) with Tiered Match',
    context: 'Employer matches 100% of first 3% + 50% of next 2%',
    values: [
      { field: 'Contribution Type', value: 'Percentage' },
      { field: 'Salary Basis', value: 'Total Compensation' },
      { field: 'Employee Contribution', value: 'Employee elected (0-15%)' },
      { field: 'Employer Match Formula', value: '100% of 0-3% + 50% of 3-5%' },
      { field: 'Annual Maximum (EE)', value: '$23,000' },
      { field: 'Annual Maximum (Combined)', value: '$69,000' },
      { field: 'Pre-Tax', value: 'Yes (Traditional) / No (Roth)' }
    ],
    outcome: 'Employee contributing 5% on $100,000 salary = $5,000/year. Employer match = $4,000 (3% × 100% + 2% × 50%).'
  },
  {
    title: 'Ghana SSNIT Mandatory',
    context: 'Statutory social security contribution in Ghana',
    values: [
      { field: 'Contribution Type', value: 'Percentage' },
      { field: 'Salary Basis', value: 'Basic Salary' },
      { field: 'Employee Contribution', value: '5.5%' },
      { field: 'Employer Contribution', value: '13%' },
      { field: 'Frequency', value: 'Monthly' },
      { field: 'Pre-Tax', value: 'N/A (Statutory)' },
      { field: 'Reporting', value: 'SSNIT Contribution Schedule' }
    ],
    outcome: 'Total 18.5% contribution split per SSNIT regulations. Monthly remittance report generated automatically.'
  }
];

export function PlansContributions() {
  return (
    <div id="ben-sec-3-3" className="scroll-mt-24 space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">3.3 Contribution Configuration</h3>
        <p className="text-muted-foreground">
          Contribution configuration determines how benefit costs are shared between employer 
          and employee. HRplus supports multiple contribution structures to accommodate different 
          benefit types and regional requirements.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      {/* Contribution Type Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Contribution Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {contributionTypes.map((ct, index) => {
            const IconComponent = ct.icon;
            return (
              <div key={index} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{ct.type}</h4>
                      <Badge variant="outline">{ct.bestFor}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{ct.description}</p>
                    <div className="flex items-center gap-2 text-sm bg-muted/50 rounded px-3 py-1.5">
                      <code className="text-xs">{ct.example}</code>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Advantages</span>
                        <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {ct.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Considerations</span>
                        <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          {ct.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Cost Sharing Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Contribution Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-4 p-6 bg-muted/50 rounded-lg">
            <div className="text-center p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
              <User className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="font-medium text-sm">Employee</div>
              <div className="text-xs text-muted-foreground">Pre-tax deduction</div>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="text-center p-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
              <Building className="h-8 w-8 mx-auto text-emerald-600 mb-2" />
              <div className="font-medium text-sm">Employer</div>
              <div className="text-xs text-muted-foreground">Payroll processing</div>
            </div>
            <ArrowRight className="h-6 w-6 text-muted-foreground" />
            <div className="text-center p-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
              <Wallet className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="font-medium text-sm">Carrier/Fund</div>
              <div className="text-xs text-muted-foreground">Premium remittance</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Contributions flow from employee payroll deductions and employer funding to carriers 
            or retirement fund administrators per configured frequency.
          </p>
        </CardContent>
      </Card>

      <FieldReferenceTable 
        fields={contributionFields} 
        title="Contribution Configuration Fields" 
      />

      <ComplianceCallout title="Tax Treatment Compliance">
        Pre-tax treatment requires a valid Section 125 cafeteria plan (US) or equivalent 
        arrangement. Consult with tax advisors when configuring pre-tax benefits. For 
        international operations, tax treatment varies by country and benefit type.
      </ComplianceCallout>

      <BusinessRules rules={businessRules} />

      <ConfigurationExample 
        examples={configurationExamples}
        title="Contribution Configuration Scenarios"
      />

      <WarningCallout title="Mid-Year Changes">
        Changing contribution amounts for active plans affects all enrolled employees. 
        Schedule contribution changes to coincide with payroll periods to avoid partial 
        deductions. Use the "Contribution Change Effective Date" field to schedule future changes.
      </WarningCallout>

      <TipCallout title="Payroll Integration">
        Configure contribution amounts using the same frequency as your payroll system. 
        HRplus automatically calculates per-period amounts if you enter annual or monthly 
        figures. Use the Payroll Integration settings to map benefit deduction codes to 
        your payroll system.
      </TipCallout>

      <InfoCallout title="AI Cost Forecasting">
        Enable AI Cost Forecasting to project annual benefit costs based on current enrollment 
        and contribution configurations. The system analyzes historical trends and workforce 
        demographics to provide budget projections with confidence intervals.
      </InfoCallout>
    </div>
  );
}
