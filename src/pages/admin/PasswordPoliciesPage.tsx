import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { 
  KeyRound, 
  Lock, 
  Shield, 
  Clock, 
  History,
  Fingerprint,
  Save,
  Loader2,
  AlertTriangle,
  Info
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PasswordPolicy {
  id: string;
  company_id: string | null;
  min_password_length: number;
  max_password_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_special_chars: boolean;
  special_chars_allowed: string;
  password_history_count: number;
  password_expiry_days: number | null;
  expiry_warning_days: number | null;
  session_timeout_minutes: number | null;
  require_change_on_first_login: boolean;
  mfa_enforcement_level: string;
  is_active: boolean;
}

const defaultPolicy: Omit<PasswordPolicy, 'id'> = {
  company_id: null,
  min_password_length: 12,
  max_password_length: 128,
  require_uppercase: true,
  require_lowercase: true,
  require_numbers: true,
  require_special_chars: true,
  special_chars_allowed: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  password_history_count: 12,
  password_expiry_days: 90,
  expiry_warning_days: 14,
  session_timeout_minutes: 30,
  require_change_on_first_login: true,
  mfa_enforcement_level: 'optional',
  is_active: true,
};

export default function PasswordPoliciesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [policy, setPolicy] = useState<PasswordPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const { data, error } = await supabase
        .from('password_policies')
        .select('*')
        .is('company_id', null)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPolicy(data as PasswordPolicy);
      }
    } catch (error) {
      console.error('Error fetching password policy:', error);
      toast.error('Failed to load password policy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!policy) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('password_policies')
        .update({
          min_password_length: policy.min_password_length,
          max_password_length: policy.max_password_length,
          require_uppercase: policy.require_uppercase,
          require_lowercase: policy.require_lowercase,
          require_numbers: policy.require_numbers,
          require_special_chars: policy.require_special_chars,
          special_chars_allowed: policy.special_chars_allowed,
          password_history_count: policy.password_history_count,
          password_expiry_days: policy.password_expiry_days,
          expiry_warning_days: policy.expiry_warning_days,
          session_timeout_minutes: policy.session_timeout_minutes,
          require_change_on_first_login: policy.require_change_on_first_login,
          mfa_enforcement_level: policy.mfa_enforcement_level,
          updated_by: user?.id,
        })
        .eq('id', policy.id);

      if (error) throw error;
      toast.success('Password policy saved successfully');
    } catch (error) {
      console.error('Error saving password policy:', error);
      toast.error('Failed to save password policy');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePolicy = (updates: Partial<PasswordPolicy>) => {
    if (policy) {
      setPolicy({ ...policy, ...updates });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!policy) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No password policy found. Please contact support.
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Password Policies</h1>
              <p className="text-muted-foreground">
                Configure enterprise password security requirements
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Length Requirements */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Length Requirements</CardTitle>
              </div>
              <CardDescription>
                Set minimum and maximum password length
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-length">Minimum Length</Label>
                  <Input
                    id="min-length"
                    type="number"
                    min={8}
                    max={64}
                    value={policy.min_password_length}
                    onChange={(e) => updatePolicy({ min_password_length: parseInt(e.target.value) || 8 })}
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 12+</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-length">Maximum Length</Label>
                  <Input
                    id="max-length"
                    type="number"
                    min={64}
                    max={256}
                    value={policy.max_password_length}
                    onChange={(e) => updatePolicy({ max_password_length: parseInt(e.target.value) || 128 })}
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 128</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complexity Rules */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Complexity Rules</CardTitle>
              </div>
              <CardDescription>
                Require specific character types in passwords
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Uppercase Letters</Label>
                  <p className="text-xs text-muted-foreground">A-Z</p>
                </div>
                <Switch
                  checked={policy.require_uppercase}
                  onCheckedChange={(checked) => updatePolicy({ require_uppercase: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Lowercase Letters</Label>
                  <p className="text-xs text-muted-foreground">a-z</p>
                </div>
                <Switch
                  checked={policy.require_lowercase}
                  onCheckedChange={(checked) => updatePolicy({ require_lowercase: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Numbers</Label>
                  <p className="text-xs text-muted-foreground">0-9</p>
                </div>
                <Switch
                  checked={policy.require_numbers}
                  onCheckedChange={(checked) => updatePolicy({ require_numbers: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Special Characters</Label>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {policy.special_chars_allowed}
                  </p>
                </div>
                <Switch
                  checked={policy.require_special_chars}
                  onCheckedChange={(checked) => updatePolicy({ require_special_chars: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Password History */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Password History</CardTitle>
              </div>
              <CardDescription>
                Prevent reuse of recent passwords
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="history-count">Remember Last N Passwords</Label>
                <Input
                  id="history-count"
                  type="number"
                  min={0}
                  max={24}
                  value={policy.password_history_count}
                  onChange={(e) => updatePolicy({ password_history_count: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  Users cannot reuse their last {policy.password_history_count} passwords
                </p>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Industry standard recommends remembering at least 12 previous passwords.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Password Expiration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Password Expiration</CardTitle>
              </div>
              <CardDescription>
                Force periodic password changes with advance warnings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expiry-days">Password Expires After (Days)</Label>
                <Input
                  id="expiry-days"
                  type="number"
                  min={0}
                  max={365}
                  value={policy.password_expiry_days || 0}
                  onChange={(e) => updatePolicy({ password_expiry_days: parseInt(e.target.value) || null })}
                />
                <p className="text-xs text-muted-foreground">
                  Set to 0 for no expiration
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="warning-days">Warning Days Before Expiry</Label>
                <Input
                  id="warning-days"
                  type="number"
                  min={1}
                  max={30}
                  value={policy.expiry_warning_days || 14}
                  onChange={(e) => updatePolicy({ expiry_warning_days: parseInt(e.target.value) || 14 })}
                />
                <p className="text-xs text-muted-foreground">
                  Users will see daily popup reminders starting {policy.expiry_warning_days} days before expiry
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Session Timeout */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Session Timeout</CardTitle>
              </div>
              <CardDescription>
                Auto-logout after period of inactivity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Timeout After (Minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min={5}
                  max={480}
                  value={policy.session_timeout_minutes || 30}
                  onChange={(e) => updatePolicy({ session_timeout_minutes: parseInt(e.target.value) || 30 })}
                />
                <p className="text-xs text-muted-foreground">
                  Users will be logged out after {policy.session_timeout_minutes} minutes of inactivity
                </p>
              </div>
            </CardContent>
          </Card>

          {/* First Login & MFA */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Additional Security</CardTitle>
              </div>
              <CardDescription>
                First login requirements and MFA enforcement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Password Change on First Login</Label>
                  <p className="text-xs text-muted-foreground">
                    New users must change their temporary password
                  </p>
                </div>
                <Switch
                  checked={policy.require_change_on_first_login}
                  onCheckedChange={(checked) => updatePolicy({ require_change_on_first_login: checked })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="mfa-level">MFA Enforcement Level</Label>
                <Select
                  value={policy.mfa_enforcement_level}
                  onValueChange={(value) => updatePolicy({ mfa_enforcement_level: value })}
                >
                  <SelectTrigger id="mfa-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="optional">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Optional</Badge>
                        <span>Users can choose to enable MFA</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="required_admins">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Required for Admins</Badge>
                        <span>Admins must use MFA</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="required_all">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Required for All</Badge>
                        <span>All users must use MFA</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Policy Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Policy Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{policy.min_password_length}</p>
                <p className="text-xs text-muted-foreground">Min Length</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{policy.password_history_count}</p>
                <p className="text-xs text-muted-foreground">History Count</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{policy.password_expiry_days || '∞'}</p>
                <p className="text-xs text-muted-foreground">Expiry Days</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">{policy.session_timeout_minutes}</p>
                <p className="text-xs text-muted-foreground">Session Timeout (min)</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {policy.require_uppercase && <Badge>Uppercase Required</Badge>}
              {policy.require_lowercase && <Badge>Lowercase Required</Badge>}
              {policy.require_numbers && <Badge>Numbers Required</Badge>}
              {policy.require_special_chars && <Badge>Special Chars Required</Badge>}
              {policy.require_change_on_first_login && <Badge variant="secondary">First Login Change</Badge>}
              <Badge variant={policy.mfa_enforcement_level === 'required_all' ? 'destructive' : 'outline'}>
                MFA: {policy.mfa_enforcement_level.replace('_', ' ')}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
