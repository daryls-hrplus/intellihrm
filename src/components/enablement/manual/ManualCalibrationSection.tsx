import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Users, Brain, Shield } from 'lucide-react';

export function ManualCalibrationSection() {
  return (
    <div className="space-y-8">
      <Card id="sec-4-1">
        <CardHeader>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Badge variant="outline">Section 4.1</Badge>
          </div>
          <CardTitle className="text-2xl">Calibration Concepts & Purpose</CardTitle>
          <CardDescription>Understanding why calibration matters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Calibration is a collaborative process where managers review ratings to ensure consistency, 
            fairness, and alignment with organizational standards. It reduces bias and creates a level 
            playing field for all employees.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Target, title: 'Reduce Rating Bias', desc: 'Eliminate leniency, strictness, and central tendency' },
              { icon: Users, title: 'Ensure Consistency', desc: 'Align standards across managers and departments' },
              { icon: Brain, title: 'AI-Powered Insights', desc: 'Detect anomalies and suggest adjustments' },
              { icon: Shield, title: 'Compliance Ready', desc: 'Full audit trail for all adjustments' }
            ].map((item) => (
              <Card key={item.title}>
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

      <Card id="sec-4-2">
        <CardHeader>
          <CardTitle className="text-2xl">Nine-Box Grid Integration</CardTitle>
          <CardDescription>Visualizing talent during calibration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-1 max-w-md">
            {[
              ['Enigma', 'Growth Employee', 'Future Star'],
              ['Underperformer', 'Core Contributor', 'High Performer'],
              ['Risk', 'Effective', 'Star']
            ].map((row, ri) => (
              row.map((cell, ci) => (
                <div 
                  key={`${ri}-${ci}`} 
                  className={`p-3 text-center text-xs border rounded ${
                    ri === 2 && ci === 2 ? 'bg-green-100 border-green-300' :
                    ri === 0 && ci === 0 ? 'bg-red-100 border-red-300' :
                    'bg-muted'
                  }`}
                >
                  {cell}
                </div>
              ))
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Performance (X-axis) × Potential (Y-axis) matrix for talent categorization
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
