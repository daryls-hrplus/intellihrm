import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2, Clock, Info } from "lucide-react";
import { getTodayString } from "@/utils/dateUtils";
import { useCompanyCurrencyList } from "@/hooks/useCompanyCurrencies";
import { useESSGatedSave } from "@/hooks/useESSGatedSave";
import { useAuth } from "@/contexts/AuthContext";
import { ESSGatedSaveDialog, PendingApprovalBadge } from "@/components/ess/ESSGatedSaveDialog";

interface BankAccount {
  id: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  routing_number: string | null;
  iban: string | null;
  swift_code: string | null;
  account_type: string;
  is_primary: boolean;
  currency: string;
  effective_date: string;
  end_date: string | null;
}

interface BankFormData {
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  routing_number: string;
  iban: string;
  swift_code: string;
  account_type: string;
  is_primary: boolean;
  currency: string;
  effective_date: string;
  end_date: string;
}

interface EmployeeBankAccountsTabProps {
  employeeId: string;
  companyId?: string;
}

export function EmployeeBankAccountsTab({ employeeId, companyId: propCompanyId }: EmployeeBankAccountsTabProps) {
  const { profile } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [employeeCompanyId, setEmployeeCompanyId] = useState<string | undefined>(propCompanyId);
  const { currencies } = useCompanyCurrencyList(employeeCompanyId);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<BankFormData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BankAccount | null>(null);

  // Use gated save hook for banking changes
  const {
    requiresApproval,
    requiresDocumentation,
    isDocumentationOptional,
    approvalMode,
    canDirectEdit,
    isSubmitting,
    gatedSave,
    hasPendingRequest,
    refetchPending,
  } = useESSGatedSave({
    requestType: 'banking',
    entityId: editingAccount?.id || null,
    entityTable: 'employee_bank_accounts',
    changeAction: editingAccount ? 'update' : 'create',
    employeeId,
    onDirectSave: async (newValues) => {
      // Direct save implementation (used when HR/Admin or auto-approve)
      if (editingAccount) {
        const { error } = await supabase
          .from("employee_bank_accounts")
          .update({
            bank_name: newValues.bank_name,
            account_holder_name: newValues.account_holder_name,
            account_number: newValues.account_number,
            routing_number: newValues.routing_number || null,
            iban: newValues.iban || null,
            swift_code: newValues.swift_code || null,
            account_type: newValues.account_type,
            is_primary: newValues.is_primary,
            currency: newValues.currency,
            effective_date: newValues.effective_date,
            end_date: newValues.end_date || null,
          })
          .eq("id", editingAccount.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("employee_bank_accounts")
          .insert([{
            employee_id: employeeId,
            bank_name: newValues.bank_name,
            account_holder_name: newValues.account_holder_name,
            account_number: newValues.account_number,
            routing_number: newValues.routing_number || null,
            iban: newValues.iban || null,
            swift_code: newValues.swift_code || null,
            account_type: newValues.account_type,
            is_primary: newValues.is_primary,
            currency: newValues.currency,
            effective_date: newValues.effective_date,
            end_date: newValues.end_date || null,
          }]);
        if (error) throw error;
      }
      
      fetchAccounts();
    },
  });

  // Separate hook instance for delete operations
  const deleteGatedSave = useESSGatedSave({
    requestType: 'banking',
    entityId: deleteTarget?.id || null,
    entityTable: 'employee_bank_accounts',
    changeAction: 'delete',
    employeeId,
    onDirectSave: async () => {
      if (!deleteTarget) return;
      const { error } = await supabase
        .from("employee_bank_accounts")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) throw error;
      fetchAccounts();
    },
  });

  const form = useForm<BankFormData>({
    defaultValues: {
      bank_name: "",
      account_holder_name: "",
      account_number: "",
      routing_number: "",
      iban: "",
      swift_code: "",
      account_type: "checking",
      is_primary: false,
      currency: "USD",
      effective_date: getTodayString(),
      end_date: "",
    },
  });

  // Fetch employee's company if not provided via props
  const fetchEmployeeCompany = async () => {
    if (propCompanyId) return;
    const { data } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", employeeId)
      .single();
    
    if (data?.company_id) {
      setEmployeeCompanyId(data.company_id);
    }
  };

  const fetchAccounts = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("employee_bank_accounts")
      .select("*")
      .eq("employee_id", employeeId)
      .order("is_primary", { ascending: false });

    if (error) {
      toast.error("Failed to load bank accounts");
    } else {
      setAccounts(data || []);
    }
    setIsLoading(false);
    refetchPending();
  };

  useEffect(() => {
    fetchEmployeeCompany();
    fetchAccounts();
  }, [employeeId, propCompanyId]);

  const handleSubmit = async (data: BankFormData) => {
    try {
      // Handle primary account toggle
      if (data.is_primary && !editingAccount?.is_primary) {
        await supabase
          .from("employee_bank_accounts")
          .update({ is_primary: false })
          .eq("employee_id", employeeId);
      }

      const payload = {
        ...data,
        routing_number: data.routing_number || null,
        iban: data.iban || null,
        swift_code: data.swift_code || null,
        end_date: data.end_date || null,
      };

      // If approval is required, show the approval dialog
      if (requiresApproval) {
        setPendingFormData(data);
        setDialogOpen(false);
        setApprovalDialogOpen(true);
        return;
      }

      // Otherwise, use gated save (which handles HR/Admin or auto-approve)
      await gatedSave({
        currentValues: editingAccount ? {
          bank_name: editingAccount.bank_name,
          account_holder_name: editingAccount.account_holder_name,
          account_number: editingAccount.account_number,
          routing_number: editingAccount.routing_number,
          iban: editingAccount.iban,
          swift_code: editingAccount.swift_code,
          account_type: editingAccount.account_type,
          is_primary: editingAccount.is_primary,
          currency: editingAccount.currency,
          effective_date: editingAccount.effective_date,
          end_date: editingAccount.end_date,
        } : null,
        newValues: payload,
      });

      setDialogOpen(false);
      setEditingAccount(null);
      form.reset();
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  const handleApprovalSubmit = async (notes: string, documentUrls: string[]) => {
    if (!pendingFormData) return;

    const payload = {
      ...pendingFormData,
      routing_number: pendingFormData.routing_number || null,
      iban: pendingFormData.iban || null,
      swift_code: pendingFormData.swift_code || null,
      end_date: pendingFormData.end_date || null,
    };

    await gatedSave({
      currentValues: editingAccount ? {
        bank_name: editingAccount.bank_name,
        account_holder_name: editingAccount.account_holder_name,
        account_number: editingAccount.account_number,
        routing_number: editingAccount.routing_number,
        iban: editingAccount.iban,
        swift_code: editingAccount.swift_code,
        account_type: editingAccount.account_type,
        is_primary: editingAccount.is_primary,
        currency: editingAccount.currency,
        effective_date: editingAccount.effective_date,
        end_date: editingAccount.end_date,
      } : null,
      newValues: payload,
      notes,
      documentUrls,
    });

    setPendingFormData(null);
    setEditingAccount(null);
    form.reset();
  };

  const handleEdit = (account: BankAccount) => {
    // Check if there's a pending request for this account
    if (hasPendingRequest(account.id, 'employee_bank_accounts')) {
      toast.info("This account has a pending change request");
      return;
    }

    setEditingAccount(account);
    form.reset({
      bank_name: account.bank_name,
      account_holder_name: account.account_holder_name,
      account_number: account.account_number,
      routing_number: account.routing_number || "",
      iban: account.iban || "",
      swift_code: account.swift_code || "",
      account_type: account.account_type,
      is_primary: account.is_primary,
      currency: account.currency,
      effective_date: account.effective_date,
      end_date: account.end_date || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (account: BankAccount) => {
    // Check if there's a pending request for this account
    if (hasPendingRequest(account.id, 'employee_bank_accounts')) {
      toast.info("This account has a pending change request");
      return;
    }

    if (!confirm("Are you sure you want to delete this bank account?")) return;

    setDeleteTarget(account);
    
    try {
      if (deleteGatedSave.requiresApproval) {
        // Submit deletion request
        await deleteGatedSave.gatedSave({
          currentValues: {
            bank_name: account.bank_name,
            account_holder_name: account.account_holder_name,
            account_number: account.account_number,
          },
          newValues: { _deleted: true },
        });
      } else {
        await deleteGatedSave.gatedSave({
          currentValues: null,
          newValues: {},
        });
      }
    } catch (error) {
      toast.error("Failed to delete bank account");
    } finally {
      setDeleteTarget(null);
    }
  };

  const openNewDialog = () => {
    setEditingAccount(null);
    form.reset({
      bank_name: "",
      account_holder_name: "",
      account_number: "",
      routing_number: "",
      iban: "",
      swift_code: "",
      account_type: "checking",
      is_primary: accounts.length === 0,
      currency: "USD",
      effective_date: getTodayString(),
      end_date: "",
    });
    setDialogOpen(true);
  };

  const maskAccountNumber = (num: string) => {
    if (num.length <= 4) return num;
    return "****" + num.slice(-4);
  };

  return (
    <div className="space-y-4">
      {/* Show info alert if approval is required */}
      {requiresApproval && !canDirectEdit && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Changes to bank accounts require {approvalMode === 'workflow' ? 'workflow' : 'HR'} approval before taking effect.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Bank Accounts</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAccount ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="bank_name"
                  rules={{ required: "Bank name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bank Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="account_holder_name"
                  rules={{ required: "Account holder name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="account_number"
                    rules={{ required: "Account number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="routing_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Routing Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IBAN</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="swift_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SWIFT/BIC Code</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="checking">Checking</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currencies.map((currency) => (
                              <SelectItem key={currency.id} value={currency.code}>
                                {currency.code} - {currency.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="effective_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
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
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="is_primary"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Primary Account</FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {requiresApproval ? "Continue" : "Save"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            No bank accounts on file
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => {
            const isPending = hasPendingRequest(account.id, 'employee_bank_accounts');
            
            return (
              <Card key={account.id} className={isPending ? "opacity-75" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{account.bank_name}</CardTitle>
                      {account.is_primary && <Badge variant="default">Primary</Badge>}
                      <Badge variant="outline" className="capitalize">{account.account_type}</Badge>
                      {isPending && <PendingApprovalBadge />}
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEdit(account)}
                        disabled={isPending}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(account)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Account Holder:</span>{" "}
                      {account.account_holder_name}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Account:</span>{" "}
                      {maskAccountNumber(account.account_number)}
                    </div>
                    {account.routing_number && (
                      <div>
                        <span className="text-muted-foreground">Routing:</span> {account.routing_number}
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Currency:</span> {account.currency}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Approval Dialog */}
      <ESSGatedSaveDialog
        open={approvalDialogOpen}
        onOpenChange={(open) => {
          setApprovalDialogOpen(open);
          if (!open) {
            setPendingFormData(null);
          }
        }}
        title={editingAccount ? "Submit Bank Account Changes" : "Submit New Bank Account"}
        description="This change requires approval before taking effect"
        approvalMode={approvalMode}
        requiresDocumentation={requiresDocumentation}
        isDocumentationOptional={isDocumentationOptional}
        onSubmit={handleApprovalSubmit}
        isSubmitting={isSubmitting}
        employeeId={employeeId}
      >
        {pendingFormData && (
          <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
            <p><span className="text-muted-foreground">Bank:</span> {pendingFormData.bank_name}</p>
            <p><span className="text-muted-foreground">Account:</span> ****{pendingFormData.account_number.slice(-4)}</p>
            <p><span className="text-muted-foreground">Type:</span> {pendingFormData.account_type}</p>
          </div>
        )}
      </ESSGatedSaveDialog>
    </div>
  );
}
