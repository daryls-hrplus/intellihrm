import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  FolderTree, 
  Briefcase, 
  Users, 
  ArrowRight,
  CheckCircle2,
  Info,
  Lightbulb,
  GitBranch,
  Map
} from "lucide-react";
import { ImportDependencyDiagram } from "./ImportDependencyDiagram";

export function WizardStepWelcome() {
  const importOrder = [
    { icon: Building2, label: "Companies", description: "Organization entities" },
    { icon: FolderTree, label: "Divisions", description: "Business units" },
    { icon: FolderTree, label: "Departments", description: "Team structures" },
    { icon: Briefcase, label: "Jobs & Job Families", description: "Role definitions" },
    { icon: Briefcase, label: "Positions", description: "Job instances" },
    { icon: Users, label: "Employees", description: "People data" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome to the Import Wizard</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This guided wizard will help you import your HR data correctly and safely. 
          Follow the recommended order to ensure data integrity and relationships.
        </p>
      </div>

      {/* Tabbed View: Quick Overview vs Detailed Dependency Map */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="gap-2">
            <Lightbulb className="h-4 w-4" />
            Quick Overview
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="gap-2">
            <Map className="h-4 w-4" />
            Dependency Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Recommended Import Order */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Recommended Import Order
              </h3>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {importOrder.map((item, index) => (
                  <div key={item.label} className="flex items-center">
                    <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 min-w-[100px]">
                      <item.icon className="h-6 w-6 text-primary mb-1" />
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                    {index < importOrder.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Smart Validation</h4>
                    <p className="text-sm text-muted-foreground">
                      AI-powered validation catches errors before import
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <GitBranch className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Dependency Checks</h4>
                    <p className="text-sm text-muted-foreground">
                      Ensures required data exists before importing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Rollback Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Undo imports within 30 days if needed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <ImportDependencyDiagram />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> Before starting, make sure you have your data ready in CSV format. 
          Some system dropdown values (like countries, currencies, job types) may need to be configured 
          in <strong>Settings → Lookups</strong> to match your company requirements.
        </AlertDescription>
      </Alert>
    </div>
  );
}
