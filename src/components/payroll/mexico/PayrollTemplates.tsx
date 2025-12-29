import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Plus, 
  Copy, 
  Trash2, 
  Edit, 
  Play,
  Star,
  Clock,
  CheckCircle,
  Settings
} from "lucide-react";
import { toast } from "sonner";

interface PayrollTemplatesProps {
  companyId: string;
}

interface PayrollTemplate {
  id: string;
  name: string;
  description: string;
  periodType: "weekly" | "biweekly" | "monthly";
  isDefault: boolean;
  lastUsed: string | null;
  usageCount: number;
  concepts: {
    perceptions: string[];
    deductions: string[];
  };
  settings: {
    autoCalculateISR: boolean;
    autoCalculateIMSS: boolean;
    includeVouchers: boolean;
    includeSavingsFund: boolean;
    roundingMethod: "up" | "down" | "nearest";
  };
}

export function PayrollTemplates({ companyId }: PayrollTemplatesProps) {
  const [templates, setTemplates] = useState<PayrollTemplate[]>([
    {
      id: "1",
      name: "Nómina Quincenal Estándar",
      description: "Plantilla base para empleados de oficina",
      periodType: "biweekly",
      isDefault: true,
      lastUsed: "2025-01-15",
      usageCount: 45,
      concepts: {
        perceptions: ["Sueldo Base", "Bono Puntualidad", "Vales de Despensa"],
        deductions: ["ISR", "IMSS", "Fondo Ahorro"]
      },
      settings: {
        autoCalculateISR: true,
        autoCalculateIMSS: true,
        includeVouchers: true,
        includeSavingsFund: true,
        roundingMethod: "nearest"
      }
    },
    {
      id: "2",
      name: "Nómina Semanal Operativos",
      description: "Para personal operativo y de campo",
      periodType: "weekly",
      isDefault: false,
      lastUsed: "2025-01-12",
      usageCount: 32,
      concepts: {
        perceptions: ["Sueldo Base", "Horas Extra", "Prima Dominical"],
        deductions: ["ISR", "IMSS"]
      },
      settings: {
        autoCalculateISR: true,
        autoCalculateIMSS: true,
        includeVouchers: false,
        includeSavingsFund: false,
        roundingMethod: "down"
      }
    },
    {
      id: "3",
      name: "Nómina Ejecutivos",
      description: "Plantilla para nivel gerencial y directivo",
      periodType: "monthly",
      isDefault: false,
      lastUsed: "2025-01-01",
      usageCount: 12,
      concepts: {
        perceptions: ["Sueldo Base", "Bono Productividad", "Auto Empresa", "Gasolina"],
        deductions: ["ISR", "IMSS", "Fondo Ahorro", "Seguro GMM"]
      },
      settings: {
        autoCalculateISR: true,
        autoCalculateIMSS: true,
        includeVouchers: true,
        includeSavingsFund: true,
        roundingMethod: "nearest"
      }
    }
  ]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    periodType: "biweekly" as "weekly" | "biweekly" | "monthly"
  });

  const allPerceptions = [
    "Sueldo Base",
    "Horas Extra",
    "Prima Dominical",
    "Bono Puntualidad",
    "Bono Productividad",
    "Comisiones",
    "Vales de Despensa",
    "Fondo de Ahorro (Aportación Empresa)",
    "Auto Empresa",
    "Gasolina",
    "Aguinaldo",
    "Prima Vacacional"
  ];

  const allDeductions = [
    "ISR",
    "IMSS",
    "Fondo Ahorro",
    "INFONAVIT",
    "FONACOT",
    "Pensión Alimenticia",
    "Seguro GMM",
    "Préstamo Personal",
    "Caja de Ahorro"
  ];

  const duplicateTemplate = (template: PayrollTemplate) => {
    const newTemp: PayrollTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copia)`,
      isDefault: false,
      lastUsed: null,
      usageCount: 0
    };
    setTemplates([...templates, newTemp]);
    toast.success("Plantilla duplicada correctamente");
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success("Plantilla eliminada");
  };

  const setAsDefault = (id: string) => {
    setTemplates(templates.map(t => ({
      ...t,
      isDefault: t.id === id
    })));
    toast.success("Plantilla establecida como predeterminada");
  };

  const createTemplate = () => {
    const template: PayrollTemplate = {
      id: Date.now().toString(),
      name: newTemplate.name,
      description: newTemplate.description,
      periodType: newTemplate.periodType,
      isDefault: false,
      lastUsed: null,
      usageCount: 0,
      concepts: {
        perceptions: ["Sueldo Base"],
        deductions: ["ISR", "IMSS"]
      },
      settings: {
        autoCalculateISR: true,
        autoCalculateIMSS: true,
        includeVouchers: false,
        includeSavingsFund: false,
        roundingMethod: "nearest"
      }
    };
    setTemplates([...templates, template]);
    setIsCreateOpen(false);
    setNewTemplate({ name: "", description: "", periodType: "biweekly" });
    toast.success("Plantilla creada correctamente");
  };

  const getPeriodLabel = (type: string) => {
    switch (type) {
      case "weekly": return "Semanal";
      case "biweekly": return "Quincenal";
      case "monthly": return "Mensual";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Plantillas de Nómina</h2>
          <p className="text-sm text-muted-foreground">
            Configuraciones reutilizables para procesamiento de nómina
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Plantilla</DialogTitle>
              <DialogDescription>
                Configure una nueva plantilla de nómina
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nombre de la Plantilla</Label>
                <Input 
                  placeholder="Ej: Nómina Quincenal Ventas"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input 
                  placeholder="Descripción breve"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Período</Label>
                <Select 
                  value={newTemplate.periodType}
                  onValueChange={(v: "weekly" | "biweekly" | "monthly") => 
                    setNewTemplate({...newTemplate, periodType: v})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="biweekly">Quincenal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={createTemplate} disabled={!newTemplate.name}>
                Crear Plantilla
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {template.isDefault && (
                      <Badge variant="default" className="gap-1">
                        <Star className="h-3 w-3" />
                        Predeterminada
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getPeriodLabel(template.periodType)}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => duplicateTemplate(template)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  {!template.isDefault && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => deleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Concepts */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Conceptos Incluidos</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Percepciones:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.concepts.perceptions.map((p, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Deducciones:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.concepts.deductions.map((d, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {d}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Configuración</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {template.settings.autoCalculateISR ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2" />
                      )}
                      <span>Cálculo automático ISR</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.settings.autoCalculateIMSS ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2" />
                      )}
                      <span>Cálculo automático IMSS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.settings.includeVouchers ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2" />
                      )}
                      <span>Vales de despensa</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.settings.includeSavingsFund ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2" />
                      )}
                      <span>Fondo de ahorro</span>
                    </div>
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Estadísticas</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        Último uso: {template.lastUsed || "Nunca"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>
                        Usada {template.usageCount} veces
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Usar
                    </Button>
                    {!template.isDefault && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setAsDefault(template.id)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Concepts Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Catálogo de Conceptos Disponibles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3 text-green-600">Percepciones</h4>
              <div className="flex flex-wrap gap-2">
                {allPerceptions.map((p, i) => (
                  <Badge key={i} variant="secondary">{p}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-red-600">Deducciones</h4>
              <div className="flex flex-wrap gap-2">
                {allDeductions.map((d, i) => (
                  <Badge key={i} variant="outline">{d}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}