import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  FileText, 
  Download, 
  Eye,
  Calendar,
  DollarSign,
  Building2,
  TrendingUp,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EmployeeSelfServiceProps {
  employeeId: string;
}

interface Payslip {
  id: string;
  period: string;
  pay_date: Date;
  gross_pay: number;
  net_pay: number;
  isr: number;
  imss: number;
  cfdi_uuid: string;
  status: "available" | "pending";
}

interface TaxDocument {
  id: string;
  type: string;
  year: number;
  generated_at: Date;
  downloaded: boolean;
}

export function EmployeeSelfService({ employeeId }: EmployeeSelfServiceProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("payslips");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [taxDocuments, setTaxDocuments] = useState<TaxDocument[]>([]);
  const [employeeInfo, setEmployeeInfo] = useState<any>(null);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
      fetchPayslips();
      fetchTaxDocuments();
    }
  }, [employeeId, selectedYear]);

  const fetchEmployeeData = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", employeeId)
        .single();

      if (error) throw error;
      setEmployeeInfo(data);
    } catch (error) {
      console.error("Error fetching employee:", error);
    }
  };

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      // Mock payslip data
      const mockPayslips: Payslip[] = Array.from({ length: 12 }, (_, i) => ({
        id: `ps-${i}`,
        period: `${selectedYear}-${String(i + 1).padStart(2, "0")}`,
        pay_date: new Date(selectedYear, i, 15),
        gross_pay: 25000 + Math.random() * 5000,
        net_pay: 20000 + Math.random() * 4000,
        isr: 3000 + Math.random() * 1000,
        imss: 800 + Math.random() * 200,
        cfdi_uuid: `UUID-${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
        status: i < new Date().getMonth() ? "available" : "pending",
      }));
      setPayslips(mockPayslips.filter(p => p.status === "available"));
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxDocuments = async () => {
    // Mock tax documents
    setTaxDocuments([
      {
        id: "1",
        type: "Constancia de Retenciones",
        year: selectedYear - 1,
        generated_at: new Date(selectedYear, 1, 15),
        downloaded: false,
      },
      {
        id: "2",
        type: "Carta de Empleo",
        year: selectedYear,
        generated_at: new Date(),
        downloaded: true,
      },
    ]);
  };

  const downloadPayslip = (payslip: Payslip) => {
    toast({
      title: "Descargando",
      description: `Recibo de nómina ${payslip.period}`,
    });
  };

  const downloadCFDI = (payslip: Payslip) => {
    toast({
      title: "Descargando CFDI",
      description: `XML del CFDI ${payslip.cfdi_uuid}`,
    });
  };

  const downloadTaxDocument = (doc: TaxDocument) => {
    toast({
      title: "Descargando",
      description: `${doc.type} ${doc.year}`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const totalGross = payslips.reduce((sum, p) => sum + p.gross_pay, 0);
  const totalNet = payslips.reduce((sum, p) => sum + p.net_pay, 0);
  const totalISR = payslips.reduce((sum, p) => sum + p.isr, 0);
  const totalIMSS = payslips.reduce((sum, p) => sum + p.imss, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Portal del Empleado - Nómina
        </CardTitle>
        <CardDescription>
          Consulte sus recibos de nómina, CFDIs y documentos fiscales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Employee Info */}
        {employeeInfo && (
          <Card className="p-4 bg-muted/30">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{employeeInfo.full_name || "Empleado"}</h3>
                <p className="text-sm text-muted-foreground">{employeeInfo.email}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Year Selector */}
        <div className="flex items-center gap-4">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2022, 2023, 2024].map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              Ingresos Brutos YTD
            </div>
            <div className="text-xl font-bold">{formatCurrency(totalGross)}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Ingresos Netos YTD
            </div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalNet)}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              ISR Retenido YTD
            </div>
            <div className="text-xl font-bold text-amber-600">{formatCurrency(totalISR)}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Recibos Disponibles
            </div>
            <div className="text-xl font-bold">{payslips.length}</div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="payslips">Recibos de Nómina</TabsTrigger>
            <TabsTrigger value="cfdi">CFDIs</TabsTrigger>
            <TabsTrigger value="documents">Documentos Fiscales</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          {/* Payslips Tab */}
          <TabsContent value="payslips">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Fecha de Pago</TableHead>
                  <TableHead className="text-right">Bruto</TableHead>
                  <TableHead className="text-right">ISR</TableHead>
                  <TableHead className="text-right">IMSS</TableHead>
                  <TableHead className="text-right">Neto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-mono">{payslip.period}</TableCell>
                    <TableCell>{format(payslip.pay_date, "dd MMM yyyy", { locale: es })}</TableCell>
                    <TableCell className="text-right">{formatCurrency(payslip.gross_pay)}</TableCell>
                    <TableCell className="text-right text-amber-600">{formatCurrency(payslip.isr)}</TableCell>
                    <TableCell className="text-right text-blue-600">{formatCurrency(payslip.imss)}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(payslip.net_pay)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => downloadPayslip(payslip)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => downloadPayslip(payslip)}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* CFDI Tab */}
          <TabsContent value="cfdi">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>UUID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell className="font-mono">{payslip.period}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{payslip.cfdi_uuid}</code>
                    </TableCell>
                    <TableCell>{format(payslip.pay_date, "dd/MM/yyyy")}</TableCell>
                    <TableCell>{formatCurrency(payslip.net_pay)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => downloadCFDI(payslip)}>
                          <FileText className="h-3 w-3 mr-1" />
                          XML
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => downloadPayslip(payslip)}>
                          <FileText className="h-3 w-3 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="grid gap-4">
              {taxDocuments.map((doc) => (
                <Card key={doc.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <div className="font-medium">{doc.type}</div>
                        <div className="text-sm text-muted-foreground">
                          Año fiscal {doc.year} • Generado {format(doc.generated_at, "dd/MM/yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.downloaded && (
                        <Badge variant="secondary">Descargado</Badge>
                      )}
                      <Button onClick={() => downloadTaxDocument(doc)}>
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              <Card className="p-4 border-dashed">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Solicite documentos adicionales a Recursos Humanos</p>
                  <Button variant="outline" className="mt-2">
                    Solicitar Documento
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="space-y-4">
              <h3 className="font-medium">Historial de Descargas</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Fecha de Descarga</TableHead>
                    <TableHead>Dispositivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Recibo Nómina 2024-01</TableCell>
                    <TableCell>{format(new Date(), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>Chrome / Windows</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>CFDI 2024-01</TableCell>
                    <TableCell>{format(new Date(), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>Safari / iOS</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
          <div className="font-medium text-blue-700 dark:text-blue-300">Información Importante:</div>
          <ul className="mt-2 space-y-1 text-blue-600 dark:text-blue-400">
            <li>• Sus CFDIs son documentos fiscales oficiales válidos ante el SAT</li>
            <li>• Guarde sus constancias de retenciones para su declaración anual</li>
            <li>• Cualquier inconsistencia repórtela a RH dentro de 5 días hábiles</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
