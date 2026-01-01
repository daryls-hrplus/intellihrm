import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarCheck } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 md:py-28 bg-primary text-primary-foreground">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-primary-foreground/10 mb-6">
            <CalendarCheck className="h-7 w-7" />
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Transform Your HR Operations?
          </h2>
          
          <p className="mt-4 text-lg text-primary-foreground/80">
            Join organizations across the Caribbean and Africa who trust intellihrm to manage their workforce. 
            Get started with a personalized demo today.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="text-base px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link to="/register-demo">
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              asChild
            >
              <Link to="/about#contact">Contact Sales</Link>
            </Button>
          </div>

          <p className="mt-8 text-sm text-primary-foreground/60">
            14-day demo period • No credit card required • Full feature access
          </p>
        </div>
      </div>
    </section>
  );
}
