import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Users, 
  Grid3X3, 
  GitBranch, 
  BarChart3, 
  Shield,
  Clock,
  MessageSquare
} from 'lucide-react';

export interface CycleUsagePolicy {
  cycle_purpose: string;
  feed_to_appraisal: boolean;
  feed_to_talent_profile: boolean;
  feed_to_nine_box: boolean;
  feed_to_succession: boolean;
  include_in_analytics: boolean;
  anonymity_threshold: number;
  retention_period_months: number;
  ai_tone_setting: string;
}

interface CycleUsagePolicyEditorProps {
  value: CycleUsagePolicy;
  onChange: (policy: CycleUsagePolicy) => void;
  disabled?: boolean;
}

const CYCLE_PURPOSES = [
  { value: 'development', label: 'Development', description: 'Focus on growth and improvement' },
  { value: 'evaluation', label: 'Evaluation', description: 'Feed into performance reviews' },
  { value: 'assessment', label: 'Assessment', description: 'Talent assessment and calibration' },
];

const AI_TONES = [
  { value: 'development', label: 'Development-focused', description: 'Emphasize growth opportunities' },
  { value: 'neutral', label: 'Neutral', description: 'Balanced factual summaries' },
  { value: 'evaluative', label: 'Evaluative', description: 'Performance-oriented language' },
];

export function CycleUsagePolicyEditor({
  value,
  onChange,
  disabled = false,
}: CycleUsagePolicyEditorProps) {
  const updateField = <K extends keyof CycleUsagePolicy>(
    field: K,
    fieldValue: CycleUsagePolicy[K]
  ) => {
    onChange({ ...value, [field]: fieldValue });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Signal Routing & Policy
        </CardTitle>
        <CardDescription>
          Configure where feedback signals flow and how they're used
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cycle Purpose */}
        <div className="space-y-2">
          <Label>Cycle Purpose</Label>
          <Select
            value={value.cycle_purpose}
            onValueChange={(v) => updateField('cycle_purpose', v)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              {CYCLE_PURPOSES.map((purpose) => (
                <SelectItem key={purpose.value} value={purpose.value}>
                  <div>
                    <div className="font-medium">{purpose.label}</div>
                    <div className="text-xs text-muted-foreground">{purpose.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Signal Routing */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Route Signals To</Label>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Appraisals</span>
              </div>
              <Switch
                checked={value.feed_to_appraisal}
                onCheckedChange={(v) => updateField('feed_to_appraisal', v)}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Talent Profile</span>
              </div>
              <Switch
                checked={value.feed_to_talent_profile}
                onCheckedChange={(v) => updateField('feed_to_talent_profile', v)}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">9-Box Grid</span>
              </div>
              <Switch
                checked={value.feed_to_nine_box}
                onCheckedChange={(v) => updateField('feed_to_nine_box', v)}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Succession Planning</span>
              </div>
              <Switch
                checked={value.feed_to_succession}
                onCheckedChange={(v) => updateField('feed_to_succession', v)}
                disabled={disabled}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg sm:col-span-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Analytics & Reporting</span>
              </div>
              <Switch
                checked={value.include_in_analytics}
                onCheckedChange={(v) => updateField('include_in_analytics', v)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Privacy & Governance */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Privacy & Governance</Label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Anonymity Threshold
              </Label>
              <Input
                type="number"
                min={2}
                max={10}
                value={value.anonymity_threshold}
                onChange={(e) => updateField('anonymity_threshold', parseInt(e.target.value) || 3)}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                Minimum responses required before showing aggregate results
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Retention Period (months)
              </Label>
              <Input
                type="number"
                min={6}
                max={120}
                value={value.retention_period_months}
                onChange={(e) => updateField('retention_period_months', parseInt(e.target.value) || 36)}
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground">
                How long to keep raw feedback data
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* AI Settings */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Summary Tone
          </Label>
          <Select
            value={value.ai_tone_setting}
            onValueChange={(v) => updateField('ai_tone_setting', v)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              {AI_TONES.map((tone) => (
                <SelectItem key={tone.value} value={tone.value}>
                  <div>
                    <div className="font-medium">{tone.label}</div>
                    <div className="text-xs text-muted-foreground">{tone.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
