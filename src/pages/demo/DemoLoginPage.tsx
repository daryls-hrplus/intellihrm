import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface DemoRegistration {
  id: string;
  company_name: string;
  assigned_subdomain: string;
  contact_email: string;
  contact_name: string;
  demo_expires_at: string;
  status: string;
}

export default function DemoLoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registration, setRegistration] = useState<DemoRegistration | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const demoId = searchParams.get("id");
  const subdomain = searchParams.get("subdomain");

  useEffect(() => {
    const fetchRegistration = async () => {
      if (!demoId && !subdomain) {
        setError("Invalid demo link. Please check the URL.");
        setIsLoading(false);
        return;
      }

      try {
        let query = supabase
          .from("demo_registrations")
          .select("*");

        if (demoId) {
          query = query.eq("id", demoId);
        } else if (subdomain) {
          query = query.eq("subdomain", subdomain);
        }

        const { data, error: fetchError } = await query.single();

        if (fetchError || !data) {
          setError("Demo not found. Please check your link or contact support.");
          setIsLoading(false);
          return;
        }

        const reg = data as DemoRegistration;

        // Check if expired
        if (new Date(reg.demo_expires_at) < new Date()) {
          navigate(`/demo/expired?id=${reg.id}`);
          return;
        }

        // Check status
        if (reg.status === "converted") {
          setError("This demo has been converted to a production tenant. Please use the main login.");
          setIsLoading(false);
          return;
        }

        if (reg.status !== "provisioned") {
          setError("This demo is still being set up. Please check back in a few minutes.");
          setIsLoading(false);
          return;
        }

        setRegistration(reg);
      } catch (err) {
        console.error("Error fetching demo registration:", err);
        setError("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistration();
  }, [demoId, subdomain, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;

    setIsSubmitting(true);

    try {
      // For demo, we'll use the contact email with the demo password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: registration.contact_email,
        password: password,
      });

      if (signInError) {
        toast.error("Invalid password. Please try again.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Welcome to your demo environment!");
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading demo environment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Demo Access Issue</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" onClick={() => navigate("/")}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!registration) return null;

  const daysRemaining = differenceInDays(new Date(registration.demo_expires_at), new Date());

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Your Demo</CardTitle>
          <CardDescription>
            {registration.company_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">Demo expires in</p>
            <p className="text-2xl font-bold text-primary">{daysRemaining} days</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(registration.demo_expires_at), "MMMM d, yyyy")}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={registration.contact_email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Demo Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your demo password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Check your email for the demo password sent when your demo was created.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Access Demo"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              className="text-sm"
              onClick={() => navigate(`/demo/convert?id=${registration.id}`)}
            >
              Ready to go live? Convert to production →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
