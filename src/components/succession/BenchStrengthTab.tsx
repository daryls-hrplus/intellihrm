import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Users, TrendingUp } from "lucide-react";

interface BenchStrengthTabProps {
  companyId: string;
}

interface PositionCoverage {
  position_id: string;
  position_title: string;
  department_name: string;
  is_key_position: boolean;
  risk_level: string | null;
  total_successors: number;
  ready_now: number;
  ready_1_2_years: number;
  ready_3_plus_years: number;
  coverage_score: number;
}

export function BenchStrengthTab({ companyId }: BenchStrengthTabProps) {
  const [coverage, setCoverage] = useState<PositionCoverage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) loadData();
  }, [companyId]);

  const loadData = async () => {
    setLoading(true);
    
    // Get all positions with their succession data
    const { data: positions } = await (supabase.from('positions') as any)
      .select(`
        id,
        title,
        department:departments(name)
      `)
      .eq('is_active', true);

    if (!positions) {
      setCoverage([]);
      setLoading(false);
      return;
    }

    // Get key position risks
    const { data: keyPositions } = await (supabase.from('key_position_risks') as any)
      .select('position_id, risk_level')
      .eq('company_id', companyId);

    // Get succession plans with candidates
    const { data: plans } = await (supabase.from('succession_plans') as any)
      .select(`
        position_id,
        candidates:succession_candidates(id, readiness)
      `)
      .eq('company_id', companyId)
      .eq('status', 'active');

    // Build coverage data
    const coverageData: PositionCoverage[] = positions.map((pos: any) => {
      const keyPos = keyPositions?.find((k: any) => k.position_id === pos.id);
      const plan = plans?.find((p: any) => p.position_id === pos.id);
      const candidates = plan?.candidates || [];

      const ready_now = candidates.filter((c: any) => c.readiness === 'ready_now').length;
      const ready_1_2 = candidates.filter((c: any) => c.readiness === 'ready_1_2_years').length;
      const ready_3_plus = candidates.filter((c: any) => c.readiness === 'ready_3_plus_years').length;

      // Calculate coverage score (0-100)
      // Ready now = 40 points per candidate (max 80)
      // Ready 1-2 years = 20 points per candidate (max 40)
      // Ready 3+ years = 10 points per candidate (max 20)
      const score = Math.min(100, 
        Math.min(80, ready_now * 40) + 
        Math.min(40, ready_1_2 * 20) + 
        Math.min(20, ready_3_plus * 10)
      );

      return {
        position_id: pos.id,
        position_title: pos.title,
        department_name: pos.department?.name || 'Unknown',
        is_key_position: !!keyPos,
        risk_level: keyPos?.risk_level || null,
        total_successors: candidates.length,
        ready_now,
        ready_1_2_years: ready_1_2,
        ready_3_plus_years: ready_3_plus,
        coverage_score: score
      };
    });

    // Sort: key positions first, then by coverage score ascending
    coverageData.sort((a, b) => {
      if (a.is_key_position !== b.is_key_position) return a.is_key_position ? -1 : 1;
      return a.coverage_score - b.coverage_score;
    });

    setCoverage(coverageData);
    setLoading(false);
  };

  const getCoverageColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getCoverageBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getRiskBadge = (level: string | null) => {
    if (!level) return null;
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return <Badge className={colors[level] || 'bg-muted'}>{level}</Badge>;
  };

  // Summary stats
  const keyPositions = coverage.filter(c => c.is_key_position);
  const stats = {
    totalPositions: coverage.length,
    keyPositions: keyPositions.length,
    wellCovered: coverage.filter(c => c.coverage_score >= 80).length,
    atRisk: coverage.filter(c => c.coverage_score < 20).length,
    avgCoverage: coverage.length > 0 
      ? Math.round(coverage.reduce((sum, c) => sum + c.coverage_score, 0) / coverage.length)
      : 0,
    keyPosAvgCoverage: keyPositions.length > 0
      ? Math.round(keyPositions.reduce((sum, c) => sum + c.coverage_score, 0) / keyPositions.length)
      : 0
  };

  if (loading) return <div className="flex items-center justify-center p-8">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalPositions}</div>
                <div className="text-xs text-muted-foreground">Total Positions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.keyPositions}</div>
                <div className="text-xs text-muted-foreground">Key Positions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.wellCovered}</div>
                <div className="text-xs text-muted-foreground">Well Covered (80%+)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.avgCoverage}%</div>
                <div className="text-xs text-muted-foreground">Avg Coverage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Positions Coverage */}
      {keyPositions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Key Positions Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              Average coverage for key positions: <span className={getCoverageColor(stats.keyPosAvgCoverage) + ' font-bold'}>{stats.keyPosAvgCoverage}%</span>
            </div>
            <div className="space-y-3">
              {keyPositions.map(pos => (
                <div key={pos.position_id} className="flex items-center gap-4">
                  <div className="w-48 truncate font-medium">{pos.position_title}</div>
                  <div className="flex-1">
                    <Progress value={pos.coverage_score} className="h-2" />
                  </div>
                  <div className={`w-12 text-right font-bold ${getCoverageColor(pos.coverage_score)}`}>
                    {pos.coverage_score}%
                  </div>
                  <div className="w-24 flex gap-1">
                    {pos.ready_now > 0 && <Badge className="bg-green-500 text-white">{pos.ready_now} now</Badge>}
                    {pos.ready_1_2_years > 0 && <Badge variant="outline">{pos.ready_1_2_years} 1-2y</Badge>}
                  </div>
                  {getRiskBadge(pos.risk_level)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Positions Bench Strength</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Key?</TableHead>
                <TableHead className="text-center">Ready Now</TableHead>
                <TableHead className="text-center">1-2 Years</TableHead>
                <TableHead className="text-center">3+ Years</TableHead>
                <TableHead>Coverage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coverage.map(pos => (
                <TableRow key={pos.position_id}>
                  <TableCell className="font-medium">{pos.position_title}</TableCell>
                  <TableCell className="text-muted-foreground">{pos.department_name}</TableCell>
                  <TableCell>
                    {pos.is_key_position && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {pos.ready_now > 0 ? (
                      <Badge className="bg-green-500 text-white">{pos.ready_now}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {pos.ready_1_2_years > 0 ? (
                      <Badge variant="outline">{pos.ready_1_2_years}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {pos.ready_3_plus_years > 0 ? (
                      <Badge variant="secondary">{pos.ready_3_plus_years}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 w-32">
                      <Progress value={pos.coverage_score} className="h-2 flex-1" />
                      <span className={`text-sm font-medium ${getCoverageColor(pos.coverage_score)}`}>
                        {pos.coverage_score}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
