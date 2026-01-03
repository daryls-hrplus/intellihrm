import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Shield, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { VisibilityRules } from "./CycleVisibilityRulesEditor";

interface VisibilityAccessMatrixProps {
  rules: VisibilityRules;
}

export function VisibilityAccessMatrix({ rules }: VisibilityAccessMatrixProps) {
  const dataElements = [
    { key: 'scores', label: 'Aggregate Scores' },
    { key: 'comments', label: 'Text Comments' },
    { key: 'breakdown', label: 'Reviewer Breakdown' },
    { key: 'individual', label: 'Individual Responses' },
  ];

  const getAccessIcon = (hasAccess: boolean | 'investigation') => {
    if (hasAccess === 'investigation') {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Requires approved investigation request</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return hasAccess ? (
      <Check className="h-4 w-4 text-success" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground" />
    );
  };

  const checkAccess = (role: 'employee' | 'manager' | 'hr', element: string): boolean | 'investigation' => {
    const access = role === 'employee' 
      ? rules.employee_access 
      : role === 'manager' 
        ? rules.manager_access 
        : rules.hr_access;

    if (!access.enabled) return false;

    switch (element) {
      case 'scores':
        return access.show_scores;
      case 'comments':
        return access.show_comments;
      case 'breakdown':
        return access.show_reviewer_breakdown;
      case 'individual':
        if (role !== 'hr') return false;
        const hrAccess = rules.hr_access;
        if (hrAccess.individual_response_access === 'always') return true;
        if (hrAccess.individual_response_access === 'investigation_only') return 'investigation';
        return false;
      default:
        return false;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Access Level Summary</CardTitle>
        </div>
        <CardDescription>
          Overview of what each role can see when results are released
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Data Element</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Employee</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">Manager</th>
                <th className="text-center py-2 px-4 font-medium text-muted-foreground">HR</th>
              </tr>
            </thead>
            <tbody>
              {dataElements.map((element) => (
                <tr key={element.key} className="border-b last:border-0">
                  <td className="py-3 pr-4">{element.label}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      {getAccessIcon(checkAccess('employee', element.key))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      {getAccessIcon(checkAccess('manager', element.key))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      {getAccessIcon(checkAccess('hr', element.key))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {rules.hr_access.individual_response_access === 'investigation_only' && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Investigation Mode Active:</span>{' '}
              Individual responses require a formal investigation request approved by an HR Director. 
              All access is logged and auditable.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
