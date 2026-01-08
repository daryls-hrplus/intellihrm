import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Lock, FileText, HelpCircle, AlertTriangle, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AIGuidelinesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIGuidelinesDialog({ open, onOpenChange }: AIGuidelinesDialogProps) {
  const { t } = useTranslation();

  const guidelines = [
    {
      icon: Shield,
      title: t("ai.guidelines.roleAccess.title", "Role-Based Access Control"),
      description: t("ai.guidelines.roleAccess.description", "The AI respects your user role and permissions. Information provided is tailored to your access level within the organization. Admin and HR users may see more detailed information than regular employees.")
    },
    {
      icon: FileText,
      title: t("ai.guidelines.companyPolicies.title", "Company Policy Compliance"),
      description: t("ai.guidelines.companyPolicies.description", "All responses are guided by your company's uploaded policy documents. The AI will reference specific policies when answering questions about procedures, benefits, and workplace rules.")
    },
    {
      icon: HelpCircle,
      title: t("ai.guidelines.sop.title", "Standard Operating Procedures"),
      description: t("ai.guidelines.sop.description", "When asking about how to complete tasks, the AI will provide step-by-step guidance based on your company's defined SOPs. This ensures consistency in task execution across the organization.")
    },
    {
      icon: MessageSquare,
      title: t("ai.guidelines.helpCenter.title", "Help Center Integration"),
      description: t("ai.guidelines.helpCenter.description", "The AI draws from the Help Center knowledge base to provide accurate guidance on system features and functionality. For complex issues, it may direct you to relevant help articles.")
    },
    {
      icon: Lock,
      title: t("ai.guidelines.piiProtection.title", "PII Protection"),
      description: t("ai.guidelines.piiProtection.description", "Personal Identifiable Information (PII) such as employee contact details, salaries, and bank information is protected. Only users with appropriate permissions can access sensitive employee data through the AI.")
    },
    {
      icon: AlertTriangle,
      title: t("ai.guidelines.escalation.title", "Sensitive Topic Escalation"),
      description: t("ai.guidelines.escalation.description", "For sensitive matters such as terminations, legal issues, harassment, discrimination, or salary disputes, the AI will recommend contacting HR directly. These topics require human judgment and official documentation.")
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {t("ai.guidelines.title", "AI Assistant Guidelines")}
          </DialogTitle>
          <DialogDescription>
            {t("ai.guidelines.subtitle", "Understanding how the Intelli HRM AI Assistant works and protects your data")}
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {guidelines.map((guideline, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <guideline.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-foreground">{guideline.title}</h4>
                  <p className="text-sm text-muted-foreground">{guideline.description}</p>
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
              <h4 className="font-medium text-foreground mb-2">
                {t("ai.guidelines.disclaimer.title", "Important Disclaimer")}
              </h4>
              <p className="text-sm text-muted-foreground">
                {t("ai.guidelines.disclaimer.text", "The AI Assistant provides guidance based on available company policies, SOPs, and knowledge base articles. For official decisions, legal matters, or sensitive HR issues, always consult with your HR representative directly. AI responses should be verified before taking action on important matters.")}
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
