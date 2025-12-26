import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Building2, 
  Users, 
  Briefcase, 
  UserPlus,
  Upload,
  FolderTree
} from "lucide-react";
import { useState } from "react";
import { CompanyStructureImport } from "@/components/hr-hub/imports/CompanyStructureImport";
import { PositionsImport } from "@/components/hr-hub/imports/PositionsImport";
import { EmployeesImport } from "@/components/hr-hub/imports/EmployeesImport";
import { NewHiresImport } from "@/components/hr-hub/imports/NewHiresImport";

export default function HRDataImportPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("company-structure");

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
        </div>

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
      </div>
    </AppLayout>
  );
}
