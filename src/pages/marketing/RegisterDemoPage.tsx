import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountrySelect } from "@/components/ui/country-select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Building2, Mail, Phone, Users, Globe } from "lucide-react";

const formSchema = z.object({
  company_name: z.string().min(2, "Company name must be at least 2 characters").max(100),
  contact_name: z.string().min(2, "Contact name must be at least 2 characters").max(100),
  contact_email: z.string().email("Please enter a valid email address"),
  contact_phone: z.string().optional(),
  country: z.string().min(1, "Please select a country"),
  industry: z.string().optional(),
  employee_count: z.string().optional(),
  preferred_subdomain: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-z0-9-]+$/.test(val),
      "Subdomain can only contain lowercase letters, numbers, and hyphens"
    ),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
});

type FormData = z.infer<typeof formSchema>;

const industries = [
  "Agriculture",
  "Banking & Finance",
  "Construction",
  "Education",
  "Energy & Utilities",
  "Government",
  "Healthcare",
  "Hospitality & Tourism",
  "Insurance",
  "Manufacturing",
  "Non-Profit",
  "Professional Services",
  "Retail",
  "Technology",
  "Telecommunications",
  "Transportation & Logistics",
  "Other",
];

const employeeCounts = [
  "1-50",
  "51-100",
  "101-250",
  "251-500",
  "501-1000",
  "1001-5000",
  "5000+",
];

export default function RegisterDemoPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      country: "",
      industry: "",
      employee_count: "",
      preferred_subdomain: "",
      notes: "",
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("demo_registrations").insert([{
        company_name: data.company_name,
        contact_name: data.contact_name,
        contact_email: data.contact_email,
        contact_phone: data.contact_phone || null,
        country: data.country,
        industry: data.industry || null,
        employee_count: data.employee_count ? parseInt(data.employee_count.split("-")[0], 10) : null,
        preferred_subdomain: data.preferred_subdomain || null,
        notes: data.notes || null,
        status: "pending",
      }]);

      if (error) throw error;

      toast.success("Demo request submitted successfully!");
      navigate("/register-demo/success");
    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast.error("Failed to submit demo request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Request a Demo | intellihrm</title>
        <meta
          name="description"
          content="Request a personalized demo of intellihrm, the AI-powered HRMS built for Caribbean and African enterprises. 14-day trial with full feature access."
        />
        <link rel="canonical" href="https://intellihrm.net/register-demo" />
      </Helmet>

      <section className="py-16 md:py-24">
        <div className="container max-w-3xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Request a Demo
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Experience the power of intellihrm with a personalized demo. Fill out the form below and
              our team will be in touch within 24-48 hours.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Demo Registration</CardTitle>
              <CardDescription>
                All fields marked with * are required. Your demo environment will be available for
                14 days with full feature access.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Company Information
                    </h3>

                    <FormField
                      control={form.control}
                      name="company_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Corporation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <FormControl>
                              <CountrySelect
                                value={field.value}
                                onChange={field.onChange}
                                valueType="name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select industry" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {industries.map((industry) => (
                                  <SelectItem key={industry} value={industry}>
                                    {industry}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="employee_count"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            Number of Employees
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employeeCounts.map((count) => (
                                <SelectItem key={count} value={count}>
                                  {count}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Contact Information
                    </h3>

                    <FormField
                      control={form.control}
                      name="contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="contact_email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contact_phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              Phone Number
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Demo Preferences */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Demo Preferences
                    </h3>

                    <FormField
                      control={form.control}
                      name="preferred_subdomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Subdomain</FormLabel>
                          <FormControl>
                            <div className="flex items-center">
                              <Input
                                placeholder="yourcompany"
                                className="rounded-r-none"
                                {...field}
                              />
                              <span className="inline-flex items-center px-3 h-10 border border-l-0 border-input bg-muted text-muted-foreground text-sm rounded-r-md">
                                .intellihrm.net
                              </span>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Optional. Leave blank and we will suggest one based on your company
                            name.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your HR challenges or specific features you're interested in..."
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Submitting..." : "Submit Demo Request"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting this form, you agree to our{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </a>
                    .
                  </p>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
