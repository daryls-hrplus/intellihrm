import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferenceDataBrowser } from "@/components/hr-hub/reference-data/ReferenceDataBrowser";
import { useLanguage } from "@/hooks/useLanguage";
import { usePageAudit } from "@/hooks/usePageAudit";
import { Database, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ReferenceDataCatalogPage() {
  const { t } = useLanguage();
  usePageAudit('reference_data_catalog', 'HR Hub');

  const breadcrumbItems = [
    { label: t("hrHub.title"), href: "/hr-hub" },
    { label: t("hrHub.referenceDataCatalog") },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("hrHub.referenceDataCatalog")}</h1>
              <p className="text-muted-foreground">{t("hrHub.referenceDataCatalogDesc")}</p>
            </div>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Browse system reference data (read-only standards) and configurable lookup values that you can customize for your organization.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>{t("hrHub.referenceDataCategories")}</CardTitle>
            <CardDescription>
              {t("hrHub.referenceDataCategoriesDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReferenceDataBrowser />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
