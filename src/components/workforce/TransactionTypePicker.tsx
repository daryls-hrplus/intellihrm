import { useState, useMemo } from "react";
import {
  UserPlus,
  UserCheck,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Building2,
  Briefcase,
  LogOut,
  DollarSign,
  Wallet,
  FileText,
  RefreshCw,
  Users,
  Search,
  X,
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TransactionType } from "@/hooks/useEmployeeTransactions";

interface TransactionTypeOption {
  code: TransactionType;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface TransactionCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  transactions: TransactionTypeOption[];
}

const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  {
    id: "hire",
    name: "Hire / Onboarding",
    icon: UserPlus,
    color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    transactions: [
      { code: "HIRE", name: "New Hire", description: "First-time employee hire", icon: UserPlus },
      { code: "REHIRE", name: "Rehire", description: "Returning employee", icon: UserCheck },
      { code: "CONFIRMATION", name: "Confirmation", description: "End of probation confirmation", icon: CheckCircle },
    ],
  },
  {
    id: "movement",
    name: "Movement",
    icon: TrendingUp,
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    transactions: [
      { code: "PROMOTION", name: "Promotion", description: "Move to higher-grade position", icon: TrendingUp },
      { code: "DEMOTION", name: "Demotion", description: "Move to lower-grade position", icon: TrendingDown },
      { code: "TRANSFER", name: "Transfer", description: "Change company or department", icon: Building2 },
      { code: "SECONDMENT", name: "Secondment", description: "Temporary assignment", icon: Briefcase },
      { code: "ACTING", name: "Acting Assignment", description: "Temporary higher duties", icon: Star },
    ],
  },
  {
    id: "contract",
    name: "Contract Management",
    icon: FileText,
    color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    transactions: [
      { code: "PROBATION_EXT", name: "Probation Extension", description: "Extend probationary period", icon: Clock },
      { code: "CONTRACT_EXTENSION", name: "Contract Extension", description: "Extend fixed-term contract", icon: RefreshCw },
      { code: "CONTRACT_CONVERSION", name: "Contract Conversion", description: "Fixed-term to permanent", icon: FileText },
      { code: "STATUS_CHANGE", name: "Status Change", description: "Full-time/Part-time transition", icon: Users },
    ],
  },
  {
    id: "compensation",
    name: "Compensation",
    icon: DollarSign,
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
    transactions: [
      { code: "SALARY_CHANGE", name: "Salary Change", description: "Adjust salaried compensation", icon: DollarSign },
      { code: "RATE_CHANGE", name: "Rate Change", description: "Adjust hourly/daily rate", icon: Wallet },
    ],
  },
  {
    id: "separation",
    name: "Separation",
    icon: LogOut,
    color: "text-red-600 bg-red-50 dark:bg-red-900/20",
    transactions: [
      { code: "TERMINATION", name: "Termination", description: "End of employment", icon: LogOut },
      { code: "RETIREMENT", name: "Retirement", description: "Retirement from service", icon: UserCheck },
    ],
  },
];

interface TransactionTypePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: TransactionType) => void;
  recentTransactions?: TransactionType[];
}

export function TransactionTypePicker({
  open,
  onOpenChange,
  onSelect,
  recentTransactions = [],
}: TransactionTypePickerProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    if (!searchTerm) {
      if (activeCategory) {
        return TRANSACTION_CATEGORIES.filter((c) => c.id === activeCategory);
      }
      return TRANSACTION_CATEGORIES;
    }

    const search = searchTerm.toLowerCase();
    return TRANSACTION_CATEGORIES.map((category) => ({
      ...category,
      transactions: category.transactions.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.code.toLowerCase().includes(search)
      ),
    })).filter((c) => c.transactions.length > 0);
  }, [searchTerm, activeCategory]);

  const handleSelect = (type: TransactionType) => {
    onSelect(type);
    onOpenChange(false);
    setSearchTerm("");
    setActiveCategory(null);
  };

  const recentItems = useMemo(() => {
    if (recentTransactions.length === 0) return [];
    return recentTransactions
      .slice(0, 3)
      .map((code) => {
        for (const cat of TRANSACTION_CATEGORIES) {
          const found = cat.transactions.find((t) => t.code === code);
          if (found) return found;
        }
        return null;
      })
      .filter(Boolean) as TransactionTypeOption[];
  }, [recentTransactions]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {t("workforce.modules.transactions.createNewTransaction", "Create New Transaction")}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("workforce.modules.transactions.searchTransactions", "Search transactions...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Category Tabs */}
        {!searchTerm && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge
              variant={activeCategory === null ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => setActiveCategory(null)}
            >
              All
            </Badge>
            {TRANSACTION_CATEGORIES.map((category) => (
              <Badge
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90 transition-colors"
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Recent Transactions */}
        {!searchTerm && !activeCategory && recentItems.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t("workforce.modules.transactions.recentlyUsed", "Recently Used")}
            </p>
            <div className="flex gap-2">
              {recentItems.map((item) => (
                <Button
                  key={item.code}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleSelect(item.code)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Categories and Transactions */}
        <div className="flex-1 overflow-y-auto space-y-4 pt-2 pb-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="space-y-2">
              <div className={cn("flex items-center gap-2 px-2 py-1 rounded-md", category.color)}>
                <category.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.transactions.map((txn) => (
                  <button
                    key={txn.code}
                    onClick={() => handleSelect(txn.code)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border border-border",
                      "hover:border-primary hover:bg-accent transition-colors",
                      "text-left group"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-md",
                      category.color
                    )}>
                      <txn.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors">
                        {txn.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {txn.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t("workforce.modules.transactions.noTransactionsFound", "No transactions found matching your search.")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
