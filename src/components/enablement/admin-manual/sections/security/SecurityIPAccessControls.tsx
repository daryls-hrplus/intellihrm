import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Globe, ShieldCheck, Ban, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { ScreenshotPlaceholder } from '@/components/enablement/manual/components/ScreenshotPlaceholder';

const IP_RESTRICTION_TYPES = [
  { type: "Whitelist", description: "Only allow access from specified IP addresses or ranges", useCase: "Office networks, VPN exit points" },
  { type: "Blacklist", description: "Block access from specified IP addresses or ranges", useCase: "Known malicious IPs, blocked countries" },
  { type: "Geo-Restriction", description: "Allow or deny access based on geographic location", useCase: "Country-specific compliance, data residency" },
];

const EXAMPLE_RULES = [
  { rule: "Corporate HQ", type: "Whitelist", value: "203.0.113.0/24", status: "Active" },
  { rule: "Branch Office - NYC", type: "Whitelist", value: "198.51.100.0/24", status: "Active" },
  { rule: "VPN Exit Point", type: "Whitelist", value: "192.0.2.50", status: "Active" },
  { rule: "Remote Work IPs", type: "Dynamic", value: "Verified employees", status: "Active" },
  { rule: "High-Risk Countries", type: "Geo-Block", value: "NK, IR, SY", status: "Active" },
];

export function SecurityIPAccessControls() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Configure IP-based access controls to restrict system access based on network location. 
        These controls add an additional layer of security beyond user authentication.
      </p>

      {/* IP Restriction Types */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-500" />
          IP Restriction Types
        </h4>
        <div className="space-y-3">
          {IP_RESTRICTION_TYPES.map((type, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                {type.type === "Whitelist" && <ShieldCheck className="h-4 w-4 text-green-500" />}
                {type.type === "Blacklist" && <Ban className="h-4 w-4 text-red-500" />}
                {type.type === "Geo-Restriction" && <MapPin className="h-4 w-4 text-amber-500" />}
                <span className="font-medium">{type.type}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{type.description}</p>
              <p className="text-xs text-muted-foreground">
                <strong>Use case:</strong> {type.useCase}
              </p>
            </div>
          ))}
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 4.8.1: IP Access Control configuration panel"
        alt="IP restriction settings showing whitelist, blacklist, and geo-restriction options"
      />

      {/* Current Rules */}
      <div>
        <h4 className="font-medium mb-4 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          Example IP Rules Configuration
        </h4>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Rule Name</th>
                <th className="text-left p-3 font-medium">Type</th>
                <th className="text-left p-3 font-medium">Value</th>
                <th className="text-left p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {EXAMPLE_RULES.map((rule, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 font-medium">{rule.rule}</td>
                  <td className="p-3">
                    <Badge 
                      variant="outline"
                      className={
                        rule.type === "Whitelist" ? "bg-green-500/10 text-green-700 border-green-500/30" :
                        rule.type === "Geo-Block" ? "bg-red-500/10 text-red-700 border-red-500/30" :
                        "bg-blue-500/10 text-blue-700 border-blue-500/30"
                      }
                    >
                      {rule.type}
                    </Badge>
                  </td>
                  <td className="p-3 font-mono text-xs">{rule.value}</td>
                  <td className="p-3">
                    <Badge variant="outline" className="bg-green-500/10 text-green-700">
                      {rule.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Options */}
      <div>
        <h4 className="font-medium mb-4">Configuration Options</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-sm mb-3">IP Format Support</h5>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Single IP: 203.0.113.50</li>
              <li>• CIDR Range: 203.0.113.0/24</li>
              <li>• IP Range: 203.0.113.1-203.0.113.100</li>
              <li>• IPv6 supported</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-sm mb-3">Exception Handling</h5>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Super Admin bypass option</li>
              <li>• Time-limited exceptions</li>
              <li>• API access separate rules</li>
              <li>• Emergency access procedures</li>
            </ul>
          </div>
        </div>
      </div>

      <ScreenshotPlaceholder
        caption="Figure 4.8.2: Adding a new IP restriction rule with validation"
        alt="New rule form showing IP input, type selection, and validation feedback"
      />

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Caution:</strong> Misconfigured IP restrictions can lock out legitimate users, including administrators. 
          Always maintain an emergency access procedure and test rules before applying to production.
        </AlertDescription>
      </Alert>
    </div>
  );
}
