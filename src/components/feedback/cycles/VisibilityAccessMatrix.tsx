import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Shield } from "lucide-react";
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

  const getAccessIcon = (hasAccess: boolean) => {
    return hasAccess ? (
      <Check className="h-4 w-4 text-success" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground" />
    );
  };

  const checkAccess = (role: 'employee' | 'manager' | 'hr', element: string): boolean => {
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
        return role === 'hr' && (rules.hr_access as any).show_individual_responses;
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
      </CardContent>
    </Card>
  );
}
