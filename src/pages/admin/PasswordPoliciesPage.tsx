import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
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
import { usePageAudit } from "@/hooks/usePageAudit";

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

export default function PasswordPoliciesPage() {
  usePageAudit('password_policies', 'Admin');
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
      toast.error(t('admin.passwordPolicies.loadFailed'));
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
      toast.success(t('admin.passwordPolicies.saved'));
    } catch (error) {
      console.error('Error saving password policy:', error);
      toast.error(t('admin.passwordPolicies.saveFailed'));
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
            {t('admin.passwordPolicies.noPolicyFound')}
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  const complexityCount = [
    policy.require_uppercase,
    policy.require_lowercase,
    policy.require_numbers,
    policy.require_special_chars,
  ].filter(Boolean).length;

  return (
    <AppLayout>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: t('admin.title', 'Admin'), href: '/admin' },
            { label: t('admin.passwordPolicies.title', 'Password Policies') },
          ]}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('admin.passwordPolicies.title')}</h1>
              <p className="text-muted-foreground">
                {t('admin.passwordPolicies.subtitle')}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {t('admin.passwordPolicies.saveChanges')}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Length Requirements */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t('admin.passwordPolicies.lengthRequirements.title')}</CardTitle>
              </div>
              <CardDescription>
                {t('admin.passwordPolicies.lengthRequirements.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min-length">{t('admin.passwordPolicies.lengthRequirements.minLength')}</Label>
                  <Input
                    id="min-length"
                    type="number"
                    min={8}
                    max={64}
                    value={policy.min_password_length}
                    onChange={(e) => updatePolicy({ min_password_length: parseInt(e.target.value) || 8 })}
                  />
                  <p className="text-xs text-muted-foreground">{t('admin.passwordPolicies.lengthRequirements.recommendedMin')}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-length">{t('admin.passwordPolicies.lengthRequirements.maxLength')}</Label>
                  <Input
                    id="max-length"
                    type="number"
                    min={64}
                    max={256}
                    value={policy.max_password_length}
                    onChange={(e) => updatePolicy({ max_password_length: parseInt(e.target.value) || 128 })}
                  />
                  <p className="text-xs text-muted-foreground">{t('admin.passwordPolicies.lengthRequirements.recommendedMax')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complexity Rules */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t('admin.passwordPolicies.complexityRules.title')}</CardTitle>
              </div>
              <CardDescription>
                {t('admin.passwordPolicies.complexityRules.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('admin.passwordPolicies.complexityRules.requireUppercase')}</Label>
                  <p className="text-xs text-muted-foreground">{t('admin.passwordPolicies.complexityRules.uppercaseHint')}</p>
                </div>
                <Switch
                  checked={policy.require_uppercase}
                  onCheckedChange={(checked) => updatePolicy({ require_uppercase: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('admin.passwordPolicies.complexityRules.requireLowercase')}</Label>
                  <p className="text-xs text-muted-foreground">{t('admin.passwordPolicies.complexityRules.lowercaseHint')}</p>
                </div>
                <Switch
                  checked={policy.require_lowercase}
                  onCheckedChange={(checked) => updatePolicy({ require_lowercase: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('admin.passwordPolicies.complexityRules.requireNumbers')}</Label>
                  <p className="text-xs text-muted-foreground">{t('admin.passwordPolicies.complexityRules.numbersHint')}</p>
                </div>
                <Switch
                  checked={policy.require_numbers}
                  onCheckedChange={(checked) => updatePolicy({ require_numbers: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('admin.passwordPolicies.complexityRules.requireSpecialChars')}</Label>
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
                <CardTitle className="text-lg">{t('admin.passwordPolicies.passwordHistory.title')}</CardTitle>
              </div>
              <CardDescription>
                {t('admin.passwordPolicies.passwordHistory.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="history-count">{t('admin.passwordPolicies.passwordHistory.rememberLastN', { defaultValue: 'Remember Last N Passwords' })}</Label>
                <Input
                  id="history-count"
                  type="number"
                  min={0}
                  max={24}
                  value={policy.password_history_count}
                  onChange={(e) => updatePolicy({ password_history_count: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  {t('admin.passwordPolicies.passwordHistory.cannotReuse', { count: policy.password_history_count })}
                </p>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t('admin.passwordPolicies.passwordHistory.industryStandard')}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Password Expiration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t('admin.passwordPolicies.passwordExpiration.title')}</CardTitle>
              </div>
              <CardDescription>
                {t('admin.passwordPolicies.passwordExpiration.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expiry-days">{t('admin.passwordPolicies.passwordExpiration.expiresAfterDays')}</Label>
                <Input
                  id="expiry-days"
                  type="number"
                  min={0}
                  max={365}
                  value={policy.password_expiry_days || 0}
                  onChange={(e) => updatePolicy({ password_expiry_days: parseInt(e.target.value) || null })}
                />
                <p className="text-xs text-muted-foreground">
                  {t('admin.passwordPolicies.passwordExpiration.noExpiration')}
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="warning-days">{t('admin.passwordPolicies.passwordExpiration.warningDays')}</Label>
                <Input
                  id="warning-days"
                  type="number"
                  min={1}
                  max={30}
                  value={policy.expiry_warning_days || 14}
                  onChange={(e) => updatePolicy({ expiry_warning_days: parseInt(e.target.value) || 14 })}
                />
                <p className="text-xs text-muted-foreground">
                  {t('admin.passwordPolicies.passwordExpiration.warningHint', { days: policy.expiry_warning_days })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Session Timeout */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t('admin.passwordPolicies.sessionTimeout.title')}</CardTitle>
              </div>
              <CardDescription>
                {t('admin.passwordPolicies.sessionTimeout.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">{t('admin.passwordPolicies.sessionTimeout.timeoutMinutes')}</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  min={5}
                  max={480}
                  value={policy.session_timeout_minutes || 30}
                  onChange={(e) => updatePolicy({ session_timeout_minutes: parseInt(e.target.value) || 30 })}
                />
                <p className="text-xs text-muted-foreground">
                  {t('admin.passwordPolicies.sessionTimeout.timeoutHint', { minutes: policy.session_timeout_minutes })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* First Login & MFA */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{t('admin.passwordPolicies.additionalSecurity.title')}</CardTitle>
              </div>
              <CardDescription>
                {t('admin.passwordPolicies.additionalSecurity.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('admin.passwordPolicies.additionalSecurity.requireFirstLoginChange')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('admin.passwordPolicies.additionalSecurity.firstLoginHint')}
                  </p>
                </div>
                <Switch
                  checked={policy.require_change_on_first_login}
                  onCheckedChange={(checked) => updatePolicy({ require_change_on_first_login: checked })}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="mfa-level">{t('admin.passwordPolicies.additionalSecurity.mfaLevel')}</Label>
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
                        <Badge variant="secondary">{t('admin.passwordPolicies.additionalSecurity.mfaOptional')}</Badge>
                        <span>{t('admin.passwordPolicies.additionalSecurity.mfaOptionalDesc')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="required_admins">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">{t('admin.passwordPolicies.additionalSecurity.mfaRequiredAdmins')}</Badge>
                        <span>{t('admin.passwordPolicies.additionalSecurity.mfaRequiredAdminsDesc')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="required_all">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">{t('admin.passwordPolicies.additionalSecurity.mfaRequiredAll')}</Badge>
                        <span>{t('admin.passwordPolicies.additionalSecurity.mfaRequiredAllDesc')}</span>
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
            <CardTitle className="text-lg">{t('admin.passwordPolicies.summary.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('admin.passwordPolicies.summary.minLength')}</p>
                <p className="text-2xl font-bold">{policy.min_password_length}</p>
                <p className="text-xs text-muted-foreground">{t('admin.passwordPolicies.summary.characters')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('admin.passwordPolicies.summary.complexity')}</p>
                <p className="text-2xl font-bold">{complexityCount}/4</p>
                <p className="text-xs text-muted-foreground">{t('admin.passwordPolicies.summary.types')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('admin.passwordPolicies.summary.history')}</p>
                <p className="text-2xl font-bold">{policy.password_history_count}</p>
                <p className="text-xs text-muted-foreground">{t('admin.passwordPolicies.summary.passwords')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('admin.passwordPolicies.summary.expiry')}</p>
                <p className="text-2xl font-bold">{policy.password_expiry_days || t('admin.passwordPolicies.summary.never')}</p>
                <p className="text-xs text-muted-foreground">{policy.password_expiry_days ? t('admin.passwordPolicies.summary.days') : ''}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('admin.passwordPolicies.summary.timeout')}</p>
                <p className="text-2xl font-bold">{policy.session_timeout_minutes}</p>
                <p className="text-xs text-muted-foreground">{t('admin.passwordPolicies.summary.minutes')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('admin.passwordPolicies.summary.mfa')}</p>
                <Badge variant={policy.mfa_enforcement_level === 'required_all' ? 'destructive' : policy.mfa_enforcement_level === 'required_admins' ? 'default' : 'secondary'}>
                  {policy.mfa_enforcement_level === 'required_all' ? t('admin.passwordPolicies.additionalSecurity.mfaRequiredAll') : 
                   policy.mfa_enforcement_level === 'required_admins' ? t('admin.passwordPolicies.additionalSecurity.mfaRequiredAdmins') : 
                   t('admin.passwordPolicies.additionalSecurity.mfaOptional')}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t('admin.passwordPolicies.summary.firstLogin')}</p>
                <Badge variant={policy.require_change_on_first_login ? 'default' : 'secondary'}>
                  {policy.require_change_on_first_login ? t('admin.passwordPolicies.summary.changeRequired') : t('admin.passwordPolicies.summary.noChange')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
