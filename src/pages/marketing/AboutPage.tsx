import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowRight, Globe, Users, Sparkles, Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AboutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Thank you for your message. We'll be in touch soon!");
    (e.target as HTMLFormElement).reset();
    setIsSubmitting(false);
  };

  return (
    <>
      <Helmet>
        <title>About intellihrm | Enterprise HRMS for Caribbean & Africa</title>
        <meta
          name="description"
          content="Learn about intellihrm, the AI-powered HRMS platform purpose-built for the Caribbean, Africa, and global expansion. Contact our team today."
        />
        <link rel="canonical" href="https://intellihrm.net/about" />
      </Helmet>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Built for the Markets Others Overlook
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              intellihrm is an AI-first, enterprise-grade HRMS purpose-built for the Caribbean, Africa,
              and organizations with global expansion ambitions.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Our Mission</h2>
              <p className="mt-4 text-muted-foreground">
                We believe every organization deserves world-class HR technology, regardless of
                geography. While global HRMS vendors focus on North America and Europe, we are
                committed to building deep, native support for the Caribbean and African markets.
              </p>
              <p className="mt-4 text-muted-foreground">
                intellihrm combines enterprise-grade functionality with AI-powered intelligence and
                unmatched regional compliance expertise. Our platform helps organizations attract,
                develop, and retain top talent while navigating complex multi-country regulations.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <Globe className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground">Regional Focus</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Deep compliance for Caribbean and African labor laws, tax codes, and statutory
                    requirements.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Sparkles className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground">AI at the Core</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Every module is powered by intelligent automation that reduces work and
                    improves decisions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Users className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground">People First</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Designed around real HR workflows and the needs of employees, managers, and HR
                    teams.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <ArrowRight className="h-8 w-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground">Global Scale</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enterprise architecture that scales from 50 to 50,000+ employees across
                    multiple countries.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Get in Touch</h2>
              <p className="mt-4 text-muted-foreground">
                Have questions about intellihrm? Our team is here to help.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your name" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@company.com" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help?" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more..."
                        className="min-h-[120px]"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Email</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          For general inquiries
                        </p>
                        <a
                          href="mailto:info@intellihrm.net"
                          className="text-sm text-primary hover:underline"
                        >
                          info@intellihrm.net
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Sales</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Speak with our sales team
                        </p>
                        <a
                          href="mailto:sales@intellihrm.net"
                          className="text-sm text-primary hover:underline"
                        >
                          sales@intellihrm.net
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Regional Coverage</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Caribbean • Africa • Global
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Serving organizations across Jamaica, Trinidad & Tobago, Barbados, Ghana,
                          Nigeria, Dominican Republic, and more.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Ready to Transform Your HR?
            </h2>
            <p className="mt-4 text-muted-foreground">
              See how intellihrm can help your organization attract, develop, and retain top talent.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link to="/register-demo">
                Request a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
