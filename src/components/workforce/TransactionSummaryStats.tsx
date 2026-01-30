import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Clock, CheckCircle, AlertCircle, BarChart3 } from "lucide-react";
import { TRANSACTION_MODULES, getModuleForType } from "@/constants/transactionModuleCategories";
import { EmployeeTransaction } from "@/hooks/useEmployeeTransactions";
import { cn } from "@/lib/utils";

interface TransactionSummaryStatsProps {
  transactions: EmployeeTransaction[];
  loading?: boolean;
  onModuleClick?: (moduleCode: string | null) => void;
  activeModule?: string | null;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  highlight?: boolean;
  onClick?: () => void;
  active?: boolean;
}

function StatCard({ label, value, icon: Icon, color, bgColor, highlight, onClick, active }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 p-2.5 rounded-lg bg-card border transition-all min-w-0",
        highlight && "border-warning/50 bg-warning/5",
        active && "ring-2 ring-primary border-primary",
        onClick && "cursor-pointer hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      <div className={cn("p-1.5 rounded-md shrink-0", bgColor)}>
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-tight">{value}</p>
        <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
      </div>
    </div>
  );
}

export function TransactionSummaryStats({
  transactions,
  loading = false,
  onModuleClick,
  activeModule,
}: TransactionSummaryStatsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const total = transactions.length;
  const pendingApproval = transactions.filter((t) => t.status === "pending_approval").length;
  const completed = transactions.filter((t) => t.status === "completed").length;
  const draft = transactions.filter((t) => t.status === "draft").length;

  // Calculate by module
  const moduleBreakdown = TRANSACTION_MODULES.map((module) => {
    const count = transactions.filter((t) => {
      const typeCode = t.transaction_type?.code;
      return typeCode && module.types.includes(typeCode as any);
    }).length;
    return { ...module, count };
  }).filter((m) => m.count > 0);

  return (
    <Card className="border-border">
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2.5">
          <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5">
            Transaction Summary
          </Badge>
          {activeModule && (
            <Badge
              variant="secondary"
              className="text-[11px] cursor-pointer hover:bg-destructive/20 px-2 py-0.5"
              onClick={() => onModuleClick?.(null)}
            >
              {TRANSACTION_MODULES.find((m) => m.code === activeModule)?.name} ✕
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* Overall Stats */}
          <StatCard
            label="Total"
            value={total}
            icon={FileText}
            color="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard
            label="Pending Approval"
            value={pendingApproval}
            icon={Clock}
            color="text-warning"
            bgColor="bg-warning/10"
            highlight={pendingApproval > 0}
          />
          <StatCard
            label="Draft"
            value={draft}
            icon={AlertCircle}
            color="text-muted-foreground"
            bgColor="bg-muted"
          />
          <StatCard
            label="Completed"
            value={completed}
            icon={CheckCircle}
            color="text-success"
            bgColor="bg-success/10"
          />

          {/* Module Breakdown - clickable filters */}
          {moduleBreakdown.slice(0, 3).map((module) => (
            <StatCard
              key={module.code}
              label={module.name}
              value={module.count}
              icon={module.icon}
              color={module.color}
              bgColor={module.bgColor}
              onClick={() => onModuleClick?.(module.code)}
              active={activeModule === module.code}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
