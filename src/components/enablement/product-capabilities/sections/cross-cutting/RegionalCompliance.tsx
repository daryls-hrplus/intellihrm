import { Globe, MapPin, FileCheck, Scale, Building, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChallengePromise } from "../../components/ChallengePromise";
import { KeyOutcomeMetrics } from "../../components/KeyOutcomeMetrics";

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
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-bold">Regional Compliance</h2>
          <Badge className="bg-primary/10 text-primary border-primary/20">50+</Badge>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Purpose-built for the Caribbean, Latin America, Africa, and Middle East with deep regional expertise and compliance capabilities
        </p>
      </div>

      <ChallengePromise
        challenge="Global HR software fails locally. Caribbean tax rules don't fit North American templates. African labor laws aren't in the system. Regional statutory requirements become manual spreadsheets. When compliance is an afterthought, organizations face fines, legal exposure, and endless manual workarounds."
        promise="Intelli HRM was built for the Caribbean, Africa, and Latin America from day one—not adapted from a US template. Every statutory deduction, every labor law nuance, every public holiday is configured and maintained. Compliance rules are versioned, auditable, and configurable. When regulations change, the system updates—not your spreadsheets."
      />

      <KeyOutcomeMetrics
        outcomes={[
          { value: "100%", label: "Statutory Compliance", description: "All contributions calculated correctly" },
          { value: "15+", label: "Countries Supported", description: "Deep regional coverage" },
          { value: "Real-time", label: "Regulation Updates", description: "Configurable compliance rules" },
          { value: "Zero", label: "Manual Calculations", description: "Automated statutory processing" }
        ]}
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-lg bg-muted/30">
        <div className="text-center p-3">
          <p className="text-sm font-medium">Payroll Manager</p>
          <p className="text-xs text-muted-foreground italic">"Every deduction calculates correctly for every country"</p>
        </div>
        <div className="text-center p-3">
          <p className="text-sm font-medium">HR Director</p>
          <p className="text-xs text-muted-foreground italic">"Labor law compliance is built-in, not bolted on"</p>
        </div>
        <div className="text-center p-3">
          <p className="text-sm font-medium">CFO</p>
          <p className="text-xs text-muted-foreground italic">"Multi-country payroll runs without surprises"</p>
        </div>
        <div className="text-center p-3">
          <p className="text-sm font-medium">Legal Counsel</p>
          <p className="text-xs text-muted-foreground italic">"Audit-ready documentation for every jurisdiction"</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RegionCard
          region="Caribbean"
          countries={["Jamaica", "Trinidad & Tobago", "Barbados", "Bahamas", "OECS Islands"]}
          highlights={[
            "Jamaica: NIS, NHT, HEART/NSTA Trust, PAYE, Education Tax, Minimum wage calculations",
            "Trinidad & Tobago: NIS, PAYE, Health Surcharge with employer/employee splits",
            "Barbados: NIS contributions, PAYE tax tables, severance calculations",
            "Bahamas: NIB contributions, VAT considerations",
            "Multi-island payroll consolidation with cross-territory reporting",
            "Caribbean labor law compliance: probation, termination, redundancy rules",
            "Statutory leave entitlements by country (vacation, sick, maternity/paternity)",
            "Regional public holiday calendars with automatic schedule adjustments"
          ]}
          color="text-blue-500"
        />

        <RegionCard
          region="Latin America"
          countries={["Dominican Republic", "Mexico", "Colombia", "Panama"]}
          highlights={[
            "Dominican Republic: AFP pension, ARS health, ISR tax, Infotep, TSS contributions",
            "Mexico: IMSS, Infonavit, ISN payroll tax, Aguinaldo (13th month), PTU calculations",
            "Colombia: EPS health, AFP pension, ARL risk, parafiscal contributions, Prima",
            "Panama: CSS social security, educational insurance, professional risk",
            "Labor code compliance: termination, severance, indemnification by country",
            "Multi-currency payroll with USD/local currency handling",
            "Spanish language support across all modules"
          ]}
          color="text-emerald-500"
        />

        <RegionCard
          region="Africa"
          countries={["Ghana", "Nigeria", "South Africa", "Kenya"]}
          highlights={[
            "Ghana: SSNIT (Tier 1), Provident Fund (Tier 2), Voluntary Pension (Tier 3), PAYE",
            "Nigeria: PFA/RSA pension contributions, PAYE/tax with state variations",
            "Nigeria: NHF (National Housing Fund), NHIS health, ITF contributions",
            "South Africa: UIF, SDL, PAYE, Medical Aid schemes",
            "Kenya: NHIF, NSSF, PAYE, Housing Levy",
            "Regional labor law frameworks: termination and redundancy",
            "Union and Collective Bargaining Agreement (CBA) compliance",
            "Statutory reporting requirements and government file submissions"
          ]}
          color="text-amber-500"
        />

        <RegionCard
          region="Middle East"
          countries={["UAE", "Saudi Arabia"]}
          highlights={[
            "UAE: WPS (Wage Protection System) compliance",
            "UAE: Gratuity calculations (EOSB)",
            "Saudi Arabia: GOSI contributions",
            "End of service benefit calculations",
            "Visa and work permit management integration",
            "Arabic language support"
          ]}
          color="text-rose-500"
        />

        <RegionCard
          region="Global Standards"
          countries={["GDPR", "ISO 27001", "SOC 2", "ISO 42001"]}
          highlights={[
            "GDPR data protection compliance with lawful basis tracking",
            "Data residency awareness with configurable storage locations",
            "Consent management with granular opt-in/opt-out tracking",
            "Right to erasure support with data anonymization workflows",
            "Cross-border data transfer controls with adequacy assessments",
            "Privacy impact assessments (DPIA) for high-risk processing",
            "Security controls aligned with ISO 27001 and SOC 2 Type II",
            "AI governance aligned with ISO 42001"
          ]}
          color="text-purple-500"
        />

        <Card className="border-border/50 bg-gradient-to-br from-teal-500/5 to-teal-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Landmark className="h-5 w-5 text-teal-500" />
              Compliance Configuration Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              All compliance rules are fully configurable, versioned, and auditable. Country-specific logic is encapsulated in configuration layers, not hard-coded.
            </p>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <FileCheck className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                Rule versioning and effective dating
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <FileCheck className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                Country-scoped configurations
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <FileCheck className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                Override capabilities with approval
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <FileCheck className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                Rate table and threshold management
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <FileCheck className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                Formula builder for custom calculations
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <FileCheck className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                Regulatory calendar and deadline tracking
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <FileCheck className="h-4 w-4 text-teal-500 mt-0.5 shrink-0" />
                Compliance testing and impact simulation
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Regional-First Architecture</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Unlike global HCM platforms that adapt US-centric designs, Intelli HRM was architected from day one for regional complexity. Every statutory requirement, labor law variation, and cultural nuance is a first-class citizen in our data model.
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
