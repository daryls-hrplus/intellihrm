import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Eye,
  Brain,
  Share2,
  BarChart3,
  FileOutput
} from "lucide-react";
import { useFeedbackGovernance, type ConsentType } from "@/hooks/useFeedbackGovernance";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface ConsentManagementPanelProps {
  cycleId: string;
  companyId: string;
  employeeId?: string;
  mode?: 'collect' | 'view';
  onConsentComplete?: () => void;
}

const CONSENT_TYPES: { type: ConsentType; label: string; description: string; icon: React.ElementType; required: boolean }[] = [
  {
    type: 'participation',
    label: 'Participation Consent',
    description: 'I agree to participate in this 360 feedback cycle and provide honest, constructive feedback.',
    icon: FileText,
    required: true
  },
  {
    type: 'data_processing',
    label: 'Data Processing',
    description: 'I consent to the collection and processing of my feedback data for performance management purposes.',
    icon: Eye,
    required: true
  },
  {
    type: 'ai_analysis',
    label: 'AI Analysis',
    description: 'I consent to AI-powered analysis of feedback to identify themes, detect bias, and generate insights.',
    icon: Brain,
    required: false
  },
  {
    type: 'signal_generation',
    label: 'Talent Signal Generation',
    description: 'I consent to the generation of talent signals from my feedback for use in talent management decisions.',
    icon: BarChart3,
    required: false
  },
  {
    type: 'external_sharing',
    label: 'External Sharing',
    description: 'I consent to my anonymized feedback being shared with external stakeholders if applicable.',
    icon: Share2,
    required: false
  },
  {
    type: 'report_distribution',
    label: 'Report Distribution',
    description: 'I consent to the distribution of feedback reports to authorized managers and HR personnel.',
    icon: FileOutput,
    required: false
  }
];

export function ConsentManagementPanel({ 
  cycleId, 
  companyId, 
  employeeId,
  mode = 'collect',
  onConsentComplete 
}: ConsentManagementPanelProps) {
  const { user } = useAuth();
  const targetEmployeeId = employeeId || user?.id;
  const { consents, loading, fetchConsents, recordConsent } = useFeedbackGovernance(companyId, cycleId);
  const [localConsents, setLocalConsents] = useState<Record<ConsentType, boolean>>({
    participation: false,
    data_processing: false,
    ai_analysis: false,
    external_sharing: false,
    signal_generation: false,
    report_distribution: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (targetEmployeeId) {
      fetchConsents(targetEmployeeId);
    }
  }, [targetEmployeeId, fetchConsents]);

  useEffect(() => {
    // Initialize local state from fetched consents
    const consentMap: Record<ConsentType, boolean> = {
      participation: false,
      data_processing: false,
      ai_analysis: false,
      external_sharing: false,
      signal_generation: false,
      report_distribution: false
    };

    consents.forEach(c => {
      if (c.consent_given && !c.withdrawn_at) {
        consentMap[c.consent_type] = true;
      }
    });

    setLocalConsents(consentMap);
  }, [consents]);

  const handleConsentChange = (type: ConsentType, checked: boolean) => {
    setLocalConsents(prev => ({ ...prev, [type]: checked }));
  };

  const handleSaveConsents = async () => {
    if (!targetEmployeeId) return;

    setSaving(true);
    try {
      const promises = Object.entries(localConsents).map(([type, given]) =>
        recordConsent(targetEmployeeId, type as ConsentType, given, "1.0")
      );

      await Promise.all(promises);
      onConsentComplete?.();
    } finally {
      setSaving(false);
    }
  };

  const requiredConsentsMet = CONSENT_TYPES
    .filter(c => c.required)
    .every(c => localConsents[c.type]);

  const getConsentStatus = (type: ConsentType) => {
    const consent = consents.find(c => c.consent_type === type);
    if (!consent) return 'pending';
    if (consent.withdrawn_at) return 'withdrawn';
    return consent.consent_given ? 'given' : 'declined';
  };

  const getStatusBadge = (type: ConsentType) => {
    const status = getConsentStatus(type);
    switch (status) {
      case 'given':
        return <Badge variant="outline" className="bg-success/10 text-success border-success/20"><CheckCircle className="h-3 w-3 mr-1" />Consented</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20"><XCircle className="h-3 w-3 mr-1" />Declined</Badge>;
      case 'withdrawn':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20"><AlertTriangle className="h-3 w-3 mr-1" />Withdrawn</Badge>;
      default:
        return <Badge variant="outline" className="bg-muted text-muted-foreground"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  if (mode === 'view') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Consent Records</CardTitle>
              <CardDescription>View consent status for this feedback cycle</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {CONSENT_TYPES.map((consent) => {
                const record = consents.find(c => c.consent_type === consent.type);
                return (
                  <div key={consent.type} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <consent.icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{consent.label}</p>
                        {record && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(record.consent_timestamp), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(consent.type)}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Consent Required</CardTitle>
            <CardDescription>Please review and provide consent before proceeding</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Items marked with * are required to participate in this feedback cycle.
          </AlertDescription>
        </Alert>

        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4">
            {CONSENT_TYPES.map((consent) => (
              <div 
                key={consent.type} 
                className={`p-4 rounded-lg border ${
                  consent.required && !localConsents[consent.type] 
                    ? 'border-warning/50 bg-warning/5' 
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={consent.type}
                    checked={localConsents[consent.type]}
                    onCheckedChange={(checked) => handleConsentChange(consent.type, checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor={consent.type} className="flex items-center gap-2 cursor-pointer">
                      <consent.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {consent.label}
                        {consent.required && <span className="text-destructive ml-1">*</span>}
                      </span>
                    </label>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      {consent.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Version 1.0 • Your consent is logged for audit purposes
          </p>
          <Button 
            onClick={handleSaveConsents}
            disabled={!requiredConsentsMet || saving || loading}
          >
            {saving ? "Saving..." : "Save Consent Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
