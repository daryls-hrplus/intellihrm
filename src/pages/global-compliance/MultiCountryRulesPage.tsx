import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe2, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function MultiCountryRulesPage() {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs items={[{ label: "Global/Regional Compliance", href: "/global-compliance" }, { label: "Multi-Country Rules" }]} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Globe2 className="h-8 w-8 text-primary" />
              Multi-Country Rules
            </h1>
            <p className="text-muted-foreground">Country-specific rule configuration and profiles</p>
          </div>
          <Button><Plus className="h-4 w-4 mr-2" />Add Country</Button>
        </div>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search countries..." className="pl-10" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {["Jamaica", "Trinidad & Tobago", "Barbados", "Ghana", "Nigeria", "Dominican Republic"].map((country) => (
            <Card key={country} className="cursor-pointer hover:border-primary/50">
              <CardHeader><CardTitle className="text-lg">{country}</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Configure payroll, tax, and labor rules</p></CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
