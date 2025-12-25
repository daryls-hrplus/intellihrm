import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { 
  Target, 
  ArrowRight, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  Circle,
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DependencyType, ImpactLevel } from "@/types/goalDependencies";
import { DEPENDENCY_TYPE_LABELS, IMPACT_LEVEL_COLORS } from "@/types/goalDependencies";

interface GoalNode {
  id: string;
  title: string;
  status: string;
  progress_percentage: number | null;
  employee_name?: string;
}

interface DependencyEdge {
  id: string;
  source_id: string;
  target_id: string;
  dependency_type: DependencyType;
  impact_if_blocked: ImpactLevel;
  is_resolved: boolean;
  external_dependency_name: string | null;
}

interface GoalDependencyGraphProps {
  companyId?: string;
  focusGoalId?: string;
  onGoalClick?: (goalId: string) => void;
}

const statusColors: Record<string, string> = {
  draft: "border-muted bg-muted/50",
  active: "border-primary bg-primary/10",
  in_progress: "border-info bg-info/10",
  completed: "border-green-500 bg-green-50 dark:bg-green-900/20",
  cancelled: "border-destructive bg-destructive/10",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <Circle className="h-3 w-3 text-muted-foreground" />,
  active: <Target className="h-3 w-3 text-primary" />,
  in_progress: <Target className="h-3 w-3 text-info" />,
  completed: <CheckCircle className="h-3 w-3 text-green-600" />,
  cancelled: <AlertTriangle className="h-3 w-3 text-destructive" />,
};

export function GoalDependencyGraph({ 
  companyId, 
  focusGoalId,
  onGoalClick 
}: GoalDependencyGraphProps) {
  const [goals, setGoals] = useState<GoalNode[]>([]);
  const [edges, setEdges] = useState<DependencyEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(focusGoalId || null);

  useEffect(() => {
    loadGraphData();
  }, [companyId]);

  const loadGraphData = async () => {
    setLoading(true);
    try {
      // Load all goals with dependencies
      const { data: depsData, error: depsError } = await supabase
        .from('goal_dependencies')
        .select(`
          id,
          goal_id,
          depends_on_goal_id,
          dependency_type,
          impact_if_blocked,
          is_resolved,
          external_dependency_name
        `)
        .eq('is_resolved', false);

      if (depsError) throw depsError;

      // Get unique goal IDs from dependencies
      const goalIds = new Set<string>();
      (depsData || []).forEach(dep => {
        goalIds.add(dep.goal_id);
        if (dep.depends_on_goal_id) {
          goalIds.add(dep.depends_on_goal_id);
        }
      });

      if (goalIds.size > 0) {
        const { data: goalsData, error: goalsError } = await supabase
          .from('performance_goals')
          .select(`
            id,
            title,
            status,
            progress_percentage,
            profiles!performance_goals_employee_id_fkey(first_name, last_name)
          `)
          .in('id', Array.from(goalIds));

        if (goalsError) throw goalsError;

        const processedGoals: GoalNode[] = (goalsData || []).map(g => ({
          id: g.id,
          title: g.title,
          status: g.status,
          progress_percentage: g.progress_percentage,
          employee_name: g.profiles ? 
            `${(g.profiles as any).first_name || ''} ${(g.profiles as any).last_name || ''}`.trim() : 
            undefined,
        }));

        setGoals(processedGoals);
      } else {
        setGoals([]);
      }

      // Process edges
      const processedEdges: DependencyEdge[] = (depsData || []).map(dep => ({
        id: dep.id,
        source_id: dep.goal_id,
        target_id: dep.depends_on_goal_id || `external-${dep.id}`,
        dependency_type: dep.dependency_type as DependencyType,
        impact_if_blocked: dep.impact_if_blocked as ImpactLevel,
        is_resolved: dep.is_resolved,
        external_dependency_name: dep.external_dependency_name,
      }));

      setEdges(processedEdges);
    } catch (error) {
      console.error('Error loading graph data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build adjacency lists for layout
  const { levels, nodePositions } = useMemo(() => {
    const adjacency = new Map<string, string[]>();
    const reverseAdj = new Map<string, string[]>();
    const allNodeIds = new Set<string>();

    goals.forEach(g => allNodeIds.add(g.id));
    edges.forEach(e => {
      if (e.target_id && !e.target_id.startsWith('external-')) {
        allNodeIds.add(e.target_id);
      }
      allNodeIds.add(e.source_id);
    });

    edges.forEach(e => {
      if (e.target_id && !e.target_id.startsWith('external-')) {
        if (!adjacency.has(e.target_id)) adjacency.set(e.target_id, []);
        adjacency.get(e.target_id)!.push(e.source_id);
        
        if (!reverseAdj.has(e.source_id)) reverseAdj.set(e.source_id, []);
        reverseAdj.get(e.source_id)!.push(e.target_id);
      }
    });

    // Find root nodes (no incoming edges from other goals)
    const roots = Array.from(allNodeIds).filter(id => 
      !reverseAdj.has(id) || reverseAdj.get(id)!.length === 0
    );

    // BFS to assign levels
    const nodeLevels = new Map<string, number>();
    const queue: { id: string; level: number }[] = roots.map(id => ({ id, level: 0 }));
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      nodeLevels.set(id, level);
      
      const children = adjacency.get(id) || [];
      children.forEach(child => {
        if (!visited.has(child)) {
          queue.push({ id: child, level: level + 1 });
        }
      });
    }

    // Handle unvisited nodes
    allNodeIds.forEach(id => {
      if (!nodeLevels.has(id)) {
        nodeLevels.set(id, 0);
      }
    });

    // Group by levels
    const levelGroups = new Map<number, string[]>();
    nodeLevels.forEach((level, id) => {
      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(id);
    });

    // Calculate positions
    const positions = new Map<string, { x: number; y: number }>();
    const nodeWidth = 200;
    const nodeHeight = 80;
    const levelGap = 150;
    const nodeGap = 30;

    levelGroups.forEach((nodesInLevel, level) => {
      const totalWidth = nodesInLevel.length * nodeWidth + (nodesInLevel.length - 1) * nodeGap;
      const startX = -totalWidth / 2;
      
      nodesInLevel.forEach((nodeId, idx) => {
        positions.set(nodeId, {
          x: startX + idx * (nodeWidth + nodeGap) + nodeWidth / 2,
          y: level * levelGap,
        });
      });
    });

    return { levels: levelGroups, nodePositions: positions };
  }, [goals, edges]);

  const handleNodeClick = (goalId: string) => {
    setSelectedNode(goalId);
    onGoalClick?.(goalId);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading dependency graph...</div>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Dependency Graph
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-48 text-center">
          <Network className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">No goal dependencies found</p>
          <p className="text-sm text-muted-foreground">Add dependencies to goals to see the network visualization</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate SVG dimensions
  const minX = Math.min(...Array.from(nodePositions.values()).map(p => p.x)) - 120;
  const maxX = Math.max(...Array.from(nodePositions.values()).map(p => p.x)) + 120;
  const maxY = Math.max(...Array.from(nodePositions.values()).map(p => p.y)) + 100;
  const svgWidth = Math.max(600, maxX - minX);
  const svgHeight = Math.max(300, maxY + 50);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Dependency Graph
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-12 text-center">
              {(zoom * 100).toFixed(0)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(z => Math.min(2, z + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(1)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[400px] w-full">
          <div 
            className="relative overflow-auto"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: svgWidth,
              height: svgHeight,
            }}
          >
            <svg 
              width={svgWidth} 
              height={svgHeight}
              className="overflow-visible"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon 
                    points="0 0, 10 3.5, 0 7" 
                    className="fill-muted-foreground"
                  />
                </marker>
                <marker
                  id="arrowhead-critical"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon 
                    points="0 0, 10 3.5, 0 7" 
                    className="fill-destructive"
                  />
                </marker>
              </defs>

              {/* Draw edges */}
              {edges.map(edge => {
                const sourcePos = nodePositions.get(edge.source_id);
                const targetPos = nodePositions.get(edge.target_id);
                
                if (!sourcePos || !targetPos) return null;

                const isCritical = edge.impact_if_blocked === 'critical' || edge.impact_if_blocked === 'high';
                const offsetX = svgWidth / 2;

                return (
                  <g key={edge.id}>
                    <line
                      x1={targetPos.x + offsetX}
                      y1={targetPos.y + 40}
                      x2={sourcePos.x + offsetX}
                      y2={sourcePos.y}
                      className={cn(
                        "stroke-2",
                        isCritical ? "stroke-destructive" : "stroke-muted-foreground/50"
                      )}
                      markerEnd={isCritical ? "url(#arrowhead-critical)" : "url(#arrowhead)"}
                    />
                  </g>
                );
              })}

              {/* Draw nodes */}
              {goals.map(goal => {
                const pos = nodePositions.get(goal.id);
                if (!pos) return null;

                const offsetX = svgWidth / 2;
                const isSelected = selectedNode === goal.id;
                const connectedEdges = edges.filter(e => 
                  e.source_id === goal.id || e.target_id === goal.id
                );
                const hasBlocker = connectedEdges.some(e => 
                  e.source_id === goal.id && 
                  (e.impact_if_blocked === 'critical' || e.impact_if_blocked === 'high')
                );

                return (
                  <TooltipProvider key={goal.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <g
                          transform={`translate(${pos.x + offsetX - 90}, ${pos.y})`}
                          onClick={() => handleNodeClick(goal.id)}
                          className="cursor-pointer"
                        >
                          <rect
                            width="180"
                            height="60"
                            rx="8"
                            className={cn(
                              "fill-background stroke-2 transition-all",
                              statusColors[goal.status] || "border-muted",
                              isSelected && "stroke-primary stroke-[3px]",
                              hasBlocker && "stroke-destructive"
                            )}
                          />
                          <foreignObject width="180" height="60">
                            <div className="h-full flex flex-col justify-center px-3 py-2">
                              <div className="flex items-center gap-1.5">
                                {statusIcons[goal.status]}
                                <span className="text-xs font-medium truncate flex-1">
                                  {goal.title}
                                </span>
                              </div>
                              {goal.employee_name && (
                                <span className="text-[10px] text-muted-foreground truncate">
                                  {goal.employee_name}
                                </span>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary rounded-full transition-all"
                                    style={{ width: `${goal.progress_percentage || 0}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                  {goal.progress_percentage || 0}%
                                </span>
                              </div>
                            </div>
                          </foreignObject>
                        </g>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <div className="space-y-1">
                          <p className="font-medium">{goal.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Status: {goal.status} | Progress: {goal.progress_percentage || 0}%
                          </p>
                          {goal.employee_name && (
                            <p className="text-xs text-muted-foreground">
                              Owner: {goal.employee_name}
                            </p>
                          )}
                          <p className="text-xs">
                            {edges.filter(e => e.target_id === goal.id).length} dependents | 
                            {edges.filter(e => e.source_id === goal.id).length} dependencies
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </svg>
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <ArrowRight className="h-3 w-3" />
            <span>Depends on</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 bg-destructive" />
            <span>Critical dependency</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3 w-3 text-warning" />
            <span>At risk</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
