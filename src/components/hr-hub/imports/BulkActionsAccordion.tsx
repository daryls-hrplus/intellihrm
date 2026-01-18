import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, 
  GitBranch, 
  GraduationCap,
  Info,
  LucideIcon
} from "lucide-react";
import { BulkReportingLineUpdate } from "./BulkReportingLineUpdate";
import { BulkJobQualificationsImport } from "./BulkJobQualificationsImport";

interface BulkActionItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  component: React.ReactNode;
}

const bulkActions: BulkActionItem[] = [
  {
    id: "reporting-lines",
    title: "Update Reporting Lines",
    description: "Bulk update which positions report to which supervisors",
    icon: GitBranch,
    component: <BulkReportingLineUpdate />,
  },
  {
    id: "job-qualifications",
    title: "Job Qualifications Import",
    description: "Bulk import qualification requirements (academic & professional) for jobs",
    icon: GraduationCap,
    component: <BulkJobQualificationsImport />,
  },
];

export function BulkActionsAccordion() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Select a bulk action below to expand its import interface. Each action allows you to update multiple records at once using CSV files.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        {bulkActions.map((action) => {
          const isExpanded = expandedId === action.id;
          const Icon = action.icon;

          return (
            <Collapsible
              key={action.id}
              open={isExpanded}
              onOpenChange={() => handleToggle(action.id)}
            >
              <Card className={cn(
                "transition-all duration-200",
                isExpanded && "ring-2 ring-primary/20"
              )}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          isExpanded ? "bg-primary/10" : "bg-muted"
                        )}>
                          <Icon className={cn(
                            "h-5 w-5",
                            isExpanded ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="text-left">
                          <CardTitle className="text-base flex items-center gap-2">
                            {action.title}
                            {action.badge && (
                              <Badge variant="secondary" className="text-xs">
                                {action.badge}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {action.description}
                          </CardDescription>
                        </div>
                      </div>
                      <ChevronDown className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )} />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0 border-t">
                    <div className="pt-4">
                      {action.component}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
