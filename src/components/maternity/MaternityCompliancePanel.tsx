import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin } from "lucide-react";
import { useMaternityComplianceRules } from "@/hooks/useMaternityLeave";
import { REGION_LABELS, type ComplianceRegion } from "@/types/maternityLeave";

export function MaternityCompliancePanel() {
  const { data: rules = [], isLoading } = useMaternityComplianceRules();

  const regionGroups = rules.reduce((acc, rule) => {
    const region = rule.region as ComplianceRegion;
    if (!acc[region]) acc[region] = [];
    acc[region].push(rule);
    return acc;
  }, {} as Record<ComplianceRegion, typeof rules>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Regional Compliance Rules
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-center py-4 text-muted-foreground">Loading...</p>
        ) : (
          <Tabs defaultValue="caribbean">
            <TabsList>
              {Object.keys(regionGroups).map((region) => (
                <TabsTrigger key={region} value={region}>
                  {REGION_LABELS[region as ComplianceRegion]}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(regionGroups).map(([region, regionRules]) => (
              <TabsContent key={region} value={region} className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regionRules.map((rule) => (
                    <Card key={rule.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline">{rule.country_code}</Badge>
                          <span className="text-sm font-medium">
                            {rule.legal_minimum_weeks} weeks
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p>Payment: {rule.legal_payment_percentage}%</p>
                          <p>Pre-natal: {rule.mandatory_prenatal_weeks}w</p>
                          <p>Post-natal: {rule.mandatory_postnatal_weeks}w</p>
                        </div>
                        {rule.legislation_reference && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {rule.legislation_reference}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
