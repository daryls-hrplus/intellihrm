import { Globe, MapPin, FileCheck, Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RegionCard = ({ 
  region, 
  countries, 
  highlights,
  color
}: { 
  region: string; 
  countries: string[];
  highlights: string[];
  color: string;
}) => (
  <Card className="border-border/50">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className={`h-5 w-5 ${color}`} />
          {region}
        </CardTitle>
        <Badge variant="secondary" className="text-xs">
          {countries.length} Countries
        </Badge>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {countries.map((country, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {country}
          </Badge>
        ))}
      </div>
    </CardHeader>
    <CardContent>
      <ul className="space-y-2">
        {highlights.map((highlight, index) => (
          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
            <FileCheck className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
            {highlight}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export const RegionalCompliance = () => {
  return (
    <section id="regional-compliance" className="space-y-6">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="mb-2">Global Coverage</Badge>
        <h2 className="text-2xl font-bold">Regional Compliance</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Purpose-built for the Caribbean and Africa with deep regional expertise and compliance capabilities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RegionCard
          region="Caribbean"
          countries={["Jamaica", "Trinidad & Tobago", "Barbados", "Bahamas", "OECS"]}
          highlights={[
            "Jamaica: NIS, NHT, HEART, PAYE, Education Tax",
            "Trinidad: NIS, PAYE, Health Surcharge",
            "Multi-island payroll consolidation",
            "Caribbean labor law compliance",
            "Statutory leave entitlements",
            "Regional public holiday calendars"
          ]}
          color="text-blue-500"
        />

        <RegionCard
          region="Africa"
          countries={["Ghana", "Nigeria", "Kenya", "South Africa"]}
          highlights={[
            "Ghana: SSNIT, PAYE, Tier 1/2/3 pensions",
            "Nigeria: Pension Fund Administration",
            "Regional labor law frameworks",
            "Country-specific tax calculations",
            "Union and CBA compliance",
            "Statutory reporting requirements"
          ]}
          color="text-amber-500"
        />

        <RegionCard
          region="Global Standards"
          countries={["GDPR", "ISO 27001", "SOC 2"]}
          highlights={[
            "GDPR data protection compliance",
            "Data residency awareness",
            "Consent management",
            "Right to erasure support",
            "Cross-border data transfer controls",
            "Privacy impact assessments"
          ]}
          color="text-purple-500"
        />
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Compliance Configuration</h3>
              <p className="text-sm text-muted-foreground mb-3">
                All compliance rules are fully configurable, versioned, and auditable. Override capabilities with approval workflows ensure flexibility while maintaining governance.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Versioned Rules</Badge>
                <Badge variant="secondary">Country-Scoped</Badge>
                <Badge variant="secondary">Audit Trail</Badge>
                <Badge variant="secondary">Override with Approval</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
