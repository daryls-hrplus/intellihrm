import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface InvoiceSettingsFormData {
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_tax_id: string;
  invoice_prefix: string;
  default_tax_rate: number;
  default_payment_terms: number;
  default_currency: string;
  send_to_company_admin: boolean;
  additional_email_recipients: string;
  cc_system_admin: boolean;
  system_admin_email: string;
  invoice_terms: string;
  invoice_footer: string;
  send_renewal_reminder: boolean;
  renewal_reminder_days: number;
}

export function InvoiceSettingsForm() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<InvoiceSettingsFormData>();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['invoice-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_settings')
        .select('*')
        .is('company_id', null)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  useEffect(() => {
    if (settings) {
      reset({
        company_name: settings.company_name || '',
        company_address: settings.company_address || '',
        company_email: settings.company_email || '',
        company_phone: settings.company_phone || '',
        company_tax_id: settings.company_tax_id || '',
        invoice_prefix: settings.invoice_prefix || 'INV',
        default_tax_rate: settings.default_tax_rate || 0,
        default_payment_terms: settings.default_payment_terms || 30,
        default_currency: settings.default_currency || 'USD',
        send_to_company_admin: settings.send_to_company_admin ?? true,
        additional_email_recipients: settings.additional_email_recipients?.join(', ') || '',
        cc_system_admin: settings.cc_system_admin ?? true,
        system_admin_email: settings.system_admin_email || '',
        invoice_terms: settings.invoice_terms || '',
        invoice_footer: settings.invoice_footer || '',
        send_renewal_reminder: settings.send_renewal_reminder ?? true,
        renewal_reminder_days: settings.renewal_reminder_days || 10
      });
    }
  }, [settings, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: InvoiceSettingsFormData) => {
      const additionalEmails = data.additional_email_recipients
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const settingsData = {
        company_name: data.company_name,
        company_address: data.company_address,
        company_email: data.company_email,
        company_phone: data.company_phone,
        company_tax_id: data.company_tax_id,
        invoice_prefix: data.invoice_prefix,
        default_tax_rate: data.default_tax_rate,
        default_payment_terms: data.default_payment_terms,
        default_currency: data.default_currency,
        send_to_company_admin: data.send_to_company_admin,
        additional_email_recipients: additionalEmails,
        cc_system_admin: data.cc_system_admin,
        system_admin_email: data.system_admin_email,
        invoice_terms: data.invoice_terms,
        invoice_footer: data.invoice_footer,
        send_renewal_reminder: data.send_renewal_reminder,
        renewal_reminder_days: data.renewal_reminder_days
      };

      if (settings?.id) {
        const { error } = await supabase
          .from('invoice_settings')
          .update(settingsData)
          .eq('id', settings.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('invoice_settings')
          .insert({ ...settingsData, company_id: null });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Invoice settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['invoice-settings'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to save settings: ${error.message}`);
    }
  });

  const onSubmit = (data: InvoiceSettingsFormData) => {
    saveMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Invoice Settings
        </CardTitle>
        <CardDescription>
          Configure your invoice templates, email settings, and billing preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information */}
          <div>
            <h3 className="text-lg font-medium mb-4">Company Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input id="company_name" {...register('company_name')} placeholder="HRplus Cerebra" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_email">Email</Label>
                <Input id="company_email" type="email" {...register('company_email')} placeholder="billing@company.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_phone">Phone</Label>
                <Input id="company_phone" {...register('company_phone')} placeholder="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_tax_id">Tax ID</Label>
                <Input id="company_tax_id" {...register('company_tax_id')} placeholder="Tax/VAT Number" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="company_address">Address</Label>
                <Textarea id="company_address" {...register('company_address')} placeholder="123 Business St, City, Country" rows={2} />
              </div>
            </div>
          </div>

          <Separator />

          {/* Invoice Configuration */}
          <div>
            <h3 className="text-lg font-medium mb-4">Invoice Configuration</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                <Input id="invoice_prefix" {...register('invoice_prefix')} placeholder="INV" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_tax_rate">Default Tax Rate (%)</Label>
                <Input 
                  id="default_tax_rate" 
                  type="number" 
                  step="0.01" 
                  {...register('default_tax_rate', { valueAsNumber: true })} 
                  placeholder="0" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_payment_terms">Payment Terms (days)</Label>
                <Input 
                  id="default_payment_terms" 
                  type="number" 
                  {...register('default_payment_terms', { valueAsNumber: true })} 
                  placeholder="30" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default_currency">Default Currency</Label>
                <Input id="default_currency" {...register('default_currency')} placeholder="USD" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Email Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">Email Delivery</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send to Company Admin</Label>
                  <p className="text-sm text-muted-foreground">Send invoice emails to the company's admin email</p>
                </div>
                <Switch
                  checked={watch('send_to_company_admin')}
                  onCheckedChange={(checked) => setValue('send_to_company_admin', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additional_email_recipients">Additional Recipients</Label>
                <Input 
                  id="additional_email_recipients" 
                  {...register('additional_email_recipients')} 
                  placeholder="email1@company.com, email2@company.com" 
                />
                <p className="text-xs text-muted-foreground">Comma-separated list of email addresses</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>CC System Admin</Label>
                  <p className="text-sm text-muted-foreground">Send a copy of all invoices to system admin</p>
                </div>
                <Switch
                  checked={watch('cc_system_admin')}
                  onCheckedChange={(checked) => setValue('cc_system_admin', checked)}
                />
              </div>
              {watch('cc_system_admin') && (
                <div className="space-y-2">
                  <Label htmlFor="system_admin_email">System Admin Email</Label>
                  <Input 
                    id="system_admin_email" 
                    type="email"
                    {...register('system_admin_email')} 
                    placeholder="admin@yourcompany.com" 
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Renewal Reminders */}
          <div>
            <h3 className="text-lg font-medium mb-4">Renewal Reminders</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Send Renewal Reminders</Label>
                  <p className="text-sm text-muted-foreground">Automatically send invoice reminders before subscription renewal</p>
                </div>
                <Switch
                  checked={watch('send_renewal_reminder')}
                  onCheckedChange={(checked) => setValue('send_renewal_reminder', checked)}
                />
              </div>
              {watch('send_renewal_reminder') && (
                <div className="space-y-2">
                  <Label htmlFor="renewal_reminder_days">Days Before Renewal</Label>
                  <Input 
                    id="renewal_reminder_days" 
                    type="number"
                    {...register('renewal_reminder_days', { valueAsNumber: true })} 
                    placeholder="10" 
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Invoice Template */}
          <div>
            <h3 className="text-lg font-medium mb-4">Invoice Template</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_terms">Terms & Conditions</Label>
                <Textarea 
                  id="invoice_terms" 
                  {...register('invoice_terms')} 
                  placeholder="Payment is due within 30 days of invoice date..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice_footer">Invoice Footer</Label>
                <Textarea 
                  id="invoice_footer" 
                  {...register('invoice_footer')} 
                  placeholder="Thank you for your business!"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}