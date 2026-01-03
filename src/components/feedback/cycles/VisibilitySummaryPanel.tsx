import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, AlertTriangle } from "lucide-react";
import { VisibilityRules } from "./CycleVisibilityRulesEditor";
import { RolePerspective } from "./RolePerspectiveSelector";

interface VisibilitySummaryPanelProps {
  rules: VisibilityRules;
  role: RolePerspective;
  companyAnonymityPolicy?: {
    individual_response_access: 'never' | 'investigation_only';
  };
}

export function VisibilitySummaryPanel({
  rules,
  role,
  companyAnonymityPolicy,
}: VisibilitySummaryPanelProps) {
  const getRoleConfig = () => {
    switch (role) {
      case "employee":
        return rules.employee_access;
      case "manager":
        return rules.manager_access;
      case "hr":
        return rules.hr_access;
    }
  };

  const config = getRoleConfig();
  const roleLabel = role === "employee" ? "Employee" : role === "manager" ? "Manager" : "HR Admin";
  const isEnabled = config.enabled;

  const items = [
    {
      label: "Aggregate Scores",
      visible: isEnabled && config.show_scores,
    },
    {
      label: "Text Comments",
      visible: isEnabled && config.show_comments,
    },
    {
      label: "Reviewer Breakdown",
      visible: isEnabled && config.show_reviewer_breakdown,
    },
  ];

  // Only HR has individual response access option
  if (role === "hr" && companyAnonymityPolicy) {
    items.push({
      label: "Individual Responses",
      visible: companyAnonymityPolicy.individual_response_access === "investigation_only" ? "investigation" : false,
    } as any);
  }

  const getIcon = (visible: boolean | "investigation") => {
    if (visible === "investigation") {
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
    return visible ? (
      <Check className="h-4 w-4 text-success" />
    ) : (
      <X className="h-4 w-4 text-destructive" />
    );
  };

  const getLabel = (visible: boolean | "investigation", label: string) => {
    if (visible === "investigation") {
      return `${label} (investigation only)`;
    }
    return label;
  };

  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          Visibility for: {roleLabel}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {!isEnabled ? (
          <p className="text-sm text-muted-foreground">
            Access is disabled for this role
          </p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                {getIcon(item.visible)}
                <span className={item.visible ? "text-foreground" : "text-muted-foreground"}>
                  {getLabel(item.visible, item.label)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
