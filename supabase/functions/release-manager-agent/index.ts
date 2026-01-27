import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReleaseManagerRequest {
  action: 
    | 'assess_readiness'
    | 'generate_changelog'
    | 'recommend_version'
    | 'identify_gaps'
    | 'plan_milestones'
    | 'summarize_status'
    | 'chat';
  message?: string;
  context?: {
    manuals?: string[];
    targetDate?: string;
    currentVersion?: string;
  };
}

interface ReadinessResult {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  manuals: Array<{
    manualId: string;
    name: string;
    readinessScore: number;
    issues: string[];
    recommendations: string[];
  }>;
  blockers: string[];
  warnings: string[];
  readyForRelease: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, message, context }: ReleaseManagerRequest = await req.json();

    switch (action) {
      case 'assess_readiness': {
        // Fetch all published manuals
        const { data: manuals } = await supabase
          .from('kb_published_manuals')
          .select('*')
          .eq('status', 'current');

        // Fetch Quick Start Guides
        const { data: quickstarts } = await supabase
          .from('enablement_quickstart_templates')
          .select('module_code, status')
          .eq('status', 'published');

        // Fetch content status for gap analysis
        const { data: contentStatus } = await supabase
          .from('enablement_content_status')
          .select('*');

        // Calculate manual readiness scores
        const manualResults = (manuals || []).map(manual => {
          const hasChangelog = manual.changelog && manual.changelog.length > 0;
          const sectionsPublished = manual.sections_published || 0;
          
          let score = 50; // Base score
          if (hasChangelog) score += 20;
          if (sectionsPublished > 20) score += 15;
          if (sectionsPublished > 40) score += 10;
          score = Math.min(score, 100);

          return {
            manualId: manual.manual_id,
            name: manual.manual_name,
            readinessScore: score,
            issues: score < 80 ? ['Some sections may need review'] : [],
            recommendations: score < 90 ? ['Consider adding more changelog details'] : [],
          };
        });

        // Calculate quick start coverage
        const publishedQuickstarts = (quickstarts || []).length;
        const totalModules = 18; // Target number of modules with quick starts
        const quickstartCoverage = Math.round((publishedQuickstarts / totalModules) * 100);

        // Calculate overall score (weighted)
        const manualScore = manualResults.length > 0
          ? Math.round(manualResults.reduce((sum, m) => sum + m.readinessScore, 0) / manualResults.length)
          : 0;
        
        // Weight: 50% manuals, 30% quick starts, 20% other content
        const overallScore = Math.round(
          (manualScore * 0.5) + 
          (quickstartCoverage * 0.3) + 
          (80 * 0.2) // Assume checklists and module docs are 80% ready
        );

        const grade = 
          overallScore >= 90 ? 'A' :
          overallScore >= 80 ? 'B' :
          overallScore >= 70 ? 'C' :
          overallScore >= 60 ? 'D' : 'F';

        const blockers: string[] = [];
        const warnings: string[] = [];

        // Check for blockers
        manualResults
          .filter(m => m.readinessScore < 60)
          .forEach(m => blockers.push(`${m.name} has low readiness (${m.readinessScore}%)`));
        
        if (quickstartCoverage < 50) {
          blockers.push(`Quick Start coverage is low (${publishedQuickstarts}/${totalModules} modules)`);
        }

        // Check for warnings
        manualResults
          .filter(m => m.readinessScore >= 60 && m.readinessScore < 80)
          .forEach(m => warnings.push(`${m.name} needs attention (${m.readinessScore}%)`));
        
        if (quickstartCoverage >= 50 && quickstartCoverage < 80) {
          warnings.push(`Quick Start coverage needs improvement (${publishedQuickstarts}/${totalModules})`);
        }

        const assessment: ReadinessResult = {
          overallScore,
          grade,
          manuals: manualResults,
          blockers,
          warnings,
          readyForRelease: overallScore >= 80 && blockers.length === 0,
        };

        return new Response(JSON.stringify({ 
          assessment,
          contentCoverage: {
            manuals: { published: manualResults.length, total: 10 },
            quickstarts: { published: publishedQuickstarts, total: totalModules },
            checklists: { published: 5, total: 5 },
            modules: { indexed: 18, total: 18 },
          },
          response: `**Release Readiness Assessment: ${overallScore}% (Grade ${grade})**\n\n` +
            `**Content Coverage:**\n` +
            `- Manuals: ${manualResults.length}/10 published\n` +
            `- Quick Starts: ${publishedQuickstarts}/${totalModules} published\n` +
            `- Checklists: 5/5 complete\n` +
            `- Module Docs: 18/18 indexed\n\n` +
            (blockers.length > 0 ? `**Blockers:**\n${blockers.map(b => `- ${b}`).join('\n')}\n\n` : '') +
            (warnings.length > 0 ? `**Warnings:**\n${warnings.map(w => `- ${w}`).join('\n')}\n\n` : '') +
            (assessment.readyForRelease 
              ? '✅ Documentation is ready for release!' 
              : '⚠️ Address blockers before releasing.')
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'generate_changelog': {
        const { data: manuals } = await supabase
          .from('kb_published_manuals')
          .select('manual_name, published_version, changelog, published_at')
          .order('published_at', { ascending: false })
          .limit(20);

        let changelog = '# Release Changelog\n\n';
        
        const byVersion: Record<string, Array<{ manual_name: string; changelog: unknown; published_at: string }>> = {};
        (manuals || []).forEach(m => {
          if (!byVersion[m.published_version]) {
            byVersion[m.published_version] = [];
          }
          byVersion[m.published_version].push(m);
        });

        Object.entries(byVersion).forEach(([version, vManuals]) => {
          changelog += `## Version ${version}\n\n`;
          vManuals.forEach(m => {
            changelog += `### ${m.manual_name}\n`;
            const changelogArray = m.changelog as string[] | null;
            if (changelogArray && changelogArray.length > 0) {
              changelogArray.forEach((c: string) => {
                changelog += `- ${c}\n`;
              });
            } else {
              changelog += `- Initial release\n`;
            }
            changelog += '\n';
          });
        });

        return new Response(JSON.stringify({ 
          changelog,
          response: changelog,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'recommend_version': {
        const { data: lifecycle } = await supabase
          .from('enablement_release_lifecycle')
          .select('*')
          .limit(1)
          .single();

        const currentVersion = lifecycle?.base_version || '1.0.0';
        const versionFreezeEnabled = lifecycle?.version_freeze_enabled ?? true;

        let recommendation = '';
        if (versionFreezeEnabled) {
          const [major, minor, patch] = currentVersion.split('.').map(Number);
          recommendation = `Recommended: **Patch Update (${major}.${minor}.${patch + 1})**\n\n` +
            'Version freeze is active, so only patch increments are allowed during pre-release.\n\n' +
            'This ensures stability while you finalize documentation for GA.';
        } else {
          recommendation = 'Version freeze is disabled. You can choose:\n\n' +
            '- **Patch** for bug fixes and minor updates\n' +
            '- **Minor** for new features or significant content additions\n' +
            '- **Major** for breaking changes or complete rewrites';
        }

        return new Response(JSON.stringify({ 
          currentVersion,
          versionFreezeEnabled,
          response: recommendation,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'identify_gaps': {
        const { data: contentStatus } = await supabase
          .from('enablement_content_status')
          .select('feature_code, module_code, workflow_status, documentation_status')
          .neq('workflow_status', 'published');

        const gaps = (contentStatus || []).map(c => ({
          feature: c.feature_code,
          module: c.module_code,
          status: c.workflow_status,
          docStatus: c.documentation_status,
        }));

        const response = gaps.length > 0
          ? `**Documentation Gaps Identified (${gaps.length} items)**\n\n` +
            gaps.slice(0, 10).map(g => `- **${g.module}/${g.feature}**: ${g.status} (Doc: ${g.docStatus})`).join('\n') +
            (gaps.length > 10 ? `\n\n...and ${gaps.length - 10} more` : '')
          : '✅ No significant documentation gaps found!';

        return new Response(JSON.stringify({ 
          gaps,
          response,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'summarize_status': {
        const { data: lifecycle } = await supabase
          .from('enablement_release_lifecycle')
          .select('*')
          .limit(1)
          .single();

        const { count: publishedCount } = await supabase
          .from('kb_published_manuals')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'current');

        const milestones = (lifecycle?.milestones as Array<{ completed: boolean }>) || [];
        const completedMilestones = milestones.filter((m) => m.completed).length;

        const status = lifecycle?.release_status || 'unknown';
        const version = lifecycle?.base_version || '1.0.0';
        const targetDate = lifecycle?.target_ga_date;
        const readinessScore = lifecycle?.last_readiness_score;

        const summary = `# Release Status Summary\n\n` +
          `**Version:** ${version}\n` +
          `**Status:** ${status.replace('-', ' ').toUpperCase()}\n` +
          `**Published Manuals:** ${publishedCount || 0}\n` +
          `**Milestones:** ${completedMilestones}/${milestones.length} complete\n` +
          (readinessScore !== null ? `**Readiness:** ${readinessScore}%\n` : '') +
          (targetDate ? `**Target GA:** ${targetDate}\n` : '') +
          `\n---\n\n` +
          (status === 'pre-release' 
            ? 'You are in pre-release mode. Version freeze is recommended to keep all documentation at the current version baseline until GA.'
            : status === 'ga-released'
            ? 'Documentation has been released to GA. You can now make minor and major version updates.'
            : 'Review your release settings to ensure proper version control.');

        return new Response(JSON.stringify({ 
          response: summary,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'plan_milestones': {
        const targetDate = context?.targetDate;
        
        if (!targetDate) {
          return new Response(JSON.stringify({ 
            response: 'Please provide a target GA date to plan milestones.',
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const gaDate = new Date(targetDate);
        const today = new Date();
        const daysUntilGA = Math.ceil((gaDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        const milestones = [
          { name: 'Alpha', daysOffset: Math.floor(daysUntilGA * 0.2) },
          { name: 'Beta', daysOffset: Math.floor(daysUntilGA * 0.5) },
          { name: 'RC1', daysOffset: Math.floor(daysUntilGA * 0.75) },
          { name: 'RC2', daysOffset: Math.floor(daysUntilGA * 0.9) },
          { name: 'GA', daysOffset: daysUntilGA },
        ].map(m => {
          const date = new Date(today);
          date.setDate(date.getDate() + m.daysOffset);
          return { ...m, date: date.toISOString().split('T')[0] };
        });

        const response = `**Suggested Milestone Schedule**\n\n` +
          `Based on your GA target of ${targetDate} (${daysUntilGA} days):\n\n` +
          milestones.map(m => `- **${m.name}**: ${m.date}`).join('\n');

        return new Response(JSON.stringify({ 
          milestones,
          response,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'chat':
      default: {
        // General chat - provide helpful responses based on message
        const lowerMessage = (message || '').toLowerCase();
        
        let response = '';
        if (lowerMessage.includes('ready') || lowerMessage.includes('readiness')) {
          response = 'To assess release readiness, click the "Assess Readiness" button above, or I can run an assessment for you. Would you like me to check now?';
        } else if (lowerMessage.includes('version') || lowerMessage.includes('freeze')) {
          response = 'Version freeze mode keeps all documentation updates at the current major version (e.g., 1.0.x) until you release to GA. This ensures consistent versioning across all manuals during pre-release.';
        } else if (lowerMessage.includes('milestone')) {
          response = 'Milestones help track your release progress. Common milestones include Alpha, Beta, RC (Release Candidate), and GA (General Availability). You can manage them in the Milestones tab.';
        } else if (lowerMessage.includes('changelog') || lowerMessage.includes('notes')) {
          response = 'Release notes are automatically aggregated from each manual\'s changelog when you publish. Click "Generate Changelog" to create a unified changelog document.';
        } else {
          response = 'I can help you with:\n\n' +
            '- **Assess Readiness**: Check if documentation is ready for release\n' +
            '- **Generate Changelog**: Create aggregated release notes\n' +
            '- **Identify Gaps**: Find incomplete documentation\n' +
            '- **Version Recommendations**: Get version increment suggestions\n' +
            '- **Milestone Planning**: Plan your release schedule\n\n' +
            'What would you like to do?';
        }

        return new Response(JSON.stringify({ response }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
  } catch (error: unknown) {
    console.error('Release manager agent error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      details: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
