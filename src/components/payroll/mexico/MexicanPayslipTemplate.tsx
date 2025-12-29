import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Perception {
  code: string;
  description: string;
  taxable: number;
  exempt: number;
  total: number;
}

interface Deduction {
  code: string;
  description: string;
  amount: number;
}

interface MexicanPayslipData {
  // Company info
  companyName: string;
  companyRfc: string;
  registroPatronal: string;
  companyAddress: string;
  
  // Employee info
  employeeName: string;
  employeeRfc: string;
  curp: string;
  nss: string;
  department: string;
  position: string;
  contractType: string;
  workShift: string;
  startDate: string;
  
  // Payroll period
  periodStart: string;
  periodEnd: string;
  paymentDate: string;
  paymentDays: number;
  
  // CFDI info
  cfdiUuid?: string;
  folio?: string;
  serie?: string;
  timbradoDate?: string;
  
  // Amounts
  perceptions: Perception[];
  deductions: Deduction[];
  otherPayments?: { code: string; description: string; amount: number }[];
  
  // Totals
  totalPerceptions: number;
  totalDeductions: number;
  netPay: number;
  
  // SDI/SBC
  sdi: number;
  sbc: number;
}

interface MexicanPayslipTemplateProps {
  data: MexicanPayslipData;
  showQR?: boolean;
}

export function MexicanPayslipTemplate({ data, showQR = true }: MexicanPayslipTemplateProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MMM/yyyy', { locale: es });
  };

  return (
    <Card className="max-w-4xl mx-auto print:shadow-none print:border-0">
      <CardHeader className="pb-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h1 className="text-xl font-bold">{data.companyName}</h1>
            <p className="text-sm text-muted-foreground">RFC: {data.companyRfc}</p>
            <p className="text-sm text-muted-foreground">Reg. Patronal: {data.registroPatronal}</p>
            <p className="text-xs text-muted-foreground mt-1">{data.companyAddress}</p>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-semibold">Recibo de Nómina</h2>
            {data.serie && data.folio && (
              <p className="text-sm">Serie: {data.serie} Folio: {data.folio}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Período: {formatDate(data.periodStart)} - {formatDate(data.periodEnd)}
            </p>
            <p className="text-sm text-muted-foreground">
              Fecha de pago: {formatDate(data.paymentDate)}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Separator />
        
        {/* Employee Information */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p><span className="font-medium">Empleado:</span> {data.employeeName}</p>
            <p><span className="font-medium">RFC:</span> {data.employeeRfc}</p>
            <p><span className="font-medium">CURP:</span> {data.curp}</p>
            <p><span className="font-medium">NSS:</span> {data.nss}</p>
          </div>
          <div className="space-y-1">
            <p><span className="font-medium">Departamento:</span> {data.department}</p>
            <p><span className="font-medium">Puesto:</span> {data.position}</p>
            <p><span className="font-medium">Tipo Contrato:</span> {data.contractType}</p>
            <p><span className="font-medium">Jornada:</span> {data.workShift}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-sm bg-muted p-3 rounded-lg">
          <div>
            <p className="text-muted-foreground">Días Pagados</p>
            <p className="font-semibold">{data.paymentDays}</p>
          </div>
          <div>
            <p className="text-muted-foreground">SDI</p>
            <p className="font-semibold">{formatCurrency(data.sdi)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">SBC</p>
            <p className="font-semibold">{formatCurrency(data.sbc)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fecha Ingreso</p>
            <p className="font-semibold">{formatDate(data.startDate)}</p>
          </div>
        </div>

        <Separator />

        {/* Perceptions and Deductions */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Perceptions */}
          <div>
            <h3 className="font-semibold mb-2 text-green-600">Percepciones</h3>
            <Table>
              <TableBody>
                {data.perceptions.map((p, idx) => (
                  <TableRow key={idx} className="text-sm">
                    <TableCell className="py-1 px-2">
                      <span className="font-mono text-xs text-muted-foreground">{p.code}</span>
                      <span className="ml-2">{p.description}</span>
                    </TableCell>
                    <TableCell className="py-1 px-2 text-right">
                      {formatCurrency(p.total)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold bg-green-50 dark:bg-green-950">
                  <TableCell className="py-2 px-2">Total Percepciones</TableCell>
                  <TableCell className="py-2 px-2 text-right text-green-600">
                    {formatCurrency(data.totalPerceptions)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="font-semibold mb-2 text-red-600">Deducciones</h3>
            <Table>
              <TableBody>
                {data.deductions.map((d, idx) => (
                  <TableRow key={idx} className="text-sm">
                    <TableCell className="py-1 px-2">
                      <span className="font-mono text-xs text-muted-foreground">{d.code}</span>
                      <span className="ml-2">{d.description}</span>
                    </TableCell>
                    <TableCell className="py-1 px-2 text-right">
                      {formatCurrency(d.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-semibold bg-red-50 dark:bg-red-950">
                  <TableCell className="py-2 px-2">Total Deducciones</TableCell>
                  <TableCell className="py-2 px-2 text-right text-red-600">
                    {formatCurrency(data.totalDeductions)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator />

        {/* Net Pay */}
        <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
          <div>
            <p className="text-lg font-semibold">Neto a Pagar</p>
            <p className="text-sm text-muted-foreground">
              (Total Percepciones - Total Deducciones)
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(data.netPay)}
            </p>
          </div>
        </div>

        {/* CFDI Information */}
        {data.cfdiUuid && (
          <>
            <Separator />
            <div className="grid md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p><span className="font-medium">UUID:</span></p>
                <p className="font-mono break-all">{data.cfdiUuid}</p>
                {data.timbradoDate && (
                  <p className="text-muted-foreground">
                    Timbrado: {format(new Date(data.timbradoDate), 'dd/MM/yyyy HH:mm:ss')}
                  </p>
                )}
              </div>
              {showQR && (
                <div className="flex justify-end">
                  <div className="w-24 h-24 bg-muted flex items-center justify-center text-muted-foreground text-xs">
                    [QR Code]
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Este documento es una representación impresa de un CFDI
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
