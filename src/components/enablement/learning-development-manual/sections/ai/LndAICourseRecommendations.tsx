import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Database, Navigation, CheckCircle, BookOpen } from 'lucide-react';

export function LndAICourseRecommendations() {
  return (
    <section id="sec-6-4" data-manual-anchor="sec-6-4" className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">6.4 Course-Competency Recommendations</h2>
        <p className="text-muted-foreground">
          Competency-to-course mapping that powers gap-triggered course recommendations and learning path suggestions.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li>Configure competency-to-course mappings for automated recommendations</li>
            <li>Understand how gap scores trigger course suggestions</li>
            <li>Map both internal courses and external vendor courses to competencies</li>
            <li>Set proficiency level targets for course completion</li>
          </ul>
        </CardContent>
      </Card>

      {/* Database Schema */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            Database Schema: competency_course_mappings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Field</th>
                  <th className="text-left py-2 px-3 font-medium">Type</th>
                  <th className="text-left py-2 px-3 font-medium">Purpose</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">competency_id</td>
                  <td className="py-2 px-3">FK → competencies</td>
                  <td className="py-2 px-3">Target competency this course develops</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">course_id</td>
                  <td className="py-2 px-3">FK → lms_courses</td>
                  <td className="py-2 px-3">Internal course (mutually exclusive with vendor_course_id)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">vendor_course_id</td>
                  <td className="py-2 px-3">FK → lms_vendor_courses</td>
                  <td className="py-2 px-3">External vendor course</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">is_mandatory</td>
                  <td className="py-2 px-3">boolean</td>
                  <td className="py-2 px-3">Required for all employees with this gap</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">min_gap_level</td>
                  <td className="py-2 px-3">number (1-5)</td>
                  <td className="py-2 px-3">Minimum gap score to trigger recommendation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3 font-mono text-xs">target_proficiency_level</td>
                  <td className="py-2 px-3">number (1-5)</td>
                  <td className="py-2 px-3">Expected proficiency after completion</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-xs">notes</td>
                  <td className="py-2 px-3">text</td>
                  <td className="py-2 px-3">Administrator notes on mapping rationale</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Logic */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            Recommendation Logic
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The recommendation engine matches employee skill gaps to appropriate courses based on competency mappings
            and gap severity.
          </p>
          
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`Recommendation Algorithm:

1. Identify employee skill gap:
   └── employee_skill_gaps.capability_name → competency match

2. Find mapped courses:
   └── competency_course_mappings WHERE competency_id = matched_competency

3. Filter by gap threshold:
   └── WHERE min_gap_level <= employee_gap_score

4. Prioritize results:
   ├── is_mandatory = true (first)
   ├── target_proficiency_level >= required_level (second)
   └── course rating / completion rate (third)

5. Return recommendations:
   └── Ordered list with reasoning`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* UI Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            UI Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs">
            <pre>{`Training → Course Competencies (Tab)
│
├── Mapping List:
│   ├── Filter by: Competency, Course Type (internal/vendor)
│   ├── Add New Mapping (button)
│   └── Edit/Delete existing mappings
│
├── Mapping Form:
│   ├── Select Competency (searchable dropdown)
│   ├── Select Course Type (internal/vendor toggle)
│   ├── Select Course (filtered by type)
│   ├── Set Min Gap Level (1-5 slider)
│   ├── Set Target Proficiency (1-5 slider)
│   ├── Is Mandatory (checkbox)
│   └── Notes (textarea)
│
└── Bulk Import:
    └── CSV upload for mass mapping creation`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Gap-Triggered Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Gap-Triggered Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-2 px-3 font-medium">Gap Score</th>
                  <th className="text-left py-2 px-3 font-medium">Recommendation Type</th>
                  <th className="text-left py-2 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b">
                  <td className="py-2 px-3">1</td>
                  <td className="py-2 px-3">Suggested</td>
                  <td className="py-2 px-3">Employee can self-enroll; optional</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">2</td>
                  <td className="py-2 px-3">Recommended</td>
                  <td className="py-2 px-3">Manager notified; tracked in IDP</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-3">3+</td>
                  <td className="py-2 px-3">Required</td>
                  <td className="py-2 px-3">Auto-enrolled if is_mandatory = true</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Business Rules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Business Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>A competency can map to multiple courses (alternatives or progressive)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>A course can map to multiple competencies (multi-skill development)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Vendor courses require active vendor integration status</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Mandatory courses bypass manager approval for enrollment</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Course completion updates employee competency profile automatically</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Vendor Catalog Integration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Vendor Catalog Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            External vendor courses (LinkedIn Learning, Coursera, Udemy Business, etc.) can be mapped to
            competencies just like internal courses.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">LinkedIn Learning</Badge>
            <Badge variant="outline">Coursera for Business</Badge>
            <Badge variant="outline">Udemy Business</Badge>
            <Badge variant="outline">Pluralsight</Badge>
            <Badge variant="outline">Skillsoft</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            See Chapter 3: Vendor Management for vendor integration setup and SSO configuration.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
