import { TransactionType } from "@/hooks/useEmployeeTransactions";
import { UserPlus, ArrowRightLeft, UserMinus, DollarSign, UserCheck } from "lucide-react";

export interface TransactionModule {
  code: string;
  name: string;
  description: string;
  icon: typeof UserPlus;
  color: string;
  bgColor: string;
  types: TransactionType[];
}

export const TRANSACTION_MODULES: TransactionModule[] = [
  {
    code: "ENTRY",
    name: "Workforce Entry",
    description: "New hires and re-engagements",
    icon: UserPlus,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    types: ["HIRE", "REHIRE", "CONTRACT_EXTENSION", "CONTRACT_CONVERSION"],
  },
  {
    code: "MOVEMENT",
    name: "Workforce Movement",
    description: "Internal transfers and promotions",
    icon: ArrowRightLeft,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
    types: ["TRANSFER", "PROMOTION", "DEMOTION", "SECONDMENT", "ACTING"],
  },
  {
    code: "EXIT",
    name: "Workforce Exit",
    description: "Separations and retirements",
    icon: UserMinus,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
    types: ["TERMINATION", "RETIREMENT"],
  },
  {
    code: "COMPENSATION",
    name: "Compensation",
    description: "Pay and rate changes",
    icon: DollarSign,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    types: ["SALARY_CHANGE", "RATE_CHANGE"],
  },
  {
    code: "STATUS",
    name: "Employment Status",
    description: "Probation and status updates",
    icon: UserCheck,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    types: ["CONFIRMATION", "PROBATION_EXT", "STATUS_CHANGE"],
  },
];

export function getModuleForType(typeCode: TransactionType | string): TransactionModule | undefined {
  return TRANSACTION_MODULES.find((m) => m.types.includes(typeCode as TransactionType));
}

export function getModuleByCode(moduleCode: string): TransactionModule | undefined {
  return TRANSACTION_MODULES.find((m) => m.code === moduleCode);
}

export function getTypesForModule(moduleCode: string): TransactionType[] {
  const module = getModuleByCode(moduleCode);
  return module?.types || [];
}
