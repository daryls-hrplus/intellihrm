import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MFAVerification } from "@/components/auth/MFAVerification";
import { Shield } from "lucide-react";

export default function MFAChallengePage() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerificationSuccess = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the verification code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MFAVerification
            onSuccess={handleVerificationSuccess}
            onCancel={() => navigate("/auth")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
