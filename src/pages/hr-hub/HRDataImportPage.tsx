import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Users, 
  Briefcase, 
  UserPlus,
  Upload,
  FolderTree,
  Wand2,
  History,
  List
} from "lucide-react";
import { useState } from "react";
import { CompanyStructureImport } from "@/components/hr-hub/imports/CompanyStructureImport";
import { PositionsImport } from "@/components/hr-hub/imports/PositionsImport";
import { EmployeesImport } from "@/components/hr-hub/imports/EmployeesImport";
import { NewHiresImport } from "@/components/hr-hub/imports/NewHiresImport";
import { ImportWizard } from "@/components/hr-hub/imports/ImportWizard";
import { ImportHistory } from "@/components/hr-hub/imports/ImportHistory";

export default function HRDataImportPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("company-structure");
  const [viewMode, setViewMode] = useState<"wizard" | "manual" | "history">("wizard");

  const breadcrumbItems = [
    { label: t("hrHub.title"), href: "/hr-hub" },
    { label: t("hrHub.dataImport.title") },
  ];

  const importTypes = [
    { 
      id: "company-structure", 
      label: t("hrHub.dataImport.companyStructure"), 
      icon: FolderTree,
      description: t("hrHub.dataImport.companyStructureDesc")
    },
    { 
      id: "positions", 
      label: t("hrHub.dataImport.positions"), 
      icon: Briefcase,
      description: t("hrHub.dataImport.positionsDesc")
    },
    { 
      id: "employees", 
      label: t("hrHub.dataImport.employees"), 
      icon: Users,
      description: t("hrHub.dataImport.employeesDesc")
    },
    { 
      id: "new-hires", 
      label: t("hrHub.dataImport.newHires"), 
      icon: UserPlus,
      description: t("hrHub.dataImport.newHiresDesc")
    },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Upload className="h-8 w-8 text-primary" />
              {t("hrHub.dataImport.title")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t("hrHub.dataImport.subtitle")}
            </p>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === "wizard" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("wizard")}
              className="gap-2"
            >
              <Wand2 className="h-4 w-4" />
              Wizard
            </Button>
            <Button
              variant={viewMode === "manual" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("manual")}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Manual
            </Button>
            <Button
              variant={viewMode === "history" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("history")}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              History
            </Button>
          </div>
        </div>

        {/* Wizard Mode */}
        {viewMode === "wizard" && (
          <ImportWizard
            onComplete={() => setViewMode("history")}
            onCancel={() => setViewMode("manual")}
          />
        )}

        {/* History Mode */}
        {viewMode === "history" && (
          <ImportHistory />
        )}

        {/* Manual Mode */}
        {viewMode === "manual" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("hrHub.dataImport.selectType")}</CardTitle>
              <CardDescription>
                {t("hrHub.dataImport.selectTypeDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  {importTypes.map((type) => (
                    <TabsTrigger 
                      key={type.id} 
                      value={type.id}
                      className="flex items-center gap-2"
                    >
                      <type.icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{type.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="company-structure">
                  <CompanyStructureImport />
                </TabsContent>

                <TabsContent value="positions">
                  <PositionsImport />
                </TabsContent>

                <TabsContent value="employees">
                  <EmployeesImport />
                </TabsContent>

                <TabsContent value="new-hires">
                  <NewHiresImport />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
