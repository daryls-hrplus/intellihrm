import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, CheckCircle2, AlertCircle, PlusCircle, RefreshCw } from "lucide-react";

const VERSION_HISTORY = [
  {
    version: "2.4",
    date: "January 2026",
    type: "current",
    changes: [
      { type: "added", text: "Added comprehensive Benefits Administrator Manual" },
      { type: "added", text: "New claims processing workflow documentation" },
      { type: "added", text: "Life events and special enrollment guidance" },
      { type: "added", text: "Cost projection and analytics documentation" },
      { type: "improved", text: "Enhanced enrollment management procedures" },
    ],
  },
  {
    version: "2.3",
    date: "December 2025",
    type: "previous",
    changes: [
      { type: "added", text: "Auto-enrollment rules configuration" },
      { type: "added", text: "Eligibility audit trail feature" },
      { type: "improved", text: "Updated plan comparison tool documentation" },
      { type: "fixed", text: "Corrected waiting period calculation examples" },
    ],
  },
  {
    version: "2.2",
    date: "October 2025",
    type: "previous",
    changes: [
      { type: "added", text: "Open enrollment tracker documentation" },
      { type: "added", text: "Benefit calculator usage guide" },
      { type: "improved", text: "Expanded coverage level configuration" },
      { type: "improved", text: "Regional compliance documentation for Caribbean" },
    ],
  },
  {
    version: "2.1",
    date: "August 2025",
    type: "previous",
    changes: [
      { type: "added", text: "Provider management documentation" },
      { type: "added", text: "Benefit categories setup guide" },
      { type: "improved", text: "Contribution configuration procedures" },
    ],
  },
  {
    version: "2.0",
    date: "June 2025",
    type: "previous",
    changes: [
      { type: "added", text: "Initial Benefits module documentation" },
      { type: "added", text: "Plan configuration and enrollment basics" },
      { type: "added", text: "Employee self-service benefits documentation" },
    ],
  },
];

export function BenefitsManualVersionHistory() {
  return (
    <div className="space-y-8" id="version-history" data-manual-anchor="version-history">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-orange-500" />
            <CardTitle>Version History</CardTitle>
          </div>
          <CardDescription>
            Track changes and updates to the Benefits Administrator Manual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {VERSION_HISTORY.map((release) => (
              <div key={release.version} className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-background border-2 border-primary" />
                
                <div className="flex items-center gap-3 mb-3">
                  <Badge 
                    variant={release.type === "current" ? "default" : "secondary"}
                    className={release.type === "current" ? "bg-primary" : ""}
                  >
                    v{release.version}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{release.date}</span>
                  {release.type === "current" && (
                    <Badge variant="outline" className="text-green-600 border-green-500/30 bg-green-500/10">
                      Current
                    </Badge>
                  )}
                </div>

                <ul className="space-y-2">
                  {release.changes.map((change, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      {change.type === "added" && (
                        <PlusCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      )}
                      {change.type === "improved" && (
                        <RefreshCw className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                      )}
                      {change.type === "fixed" && (
                        <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      )}
                      <span className="text-muted-foreground">{change.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
