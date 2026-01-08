import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface DemoRegistration {
  id: string;
  company_name: string;
  contact_email: string;
  contact_name: string;
  demo_expires_at: string;
  status: string;
}

export default function DemoExpiredPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [registration, setRegistration] = useState<DemoRegistration | null>(null);

  const demoId = searchParams.get("id");

  useEffect(() => {
    const fetchRegistration = async () => {
      if (!demoId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("demo_registrations")
          .select("*")
          .eq("id", demoId)
          .single();

        if (data) {
          setRegistration(data as DemoRegistration);
        }
      } catch (err) {
        console.error("Error fetching registration:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistration();
  }, [demoId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <Clock className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Demo Expired</CardTitle>
          <CardDescription>
            {registration?.company_name || "Your demo"} has expired
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {registration && (
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Expired on</p>
              <p className="text-lg font-semibold">
                {format(new Date(registration.demo_expires_at), "MMMM d, yyyy")}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-center text-sm text-muted-foreground">
              Your demo period has ended. Choose one of the options below to continue:
            </p>

            <Button
              className="w-full"
              onClick={() => navigate(`/demo/convert?id=${demoId}`)}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Convert to Production
            </Button>

            <Button
              variant="outline"
              className="w-full"
            onClick={() => {
                // This would typically open a support contact form or send an extension request
                window.location.href = `mailto:sales@intellihrm.net?subject=Demo Extension Request - ${registration?.company_name || "Demo"}&body=Hello,%0A%0AI would like to request an extension for my demo.%0A%0ADemo ID: ${demoId}%0ACompany: ${registration?.company_name || "N/A"}%0A%0AThank you.`;
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Request Extension
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Questions? Contact{" "}
            <a href="mailto:support@intellihrm.net" className="text-primary hover:underline">
              support@intellihrm.net
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
