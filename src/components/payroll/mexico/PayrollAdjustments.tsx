import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings2, 
  Plus, 
  CalendarIcon, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  FileText,
  ArrowLeftRight
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PayrollAdjustmentsProps {
  companyId: string;
}

interface PayrollAdjustment {
  id: string;
  employee_id: string;
  employee_name: string;
  adjustment_type: "correction" | "retroactive" | "bonus" | "deduction" | "refund";
  amount: number;
  original_amount: number;
  reason: string;
  pay_period: string;
  effective_date: Date;
  status: "pending" | "approved" | "applied" | "rejected";
  requires_cfdi: boolean;
  cfdi_type: string | null;
  created_at: Date;
  created_by: string;
}

const ADJUSTMENT_TYPES = [
  { value: "correction", label: "Corrección de Nómina", description: "Corregir error en cálculo" },
  { value: "retroactive", label: "Ajuste Retroactivo", description: "Aplicar cambio a períodos anteriores" },
  { value: "bonus", label: "Bono/Gratificación", description: "Pago adicional" },
  { value: "deduction", label: "Deducción Adicional", description: "Descuento no programado" },
  { value: "refund", label: "Reembolso", description: "Devolución de descuento indebido" },
];

export function PayrollAdjustments({ companyId }: PayrollAdjustmentsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [adjustments, setAdjustments] = useState<PayrollAdjustment[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [payPeriod, setPayPeriod] = useState("");
  const [effectiveDate, setEffectiveDate] = useState<Date>();
  const [requiresCFDI, setRequiresCFDI] = useState(false);

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
      fetchAdjustments();
    }
  }, [companyId]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", companyId);

      if (error) throw error;

      setEmployees((data || []).map((e: any) => ({
        id: e.id,
        name: e.full_name || "Sin nombre",
      })));
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchAdjustments = async () => {
    setLoading(true);
    try {
      // Mock data for now
      const mockAdjustments: PayrollAdjustment[] = [
        {
          id: "1",
          employee_id: "emp1",
          employee_name: "Juan Pérez",
          adjustment_type: "correction",
          amount: 2500,
          original_amount: 2000,
          reason: "Error en cálculo de horas extra del período anterior",
          pay_period: "2024-01",
          effective_date: new Date(),
          status: "pending",
          requires_cfdi: true,
          cfdi_type: "N",
          created_at: new Date(),
          created_by: "Admin",
        },
        {
          id: "2",
          employee_id: "emp2",
          employee_name: "María García",
          adjustment_type: "retroactive",
          amount: 5000,
          original_amount: 0,
          reason: "Ajuste retroactivo por aumento salarial aprobado",
          pay_period: "2024-01",
          effective_date: new Date(),
          status: "approved",
          requires_cfdi: true,
          cfdi_type: "N",
          created_at: new Date(),
          created_by: "HR Manager",
        },
      ];
      setAdjustments(mockAdjustments);
    } finally {
      setLoading(false);
    }
  };

  const createAdjustment = async () => {
    if (!selectedEmployeeId || !adjustmentType || amount === 0 || !reason) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      const employee = employees.find((e) => e.id === selectedEmployeeId);
      const newAdjustment: PayrollAdjustment = {
        id: crypto.randomUUID(),
        employee_id: selectedEmployeeId,
        employee_name: employee?.name || "",
        adjustment_type: adjustmentType as any,
        amount,
        original_amount: originalAmount,
        reason,
        pay_period: payPeriod || format(new Date(), "yyyy-MM"),
        effective_date: effectiveDate || new Date(),
        status: "pending",
        requires_cfdi: requiresCFDI,
        cfdi_type: requiresCFDI ? "N" : null,
        created_at: new Date(),
        created_by: "Current User",
      };

      setAdjustments([newAdjustment, ...adjustments]);
      setIsDialogOpen(false);
      resetForm();

      toast({
        title: "Ajuste Creado",
        description: "El ajuste de nómina ha sido registrado y está pendiente de aprobación",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el ajuste",
        variant: "destructive",
      });
    }
  };

  const approveAdjustment = (id: string) => {
    setAdjustments(
      adjustments.map((a) =>
        a.id === id ? { ...a, status: "approved" as const } : a
      )
    );
    toast({
      title: "Ajuste Aprobado",
      description: "El ajuste será aplicado en la próxima nómina",
    });
  };

  const applyAdjustment = (id: string) => {
    setAdjustments(
      adjustments.map((a) =>
        a.id === id ? { ...a, status: "applied" as const } : a
      )
    );
    toast({
      title: "Ajuste Aplicado",
      description: "El ajuste ha sido procesado en nómina",
    });
  };

  const resetForm = () => {
    setSelectedEmployeeId("");
    setAdjustmentType("");
    setAmount(0);
    setOriginalAmount(0);
    setReason("");
    setPayPeriod("");
    setEffectiveDate(undefined);
    setRequiresCFDI(false);
  };

  const getStatusBadge = (status: PayrollAdjustment["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline"><AlertTriangle className="h-3 w-3 mr-1" />Pendiente</Badge>;
      case "approved":
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Aprobado</Badge>;
      case "applied":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Aplicado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    const found = ADJUSTMENT_TYPES.find((t) => t.value === type);
    return found?.label || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const pendingCount = adjustments.filter((a) => a.status === "pending").length;
  const approvedCount = adjustments.filter((a) => a.status === "approved").length;
  const appliedCount = adjustments.filter((a) => a.status === "applied").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Ajustes y Correcciones de Nómina
        </CardTitle>
        <CardDescription>
          Gestione correcciones, ajustes retroactivos y modificaciones a la nómina
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Pendientes</div>
            <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Aprobados</div>
            <div className="text-2xl font-bold text-blue-600">{approvedCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Aplicados</div>
            <div className="text-2xl font-bold text-green-600">{appliedCount}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Ajustes</div>
            <div className="text-2xl font-bold">
              {formatCurrency(adjustments.reduce((sum, a) => sum + a.amount, 0))}
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Ajuste
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Ajuste de Nómina</DialogTitle>
                <DialogDescription>
                  Registre una corrección o ajuste para un empleado
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Empleado</Label>
                  <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Ajuste</Label>
                  <Select value={adjustmentType} onValueChange={setAdjustmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADJUSTMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monto Original (si aplica)</Label>
                    <Input
                      type="number"
                      value={originalAmount || ""}
                      onChange={(e) => setOriginalAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Correcto/Ajuste</Label>
                    <Input
                      type="number"
                      value={amount || ""}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Período de Nómina Afectado</Label>
                  <Input
                    value={payPeriod}
                    onChange={(e) => setPayPeriod(e.target.value)}
                    placeholder="YYYY-MM (ej: 2024-01)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fecha Efectiva</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start", !effectiveDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {effectiveDate ? format(effectiveDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={effectiveDate} onSelect={setEffectiveDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Motivo/Justificación</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describa el motivo del ajuste..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requiresCFDI"
                    checked={requiresCFDI}
                    onChange={(e) => setRequiresCFDI(e.target.checked)}
                  />
                  <Label htmlFor="requiresCFDI">Requiere CFDI de Nómina</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createAdjustment}>
                  Crear Ajuste
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={fetchAdjustments} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {/* Adjustments Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Período</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>CFDI</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map((adjustment) => (
              <TableRow key={adjustment.id}>
                <TableCell className="font-medium">{adjustment.employee_name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{getTypeLabel(adjustment.adjustment_type)}</Badge>
                </TableCell>
                <TableCell className="font-mono">{adjustment.pay_period}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {adjustment.original_amount > 0 && (
                      <>
                        <span className="text-muted-foreground line-through text-sm">
                          {formatCurrency(adjustment.original_amount)}
                        </span>
                        <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                      </>
                    )}
                    <span className="font-medium">{formatCurrency(adjustment.amount)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm line-clamp-1" title={adjustment.reason}>
                    {adjustment.reason}
                  </span>
                </TableCell>
                <TableCell>
                  {adjustment.requires_cfdi ? (
                    <Badge variant="secondary">
                      <FileText className="h-3 w-3 mr-1" />
                      {adjustment.cfdi_type}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(adjustment.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {adjustment.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => approveAdjustment(adjustment.id)}>
                        Aprobar
                      </Button>
                    )}
                    {adjustment.status === "approved" && (
                      <Button size="sm" onClick={() => applyAdjustment(adjustment.id)}>
                        Aplicar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Info */}
        <div className="p-4 bg-muted rounded-lg text-sm">
          <div className="font-medium mb-2">Tipos de Ajuste:</div>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Corrección:</strong> Rectifica errores en cálculos del período actual</li>
            <li><strong>Retroactivo:</strong> Aplica cambios a períodos anteriores (requiere CFDI complementario)</li>
            <li><strong>Bono:</strong> Pagos adicionales no programados</li>
            <li><strong>Deducción:</strong> Descuentos extraordinarios</li>
            <li><strong>Reembolso:</strong> Devolución de descuentos incorrectos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
