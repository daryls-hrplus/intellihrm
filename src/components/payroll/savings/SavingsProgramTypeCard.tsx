import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  Copy, 
  Users,
  Calendar,
  Percent,
  DollarSign,
  Building2,
  Gift,
  Target,
  FolderKanban,
  Landmark
} from "lucide-react";
import {
  SavingsProgramType,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  RELEASE_TYPE_LABELS,
  CALCULATION_METHOD_LABELS,
  MONTH_NAMES,
  useToggleSavingsProgramStatus,
} from "@/hooks/useSavingsPrograms";
import { cn } from "@/lib/utils";

interface SavingsProgramTypeCardProps {
  program: SavingsProgramType;
  onEdit: (program: SavingsProgramType) => void;
  onDelete: (program: SavingsProgramType) => void;
  onDuplicate: (program: SavingsProgramType) => void;
  onViewEnrollments: (program: SavingsProgramType) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  credit_union: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  company_sponsored: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  goal_based: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  project_tied: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  christmas_club: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const CATEGORY_ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  credit_union: Landmark,
  company_sponsored: Building2,
  goal_based: Target,
  project_tied: FolderKanban,
  christmas_club: Gift,
};

export function SavingsProgramTypeCard({
  program,
  onEdit,
  onDelete,
  onDuplicate,
  onViewEnrollments,
}: SavingsProgramTypeCardProps) {
  const toggleStatus = useToggleSavingsProgramStatus();
  const IconComponent = CATEGORY_ICON_COMPONENTS[program.category] || Building2;

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getContributionDisplay = () => {
    if (program.calculation_method === 'percentage' && program.default_percentage) {
      return `${program.default_percentage}% of pay`;
    }
    if (program.calculation_method === 'fixed' && program.default_amount) {
      return formatCurrency(program.default_amount);
    }
    return 'Custom';
  };

  const getReleaseInfo = () => {
    if (program.release_type === 'scheduled' && program.scheduled_release_month) {
      const monthName = MONTH_NAMES[program.scheduled_release_month - 1];
      const day = program.scheduled_release_day || 1;
      return `${monthName} ${day}`;
    }
    return RELEASE_TYPE_LABELS[program.release_type];
  };

  return (
    <Card className={cn(
      "transition-all hover:shadow-md",
      !program.is_active && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              CATEGORY_COLORS[program.category]
            )}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {program.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-mono">
                {program.code}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={program.is_active}
              onCheckedChange={(checked) => 
                toggleStatus.mutate({ id: program.id, is_active: checked })
              }
              disabled={toggleStatus.isPending}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(program)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(program)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewEnrollments(program)}>
                  <Users className="mr-2 h-4 w-4" />
                  View Enrollments
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(program)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className={CATEGORY_COLORS[program.category]}>
            {CATEGORY_ICONS[program.category]} {CATEGORY_LABELS[program.category]}
          </Badge>
          {program.has_employer_match && (
            <Badge variant="outline" className="border-green-500 text-green-700 dark:text-green-400">
              {program.employer_match_percentage}% Match
            </Badge>
          )}
          {program.earns_interest && (
            <Badge variant="outline" className="border-blue-500 text-blue-700 dark:text-blue-400">
              {(program.interest_rate_annual || 0) * 100}% Interest
            </Badge>
          )}
          {program.is_pretax && (
            <Badge variant="outline">Pre-Tax</Badge>
          )}
        </div>

        {program.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {program.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            {program.calculation_method === 'percentage' ? (
              <Percent className="h-4 w-4 text-muted-foreground" />
            ) : (
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-muted-foreground">Contribution:</span>
            <span className="font-medium">{getContributionDisplay()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Release:</span>
            <span className="font-medium">{getReleaseInfo()}</span>
          </div>
        </div>

        {(program.min_contribution || program.max_contribution) && (
          <div className="text-xs text-muted-foreground">
            Limits: {program.min_contribution ? formatCurrency(program.min_contribution) : 'No min'} 
            {' – '} 
            {program.max_contribution ? formatCurrency(program.max_contribution) : 'No max'}
          </div>
        )}

        {program.institution_name && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
            <Landmark className="h-3 w-3" />
            <span>{program.institution_name}</span>
            {program.institution_code && (
              <span className="font-mono">({program.institution_code})</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
