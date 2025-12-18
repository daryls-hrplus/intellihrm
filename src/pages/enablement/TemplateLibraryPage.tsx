import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TemplateLibrary } from "@/components/enablement/TemplateLibrary";
import { DocumentTemplate, DEFAULT_TEMPLATES } from "@/components/enablement/DocumentTemplateConfig";
import { toast } from "sonner";

export default function TemplateLibraryPage() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(DEFAULT_TEMPLATES[0]);

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    toast.success(`Template "${template.name}" selected`);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Template Library" },
          ]}
        />

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Template Library</h1>
            <p className="text-muted-foreground mt-1">
              Manage document templates, reference documents, and AI instructions
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/enablement")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hub
          </Button>
        </div>

        <TemplateLibrary
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
          onClose={() => navigate("/enablement")}
        />
      </div>
    </AppLayout>
  );
}
