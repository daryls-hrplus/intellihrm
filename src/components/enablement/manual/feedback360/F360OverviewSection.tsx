import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Radar, Users, Shield, Brain, BarChart3, Link2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function F360OverviewSection() {
  return (
    <div className="space-y-8">
      <div data-manual-anchor="part-1" id="part-1">
        <h2 className="text-2xl font-bold mb-4">1. Module Overview & Conceptual Foundation</h2>
        <p className="text-muted-foreground mb-6">
          Comprehensive introduction to 360 Feedback in Intelli HRM, covering multi-rater philosophy, 
          core concepts, system architecture, and planning guidance.
        </p>
      </div>

      {/* Section 1.1 */}
      <Card data-manual-anchor="sec-1-1" id="sec-1-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-cyan-600" />
            1.1 Introduction to 360 Feedback in Intelli HRM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            360-degree feedback is a comprehensive performance assessment method that collects 
            confidential feedback from multiple sources including managers, peers, direct reports, 
            and self-assessment. This multi-rater approach provides a holistic view of an 
            employee's competencies, behaviors, and impact.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <h4 className="font-semibold mb-2">Key Benefits</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Comprehensive view from multiple perspectives</li>
                <li>• Reduces single-rater bias</li>
                <li>• Identifies blind spots and hidden strengths</li>
                <li>• Drives self-awareness and development</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold mb-2">Enterprise Differentiators</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Configurable anonymity thresholds</li>
                <li>• AI-powered signal processing</li>
                <li>• Integrated with CRGV appraisal model</li>
                <li>• Governance-first design with audit trails</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 1.2 */}
      <Card data-manual-anchor="sec-1-2" id="sec-1-2">
        <CardHeader>
          <CardTitle>1.2 Core Concepts & Terminology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { term: 'Rater Categories', desc: 'Manager, Peer, Direct Report, Self, External' },
              { term: 'Anonymity Threshold', desc: 'Minimum 3 raters per category for identity protection' },
              { term: 'Signal Processing', desc: 'AI extraction of talent signals from feedback data' },
              { term: 'Development Themes', desc: 'AI-identified growth areas from feedback patterns' },
              { term: 'Review Cycle', desc: 'Time-bound feedback collection period' },
              { term: 'Visibility Rules', desc: 'Role-based access control for results' },
            ].map((item) => (
              <div key={item.term} className="p-3 rounded-lg border bg-muted/50">
                <h5 className="font-medium text-sm">{item.term}</h5>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 1.3 */}
      <Card data-manual-anchor="sec-1-3" id="sec-1-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            1.3 User Personas & Journeys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { role: 'Employee', steps: 6, color: 'bg-blue-500/10 border-blue-500/20' },
              { role: 'Rater', steps: 4, color: 'bg-green-500/10 border-green-500/20' },
              { role: 'Manager', steps: 6, color: 'bg-purple-500/10 border-purple-500/20' },
              { role: 'HR Administrator', steps: 10, color: 'bg-orange-500/10 border-orange-500/20' },
            ].map((persona) => (
              <div key={persona.role} className={`p-4 rounded-lg border ${persona.color}`}>
                <h5 className="font-semibold">{persona.role} Journey</h5>
                <p className="text-sm text-muted-foreground">{persona.steps} key steps in the process</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 1.4 */}
      <Card data-manual-anchor="sec-1-4" id="sec-1-4">
        <CardHeader>
          <CardTitle>1.4 System Architecture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The 360 Feedback module is built on 25+ database tables supporting the complete 
            feedback lifecycle from cycle configuration through results delivery and integration.
          </p>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { category: 'Cycle Management', tables: 3 },
              { category: 'Participants & Raters', tables: 5 },
              { category: 'Questions & Responses', tables: 4 },
              { category: 'Reports & Analytics', tables: 3 },
              { category: 'Governance', tables: 5 },
              { category: 'AI & Signals', tables: 4 },
              { category: 'Integration', tables: 3 },
              { category: 'Audit & Logging', tables: 3 },
            ].map((cat) => (
              <div key={cat.category} className="p-3 rounded-lg border text-center">
                <p className="font-medium text-sm">{cat.category}</p>
                <Badge variant="secondary" className="mt-1">{cat.tables} tables</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section 1.5 */}
      <Card data-manual-anchor="sec-1-5" id="sec-1-5">
        <CardHeader>
          <CardTitle>1.5 360 Feedback Cycle Calendar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold mb-3">Recommended Annual Timeline</h4>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div><Badge variant="outline">Q1</Badge><p className="mt-1">Planning & Setup</p></div>
              <div><Badge variant="outline">Q2</Badge><p className="mt-1">Mid-year pulse (optional)</p></div>
              <div><Badge variant="outline">Q3</Badge><p className="mt-1">Annual 360 collection</p></div>
              <div><Badge variant="outline">Q4</Badge><p className="mt-1">Results & Development</p></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
