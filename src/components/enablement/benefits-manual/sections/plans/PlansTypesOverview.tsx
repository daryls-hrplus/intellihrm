import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LearningObjectives } from '../../../manual/components/LearningObjectives';
import { TipCallout, ComplianceCallout, InfoCallout } from '../../../manual/components/Callout';
import { 
  Heart, 
  Stethoscope, 
  Eye, 
  Smile, 
  Wallet, 
  Shield, 
  Umbrella,
  Users,
  Globe,
  Building2
} from 'lucide-react';

const learningObjectives = [
  'Understand the complete taxonomy of benefit plan types available in HRplus',
  'Identify which plan types are appropriate for different employee populations',
  'Recognize regional variations in plan structures across Caribbean, Africa, and global markets',
  'Map organizational benefit strategy to HRplus plan type configuration'
];

const planTypeCategories = [
  {
    category: 'Health & Medical',
    icon: Heart,
    iconColor: 'text-red-500',
    types: [
      { name: 'Medical (PPO)', description: 'Preferred Provider Organization with network flexibility', regions: ['Global'] },
      { name: 'Medical (HMO)', description: 'Health Maintenance Organization with primary care focus', regions: ['North America'] },
      { name: 'Medical (EPO)', description: 'Exclusive Provider Organization - in-network only', regions: ['North America'] },
      { name: 'Medical (HDHP)', description: 'High Deductible Health Plan, HSA-compatible', regions: ['North America'] },
      { name: 'Group Health Scheme', description: 'Employer-sponsored group coverage', regions: ['Caribbean', 'Africa'] },
      { name: 'National Health Insurance', description: 'Government-mandated health coverage supplement', regions: ['Ghana', 'Nigeria'] }
    ]
  },
  {
    category: 'Ancillary Benefits',
    icon: Stethoscope,
    iconColor: 'text-blue-500',
    types: [
      { name: 'Dental (PPO)', description: 'Preferred provider dental with out-of-network options', regions: ['Global'] },
      { name: 'Dental (DMO)', description: 'Dental Maintenance Organization - assigned dentist', regions: ['North America'] },
      { name: 'Vision', description: 'Eye exams, glasses, contacts coverage', regions: ['Global'] },
      { name: 'Hearing', description: 'Hearing exams and hearing aid coverage', regions: ['Global'] }
    ]
  },
  {
    category: 'Financial Protection',
    icon: Shield,
    iconColor: 'text-emerald-500',
    types: [
      { name: 'Life Insurance (Basic)', description: 'Employer-paid life coverage, typically 1-2x salary', regions: ['Global'] },
      { name: 'Life Insurance (Supplemental)', description: 'Employee-purchased additional coverage', regions: ['Global'] },
      { name: 'AD&D', description: 'Accidental Death & Dismemberment coverage', regions: ['Global'] },
      { name: 'Short-Term Disability', description: 'Income replacement for temporary disabilities', regions: ['North America', 'Caribbean'] },
      { name: 'Long-Term Disability', description: 'Extended income protection for prolonged disabilities', regions: ['North America', 'Caribbean'] },
      { name: 'Critical Illness', description: 'Lump sum payment upon diagnosis of covered conditions', regions: ['Global'] }
    ]
  },
  {
    category: 'Spending Accounts',
    icon: Wallet,
    iconColor: 'text-amber-500',
    types: [
      { name: 'FSA (Healthcare)', description: 'Pre-tax healthcare expense account, use-or-lose', regions: ['North America'] },
      { name: 'FSA (Dependent Care)', description: 'Pre-tax childcare/eldercare expense account', regions: ['North America'] },
      { name: 'HSA', description: 'Health Savings Account with investment options', regions: ['North America'] },
      { name: 'HRA', description: 'Health Reimbursement Arrangement, employer-funded', regions: ['North America'] },
      { name: 'Commuter Benefits', description: 'Pre-tax transit and parking expenses', regions: ['North America'] }
    ]
  },
  {
    category: 'Retirement & Savings',
    icon: Umbrella,
    iconColor: 'text-purple-500',
    types: [
      { name: '401(k)', description: 'Tax-advantaged retirement savings with employer match', regions: ['North America'] },
      { name: 'Pension Plan', description: 'Defined benefit retirement plan', regions: ['Global'] },
      { name: 'SSNIT', description: 'Social Security & National Insurance Trust contributions', regions: ['Ghana'] },
      { name: 'NSITF', description: 'Nigeria Social Insurance Trust Fund contributions', regions: ['Nigeria'] },
      { name: 'NHF', description: 'National Housing Fund contributions', regions: ['Nigeria'] },
      { name: 'Provident Fund', description: 'Employer-employee contributory savings scheme', regions: ['Caribbean', 'Africa'] }
    ]
  },
  {
    category: 'Wellness & Lifestyle',
    icon: Smile,
    iconColor: 'text-pink-500',
    types: [
      { name: 'Wellness Program', description: 'Health incentives, gym memberships, wellness activities', regions: ['Global'] },
      { name: 'EAP', description: 'Employee Assistance Program - counseling and support', regions: ['Global'] },
      { name: 'Tuition Reimbursement', description: 'Education assistance for degree programs', regions: ['Global'] },
      { name: 'Legal Services', description: 'Pre-paid legal assistance coverage', regions: ['North America'] },
      { name: 'Pet Insurance', description: 'Coverage for veterinary expenses', regions: ['North America'] }
    ]
  }
];

const regionBadgeColors: Record<string, string> = {
  'Global': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'North America': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  'Caribbean': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  'Africa': 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  'Ghana': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  'Nigeria': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
};

export function PlansTypesOverview() {
  return (
    <div id="ben-sec-3-1" className="scroll-mt-24 space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-2">3.1 Plan Type Taxonomy</h3>
        <p className="text-muted-foreground">
          HRplus supports a comprehensive range of benefit plan types designed to meet the needs of 
          diverse workforces across multiple regions. Understanding the full taxonomy enables strategic 
          benefit program design.
        </p>
      </div>

      <LearningObjectives objectives={learningObjectives} />

      <InfoCallout title="Multi-Region Support">
        HRplus plan types are designed to accommodate regional variations in benefit structures, 
        compliance requirements, and carrier relationships. A single organization can configure 
        different plan types for employees in different countries while maintaining unified 
        administration.
      </InfoCallout>

      {/* Plan Type Categories */}
      <div className="space-y-6">
        {planTypeCategories.map((category, index) => {
          const IconComponent = category.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`p-2 rounded-lg bg-muted ${category.iconColor}`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  {category.category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.types.map((type, typeIndex) => (
                    <div 
                      key={typeIndex} 
                      className="flex items-start justify-between gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{type.name}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {type.description}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {type.regions.map((region, regionIndex) => (
                          <Badge 
                            key={regionIndex} 
                            variant="secondary"
                            className={`text-xs ${regionBadgeColors[region] || ''}`}
                          >
                            {region}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Regional Considerations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Regional Plan Type Considerations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-cyan-600" />
                <span className="font-medium text-cyan-900 dark:text-cyan-100">Caribbean</span>
              </div>
              <ul className="text-sm text-cyan-800 dark:text-cyan-200 space-y-1">
                <li>• Multi-island group schemes common</li>
                <li>• Hurricane/catastrophe riders important</li>
                <li>• Cross-border coverage considerations</li>
                <li>• Limited carrier options per island</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-amber-900 dark:text-amber-100">Ghana</span>
              </div>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <li>• SSNIT mandatory for all employees</li>
                <li>• Tier 2 pension scheme required</li>
                <li>• Tier 3 voluntary provident funds</li>
                <li>• NHIS integration available</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-emerald-900 dark:text-emerald-100">Nigeria</span>
              </div>
              <ul className="text-sm text-emerald-800 dark:text-emerald-200 space-y-1">
                <li>• NSITF mandatory contributions</li>
                <li>• NHF for housing benefits</li>
                <li>• PFA pension administration</li>
                <li>• Group life minimum 3x salary</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <ComplianceCallout title="Regional Compliance">
        Each plan type must be configured according to the regulatory requirements of the operating 
        region. HRplus includes built-in compliance rules for statutory benefit requirements in 
        supported countries. Review <strong>Chapter 7: Analytics & Reporting</strong> for compliance 
        reporting capabilities.
      </ComplianceCallout>

      <TipCallout title="Strategic Planning">
        When designing your benefit program, start by mapping your workforce demographics (age, 
        location, family status) to identify which plan types will deliver the most value. 
        HRplus AI can analyze your employee population and recommend optimal plan type combinations.
      </TipCallout>
    </div>
  );
}
