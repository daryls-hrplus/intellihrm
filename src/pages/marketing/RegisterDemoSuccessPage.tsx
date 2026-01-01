import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Mail, Clock, Calendar } from "lucide-react";

export default function RegisterDemoSuccessPage() {
  return (
    <>
      <Helmet>
        <title>Demo Request Submitted | intellihrm</title>
        <meta
          name="description"
          content="Thank you for requesting a demo of intellihrm. Our team will contact you within 24-48 hours."
        />
      </Helmet>

      <section className="py-16 md:py-24">
        <div className="container max-w-2xl">
          <Card className="text-center">
            <CardContent className="pt-12 pb-10">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10 mb-6">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>

              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Demo Request Submitted!
              </h1>

              <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                Thank you for your interest in intellihrm. We have received your demo request and our
                team will be in touch shortly.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-3 text-left">
                <div className="rounded-lg border border-border p-4">
                  <Mail className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-medium text-foreground text-sm">Check Your Email</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    You will receive a confirmation email with next steps.
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <Clock className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-medium text-foreground text-sm">Response Time</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Our team will contact you within 24-48 business hours.
                  </p>
                </div>

                <div className="rounded-lg border border-border p-4">
                  <Calendar className="h-5 w-5 text-primary mb-2" />
                  <h3 className="font-medium text-foreground text-sm">Demo Duration</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your demo environment will be active for 14 days.
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild>
                  <Link to="/landing">
                    Return to Home
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/features">Explore Features</Link>
                </Button>
              </div>

              <p className="mt-8 text-sm text-muted-foreground">
                Questions? Contact us at{" "}
                <a href="mailto:demo@intellihrm.net" className="text-primary hover:underline">
                  demo@intellihrm.net
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
