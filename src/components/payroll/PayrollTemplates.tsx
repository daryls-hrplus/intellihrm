import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  companyId?: string;
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
    earnings: string[];
    deductions: string[];
  };
  settings: {
    autoCalculateTax: boolean;
    autoCalculateBenefits: boolean;
    includeAllowances: boolean;
    includeRetirement: boolean;
    roundingMethod: "up" | "down" | "nearest";
  };
}

export function PayrollTemplates({ companyId }: PayrollTemplatesProps) {
  const [templates, setTemplates] = useState<PayrollTemplate[]>([
    {
      id: "1",
      name: "Standard Biweekly",
      description: "Default template for office employees",
      periodType: "biweekly",
      isDefault: true,
      lastUsed: "2025-01-15",
      usageCount: 45,
      concepts: {
        earnings: ["Base Salary", "Overtime", "Allowances"],
        deductions: ["Income Tax", "Social Security", "Retirement"]
      },
      settings: {
        autoCalculateTax: true,
        autoCalculateBenefits: true,
        includeAllowances: true,
        includeRetirement: true,
        roundingMethod: "nearest"
      }
    },
    {
      id: "2",
      name: "Weekly Operations",
      description: "For field and operations personnel",
      periodType: "weekly",
      isDefault: false,
      lastUsed: "2025-01-12",
      usageCount: 32,
      concepts: {
        earnings: ["Base Salary", "Overtime", "Shift Differential"],
        deductions: ["Income Tax", "Social Security"]
      },
      settings: {
        autoCalculateTax: true,
        autoCalculateBenefits: true,
        includeAllowances: false,
        includeRetirement: false,
        roundingMethod: "down"
      }
    },
    {
      id: "3",
      name: "Executive Monthly",
      description: "Template for management and directors",
      periodType: "monthly",
      isDefault: false,
      lastUsed: "2025-01-01",
      usageCount: 12,
      concepts: {
        earnings: ["Base Salary", "Performance Bonus", "Car Allowance", "Fuel"],
        deductions: ["Income Tax", "Social Security", "Retirement", "Health Insurance"]
      },
      settings: {
        autoCalculateTax: true,
        autoCalculateBenefits: true,
        includeAllowances: true,
        includeRetirement: true,
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

  const allEarnings = [
    "Base Salary",
    "Overtime",
    "Shift Differential",
    "Performance Bonus",
    "Commission",
    "Allowances",
    "Savings Match",
    "Car Allowance",
    "Fuel",
    "Holiday Bonus",
    "Vacation Pay"
  ];

  const allDeductions = [
    "Income Tax",
    "Social Security",
    "Retirement",
    "Health Insurance",
    "Life Insurance",
    "Garnishment",
    "Loan Repayment",
    "Union Dues"
  ];

  const duplicateTemplate = (template: PayrollTemplate) => {
    const newTemp: PayrollTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      lastUsed: null,
      usageCount: 0
    };
    setTemplates([...templates, newTemp]);
    toast.success("Template duplicated successfully");
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success("Template deleted");
  };

  const setAsDefault = (id: string) => {
    setTemplates(templates.map(t => ({
      ...t,
      isDefault: t.id === id
    })));
    toast.success("Template set as default");
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
        earnings: ["Base Salary"],
        deductions: ["Income Tax", "Social Security"]
      },
      settings: {
        autoCalculateTax: true,
        autoCalculateBenefits: true,
        includeAllowances: false,
        includeRetirement: false,
        roundingMethod: "nearest"
      }
    };
    setTemplates([...templates, template]);
    setIsCreateOpen(false);
    setNewTemplate({ name: "", description: "", periodType: "biweekly" });
    toast.success("Template created successfully");
  };

  const getPeriodLabel = (type: string) => {
    switch (type) {
      case "weekly": return "Weekly";
      case "biweekly": return "Biweekly";
      case "monthly": return "Monthly";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payroll Templates</h2>
          <p className="text-sm text-muted-foreground">
            Reusable configurations for payroll processing
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Configure a new payroll template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input 
                  placeholder="E.g., Sales Biweekly"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Brief description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Pay Period</Label>
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
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createTemplate} disabled={!newTemplate.name}>
                Create Template
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
                        Default
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
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Included Concepts</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Earnings:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.concepts.earnings.map((p, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Deductions:</p>
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

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      {template.settings.autoCalculateTax ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2" />
                      )}
                      <span>Auto-calculate tax</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.settings.autoCalculateBenefits ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2" />
                      )}
                      <span>Auto-calculate benefits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.settings.includeAllowances ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2" />
                      )}
                      <span>Include allowances</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.settings.includeRetirement ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border-2" />
                      )}
                      <span>Include retirement</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Last used: {template.lastUsed || "Never"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Used {template.usageCount} times</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-1" />
                      Use
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Available Concepts Catalog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3 text-green-600">Earnings</h4>
              <div className="flex flex-wrap gap-2">
                {allEarnings.map((p, i) => (
                  <Badge key={i} variant="secondary">{p}</Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-red-600">Deductions</h4>
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
