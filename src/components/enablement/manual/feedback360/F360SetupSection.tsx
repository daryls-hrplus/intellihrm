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
  Target
} from 'lucide-react';
import {
  F360Prerequisites,
  F360RaterCategories,
  F360QuestionBank,
  F360BehavioralAnchors,
  F360RatingScales,
  F360ReportTemplates,
  F360VisibilityRules,
  F360FrameworkLibrary,
  F360SignalDefinitions,
  F360ExternalRaters,
  F360CycleTemplates,
} from './sections/setup';

interface F360SetupSectionProps {
  selectedSectionId?: string;
}

export function F360SetupSection({ selectedSectionId }: F360SetupSectionProps) {
  // Determine which accordion items should be open based on selectedSectionId
  const getDefaultOpen = () => {
    if (!selectedSectionId) return ['core'];
    if (selectedSectionId.startsWith('sec-2-1') || 
        selectedSectionId.startsWith('sec-2-2') || 
        selectedSectionId.startsWith('sec-2-3') || 
        selectedSectionId.startsWith('sec-2-4') || 
        selectedSectionId.startsWith('sec-2-5')) {
      return ['core'];
    }
    if (selectedSectionId.startsWith('sec-2-6') || 
        selectedSectionId.startsWith('sec-2-7') || 
        selectedSectionId.startsWith('sec-2-8')) {
      return ['reporting'];
    }
    if (selectedSectionId.startsWith('sec-2-9') || 
        selectedSectionId.startsWith('sec-2-10') || 
        selectedSectionId.startsWith('sec-2-11')) {
      return ['advanced'];
    }
    return ['core'];
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div data-manual-anchor="part-2" id="part-2">
        <h2 className="text-2xl font-bold mb-4">2. Setup & Configuration Guide</h2>
        <p className="text-muted-foreground mb-6">
          Complete setup instructions for configuring the 360 feedback system, including rater categories, 
          question banks, rating scales, report templates, and governance settings.
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

      {/* Section Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Chapter Contents (11 Sections)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: '2.1', title: 'Prerequisites', icon: CheckCircle2 },
              { id: '2.2', title: 'Rater Categories', icon: Users },
              { id: '2.3', title: 'Question Bank', icon: FileText },
              { id: '2.4', title: 'Behavioral Anchors', icon: Anchor },
              { id: '2.5', title: 'Rating Scales', icon: Sliders },
              { id: '2.6', title: 'Report Templates', icon: FileBarChart },
              { id: '2.7', title: 'Visibility Rules', icon: Eye },
              { id: '2.8', title: 'Framework Library', icon: Library },
              { id: '2.9', title: 'Signal Definitions', icon: Radio },
              { id: '2.10', title: 'External Raters', icon: UserPlus },
              { id: '2.11', title: 'Cycle Templates', icon: Copy },
            ].map((section) => (
              <div key={section.id} className="flex items-center gap-2 p-2 rounded-lg border text-sm">
                <section.icon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{section.id}</span>
                <span className="text-muted-foreground">{section.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accordion Sections */}
      <Accordion type="multiple" defaultValue={getDefaultOpen()} className="space-y-4">
        {/* Core Configuration */}
        <AccordionItem value="core" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Sections 2.1 - 2.5</Badge>
              <span className="font-semibold">Core Configuration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-8">
            <section id="sec-2-1" data-manual-anchor="sec-2-1" className="scroll-mt-32">
              <F360Prerequisites />
            </section>
            <section id="sec-2-2" data-manual-anchor="sec-2-2" className="scroll-mt-32">
              <F360RaterCategories />
            </section>
            <section id="sec-2-3" data-manual-anchor="sec-2-3" className="scroll-mt-32">
              <F360QuestionBank />
            </section>
            <section id="sec-2-4" data-manual-anchor="sec-2-4" className="scroll-mt-32">
              <F360BehavioralAnchors />
            </section>
            <section id="sec-2-5" data-manual-anchor="sec-2-5" className="scroll-mt-32">
              <F360RatingScales />
            </section>
          </AccordionContent>
        </AccordionItem>

        {/* Reporting & Visibility */}
        <AccordionItem value="reporting" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Sections 2.6 - 2.8</Badge>
              <span className="font-semibold">Reporting & Visibility</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-8">
            <section id="sec-2-6" data-manual-anchor="sec-2-6" className="scroll-mt-32">
              <F360ReportTemplates />
            </section>
            <section id="sec-2-7" data-manual-anchor="sec-2-7" className="scroll-mt-32">
              <F360VisibilityRules />
            </section>
            <section id="sec-2-8" data-manual-anchor="sec-2-8" className="scroll-mt-32">
              <F360FrameworkLibrary />
            </section>
          </AccordionContent>
        </AccordionItem>

        {/* Advanced Configuration */}
        <AccordionItem value="advanced" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-3">
              <Badge variant="outline">Sections 2.9 - 2.11</Badge>
              <span className="font-semibold">Advanced Configuration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-8">
            <section id="sec-2-9" data-manual-anchor="sec-2-9" className="scroll-mt-32">
              <F360SignalDefinitions />
            </section>
            <section id="sec-2-10" data-manual-anchor="sec-2-10" className="scroll-mt-32">
              <F360ExternalRaters />
            </section>
            <section id="sec-2-11" data-manual-anchor="sec-2-11" className="scroll-mt-32">
              <F360CycleTemplates />
            </section>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
