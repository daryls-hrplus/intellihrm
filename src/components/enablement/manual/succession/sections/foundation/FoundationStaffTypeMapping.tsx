import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  CheckCircle, 
  Users,
  ArrowDown,
  Info
} from 'lucide-react';

export function FoundationStaffTypeMapping() {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="border-l-4 border-orange-500 pl-4">
        <h3 className="text-xl font-semibold">2.5a Staff Type Form Selection Rules</h3>
        <p className="text-muted-foreground">
          Understand automatic form selection logic based on employee staff types
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-primary" />
            Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Understand automatic form selection logic</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Configure staff type hierarchies</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Handle form conflicts and overrides</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Selection Algorithm */}
      <Card>
        <CardHeader>
          <CardTitle>Form Selection Algorithm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre">{`┌─────────────────────────────────────────────────────────────────────────────┐
│                      FORM SELECTION ALGORITHM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUT: Candidate Employee ID                                               │
│                                                                             │
│  STEP 1: Get employee's staff_type_id                                       │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Query: SELECT staff_type_id FROM profiles WHERE id = employee_id           │
│                                                                             │
│  STEP 2: Find exact match form                                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Query: SELECT * FROM readiness_assessment_forms                            │
│         WHERE staff_type_id = employee.staff_type_id                        │
│         AND is_active = true                                                │
│                                                                             │
│  STEP 3: If no exact match, check hierarchy                                 │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Walk up staff_type parent hierarchy until form found                       │
│                                                                             │
│  STEP 4: If still no match, use generic form                                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Query: SELECT * FROM readiness_assessment_forms                            │
│         WHERE staff_type_id IS NULL AND is_active = true                    │
│                                                                             │
│  STEP 5: If multiple forms match, use priority                              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Order by: sort_order ASC, created_at DESC                                  │
│                                                                             │
│  OUTPUT: Selected Form ID                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Staff Type Hierarchy Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Staff Type Hierarchy Example
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre className="whitespace-pre">{`Staff Type Hierarchy:
├── Executive
│   ├── C-Suite → Uses: Executive Readiness Form
│   └── VP → Uses: Executive Readiness Form
├── Director → Uses: Manager Readiness Form (inherits from Manager)
├── Manager
│   ├── Senior Manager → Uses: Manager Readiness Form
│   └── Manager → Uses: Manager Readiness Form
├── Professional
│   ├── Senior Professional → Uses: Professional Readiness Form
│   └── Professional → Uses: Professional Readiness Form
└── Support → Uses: Generic Readiness Form (fallback)`}</pre>
          </div>
        </CardContent>
      </Card>

      {/* Override Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Override Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Override Type</th>
                  <th className="text-left py-3 px-4 font-medium">How to Apply</th>
                  <th className="text-left py-3 px-4 font-medium">Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Manual form selection</td>
                  <td className="py-3 px-4 text-muted-foreground">Assessor selects form at assessment start</td>
                  <td className="py-3 px-4 text-muted-foreground">Unique role requirements</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Position-based override</td>
                  <td className="py-3 px-4 text-muted-foreground">Link form to position directly</td>
                  <td className="py-3 px-4 text-muted-foreground">Specialized positions</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Assessment event override</td>
                  <td className="py-3 px-4 text-muted-foreground">Specify form in assessment creation</td>
                  <td className="py-3 px-4 text-muted-foreground">One-time assessments</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Priority Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Selection Priority Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-2 text-sm">
            <div className="p-3 border-2 border-primary rounded-lg font-medium">
              1. Position-specific form override
            </div>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
            <div className="p-3 border rounded-lg">
              2. Exact staff type match
            </div>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
            <div className="p-3 border rounded-lg">
              3. Parent staff type in hierarchy
            </div>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
            <div className="p-3 border rounded-lg">
              4. Generic form (staff_type_id = NULL)
            </div>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
            <div className="p-3 border border-destructive rounded-lg text-destructive">
              5. Error: No form available
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
