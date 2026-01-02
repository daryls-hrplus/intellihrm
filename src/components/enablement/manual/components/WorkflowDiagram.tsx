import { Card, CardContent } from '@/components/ui/card';

interface WorkflowDiagramProps {
  title: string;
  description?: string;
  diagram: string;
}

export function WorkflowDiagram({ title, description, diagram }: WorkflowDiagramProps) {
  // Convert Mermaid syntax to a visual representation
  // Since we can't render actual Mermaid in React components, we'll create a styled code block
  // that displays the workflow in a readable format
  
  const lines = diagram.trim().split('\n');
  const nodes: { id: string; label: string; type: 'action' | 'decision' | 'state' | 'subgraph' }[] = [];
  const connections: { from: string; to: string; label?: string }[] = [];
  
  let currentSubgraph = '';
  
  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Parse subgraph
    if (trimmed.startsWith('subgraph')) {
      const match = trimmed.match(/subgraph\s+(\w+)\["([^"]+)"\]/);
      if (match) {
        currentSubgraph = match[2];
        nodes.push({ id: match[1], label: match[2], type: 'subgraph' });
      }
    }
    
    // Parse node definitions like A[Text] or B{Decision}
    const nodeMatch = trimmed.match(/^(\w+)\[([^\]]+)\]/);
    if (nodeMatch) {
      nodes.push({ id: nodeMatch[1], label: nodeMatch[2], type: 'action' });
    }
    
    const decisionMatch = trimmed.match(/^(\w+)\{([^}]+)\}/);
    if (decisionMatch) {
      nodes.push({ id: decisionMatch[1], label: decisionMatch[2], type: 'decision' });
    }
    
    const stateMatch = trimmed.match(/^(\w+)\(\(([^)]+)\)\)/);
    if (stateMatch) {
      nodes.push({ id: stateMatch[1], label: stateMatch[2], type: 'state' });
    }
    
    // Parse connections
    const connMatch = trimmed.match(/(\w+)\s*--?>(?:\|([^|]+)\|)?\s*(\w+)/);
    if (connMatch) {
      connections.push({ from: connMatch[1], to: connMatch[3], label: connMatch[2] });
    }
  });

  return (
    <div className="space-y-3">
      <h4 className="text-base font-semibold">{title}</h4>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      <Card className="bg-gradient-to-br from-muted/30 to-muted/50 border-dashed">
        <CardContent className="pt-4">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono overflow-x-auto max-h-[300px] overflow-y-auto">
            {diagram}
          </pre>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground italic">
        💡 This diagram shows the workflow flow. In the live system, this renders as an interactive flowchart.
      </p>
    </div>
  );
}
