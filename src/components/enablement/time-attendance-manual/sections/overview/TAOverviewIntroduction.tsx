import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, BookOpen, Target, Users, CheckCircle, Building2, Brain, Timer,
  Fingerprint, MapPin, Smartphone, Globe, CreditCard, Upload,
  TrendingUp, Shield, Heart, Scale, GraduationCap, AlertTriangle,
  Database, Layout, Layers, Info, Lightbulb, FileText, AlertCircle
} from 'lucide-react';
import { InfoCallout, TipCallout, WarningCallout, NoteCallout } from '@/components/enablement/manual/components/Callout';

export function TAOverviewIntroduction() {
  return (
    <Card id="ta-sec-1-1" data-manual-anchor="ta-sec-1-1" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.1</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>15 min read</span>
        </div>
        <CardTitle className="text-2xl">Introduction to Time and Attendance</CardTitle>
        <CardDescription>Executive summary, business value, target audience, and key differentiators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Module Metrics Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
            <Database className="h-6 w-6 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold text-primary">87</div>
            <div className="text-xs text-muted-foreground">Database Tables</div>
          </div>
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg text-center">
            <Layout className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">40</div>
            <div className="text-xs text-muted-foreground">UI Pages</div>
          </div>
          <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg text-center">
            <Layers className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">10</div>
            <div className="text-xs text-muted-foreground">Functional Domains</div>
          </div>
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-center">
            <BookOpen className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
            <div className="text-2xl font-bold text-emerald-600">10</div>
            <div className="text-xs text-muted-foreground">Manual Chapters</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The Intelli HRM Time and Attendance module provides enterprise-grade workforce time tracking 
                with <strong>6 clock-in methods</strong>, AI-powered scheduling optimization, and seamless 
                Payroll integration. Purpose-built for Caribbean, African, and global operations with 
                multi-country labor law compliance, Bradford Factor absenteeism analysis, and Wellness AI 
                for proactive fatigue and burnout detection.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="text-center p-3 bg-background rounded-lg border">
                  <div className="text-2xl font-bold text-primary">6+</div>
                  <div className="text-xs text-muted-foreground">Clock Methods</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg border">
                  <div className="text-2xl font-bold text-primary">AI</div>
                  <div className="text-xs text-muted-foreground">Smart Scheduler</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg border">
                  <div className="text-2xl font-bold text-primary">Real-time</div>
                  <div className="text-xs text-muted-foreground">Live Dashboard</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg border">
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-xs text-muted-foreground">Payroll Sync</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg border">
                  <div className="text-2xl font-bold text-primary">Bradford</div>
                  <div className="text-xs text-muted-foreground">Factor Analysis</div>
                </div>
                <div className="text-center p-3 bg-background rounded-lg border">
                  <div className="text-2xl font-bold text-primary">Wellness</div>
                  <div className="text-xs text-muted-foreground">AI Monitoring</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Industry Context & Statistics */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Industry Context & Challenges
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                stat: '4.5%',
                label: 'Average Employee Absenteeism Rate',
                source: 'SHRM Workplace Report 2024',
                insight: 'Costs organizations 1.8% of annual payroll in lost productivity',
                color: 'amber'
              },
              {
                stat: '$3,600',
                label: 'Annual Cost Per Disengaged Employee',
                source: 'Gallup State of the Workplace 2024',
                insight: 'Poor time tracking correlates with 23% lower engagement',
                color: 'rose'
              },
              {
                stat: '20%',
                label: 'Overtime is Unauthorized',
                source: 'ADP Research Institute',
                insight: 'Proactive alerts reduce unauthorized OT by up to 30%',
                color: 'orange'
              },
              {
                stat: '65%',
                label: 'Organizations Struggle with Scheduling',
                source: 'Gartner HR Technology Survey',
                insight: 'AI-powered scheduling reduces manual effort by 80%',
                color: 'blue'
              }
            ].map((item, i) => (
              <div key={i} className={`p-4 border rounded-lg bg-${item.color}-500/5 border-${item.color}-500/20`}>
                <div className="flex items-start gap-3">
                  <div className={`text-3xl font-bold text-${item.color}-600`}>{item.stat}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{item.insight}</div>
                    <div className="text-xs text-muted-foreground mt-2 italic">Source: {item.source}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How Intelli HRM Solves These Challenges */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            How Intelli HRM Addresses These Challenges
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                challenge: 'High Absenteeism Costs',
                solution: 'Bradford Factor analysis with automated thresholds and early warning alerts',
                icon: Heart
              },
              {
                challenge: 'Time Theft & Buddy Punching',
                solution: 'Multi-factor verification: GPS geofencing + face recognition + biometric devices',
                icon: Shield
              },
              {
                challenge: 'Unauthorized Overtime',
                solution: 'Real-time OT alerts, pre-approval workflows, and predictive analytics',
                icon: AlertTriangle
              },
              {
                challenge: 'Manual Scheduling Burden',
                solution: 'AI scheduler with constraint optimization, skill matching, and fatigue management',
                icon: Brain
              },
              {
                challenge: 'Labor Law Non-Compliance',
                solution: 'Built-in CBA rule engine, rest period tracking, and multi-jurisdiction support',
                icon: Scale
              },
              {
                challenge: 'Poor Employee Experience',
                solution: 'Mobile self-service, shift swaps, open shift bidding, and transparent timesheets',
                icon: Smartphone
              }
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1 text-sm">{item.challenge}</h4>
                    <p className="text-sm text-muted-foreground">{item.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Audience Matrix */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Target Audience Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Primary Chapters</th>
                  <th className="text-left p-3 font-medium">Key Responsibilities</th>
                  <th className="text-left p-3 font-medium">Est. Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { role: 'Time Administrator', sections: 'All Chapters (1-10)', responsibilities: 'Full T&A configuration, policies, devices, exceptions', time: '8-10 hours' },
                  { role: 'HR Administrator', sections: 'Chapters 1-4, 7', responsibilities: 'Policies, compliance, analytics, reporting', time: '5-6 hours' },
                  { role: 'HR Operations', sections: 'Chapters 4-5', responsibilities: 'Daily operations, exception handling, regularization', time: '3-4 hours' },
                  { role: 'Payroll Administrator', sections: 'Chapters 3, 6-7', responsibilities: 'Shift differentials, overtime rules, payroll sync', time: '3-4 hours' },
                  { role: 'Manager (MSS)', sections: 'Chapter 9', responsibilities: 'Team schedules, approvals, dashboard, OT alerts', time: '2-3 hours' },
                  { role: 'Employee (ESS)', sections: 'Chapter 9', responsibilities: 'Clock in/out, timesheets, shift swaps, requests', time: '30 min' },
                  { role: 'Implementation Consultant', sections: 'All Chapters', responsibilities: 'Full deployment, legacy migration, training', time: '12-15 hours' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{row.role}</td>
                    <td className="p-3 text-muted-foreground">{row.sections}</td>
                    <td className="p-3 text-muted-foreground">{row.responsibilities}</td>
                    <td className="p-3">
                      <Badge variant="outline">{row.time}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Scope */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg bg-green-500/5 border-green-500/20">
            <h4 className="font-medium mb-3 flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              What's Covered in This Manual
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                'Attendance policies, rounding rules, and grace periods',
                'Time clock devices, punch queue, and batch import',
                'Geofencing locations and radius configuration',
                'Face verification enrollment and matching thresholds',
                'Shift templates, schedules, rotations, and assignments',
                'AI-powered scheduling and demand forecasting',
                'Overtime management, rate tiers, and risk alerts',
                'Project time tracking and cost allocation',
                'Bradford Factor analysis and wellness monitoring',
                'CBA time rules and labor law compliance',
                'Timesheet submission and approval workflows',
                'ESS/MSS self-service features and mobile clock-in'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 border rounded-lg bg-orange-500/5 border-orange-500/20">
            <h4 className="font-medium mb-3 flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="h-4 w-4" />
              Not Covered (See Other Manuals)
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                'Payroll processing and pay runs → Payroll Manual',
                'Employee records and positions → Workforce Manual',
                'Leave requests and balances → Leave Manual',
                'Performance appraisals → Performance Manual',
                'Benefits enrollment → Benefits Manual',
                'Recruitment and onboarding → Recruitment Manual',
                'Learning and training → L&D Manual',
                'Succession planning → Succession Manual'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-orange-500">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Key Differentiators */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Key Differentiators
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: Fingerprint,
                title: 'Multi-Method Time Capture',
                description: '6 verification methods including biometric, face recognition, mobile GPS, web clock, card readers, and punch import. Combines multiple factors for fraud prevention.',
                tables: ['time_clock_entries', 'timeclock_devices']
              },
              {
                icon: Brain,
                title: 'AI-Powered Scheduling',
                description: 'Constraint-based optimization with fatigue management, skill matching, preference handling, and demand forecasting. Reduces scheduling time by 80%.',
                tables: ['ai_schedule_runs', 'ai_schedule_recommendations']
              },
              {
                icon: MapPin,
                title: 'Geofencing & Face Verification',
                description: 'Location-aware clock-in with configurable geofence radius and face matching. Ensures employees are physically present at designated work sites.',
                tables: ['geofence_locations', 'employee_face_enrollments']
              },
              {
                icon: TrendingUp,
                title: 'Bradford Factor Analysis',
                description: 'Industry-standard absenteeism pattern detection with configurable thresholds, cost modeling, and automated alerts. Identifies attendance problems early.',
                tables: ['employee_bradford_scores', 'bradford_factor_thresholds']
              },
              {
                icon: Heart,
                title: 'Wellness AI Monitoring',
                description: 'Proactive fatigue and burnout risk prediction based on overtime patterns, shift frequency, and break compliance. Supports employee wellbeing.',
                tables: ['employee_wellness_indicators']
              },
              {
                icon: Scale,
                title: 'CBA Rule Engine',
                description: 'Union agreement rule extraction and enforcement with overtime calculations, rest period tracking, and compliance reporting. Supports collective bargaining agreements.',
                tables: ['cba_time_rules', 'cba_violations']
              }
            ].map((item, i) => (
              <Card key={i} className="bg-muted/30">
                <CardContent className="pt-4">
                  <item.icon className="h-5 w-5 text-primary mb-2" />
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {item.tables.map((table, j) => (
                      <Badge key={j} variant="outline" className="text-xs font-mono">{table}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Clock-In Methods */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            Supported Clock-In Methods
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { icon: Fingerprint, label: 'Biometric', desc: 'Fingerprint scanners', table: 'timeclock_devices' },
              { icon: Users, label: 'Face Recognition', desc: 'AI-powered matching', table: 'face_verification_logs' },
              { icon: Smartphone, label: 'Mobile GPS', desc: 'Geofence validated', table: 'geofence_validations' },
              { icon: Globe, label: 'Web Clock', desc: 'Browser-based', table: 'time_clock_entries' },
              { icon: CreditCard, label: 'Card Readers', desc: 'RFID/Proximity', table: 'timeclock_devices' },
              { icon: Upload, label: 'Punch Import', desc: 'Batch upload', table: 'punch_import_batches' }
            ].map((method, i) => (
              <div key={i} className="p-4 border rounded-lg text-center hover:bg-muted/30 transition-colors">
                <method.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium text-sm">{method.label}</div>
                <div className="text-xs text-muted-foreground mb-2">{method.desc}</div>
                <Badge variant="outline" className="text-xs font-mono">{method.table}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Document Conventions */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Document Conventions
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            This manual uses standardized callout components to highlight important information:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-500/5 border-l-4 border-blue-500 rounded-r-lg">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-blue-700 dark:text-blue-400">Info:</span>
                <span className="text-sm text-muted-foreground ml-2">General information and helpful context</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-lg">
              <Lightbulb className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">Tip:</span>
                <span className="text-sm text-muted-foreground ml-2">Best practices and recommendations</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-500/5 border-l-4 border-amber-500 rounded-r-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-amber-700 dark:text-amber-400">Warning:</span>
                <span className="text-sm text-muted-foreground ml-2">Cautions and prerequisites before proceeding</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-500/5 border-l-4 border-purple-500 rounded-r-lg">
              <FileText className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-purple-700 dark:text-purple-400">Note:</span>
                <span className="text-sm text-muted-foreground ml-2">Additional context and cross-references</span>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted/50 border rounded-lg">
              <Database className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <Badge variant="outline" className="text-xs font-mono mr-2">table_name</Badge>
                <span className="text-sm text-muted-foreground">Database table references appear as monospace badges</span>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="p-6 bg-muted/30 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Learning Objectives
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            After completing this chapter, you will be able to:
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Explain the purpose and business value of Time & Attendance',
              'Describe the 6 clock-in methods and when to use each',
              'Understand the shift hierarchy (templates → schedules → assignments)',
              'Identify key user personas and their T&A workflows',
              'Outline the time management calendar and key deadlines',
              'Explain the role of AI in scheduling and wellness monitoring',
              'Describe how T&A integrates with Payroll and Leave modules',
              'Understand Bradford Factor and its use in absenteeism analysis',
              'Navigate the 10 functional domains and 87 database tables',
              'Apply document conventions when reading this manual'
            ].map((objective, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="mt-0.5 shrink-0">{i + 1}</Badge>
                <span className="text-muted-foreground">{objective}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section Footer */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Estimated reading time: 12-15 minutes</span>
          </div>
          <Badge variant="outline">Section 1.1 of 1.6</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
