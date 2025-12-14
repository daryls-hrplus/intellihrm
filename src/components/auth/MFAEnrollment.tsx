import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, ShieldCheck, ShieldOff, Copy, Check, AlertTriangle } from "lucide-react";
import { useMFA } from "@/hooks/useMFA";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function MFAEnrollment() {
  const { t } = useTranslation();
  const { 
    factors, 
    isEnrolled, 
    isLoading, 
    enrollment,
    startEnrollment,
    verifyEnrollment,
    unenroll,
    cancelEnrollment
  } = useMFA();
  
  const [verifyCode, setVerifyCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleStartEnrollment = async () => {
    setError(null);
    setIsSubmitting(true);
    const { error } = await startEnrollment();
    setIsSubmitting(false);
    
    if (error) {
      setError(error.message || "Failed to start enrollment");
    }
  };

  const handleVerify = async () => {
    if (!enrollment || verifyCode.length !== 6) return;
    
    setError(null);
    setIsSubmitting(true);
    const { error } = await verifyEnrollment(enrollment.id, verifyCode);
    setIsSubmitting(false);
    
    if (error) {
      setError(error.message || "Invalid verification code");
    } else {
      toast.success("MFA successfully enabled!");
      setVerifyCode("");
    }
  };

  const handleUnenroll = async (factorId: string) => {
    setIsSubmitting(true);
    const { error } = await unenroll(factorId);
    setIsSubmitting(false);
    
    if (error) {
      toast.error("Failed to disable MFA");
    } else {
      toast.success("MFA disabled successfully");
    }
  };

  const copySecret = () => {
    if (enrollment?.totp.secret) {
      navigator.clipboard.writeText(enrollment.totp.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>{t("auth.mfa.title", "Two-Factor Authentication")}</CardTitle>
              <CardDescription>
                {t("auth.mfa.description", "Add an extra layer of security to your account")}
              </CardDescription>
            </div>
          </div>
          {isEnrolled && (
            <Badge variant="default" className="gap-1">
              <ShieldCheck className="h-3 w-3" />
              {t("auth.mfa.enabled", "Enabled")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isEnrolled && !enrollment && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("auth.mfa.setupInfo", "Use an authenticator app like Google Authenticator, Authy, or 1Password to generate verification codes.")}
            </p>
            <Button onClick={handleStartEnrollment} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Shield className="h-4 w-4 mr-2" />
              {t("auth.mfa.setup", "Set Up Two-Factor Authentication")}
            </Button>
          </div>
        )}

        {enrollment && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">{t("auth.mfa.step1", "Step 1: Scan QR Code")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("auth.mfa.scanInstructions", "Open your authenticator app and scan this QR code:")}
              </p>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img 
                  src={enrollment.totp.qr_code} 
                  alt="MFA QR Code" 
                  className="w-48 h-48"
                />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t("auth.mfa.manualEntry", "Can't scan? Enter manually:")}</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                  {enrollment.totp.secret}
                </code>
                <Button variant="outline" size="icon" onClick={copySecret}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">{t("auth.mfa.step2", "Step 2: Enter Verification Code")}</h4>
              <div className="space-y-2">
                <Label htmlFor="verify-code">{t("auth.mfa.enterCode", "6-digit code from your app")}</Label>
                <div className="flex gap-2">
                  <Input
                    id="verify-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    className="font-mono text-center text-lg tracking-widest"
                  />
                  <Button 
                    onClick={handleVerify} 
                    disabled={isSubmitting || verifyCode.length !== 6}
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {t("common.verify", "Verify")}
                  </Button>
                </div>
              </div>
            </div>

            <Button variant="ghost" onClick={cancelEnrollment}>
              {t("common.cancel", "Cancel")}
            </Button>
          </div>
        )}

        {isEnrolled && factors.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">
                {t("auth.mfa.activeMessage", "Two-factor authentication is active on your account")}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">{t("auth.mfa.enrolledDevices", "Enrolled Devices")}</h4>
              {factors.map((factor) => (
                <div key={factor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{factor.friendly_name || "Authenticator App"}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("auth.mfa.addedOn", "Added on")} {new Date(factor.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleUnenroll(factor.id)}
                    disabled={isSubmitting}
                  >
                    <ShieldOff className="h-4 w-4 mr-1" />
                    {t("auth.mfa.remove", "Remove")}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
