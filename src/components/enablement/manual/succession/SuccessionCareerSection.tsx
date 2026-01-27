import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Briefcase, Clock, Info, ExternalLink, Link2 } from 'lucide-react';

export function SuccessionCareerSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-8" data-manual-anchor="part-8" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Briefcase className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">8. Succession-Career Integration</h2>
            <p className="text-muted-foreground">
              Integration between Succession Planning and Career Development modules
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~35 min read
          </span>
          <span>Target: Admin, HR Partner</span>
        </div>
      </section>

      {/* Section 8.1: Integration Overview */}
      <section id="sec-8-1" data-manual-anchor="sec-8-1" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">8.1 Integration Overview</h3>
          <p className="text-muted-foreground">Cross-reference to Career Development Manual</p>
        </div>

        <Alert>
          <ExternalLink className="h-4 w-4" />
          <AlertDescription>
            <strong>Module Separation:</strong> Following Workday's Career Hub architecture, Career Development 
            is now a standalone module serving ALL employees. This chapter documents only the succession-specific 
            integration points. For complete career pathing, IDP, and mentorship documentation, see the 
            <strong> Career Development Administrator Manual</strong>.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Succession-Specific Use Cases
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Candidate Development Tracking</h4>
                <p className="text-sm text-muted-foreground">
                  Link succession candidates to IDPs and track development progress inline on candidate cards.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Gap-to-IDP Linking</h4>
                <p className="text-sm text-muted-foreground">
                  Connect identified readiness gaps to specific IDP goals for targeted development.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Succession Mentorship</h4>
                <p className="text-sm text-muted-foreground">
                  Filter mentorship programs by type='succession' for candidate-specific pairing.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Progress Visualization</h4>
                <p className="text-sm text-muted-foreground">
                  Display IDP completion progress directly on succession candidate cards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 8.2: Succession Development Plans */}
      <section id="sec-8-2" data-manual-anchor="sec-8-2" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">8.2 Succession Development Plans</h3>
          <p className="text-muted-foreground">Link succession candidates to development plans</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">succession_development_plans</code>
              <Badge variant="outline">13 columns</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This table links succession candidates to their development plans, enabling inline progress 
              tracking within the Succession Plans view.
            </p>
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold mb-2">Key Fields</h4>
              <ul className="text-sm space-y-1">
                <li><code>candidate_id</code> → FK to succession_candidates</li>
                <li><code>idp_id</code> → FK to individual_development_plans</li>
                <li><code>progress_percentage</code> → Aggregated IDP progress</li>
                <li><code>status</code> → Plan status (active, completed)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 8.3: Gap-to-Development Linking */}
      <section id="sec-8-3" data-manual-anchor="sec-8-3" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">8.3 Gap-to-Development Linking</h3>
          <p className="text-muted-foreground">Link identified skill gaps to IDP goals</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">succession_gap_development_links</code>
              <Badge variant="outline">12 columns</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This table connects readiness gaps identified during succession assessment to specific IDP goals, 
              creating a traceable path from gap identification to development action.
            </p>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Cross-Module Workflow:</strong> Gaps identified in Succession → linked to IDP goals 
                (Career Development) → activities executed via L&D courses.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>

      {/* Section 8.4: Mentorship for Succession */}
      <section id="sec-8-4" data-manual-anchor="sec-8-4" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">8.4 Mentorship for Succession Candidates</h3>
          <p className="text-muted-foreground">Succession-specific mentorship programs</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <p>
              Mentorship programs with <code>program_type='succession'</code> are specifically designed for 
              succession candidates and appear in the Succession module for easy access.
            </p>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Succession Mentorship Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Executive mentors paired with high-potential successors</li>
                <li>• Leadership readiness focus</li>
                <li>• Knowledge transfer from incumbent to successor</li>
                <li>• Filtered view in Succession module</li>
              </ul>
            </div>
            <Alert>
              <ExternalLink className="h-4 w-4" />
              <AlertDescription>
                For complete mentorship program configuration, pairings, and session tracking, see 
                <strong> Career Development Manual Chapter 3</strong>.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
