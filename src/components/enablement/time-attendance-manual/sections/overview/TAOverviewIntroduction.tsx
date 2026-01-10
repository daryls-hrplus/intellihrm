import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, BookOpen, Target, Users, CheckCircle, Building2, Brain, Timer,
  Fingerprint, MapPin, Smartphone, Globe, CreditCard, Upload,
  TrendingUp, Shield, Heart, Scale, GraduationCap, AlertTriangle
} from 'lucide-react';

export function TAOverviewIntroduction() {
  return (
    <Card id="ta-sec-1-1" data-manual-anchor="ta-sec-1-1" className="scroll-mt-32">
      <CardHeader>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Badge variant="outline">Section 1.1</Badge>
          <span>•</span>
          <Clock className="h-3 w-3" />
          <span>12 min read</span>
        </div>
        <CardTitle className="text-2xl">Introduction to Time and Attendance</CardTitle>
        <CardDescription>Executive summary, business value, target audience, and key differentiators</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
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

        {/* Business Value */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Business Value
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: 'Accurate Time Capture with Fraud Prevention',
                description: 'Multi-factor verification combining face recognition, GPS geofencing, and biometric devices eliminates buddy punching and time theft.',
                icon: Shield
              },
              {
                title: 'Reduced Overtime Costs',
                description: 'Proactive overtime alerts and AI-powered schedule optimization reduce unauthorized overtime by up to 30%.',
                icon: AlertTriangle
              },
              {
                title: 'Labor Law Compliance',
                description: 'Built-in support for Caribbean and African labor regulations including CBA rule enforcement and rest period tracking.',
                icon: Scale
              },
              {
                title: 'Improved Employee Experience',
                description: 'Mobile self-service for clock-in, shift swaps, and timesheet submission increases engagement and reduces HR burden.',
                icon: Smartphone
              }
            ].map((item, i) => (
              <div key={i} className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
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
                  <th className="text-left p-3 font-medium">Primary Sections</th>
                  <th className="text-left p-3 font-medium">Key Responsibilities</th>
                  <th className="text-left p-3 font-medium">Est. Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { role: 'Time Administrator', sections: 'All Sections', responsibilities: 'Full T&A configuration, policies, devices, exceptions', time: '8-10 hours' },
                  { role: 'HR Administrator', sections: 'Sections 1-4, 7', responsibilities: 'Policies, compliance, analytics, reporting', time: '5-6 hours' },
                  { role: 'HR Operations', sections: 'Sections 4-5', responsibilities: 'Daily operations, exception handling, regularization', time: '3-4 hours' },
                  { role: 'Payroll Administrator', sections: 'Sections 3, 6-7', responsibilities: 'Shift differentials, overtime rules, payroll sync', time: '3-4 hours' },
                  { role: 'Manager (MSS)', sections: 'Section 9', responsibilities: 'Team schedules, approvals, dashboard, OT alerts', time: '2-3 hours' },
                  { role: 'Employee (ESS)', sections: 'Section 9', responsibilities: 'Clock in/out, timesheets, shift swaps, requests', time: '30 min' },
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
                'Attendance policies and rounding rules',
                'Time clock devices and punch import',
                'Geofencing and face verification setup',
                'Shift templates, schedules, and assignments',
                'AI-powered scheduling and demand forecasting',
                'Overtime management and differential rules',
                'Project time tracking and cost allocation',
                'Bradford Factor and wellness monitoring',
                'CBA time rule configuration',
                'ESS/MSS self-service features'
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
                'Recruitment and onboarding → Recruitment Manual'
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
                color: 'indigo'
              },
              {
                icon: Brain,
                title: 'AI-Powered Scheduling',
                description: 'Constraint-based optimization with fatigue management, skill matching, preference handling, and demand forecasting. Reduces scheduling time by 80%.',
                color: 'blue'
              },
              {
                icon: MapPin,
                title: 'Geofencing & Face Verification',
                description: 'Location-aware clock-in with configurable geofence radius and face matching. Ensures employees are physically present at designated work sites.',
                color: 'green'
              },
              {
                icon: TrendingUp,
                title: 'Bradford Factor Analysis',
                description: 'Industry-standard absenteeism pattern detection with configurable thresholds, cost modeling, and automated alerts. Identifies attendance problems early.',
                color: 'amber'
              },
              {
                icon: Heart,
                title: 'Wellness AI Monitoring',
                description: 'Proactive fatigue and burnout risk prediction based on overtime patterns, shift frequency, and break compliance. Supports employee wellbeing.',
                color: 'rose'
              },
              {
                icon: Scale,
                title: 'CBA Rule Engine',
                description: 'Union agreement rule extraction and enforcement with overtime calculations, rest period tracking, and compliance reporting. Supports collective bargaining agreements.',
                color: 'purple'
              }
            ].map((item, i) => (
              <Card key={i} className={`bg-${item.color}-500/5 border-${item.color}-500/20`}>
                <CardContent className="pt-4">
                  <item.icon className={`h-5 w-5 text-${item.color}-500 mb-2`} />
                  <h4 className="font-medium mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
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
              { icon: Fingerprint, label: 'Biometric', desc: 'Fingerprint scanners' },
              { icon: Users, label: 'Face Recognition', desc: 'AI-powered matching' },
              { icon: Smartphone, label: 'Mobile GPS', desc: 'Geofence validated' },
              { icon: Globe, label: 'Web Clock', desc: 'Browser-based' },
              { icon: CreditCard, label: 'Card Readers', desc: 'RFID/Proximity' },
              { icon: Upload, label: 'Punch Import', desc: 'Batch upload' }
            ].map((method, i) => (
              <div key={i} className="p-4 border rounded-lg text-center hover:bg-muted/30 transition-colors">
                <method.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="font-medium text-sm">{method.label}</div>
                <div className="text-xs text-muted-foreground">{method.desc}</div>
              </div>
            ))}
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
              'Understand Bradford Factor and its use in absenteeism analysis'
            ].map((objective, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Badge variant="outline" className="mt-0.5 shrink-0">{i + 1}</Badge>
                <span className="text-muted-foreground">{objective}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
