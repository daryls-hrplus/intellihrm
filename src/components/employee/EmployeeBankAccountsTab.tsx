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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";

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

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string | null;
}

interface EmployeeBankAccountsTabProps {
  employeeId: string;
}

export function EmployeeBankAccountsTab({ employeeId }: EmployeeBankAccountsTabProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

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
      effective_date: new Date().toISOString().split("T")[0],
      end_date: "",
    },
  });

  const fetchCurrencies = async () => {
    const { data, error } = await supabase
      .from("currencies")
      .select("*")
      .eq("is_active", true)
      .order("code");

    if (!error && data) {
      setCurrencies(data);
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
  };

  useEffect(() => {
    fetchCurrencies();
    fetchAccounts();
  }, [employeeId]);

  const handleSubmit = async (data: BankFormData) => {
    try {
      if (data.is_primary) {
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

      if (editingAccount) {
        const { error } = await supabase
          .from("employee_bank_accounts")
          .update(payload)
          .eq("id", editingAccount.id);

        if (error) throw error;
        toast.success("Bank account updated");
      } else {
        const { error } = await supabase.from("employee_bank_accounts").insert({
          employee_id: employeeId,
          ...payload,
        });

        if (error) throw error;
        toast.success("Bank account added");
      }

      setDialogOpen(false);
      setEditingAccount(null);
      form.reset();
      fetchAccounts();
    } catch (error) {
      toast.error("Failed to save bank account");
    }
  };

  const handleEdit = (account: BankAccount) => {
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

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("employee_bank_accounts").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete bank account");
    } else {
      toast.success("Bank account deleted");
      fetchAccounts();
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
      effective_date: new Date().toISOString().split("T")[0],
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
                  <Button type="submit">Save</Button>
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
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{account.bank_name}</CardTitle>
                    {account.is_primary && <Badge variant="default">Primary</Badge>}
                    <Badge variant="outline" className="capitalize">{account.account_type}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(account)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(account.id)}>
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
          ))}
        </div>
      )}
    </div>
  );
}
