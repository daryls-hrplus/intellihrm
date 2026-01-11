import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Users, ArrowRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
}

interface UnassignedEmployeesWidgetProps {
  unassignedEmployees: Employee[];
  onFilterUnassigned: () => void;
  className?: string;
}

export function UnassignedEmployeesWidget({
  unassignedEmployees,
  onFilterUnassigned,
  className,
}: UnassignedEmployeesWidgetProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const count = unassignedEmployees.length;
  const displayedEmployees = unassignedEmployees.slice(0, 5);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (count === 0) {
    return null;
  }

  return (
    <Card className={cn("border-amber-200 bg-amber-50/50 dark:border-amber-800/50 dark:bg-amber-950/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/50">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground">
                {t("workforce.unassignedEmployees") || "Unassigned Employees"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {t("workforce.needPositionAssignment") || "Employees needing position assignment"}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 font-semibold text-lg px-3">
            {count}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Employee Preview List */}
        <div className="space-y-2">
          {displayedEmployees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-center justify-between rounded-lg bg-background/80 p-2.5 transition-colors hover:bg-background"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={employee.avatar_url || undefined} alt={employee.full_name} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                    {getInitials(employee.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {employee.full_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {employee.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => navigate(`/workforce/assignments?employee=${employee.id}`)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                {t("workforce.assign") || "Assign"}
              </Button>
            </div>
          ))}
        </div>

        {/* Show more indicator */}
        {count > 5 && (
          <p className="text-xs text-center text-muted-foreground">
            +{count - 5} {t("workforce.moreUnassigned") || "more unassigned employees"}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-amber-200/50 dark:border-amber-800/30">
          <Button
            variant="outline"
            className="w-full justify-between border-amber-300 hover:bg-amber-100 hover:text-amber-800 dark:border-amber-800 dark:hover:bg-amber-900/30 dark:hover:text-amber-400"
            onClick={onFilterUnassigned}
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t("workforce.viewAllUnassigned") || "View All Unassigned"}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            className="w-full"
            onClick={() => navigate('/workforce/assignments')}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {t("workforce.goToAssignments") || "Go to Assignments"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
