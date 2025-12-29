import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Plus, Save, RefreshCw, Trash2, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface FONACOTManagerProps {
  companyId: string;
}

interface FONACOTCredit {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_number: string;
  credit_number: string;
  original_amount: number;
  current_balance: number;
  payment_amount: number;
  start_date: string;
  end_date: string;
  status: "active" | "completed" | "suspended";
  payments_made: number;
  total_payments: number;
}

export function FONACOTManager({ companyId }: FONACOTManagerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<FONACOTCredit[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state for new credit
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [employees, setEmployees] = useState<{ id: string; name: string; number: string }[]>([]);
  const [newCreditNumber, setNewCreditNumber] = useState("");
  const [newOriginalAmount, setNewOriginalAmount] = useState<number>(0);
  const [newPaymentAmount, setNewPaymentAmount] = useState<number>(0);
  const [newTotalPayments, setNewTotalPayments] = useState<number>(0);

  useEffect(() => {
    if (companyId) {
      fetchCredits();
      fetchEmployees();
    }
  }, [companyId]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, employee_id")
        .eq("company_id", companyId);

      if (error) throw error;

      setEmployees(
        (data || []).map((e) => ({
          id: e.id,
          name: e.full_name || "Sin nombre",
          number: e.employee_id || "",
        }))
      );
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchCredits = async () => {
    setLoading(true);
    try {
      // For now, using mock data since we need to create the fonacot_credits table
      // In production, this would fetch from the database
      const mockCredits: FONACOTCredit[] = [];
      setCredits(mockCredits);
    } catch (error: any) {
      console.error("Error fetching credits:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los créditos FONACOT",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCredit = async () => {
    if (!selectedEmployeeId || !newCreditNumber || newOriginalAmount <= 0) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: Save to fonacot_credits table when created
      const employee = employees.find((e) => e.id === selectedEmployeeId);
      const newCredit: FONACOTCredit = {
        id: crypto.randomUUID(),
        employee_id: selectedEmployeeId,
        employee_name: employee?.name || "",
        employee_number: employee?.number || "",
        credit_number: newCreditNumber,
        original_amount: newOriginalAmount,
        current_balance: newOriginalAmount,
        payment_amount: newPaymentAmount,
        start_date: new Date().toISOString(),
        end_date: "",
        status: "active",
        payments_made: 0,
        total_payments: newTotalPayments,
      };

      setCredits([...credits, newCredit]);

      toast({
        title: "Crédito Agregado",
        description: `Crédito FONACOT ${newCreditNumber} registrado`,
      });

      setIsAddDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Error adding credit:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el crédito",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedEmployeeId("");
    setNewCreditNumber("");
    setNewOriginalAmount(0);
    setNewPaymentAmount(0);
    setNewTotalPayments(0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const generateFONACOTFile = () => {
    // Generate FONACOT layout file for payments
    const activeCredits = credits.filter((c) => c.status === "active");

    if (activeCredits.length === 0) {
      toast({
        title: "Sin Créditos",
        description: "No hay créditos activos para generar archivo",
        variant: "destructive",
      });
      return;
    }

    // FONACOT file format (simplified)
    const lines = activeCredits.map((credit) => {
      return [
        credit.credit_number.padEnd(15, " "),
        credit.employee_number.padEnd(10, " "),
        credit.payment_amount.toFixed(2).padStart(12, "0"),
        format(new Date(), "yyyyMMdd"),
      ].join("|");
    });

    const fileContent = lines.join("\n");
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FONACOT_${format(new Date(), "yyyyMMdd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Archivo Generado",
      description: "Archivo de descuentos FONACOT descargado",
    });
  };

  const activeCredits = credits.filter((c) => c.status === "active");
  const totalMonthlyDeductions = activeCredits.reduce((sum, c) => sum + c.payment_amount, 0);
  const totalBalance = activeCredits.reduce((sum, c) => sum + c.current_balance, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Gestión de Créditos FONACOT
        </CardTitle>
        <CardDescription>
          Administre los descuentos por créditos al consumo de sus empleados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Créditos Totales</div>
            <div className="text-2xl font-bold">{credits.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Créditos Activos</div>
            <div className="text-2xl font-bold text-primary">{activeCredits.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Descuento Mensual</div>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalMonthlyDeductions)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Saldo Total</div>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Crédito
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Crédito FONACOT</DialogTitle>
                <DialogDescription>Registre un nuevo crédito de consumo</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Empleado</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  >
                    <option value="">Seleccionar empleado...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.number})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Número de Crédito</Label>
                  <Input
                    value={newCreditNumber}
                    onChange={(e) => setNewCreditNumber(e.target.value)}
                    placeholder="Ej: FON-2024-12345"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monto Original (MXN)</Label>
                    <Input
                      type="number"
                      value={newOriginalAmount || ""}
                      onChange={(e) => setNewOriginalAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pago Quincenal (MXN)</Label>
                    <Input
                      type="number"
                      value={newPaymentAmount || ""}
                      onChange={(e) => setNewPaymentAmount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Número de Pagos</Label>
                  <Input
                    type="number"
                    value={newTotalPayments || ""}
                    onChange={(e) => setNewTotalPayments(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={addCredit}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={fetchCredits} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Button variant="outline" onClick={generateFONACOTFile}>
            <Download className="h-4 w-4 mr-2" />
            Generar Archivo FONACOT
          </Button>
        </div>

        {/* Credits Table */}
        {credits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay créditos FONACOT registrados</p>
            <p className="text-sm">Agregue un crédito para comenzar</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>No. Crédito</TableHead>
                <TableHead className="text-right">Monto Original</TableHead>
                <TableHead className="text-right">Saldo Actual</TableHead>
                <TableHead className="text-right">Pago Quincenal</TableHead>
                <TableHead>Pagos</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credits.map((credit) => (
                <TableRow key={credit.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{credit.employee_name}</div>
                      <div className="text-xs text-muted-foreground">{credit.employee_number}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{credit.credit_number}</TableCell>
                  <TableCell className="text-right">{formatCurrency(credit.original_amount)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(credit.current_balance)}</TableCell>
                  <TableCell className="text-right text-amber-600">{formatCurrency(credit.payment_amount)}</TableCell>
                  <TableCell>
                    {credit.payments_made} / {credit.total_payments}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        credit.status === "active"
                          ? "default"
                          : credit.status === "completed"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {credit.status === "active"
                        ? "Activo"
                        : credit.status === "completed"
                        ? "Liquidado"
                        : "Suspendido"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Info Box */}
        <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
          <div className="font-medium">Información FONACOT:</div>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Los descuentos FONACOT se aplican de forma quincenal</li>
            <li>El descuento máximo es del 20% del salario</li>
            <li>Se debe generar archivo de pago cada quincena</li>
            <li>Los créditos pueden ser por bienes de consumo, servicios o efectivo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
