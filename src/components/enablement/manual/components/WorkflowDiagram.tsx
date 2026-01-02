import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import mermaid from 'mermaid';

interface WorkflowDiagramProps {
  title: string;
  description?: string;
  diagram: string;
}

// Initialize mermaid with theme settings
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#ffffff',
    primaryBorderColor: '#2563eb',
    lineColor: '#64748b',
    secondaryColor: '#f1f5f9',
    tertiaryColor: '#e2e8f0',
    background: '#ffffff',
    mainBkg: '#3b82f6',
    secondBkg: '#f1f5f9',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '14px',
    nodeBorder: '#2563eb',
    clusterBkg: '#f8fafc',
    clusterBorder: '#cbd5e1',
    defaultLinkColor: '#64748b',
    titleColor: '#0f172a',
    edgeLabelBackground: '#ffffff',
  },
  flowchart: {
    htmlLabels: true,
    curve: 'basis',
    padding: 15,
    nodeSpacing: 50,
    rankSpacing: 50,
  },
  securityLevel: 'loose',
});

export function WorkflowDiagram({ title, description, diagram }: WorkflowDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        setError(null);
        setIsRendered(false);
        
        // Clear previous content
        containerRef.current.innerHTML = '';
        
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // Render the diagram
        const { svg } = await mermaid.render(id, diagram.trim());
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setIsRendered(true);
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
        // Fallback to showing code
        if (containerRef.current) {
          containerRef.current.innerHTML = `<pre class="text-xs text-muted-foreground whitespace-pre-wrap font-mono">${diagram}</pre>`;
        }
      }
    };

    renderDiagram();
  }, [diagram]);

  return (
    <div className="space-y-3">
      <h4 className="text-base font-semibold">{title}</h4>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <Card className="bg-gradient-to-br from-muted/30 to-muted/50 border overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <div 
            ref={containerRef}
            className="overflow-x-auto flex justify-center items-center min-h-[200px]"
            style={{ 
              maxWidth: '100%',
            }}
          />
          {error && (
            <p className="text-xs text-destructive mt-2">{error}</p>
          )}
        </CardContent>
      </Card>
      {isRendered && (
        <p className="text-xs text-muted-foreground italic">
          💡 Interactive flowchart showing the workflow between participants and system states.
        </p>
      )}
    </div>
  );
}
