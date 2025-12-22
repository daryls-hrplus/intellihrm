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
    <div className={`p-6 space-y-3 ${style.container}`} id="payslip-document">
      {/* Header */}
      <div className={`p-3 pb-2 rounded-t-lg ${style.header}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {t.show_company_logo && logoUrl && (
              <img 
                src={logoUrl} 
                alt="Company Logo" 
                className="h-12 w-auto object-contain"
              />
            )}
            <div>
              <h1 className="text-lg font-bold leading-tight" style={{ color: t.primary_color }}>
                {companyName}
              </h1>
              {t.show_company_address && companyAddress && (
                <p className="text-xs text-muted-foreground whitespace-pre-line leading-tight">
                  {companyAddress}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-base font-semibold">PAYSLIP</h2>
            <p className="text-xs font-medium">{payslip.payslip_number}</p>
          </div>
        </div>
        {t.header_text && (
          <p className="mt-1 text-xs text-muted-foreground">{t.header_text}</p>
        )}
      </div>

      {/* Pay Period Info */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className={`p-2 rounded ${style.section}`}>
          <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Pay Period</p>
          <p className="font-medium">
            {formatDateForDisplay(payslip.pay_period_start, "MMM d, yyyy")} - {formatDateForDisplay(payslip.pay_period_end, "MMM d, yyyy")}
          </p>
        </div>
        <div className={`p-2 rounded ${style.section}`}>
          <p className="text-muted-foreground text-[10px] uppercase tracking-wide">Pay Date</p>
          <p className="font-medium">{formatDateForDisplay(payslip.pay_date, "MMMM d, yyyy")}</p>
        </div>
      </div>

      {/* Employee Info */}
      <div className={`p-2 rounded ${style.section}`}>
        <h3 className="font-semibold text-xs mb-1" style={{ color: t.primary_color }}>Employee Information</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs">
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
      <div className="rounded" style={{ padding: 0 }}>
        <h3 className="font-semibold mb-2 text-xs uppercase tracking-wide" style={{ color: t.primary_color }}>Earnings</h3>
        <table className="w-full text-xs border-collapse" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: t.show_ytd_totals ? 'calc(100% - 360px)' : 'calc(100% - 180px)' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '180px', display: t.show_ytd_totals ? undefined : 'none' }} />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-1.5 font-semibold text-foreground">Description</th>
              <th className="text-right py-1.5 font-semibold text-foreground pr-2">Current</th>
              {t.show_ytd_totals && (
                <th className="text-right py-1.5 font-semibold text-foreground pr-2">Year to Date</th>
              )}
            </tr>
          </thead>
          <tbody>
            {lineItems?.earnings && lineItems.earnings.length > 0 ? (
              lineItems.earnings.map((item, idx) => {
                const ytdTotal = (item.ytd || 0) + item.amount;
                return (
                  <tr key={idx} className="border-b border-border/40">
                    <td className="py-2">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5">
                          {item.name}
                          {item.is_prorated && (
                            <span className="text-[8px] font-bold uppercase bg-amber-100 text-amber-700 px-1 py-0.5 rounded">Pro</span>
                          )}
                          {item.job_title && (
                            <span className="text-[10px] text-muted-foreground">({getJobInitials(item.job_title)})</span>
                          )}
                        </span>
                        {item.is_prorated && item.effective_start && (
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(item.effective_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {' - '}
                            {item.effective_end 
                              ? new Date(item.effective_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                              : 'End'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-2 font-medium tabular-nums pr-2">{formatCurrency(item.amount, payslip.currency)}</td>
                    {t.show_ytd_totals && (
                      <td className="text-right py-2 tabular-nums text-muted-foreground pr-2">{formatCurrency(ytdTotal, payslip.currency)}</td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr className="border-b border-border/40">
                <td className="py-2">Gross Pay</td>
                <td className="text-right py-2 font-medium tabular-nums pr-2">{formatCurrency(payslip.gross_pay, payslip.currency)}</td>
                {t.show_ytd_totals && (
                  <td className="text-right py-2 tabular-nums text-muted-foreground pr-2">{formatCurrency(payslip.gross_pay, payslip.currency)}</td>
                )}
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/30">
              <td className="py-2 font-bold">Total Earnings</td>
              <td className="text-right py-2 font-bold tabular-nums pr-2" style={{ color: t.accent_color }}>{formatCurrency(payslip.gross_pay, payslip.currency)}</td>
              {t.show_ytd_totals && (
                <td className="text-right py-2 font-bold tabular-nums pr-2" style={{ color: t.accent_color }}>{formatCurrency((ytdTotals?.gross || 0) + payslip.gross_pay, payslip.currency)}</td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Deductions Section */}
      <div className="rounded" style={{ padding: 0 }}>
        <h3 className="font-semibold mb-2 text-xs uppercase tracking-wide" style={{ color: t.primary_color }}>Deductions</h3>
        <table className="w-full text-xs border-collapse" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: t.show_ytd_totals ? 'calc(100% - 360px)' : 'calc(100% - 180px)' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '180px', display: t.show_ytd_totals ? undefined : 'none' }} />
          </colgroup>
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-1.5 font-semibold text-foreground">Description</th>
              <th className="text-right py-1.5 font-semibold text-foreground pr-2">Current</th>
              {t.show_ytd_totals && (
                <th className="text-right py-1.5 font-semibold text-foreground pr-2">Year to Date</th>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Statutory/Taxes */}
            {lineItems?.taxes && lineItems.taxes.length > 0 && (
              <>
                <tr>
                  <td colSpan={t.show_ytd_totals ? 3 : 2} className="pt-2 pb-1">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Statutory Deductions</span>
                  </td>
                </tr>
                {lineItems.taxes.map((item, idx) => {
                  const ytdTotal = (item.ytd || 0) + item.amount;
                  return (
                    <tr key={`tax-${idx}`} className="border-b border-border/40">
                      <td className="py-2 pl-3">{item.name}</td>
                      <td className="text-right py-2 font-medium tabular-nums text-destructive pr-2">({formatCurrency(item.amount, payslip.currency)})</td>
                      {t.show_ytd_totals && (
                        <td className="text-right py-2 tabular-nums text-muted-foreground pr-2">({formatCurrency(ytdTotal, payslip.currency)})</td>
                      )}
                    </tr>
                  );
                })}
              </>
            )}
            
            {/* Other Deductions */}
            {lineItems?.deductions && lineItems.deductions.length > 0 && (
              <>
                <tr>
                  <td colSpan={t.show_ytd_totals ? 3 : 2} className="pt-2 pb-1">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Other Deductions</span>
                  </td>
                </tr>
                {lineItems.deductions.map((item, idx) => {
                  const ytdTotal = (item.ytd || 0) + item.amount;
                  return (
                    <tr key={`ded-${idx}`} className="border-b border-border/40">
                      <td className="py-2 pl-3">{item.name}</td>
                      <td className="text-right py-2 font-medium tabular-nums text-destructive pr-2">({formatCurrency(item.amount, payslip.currency)})</td>
                      {t.show_ytd_totals && (
                        <td className="text-right py-2 tabular-nums text-muted-foreground pr-2">({formatCurrency(ytdTotal, payslip.currency)})</td>
                      )}
                    </tr>
                  );
                })}
              </>
            )}
            
            {/* Fallback when no itemized deductions */}
            {(!lineItems?.taxes?.length && !lineItems?.deductions?.length) && (
              <tr className="border-b border-border/40">
                <td className="py-2">Total Deductions</td>
                <td className="text-right py-2 font-medium tabular-nums text-destructive pr-2">({formatCurrency(payslip.total_deductions, payslip.currency)})</td>
                {t.show_ytd_totals && (
                  <td className="text-right py-2 tabular-nums text-muted-foreground pr-2">({formatCurrency(payslip.total_deductions, payslip.currency)})</td>
                )}
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/30">
              <td className="py-2 font-bold">Total Deductions</td>
              <td className="text-right py-2 font-bold tabular-nums text-destructive pr-2">({formatCurrency(payslip.total_deductions, payslip.currency)})</td>
              {t.show_ytd_totals && (
                <td className="text-right py-2 font-bold tabular-nums text-destructive pr-2">({formatCurrency((ytdTotals?.deductions || 0) + payslip.total_deductions, payslip.currency)})</td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Net Pay */}
      <div className={`rounded-lg ${style.accent}`} style={{ borderColor: t.accent_color, borderWidth: '2px', padding: 0 }}>
        <table className="w-full text-xs border-collapse" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: t.show_ytd_totals ? 'calc(100% - 360px)' : 'calc(100% - 180px)' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '180px', display: t.show_ytd_totals ? undefined : 'none' }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="align-middle py-2.5 pl-3">
                <h3 className="text-lg font-bold" style={{ color: t.accent_color }}>NET PAY</h3>
                <p className="text-[10px] text-muted-foreground">Amount credited to your account</p>
              </td>
              <td className="text-right align-middle py-2.5 pr-2">
                <p className="text-xl font-bold tabular-nums" style={{ color: t.accent_color }}>
                  {formatCurrency(payslip.net_pay, payslip.currency)}
                </p>
              </td>
              {t.show_ytd_totals && (
                <td className="text-right align-middle py-2.5 pr-2">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-0.5">Year to Date</p>
                  <p className="text-lg font-bold tabular-nums" style={{ color: t.accent_color }}>
                    {formatCurrency((ytdTotals?.net || 0) + payslip.net_pay, payslip.currency)}
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
