import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Download, Printer } from 'lucide-react';
import { formatDateForDisplay } from "@/utils/dateUtils";

interface InvoicePreviewProps {
  invoice: {
    id: string;
    invoice_number: string;
    company_id: string;
    invoice_type: string;
    status: string;
    billing_period_start: string;
    billing_period_end: string;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    discount_amount: number;
    discount_description?: string;
    total_amount: number;
    currency: string;
    line_items: any[];
    issue_date: string;
    due_date: string;
    terms: string;
    footer_text: string;
    company?: { name: string };
  };
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const { data: settings } = useQuery({
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

  const { data: company } = useQuery({
    queryKey: ['company', invoice.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', invoice.company_id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: invoice.currency 
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-muted text-muted-foreground';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    // For now, use print-to-PDF functionality
    handlePrint();
  };

  return (
    <div className="bg-background">
      {/* Action buttons */}
      <div className="flex justify-end gap-2 mb-4 print:hidden">
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Invoice content */}
      <div className="p-8 border rounded-lg bg-card print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {settings?.company_name || 'HRplus Cerebra'}
            </h1>
            {settings?.company_address && (
              <p className="text-muted-foreground mt-1">{settings.company_address}</p>
            )}
            {settings?.company_email && (
              <p className="text-muted-foreground">{settings.company_email}</p>
            )}
            {settings?.company_phone && (
              <p className="text-muted-foreground">{settings.company_phone}</p>
            )}
            {settings?.company_tax_id && (
              <p className="text-muted-foreground">Tax ID: {settings.company_tax_id}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-primary">INVOICE</h2>
            <p className="text-lg font-medium mt-2">{invoice.invoice_number}</p>
            <Badge className={`mt-2 ${getStatusColor(invoice.status)}`}>
              {invoice.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Billing info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-muted-foreground mb-2">Bill To:</h3>
            <p className="font-medium">{company?.name || invoice.company?.name || 'Customer'}</p>
            {company?.address && <p className="text-muted-foreground">{company.address}</p>}
            {company?.email && <p className="text-muted-foreground">{company.email}</p>}
            {company?.phone && <p className="text-muted-foreground">{company.phone}</p>}
          </div>
          <div className="text-right">
            <div className="space-y-1">
              <p><span className="text-muted-foreground">Issue Date:</span> {formatDateForDisplay(invoice.issue_date, 'MMMM d, yyyy')}</p>
              <p><span className="text-muted-foreground">Due Date:</span> {formatDateForDisplay(invoice.due_date, 'MMMM d, yyyy')}</p>
              <p><span className="text-muted-foreground">Billing Period:</span></p>
              <p className="text-sm">{formatDateForDisplay(invoice.billing_period_start)} - {formatDateForDisplay(invoice.billing_period_end)}</p>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="border rounded-lg overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 font-semibold">Description</th>
                <th className="text-center p-3 font-semibold w-20">Qty</th>
                <th className="text-right p-3 font-semibold w-32">Unit Price</th>
                <th className="text-right p-3 font-semibold w-32">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.line_items.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.description}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="p-3 text-right">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.tax_amount > 0 && (
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            {invoice.discount_amount > 0 && (
              <div className="flex justify-between py-2 text-green-600">
                <span>Discount {invoice.discount_description && `(${invoice.discount_description})`}</span>
                <span>-{formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between py-2 text-lg font-bold">
              <span>Total Due</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        {invoice.terms && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Terms & Conditions</h4>
            <p className="text-sm text-muted-foreground">{invoice.terms}</p>
          </div>
        )}

        {/* Footer */}
        {invoice.footer_text && (
          <div className="mt-8 text-center text-muted-foreground">
            <p>{invoice.footer_text}</p>
          </div>
        )}
      </div>
    </div>
  );
}