import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Layers, 
  GitBranch, 
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Building2,
  Heart,
  Shield,
  Percent,
  Clock,
  FileText
} from 'lucide-react';

export function BenefitsOverviewCoreConcepts() {
  const dataModelLevels = [
    {
      level: 1,
      name: 'Benefit Category',
      description: 'Top-level classification of benefit types',
      examples: ['Medical Insurance', 'Dental Insurance', 'Vision', 'Life Insurance', 'Retirement', 'HSA/FSA'],
      icon: Layers,
      color: 'bg-blue-500',
    },
    {
      level: 2,
      name: 'Benefit Provider',
      description: 'Insurance carriers or administrators',
      examples: ['Guardian Life', 'Aetna', 'Blue Cross', 'MetLife', 'Fidelity', 'Cigna'],
      icon: Building2,
      color: 'bg-purple-500',
    },
    {
      level: 3,
      name: 'Benefit Plan',
      description: 'Specific offering with terms and rates',
      examples: ['Gold PPO Medical', 'Basic Dental', 'Vision Plus', '401(k) Traditional'],
      icon: FileText,
      color: 'bg-emerald-500',
    },
    {
      level: 4,
      name: 'Enrollment',
      description: 'Employee participation in a plan',
      examples: ['John Doe enrolled in Gold PPO', 'Coverage: Employee + Family'],
      icon: Users,
      color: 'bg-amber-500',
    },
    {
      level: 5,
      name: 'Claim',
      description: 'Reimbursement or service request',
      examples: ['Medical expense claim', 'Prescription reimbursement', 'FSA claim'],
      icon: DollarSign,
      color: 'bg-rose-500',
    },
  ];

  const terminologyDeepDive = [
    {
      term: 'Benefit Category',
      definition: 'A top-level grouping that classifies types of benefits offered by the organization.',
      example: 'Medical Insurance, Dental Insurance, Life Insurance, Retirement',
      relatedEntities: 'Providers, Plans',
      icon: Layers,
    },
    {
      term: 'Benefit Provider',
      definition: 'The insurance carrier, third-party administrator, or financial institution that administers the benefit.',
      example: 'Guardian Life for group life insurance, Fidelity for 401(k)',
      relatedEntities: 'Categories, Plans, Contracts',
      icon: Building2,
    },
    {
      term: 'Benefit Plan',
      definition: 'A specific benefit offering with defined coverage terms, contribution rates, and eligibility rules.',
      example: 'Gold PPO Medical - $500 deductible, 80/20 coinsurance',
      relatedEntities: 'Provider, Enrollments, Contribution Tiers',
      icon: FileText,
    },
    {
      term: 'Coverage Level',
      definition: 'Defines who is covered under an enrollment (employee only, employee + spouse, family, etc.).',
      example: 'Employee + Family covers employee, spouse, and dependents',
      relatedEntities: 'Enrollment, Contribution Rate',
      icon: Users,
    },
    {
      term: 'Contribution',
      definition: 'The premium amount split between employer and employee, typically expressed per pay period.',
      example: '$200 employee / $800 employer per month for family coverage',
      relatedEntities: 'Plan, Payroll Deduction, Coverage Level',
      icon: DollarSign,
    },
    {
      term: 'Waiting Period',
      definition: 'The time between hire date and benefit eligibility, often 30, 60, or 90 days.',
      example: '90-day waiting period for new hires before medical eligibility',
      relatedEntities: 'Plan, Employee, Eligibility Date',
      icon: Clock,
    },
    {
      term: 'Life Event',
      definition: 'A qualifying change that permits mid-year enrollment changes outside open enrollment.',
      example: 'Marriage, birth of child, loss of other coverage',
      relatedEntities: 'Enrollment, Special Enrollment Period',
      icon: Calendar,
    },
    {
      term: 'Open Enrollment',
      definition: 'The annual period when employees can make changes to their benefit elections.',
      example: 'November 1-30 for January 1 effective date',
      relatedEntities: 'Enrollment Cycle, Plans, Employees',
      icon: Calendar,
    },
    {
      term: 'Claim',
      definition: 'A request for reimbursement or payment for covered services or expenses.',
      example: 'FSA claim for $150 prescription expense',
      relatedEntities: 'Enrollment, Provider, Payment',
      icon: FileText,
    },
    {
      term: 'COBRA',
      definition: 'Continuation coverage that allows former employees to maintain group health benefits.',
      example: '18-month COBRA continuation after voluntary termination',
      relatedEntities: 'Enrollment, Termination, Compliance',
      icon: Shield,
    },
    {
      term: 'HSA/FSA',
      definition: 'Tax-advantaged accounts for qualified medical or dependent care expenses.',
      example: 'HSA with $3,850 individual / $7,750 family annual limit (2024)',
      relatedEntities: 'Category, Plan, Payroll',
      icon: DollarSign,
    },
    {
      term: 'Eligibility Rules',
      definition: 'Criteria that determine which employees qualify for specific benefit plans.',
      example: 'Full-time employees (30+ hrs/week) working 60+ days',
      relatedEntities: 'Plan, Employee Classification, Waiting Period',
      icon: CheckCircle2,
    },
  ];

  const contributionModels = [
    {
      model: 'Fixed Amount',
      description: 'Employee pays a set dollar amount per pay period regardless of plan cost.',
      formula: 'Employee Contribution = Fixed Amount',
      example: { 
        ee: '$50/pay period', 
        eeSpouse: '$100/pay period', 
        family: '$150/pay period' 
      },
      pros: ['Simple to communicate', 'Predictable for employees'],
      cons: ['Employer absorbs rate increases', 'May not scale well'],
    },
    {
      model: 'Percentage of Premium',
      description: 'Employee pays a percentage of the total premium, employer pays remainder.',
      formula: 'Employee Contribution = Total Premium × Employee %',
      example: { 
        split: '20% Employee / 80% Employer',
        totalPremium: '$1,000/month',
        eeShare: '$200/month'
      },
      pros: ['Cost increases shared', 'Fair distribution'],
      cons: ['Employee costs fluctuate', 'More complex communication'],
    },
    {
      model: 'Tiered by Coverage',
      description: 'Different contribution rates based on coverage level selected.',
      formula: 'Contribution = Tier Rate × Coverage Level Multiplier',
      example: {
        eeOnly: '$100/month (1.0x)',
        eeSpouse: '$200/month (2.0x)',
        eeChild: '$175/month (1.75x)',
        family: '$350/month (3.5x)'
      },
      pros: ['Aligns cost with coverage', 'Encourages cost-consciousness'],
      cons: ['Complex rate structures', 'Equity concerns'],
    },
    {
      model: 'Employer-Only',
      description: 'Employer pays 100% of premium with no employee contribution.',
      formula: 'Employee Contribution = $0',
      example: {
        benefit: 'Basic Life Insurance',
        coverage: '1x Annual Salary',
        cost: '$0 to employee'
      },
      pros: ['Maximum employee value', 'Simple enrollment'],
      cons: ['Higher employer cost', 'May reduce appreciation'],
    },
  ];

  const eligibilityFramework = [
    {
      category: 'Employment Type',
      rules: [
        'Full-Time: 30+ scheduled hours per week',
        'Part-Time: May have limited plan access',
        'Temporary: Typically excluded or limited',
        'Contractor: Not eligible for employer benefits',
      ],
    },
    {
      category: 'Service Requirements',
      rules: [
        'Hire Date: Eligibility begins from date of hire',
        'First of Month: Following hire or waiting period',
        'Waiting Period: 30/60/90 day delay options',
        'Probation Completion: After successful probation',
      ],
    },
    {
      category: 'Classification Rules',
      rules: [
        'Job Grade: Certain plans for specific grades',
        'Department: Location-based plan restrictions',
        'Union Status: Collective bargaining agreements',
        'Executive Level: Supplemental executive benefits',
      ],
    },
    {
      category: 'Age & Dependent Rules',
      rules: [
        'Minimum Age: Typically 18 for enrollment',
        'Dependent Age: Children covered to age 26',
        'Medicare Primary: Age 65+ coordination',
        'Retiree Eligibility: Service and age requirements',
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="font-medium">Part 1</span>
          <span>•</span>
          <span>Section 1.2</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Core Concepts & Terminology</h2>
        <p className="text-muted-foreground mt-1">
          Understanding the fundamental building blocks of benefits administration
        </p>
      </div>

      {/* Data Model Hierarchy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Benefits Data Model Hierarchy</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            The Benefits module follows a hierarchical data model that flows from broad categories down 
            to individual transactions. Understanding this hierarchy is essential for effective administration.
          </p>

          {/* Visual Hierarchy */}
          <div className="relative">
            {dataModelLevels.map((level, index) => (
              <div key={level.level} className="relative">
                <div className="flex items-start gap-4">
                  {/* Level indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${level.color} flex items-center justify-center text-white font-bold`}>
                      {level.level}
                    </div>
                    {index < dataModelLevels.length - 1 && (
                      <div className="w-0.5 h-16 bg-border" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <level.icon className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold text-foreground">{level.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {level.examples.map((example, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Relationship Flow */}
          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
            <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Relationship Flow
            </h5>
            <div className="flex items-center flex-wrap gap-2 text-sm">
              <Badge className="bg-blue-500">Category</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="bg-purple-500">Provider</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="bg-emerald-500">Plan</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="bg-amber-500">Enrollment</Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <Badge className="bg-rose-500">Claim</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terminology Deep Dive */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Terminology Deep Dive</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground w-1/6">Term</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground w-2/6">Definition</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground w-2/6">Example</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground w-1/6">Related Entities</th>
                </tr>
              </thead>
              <tbody>
                {terminologyDeepDive.map((item, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{item.term}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{item.definition}</td>
                    <td className="py-3 px-4 text-muted-foreground italic">{item.example}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">{item.relatedEntities}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Distinction Callout */}
      <div className="p-4 border-l-4 border-l-amber-400 bg-amber-50 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900">Key Distinction: Plan vs. Enrollment</h4>
            <p className="text-sm text-amber-800 mt-1">
              A <strong>Plan</strong> is a template that defines coverage terms, rates, and eligibility rules. 
              An <strong>Enrollment</strong> is an employee's active participation in that plan with a specific 
              coverage level and effective date. One plan can have thousands of enrollments; each enrollment 
              belongs to exactly one plan.
            </p>
          </div>
        </div>
      </div>

      {/* Contribution Models */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg">Contribution Models</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            HRplus supports multiple contribution models to accommodate different organizational policies 
            and benefit strategies. Each model has trade-offs in terms of simplicity, cost-sharing, and employee perception.
          </p>

          <div className="grid gap-6">
            {contributionModels.map((model, index) => (
              <div key={index} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Percent className="h-4 w-4 text-primary" />
                      {model.model}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{model.description}</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    {model.formula}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  {/* Example */}
                  <div className="bg-muted/30 rounded-lg p-3">
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">EXAMPLE</h5>
                    <div className="space-y-1 text-sm">
                      {Object.entries(model.example).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="font-medium text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pros */}
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <h5 className="text-xs font-medium text-emerald-700 mb-2">ADVANTAGES</h5>
                    <ul className="space-y-1">
                      {model.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="bg-amber-50 rounded-lg p-3">
                    <h5 className="text-xs font-medium text-amber-700 mb-2">CONSIDERATIONS</h5>
                    <ul className="space-y-1">
                      {model.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Eligibility Rules Framework */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Eligibility Rules Framework</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Eligibility rules determine which employees qualify for specific benefit plans. The system 
            evaluates multiple criteria to automatically determine eligibility status.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {eligibilityFramework.map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {category.category}
                </h4>
                <ul className="space-y-2">
                  {category.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 mt-1 text-primary" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Calculation Example */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Eligibility Calculation Example
            </h5>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-xs text-blue-600 mb-1">HIRE DATE</div>
                <div className="font-semibold text-blue-900">Jan 15, 2024</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-xs text-blue-600 mb-1">WAITING PERIOD</div>
                <div className="font-semibold text-blue-900">60 Days</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-xs text-blue-600 mb-1">ELIGIBLE DATE</div>
                <div className="font-semibold text-blue-900">Mar 15, 2024</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-xs text-blue-600 mb-1">EFFECTIVE DATE</div>
                <div className="font-semibold text-emerald-600">Apr 1, 2024</div>
                <div className="text-xs text-muted-foreground">(First of month)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
