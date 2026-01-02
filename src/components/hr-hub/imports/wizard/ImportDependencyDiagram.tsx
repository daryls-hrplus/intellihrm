import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Building2, 
  FolderTree, 
  Briefcase, 
  Users, 
  UserPlus,
  Layers,
  GitBranch,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Settings,
  ArrowDown
} from "lucide-react";

interface ImportNode {
  id: string;
  label: string;
  icon: React.ElementType;
  dependsOn: string[];
  editableFields?: string[];
  systemDropdowns?: string[];
  notes?: string;
  tier: number;
}

const IMPORT_NODES: ImportNode[] = [
  // Tier 0 - No dependencies
  {
    id: "companies",
    label: "Companies",
    icon: Building2,
    dependsOn: [],
    editableFields: ["company_code", "legal_name", "tax_id", "fiscal_year_start"],
    systemDropdowns: ["country", "currency", "industry"],
    notes: "Foundation entity. Country/currency may need custom values for regional compliance.",
    tier: 0,
  },
  // Tier 1 - Depends on Companies
  {
    id: "divisions",
    label: "Divisions",
    icon: FolderTree,
    dependsOn: ["companies"],
    editableFields: ["division_code", "name", "cost_center"],
    tier: 1,
  },
  {
    id: "job_families",
    label: "Job Families",
    icon: Briefcase,
    dependsOn: ["companies"],
    editableFields: ["family_code", "name", "description"],
    notes: "Group related jobs. Can be aligned to EEO categories if needed.",
    tier: 1,
  },
  {
    id: "salary_grades",
    label: "Salary Grades",
    icon: Layers,
    dependsOn: ["companies"],
    editableFields: ["grade_code", "name", "min_salary", "mid_salary", "max_salary"],
    systemDropdowns: ["currency"],
    notes: "Define pay ranges. Required for grade-based compensation.",
    tier: 1,
  },
  {
    id: "pay_spines",
    label: "Pay Spines",
    icon: GitBranch,
    dependsOn: ["companies"],
    editableFields: ["spine_code", "name", "effective_date"],
    notes: "For incremental pay structures (public sector, unions).",
    tier: 1,
  },
  // Tier 2 - Depends on Tier 1
  {
    id: "departments",
    label: "Departments",
    icon: FolderTree,
    dependsOn: ["companies", "divisions"],
    editableFields: ["department_code", "name", "cost_center"],
    systemDropdowns: ["department_type"],
    notes: "Divisions optional. Department types may need customization.",
    tier: 2,
  },
  {
    id: "jobs",
    label: "Jobs",
    icon: Briefcase,
    dependsOn: ["companies", "job_families"],
    editableFields: ["job_code", "title", "job_level", "description"],
    systemDropdowns: ["job_family", "flsa_status", "eeo_category"],
    notes: "FLSA status critical for US compliance. EEO categories for reporting.",
    tier: 2,
  },
  {
    id: "spinal_points",
    label: "Spinal Points",
    icon: GitBranch,
    dependsOn: ["companies", "pay_spines"],
    editableFields: ["point_number", "annual_salary", "effective_date"],
    notes: "Individual salary steps within pay spines.",
    tier: 2,
  },
  // Tier 3 - Depends on Tier 2
  {
    id: "sections",
    label: "Sections",
    icon: FolderTree,
    dependsOn: ["companies", "departments"],
    editableFields: ["section_code", "name"],
    tier: 3,
  },
  {
    id: "positions",
    label: "Positions",
    icon: Briefcase,
    dependsOn: ["companies", "departments", "jobs"],
    editableFields: ["position_code", "title", "headcount", "reports_to"],
    systemDropdowns: ["employment_type", "salary_grade", "pay_spine"],
    notes: "Links jobs to org structure. Compensation model determines required fields.",
    tier: 3,
  },
  // Tier 4 - Depends on Tier 3
  {
    id: "employees",
    label: "Employees",
    icon: Users,
    dependsOn: [],
    editableFields: ["employee_id", "first_name", "last_name", "email", "hire_date"],
    systemDropdowns: ["gender", "nationality", "marital_status"],
    notes: "Can import standalone or link to positions. Personal data requires compliance review.",
    tier: 4,
  },
  {
    id: "employee_assignments",
    label: "Employee Assignments",
    icon: UserPlus,
    dependsOn: ["companies", "departments", "positions"],
    editableFields: ["effective_date", "salary", "fte"],
    systemDropdowns: ["assignment_status", "pay_frequency"],
    notes: "Assigns employees to positions with compensation details.",
    tier: 4,
  },
  {
    id: "new_hires",
    label: "New Hires",
    icon: UserPlus,
    dependsOn: ["companies", "departments", "positions"],
    editableFields: ["start_date", "salary", "manager_email"],
    notes: "Creates employee records with position assignments and user accounts.",
    tier: 4,
  },
];

// Group nodes by tier for visual layout
const NODE_TIERS = IMPORT_NODES.reduce((acc, node) => {
  if (!acc[node.tier]) acc[node.tier] = [];
  acc[node.tier].push(node);
  return acc;
}, {} as Record<number, ImportNode[]>);

interface ImportDependencyDiagramProps {
  compact?: boolean;
}

export function ImportDependencyDiagram({ compact = false }: ImportDependencyDiagramProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const renderNode = (node: ImportNode) => {
    const Icon = node.icon;
    const isExpanded = expandedNodes.has(node.id);
    const hasDetails = node.editableFields || node.systemDropdowns || node.notes;

    return (
      <Collapsible key={node.id} open={isExpanded} onOpenChange={() => toggleNode(node.id)}>
        <Card className={`
          transition-all duration-200
          ${isExpanded ? "ring-2 ring-primary/20 border-primary" : "hover:border-primary/50"}
        `}>
          <CollapsibleTrigger asChild>
            <CardContent className="p-3 cursor-pointer">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-sm flex-1">{node.label}</span>
                {hasDetails && (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )
                )}
              </div>
              {node.dependsOn.length > 0 && !compact && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {node.dependsOn.map((dep) => (
                    <Badge key={dep} variant="outline" className="text-xs">
                      ← {dep}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="px-3 pb-3 space-y-3 border-t pt-3">
              {node.editableFields && (
                <div>
                  <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground mb-1">
                    <Settings className="h-3 w-3" />
                    Editable Fields
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {node.editableFields.map((field) => (
                      <Badge key={field} variant="secondary" className="text-xs font-mono">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {node.systemDropdowns && (
                <div>
                  <div className="flex items-center gap-1 text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
                    <AlertTriangle className="h-3 w-3" />
                    System Dropdowns (May Need Editing)
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {node.systemDropdowns.map((dropdown) => (
                      <Badge key={dropdown} className="text-xs font-mono bg-orange-600 text-white dark:bg-orange-700 dark:text-white hover:bg-orange-700">
                        {dropdown}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {node.notes && (
                <p className="text-xs text-muted-foreground italic">
                  {node.notes}
                </p>
              )}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  const tierLabels: Record<number, string> = {
    0: "Foundation",
    1: "Level 1",
    2: "Level 2",
    3: "Level 3",
    4: "People & Assignments",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Import Dependency Map</h3>
        <Badge variant="outline" className="text-xs">
          Click nodes for details
        </Badge>
      </div>

      <div className="space-y-4">
        {Object.entries(NODE_TIERS).map(([tier, nodes], tierIndex) => (
          <div key={tier}>
            {/* Tier label */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted-foreground px-2">
                {tierLabels[Number(tier)] || `Tier ${tier}`}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Nodes in tier */}
            <div className={`grid gap-2 ${compact ? "grid-cols-2 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
              {nodes.map(renderNode)}
            </div>

            {/* Arrow to next tier */}
            {tierIndex < Object.keys(NODE_TIERS).length - 1 && (
              <div className="flex justify-center py-2">
                <ArrowDown className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-muted/50 rounded-lg p-3 mt-4">
        <h4 className="text-xs font-medium mb-2">Legend</h4>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Badge variant="secondary" className="text-xs">field</Badge>
            <span className="text-muted-foreground">Standard editable</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge className="text-xs bg-orange-600 text-white dark:bg-orange-700 dark:text-white hover:bg-orange-700">dropdown</Badge>
            <span className="text-muted-foreground">May need company-specific values</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">← dep</Badge>
            <span className="text-muted-foreground">Requires this data first</span>
          </div>
        </div>
      </div>
    </div>
  );
}
