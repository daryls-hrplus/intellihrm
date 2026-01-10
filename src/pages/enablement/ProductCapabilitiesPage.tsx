import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  FileText,
  Download,
  Menu,
  ArrowLeft,
  Loader2,
  Printer,
} from "lucide-react";
import { ProductCapabilitiesDocument } from "@/components/enablement/product-capabilities/ProductCapabilitiesDocument";
import { TableOfContents, PRODUCT_CAPABILITIES_TOC } from "@/components/enablement/product-capabilities/components/TableOfContents";
import { toast } from "sonner";
import { downloadProductCapabilitiesPdf, printProductCapabilitiesPdf } from "@/components/enablement/product-capabilities/print";
import { useProductCapabilitiesPrintSettings } from "@/hooks/useProductCapabilitiesPrintSettings";

export default function ProductCapabilitiesPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("executive-overview");
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);
  const { printSettings } = useProductCapabilitiesPrintSettings();

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    toast.info("Generating comprehensive PDF...", { description: "This may take a moment." });

    try {
      await downloadProductCapabilitiesPdf(printSettings, (progress, message) => {
        if (progress === 100) {
          toast.success("PDF exported successfully!");
        }
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF", { description: "Please try again." });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    toast.info("Preparing document for print...");

    try {
      await printProductCapabilitiesPdf(printSettings);
      toast.success("Print dialog opened");
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to prepare print", { description: "Please try again." });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="container mx-auto py-4">
            <Breadcrumbs
              items={[
                { label: "Enablement", href: "/enablement" },
                { label: "Product Capabilities" },
              ]}
            />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/enablement")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                    <FileText className="h-7 w-7 text-primary" />
                    Product Capabilities Document
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive guide to Intelli HRM's 25 modules and 1,675+ capabilities
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile TOC */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="p-4 border-b">
                      <h2 className="font-semibold">Table of Contents</h2>
                    </div>
                    <TableOfContents
                      sections={PRODUCT_CAPABILITIES_TOC}
                      activeSection={activeSection}
                      onNavigate={handleNavigate}
                    />
                  </SheetContent>
                </Sheet>
                
                <Button onClick={handleExportPDF} disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Export PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop TOC Sidebar */}
          <aside className="hidden lg:block w-72 border-r bg-muted/30">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-sm">Table of Contents</h2>
            </div>
            <TableOfContents
              sections={PRODUCT_CAPABILITIES_TOC}
              activeSection={activeSection}
              onNavigate={handleNavigate}
            />
          </aside>

          {/* Document Content */}
          <main className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div ref={documentRef} className="container max-w-5xl mx-auto py-8 px-4 lg:px-8">
                <ProductCapabilitiesDocument />
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </AppLayout>
  );
}
