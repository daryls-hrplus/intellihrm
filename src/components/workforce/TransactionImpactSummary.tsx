import { Check, AlertTriangle, ArrowRight, Minus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { TransactionType } from "@/hooks/useEmployeeTransactions";

interface ImpactItem {
  label: string;
  fromValue?: string | null;
  toValue?: string | null;
  status: "changed" | "unchanged" | "warning" | "new" | "removed";
  message?: string;
}

// Using a generic form data type to support all transaction fields
interface TransactionFormData {
  from_position_id?: string | null;
  to_position_id?: string | null;
  to_company_id?: string | null;
  to_department_id?: string | null;
  pay_group_id?: string | null;
  new_weekly_hours?: number | null;
  benefits_change_required?: boolean;
  current_contract_end_date?: string | null;
  new_contract_end_date?: string | null;
  probation_applies?: boolean;
  pension_eligible?: boolean;
  [key: string]: any;
}

interface TransactionImpactSummaryProps {
  transactionType: TransactionType;
  formData: TransactionFormData;
  positions?: Array<{ id: string; title: string; code: string }>;
  departments?: Array<{ id: string; name: string }>;
  companies?: Array<{ id: string; name: string }>;
  payGroups?: Array<{ id: string; name: string; code: string }>;
  currentAssignment?: {
    company_name?: string | null;
    department_name?: string | null;
    position_title?: string | null;
    pay_group_name?: string | null;
  } | null;
  seatStatus?: {
    hasAvailableSeat: boolean;
    availableSeats: number;
  } | null;
  className?: string;
}

export function TransactionImpactSummary({
  transactionType,
  formData,
  positions = [],
  departments = [],
  companies = [],
  payGroups = [],
  currentAssignment,
  seatStatus,
  className,
}: TransactionImpactSummaryProps) {
  const { t } = useLanguage();

  const getPositionTitle = (id?: string | null) =>
    positions.find((p) => p.id === id)?.title || null;
  const getDepartmentName = (id?: string | null) =>
    departments.find((d) => d.id === id)?.name || null;
  const getCompanyName = (id?: string | null) =>
    companies.find((c) => c.id === id)?.name || null;
  const getPayGroupName = (id?: string | null) =>
    payGroups.find((pg) => pg.id === id)?.name || null;

  const impacts: ImpactItem[] = [];

  // Build impact items based on transaction type
  switch (transactionType) {
    case "PROMOTION":
    case "DEMOTION": {
      const fromPos = getPositionTitle(formData.from_position_id);
      const toPos = getPositionTitle(formData.to_position_id);

      if (fromPos || toPos) {
        impacts.push({
          label: t("common.position"),
          fromValue: fromPos,
          toValue: toPos,
          status: fromPos !== toPos ? "changed" : "unchanged",
        });
      }

      if (formData.pay_group_id) {
        impacts.push({
          label: t("workforce.modules.transactions.form.payGroup"),
          fromValue: currentAssignment?.pay_group_name || null,
          toValue: getPayGroupName(formData.pay_group_id),
          status: "changed",
        });
      }

      if (seatStatus) {
        impacts.push({
          label: t("workforce.modules.transactions.form.seatAvailability"),
          toValue: seatStatus.hasAvailableSeat
            ? `${seatStatus.availableSeats} ${t("common.available")}`
            : t("common.none"),
          status: seatStatus.hasAvailableSeat ? "changed" : "warning",
          message: !seatStatus.hasAvailableSeat
            ? t("workforce.modules.transactions.form.noSeatsWarning")
            : undefined,
        });
      }
      break;
    }

    case "TRANSFER": {
      if (currentAssignment) {
        if (formData.to_company_id) {
          const toCompany = getCompanyName(formData.to_company_id);
          impacts.push({
            label: t("common.company"),
            fromValue: currentAssignment.company_name,
            toValue: toCompany,
            status:
              currentAssignment.company_name !== toCompany ? "changed" : "unchanged",
          });
        }

        if (formData.to_department_id) {
          const toDept = getDepartmentName(formData.to_department_id);
          impacts.push({
            label: t("common.department"),
            fromValue: currentAssignment.department_name,
            toValue: toDept,
            status:
              currentAssignment.department_name !== toDept ? "changed" : "unchanged",
          });
        }

        if (formData.to_position_id) {
          const toPos = getPositionTitle(formData.to_position_id);
          impacts.push({
            label: t("common.position"),
            fromValue: currentAssignment.position_title,
            toValue: toPos,
            status:
              currentAssignment.position_title !== toPos ? "changed" : "unchanged",
          });
        }

        if (formData.pay_group_id) {
          impacts.push({
            label: t("workforce.modules.transactions.form.payGroup"),
            fromValue: currentAssignment.pay_group_name,
            toValue: getPayGroupName(formData.pay_group_id),
            status: "changed",
          });
        }
      }

      if (seatStatus) {
        impacts.push({
          label: t("workforce.modules.transactions.form.seatAvailability"),
          toValue: seatStatus.hasAvailableSeat
            ? `${seatStatus.availableSeats} ${t("common.available")}`
            : t("common.none"),
          status: seatStatus.hasAvailableSeat ? "changed" : "warning",
          message: !seatStatus.hasAvailableSeat
            ? t("workforce.modules.transactions.form.noSeatsWarning")
            : undefined,
        });
      }
      break;
    }

    case "STATUS_CHANGE": {
      if (formData.new_weekly_hours) {
        impacts.push({
          label: t("workforce.modules.transactions.form.statusChange.weeklyHours"),
          toValue: `${formData.new_weekly_hours} hrs/week`,
          status: "changed",
        });
      }

      if (formData.benefits_change_required) {
        impacts.push({
          label: t("workforce.modules.transactions.form.statusChange.benefits"),
          toValue: t("workforce.modules.transactions.form.statusChange.reviewRequired"),
          status: "warning",
          message: t("workforce.modules.transactions.form.statusChange.benefitsWarning"),
        });
      }
      break;
    }

    case "CONTRACT_EXTENSION": {
      if (formData.current_contract_end_date && formData.new_contract_end_date) {
        impacts.push({
          label: t("workforce.modules.transactions.form.contractExtension.contractEnd"),
          fromValue: formData.current_contract_end_date,
          toValue: formData.new_contract_end_date,
          status: "changed",
        });
      }
      break;
    }

    case "CONTRACT_CONVERSION": {
      impacts.push({
        label: t("workforce.modules.transactions.form.contractConversion.contractType"),
        fromValue: t("workforce.modules.transactions.form.contractConversion.fixedTerm"),
        toValue: t("workforce.modules.transactions.form.contractConversion.permanent"),
        status: "changed",
      });

      if (formData.probation_applies) {
        impacts.push({
          label: t("workforce.modules.transactions.form.contractConversion.probation"),
          toValue: t("common.yes"),
          status: "warning",
          message: t("workforce.modules.transactions.form.contractConversion.probationNote"),
        });
      }
      break;
    }

    case "RETIREMENT": {
      impacts.push({
        label: t("workforce.modules.transactions.form.retirement.status"),
        fromValue: t("workforce.modules.transactions.form.retirement.active"),
        toValue: t("workforce.modules.transactions.form.retirement.retired"),
        status: "removed",
      });

      if (formData.pension_eligible) {
        impacts.push({
          label: t("workforce.modules.transactions.form.retirement.pension"),
          toValue: t("common.eligible"),
          status: "changed",
        });
      }
      break;
    }

    default:
      break;
  }

  if (impacts.length === 0) return null;

  return (
    <div className={cn("rounded-lg border border-border p-4 space-y-3", className)}>
      <h4 className="text-sm font-medium flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="h-3 w-3 text-primary" />
        </span>
        {t("workforce.modules.transactions.form.impactSummary", "Transaction Impact")}
      </h4>

      <div className="space-y-2">
        {impacts.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between text-sm py-1.5 px-2 rounded-md",
              item.status === "warning" && "bg-warning/10",
              item.status === "removed" && "bg-destructive/10"
            )}
          >
            <span className="text-muted-foreground">{item.label}</span>
            <div className="flex items-center gap-2">
              {item.fromValue && (
                <>
                  <span
                    className={cn(
                      "text-muted-foreground",
                      item.status === "changed" && "line-through"
                    )}
                  >
                    {item.fromValue}
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </>
              )}
              <span
                className={cn(
                  "font-medium",
                  item.status === "changed" && "text-primary",
                  item.status === "warning" && "text-warning",
                  item.status === "removed" && "text-destructive",
                  item.status === "unchanged" && "text-muted-foreground"
                )}
              >
                {item.toValue || <Minus className="h-3 w-3" />}
              </span>
              {item.status === "warning" && (
                <AlertTriangle className="h-3 w-3 text-warning" />
              )}
            </div>
          </div>
        ))}
      </div>

      {impacts.some((i) => i.message) && (
        <div className="text-xs text-muted-foreground border-t border-border pt-2 mt-2">
          {impacts
            .filter((i) => i.message)
            .map((i, idx) => (
              <p key={idx} className="flex items-start gap-1">
                <AlertTriangle className="h-3 w-3 mt-0.5 text-warning shrink-0" />
                {i.message}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}
