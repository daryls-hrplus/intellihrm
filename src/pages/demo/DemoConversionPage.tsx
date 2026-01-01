import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Loader2,
  ArrowRight,
  CheckCircle2,
  Building2,
  CreditCard,
  Shield,
} from "lucide-react";

interface DemoRegistration {
  id: string;
  company_name: string;
  contact_email: string;
  contact_name: string;
  assigned_subdomain: string;
  status: string;
}

const CONVERSION_STEPS = [
  {
    id: 1,
    title: "Company Details",
    description: "Confirm your company information",
    icon: Building2,
  },
  {
    id: 2,
    title: "Subscription Plan",
    description: "Select your modules and plan",
    icon: CreditCard,
  },
  {
    id: 3,
    title: "Terms & Confirmation",
    description: "Review and accept terms",
    icon: Shield,
  },
];

export default function DemoConversionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [registration, setRegistration] = useState<DemoRegistration | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    legalName: "",
    billingEmail: "",
    billingAddress: "",
    selectedModules: [] as string[],
    acceptTerms: false,
    acceptDataMigration: false,
  });

  const demoId = searchParams.get("id");

  useEffect(() => {
    const fetchRegistration = async () => {
      if (!demoId) {
        toast.error("Invalid conversion link");
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("demo_registrations")
          .select("*")
          .eq("id", demoId)
          .single();

        if (error || !data) {
          toast.error("Demo not found");
          navigate("/");
          return;
        }

        const reg = data as DemoRegistration;
        setRegistration(reg);
        setFormData((prev) => ({
          ...prev,
          companyName: reg.company_name,
          billingEmail: reg.contact_email,
        }));
      } catch (err) {
        console.error("Error:", err);
        toast.error("An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistration();
  }, [demoId, navigate]);

  const availableModules = [
    { id: "workforce", name: "Workforce Management", price: 5 },
    { id: "payroll", name: "Payroll", price: 8 },
    { id: "leave", name: "Leave Management", price: 3 },
    { id: "performance", name: "Performance Management", price: 4 },
    { id: "recruitment", name: "Recruitment", price: 5 },
    { id: "training", name: "Learning & Development", price: 4 },
    { id: "compensation", name: "Compensation", price: 3 },
    { id: "benefits", name: "Benefits Administration", price: 3 },
    { id: "succession", name: "Succession Planning", price: 4 },
    { id: "time_attendance", name: "Time & Attendance", price: 4 },
  ];

  const handleModuleToggle = (moduleId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter((m) => m !== moduleId)
        : [...prev.selectedModules, moduleId],
    }));
  };

  const calculateTotal = () => {
    return availableModules
      .filter((m) => formData.selectedModules.includes(m.id))
      .reduce((sum, m) => sum + m.price, 0);
  };

  const handleSubmit = async () => {
    if (!registration) return;

    setIsSubmitting(true);

    try {
      // Call the conversion edge function
      const { data, error } = await supabase.functions.invoke("convert-demo-to-production", {
        body: {
          demoId: registration.id,
          companyDetails: {
            companyName: formData.companyName,
            legalName: formData.legalName,
            billingEmail: formData.billingEmail,
            billingAddress: formData.billingAddress,
          },
          selectedModules: formData.selectedModules,
        },
      });

      if (error) {
        throw error;
      }

      toast.success("Conversion request submitted successfully!");
      navigate("/demo/conversion-success");
    } catch (err) {
      console.error("Conversion error:", err);
      toast.error("Failed to submit conversion request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!registration) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Convert to Production</h1>
          <p className="mt-2 text-muted-foreground">
            Complete the steps below to convert your demo to a full production environment
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-4">
            {CONVERSION_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                {index < CONVERSION_STEPS.length - 1 && (
                  <div
                    className={`h-1 w-12 transition-colors ${
                      currentStep > step.id ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{CONVERSION_STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {CONVERSION_STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="legalName">Legal Entity Name</Label>
                    <Input
                      id="legalName"
                      value={formData.legalName}
                      onChange={(e) =>
                        setFormData({ ...formData, legalName: e.target.value })
                      }
                      placeholder="For invoicing purposes"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingEmail">Billing Email</Label>
                  <Input
                    id="billingEmail"
                    type="email"
                    value={formData.billingEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, billingEmail: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Textarea
                    id="billingAddress"
                    value={formData.billingAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, billingAddress: e.target.value })
                    }
                    placeholder="Full billing address"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select the modules you want to include in your production subscription.
                  Pricing is per employee per month.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableModules.map((module) => (
                    <div
                      key={module.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors ${
                        formData.selectedModules.includes(module.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleModuleToggle(module.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={formData.selectedModules.includes(module.id)}
                          onCheckedChange={() => handleModuleToggle(module.id)}
                        />
                        <span className="font-medium">{module.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ${module.price}/emp/mo
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Estimated Total</span>
                    <span className="text-xl font-bold text-primary">
                      ${calculateTotal()}/emp/mo
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Final pricing will be confirmed based on employee count and contract terms.
                  </p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="rounded-lg bg-muted/50 p-4">
                  <h3 className="font-medium">Summary</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Company</span>
                      <span>{formData.companyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subdomain</span>
                      <span>{registration.assigned_subdomain}.hrplus.app</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modules</span>
                      <span>{formData.selectedModules.length} selected</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Est. Monthly Cost</span>
                      <span>${calculateTotal()}/emp</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, acceptTerms: checked as boolean })
                      }
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I accept the{" "}
                      <a href="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="dataMigration"
                      checked={formData.acceptDataMigration}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, acceptDataMigration: checked as boolean })
                      }
                    />
                    <Label htmlFor="dataMigration" className="text-sm leading-relaxed">
                      I understand that demo data will be migrated to the production
                      environment and I am responsible for verifying data accuracy.
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              {currentStep < 3 ? (
                <Button onClick={() => setCurrentStep((prev) => prev + 1)}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !formData.acceptTerms ||
                    !formData.acceptDataMigration ||
                    formData.selectedModules.length === 0
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Conversion Request"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
