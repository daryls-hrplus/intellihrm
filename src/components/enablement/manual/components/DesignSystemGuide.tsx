import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Shield, Clock, GraduationCap, Award, FileCheck, Bell, BarChart3,
  Info, AlertTriangle, Lightbulb, FileText, CheckCircle, AlertCircle,
  Building, Link2, Lock, Sparkles
} from 'lucide-react';
import { FeatureCard, FeatureCardVariant } from './FeatureCard';
import { FeatureCardGrid } from './FeatureCardGrid';
import { StatusBadge, StatusBadgeVariant } from './StatusBadge';
import { 
  Callout, 
  InfoCallout, 
  WarningCallout, 
  TipCallout, 
  NoteCallout,
  SuccessCallout,
  CriticalCallout,
  ComplianceCallout,
  IndustryCallout,
  IntegrationCallout,
  SecurityCallout,
  FutureCallout
} from './Callout';

export function DesignSystemGuide() {
  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit mb-2">Design System</Badge>
          <CardTitle className="text-2xl">Intelli HRM Implementation Manual Design System</CardTitle>
          <CardDescription>
            Comprehensive reference for all standardized components used across implementation manuals.
            All colors are semantic, accessible, and support dark mode.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Callout Components Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Info className="h-5 w-5" />
            Callout Components
          </CardTitle>
          <CardDescription>
            Use Callouts for tips, warnings, important information, and special notices.
            All Callouts have a left border accent with subtle background.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoCallout title="Info Callout">
            Use for general information and helpful context. Blue accent.
          </InfoCallout>
          
          <WarningCallout title="Warning Callout">
            Use for cautions and prerequisites. Amber accent.
          </WarningCallout>
          
          <TipCallout title="Tip Callout">
            Use for best practices and recommendations. Emerald accent.
          </TipCallout>
          
          <NoteCallout title="Note Callout">
            Use for additional context and references. Purple accent.
          </NoteCallout>
          
          <SuccessCallout title="Success Callout">
            Use for confirmations and completed actions. Green accent.
          </SuccessCallout>
          
          <CriticalCallout title="Critical Callout">
            Use for critical warnings and high-risk items. Red accent.
          </CriticalCallout>
          
          <ComplianceCallout title="Compliance Callout">
            Use for regulatory requirements. Red accent with shield icon.
          </ComplianceCallout>
          
          <IndustryCallout title="Industry Callout">
            Use for industry standards and benchmarks. Blue accent with building icon.
          </IndustryCallout>
          
          <IntegrationCallout title="Integration Callout">
            Use for cross-module connections. Violet accent with link icon.
          </IntegrationCallout>
          
          <SecurityCallout title="Security Callout">
            Use for security notices. Red accent with lock icon.
          </SecurityCallout>
          
          <FutureCallout title="Future Callout">
            Use for roadmap and planned features. Indigo accent with sparkles icon.
          </FutureCallout>
        </CardContent>
      </Card>

      <Separator />

      {/* FeatureCard Components Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Award className="h-5 w-5" />
            FeatureCard Components
          </CardTitle>
          <CardDescription>
            Use FeatureCards for feature grids, category listings, and service overviews.
            Each variant has semantic meaning for consistent visual language.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Standard Layout (with lists)</h4>
            <FeatureCardGrid columns={2}>
              <FeatureCard variant="primary" icon={GraduationCap} title="Primary (Blue)">
                <ul className="space-y-1 mt-2">
                  <li>• Main features</li>
                  <li>• Employee empowerment</li>
                  <li>• Core functionality</li>
                </ul>
              </FeatureCard>
              <FeatureCard variant="success" icon={Award} title="Success (Green)">
                <ul className="space-y-1 mt-2">
                  <li>• Approvals</li>
                  <li>• Completions</li>
                  <li>• Certifications</li>
                </ul>
              </FeatureCard>
              <FeatureCard variant="purple" icon={FileCheck} title="Purple">
                <ul className="space-y-1 mt-2">
                  <li>• Licenses</li>
                  <li>• Real-time features</li>
                  <li>• Special capabilities</li>
                </ul>
              </FeatureCard>
              <FeatureCard variant="orange" icon={Clock} title="Orange">
                <ul className="space-y-1 mt-2">
                  <li>• Time-related</li>
                  <li>• Memberships</li>
                  <li>• Offboarding</li>
                </ul>
              </FeatureCard>
            </FeatureCardGrid>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Centered Layout (with description)</h4>
            <FeatureCardGrid columns={4}>
              <FeatureCard 
                variant="primary" 
                icon={Users} 
                title="Team Roster" 
                description="Direct & indirect reports"
                centered 
              />
              <FeatureCard 
                variant="success" 
                icon={Shield} 
                title="Access Control" 
                description="Role-based permissions"
                centered 
              />
              <FeatureCard 
                variant="purple" 
                icon={Bell} 
                title="Alerts" 
                description="Pending actions"
                centered 
              />
              <FeatureCard 
                variant="orange" 
                icon={BarChart3} 
                title="Analytics" 
                description="Team metrics"
                centered 
              />
            </FeatureCardGrid>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Additional Variants</h4>
            <FeatureCardGrid columns={3}>
              <FeatureCard 
                variant="info" 
                icon={Info} 
                title="Info (Teal)" 
                description="Information, controlled access"
              />
              <FeatureCard 
                variant="warning" 
                icon={AlertTriangle} 
                title="Warning (Amber)" 
                description="Alerts, cautions, pending items"
              />
              <FeatureCard 
                variant="neutral" 
                icon={FileText} 
                title="Neutral (Gray)" 
                description="Default, low priority items"
              />
            </FeatureCardGrid>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* StatusBadge Components Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            StatusBadge Components
          </CardTitle>
          <CardDescription>
            Use StatusBadges for confidence levels, feasibility indicators, and status displays.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <StatusBadge variant="high">High Confidence</StatusBadge>
            <StatusBadge variant="medium">Medium Confidence</StatusBadge>
            <StatusBadge variant="low">Low Confidence</StatusBadge>
            <StatusBadge variant="critical">Critical</StatusBadge>
            <StatusBadge variant="info">Informational</StatusBadge>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Color Semantic Meanings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Color Semantic Reference</CardTitle>
          <CardDescription>
            Colors have consistent meaning across all components for intuitive understanding.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left p-3 font-semibold">Color</th>
                  <th className="text-left p-3 font-semibold">Callout Use</th>
                  <th className="text-left p-3 font-semibold">FeatureCard Use</th>
                  <th className="text-left p-3 font-semibold">StatusBadge Use</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <span className="inline-block w-4 h-4 rounded bg-blue-500 mr-2"></span>
                    Blue
                  </td>
                  <td className="p-3">Info, Industry</td>
                  <td className="p-3">Primary features, empowerment</td>
                  <td className="p-3">Informational</td>
                </tr>
                <tr className="border-b bg-muted/30">
                  <td className="p-3">
                    <span className="inline-block w-4 h-4 rounded bg-emerald-500 mr-2"></span>
                    Emerald/Green
                  </td>
                  <td className="p-3">Tip, Success</td>
                  <td className="p-3">Approvals, certifications</td>
                  <td className="p-3">High confidence</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <span className="inline-block w-4 h-4 rounded bg-amber-500 mr-2"></span>
                    Amber
                  </td>
                  <td className="p-3">Warning, Prerequisite</td>
                  <td className="p-3">Cautions, pending</td>
                  <td className="p-3">Medium confidence</td>
                </tr>
                <tr className="border-b bg-muted/30">
                  <td className="p-3">
                    <span className="inline-block w-4 h-4 rounded bg-red-500 mr-2"></span>
                    Red
                  </td>
                  <td className="p-3">Critical, Compliance, Security</td>
                  <td className="p-3">—</td>
                  <td className="p-3">Critical</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <span className="inline-block w-4 h-4 rounded bg-purple-500 mr-2"></span>
                    Purple
                  </td>
                  <td className="p-3">Note</td>
                  <td className="p-3">Licenses, real-time</td>
                  <td className="p-3">—</td>
                </tr>
                <tr className="border-b bg-muted/30">
                  <td className="p-3">
                    <span className="inline-block w-4 h-4 rounded bg-violet-500 mr-2"></span>
                    Violet
                  </td>
                  <td className="p-3">Integration</td>
                  <td className="p-3">—</td>
                  <td className="p-3">—</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <span className="inline-block w-4 h-4 rounded bg-orange-500 mr-2"></span>
                    Orange
                  </td>
                  <td className="p-3">—</td>
                  <td className="p-3">Time-related, memberships</td>
                  <td className="p-3">—</td>
                </tr>
                <tr className="border-b bg-muted/30">
                  <td className="p-3">
                    <span className="inline-block w-4 h-4 rounded bg-teal-500 mr-2"></span>
                    Teal
                  </td>
                  <td className="p-3">—</td>
                  <td className="p-3">Info, controlled access</td>
                  <td className="p-3">—</td>
                </tr>
                <tr>
                  <td className="p-3">
                    <span className="inline-block w-4 h-4 rounded bg-indigo-500 mr-2"></span>
                    Indigo
                  </td>
                  <td className="p-3">Future/Roadmap</td>
                  <td className="p-3">—</td>
                  <td className="p-3">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">When to Use Callout</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Tips and best practices</li>
                <li>• Warnings and cautions</li>
                <li>• Important information blocks</li>
                <li>• Prerequisites before actions</li>
                <li>• Compliance and regulatory notes</li>
                <li>• Security warnings</li>
                <li>• Cross-module integrations</li>
                <li>• Future roadmap items</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">When to Use FeatureCard</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Feature category grids (2-4 columns)</li>
                <li>• Service/capability overviews</li>
                <li>• Category listings with icons</li>
                <li>• Module component summaries</li>
                <li>• Quick reference cards</li>
              </ul>
            </div>
          </div>
          
          <TipCallout title="Best Practice">
            Always use the semantic variant that matches the content's meaning, not just
            for visual variety. This ensures users can quickly scan and understand content importance.
          </TipCallout>
        </CardContent>
      </Card>
    </div>
  );
}
