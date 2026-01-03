import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, ShieldOff } from "lucide-react";

export type IndividualAccessMode = 'never' | 'investigation_only' | 'always';

interface IndividualResponseAccessSelectorProps {
  value: IndividualAccessMode;
  onChange: (value: IndividualAccessMode) => void;
  disabled?: boolean;
}

export function IndividualResponseAccessSelector({
  value,
  onChange,
  disabled = false,
}: IndividualResponseAccessSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm font-medium">Individual Response Access</Label>
      </div>

      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as IndividualAccessMode)}
        disabled={disabled}
        className="space-y-2"
      >
        <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
          <RadioGroupItem value="never" id="never" />
          <div className="flex-1">
            <Label htmlFor="never" className="font-medium cursor-pointer flex items-center gap-2">
              Never
              <Badge variant="secondary" className="text-xs">Recommended</Badge>
            </Label>
            <p className="text-sm text-muted-foreground">
              Individual responses are never visible. Maximum anonymity protection.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
          <RadioGroupItem value="investigation_only" id="investigation_only" />
          <div className="flex-1">
            <Label htmlFor="investigation_only" className="font-medium cursor-pointer">
              Investigation Mode Only
            </Label>
            <p className="text-sm text-muted-foreground">
              Requires formal request and HR Director approval. All access is logged.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 rounded-lg border border-destructive/30 hover:bg-destructive/5 transition-colors">
          <RadioGroupItem value="always" id="always" />
          <div className="flex-1">
            <Label htmlFor="always" className="font-medium cursor-pointer flex items-center gap-2">
              <ShieldOff className="h-4 w-4 text-destructive" />
              Always Available
              <Badge variant="destructive" className="text-xs">Not Recommended</Badge>
            </Label>
            <p className="text-sm text-muted-foreground">
              Individual responses visible without approval. May reduce feedback quality.
            </p>
          </div>
        </div>
      </RadioGroup>

      {value === 'always' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Anonymity Warning:</strong> Enabling unrestricted access to individual responses may:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Reduce honest feedback in future cycles</li>
              <li>Create legal liability under GDPR/data protection laws</li>
              <li>Undermine program credibility with employees</li>
            </ul>
            <p className="mt-2">
              <strong>Recommendation:</strong> Use Investigation Mode for exception-based access instead.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {value === 'investigation_only' && (
        <Alert className="bg-info/10 border-info/30">
          <Shield className="h-4 w-4 text-info" />
          <AlertDescription className="text-sm">
            HR staff can request access to individual responses for documented investigations. 
            Requests require HR Director approval and all access is fully logged for audit purposes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
