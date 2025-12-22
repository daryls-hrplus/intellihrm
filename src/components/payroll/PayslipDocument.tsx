import { formatDateForDisplay } from "@/utils/dateUtils";
import { PayslipTemplate } from "@/hooks/usePayslipTemplates";
import { Payslip } from "@/hooks/usePayroll";
import { Separator } from "@/components/ui/separator";

interface PayslipDocumentProps {
  payslip: Payslip;
  template: PayslipTemplate | null;
  employee?: {
    full_name: string;
    email: string;
    employee_number?: string;
    department?: string;
    position?: string;
    address?: string;
  };
  company?: {
    name: string;
    address?: string;
    logo_url?: string;
  };
  lineItems?: {
    earnings: Array<{ 
      name: string; 
      amount: number; 
      ytd?: number;
      job_title?: string;
      is_prorated?: boolean;
      effective_start?: string;
      effective_end?: string;
    }>;
    deductions: Array<{ name: string; amount: number; ytd?: number }>;
    taxes: Array<{ name: string; amount: number; ytd?: number }>;
    employer: Array<{ name: string; amount: number }>;
  };
  ytdTotals?: {
    gross: number;
    deductions: number;
    net: number;
  };
}

export function PayslipDocument({
  payslip,
  template,
  employee,
  company,
  lineItems,
  ytdTotals,
}: PayslipDocumentProps) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getJobInitials = (jobName: string) => {
    return jobName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  // Default template values if none provided
  const t = template || {
    template_style: 'classic' as const,
    primary_color: '#1e40af',
    secondary_color: '#64748b',
    accent_color: '#059669',
    show_company_logo: true,
    show_company_address: true,
    show_employee_address: true,
    show_employee_id: true,
    show_department: true,
    show_position: true,
    show_ytd_totals: true,
    show_tax_breakdown: true,
    show_statutory_breakdown: true,
    footer_text: 'This is a computer-generated document. No signature required.',
    confidentiality_notice: 'CONFIDENTIAL - For employee use only',
    company_name_override: null,
    company_address: null,
    company_logo_url: null,
    header_text: null,
  };

  const companyName = t.company_name_override || company?.name || 'Company Name';
  const companyAddress = t.company_address || company?.address;
  const logoUrl = t.company_logo_url || company?.logo_url;

  const styleClasses = {
    classic: {
      container: 'bg-white border border-border rounded-lg shadow-sm',
      header: 'bg-muted/50 border-b',
      section: 'border border-border rounded-md',
      accent: 'bg-primary/5',
    },
    modern: {
      container: 'bg-gradient-to-br from-background to-muted/30 border-0 shadow-lg rounded-xl',
      header: 'bg-gradient-to-r from-primary/10 to-primary/5 border-b-0',
      section: 'bg-card/50 backdrop-blur rounded-lg border-0 shadow-sm',
      accent: 'bg-gradient-to-r from-primary/10 to-accent/10',
    },
    minimal: {
      container: 'bg-background border-0',
      header: 'border-b-2 border-primary',
      section: 'border-l-2 border-muted pl-4',
      accent: 'border-l-4 border-primary pl-4',
    },
  };

  const style = styleClasses[t.template_style];

  return (
    <div className={`p-6 space-y-6 ${style.container}`} id="payslip-document">
      {/* Header */}
      <div className={`p-4 rounded-t-lg ${style.header}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {t.show_company_logo && logoUrl && (
              <img 
                src={logoUrl} 
                alt="Company Logo" 
                className="h-16 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="text-xl font-bold" style={{ color: t.primary_color }}>
                {companyName}
              </h1>
              {t.show_company_address && companyAddress && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {companyAddress}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold">PAYSLIP</h2>
            <p className="text-sm font-medium">{payslip.payslip_number}</p>
          </div>
        </div>
        {t.header_text && (
          <p className="mt-2 text-sm text-muted-foreground">{t.header_text}</p>
        )}
      </div>

      {/* Pay Period Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className={`p-3 rounded ${style.section}`}>
          <p className="text-muted-foreground">Pay Period</p>
          <p className="font-medium">
            {formatDateForDisplay(payslip.pay_period_start, "MMM d, yyyy")} - {formatDateForDisplay(payslip.pay_period_end, "MMM d, yyyy")}
          </p>
        </div>
        <div className={`p-3 rounded ${style.section}`}>
          <p className="text-muted-foreground">Pay Date</p>
          <p className="font-medium">{formatDateForDisplay(payslip.pay_date, "MMMM d, yyyy")}</p>
        </div>
      </div>

      {/* Employee Info */}
      <div className={`p-4 rounded ${style.section}`}>
        <h3 className="font-semibold mb-2" style={{ color: t.primary_color }}>Employee Information</h3>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Name:</span>
            <span className="ml-2 font-medium">{employee?.full_name || 'N/A'}</span>
          </div>
          {t.show_employee_id && employee?.employee_number && (
            <div>
              <span className="text-muted-foreground">Employee ID:</span>
              <span className="ml-2 font-medium">{employee.employee_number}</span>
            </div>
          )}
          {t.show_department && employee?.department && (
            <div>
              <span className="text-muted-foreground">Department:</span>
              <span className="ml-2 font-medium">{employee.department}</span>
            </div>
          )}
          {t.show_position && employee?.position && (
            <div>
              <span className="text-muted-foreground">Position:</span>
              <span className="ml-2 font-medium">{employee.position}</span>
            </div>
          )}
        </div>
      </div>

      {/* Earnings Section */}
      <div className={`p-4 rounded ${style.section}`}>
        <h3 className="font-semibold mb-3" style={{ color: t.primary_color }}>Earnings</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1.5 font-medium text-muted-foreground">Description</th>
              <th className="text-right py-1.5 font-medium text-muted-foreground w-28">Current</th>
              {t.show_ytd_totals && (
                <th className="text-right py-1.5 font-medium text-muted-foreground w-28">YTD</th>
              )}
            </tr>
          </thead>
          <tbody>
            {lineItems?.earnings && lineItems.earnings.length > 0 ? (
              lineItems.earnings.map((item, idx) => (
                <tr key={idx} className="border-b border-border/30 last:border-0">
                  <td className="py-1.5">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1">
                        {item.name}
                        {item.is_prorated && (
                          <span className="text-[5px] font-bold uppercase bg-amber-100 text-amber-700 px-0.5 rounded leading-tight">Pro</span>
                        )}
                        {item.job_title && (
                          <span className="text-[6px] text-muted-foreground ml-1">{getJobInitials(item.job_title)}</span>
                        )}
                      </span>
                      {item.is_prorated && item.effective_start && (
                        <span className="text-[6px] text-muted-foreground leading-tight">
                          {new Date(item.effective_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' - '}
                          {item.effective_end 
                            ? new Date(item.effective_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'End'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-right py-1.5 font-medium">{formatCurrency(item.amount, payslip.currency)}</td>
                  {t.show_ytd_totals && (
                    <td className="text-right py-1.5 text-muted-foreground">{item.ytd ? formatCurrency(item.ytd, payslip.currency) : '-'}</td>
                  )}
                </tr>
              ))
            ) : (
              <tr className="border-b border-border/30">
                <td className="py-1.5">Gross Pay</td>
                <td className="text-right py-1.5 font-medium">{formatCurrency(payslip.gross_pay, payslip.currency)}</td>
                {t.show_ytd_totals && (
                  <td className="text-right py-1.5 text-muted-foreground">-</td>
                )}
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td className="py-2 font-semibold">Total Earnings</td>
              <td className="text-right py-2 font-semibold" style={{ color: t.accent_color }}>{formatCurrency(payslip.gross_pay, payslip.currency)}</td>
              {t.show_ytd_totals && ytdTotals && (
                <td className="text-right py-2 font-semibold" style={{ color: t.accent_color }}>{formatCurrency(ytdTotals.gross, payslip.currency)}</td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Deductions Section */}
      <div className={`p-4 rounded ${style.section}`}>
        <h3 className="font-semibold mb-3" style={{ color: t.primary_color }}>Deductions</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-1.5 font-medium text-muted-foreground">Description</th>
              <th className="text-right py-1.5 font-medium text-muted-foreground w-28">Current</th>
              {t.show_ytd_totals && (
                <th className="text-right py-1.5 font-medium text-muted-foreground w-28">YTD</th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Statutory/Taxes */}
            {lineItems?.taxes && lineItems.taxes.length > 0 && (
              <>
                <tr>
                  <td colSpan={t.show_ytd_totals ? 3 : 2} className="pt-2 pb-1">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Statutory Deductions</span>
                  </td>
                </tr>
                {lineItems.taxes.map((item, idx) => (
                  <tr key={`tax-${idx}`} className="border-b border-border/30 last:border-0">
                    <td className="py-1.5">{item.name}</td>
                    <td className="text-right py-1.5 font-medium text-destructive">-{formatCurrency(item.amount, payslip.currency)}</td>
                    {t.show_ytd_totals && (
                      <td className="text-right py-1.5 text-muted-foreground">{item.ytd ? `-${formatCurrency(item.ytd, payslip.currency)}` : '-'}</td>
                    )}
                  </tr>
                ))}
              </>
            )}
            
            {/* Other Deductions */}
            {lineItems?.deductions && lineItems.deductions.length > 0 && (
              <>
                <tr>
                  <td colSpan={t.show_ytd_totals ? 3 : 2} className="pt-2 pb-1">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Other Deductions</span>
                  </td>
                </tr>
                {lineItems.deductions.map((item, idx) => (
                  <tr key={`ded-${idx}`} className="border-b border-border/30 last:border-0">
                    <td className="py-1.5">{item.name}</td>
                    <td className="text-right py-1.5 font-medium text-destructive">-{formatCurrency(item.amount, payslip.currency)}</td>
                    {t.show_ytd_totals && (
                      <td className="text-right py-1.5 text-muted-foreground">{item.ytd ? `-${formatCurrency(item.ytd, payslip.currency)}` : '-'}</td>
                    )}
                  </tr>
                ))}
              </>
            )}
            
            {/* Fallback when no itemized deductions */}
            {(!lineItems?.taxes?.length && !lineItems?.deductions?.length) && (
              <tr className="border-b border-border/30">
                <td className="py-1.5">Total Deductions</td>
                <td className="text-right py-1.5 font-medium text-destructive">-{formatCurrency(payslip.total_deductions, payslip.currency)}</td>
                {t.show_ytd_totals && (
                  <td className="text-right py-1.5 text-muted-foreground">-</td>
                )}
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td className="py-2 font-semibold">Total Deductions</td>
              <td className="text-right py-2 font-semibold text-destructive">-{formatCurrency(payslip.total_deductions, payslip.currency)}</td>
              {t.show_ytd_totals && ytdTotals && (
                <td className="text-right py-2 font-semibold text-destructive">-{formatCurrency(ytdTotals.deductions, payslip.currency)}</td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Net Pay */}
      <div className={`p-4 rounded-lg ${style.accent}`} style={{ borderColor: t.accent_color }}>
        <table className="w-full">
          <tbody>
            <tr>
              <td className="align-middle">
                <h3 className="text-lg font-bold" style={{ color: t.accent_color }}>NET PAY</h3>
                <p className="text-sm text-muted-foreground">Amount credited to your account</p>
              </td>
              <td className="text-right w-28 align-middle">
                <p className="text-xl font-bold" style={{ color: t.accent_color }}>
                  {formatCurrency(payslip.net_pay, payslip.currency)}
                </p>
              </td>
              {t.show_ytd_totals && ytdTotals && (
                <td className="text-right w-28 align-middle">
                  <p className="text-sm text-muted-foreground">YTD</p>
                  <p className="text-lg font-bold" style={{ color: t.accent_color }}>
                    {formatCurrency(ytdTotals.net, payslip.currency)}
                  </p>
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
        {t.confidentiality_notice && (
          <p className="font-medium">{t.confidentiality_notice}</p>
        )}
        {t.footer_text && (
          <p>{t.footer_text}</p>
        )}
      </div>
    </div>
  );
}
