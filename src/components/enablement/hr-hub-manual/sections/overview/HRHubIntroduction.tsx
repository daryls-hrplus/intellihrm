import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, MessageSquare, Calendar, Shield, 
  Sparkles, CheckCircle, Clock, Users
} from 'lucide-react';
import { InfoCallout, TipCallout } from '@/components/enablement/manual/components/Callout';

export function HRHubIntroduction() {
  return (
    <div className="space-y-6" data-manual-anchor="hh-sec-1-1">
      {/* Section Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">Section 1.1</Badge>
            <Badge variant="secondary">8 min read</Badge>
          </div>
          <h2 className="text-2xl font-bold">Introduction to HR Hub</h2>
          <p className="text-muted-foreground mt-1">
            Executive summary, business value, and key differentiators
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            What is HR Hub?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            HR Hub is the central command center for HR operations, employee communications, 
            and organizational knowledge management. It serves as the connective tissue between 
            employees and HR services, providing a unified experience for support requests, 
            policy access, compliance tracking, and internal communications.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <MessageSquare className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Communication Hub</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Announcements, knowledge base, help desk, and intranet in one place
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <FileText className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Document Management</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Letter templates, policies, forms, and SOPs with version control
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Calendar className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Task & Event Orchestration</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  HR tasks with recurring automation, team collaboration via comments, 
                  milestones, reminders, and calendar management
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
              <Shield className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Compliance & Governance</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Regulatory tracking, approval workflows, and audit trails
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Value */}
      <Card>
        <CardHeader>
          <CardTitle>Business Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-purple-500">60%</div>
              <div className="text-sm text-muted-foreground mt-1">
                Reduction in HR inquiry response time
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-green-500">85%</div>
              <div className="text-sm text-muted-foreground mt-1">
                Employee self-service resolution rate
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-blue-500">100%</div>
              <div className="text-sm text-muted-foreground mt-1">
                Policy acknowledgment tracking
              </div>
            </div>
            <div className="text-center p-4">
              <div className="text-3xl font-bold text-orange-500">40%</div>
              <div className="text-sm text-muted-foreground mt-1">
                Reduction in missed HR deadlines
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">
                <strong>Unified Employee Experience:</strong> One destination for all HR-related needs
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">
                <strong>Compliance Automation:</strong> Never miss regulatory deadlines with proactive tracking
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">
                <strong>Knowledge Retention:</strong> Centralized SOPs and processes survive employee turnover
              </span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm">
                <strong>Workflow Efficiency:</strong> Automated approvals with clear escalation paths
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Differentiators */}
      <Card>
        <CardHeader>
          <CardTitle>Key Differentiators</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoCallout title="Deep Workforce Integration">
            HR Hub is not a standalone module. It deeply integrates with the Workforce module, 
            inheriting organization structure, employee data, and job architecture. This means 
            workflows route automatically based on your org hierarchy, and communications can 
            target specific departments, locations, or job families.
          </InfoCallout>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Event-Driven Architecture
              </h4>
              <p className="text-sm text-muted-foreground mt-2">
                HR events automatically trigger downstream actions—onboarding milestones, 
                probation reviews, anniversary recognition, and compliance renewals.
              </p>
            </div>
            <div className="p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Role-Based Information Access
              </h4>
              <p className="text-sm text-muted-foreground mt-2">
                Employees see what's relevant to them. Managers see team-specific content. 
                HR sees everything with full governance controls.
              </p>
            </div>
          </div>

          <TipCallout title="Cross-Module Power">
            The real power of HR Hub emerges when combined with other modules. Appraisal outcomes 
            can trigger IDP creation. Compliance certificates feed into performance reviews. 
            Recognition analytics correlate with retention metrics.
          </TipCallout>
        </CardContent>
      </Card>
    </div>
  );
}
