import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  BookOpen, Users, Database, Network, Target, 
  TrendingUp, Shield, Building2, GitBranch, Clock,
  CheckCircle, Info
} from 'lucide-react';

export function SuccessionOverviewSection() {
  return (
    <div className="space-y-12">
      {/* Part Header */}
      <section id="part-1" data-manual-anchor="part-1" className="scroll-mt-32">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">1. System Architecture & Overview</h2>
            <p className="text-muted-foreground">
              Introduction to succession planning, business value, persona journeys, and complete data architecture
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~40 min read
          </span>
          <span>Target: Admin, Consultant, HR Partner</span>
        </div>
      </section>

      {/* Section 1.1: Introduction & Business Value */}
      <section id="sec-1-1" data-manual-anchor="sec-1-1" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">1.1 Introduction & Business Value</h3>
          <p className="text-muted-foreground">
            Strategic importance of succession planning, ROI metrics, and industry benchmarks
          </p>
        </div>

        <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <TrendingUp className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 dark:text-orange-200">Strategic Impact</AlertTitle>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            Organizations with formal succession planning programs experience <strong>25% better leadership pipeline metrics</strong> and 
            <strong> 40% faster time-to-productivity</strong> for internal promotions compared to external hires (SHRM 2024).
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Module Purpose
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Succession Planning module provides enterprise-grade capabilities for identifying, developing, 
              and tracking potential successors for critical roles. It integrates with Performance, Learning, 
              360 Feedback, and Workforce modules to create a unified talent management ecosystem.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Core Capabilities</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Nine-Box talent assessment grid
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Key position identification
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Multi-assessor readiness evaluation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Talent pool management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Flight risk monitoring
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Business Outcomes</h4>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    Reduced leadership gaps
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    Faster role transitions
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    Improved retention of high potentials
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    Strategic workforce planning
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 text-blue-500" />
                    Development investment ROI
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry Benchmarks (SHRM/Workday 2024)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">2-3</p>
                <p className="text-xs text-muted-foreground">Ready successors per key position</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">10-15%</p>
                <p className="text-xs text-muted-foreground">Positions marked as key/critical</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">70%</p>
                <p className="text-xs text-muted-foreground">Internal fill rate for leadership</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">18 mo</p>
                <p className="text-xs text-muted-foreground">Avg readiness acceleration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 1.2: User Personas & Access Rights */}
      <section id="sec-1-2" data-manual-anchor="sec-1-2" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">1.2 User Personas & Access Rights</h3>
          <p className="text-muted-foreground">
            HR Admin, Manager, Executive, and Employee persona journeys with role-based access matrix
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* HR Admin Persona */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-purple-500/10 rounded">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                HR Administrator
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">Full configuration and operational access</p>
              <ul className="space-y-1">
                <li>• Configure Nine-Box sources and mappings</li>
                <li>• Manage readiness assessment forms</li>
                <li>• Create and maintain talent pools</li>
                <li>• Build succession plans across org</li>
                <li>• Access all analytics and reports</li>
              </ul>
            </CardContent>
          </Card>

          {/* Manager Persona */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-blue-500/10 rounded">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                Manager
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">Team-scoped succession management</p>
              <ul className="space-y-1">
                <li>• View Nine-Box for direct reports</li>
                <li>• Nominate successors for team positions</li>
                <li>• Conduct readiness assessments</li>
                <li>• Monitor flight risk for team</li>
                <li>• Link development plans to gaps</li>
              </ul>
            </CardContent>
          </Card>

          {/* Executive Persona */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-amber-500/10 rounded">
                  <Building2 className="h-4 w-4 text-amber-600" />
                </div>
                Executive
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">Strategic oversight and calibration</p>
              <ul className="space-y-1">
                <li>• Review talent calibration sessions</li>
                <li>• Validate high-potential nominations</li>
                <li>• Approve critical position successors</li>
                <li>• Access executive dashboards</li>
                <li>• Participate in talent reviews</li>
              </ul>
            </CardContent>
          </Card>

          {/* Employee Persona */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="p-1.5 bg-green-500/10 rounded">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                Employee
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">Career visibility and development</p>
              <ul className="space-y-1">
                <li>• View career paths and progressions</li>
                <li>• Express career aspirations</li>
                <li>• Track development against gaps</li>
                <li>• Participate in mentorship programs</li>
                <li>• Access career development resources</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 1.3: Database Architecture */}
      <section id="sec-1-3" data-manual-anchor="sec-1-3" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">1.3 Database Architecture</h3>
          <p className="text-muted-foreground">
            Complete data model with 29+ tables across Nine-Box, Talent Pools, Succession Plans, Readiness, Career, and Mentorship domains
          </p>
        </div>

        <Alert>
          <Database className="h-4 w-4" />
          <AlertTitle>Enterprise Data Model</AlertTitle>
          <AlertDescription>
            The succession planning module spans 29+ database tables organized into 6 functional domains, 
            following SAP SuccessFactors and Workday architectural patterns.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Nine-Box Domain */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-orange-500" />
                Nine-Box Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1 font-mono">
                <li>• nine_box_assessments</li>
                <li>• nine_box_rating_sources</li>
                <li>• nine_box_signal_mappings</li>
                <li>• nine_box_indicator_configs</li>
                <li>• nine_box_evidence_sources</li>
              </ul>
            </CardContent>
          </Card>

          {/* Talent Pools Domain */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Talent Pools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1 font-mono">
                <li>• talent_pools</li>
                <li>• talent_pool_members</li>
                <li>• talent_pool_review_packets</li>
              </ul>
            </CardContent>
          </Card>

          {/* Succession Plans Domain */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Succession Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1 font-mono">
                <li>• succession_plans</li>
                <li>• succession_candidates</li>
                <li>• succession_candidate_evidence</li>
                <li>• succession_development_plans</li>
                <li>• succession_gap_development_links</li>
              </ul>
            </CardContent>
          </Card>

          {/* Readiness Domain */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-purple-500" />
                Readiness Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1 font-mono">
                <li>• readiness_assessment_events</li>
                <li>• readiness_assessment_forms</li>
                <li>• readiness_assessment_indicators</li>
                <li>• readiness_assessment_responses</li>
                <li>• readiness_rating_bands</li>
              </ul>
            </CardContent>
          </Card>

          {/* Configuration Domain */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="h-4 w-4 text-amber-500" />
                Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1 font-mono">
                <li>• succession_assessor_types</li>
                <li>• succession_availability_reasons</li>
                <li>• key_position_risks</li>
                <li>• flight_risk_assessments</li>
              </ul>
            </CardContent>
          </Card>

          {/* Career & Mentorship Domain */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-500" />
                Career & Mentorship
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1 font-mono">
                <li>• career_paths</li>
                <li>• career_path_steps</li>
                <li>• mentorship_programs</li>
                <li>• mentorship_pairings</li>
                <li>• mentorship_sessions</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 1.4: Module Dependencies */}
      <section id="sec-1-4" data-manual-anchor="sec-1-4" className="scroll-mt-32 space-y-6">
        <div className="border-l-4 border-orange-500 pl-4">
          <h3 className="text-xl font-semibold">1.4 Module Dependencies</h3>
          <p className="text-muted-foreground">
            Integration points with Performance, Workforce, Learning, Compensation, and 360 Feedback modules
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Cross-Module Data Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Inbound Data Sources</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">Performance</Badge>
                    <span className="text-muted-foreground">→ Appraisal ratings for Nine-Box</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">Goals</Badge>
                    <span className="text-muted-foreground">→ Achievement scores for performance axis</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">360 Feedback</Badge>
                    <span className="text-muted-foreground">→ Multi-rater signals for potential</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">Workforce</Badge>
                    <span className="text-muted-foreground">→ Position and org structure data</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">Competencies</Badge>
                    <span className="text-muted-foreground">→ Skill gaps for readiness assessment</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Outbound Data Targets</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">Learning</Badge>
                    <span className="text-muted-foreground">← Development recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">IDP</Badge>
                    <span className="text-muted-foreground">← Gap-to-goal linking</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">Compensation</Badge>
                    <span className="text-muted-foreground">← Retention recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">Workforce Planning</Badge>
                    <span className="text-muted-foreground">← Bench strength metrics</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">Talent Signals</Badge>
                    <span className="text-muted-foreground">← HiPo and readiness signals</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">Prerequisites</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Before configuring Succession Planning, ensure the following modules are set up:
            <ul className="mt-2 space-y-1">
              <li>• <strong>Workforce:</strong> Job architecture, positions, and org structure</li>
              <li>• <strong>Competencies:</strong> Competency framework and skill definitions</li>
              <li>• <strong>Performance:</strong> Appraisal cycles (for Nine-Box performance axis)</li>
            </ul>
          </AlertDescription>
        </Alert>
      </section>
    </div>
  );
}
