import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  BookOpen, 
  ChevronRight, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  History as HistoryIcon,
  Link2
} from "lucide-react";
import { BENEFITS_MANUAL_STRUCTURE, getBenefitsManualStats } from "@/types/benefitsManual";
import {
  BenefitsManualOverviewSection,
  BenefitsManualFoundationSection,
  BenefitsManualPlansSection,
  BenefitsManualEnrollmentSection,
  BenefitsManualLifeEventsSection,
  BenefitsManualClaimsSection,
  BenefitsManualAnalyticsSection,
  BenefitsManualSelfServiceSection,
  BenefitsManualQuickReference,
  BenefitsManualArchitectureDiagrams,
  BenefitsManualGlossary,
  BenefitsManualVersionHistory,
} from "@/components/enablement/benefits-manual";

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  'ben-part-1': BenefitsManualOverviewSection,
  'ben-part-2': BenefitsManualFoundationSection,
  'ben-part-3': BenefitsManualPlansSection,
  'ben-part-4': BenefitsManualEnrollmentSection,
  'ben-part-5': BenefitsManualLifeEventsSection,
  'ben-part-6': BenefitsManualClaimsSection,
  'ben-part-7': BenefitsManualAnalyticsSection,
  'ben-part-8': BenefitsManualSelfServiceSection,
  'quick-ref': BenefitsManualQuickReference,
  'diagrams': BenefitsManualArchitectureDiagrams,
  'glossary': BenefitsManualGlossary,
  'version-history': BenefitsManualVersionHistory,
};

const SUPPLEMENTARY_SECTIONS = [
  { id: 'quick-ref', label: 'Quick Reference Cards', icon: Sparkles, color: 'text-amber-500' },
  { id: 'diagrams', label: 'Architecture Diagrams', icon: Layers, color: 'text-blue-500' },
  { id: 'glossary', label: 'Glossary', icon: BookOpen, color: 'text-green-500' },
  { id: 'version-history', label: 'Version History', icon: HistoryIcon, color: 'text-orange-500' },
];

export default function BenefitsManualPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('ben-part-1');
  const stats = getBenefitsManualStats();

  const ActiveComponent = SECTION_COMPONENTS[activeSection] || BenefitsManualOverviewSection;

  const isSupplementarySection = SUPPLEMENTARY_SECTIONS.some(s => s.id === activeSection);

  const getActiveTitle = () => {
    if (isSupplementarySection) {
      return SUPPLEMENTARY_SECTIONS.find(s => s.id === activeSection)?.label || '';
    }
    const section = BENEFITS_MANUAL_STRUCTURE.find(s => s.id === activeSection);
    return section ? `Part ${section.sectionNumber}: ${section.title}` : '';
  };

  const getActiveDescription = () => {
    if (isSupplementarySection) {
      return 'Supplementary reference material';
    }
    return BENEFITS_MANUAL_STRUCTURE.find(s => s.id === activeSection)?.description || '';
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Enablement", href: "/enablement" },
            { label: "Administrator Manuals", href: "/enablement/manuals" },
            { label: "Benefits Administrator Guide" },
          ]}
        />

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/enablement/manuals")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Heart className="h-8 w-8 text-pink-500" />
                Benefits Administrator Guide
              </h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive guide to benefits management, enrollment, claims, and analytics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm py-1 px-3">
              <BookOpen className="h-3 w-3 mr-1" />
              {stats.sectionsCount} Sections
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              <Clock className="h-3 w-3 mr-1" />
              ~{stats.estimatedReadTimeHours} hours
            </Badge>
            <Badge variant="secondary" className="text-sm py-1 px-3">
              v2.4
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar Navigation */}
          <Card className="h-fit lg:sticky lg:top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-1 p-4 pt-0">
                  {BENEFITS_MANUAL_STRUCTURE.map((section) => (
                    <div key={section.id}>
                      <Button
                        variant={activeSection === section.id ? "secondary" : "ghost"}
                        className="w-full justify-start text-left h-auto py-2"
                        onClick={() => {
                          setActiveSection(section.id);
                          window.scrollTo(0, 0);
                        }}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span className="text-xs text-muted-foreground w-4">
                            {section.sectionNumber}
                          </span>
                          <span className="flex-1 text-sm truncate">{section.title}</span>
                          <ChevronRight className={`h-4 w-4 transition-transform ${activeSection === section.id ? 'rotate-90' : ''}`} />
                        </div>
                      </Button>
                      {activeSection === section.id && section.subsections && (
                        <div className="ml-6 mt-1 space-y-1">
                          {section.subsections.map((sub) => (
                            <a
                              key={sub.id}
                              href={`#${sub.id}`}
                              className="block text-xs text-muted-foreground hover:text-foreground py-1 px-2 rounded hover:bg-muted"
                            >
                              {sub.sectionNumber} {sub.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  <Separator className="my-3" />

                  {/* Related Manuals */}
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 mb-2">
                    Related Manuals
                  </div>
                  <button
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors hover:bg-muted text-muted-foreground"
                    onClick={() => navigate('/enablement/manuals/workforce')}
                  >
                    <Link2 className="h-4 w-4 text-blue-500" />
                    <span>Workforce Admin Manual</span>
                  </button>

                  <Separator className="my-3" />

                  {/* Appendix / Supplementary Sections */}
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 mb-2">
                    Appendix
                  </div>
                  {SUPPLEMENTARY_SECTIONS.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors hover:bg-muted ${
                          activeSection === item.id 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'text-muted-foreground'
                        }`}
                        onClick={() => {
                          setActiveSection(item.id);
                          window.scrollTo(0, 0);
                        }}
                      >
                        <IconComponent className={`h-4 w-4 ${item.color}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Content Area */}
          <div className="space-y-6">
            <Card className="border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="font-medium">{getActiveTitle()}</p>
                    <p className="text-sm text-muted-foreground">{getActiveDescription()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ActiveComponent />

            {/* Navigation - only show for main sections */}
            {!isSupplementarySection && (
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentIndex = BENEFITS_MANUAL_STRUCTURE.findIndex(s => s.id === activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(BENEFITS_MANUAL_STRUCTURE[currentIndex - 1].id);
                      window.scrollTo(0, 0);
                    }
                  }}
                  disabled={activeSection === BENEFITS_MANUAL_STRUCTURE[0].id}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Part
                </Button>
                <Button
                  onClick={() => {
                    const currentIndex = BENEFITS_MANUAL_STRUCTURE.findIndex(s => s.id === activeSection);
                    if (currentIndex < BENEFITS_MANUAL_STRUCTURE.length - 1) {
                      setActiveSection(BENEFITS_MANUAL_STRUCTURE[currentIndex + 1].id);
                      window.scrollTo(0, 0);
                    }
                  }}
                  disabled={activeSection === BENEFITS_MANUAL_STRUCTURE[BENEFITS_MANUAL_STRUCTURE.length - 1].id}
                >
                  Next Part
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
