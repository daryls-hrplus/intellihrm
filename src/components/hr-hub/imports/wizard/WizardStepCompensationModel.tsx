import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, 
  GitBranch, 
  Percent, 
  Clock, 
  DollarSign,
  CheckCircle2,
  Info
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export type CompensationModel = 
  | "salary_grade" 
  | "spinal_point" 
  | "hybrid" 
  | "commission_based" 
  | "hourly_rate" 
  | "direct_pay";

interface CompensationModelOption {
  id: CompensationModel;
  label: string;
  description: string;
  icon: React.ElementType;
  requiredImports: string[];
  color: string;
}

const COMPENSATION_MODELS: CompensationModelOption[] = [
  {
    id: "salary_grade",
    label: "Salary Grade",
    description: "Traditional min/mid/max salary ranges by grade level",
    icon: Layers,
    requiredImports: ["salary_grades"],
    color: "text-blue-600",
  },
  {
    id: "spinal_point",
    label: "Spinal Point System",
    description: "Incremental pay scales with defined points on each spine",
    icon: GitBranch,
    requiredImports: ["pay_spines", "spinal_points"],
    color: "text-purple-600",
  },
  {
    id: "hybrid",
    label: "Hybrid System",
    description: "Combination of salary grades and spinal points",
    icon: Layers,
    requiredImports: ["salary_grades", "pay_spines", "spinal_points"],
    color: "text-indigo-600",
  },
  {
    id: "commission_based",
    label: "Commission Based",
    description: "Base salary plus commission on sales/performance",
    icon: Percent,
    requiredImports: [],
    color: "text-green-600",
  },
  {
    id: "hourly_rate",
    label: "Hourly Rate",
    description: "Pay calculated by hours worked",
    icon: Clock,
    requiredImports: [],
    color: "text-orange-600",
  },
  {
    id: "direct_pay",
    label: "Direct Pay",
    description: "Fixed salary amount without grade/spine reference",
    icon: DollarSign,
    requiredImports: [],
    color: "text-emerald-600",
  },
];

interface WizardStepCompensationModelProps {
  selectedModel: CompensationModel | null;
  onSelectModel: (model: CompensationModel) => void;
}

export function WizardStepCompensationModel({
  selectedModel,
  onSelectModel,
}: WizardStepCompensationModelProps) {
  const selectedOption = COMPENSATION_MODELS.find((m) => m.id === selectedModel);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-1">Select Compensation Model</h2>
        <p className="text-muted-foreground">
          Choose how your organization structures employee compensation. This determines what data needs to be imported.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMPENSATION_MODELS.map((model) => {
          const isSelected = selectedModel === model.id;
          const Icon = model.icon;

          return (
            <Card
              key={model.id}
              className={`
                cursor-pointer transition-all duration-200
                ${isSelected ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/50 hover:shadow-md"}
              `}
              onClick={() => onSelectModel(model.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                    <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : model.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{model.label}</h4>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {model.description}
                    </p>
                    {model.requiredImports.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {model.requiredImports.map((imp) => (
                          <Badge key={imp} variant="outline" className="text-xs">
                            {imp.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {model.requiredImports.length === 0 && (
                      <Badge variant="secondary" className="text-xs mt-2">
                        No prerequisites
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedOption && selectedOption.requiredImports.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>{selectedOption.label}</strong> requires importing:{" "}
            {selectedOption.requiredImports.map((imp) => imp.replace(/_/g, " ")).join(", ")}
            {" "}before you can import positions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Export the helper to get required imports for a compensation model
export function getRequiredImportsForModel(model: CompensationModel | null): string[] {
  if (!model) return [];
  const option = COMPENSATION_MODELS.find((m) => m.id === model);
  return option?.requiredImports || [];
}
