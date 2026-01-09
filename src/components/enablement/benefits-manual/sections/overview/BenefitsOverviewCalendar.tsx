import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Settings,
  Globe,
  FileText,
  Users,
  DollarSign,
  Shield,
  Target,
  Zap
} from 'lucide-react';

export function BenefitsOverviewCalendar() {
  const quarterlyActivities = [
    {
      quarter: 'Q1',
      months: 'January - March',
      color: 'bg-blue-500',
      borderColor: 'border-blue-500',
      activities: [
        {
          month: 'January',
          items: [
            { task: 'New plan year begins', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Prior year cleanup and reconciliation', priority: 'high', owner: 'Benefits Admin' },
            { task: 'COBRA notifications for prior year terminations', priority: 'medium', owner: 'HR Admin' },
            { task: 'Form 5500 data preparation begins', priority: 'medium', owner: 'Benefits Admin' },
            { task: 'W-2 benefits reporting validation', priority: 'high', owner: 'Payroll/Benefits' },
          ],
        },
        {
          month: 'February',
          items: [
            { task: 'Plan renewal strategy meetings', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Carrier rate increase negotiations', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Benefits utilization review', priority: 'medium', owner: 'Benefits Admin' },
            { task: 'Dependent audit planning', priority: 'low', owner: 'HR Admin' },
          ],
        },
        {
          month: 'March',
          items: [
            { task: 'Carrier contract renewals finalized', priority: 'high', owner: 'Benefits Admin' },
            { task: 'System updates for mid-year changes', priority: 'medium', owner: 'Benefits Admin' },
            { task: 'Q1 compliance check', priority: 'medium', owner: 'HR Admin' },
            { task: 'ACA reporting preparation', priority: 'high', owner: 'Benefits Admin' },
          ],
        },
      ],
    },
    {
      quarter: 'Q2',
      months: 'April - June',
      color: 'bg-emerald-500',
      borderColor: 'border-emerald-500',
      activities: [
        {
          month: 'April',
          items: [
            { task: 'Life event processing (peak tax season)', priority: 'medium', owner: 'HR Admin' },
            { task: 'New hire enrollment processing', priority: 'ongoing', owner: 'HR Admin' },
            { task: 'Benefits communication audit', priority: 'low', owner: 'Benefits Admin' },
            { task: '1095-C corrections if needed', priority: 'medium', owner: 'Benefits Admin' },
          ],
        },
        {
          month: 'May',
          items: [
            { task: 'Mid-year cost analysis', priority: 'medium', owner: 'Benefits Admin' },
            { task: 'Utilization trend review', priority: 'medium', owner: 'Benefits Admin' },
            { task: 'Wellness program mid-year check', priority: 'low', owner: 'HR Admin' },
            { task: 'Dependent eligibility audits', priority: 'medium', owner: 'Benefits Admin' },
          ],
        },
        {
          month: 'June',
          items: [
            { task: 'Provider performance reviews', priority: 'medium', owner: 'Benefits Admin' },
            { task: 'Mid-year plan adjustments (if needed)', priority: 'low', owner: 'Benefits Admin' },
            { task: 'Form 5500 filing deadline', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Q2 compliance review', priority: 'medium', owner: 'HR Admin' },
          ],
        },
      ],
    },
    {
      quarter: 'Q3',
      months: 'July - September',
      color: 'bg-amber-500',
      borderColor: 'border-amber-500',
      activities: [
        {
          month: 'July',
          items: [
            { task: 'Open enrollment planning kickoff', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Communication materials development', priority: 'medium', owner: 'Benefits Admin' },
            { task: 'Carrier renewal proposals due', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Benefit fair planning', priority: 'low', owner: 'HR Admin' },
          ],
        },
        {
          month: 'August',
          items: [
            { task: 'Carrier negotiations finalized', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Plan design changes approved', priority: 'high', owner: 'Benefits Admin' },
            { task: 'System configuration for OE', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Manager training on OE support', priority: 'medium', owner: 'HR Admin' },
          ],
        },
        {
          month: 'September',
          items: [
            { task: 'Open enrollment system testing', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Employee communication campaign launch', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Pre-OE information sessions', priority: 'medium', owner: 'HR Admin' },
            { task: 'Q3 compliance review', priority: 'medium', owner: 'HR Admin' },
          ],
        },
      ],
    },
    {
      quarter: 'Q4',
      months: 'October - December',
      color: 'bg-rose-500',
      borderColor: 'border-rose-500',
      activities: [
        {
          month: 'October',
          items: [
            { task: 'Final OE communications sent', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Benefit fairs and information sessions', priority: 'medium', owner: 'HR Admin' },
            { task: 'Medicare Part D creditable coverage notices', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Pre-enrollment support desk active', priority: 'high', owner: 'HR Admin' },
          ],
        },
        {
          month: 'November',
          items: [
            { task: 'OPEN ENROLLMENT PERIOD (typical)', priority: 'critical', owner: 'All' },
            { task: 'Daily enrollment monitoring', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Issue resolution and escalations', priority: 'high', owner: 'HR Admin' },
            { task: 'Manager reminders for team completion', priority: 'medium', owner: 'Managers' },
          ],
        },
        {
          month: 'December',
          items: [
            { task: 'Enrollment finalization and audit', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Carrier file generation and transmission', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Payroll deduction sync for new year', priority: 'high', owner: 'Payroll/Benefits' },
            { task: 'Year-end compliance reporting', priority: 'high', owner: 'Benefits Admin' },
            { task: 'Q4/Annual compliance review', priority: 'high', owner: 'HR Admin' },
          ],
        },
      ],
    },
  ];

  const regionalVariations = [
    {
      region: 'Caribbean',
      considerations: [
        'Hurricane season (Jun-Nov) may affect enrollment timing',
        'Multi-island carriers with varying plan designs',
        'Regional insurance regulations vary by island',
        'Currency considerations for multinational employers',
      ],
      typicalOE: 'September - October',
      icon: '🌴',
    },
    {
      region: 'West Africa',
      considerations: [
        'Ramadan timing affects communication strategy',
        'Mix of local and international providers',
        'Regional labor law variations',
        'Currency and inflation considerations',
      ],
      typicalOE: 'August - September',
      icon: '🌍',
    },
    {
      region: 'North America',
      considerations: [
        'ACA compliance deadlines',
        'Standard calendar year benefits',
        'State-specific mandates',
        'Medicare coordination for 65+',
      ],
      typicalOE: 'October - November',
      icon: '🏛️',
    },
    {
      region: 'Europe',
      considerations: [
        'GDPR data handling requirements',
        'Country-specific social insurance integration',
        'Works council notification requirements',
        'Multi-language communication needs',
      ],
      typicalOE: 'November - December',
      icon: '🇪🇺',
    },
  ];

  const configurationOptions = [
    { option: 'Open Enrollment Start Date', description: 'First day employees can make elections', example: 'November 1' },
    { option: 'Open Enrollment End Date', description: 'Last day for election submissions', example: 'November 30' },
    { option: 'Plan Effective Date', description: 'When new elections take effect', example: 'January 1' },
    { option: 'Life Event Window', description: 'Days to make changes after qualifying event', example: '30 days' },
    { option: 'Waiting Period Default', description: 'Standard new hire eligibility delay', example: '60 days' },
    { option: 'Auto-Enrollment Rules', description: 'Default enrollment if no election made', example: 'Waive all / Default to EE-only' },
    { option: 'Reminder Frequency', description: 'How often to send OE reminders', example: 'Weekly during OE' },
    { option: 'Grace Period for Late Enrollments', description: 'Days after OE close to accept with approval', example: '5 business days' },
  ];

  const complianceDeadlines = [
    { deadline: 'Form 5500', due: 'July 31 (or extended to Oct 15)', description: 'Annual return for employee benefit plans' },
    { deadline: '1094-C / 1095-C', due: 'March 2 (employees) / March 31 (IRS)', description: 'ACA employer reporting' },
    { deadline: 'Medicare Part D Notice', due: 'October 15', description: 'Creditable coverage disclosure' },
    { deadline: 'SAR Distribution', due: '9 months after plan year', description: 'Summary Annual Report to participants' },
    { deadline: 'PCORI Fee', due: 'July 31', description: 'Patient-Centered Outcomes Research Institute fee' },
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div id="ben-sec-1-5" className="border-b border-border pb-4 scroll-mt-24">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span className="font-medium">Part 1</span>
          <span>•</span>
          <span>Section 1.5</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Benefits Management Calendar</h2>
        <p className="text-muted-foreground mt-1">
          Annual timeline, regional variations, and key compliance milestones
        </p>
      </div>

      {/* Quarterly Timeline */}
      <div className="space-y-6">
        {quarterlyActivities.map((quarter, qIndex) => (
          <Card key={qIndex} className={`border-l-4 ${quarter.borderColor}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`${quarter.color} text-white font-bold`}>
                    {quarter.quarter}
                  </Badge>
                  <CardTitle className="text-lg">{quarter.months}</CardTitle>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {quarter.activities.map((monthData, mIndex) => (
                  <div key={mIndex} className="border rounded-lg p-3">
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      {monthData.month}
                    </h4>
                    <ul className="space-y-2">
                      {monthData.items.map((item, iIndex) => (
                        <li key={iIndex} className="text-xs">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className={`h-3 w-3 flex-shrink-0 mt-0.5 ${
                              item.priority === 'critical' ? 'text-rose-500' :
                              item.priority === 'high' ? 'text-amber-500' :
                              item.priority === 'medium' ? 'text-blue-500' :
                              'text-slate-400'
                            }`} />
                            <div>
                              <span className="text-foreground">{item.task}</span>
                              <span className="text-muted-foreground ml-1">({item.owner})</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Dependencies */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-lg">Activity Dependencies</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-6 overflow-x-auto">
            <div className="flex items-center justify-center gap-2 flex-wrap text-sm">
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium">
                Carrier Renewal
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg font-medium">
                Plan Config
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg font-medium">
                OE Setup
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="px-4 py-2 bg-rose-100 text-rose-800 rounded-lg font-medium">
                Enrollment
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-medium">
                Payroll Sync
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg font-medium">
                Reporting
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 border-l-4 border-l-amber-400 rounded-r-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Critical Path:</strong> Carrier renewal decisions must be finalized by August to allow 
                sufficient time for system configuration and testing before open enrollment begins.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Regional Variations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Regional Variations</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {regionalVariations.map((region, index) => (
              <div key={index} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{region.icon}</span>
                  <div>
                    <h4 className="font-semibold text-foreground">{region.region}</h4>
                    <Badge variant="outline" className="text-xs font-mono">
                      Typical OE: {region.typicalOE}
                    </Badge>
                  </div>
                </div>
                <ul className="space-y-1">
                  {region.considerations.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3 flex-shrink-0 mt-0.5 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">Configuration Options</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            These settings can be configured per company/region to align with local requirements and organizational preferences.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Option</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Example Value</th>
                </tr>
              </thead>
              <tbody>
                {configurationOptions.map((config, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-4 font-medium text-foreground">{config.option}</td>
                    <td className="py-2 px-4 text-muted-foreground">{config.description}</td>
                    <td className="py-2 px-4">
                      <Badge variant="secondary" className="font-mono text-xs">{config.example}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Deadlines */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-rose-600" />
            <CardTitle className="text-lg">Key Compliance Deadlines (US)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complianceDeadlines.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 bg-rose-50/30">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-rose-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-foreground">{item.deadline}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <Badge variant="destructive" className="text-xs">
                      Due: {item.due}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-l-blue-400 rounded-r-lg">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <strong>Note:</strong> Regional compliance deadlines vary significantly. Caribbean and African 
                jurisdictions have different reporting requirements. Always verify local regulations and consult 
                with regional HR/Legal teams for specific deadlines.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
