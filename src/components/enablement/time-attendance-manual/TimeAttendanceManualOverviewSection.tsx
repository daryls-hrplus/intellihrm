import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Target, Users, CheckCircle, Building2, Brain, Timer } from 'lucide-react';

export function TimeAttendanceManualOverviewSection() {
  return (
    <div className="space-y-8">
      <Card id="ta-sec-1-1" data-manual-anchor="ta-sec-1-1" className="scroll-mt-32">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 1.1</Badge>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>8 min read</span>
          </div>
          <CardTitle className="text-2xl">Introduction to Time and Attendance</CardTitle>
          <CardDescription>Executive summary, business value, and key differentiators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Executive Summary</h3>
                <p className="text-muted-foreground leading-relaxed">
                  The Intelli HRM Time and Attendance module provides comprehensive workforce time tracking, 
                  from multi-method clock-in to AI-powered scheduling optimization. It seamlessly integrates 
                  with Payroll for accurate compensation and Workforce for employee assignments.
                </p>
                <div className="mt-4 grid md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">5+</div>
                    <div className="text-xs text-muted-foreground">Clock-In Methods</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">AI</div>
                    <div className="text-xs text-muted-foreground">Smart Scheduling</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">Real-time</div>
                    <div className="text-xs text-muted-foreground">Attendance Dashboard</div>
                  </div>
                  <div className="text-center p-3 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">100%</div>
                    <div className="text-xs text-muted-foreground">Payroll Integration</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Key Capabilities
            </h3>
            <ul className="space-y-3 text-muted-foreground">
              {[
                'Multi-method clock-in: biometric, face recognition, mobile GPS, web, card readers',
                'Flexible shift management with rotation patterns and differentials',
                'AI-powered schedule optimization with fatigue management',
                'Real-time attendance dashboard with exception alerts',
                'Project time tracking with cost allocation',
                'Bradford Factor absenteeism analysis and wellness monitoring',
                'Full ESS/MSS self-service for employees and managers'
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-indigo-500/5 border-indigo-500/20">
              <CardContent className="pt-4">
                <Timer className="h-5 w-5 text-indigo-500 mb-2" />
                <h4 className="font-medium mb-1">Accurate Time Capture</h4>
                <p className="text-sm text-muted-foreground">
                  Multiple verification methods ensure accurate attendance data.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-500/5 border-blue-500/20">
              <CardContent className="pt-4">
                <Brain className="h-5 w-5 text-blue-500 mb-2" />
                <h4 className="font-medium mb-1">AI Scheduling</h4>
                <p className="text-sm text-muted-foreground">
                  Intelligent schedule optimization with constraint handling.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="pt-4">
                <Building2 className="h-5 w-5 text-green-500 mb-2" />
                <h4 className="font-medium mb-1">Payroll Ready</h4>
                <p className="text-sm text-muted-foreground">
                  Seamless integration with payroll for accurate compensation.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
