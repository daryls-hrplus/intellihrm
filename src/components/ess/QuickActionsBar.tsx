import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  CalendarPlus, 
  Receipt, 
  FileText, 
  Clock, 
  UserPlus,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  path: string;
  variant?: "default" | "outline" | "ghost";
}

const quickActions: QuickAction[] = [
  {
    label: "Request Leave",
    icon: <CalendarPlus className="h-4 w-4" />,
    path: "/ess/leave",
    variant: "outline",
  },
  {
    label: "Submit Expense",
    icon: <Receipt className="h-4 w-4" />,
    path: "/ess/expense-claims",
    variant: "outline",
  },
  {
    label: "View Payslip",
    icon: <FileText className="h-4 w-4" />,
    path: "/ess/payslips",
    variant: "outline",
  },
  {
    label: "Log Time",
    icon: <Clock className="h-4 w-4" />,
    path: "/ess/timesheets",
    variant: "outline",
  },
  {
    label: "Add Dependent",
    icon: <UserPlus className="h-4 w-4" />,
    path: "/ess/dependents",
    variant: "outline",
  },
];

export function QuickActionsBar() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between py-2">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Quick Actions</span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="flex flex-wrap gap-2 pb-2">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant || "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => navigate(action.path)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
