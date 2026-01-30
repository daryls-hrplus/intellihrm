import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRANSACTION_MODULES, TransactionModule } from "@/constants/transactionModuleCategories";
import { cn } from "@/lib/utils";

interface TransactionModuleFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TransactionModuleFilter({
  value,
  onChange,
  className,
}: TransactionModuleFilterProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-[180px]", className)}>
        <SelectValue placeholder="All Modules" />
      </SelectTrigger>
      <SelectContent className="bg-popover z-50">
        <SelectItem value="all">All Modules</SelectItem>
        {TRANSACTION_MODULES.map((module) => {
          const Icon = module.icon;
          return (
            <SelectItem key={module.code} value={module.code}>
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", module.color)} />
                <span>{module.name}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
