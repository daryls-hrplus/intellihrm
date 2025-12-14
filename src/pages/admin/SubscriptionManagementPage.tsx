import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, CreditCard, FileText, Settings, Check, X, Clock, 
  DollarSign, Users, Package, Loader2 
} from 'lucide-react';
import { format } from 'date-fns';

interface CompanySubscription {
  id: string;
  company_id: string;
  tier_id: string | null;
  status: string;
  billing_cycle: string;
  payment_method: string | null;
  active_employee_count: number;
  monthly_amount: number | null;
  trial_started_at: string;
  trial_ends_at: string;
  grace_period_ends_at: string | null;
  subscription_started_at: string | null;
  contact_name: string | null;
  contact_email: string | null;
  selected_modules: string[];
  companies?: { name: string };
  subscription_tiers?: { name: string };
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  billing_period_start: string;
  billing_period_end: string;
  due_date: string;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  paid_at: string | null;
  company_subscriptions?: {
    companies?: { name: string };
  };
}

interface Tier {
  id: string;
  name: string;
  code: string;
  description: string | null;
  modules: string[];
  base_price_monthly: number;
  price_per_employee: number;
  is_active: boolean;
}

export default function SubscriptionManagementPage() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState<CompanySubscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch subscriptions with company names
      const { data: subs, error: subsError } = await supabase
        .from('company_subscriptions')
        .select(`
          *,
          companies:company_id(name),
          subscription_tiers:tier_id(name)
        `)
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;
      setSubscriptions((subs || []).map(s => ({
        ...s,
        selected_modules: Array.isArray(s.selected_modules) ? s.selected_modules as string[] : []
      } as CompanySubscription)));

      // Fetch invoices
      const { data: invs, error: invsError } = await supabase
        .from('subscription_invoices')
        .select(`
          *,
          company_subscriptions!inner(
            companies:company_id(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (invsError) throw invsError;
      setInvoices(invs || []);

      // Fetch tiers
      const { data: tierData, error: tierError } = await supabase
        .from('subscription_tiers')
        .select('*')
        .order('display_order');

      if (tierError) throw tierError;
      setTiers((tierData || []).map(t => ({
        ...t,
        modules: Array.isArray(t.modules) ? t.modules as string[] : []
      } as Tier)));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!selectedInvoice) return;

    try {
      const { error } = await supabase
        .from('subscription_invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_reference: paymentReference
        })
        .eq('id', selectedInvoice.id);

      if (error) throw error;

      toast({
        title: "Invoice Marked as Paid",
        description: `Invoice ${selectedInvoice.invoice_number} has been marked as paid.`
      });

      setShowPaymentDialog(false);
      setSelectedInvoice(null);
      setPaymentReference('');
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      trial: { variant: 'secondary', label: 'Trial' },
      active: { variant: 'default', label: 'Active' },
      grace_period: { variant: 'outline', label: 'Grace Period' },
      expired: { variant: 'destructive', label: 'Expired' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      pending: { variant: 'outline', label: 'Pending' },
      paid: { variant: 'default', label: 'Paid' },
      overdue: { variant: 'destructive', label: 'Overdue' }
    };
    const config = variants[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground">Manage company subscriptions and invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{subscriptions.length}</div>
                <div className="text-sm text-muted-foreground">Total Subscriptions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {subscriptions.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {subscriptions.filter(s => s.status === 'trial').length}
                </div>
                <div className="text-sm text-muted-foreground">On Trial</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {invoices.filter(i => i.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending Invoices</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="tiers">Pricing Tiers</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Employees</TableHead>
                    <TableHead>Monthly Amount</TableHead>
                    <TableHead>Trial Ends</TableHead>
                    <TableHead>Contact</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        {sub.companies?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{sub.subscription_tiers?.name || 'Custom'}</TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>{sub.active_employee_count}</TableCell>
                      <TableCell>
                        {sub.monthly_amount ? `$${sub.monthly_amount.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(sub.trial_ends_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{sub.contact_name}</div>
                          <div className="text-muted-foreground">{sub.contact_email}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {subscriptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                      <TableCell>
                        {inv.company_subscriptions?.companies?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {inv.currency} {inv.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(inv.billing_period_start), 'MMM dd')} - {format(new Date(inv.billing_period_end), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        {format(new Date(inv.due_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(inv.status)}</TableCell>
                      <TableCell className="capitalize">
                        {inv.payment_method?.replace('_', ' ') || '-'}
                      </TableCell>
                      <TableCell>
                        {inv.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowPaymentDialog(true);
                            }}
                          >
                            Mark Paid
                          </Button>
                        )}
                        {inv.status === 'paid' && inv.payment_reference && (
                          <span className="text-sm text-muted-foreground">
                            Ref: {inv.payment_reference}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {invoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="mt-4">
          <div className="grid md:grid-cols-3 gap-4">
            {tiers.map((tier) => (
              <Card key={tier.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{tier.name}</CardTitle>
                    <Badge variant={tier.is_active ? 'default' : 'secondary'}>
                      {tier.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold">${tier.base_price_monthly}</div>
                      <div className="text-sm text-muted-foreground">
                        + ${tier.price_per_employee}/employee/month
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Modules ({tier.modules.length})</div>
                      <div className="flex flex-wrap gap-1">
                        {tier.modules.map((mod) => (
                          <Badge key={mod} variant="outline" className="text-xs">
                            {mod}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Mark Paid Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
            <DialogDescription>
              Enter the payment reference or transaction ID for invoice {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Amount</Label>
              <div className="text-2xl font-bold">
                {selectedInvoice?.currency} {selectedInvoice?.amount.toFixed(2)}
              </div>
            </div>
            <div>
              <Label htmlFor="paymentRef">Payment Reference / Transaction ID</Label>
              <Input
                id="paymentRef"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g., WIRE-12345 or TXN-ABC123"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkPaid}>
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
