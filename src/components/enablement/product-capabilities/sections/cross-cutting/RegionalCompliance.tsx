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
          {countries.length} {countries.length === 1 ? 'Focus' : 'Countries'}
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
          Purpose-built for the Caribbean, Latin America, and Africa with deep regional expertise and compliance capabilities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RegionCard
          region="Caribbean"
          countries={["Jamaica", "Trinidad & Tobago", "Barbados", "Bahamas", "OECS Islands"]}
          highlights={[
            "Jamaica: NIS, NHT, HEART/NSTA Trust, PAYE, Education Tax with automatic calculations",
            "Trinidad & Tobago: NIS, PAYE, Health Surcharge with employer/employee splits",
            "Barbados: NIS contributions, PAYE tax tables, severance calculations",
            "Multi-island payroll consolidation with cross-territory reporting",
            "Caribbean labor law compliance including probation, termination, and redundancy rules",
            "Statutory leave entitlements by country (vacation, sick, maternity/paternity)",
            "Regional public holiday calendars with automatic schedule adjustments"
          ]}
          color="text-blue-500"
        />

        <RegionCard
          region="Latin America"
          countries={["Dominican Republic", "Mexico", "Colombia", "Panama"]}
          highlights={[
            "Dominican Republic: AFP pension, ARS health, ISR tax, Infotep contributions",
            "Mexico: IMSS, Infonavit, ISN payroll tax, Aguinaldo (13th month) calculations",
            "Colombia: EPS health, AFP pension, ARL risk, parafiscal contributions",
            "Panama: CSS social security, educational insurance, professional risk",
            "Labor code compliance for termination, severance, and indemnification",
            "Multi-currency payroll with USD/local currency handling",
            "Spanish language support across all modules and communications"
          ]}
          color="text-emerald-500"
        />

        <RegionCard
          region="Africa"
          countries={["Ghana", "Nigeria"]}
          highlights={[
            "Ghana: SSNIT contributions (Tier 1), provident fund (Tier 2), voluntary pension (Tier 3)",
            "Ghana: PAYE tax calculations with progressive tax bands and reliefs",
            "Nigeria: Pension Fund Administration with RSA contributions",
            "Nigeria: PAYE/tax tables with state-level variations and allowances",
            "Nigeria: NHF (National Housing Fund), NHIS health insurance",
            "Regional labor law frameworks including termination and redundancy",
            "Union and Collective Bargaining Agreement (CBA) compliance",
            "Statutory reporting requirements and government file submissions"
          ]}
          color="text-amber-500"
        />

        <RegionCard
          region="Global Standards"
          countries={["GDPR", "ISO 27001", "SOC 2"]}
          highlights={[
            "GDPR data protection compliance with lawful basis tracking",
            "Data residency awareness with configurable storage locations",
            "Consent management with granular opt-in/opt-out tracking",
            "Right to erasure support with data anonymization workflows",
            "Cross-border data transfer controls with adequacy assessments",
            "Privacy impact assessments (DPIA) for high-risk processing",
            "Security controls aligned with ISO 27001 and SOC 2 Type II"
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
              <h3 className="font-semibold mb-2">Compliance Configuration Engine</h3>
              <p className="text-sm text-muted-foreground mb-3">
                All compliance rules are fully configurable, versioned, and auditable. Country-specific logic is encapsulated in configuration layers, not hard-coded. Override capabilities with approval workflows ensure flexibility while maintaining governance and audit trails.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Versioned Rules</Badge>
                <Badge variant="secondary">Country-Scoped</Badge>
                <Badge variant="secondary">Full Audit Trail</Badge>
                <Badge variant="secondary">Override with Approval</Badge>
                <Badge variant="secondary">Multi-Currency</Badge>
                <Badge variant="secondary">Multi-Language</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
