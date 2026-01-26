import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Database, 
  Grid3X3, 
  Users, 
  Target, 
  Shield,
  Briefcase,
  TrendingUp,
  Heart,
  Info,
  Key,
  Link
} from 'lucide-react';

export function SuccessionArchitecture() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">1.4 Database Architecture</h3>
        <p className="text-muted-foreground mt-1">
          Entity relationships, table specifications, and data model overview
        </p>
      </div>

      {/* ER Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-indigo-600" />
            Entity Relationship Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <pre className="text-xs font-mono bg-muted/50 p-4 rounded-lg overflow-x-auto whitespace-pre">
{`┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         SUCCESSION PLANNING DATA MODEL (29 Tables)                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ┌─────────────────┐           ┌─────────────────┐           ┌─────────────────┐      │
│   │    profiles     │◄──────────│  nine_box_      │──────────►│  talent_pools   │      │
│   │   (employees)   │           │  assessments    │           │                 │      │
│   └────────┬────────┘           └────────┬────────┘           └────────┬────────┘      │
│            │                             │                             │               │
│            │                    ┌────────┴────────┐                    │               │
│            │                    │                 │                    │               │
│            │           ┌────────▼──────┐ ┌────────▼──────┐    ┌────────▼────────┐     │
│            │           │ nine_box_     │ │ nine_box_     │    │ talent_pool_    │     │
│            │           │ rating_       │ │ signal_       │    │ members         │     │
│            │           │ sources       │ │ mappings      │    └────────┬────────┘     │
│            │           └───────────────┘ └───────────────┘             │               │
│            │                                                           │               │
│   ┌────────▼────────┐           ┌─────────────────┐           ┌────────▼────────┐     │
│   │ flight_risk_    │           │    positions    │◄──────────│ talent_pool_    │     │
│   │ assessments     │           │                 │           │ review_packets  │     │
│   └─────────────────┘           └────────┬────────┘           └─────────────────┘     │
│                                          │                                             │
│                                 ┌────────▼────────┐                                    │
│                                 │ key_position_   │                                    │
│                                 │ risks           │                                    │
│                                 └────────┬────────┘                                    │
│                                          │                                             │
│                                 ┌────────▼────────┐                                    │
│                                 │ succession_     │                                    │
│                                 │ plans           │                                    │
│                                 └────────┬────────┘                                    │
│                                          │                                             │
│            ┌─────────────────────────────┼─────────────────────────────┐              │
│            │                             │                             │               │
│   ┌────────▼────────┐           ┌────────▼────────┐           ┌────────▼────────┐     │
│   │ succession_     │           │ succession_     │           │ succession_     │     │
│   │ candidates      │           │ development_    │           │ gap_development │     │
│   │                 │           │ plans           │           │ _links          │     │
│   └────────┬────────┘           └─────────────────┘           └─────────────────┘     │
│            │                                                                           │
│   ┌────────┴────────────────────────────┐                                             │
│   │                                     │                                              │
│   ▼                                     ▼                                              │
│  ┌─────────────────┐           ┌─────────────────┐                                    │
│  │ succession_     │           │ readiness_      │                                    │
│  │ candidate_      │           │ assessment_     │                                    │
│  │ evidence        │           │ events          │                                    │
│  └─────────────────┘           └────────┬────────┘                                    │
│                                         │                                              │
│                                ┌────────▼────────┐                                    │
│                                │ readiness_      │                                    │
│                                │ assessment_     │                                    │
│                                │ responses       │                                    │
│                                └─────────────────┘                                    │
│                                                                                        │
│  CONFIGURATION TABLES:                         CAREER & MENTORSHIP:                   │
│  ┌─────────────────┐ ┌─────────────────┐      ┌─────────────────┐ ┌────────────────┐ │
│  │ readiness_      │ │ readiness_      │      │ career_paths    │ │ mentorship_    │ │
│  │ assessment_     │ │ rating_bands    │      │                 │ │ programs       │ │
│  │ forms           │ └─────────────────┘      └────────┬────────┘ └───────┬────────┘ │
│  └────────┬────────┘                                   │                  │          │
│           │         ┌─────────────────┐       ┌────────▼────────┐ ┌───────▼────────┐ │
│  ┌────────▼────────┐│ succession_     │       │ career_path_    │ │ mentorship_    │ │
│  │ readiness_      ││ assessor_types  │       │ steps           │ │ pairings       │ │
│  │ assessment_     │└─────────────────┘       └─────────────────┘ └───────┬────────┘ │
│  │ indicators      │                                                      │          │
│  └────────┬────────┘ ┌─────────────────┐                         ┌───────▼────────┐ │
│           │          │ succession_     │                         │ mentorship_    │ │
│  ┌────────▼────────┐ │ availability_   │                         │ sessions       │ │
│  │ readiness_      │ │ reasons         │                         └────────────────┘ │
│  │ assessment_     │ └─────────────────┘                                             │
│  │ categories      │                                                                  │
│  └─────────────────┘                                                                  │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Domain 1: Nine-Box Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-orange-600" />
            Domain 1: Nine-Box Assessment (5 Tables)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Table</th>
                  <th className="text-left p-3 font-semibold">Purpose</th>
                  <th className="text-left p-3 font-semibold">Key Fields</th>
                  <th className="text-left p-3 font-semibold">Relationships</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">nine_box_assessments</code>
                  </td>
                  <td className="p-3">Individual 9-box placements per employee per period</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">employee_id</Badge>
                    <Badge variant="outline" className="mr-1">company_id</Badge>
                    <Badge variant="outline" className="mr-1">performance_rating (1-3)</Badge>
                    <Badge variant="outline" className="mr-1">potential_rating (1-3)</Badge>
                    <Badge variant="outline" className="mr-1">is_current</Badge>
                    <Badge variant="outline" className="mr-1">assessment_date</Badge>
                    <Badge variant="outline">notes</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      profiles, companies
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">nine_box_rating_sources</code>
                  </td>
                  <td className="p-3">Data sources for calculating axis scores</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">company_id</Badge>
                    <Badge variant="outline" className="mr-1">source_type</Badge>
                    <Badge variant="outline" className="mr-1">axis (performance/potential)</Badge>
                    <Badge variant="outline" className="mr-1">weight</Badge>
                    <Badge variant="outline">is_active</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      companies
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">nine_box_signal_mappings</code>
                  </td>
                  <td className="p-3">Maps source scores to 1-3 rating values</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">source_id</Badge>
                    <Badge variant="outline" className="mr-1">min_score</Badge>
                    <Badge variant="outline" className="mr-1">max_score</Badge>
                    <Badge variant="outline">mapped_value (1-3)</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      nine_box_rating_sources
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">nine_box_indicator_configs</code>
                  </td>
                  <td className="p-3">Custom axis labels and descriptions</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">company_id</Badge>
                    <Badge variant="outline" className="mr-1">axis</Badge>
                    <Badge variant="outline" className="mr-1">level (1-3)</Badge>
                    <Badge variant="outline" className="mr-1">label</Badge>
                    <Badge variant="outline">description</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      companies
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">nine_box_evidence_sources</code>
                  </td>
                  <td className="p-3">Supporting evidence for assessments</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">assessment_id</Badge>
                    <Badge variant="outline" className="mr-1">evidence_type</Badge>
                    <Badge variant="outline">source_reference</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      nine_box_assessments
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Domain 2: Talent Pools */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Domain 2: Talent Pools (3 Tables)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Table</th>
                  <th className="text-left p-3 font-semibold">Purpose</th>
                  <th className="text-left p-3 font-semibold">Key Fields</th>
                  <th className="text-left p-3 font-semibold">Relationships</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">talent_pools</code>
                  </td>
                  <td className="p-3">Pool definitions (High Potential, Leadership, etc.)</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">company_id</Badge>
                    <Badge variant="outline" className="mr-1">name</Badge>
                    <Badge variant="outline" className="mr-1">pool_type</Badge>
                    <Badge variant="outline" className="mr-1">criteria (JSONB)</Badge>
                    <Badge variant="outline">is_active</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      companies
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">talent_pool_members</code>
                  </td>
                  <td className="p-3">Pool membership with status tracking</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">pool_id</Badge>
                    <Badge variant="outline" className="mr-1">employee_id</Badge>
                    <Badge variant="outline" className="mr-1">status</Badge>
                    <Badge variant="outline" className="mr-1">reason</Badge>
                    <Badge variant="outline" className="mr-1">start_date</Badge>
                    <Badge variant="outline">end_date</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      talent_pools, profiles
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">talent_pool_review_packets</code>
                  </td>
                  <td className="p-3">Generated review materials for calibration</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">pool_id</Badge>
                    <Badge variant="outline" className="mr-1">packet_name</Badge>
                    <Badge variant="outline" className="mr-1">generated_by</Badge>
                    <Badge variant="outline">generated_at</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      talent_pools, profiles
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Domain 3: Succession Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Domain 3: Succession Plans (5 Tables)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Table</th>
                  <th className="text-left p-3 font-semibold">Purpose</th>
                  <th className="text-left p-3 font-semibold">Key Fields</th>
                  <th className="text-left p-3 font-semibold">Relationships</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">succession_plans</code>
                  </td>
                  <td className="p-3">Plans for specific positions</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">position_id</Badge>
                    <Badge variant="outline" className="mr-1">plan_name</Badge>
                    <Badge variant="outline" className="mr-1">status</Badge>
                    <Badge variant="outline" className="mr-1">risk_level</Badge>
                    <Badge variant="outline" className="mr-1">priority</Badge>
                    <Badge variant="outline">owner_id</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      positions, profiles
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">succession_candidates</code>
                  </td>
                  <td className="p-3">Nominated successors with ranking</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">plan_id</Badge>
                    <Badge variant="outline" className="mr-1">employee_id</Badge>
                    <Badge variant="outline" className="mr-1">readiness_level</Badge>
                    <Badge variant="outline" className="mr-1">ranking</Badge>
                    <Badge variant="outline" className="mr-1">status</Badge>
                    <Badge variant="outline">nominated_by</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      succession_plans, profiles
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">succession_candidate_evidence</code>
                  </td>
                  <td className="p-3">Supporting evidence for candidates</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">candidate_id</Badge>
                    <Badge variant="outline" className="mr-1">evidence_type</Badge>
                    <Badge variant="outline" className="mr-1">content</Badge>
                    <Badge variant="outline">added_by</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      succession_candidates
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">succession_development_plans</code>
                  </td>
                  <td className="p-3">Gap-closing development plans</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">candidate_id</Badge>
                    <Badge variant="outline" className="mr-1">title</Badge>
                    <Badge variant="outline" className="mr-1">development_type</Badge>
                    <Badge variant="outline" className="mr-1">status</Badge>
                    <Badge variant="outline">progress</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      succession_candidates
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">succession_gap_development_links</code>
                  </td>
                  <td className="p-3">Links gaps to development actions</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">candidate_id</Badge>
                    <Badge variant="outline" className="mr-1">gap_id</Badge>
                    <Badge variant="outline">development_plan_id</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      succession_candidates, succession_development_plans
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Domain 4: Readiness Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Domain 4: Readiness Assessment (6 Tables)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Table</th>
                  <th className="text-left p-3 font-semibold">Purpose</th>
                  <th className="text-left p-3 font-semibold">Key Fields</th>
                  <th className="text-left p-3 font-semibold">Relationships</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">readiness_assessment_forms</code>
                  </td>
                  <td className="p-3">Form definitions by staff type</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">company_id</Badge>
                    <Badge variant="outline" className="mr-1">name</Badge>
                    <Badge variant="outline" className="mr-1">staff_type</Badge>
                    <Badge variant="outline">is_active</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      companies
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">readiness_assessment_categories</code>
                  </td>
                  <td className="p-3">Question groupings within forms</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">form_id</Badge>
                    <Badge variant="outline" className="mr-1">name</Badge>
                    <Badge variant="outline">display_order</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      readiness_assessment_forms
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">readiness_assessment_indicators</code>
                  </td>
                  <td className="p-3">Weighted assessment questions</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">form_id</Badge>
                    <Badge variant="outline" className="mr-1">category_id</Badge>
                    <Badge variant="outline" className="mr-1">indicator_text</Badge>
                    <Badge variant="outline" className="mr-1">weight</Badge>
                    <Badge variant="outline">display_order</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      readiness_assessment_forms, readiness_assessment_categories
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">readiness_rating_bands</code>
                  </td>
                  <td className="p-3">Score-to-band mapping</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">company_id</Badge>
                    <Badge variant="outline" className="mr-1">band_code</Badge>
                    <Badge variant="outline" className="mr-1">label</Badge>
                    <Badge variant="outline" className="mr-1">min_score</Badge>
                    <Badge variant="outline">max_score</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      companies
                    </span>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">readiness_assessment_events</code>
                  </td>
                  <td className="p-3">Assessment instances per candidate</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">candidate_id</Badge>
                    <Badge variant="outline" className="mr-1">form_id</Badge>
                    <Badge variant="outline" className="mr-1">assessor_id</Badge>
                    <Badge variant="outline" className="mr-1">status</Badge>
                    <Badge variant="outline">final_score</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      succession_candidates, profiles
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">readiness_assessment_responses</code>
                  </td>
                  <td className="p-3">Assessor answers per indicator</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">event_id</Badge>
                    <Badge variant="outline" className="mr-1">indicator_id</Badge>
                    <Badge variant="outline" className="mr-1">score</Badge>
                    <Badge variant="outline">notes</Badge>
                  </td>
                  <td className="p-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Link className="h-3 w-3" />
                      readiness_assessment_events, readiness_assessment_indicators
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Domain 5: Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-amber-600" />
            Domain 5: Configuration (3 Tables)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Table</th>
                  <th className="text-left p-3 font-semibold">Purpose</th>
                  <th className="text-left p-3 font-semibold">Key Fields</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">succession_assessor_types</code>
                  </td>
                  <td className="p-3">Assessor role definitions (Manager, HR, Executive)</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">company_id</Badge>
                    <Badge variant="outline" className="mr-1">name</Badge>
                    <Badge variant="outline" className="mr-1">code</Badge>
                    <Badge variant="outline">can_assess_readiness</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">succession_availability_reasons</code>
                  </td>
                  <td className="p-3">Vacancy reason codes</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">company_id</Badge>
                    <Badge variant="outline" className="mr-1">code</Badge>
                    <Badge variant="outline" className="mr-1">label</Badge>
                    <Badge variant="outline">display_order</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">succession_readiness_indicators</code>
                  </td>
                  <td className="p-3">Company-specific readiness indicators</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">company_id</Badge>
                    <Badge variant="outline" className="mr-1">indicator_text</Badge>
                    <Badge variant="outline">weight</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Domain 6: Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Domain 6: Risk Management (2 Tables)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Table</th>
                  <th className="text-left p-3 font-semibold">Purpose</th>
                  <th className="text-left p-3 font-semibold">Key Fields</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">key_position_risks</code>
                  </td>
                  <td className="p-3">Position criticality and vacancy risk</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">position_id</Badge>
                    <Badge variant="outline" className="mr-1">criticality_level</Badge>
                    <Badge variant="outline" className="mr-1">vacancy_risk</Badge>
                    <Badge variant="outline" className="mr-1">retirement_risk</Badge>
                    <Badge variant="outline">replacement_difficulty</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">flight_risk_assessments</code>
                  </td>
                  <td className="p-3">Employee flight risk tracking</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">employee_id</Badge>
                    <Badge variant="outline" className="mr-1">risk_level</Badge>
                    <Badge variant="outline" className="mr-1">risk_factors (JSONB)</Badge>
                    <Badge variant="outline" className="mr-1">retention_actions</Badge>
                    <Badge variant="outline">assessed_at</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Domain 7: Career & Mentorship */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Domain 7: Career & Mentorship (5 Tables)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Table</th>
                  <th className="text-left p-3 font-semibold">Purpose</th>
                  <th className="text-left p-3 font-semibold">Key Fields</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">career_paths</code>
                  </td>
                  <td className="p-3">Path definitions</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">company_id</Badge>
                    <Badge variant="outline" className="mr-1">name</Badge>
                    <Badge variant="outline" className="mr-1">description</Badge>
                    <Badge variant="outline">is_active</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">career_path_steps</code>
                  </td>
                  <td className="p-3">Path progression steps</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">career_path_id</Badge>
                    <Badge variant="outline" className="mr-1">job_id</Badge>
                    <Badge variant="outline" className="mr-1">step_order</Badge>
                    <Badge variant="outline">typical_duration_months</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">mentorship_programs</code>
                  </td>
                  <td className="p-3">Program definitions</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">company_id</Badge>
                    <Badge variant="outline" className="mr-1">name</Badge>
                    <Badge variant="outline" className="mr-1">program_type</Badge>
                    <Badge variant="outline">matching_criteria</Badge>
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">mentorship_pairings</code>
                  </td>
                  <td className="p-3">Mentor-mentee links</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">program_id</Badge>
                    <Badge variant="outline" className="mr-1">mentor_id</Badge>
                    <Badge variant="outline" className="mr-1">mentee_id</Badge>
                    <Badge variant="outline">status</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="p-3">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">mentorship_sessions</code>
                  </td>
                  <td className="p-3">Session tracking</td>
                  <td className="p-3 text-xs">
                    <Badge variant="outline" className="mr-1">id</Badge>
                    <Badge variant="outline" className="mr-1">pairing_id</Badge>
                    <Badge variant="outline" className="mr-1">session_date</Badge>
                    <Badge variant="outline" className="mr-1">topics</Badge>
                    <Badge variant="outline">notes</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Alert className="mt-4 border-blue-500/30 bg-blue-500/5">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-700">Table Count Summary</AlertTitle>
            <AlertDescription className="text-blue-600/80">
              Total: <strong>29 tables</strong> across 7 domains. Nine-Box (5) + Talent Pools (3) + 
              Succession Plans (5) + Readiness Assessment (6) + Configuration (3) + Risk Management (2) + 
              Career & Mentorship (5) + jobs.is_key_position flag.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
