import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  CheckCircle2, 
  Users, 
  FileText, 
  Anchor, 
  Sliders, 
  FileBarChart, 
  Eye, 
  Library, 
  Radio, 
  UserPlus, 
  Copy,
  Target,
  Workflow,
  Bell,
  Puzzle,
  TrendingUp
} from 'lucide-react';
import {
  // Prerequisites
  F360Prerequisites,
  // Rating Foundation
  F360RatingScales,
  F360BehavioralAnchors,
  // Content Configuration
  F360CompetencyIntegration,
  F360FrameworkLibrary,
  F360RaterCategories,
  F360QuestionBank,
  // Process Configuration
  F360ApprovalWorkflows,
  F360Notifications,
  // Governance
  F360VisibilityRules,
  // Outputs & Reporting
  F360ReportTemplates,
  // Analytics Integration
  F360SignalDefinitions,
  F360PerformanceTrends,
  // Advanced Configuration
  F360ExternalRaters,
  F360CycleTemplates,
} from './sections/setup';

interface F360SetupSectionProps {
  selectedSectionId?: string;
}

export function F360SetupSection({ selectedSectionId }: F360SetupSectionProps) {
  // Determine which accordion items should be open based on selectedSectionId
  const getDefaultOpen = () => {
    if (!selectedSectionId) return ['prerequisites'];
    
    // Prerequisites (2.1)
    if (selectedSectionId === 'sec-2-1') return ['prerequisites'];
    
    // Rating Foundation (2.2-2.3)
    if (['sec-2-2', 'sec-2-3'].includes(selectedSectionId)) return ['foundation'];
    
    // Content Configuration (2.4-2.7)
    if (['sec-2-4', 'sec-2-5', 'sec-2-6', 'sec-2-7'].includes(selectedSectionId)) return ['content'];
    
    // Process Configuration (2.8-2.9)
    if (['sec-2-8', 'sec-2-9'].includes(selectedSectionId)) return ['process'];
    
    // Governance (2.10)
    if (selectedSectionId === 'sec-2-10') return ['governance'];
    
    // Outputs & Reporting (2.11)
    if (selectedSectionId === 'sec-2-11') return ['outputs'];
    
    // Analytics Integration (2.12-2.13)
    if (['sec-2-12', 'sec-2-13'].includes(selectedSectionId)) return ['analytics'];
    
    // Advanced Configuration (2.14-2.15)
    if (['sec-2-14', 'sec-2-15'].includes(selectedSectionId)) return ['advanced'];
    
    return ['prerequisites'];
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div data-manual-anchor="part-2" id="part-2">
        <h2 className="text-2xl font-bold mb-4">2. Setup & Configuration Guide</h2>
        <p className="text-muted-foreground mb-6">
          Complete setup instructions for configuring the 360 feedback system. Sections are organized 
          following industry-standard implementation sequence: Prerequisites → Foundation → Content → Process → Governance → Outputs → Advanced.
        </p>
      </div>

      {/* Learning Objectives */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Chapter Learning Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Configure all components required to launch a 360 feedback cycle</li>
            <li>• Understand database field mappings for each configuration entity</li>
            <li>• Apply best practices for question design, anonymity, and reporting</li>
            <li>• Troubleshoot common configuration issues</li>
          </ul>
        </CardContent>
      </Card>

      {/* Section Overview - Industry Standard Groups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Chapter Contents (15 Sections)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prerequisites */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">A. Prerequisites</h4>
            <div className="grid md:grid-cols-3 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg border bg-amber-500/10 border-amber-500/30 text-sm">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                <span className="font-medium">2.1</span>
                <span className="text-muted-foreground truncate">Pre-requisites</span>
              </div>
            </div>
          </div>

          {/* Rating Foundation */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">B. Rating Foundation</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                { id: '2.2', title: 'Rating Scales', icon: Sliders },
                { id: '2.3', title: 'Behavioral Anchors', icon: Anchor },
              ].map((section) => (
                <div key={section.id} className="flex items-center gap-2 p-2 rounded-lg border text-sm">
                  <section.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{section.id}</span>
                  <span className="text-muted-foreground truncate">{section.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Configuration */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">C. Content Configuration</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { id: '2.4', title: 'Competencies', icon: Puzzle },
                { id: '2.5', title: 'Framework Library', icon: Library },
                { id: '2.6', title: 'Rater Categories', icon: Users },
                { id: '2.7', title: 'Question Bank', icon: FileText },
              ].map((section) => (
                <div key={section.id} className="flex items-center gap-2 p-2 rounded-lg border text-sm">
                  <section.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{section.id}</span>
                  <span className="text-muted-foreground truncate">{section.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Process Configuration */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">D. Process Configuration</h4>
            <div className="grid md:grid-cols-2 gap-2">
              {[
                { id: '2.8', title: 'Approval Workflows', icon: Workflow },
                { id: '2.9', title: 'Notifications', icon: Bell },
              ].map((section) => (
                <div key={section.id} className="flex items-center gap-2 p-2 rounded-lg border text-sm">
                  <section.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{section.id}</span>
                  <span className="text-muted-foreground truncate">{section.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Governance + Outputs + Analytics + Advanced */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">E-H. Governance, Outputs, Analytics & Advanced</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { id: '2.10', title: 'Visibility Rules', icon: Eye, group: 'E' },
                { id: '2.11', title: 'Report Templates', icon: FileBarChart, group: 'F' },
                { id: '2.12', title: 'Signal Definitions', icon: Radio, group: 'G' },
                { id: '2.13', title: 'Performance Trends', icon: TrendingUp, group: 'G' },
                { id: '2.14', title: 'External Raters', icon: UserPlus, group: 'H' },
                { id: '2.15', title: 'Cycle Templates', icon: Copy, group: 'H' },
              ].map((section) => (
                <div key={section.id} className="flex items-center gap-2 p-2 rounded-lg border text-sm">
                  <section.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{section.id}</span>
                  <span className="text-muted-foreground truncate">{section.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accordion Sections - Industry Standard Order */}
      <Accordion type="multiple" defaultValue={getDefaultOpen()} className="space-y-4">
        
        {/* A. Prerequisites */}
        <AccordionItem value="prerequisites" className="border rounded-lg border-amber-500/30 bg-amber-500/5">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Section 2.1</Badge>
              <span className="font-semibold">A. Prerequisites</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-8">
            <section id="sec-2-1" data-manual-anchor="sec-2-1" className="scroll-mt-32">
              <F360Prerequisites />
            </section>
          </AccordionContent>
        </AccordionItem>

        {/* B. Rating Foundation */}
        <AccordionItem value="foundation" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Sections 2.2 - 2.3</Badge>
              <span className="font-semibold">B. Rating Foundation</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-8">
            <section id="sec-2-2" data-manual-anchor="sec-2-2" className="scroll-mt-32">
              <F360RatingScales />
            </section>
            <section id="sec-2-3" data-manual-anchor="sec-2-3" className="scroll-mt-32">
              <F360BehavioralAnchors />
            </section>
          </AccordionContent>
        </AccordionItem>

        {/* C. Content Configuration */}
        <AccordionItem value="content" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Sections 2.4 - 2.7</Badge>
              <span className="font-semibold">C. Content Configuration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-8">
            <section id="sec-2-4" data-manual-anchor="sec-2-4" className="scroll-mt-32">
              <F360CompetencyIntegration />
            </section>
            <section id="sec-2-5" data-manual-anchor="sec-2-5" className="scroll-mt-32">
              <F360FrameworkLibrary />
            </section>
            <section id="sec-2-6" data-manual-anchor="sec-2-6" className="scroll-mt-32">
              <F360RaterCategories />
            </section>
            <section id="sec-2-7" data-manual-anchor="sec-2-7" className="scroll-mt-32">
              <F360QuestionBank />
            </section>
          </AccordionContent>
        </AccordionItem>

        {/* D. Process Configuration */}
        <AccordionItem value="process" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Sections 2.8 - 2.9</Badge>
              <span className="font-semibold">D. Process Configuration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-8">
            <section id="sec-2-8" data-manual-anchor="sec-2-8" className="scroll-mt-32">
              <F360ApprovalWorkflows />
            </section>
            <section id="sec-2-9" data-manual-anchor="sec-2-9" className="scroll-mt-32">
              <F360Notifications />
            </section>
          </AccordionContent>
        </AccordionItem>

        {/* E. Governance */}
        <AccordionItem value="governance" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Section 2.10</Badge>
              <span className="font-semibold">E. Governance</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-8">
            <section id="sec-2-10" data-manual-anchor="sec-2-10" className="scroll-mt-32">
              <F360VisibilityRules />
            </section>
          </AccordionContent>
        </AccordionItem>

        {/* F. Outputs & Reporting */}
        <AccordionItem value="outputs" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Section 2.11</Badge>
              <span className="font-semibold">F. Outputs & Reporting</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-8">
            <section id="sec-2-11" data-manual-anchor="sec-2-11" className="scroll-mt-32">
              <F360ReportTemplates />
            </section>
          </AccordionContent>
        </AccordionItem>

        {/* G. Analytics Integration */}
        <AccordionItem value="analytics" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Sections 2.12 - 2.13</Badge>
              <span className="font-semibold">G. Analytics Integration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-8">
            <section id="sec-2-12" data-manual-anchor="sec-2-12" className="scroll-mt-32">
              <F360SignalDefinitions />
            </section>
            <section id="sec-2-13" data-manual-anchor="sec-2-13" className="scroll-mt-32">
              <F360PerformanceTrends />
            </section>
          </AccordionContent>
        </AccordionItem>

        {/* H. Advanced Configuration */}
        <AccordionItem value="advanced" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Sections 2.14 - 2.15</Badge>
              <span className="font-semibold">H. Advanced Configuration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-8">
            <section id="sec-2-14" data-manual-anchor="sec-2-14" className="scroll-mt-32">
              <F360ExternalRaters />
            </section>
            <section id="sec-2-15" data-manual-anchor="sec-2-15" className="scroll-mt-32">
              <F360CycleTemplates />
            </section>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
