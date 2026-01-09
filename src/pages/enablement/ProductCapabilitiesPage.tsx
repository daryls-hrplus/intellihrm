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
} from "lucide-react";
import { ProductCapabilitiesDocument } from "@/components/enablement/product-capabilities/ProductCapabilitiesDocument";
import { TableOfContents, PRODUCT_CAPABILITIES_TOC } from "@/components/enablement/product-capabilities/components/TableOfContents";
import { toast } from "sonner";
import jsPDF from "jspdf";

export default function ProductCapabilitiesPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("executive-overview");
  const [isExporting, setIsExporting] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    toast.info("Generating PDF...", { description: "This may take a moment." });

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = margin;

      // Title Page
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(32);
      pdf.text("Intelli HRM", pageWidth / 2, 80, { align: "center" });
      
      pdf.setFontSize(24);
      pdf.text("Product Capabilities", pageWidth / 2, 100, { align: "center" });
      
      pdf.setFontSize(14);
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.text("The Complete Enterprise HRMS Solution", pageWidth / 2, 120, { align: "center" });
      pdf.text("for the Caribbean, Africa, and Beyond", pageWidth / 2, 130, { align: "center" });

      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 30, { align: "center" });

      // Table of Contents
      pdf.addPage();
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
      
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(20);
      pdf.text("Table of Contents", margin, yPos);
      yPos += 15;

      const addTocEntry = (title: string, level: number) => {
        if (yPos > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }
        const indent = level * 5;
        pdf.setFontSize(level === 1 ? 12 : 10);
        pdf.setTextColor(level === 1 ? 15 : 100, level === 1 ? 23 : 116, level === 1 ? 42 : 139);
        pdf.text(title, margin + indent, yPos);
        yPos += level === 1 ? 8 : 6;
      };

      PRODUCT_CAPABILITIES_TOC.forEach((section) => {
        addTocEntry(section.title, section.level);
        section.children?.forEach((child) => {
          addTocEntry(child.title, child.level);
        });
      });

      // Content sections (simplified for now - would need html2canvas for full rendering)
      const sections = [
        { title: "Executive Overview", color: [79, 70, 229] },
        { title: "Platform at a Glance", color: [99, 102, 241] },
        { title: "Prologue: Setting the Stage", color: [100, 116, 139] },
        { title: "Act 1: Attract & Onboard", color: [59, 130, 246] },
        { title: "Act 2: Enable & Engage", color: [34, 197, 94] },
        { title: "Act 3: Pay & Reward", color: [245, 158, 11] },
        { title: "Act 4: Develop & Grow", color: [168, 85, 247] },
        { title: "Act 5: Protect & Support", color: [239, 68, 68] },
        { title: "Epilogue: Continuous Excellence", color: [99, 102, 241] },
        { title: "Cross-Cutting Capabilities", color: [20, 184, 166] },
        { title: "Getting Started", color: [16, 185, 129] },
      ];

      sections.forEach((section) => {
        pdf.addPage();
        
        // Section header bar
        pdf.setFillColor(section.color[0], section.color[1], section.color[2]);
        pdf.rect(0, 0, pageWidth, 40, "F");
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(24);
        pdf.text(section.title, margin, 28);

        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(11);
        pdf.text(
          "For detailed capabilities, please refer to the interactive web document.",
          margin,
          55
        );
      });

      // Save the PDF
      const fileName = `Intelli-HRM-Product-Capabilities-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
      
      toast.success("PDF exported successfully!", { description: fileName });
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF", { description: "Please try again." });
    } finally {
      setIsExporting(false);
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
                    Comprehensive guide to Intelli HRM's 18 modules and 500+ capabilities
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
