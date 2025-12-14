import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, AlertTriangle } from "lucide-react";
import { useMFA } from "@/hooks/useMFA";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface MFAVerificationProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export function MFAVerification({ onSuccess, onCancel }: MFAVerificationProps) {
  const { t } = useTranslation();
  const { verifyCode } = useMFA();
  const { setMFAVerified } = useAuth();
  
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    
    setError(null);
    setIsSubmitting(true);
    
    const { error } = await verifyCode(code);
    
    setIsSubmitting(false);
    
    if (error) {
      setError(error.message || "Invalid verification code");
      setCode("");
    } else {
      setMFAVerified();
      onSuccess();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && code.length === 6) {
      handleVerify();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle>{t("auth.mfa.verifyTitle", "Two-Factor Authentication")}</CardTitle>
        <CardDescription>
          {t("auth.mfa.verifyDescription", "Enter the 6-digit code from your authenticator app")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="mfa-code">{t("auth.mfa.code", "Verification Code")}</Label>
          <Input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={handleKeyDown}
            className="font-mono text-center text-2xl tracking-[0.5em] h-14"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleVerify} 
            disabled={isSubmitting || code.length !== 6}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t("auth.mfa.verifyButton", "Verify & Continue")}
          </Button>
          
          {onCancel && (
            <Button 
              variant="ghost" 
              onClick={onCancel}
              className="w-full"
            >
              {t("common.cancel", "Cancel")}
            </Button>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground">
          {t("auth.mfa.helpText", "Open your authenticator app to view your code")}
        </p>
      </CardContent>
    </Card>
  );
}
