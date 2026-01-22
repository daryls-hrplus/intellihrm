/**
 * UI Color Semantics Audit Script
 * 
 * Scans the codebase for raw color class usage that violates the UI Color Semantics Standard.
 * Run with: npx tsx scripts/color-audit.ts
 * 
 * This script generates a compliance report showing:
 * - Total violations count
 * - Violations grouped by module/directory
 * - Detailed file-by-file breakdown
 */

import * as fs from 'fs';
import * as path from 'path';

// Patterns that indicate raw color class usage (violations)
const RAW_COLOR_PATTERNS = [
  /(?:bg|text|border)-(?:green|emerald)-\d+/g,
  /(?:bg|text|border)-(?:red|rose)-\d+/g,
  /(?:bg|text|border)-(?:amber|yellow)-\d+/g,
  /(?:bg|text|border)-(?:blue|sky|cyan)-\d+/g,
];

// Patterns that indicate potential contrast violations (foreground on light backgrounds)
const FOREGROUND_MISMATCH_PATTERNS = [
  /text-info-foreground/g,
  /text-success-foreground/g,
  /text-warning-foreground/g,
  /text-destructive-foreground/g,
];

// Component replacement suggestions
const COMPONENT_SUGGESTIONS: Record<string, string> = {
  'text-info-foreground': 'Use RequiredLevelBadge, InfoBadge, or text-info for light backgrounds',
  'text-success-foreground': 'Use SuccessBadge, RatingScoreBadge, or text-success for light backgrounds',
  'text-warning-foreground': 'Use WarningBadge or text-warning for light backgrounds',
  'text-destructive-foreground': 'Use ErrorBadge or text-destructive for light backgrounds',
};

// Files/directories to exclude from scanning
const EXCLUDE_PATTERNS = [
  'node_modules',
  'dist',
  '.git',
  // Semantic component files are allowed to use raw colors
  'semantic-badge.tsx',
  'semantic-callout.tsx',
  'semantic-tooltip.tsx',
  'semantic-text.tsx',
  'semantic-link.tsx',
  'semantic-index.ts',
  'entity-status-badge.tsx',
  'required-level-badge.tsx',
  'rating-score-badge.tsx',
  'proficiency-gap-status-badge.tsx',
  'index.css',
  'tailwind.config.ts',
  // Legacy files pending migration
  'ProficiencyLevelPicker.tsx',
  'ProficiencyGapBadge.tsx',
];

interface Violation {
  file: string;
  line: number;
  column: number;
  match: string;
  lineContent: string;
}

interface AuditReport {
  timestamp: string;
  totalViolations: number;
  affectedFiles: number;
  byModule: Record<string, Violation[]>;
  byColorType: Record<string, number>;
}

function shouldExclude(filePath: string): boolean {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (shouldExclude(fullPath)) continue;
      
      if (entry.isDirectory()) {
        files.push(...getAllTsxFiles(fullPath));
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or isn't readable
  }
  
  return files;
}

function scanFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, lineIndex) => {
      for (const pattern of RAW_COLOR_PATTERNS) {
        // Reset regex state
        pattern.lastIndex = 0;
        let match;
        
        while ((match = pattern.exec(line)) !== null) {
          violations.push({
            file: filePath,
            line: lineIndex + 1,
            column: match.index + 1,
            match: match[0],
            lineContent: line.trim().substring(0, 100),
          });
        }
      }
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
  }
  
  return violations;
}

function getModuleName(filePath: string): string {
  // Extract module from path like "src/components/payroll/..." -> "components/payroll"
  const parts = filePath.split(path.sep);
  const srcIndex = parts.indexOf('src');
  
  if (srcIndex !== -1 && parts.length > srcIndex + 2) {
    return parts.slice(srcIndex + 1, srcIndex + 3).join('/');
  }
  
  return parts.slice(0, 2).join('/');
}

function getColorType(match: string): string {
  if (match.includes('green') || match.includes('emerald')) return 'green';
  if (match.includes('red') || match.includes('rose')) return 'red';
  if (match.includes('amber') || match.includes('yellow')) return 'amber';
  if (match.includes('blue') || match.includes('sky') || match.includes('cyan')) return 'blue';
  return 'other';
}

function runAudit(): AuditReport {
  console.log('🔍 UI Color Semantics Audit Starting...\n');
  
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllTsxFiles(srcDir);
  
  console.log(`📁 Scanning ${files.length} files...\n`);
  
  const allViolations: Violation[] = [];
  const byModule: Record<string, Violation[]> = {};
  const byColorType: Record<string, number> = {
    green: 0,
    red: 0,
    amber: 0,
    blue: 0,
    other: 0,
  };
  
  for (const file of files) {
    const violations = scanFile(file);
    
    if (violations.length > 0) {
      allViolations.push(...violations);
      
      const moduleName = getModuleName(file);
      if (!byModule[moduleName]) {
        byModule[moduleName] = [];
      }
      byModule[moduleName].push(...violations);
      
      for (const v of violations) {
        const colorType = getColorType(v.match);
        byColorType[colorType]++;
      }
    }
  }
  
  const affectedFiles = new Set(allViolations.map(v => v.file)).size;
  
  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    totalViolations: allViolations.length,
    affectedFiles,
    byModule,
    byColorType,
  };
  
  // Print summary
  console.log('═══════════════════════════════════════════════════════════');
  console.log('              UI COLOR SEMANTICS AUDIT REPORT              ');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log(`📊 Summary:`);
  console.log(`   Total Violations: ${report.totalViolations}`);
  console.log(`   Affected Files:   ${report.affectedFiles}`);
  console.log();
  
  console.log(`🎨 By Color Type:`);
  Object.entries(byColorType)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .forEach(([color, count]) => {
      const bar = '█'.repeat(Math.min(count / 10, 50));
      console.log(`   ${color.padEnd(8)} ${String(count).padStart(5)} ${bar}`);
    });
  console.log();
  
  console.log(`📁 By Module (top 15):`);
  Object.entries(byModule)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 15)
    .forEach(([module, violations]) => {
      const bar = '█'.repeat(Math.min(violations.length / 5, 40));
      console.log(`   ${module.padEnd(30)} ${String(violations.length).padStart(4)} ${bar}`);
    });
  console.log();
  
  // Write detailed report to file
  const reportPath = path.join(process.cwd(), 'color-audit-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}\n`);
  
  // Print remediation guidance
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                   REMEDIATION GUIDANCE                    ');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('Replace raw color classes with semantic components:\n');
  console.log('  ❌ text-green-600    →  ✅ text-success or <SuccessBadge>');
  console.log('  ❌ text-red-600      →  ✅ text-destructive or <ErrorBadge>');
  console.log('  ❌ text-amber-600    →  ✅ text-warning or <WarningBadge>');
  console.log('  ❌ text-blue-600     →  ✅ text-info or <InfoBadge>');
  console.log('  ❌ bg-green-100      →  ✅ Use SemanticBadge with intent="success"');
  console.log();
  console.log('For proficiency gaps, use: <ProficiencyGapStatusBadge>');
  console.log('For ratings, use: <RatingScoreBadge>');
  console.log('For required levels, use: <RequiredLevelBadge>');
  console.log();
  console.log('See /enablement/ui-color-semantics for full guidelines.');
  console.log();
  
  return report;
}

// Run the audit
runAudit();
