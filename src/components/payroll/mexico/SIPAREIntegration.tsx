import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Upload, 
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  RefreshCw,
  Send,
  Calendar
} from "lucide-react";

interface SIPAREIntegrationProps {
  companyId: string;
}

export function SIPAREIntegration({ companyId }: SIPAREIntegrationProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("2025-01");
  const [isGenerating, setIsGenerating] = useState(false);

  const sipareSubmissions = [
    {
      id: "1",
      period: "Enero 2025",
      type: "Cuotas Obrero-Patronales",
      amount: 485620.50,
      employees: 156,
      status: "submitted",
      submittedAt: "2025-01-17",
      confirmationNumber: "SIP-2025-001234"
    },
    {
      id: "2",
      period: "Diciembre 2024",
      type: "Cuotas Obrero-Patronales",
      amount: 478450.25,
      employees: 154,
      status: "confirmed",
      submittedAt: "2024-12-17",
      confirmationNumber: "SIP-2024-012890"
    },
    {
      id: "3",
      period: "Noviembre 2024",
      type: "Cuotas Obrero-Patronales",
      amount: 472100.00,
      employees: 152,
      status: "confirmed",
      submittedAt: "2024-11-17",
      confirmationNumber: "SIP-2024-011456"
    },
  ];

  const pendingPayments = [
    { branch: "Sucursal CDMX", registroPatronal: "Y12-34567-10-8", amount: 285420.50, dueDate: "2025-02-17" },
    { branch: "Sucursal Monterrey", registroPatronal: "Z45-67890-10-2", amount: 125200.00, dueDate: "2025-02-17" },
    { branch: "Sucursal Guadalajara", registroPatronal: "A78-90123-10-5", amount: 75000.00, dueDate: "2025-02-17" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" />Confirmado</Badge>;
      case "submitted":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200"><Clock className="h-3 w-3 mr-1" />Enviado</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200"><AlertCircle className="h-3 w-3 mr-1" />Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleGenerateSIPARE = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">SIPARE Integration</h2>
            <p className="text-sm text-muted-foreground">
              Sistema de Pago Referenciado - IMSS payment management
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-01">Enero 2025</SelectItem>
              <SelectItem value="2024-12">Diciembre 2024</SelectItem>
              <SelectItem value="2024-11">Noviembre 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateSIPARE} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generar SIPARE
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-muted-foreground">Registros Patronales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">$485.6K</p>
                <p className="text-xs text-muted-foreground">Total Cuotas Periodo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">Pagos Confirmados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">17 Feb</p>
                <p className="text-xs text-muted-foreground">Próximo Vencimiento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submissions">Historial de Envíos</TabsTrigger>
          <TabsTrigger value="pending">Pagos Pendientes</TabsTrigger>
          <TabsTrigger value="generate">Generar Archivo</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Determinaciones SIPARE</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Periodo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead className="text-right">Trabajadores</TableHead>
                    <TableHead>Fecha Envío</TableHead>
                    <TableHead>No. Confirmación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sipareSubmissions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.period}</TableCell>
                      <TableCell>{sub.type}</TableCell>
                      <TableCell className="text-right">${sub.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{sub.employees}</TableCell>
                      <TableCell>{sub.submittedAt}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{sub.confirmationNumber}</code>
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pagos Pendientes por Registro Patronal</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sucursal</TableHead>
                    <TableHead>Registro Patronal</TableHead>
                    <TableHead className="text-right">Importe</TableHead>
                    <TableHead>Fecha Límite</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{payment.branch}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{payment.registroPatronal}</code>
                      </TableCell>
                      <TableCell className="text-right">${payment.amount.toLocaleString()}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Send className="h-4 w-4 mr-2" />
                          Generar Línea
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generar Archivo SIPARE</CardTitle>
              <CardDescription>Configure los parámetros para la determinación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Periodo de Pago</Label>
                  <Select defaultValue="2025-01">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2025-01">Enero 2025</SelectItem>
                      <SelectItem value="2025-02">Febrero 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Registro Patronal</Label>
                  <Select defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los registros</SelectItem>
                      <SelectItem value="Y12-34567-10-8">Y12-34567-10-8 (CDMX)</SelectItem>
                      <SelectItem value="Z45-67890-10-2">Z45-67890-10-2 (Monterrey)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Generar y Enviar a SIPARE
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
