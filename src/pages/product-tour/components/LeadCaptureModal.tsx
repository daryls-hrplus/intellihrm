import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDemoSession } from "@/hooks/useDemoSession";
import { Lock, Mail, User, Building2, Briefcase } from "lucide-react";
import { toast } from "sonner";

interface LeadCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const industryOptions = [
  "Banking & Financial Services",
  "Manufacturing",
  "Healthcare",
  "Retail & Hospitality",
  "Technology",
  "Government & Public Sector",
  "Education",
  "Energy & Utilities",
  "Other",
];

export function LeadCaptureModal({ open, onClose, onComplete }: LeadCaptureModalProps) {
  const { updateLeadInfo } = useDemoSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    company_name: "",
    job_title: "",
    industry: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateLeadInfo(formData);
      toast.success("Thanks! Enjoy the rest of the tour.");
      onComplete();
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAnonymously = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Unlock Premium Content</DialogTitle>
          <DialogDescription className="text-center">
            Enter your details to continue watching and save your progress.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Work Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                className="pl-10"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="full_name"
                placeholder="John Smith"
                className="pl-10"
                value={formData.full_name}
                onChange={(e) => handleChange("full_name", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="company_name"
                placeholder="Acme Corp"
                className="pl-10"
                value={formData.company_name}
                onChange={(e) => handleChange("company_name", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="job_title"
                placeholder="HR Director"
                className="pl-10"
                value={formData.job_title}
                onChange={(e) => handleChange("job_title", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) => handleChange("industry", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                {industryOptions.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Continue Tour"}
            </Button>
            <Button type="button" variant="ghost" onClick={handleContinueAnonymously}>
              Skip for now
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            By continuing, you agree to receive communications from intellihrm.
            You can unsubscribe at any time.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
