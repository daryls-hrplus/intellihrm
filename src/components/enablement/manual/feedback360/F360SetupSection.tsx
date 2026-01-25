import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, CheckCircle2, AlertTriangle } from 'lucide-react';

interface F360SetupSectionProps {
  selectedSectionId?: string;
}

export function F360SetupSection({ selectedSectionId }: F360SetupSectionProps) {
  return (
    <div className="space-y-8">
      <div data-manual-anchor="part-2" id="part-2">
        <h2 className="text-2xl font-bold mb-4">2. Setup & Configuration Guide</h2>
        <p className="text-muted-foreground mb-6">
          Complete setup instructions for configuring the 360 feedback system, including rater categories, 
          question banks, rating scales, report templates, and governance settings.
        </p>
      </div>

      {/* Prerequisites */}
      <Card data-manual-anchor="sec-2-1" id="sec-2-1">
        <CardHeader><CardTitle>2.1 Pre-requisites Checklist</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {['Workforce data loaded (employees, managers, departments)', 'Competency framework configured', 'Rating scales defined', 'User roles and permissions set', 'Email templates configured'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rater Categories */}
      <Card data-manual-anchor="sec-2-2" id="sec-2-2">
        <CardHeader><CardTitle>2.2 Rater Categories Configuration</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Configure the rater types that will provide feedback in your 360 cycles.</p>
          <div className="grid md:grid-cols-5 gap-3">
            {['Manager', 'Peer', 'Direct Report', 'Self', 'External'].map((cat) => (
              <div key={cat} className="p-3 rounded-lg border text-center">
                <Badge variant="secondary">{cat}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Question Bank */}
      <Card data-manual-anchor="sec-2-3" id="sec-2-3">
        <CardHeader><CardTitle>2.3 Question Bank Setup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Create questions linked to competencies with rater category assignments.</p>
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm"><strong>Best Practice:</strong> 15-40 questions per cycle, targeting 5-7 minute completion time.</p>
          </div>
        </CardContent>
      </Card>

      {/* BARS */}
      <Card data-manual-anchor="sec-2-4" id="sec-2-4">
        <CardHeader><CardTitle>2.4 Behavioral Anchors & BARS</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Configure behavioral anchors for objective rating criteria using BARS methodology.</p>
        </CardContent>
      </Card>

      {/* Rating Scales */}
      <Card data-manual-anchor="sec-2-5" id="sec-2-5">
        <CardHeader><CardTitle>2.5 Rating Scales Configuration</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Set up 360-specific rating scales with labels and score mappings (typically 1-5 scale).</p>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card data-manual-anchor="sec-2-6" id="sec-2-6">
        <CardHeader><CardTitle>2.6 Report Templates Setup</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Configure audience-specific report templates controlling content depth and visibility.</p>
          <div className="grid md:grid-cols-4 gap-3">
            {['Executive', 'Manager', 'Individual Contributor', 'HR'].map((audience) => (
              <div key={audience} className="p-3 rounded-lg border text-center text-sm">{audience}</div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visibility Rules */}
      <Card data-manual-anchor="sec-2-7" id="sec-2-7">
        <CardHeader><CardTitle>2.7 Anonymity & Visibility Rules</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold">Critical Configuration</h4>
                <p className="text-sm text-muted-foreground">Minimum 3 raters per category required for anonymity protection.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remaining sections */}
      {[
        { id: 'sec-2-8', num: '2.8', title: 'Framework Library Configuration' },
        { id: 'sec-2-9', num: '2.9', title: 'Signal Definitions Setup' },
        { id: 'sec-2-10', num: '2.10', title: 'External Rater Configuration' },
        { id: 'sec-2-11', num: '2.11', title: 'Cycle Templates & Cloning' },
      ].map((section) => (
        <Card key={section.id} data-manual-anchor={section.id} id={section.id}>
          <CardHeader><CardTitle>{section.num} {section.title}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Configuration details for {section.title.toLowerCase()}.</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
