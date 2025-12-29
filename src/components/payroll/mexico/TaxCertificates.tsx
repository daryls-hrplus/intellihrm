import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Printer, Search, CheckCircle, Mail, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TaxCertificatesProps {
  companyId: string;
}

interface EmployeeCertificate {
  id: string;
  employee_id: string;
  full_name: string;
  rfc: string;
  curp: string;
  fiscal_year: number;
  total_income: number;
  total_exempt: number;
  total_taxable: number;
  total_isr: number;
  total_subsidy: number;
  imss_contributions: number;
  infonavit_contributions: number;
  generated: boolean;
  generated_at: string | null;
  sent_at: string | null;
  selected: boolean;
}

export function TaxCertificates({ companyId }: TaxCertificatesProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear() - 1);
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<EmployeeCertificate[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewEmployee, setPreviewEmployee] = useState<EmployeeCertificate | null>(null);

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
  }, [companyId, fiscalYear]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, employee_id")
        .eq("company_id", companyId);

      if (error) throw error;

      // Initialize with mock certificate data
      const certificates: EmployeeCertificate[] = (data || []).map((emp: any) => ({
        id: emp.id,
        employee_id: emp.employee_id || "",
        full_name: emp.full_name || "Sin nombre",
        rfc: `XXXX${Math.random().toString(36).substring(2, 8).toUpperCase()}XXX`,
        curp: `XXXX${Math.random().toString(36).substring(2, 14).toUpperCase()}XX`,
        fiscal_year: fiscalYear,
        total_income: Math.random() * 500000 + 100000,
        total_exempt: Math.random() * 50000,
        total_taxable: Math.random() * 450000 + 50000,
        total_isr: Math.random() * 100000 + 10000,
        total_subsidy: Math.random() * 5000,
        imss_contributions: Math.random() * 20000 + 5000,
        infonavit_contributions: Math.random() * 15000,
        generated: Math.random() > 0.5,
        generated_at: Math.random() > 0.5 ? new Date().toISOString() : null,
        sent_at: Math.random() > 0.7 ? new Date().toISOString() : null,
        selected: false,
      }));

      setEmployees(certificates);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const allSelected = employees.every((e) => e.selected);
    setEmployees(employees.map((e) => ({ ...e, selected: !allSelected })));
  };

  const toggleSelect = (id: string) => {
    setEmployees(employees.map((e) => (e.id === id ? { ...e, selected: !e.selected } : e)));
  };

  const generateCertificates = async () => {
    const selected = employees.filter((e) => e.selected);
    if (selected.length === 0) {
      toast({
        title: "Seleccione Empleados",
        description: "Debe seleccionar al menos un empleado",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      // Simulate certificate generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setEmployees(
        employees.map((e) =>
          e.selected
            ? { ...e, generated: true, generated_at: new Date().toISOString(), selected: false }
            : e
        )
      );

      toast({
        title: "Constancias Generadas",
        description: `Se generaron ${selected.length} constancias de retenciones`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al generar constancias",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const sendByEmail = async () => {
    const selected = employees.filter((e) => e.selected && e.generated);
    if (selected.length === 0) {
      toast({
        title: "Seleccione Empleados",
        description: "Debe seleccionar empleados con constancias generadas",
        variant: "destructive",
      });
      return;
    }

    // Simulate sending emails
    setEmployees(
      employees.map((e) =>
        e.selected && e.generated ? { ...e, sent_at: new Date().toISOString(), selected: false } : e
      )
    );

    toast({
      title: "Enviadas",
      description: `Se enviaron ${selected.length} constancias por correo`,
    });
  };

  const previewCertificate = (employee: EmployeeCertificate) => {
    setPreviewEmployee(employee);
    setPreviewOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = employees.filter((e) => e.selected).length;
  const generatedCount = employees.filter((e) => e.generated).length;
  const sentCount = employees.filter((e) => e.sent_at).length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Constancias de Retenciones
          </CardTitle>
          <CardDescription>
            Genere y envíe constancias de sueldos y retenciones (Formato 37) a sus empleados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2">
              <Label>Año Fiscal</Label>
              <Select value={fiscalYear.toString()} onValueChange={(v) => setFiscalYear(parseInt(v))}>
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
            <div className="space-y-2 flex-1 max-w-xs">
              <Label>Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, RFC o No. Empleado"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button onClick={generateCertificates} disabled={generating || selectedCount === 0}>
              {generating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Generar ({selectedCount})
            </Button>
            <Button variant="outline" onClick={sendByEmail} disabled={selectedCount === 0}>
              <Mail className="h-4 w-4 mr-2" />
              Enviar por Email
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Empleados</div>
              <div className="text-2xl font-bold">{employees.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Seleccionados</div>
              <div className="text-2xl font-bold text-primary">{selectedCount}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Generadas</div>
              <div className="text-2xl font-bold text-green-600">{generatedCount}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Enviadas</div>
              <div className="text-2xl font-bold text-blue-600">{sentCount}</div>
            </Card>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={employees.length > 0 && employees.every((e) => e.selected)}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Empleado</TableHead>
                  <TableHead>RFC</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">ISR Retenido</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <Checkbox checked={emp.selected} onCheckedChange={() => toggleSelect(emp.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{emp.full_name}</div>
                      <div className="text-xs text-muted-foreground">{emp.employee_id}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{emp.rfc}</TableCell>
                    <TableCell className="text-right">{formatCurrency(emp.total_income)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(emp.total_isr)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {emp.generated && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Generada
                          </Badge>
                        )}
                        {emp.sent_at && (
                          <Badge variant="secondary" className="text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            Enviada
                          </Badge>
                        )}
                        {!emp.generated && <Badge variant="outline">Pendiente</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => previewCertificate(emp)}>
                          <FileText className="h-3 w-3" />
                        </Button>
                        {emp.generated && (
                          <Button size="sm" variant="ghost">
                            <Download className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Info */}
          <div className="p-4 bg-muted rounded-lg text-sm">
            <div className="font-medium mb-2">Sobre las Constancias de Retenciones:</div>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Se deben entregar a más tardar el último día de febrero del año siguiente</li>
              <li>Incluyen todos los ingresos, retenciones y subsidio al empleo del año fiscal</li>
              <li>Los empleados las requieren para su declaración anual ante el SAT</li>
              <li>Deben generarse en formato PDF con firma digital del patrón</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Vista Previa - Constancia de Retenciones {fiscalYear}</DialogTitle>
          </DialogHeader>
          {previewEmployee && (
            <div className="space-y-6 p-4 border rounded-lg bg-white">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-lg font-bold">CONSTANCIA DE SUELDOS, SALARIOS,</h2>
                <h2 className="text-lg font-bold">CONCEPTOS ASIMILADOS Y CRÉDITO AL SALARIO</h2>
                <p className="text-sm text-muted-foreground mt-2">Ejercicio Fiscal {fiscalYear}</p>
              </div>

              {/* Employee Data */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Nombre del Trabajador</Label>
                  <p className="font-medium">{previewEmployee.full_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">RFC</Label>
                  <p className="font-mono">{previewEmployee.rfc}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">CURP</Label>
                  <p className="font-mono">{previewEmployee.curp}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">No. Empleado</Label>
                  <p>{previewEmployee.employee_id}</p>
                </div>
              </div>

              {/* Income Details */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead colSpan={2} className="text-center bg-muted">
                      INGRESOS Y RETENCIONES
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Total de Ingresos</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(previewEmployee.total_income)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>(-) Ingresos Exentos</TableCell>
                    <TableCell className="text-right">{formatCurrency(previewEmployee.total_exempt)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>(=) Ingresos Acumulables</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(previewEmployee.total_taxable)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>ISR Retenido</TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      {formatCurrency(previewEmployee.total_isr)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Subsidio para el Empleo</TableCell>
                    <TableCell className="text-right text-green-600">
                      {formatCurrency(previewEmployee.total_subsidy)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Aportaciones IMSS (Trabajador)</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(previewEmployee.imss_contributions)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Aportaciones INFONAVIT</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(previewEmployee.infonavit_contributions)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Footer */}
              <div className="text-center text-xs text-muted-foreground pt-4 border-t">
                <p>Esta constancia se expide para los efectos legales correspondientes.</p>
                <p className="mt-2">
                  Fecha de expedición: {format(new Date(), "PPP", { locale: es })}
                </p>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Cerrar
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
            <Button>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
