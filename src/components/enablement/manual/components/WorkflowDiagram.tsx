import { useEffect, useRef, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
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
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const renderToContainer = useCallback(async (container: HTMLDivElement, idPrefix: string) => {
    try {
      container.innerHTML = '';
      const id = `${idPrefix}-${Math.random().toString(36).substr(2, 9)}`;
      const { svg } = await mermaid.render(id, diagram.trim());
      container.innerHTML = svg;
      return true;
    } catch (err) {
      console.error('Mermaid rendering error:', err);
      container.innerHTML = `<pre class="text-xs text-muted-foreground whitespace-pre-wrap font-mono p-4">${diagram}</pre>`;
      return false;
    }
  }, [diagram]);

  // Render main diagram
  useEffect(() => {
    const render = async () => {
      if (!containerRef.current) return;
      setError(null);
      setIsRendered(false);
      const success = await renderToContainer(containerRef.current, 'mermaid-main');
      setIsRendered(success);
      if (!success) setError('Failed to render diagram');
    };
    render();
  }, [diagram, renderToContainer]);

  // Render modal diagram when opened
  useEffect(() => {
    const render = async () => {
      if (!isModalOpen || !modalContainerRef.current) return;
      await renderToContainer(modalContainerRef.current, 'mermaid-modal');
    };
    render();
  }, [isModalOpen, renderToContainer]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <div className="space-y-3">
      <h4 className="text-base font-semibold">{title}</h4>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <Card 
        className="bg-gradient-to-br from-muted/30 to-muted/50 border overflow-hidden cursor-pointer group hover:border-primary/50 transition-colors"
        onClick={() => isRendered && setIsModalOpen(true)}
      >
        <CardContent className="pt-4 pb-4 relative">
          <div 
            ref={containerRef}
            className="overflow-x-auto flex justify-center items-center min-h-[200px] [&_svg]:max-w-full"
          />
          {isRendered && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="sm" className="gap-1 text-xs">
                <Maximize2 className="h-3 w-3" />
                Click to zoom
              </Button>
            </div>
          )}
          {error && (
            <p className="text-xs text-destructive mt-2">{error}</p>
          )}
        </CardContent>
      </Card>
      {isRendered && (
        <p className="text-xs text-muted-foreground italic">
          💡 Click on the diagram to zoom and view details.
        </p>
      )}

      {/* Zoom Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center justify-between pr-8">
              <span>{title}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[4rem] text-center">{zoom}%</span>
                <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleResetZoom}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto bg-muted/30 rounded-lg p-4 min-h-[60vh]">
            <div 
              className="flex justify-center items-start"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease-out'
              }}
            >
              <div 
                ref={modalContainerRef}
                className="[&_svg]:max-w-none"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
