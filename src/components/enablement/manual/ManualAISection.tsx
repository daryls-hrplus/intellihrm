import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, MessageSquare, AlertTriangle, TrendingUp } from 'lucide-react';
import { NavigationPath } from './NavigationPath';
import { NAVIGATION_PATHS } from './navigationPaths';
export function ManualAISection() {
  return (
    <div className="space-y-8">
      {/* AI Overview */}
      <Card id="sec-5-1">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 5.1</Badge>
          </div>
          <CardTitle className="text-2xl">AI Feedback Assistant Overview</CardTitle>
          <CardDescription>Introduction to AI-powered evaluation assistance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <NavigationPath path={NAVIGATION_PATHS['sec-5-1']} />
          <p className="text-muted-foreground">
            The AI Feedback Assistant helps managers write better, more constructive feedback while 
            reducing evaluation time by 30-40%. It provides real-time suggestions and quality checks.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Sparkles, title: 'Generate Strengths', desc: 'AI-crafted strength statements based on ratings' },
              { icon: TrendingUp, title: 'Development Suggestions', desc: 'Actionable improvement recommendations' },
              { icon: MessageSquare, title: 'Improve Comments', desc: 'Enhance clarity and specificity' },
              { icon: AlertTriangle, title: 'Bias Detection', desc: 'Flag potentially biased language' }
            ].map((item) => (
              <Card key={item.title} className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-4 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bias Detection */}
      <Card id="sec-5-2">
        <CardHeader>
          <CardTitle className="text-2xl">Bias Detection & Remediation</CardTitle>
          <CardDescription>EEOC compliance and fair evaluation practices</CardDescription>
        </CardHeader>
        <CardContent>
          <NavigationPath path={NAVIGATION_PATHS['sec-5-2']} />
          <div className="space-y-4">
            <p className="text-muted-foreground">
              The system automatically scans for potential bias indicators and suggests neutral alternatives.
            </p>
            <div className="p-4 border-l-4 border-l-amber-500 bg-muted/50 rounded-r-lg">
              <h4 className="font-semibold text-foreground mb-2">Types of Bias Detected</h4>
              <ul className="text-sm text-foreground space-y-1">
                <li>• Gender-coded language</li>
                <li>• Age-related stereotypes</li>
                <li>• Recency bias indicators</li>
                <li>• Halo/horn effect patterns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
