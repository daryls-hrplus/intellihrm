import { Badge } from "@/components/ui/badge";
import { getModuleForType } from "@/constants/transactionModuleCategories";
import { cn } from "@/lib/utils";

interface TransactionModuleBadgeProps {
  typeCode: string;
  typeName?: string;
  showIcon?: boolean;
  size?: "sm" | "default";
}

export function TransactionModuleBadge({
  typeCode,
  typeName,
  showIcon = true,
  size = "default",
}: TransactionModuleBadgeProps) {
  const module = getModuleForType(typeCode);

  if (!module) {
    return (
      <Badge variant="outline" className={size === "sm" ? "text-xs py-0" : ""}>
        {typeName || typeCode}
      </Badge>
    );
  }

  const Icon = module.icon;

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <div className={cn("p-1 rounded", module.bgColor)}>
          <Icon className={cn("h-3 w-3", module.color)} />
        </div>
      )}
      <Badge 
        variant="outline" 
        className={cn(
          "border-current/20",
          module.color,
          size === "sm" ? "text-xs py-0" : ""
        )}
      >
        {typeName || typeCode}
      </Badge>
    </div>
  );
}
