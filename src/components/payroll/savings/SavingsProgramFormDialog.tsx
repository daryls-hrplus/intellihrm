import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SavingsProgramType,
  CreateSavingsProgramInput,
  CATEGORY_LABELS,
  RELEASE_TYPE_LABELS,
  CALCULATION_METHOD_LABELS,
  MONTH_NAMES,
  SavingsProgramCategory,
  CalculationMethod,
  ReleaseType,
  InterestCalculationMethod,
  useCreateSavingsProgram,
  useUpdateSavingsProgram,
} from "@/hooks/useSavingsPrograms";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  code: z.string().min(1, "Code is required").max(20),
  name: z.string().min(1, "Name is required").max(100),
  name_en: z.string().optional(),
  description: z.string().optional(),
  description_en: z.string().optional(),
  category: z.enum(['credit_union', 'company_sponsored', 'goal_based', 'project_tied', 'christmas_club']),
  calculation_method: z.enum(['fixed', 'percentage', 'formula']),
  default_amount: z.coerce.number().min(0).optional().nullable(),
  default_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  min_contribution: z.coerce.number().min(0).optional().nullable(),
  max_contribution: z.coerce.number().min(0).optional().nullable(),
  has_employer_match: z.boolean(),
  employer_match_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  employer_match_cap: z.coerce.number().min(0).optional().nullable(),
  employer_match_vesting_months: z.coerce.number().min(0).optional().nullable(),
  release_type: z.enum(['on_demand', 'scheduled', 'goal_reached', 'project_end', 'termination_only']),
  scheduled_release_month: z.coerce.number().min(1).max(12).optional().nullable(),
  scheduled_release_day: z.coerce.number().min(1).max(31).optional().nullable(),
  allow_early_withdrawal: z.boolean(),
  early_withdrawal_penalty_percentage: z.coerce.number().min(0).max(100).optional().nullable(),
  earns_interest: z.boolean(),
  interest_rate_annual: z.coerce.number().min(0).max(1).optional().nullable(),
  interest_calculation_method: z.enum(['simple', 'compound_monthly', 'compound_quarterly', 'compound_annually']).optional().nullable(),
  min_tenure_months: z.coerce.number().min(0),
  is_pretax: z.boolean(),
  deduction_priority: z.coerce.number().min(1).max(100),
  institution_name: z.string().optional(),
  institution_code: z.string().optional(),
  institution_account: z.string().optional(),
  is_active: z.boolean(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface SavingsProgramFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  program?: SavingsProgramType | null;
  duplicateFrom?: SavingsProgramType | null;
}

export function SavingsProgramFormDialog({
  open,
  onOpenChange,
  companyId,
  program,
  duplicateFrom,
}: SavingsProgramFormDialogProps) {
  const createProgram = useCreateSavingsProgram();
  const updateProgram = useUpdateSavingsProgram();
  const isEditing = !!program;
  const sourceProgram = program || duplicateFrom;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      name_en: "",
      description: "",
      description_en: "",
      category: "company_sponsored" as SavingsProgramCategory,
      calculation_method: "fixed" as CalculationMethod,
      default_amount: null,
      default_percentage: null,
      min_contribution: null,
      max_contribution: null,
      has_employer_match: false,
      employer_match_percentage: null,
      employer_match_cap: null,
      employer_match_vesting_months: null,
      release_type: "on_demand" as ReleaseType,
      scheduled_release_month: null,
      scheduled_release_day: null,
      allow_early_withdrawal: true,
      early_withdrawal_penalty_percentage: null,
      earns_interest: false,
      interest_rate_annual: null,
      interest_calculation_method: null,
      min_tenure_months: 0,
      is_pretax: false,
      deduction_priority: 50,
      institution_name: "",
      institution_code: "",
      institution_account: "",
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
    },
  });

  useEffect(() => {
    if (sourceProgram) {
      form.reset({
        code: duplicateFrom ? `${sourceProgram.code}_COPY` : sourceProgram.code,
        name: duplicateFrom ? `${sourceProgram.name} (Copy)` : sourceProgram.name,
        name_en: sourceProgram.name_en || "",
        description: sourceProgram.description || "",
        description_en: sourceProgram.description_en || "",
        category: sourceProgram.category,
        calculation_method: sourceProgram.calculation_method,
        default_amount: sourceProgram.default_amount,
        default_percentage: sourceProgram.default_percentage,
        min_contribution: sourceProgram.min_contribution,
        max_contribution: sourceProgram.max_contribution,
        has_employer_match: sourceProgram.has_employer_match,
        employer_match_percentage: sourceProgram.employer_match_percentage,
        employer_match_cap: sourceProgram.employer_match_cap,
        employer_match_vesting_months: sourceProgram.employer_match_vesting_months,
        release_type: sourceProgram.release_type,
        scheduled_release_month: sourceProgram.scheduled_release_month,
        scheduled_release_day: sourceProgram.scheduled_release_day,
        allow_early_withdrawal: sourceProgram.allow_early_withdrawal,
        early_withdrawal_penalty_percentage: sourceProgram.early_withdrawal_penalty_percentage,
        earns_interest: sourceProgram.earns_interest,
        interest_rate_annual: sourceProgram.interest_rate_annual,
        interest_calculation_method: sourceProgram.interest_calculation_method,
        min_tenure_months: sourceProgram.min_tenure_months,
        is_pretax: sourceProgram.is_pretax,
        deduction_priority: sourceProgram.deduction_priority,
        institution_name: sourceProgram.institution_name || "",
        institution_code: sourceProgram.institution_code || "",
        institution_account: sourceProgram.institution_account || "",
        is_active: duplicateFrom ? true : sourceProgram.is_active,
        start_date: duplicateFrom 
          ? new Date().toISOString().split('T')[0] 
          : sourceProgram.start_date,
        end_date: sourceProgram.end_date || "",
      });
    } else {
      form.reset({
        code: "",
        name: "",
        name_en: "",
        description: "",
        description_en: "",
        category: "company_sponsored",
        calculation_method: "fixed",
        default_amount: null,
        default_percentage: null,
        min_contribution: null,
        max_contribution: null,
        has_employer_match: false,
        employer_match_percentage: null,
        employer_match_cap: null,
        employer_match_vesting_months: null,
        release_type: "on_demand",
        scheduled_release_month: null,
        scheduled_release_day: null,
        allow_early_withdrawal: true,
        early_withdrawal_penalty_percentage: null,
        earns_interest: false,
        interest_rate_annual: null,
        interest_calculation_method: null,
        min_tenure_months: 0,
        is_pretax: false,
        deduction_priority: 50,
        institution_name: "",
        institution_code: "",
        institution_account: "",
        is_active: true,
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
      });
    }
  }, [sourceProgram, duplicateFrom, form]);

  const watchCategory = form.watch("category");
  const watchCalculationMethod = form.watch("calculation_method");
  const watchReleaseType = form.watch("release_type");
  const watchHasEmployerMatch = form.watch("has_employer_match");
  const watchEarnsInterest = form.watch("earns_interest");
  const watchAllowEarlyWithdrawal = form.watch("allow_early_withdrawal");

  const onSubmit = async (data: FormData) => {
    const input: CreateSavingsProgramInput = {
      company_id: companyId,
      code: data.code,
      name: data.name,
      name_en: data.name_en || undefined,
      description: data.description || undefined,
      description_en: data.description_en || undefined,
      category: data.category,
      calculation_method: data.calculation_method,
      default_amount: data.default_amount || undefined,
      default_percentage: data.default_percentage || undefined,
      min_contribution: data.min_contribution || undefined,
      max_contribution: data.max_contribution || undefined,
      has_employer_match: data.has_employer_match,
      employer_match_percentage: data.employer_match_percentage || undefined,
      employer_match_cap: data.employer_match_cap || undefined,
      employer_match_vesting_months: data.employer_match_vesting_months || undefined,
      release_type: data.release_type,
      scheduled_release_month: data.scheduled_release_month || undefined,
      scheduled_release_day: data.scheduled_release_day || undefined,
      allow_early_withdrawal: data.allow_early_withdrawal,
      early_withdrawal_penalty_percentage: data.early_withdrawal_penalty_percentage || undefined,
      earns_interest: data.earns_interest,
      interest_rate_annual: data.interest_rate_annual || undefined,
      interest_calculation_method: data.interest_calculation_method || undefined,
      min_tenure_months: data.min_tenure_months,
      is_pretax: data.is_pretax,
      deduction_priority: data.deduction_priority,
      institution_name: data.institution_name || undefined,
      institution_code: data.institution_code || undefined,
      institution_account: data.institution_account || undefined,
      is_active: data.is_active,
      start_date: data.start_date,
      end_date: data.end_date || undefined,
    };

    try {
      if (isEditing) {
        await updateProgram.mutateAsync({ id: program.id, ...input });
      } else {
        await createProgram.mutateAsync(input);
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isPending = createProgram.isPending || updateProgram.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Savings Program" : duplicateFrom ? "Duplicate Savings Program" : "Create Savings Program"}
          </DialogTitle>
          <DialogDescription>
            Configure the savings program settings. Employees will be able to enroll and contribute based on these rules.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] pr-4">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="contribution">Contribution</TabsTrigger>
                  <TabsTrigger value="matching">Matching</TabsTrigger>
                  <TabsTrigger value="release">Release</TabsTrigger>
                  <TabsTrigger value="institution">Institution</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., XMAS_CLUB" className="font-mono" />
                          </FormControl>
                          <FormDescription>Unique identifier</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Christmas Savings Club" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="name_en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (English)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="English translation" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} placeholder="Describe the savings program..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>Leave empty for ongoing</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="min_tenure_months"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min. Tenure (months)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min={0} />
                          </FormControl>
                          <FormDescription>Months of employment required</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deduction_priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deduction Priority</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} min={1} max={100} />
                          </FormControl>
                          <FormDescription>Order in payroll (1-100)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Active</FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_pretax"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Pre-Tax Deduction</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="contribution" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="calculation_method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calculation Method</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(CALCULATION_METHOD_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchCalculationMethod === 'fixed' && (
                    <FormField
                      control={form.control}
                      name="default_amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Amount</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormDescription>Default contribution per pay period</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {watchCalculationMethod === 'percentage' && (
                    <FormField
                      control={form.control}
                      name="default_percentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Percentage</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormDescription>Percentage of gross pay</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="min_contribution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Contribution</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="max_contribution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Contribution</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              value={field.value ?? ""} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <FormField
                      control={form.control}
                      name="earns_interest"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0 mb-4">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Earns Interest</FormLabel>
                        </FormItem>
                      )}
                    />

                    {watchEarnsInterest && (
                      <div className="grid grid-cols-2 gap-4 pl-6">
                        <FormField
                          control={form.control}
                          name="interest_rate_annual"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Annual Interest Rate</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.0001" 
                                  placeholder="e.g., 0.025 for 2.5%"
                                  {...field} 
                                  value={field.value ?? ""} 
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                />
                              </FormControl>
                              <FormDescription>Decimal (0.025 = 2.5%)</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="interest_calculation_method"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Interest Method</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                value={field.value || undefined}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="simple">Simple Interest</SelectItem>
                                  <SelectItem value="compound_monthly">Compound Monthly</SelectItem>
                                  <SelectItem value="compound_quarterly">Compound Quarterly</SelectItem>
                                  <SelectItem value="compound_annually">Compound Annually</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="matching" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="has_employer_match"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal">Employer Matching Contribution</FormLabel>
                      </FormItem>
                    )}
                  />

                  {watchHasEmployerMatch && (
                    <div className="space-y-4 pl-6 border-l-2 border-muted">
                      <FormField
                        control={form.control}
                        name="employer_match_percentage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Match Percentage</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="e.g., 50 for 50%"
                                {...field} 
                                value={field.value ?? ""} 
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormDescription>
                              Percentage of employee contribution that employer matches
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employer_match_cap"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Match Cap (per period)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                {...field} 
                                value={field.value ?? ""} 
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum employer contribution per pay period
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employer_match_vesting_months"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vesting Period (months)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                value={field.value ?? ""} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormDescription>
                              Months until employer match is fully vested (leave empty for immediate vesting)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="release" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="release_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Release Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(RELEASE_TYPE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          When accumulated savings can be released to the employee
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchReleaseType === 'scheduled' && (
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                      <FormField
                        control={form.control}
                        name="scheduled_release_month"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Release Month</FormLabel>
                            <Select 
                              onValueChange={(val) => field.onChange(parseInt(val))} 
                              value={field.value?.toString() || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {MONTH_NAMES.map((month, idx) => (
                                  <SelectItem key={idx + 1} value={(idx + 1).toString()}>
                                    {month}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="scheduled_release_day"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Release Day</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1} 
                                max={31} 
                                placeholder="1-31"
                                {...field} 
                                value={field.value ?? ""} 
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="border-t pt-4 mt-4">
                    <FormField
                      control={form.control}
                      name="allow_early_withdrawal"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0 mb-4">
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormLabel className="font-normal">Allow Early Withdrawal</FormLabel>
                        </FormItem>
                      )}
                    />

                    {watchAllowEarlyWithdrawal && (
                      <FormField
                        control={form.control}
                        name="early_withdrawal_penalty_percentage"
                        render={({ field }) => (
                          <FormItem className="pl-6">
                            <FormLabel>Early Withdrawal Penalty (%)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.01" 
                                placeholder="e.g., 5 for 5%"
                                {...field} 
                                value={field.value ?? ""} 
                                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              />
                            </FormControl>
                            <FormDescription>
                              Percentage deducted from balance for early withdrawal (leave empty for no penalty)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="institution" className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    For credit union or external institution transfers, configure the institution details here.
                  </p>

                  <FormField
                    control={form.control}
                    name="institution_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institution Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., ABC Credit Union" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="institution_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., ABCCU" className="font-mono" />
                          </FormControl>
                          <FormDescription>Routing/Swift code</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="institution_account"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution Account</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Company account number" className="font-mono" />
                          </FormControl>
                          <FormDescription>Company's account at institution</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>

            <div className="flex justify-end gap-2 pt-4 border-t mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update" : "Create"} Program
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
