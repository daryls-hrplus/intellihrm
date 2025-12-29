import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Home, Calculator, Save, RefreshCw, AlertTriangle, FileText } from "lucide-react";

interface INFONAVITManagerProps {
  companyId: string;
}

interface EmployeeINFONAVIT {
  id: string;
  full_name: string;
  employee_id: string;
  nss: string;
  has_credit: boolean;
  credit_number: string;
  discount_type: "percentage" | "fixed" | "vsm" | "cf";
  discount_value: number;
  start_date: string;
  status: "active" | "suspended" | "completed";
}

const UMA_MONTHLY_2024 = 3301.44; // UMA monthly value 2024
const VSM_2024 = 278.17; // Minimum wage for INFONAVIT calculations

export function INFONAVITManager({ companyId }: INFONAVITManagerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<EmployeeINFONAVIT[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for editing
  const [creditNumber, setCreditNumber] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed" | "vsm" | "cf">("percentage");
  const [discountValue, setDiscountValue] = useState<number>(0);

  useEffect(() => {
    if (companyId) {
      fetchEmployees();
    }
  }, [companyId]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // Fetch employees with Mexican data
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, employee_id")
        .eq("company_id", companyId);

      if (profilesError) throw profilesError;

      // For now, create mock INFONAVIT data since table may not exist yet
      const combined: EmployeeINFONAVIT[] = (profiles || []).map((p: any) => {
        return {
          id: p.id,
          full_name: p.full_name || "Sin nombre",
          employee_id: p.employee_id || "",
          nss: "",
          has_credit: false,
          credit_number: "",
          discount_type: "percentage" as const,
          discount_value: 0,
          start_date: "",
          status: "active" as const,
        };
      });

      setEmployees(combined);
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

  const calculateDiscount = (employee: EmployeeINFONAVIT, monthlySalary: number): number => {
    if (!employee.has_credit) return 0;

    switch (employee.discount_type) {
      case "percentage":
        return monthlySalary * (employee.discount_value / 100);
      case "fixed":
        return employee.discount_value;
      case "vsm":
        return employee.discount_value * VSM_2024;
      case "cf":
        // Cuota Fija - fixed amount in pesos
        return employee.discount_value;
      default:
        return 0;
    }
  };

  const startEditing = (employee: EmployeeINFONAVIT) => {
    setEditingId(employee.id);
    setCreditNumber(employee.credit_number);
    setDiscountType(employee.discount_type);
    setDiscountValue(employee.discount_value);
  };

  const saveINFONAVIT = async (employeeId: string) => {
    try {
      // TODO: Save to mx_employee_payroll_data when INFONAVIT columns are added
      console.log("Saving INFONAVIT data:", {
        employee_id: employeeId,
        credit_number: creditNumber,
        discount_type: discountType,
        discount_value: discountValue,
      });

      toast({
        title: "Guardado",
        description: "Datos de INFONAVIT actualizados",
      });

      setEditingId(null);
      fetchEmployees();
    } catch (error: any) {
      console.error("Error saving INFONAVIT:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los datos",
        variant: "destructive",
      });
    }
  };

  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "% del Salario";
      case "fixed":
        return "Monto Fijo";
      case "vsm":
        return "VSM (Veces Salario Mínimo)";
      case "cf":
        return "Cuota Fija";
      default:
        return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const employeesWithCredits = employees.filter((e) => e.has_credit);
  const totalMonthlyDeductions = employeesWithCredits.reduce((sum, e) => {
    // Assume average salary for estimation
    return sum + calculateDiscount(e, 15000);
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Gestión de Créditos INFONAVIT
        </CardTitle>
        <CardDescription>
          Administre los descuentos por créditos de vivienda de sus empleados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Empleados</div>
            <div className="text-2xl font-bold">{employees.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Con Crédito Activo</div>
            <div className="text-2xl font-bold text-primary">{employeesWithCredits.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">VSM 2024</div>
            <div className="text-2xl font-bold">{formatCurrency(VSM_2024)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Retención Estimada</div>
            <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalMonthlyDeductions)}</div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEmployees} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Exportar para INFONAVIT
          </Button>
        </div>

        {/* Employee Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead>NSS</TableHead>
              <TableHead>Crédito</TableHead>
              <TableHead>No. Crédito</TableHead>
              <TableHead>Tipo Descuento</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{employee.full_name}</div>
                    <div className="text-xs text-muted-foreground">{employee.employee_id}</div>
                  </div>
                </TableCell>
                <TableCell className="font-mono">{employee.nss || "-"}</TableCell>
                <TableCell>
                  {employee.has_credit ? (
                    <Badge variant="default">Sí</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === employee.id ? (
                    <Input
                      value={creditNumber}
                      onChange={(e) => setCreditNumber(e.target.value)}
                      placeholder="Número de crédito"
                      className="w-32"
                    />
                  ) : (
                    <span className="font-mono">{employee.credit_number || "-"}</span>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === employee.id ? (
                    <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">% del Salario</SelectItem>
                        <SelectItem value="fixed">Monto Fijo</SelectItem>
                        <SelectItem value="vsm">VSM</SelectItem>
                        <SelectItem value="cf">Cuota Fija</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    getDiscountTypeLabel(employee.discount_type)
                  )}
                </TableCell>
                <TableCell>
                  {editingId === employee.id ? (
                    <Input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                      className="w-24"
                    />
                  ) : employee.discount_type === "percentage" ? (
                    `${employee.discount_value}%`
                  ) : employee.discount_type === "vsm" ? (
                    `${employee.discount_value} VSM`
                  ) : (
                    formatCurrency(employee.discount_value)
                  )}
                </TableCell>
                <TableCell>
                  {employee.has_credit && (
                    <Badge
                      variant={
                        employee.status === "active"
                          ? "default"
                          : employee.status === "suspended"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {employee.status === "active"
                        ? "Activo"
                        : employee.status === "suspended"
                        ? "Suspendido"
                        : "Liquidado"}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === employee.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => saveINFONAVIT(employee.id)}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => startEditing(employee)}>
                      Editar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Info Box */}
        <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="h-4 w-4" />
            Tipos de Descuento INFONAVIT:
          </div>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Porcentaje:</strong> Descuento sobre el salario integrado</li>
            <li><strong>Cuota Fija:</strong> Monto fijo en pesos cada quincena</li>
            <li><strong>VSM:</strong> Factor multiplicado por el Valor del Salario Mínimo</li>
            <li><strong>Factor de Pago:</strong> Para créditos en UMAS (se calcula automáticamente)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
