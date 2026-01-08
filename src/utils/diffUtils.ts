// Text diff algorithms for content comparison

export interface DiffSegment {
  type: 'add' | 'remove' | 'unchanged';
  content: string;
  lineNumber?: { old?: number; new?: number };
}

export interface LineDiff {
  type: 'add' | 'remove' | 'modify' | 'unchanged';
  oldLine?: string;
  newLine?: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface SideBySideDiff {
  left: LineDiff[];
  right: LineDiff[];
}

// Compute Longest Common Subsequence for diff algorithm
function computeLCS(oldArr: string[], newArr: string[]): number[][] {
  const m = oldArr.length;
  const n = newArr.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldArr[i - 1] === newArr[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp;
}

// Compute line-by-line diff
export function computeLineDiff(oldText: string, newText: string): DiffSegment[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const lcs = computeLCS(oldLines, newLines);
  
  const result: DiffSegment[] = [];
  let i = oldLines.length;
  let j = newLines.length;
  
  const temp: DiffSegment[] = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      temp.push({
        type: 'unchanged',
        content: oldLines[i - 1],
        lineNumber: { old: i, new: j }
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      temp.push({
        type: 'add',
        content: newLines[j - 1],
        lineNumber: { new: j }
      });
      j--;
    } else if (i > 0) {
      temp.push({
        type: 'remove',
        content: oldLines[i - 1],
        lineNumber: { old: i }
      });
      i--;
    }
  }
  
  return temp.reverse();
}

// Compute word-level diff for a single line
export function computeWordDiff(oldLine: string, newLine: string): DiffSegment[] {
  const oldWords = oldLine.split(/(\s+)/);
  const newWords = newLine.split(/(\s+)/);
  const lcs = computeLCS(oldWords, newWords);
  
  const result: DiffSegment[] = [];
  let i = oldWords.length;
  let j = newWords.length;
  
  const temp: DiffSegment[] = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      temp.push({ type: 'unchanged', content: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      temp.push({ type: 'add', content: newWords[j - 1] });
      j--;
    } else if (i > 0) {
      temp.push({ type: 'remove', content: oldWords[i - 1] });
      i--;
    }
  }
  
  return temp.reverse();
}

// Generate side-by-side diff view
export function generateSideBySideDiff(oldText: string, newText: string): SideBySideDiff {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const lineDiffs = computeLineDiff(oldText, newText);
  
  const left: LineDiff[] = [];
  const right: LineDiff[] = [];
  
  let oldLineNum = 1;
  let newLineNum = 1;
  
  for (const diff of lineDiffs) {
    if (diff.type === 'unchanged') {
      left.push({
        type: 'unchanged',
        oldLine: diff.content,
        oldLineNumber: oldLineNum++
      });
      right.push({
        type: 'unchanged',
        newLine: diff.content,
        newLineNumber: newLineNum++
      });
    } else if (diff.type === 'remove') {
      left.push({
        type: 'remove',
        oldLine: diff.content,
        oldLineNumber: oldLineNum++
      });
      right.push({
        type: 'remove',
        newLine: '',
        newLineNumber: undefined
      });
    } else if (diff.type === 'add') {
      left.push({
        type: 'add',
        oldLine: '',
        oldLineNumber: undefined
      });
      right.push({
        type: 'add',
        newLine: diff.content,
        newLineNumber: newLineNum++
      });
    }
  }
  
  return { left, right };
}

// Generate unified diff format
export function generateUnifiedDiff(
  oldText: string, 
  newText: string, 
  context: number = 3
): string {
  const lineDiffs = computeLineDiff(oldText, newText);
  const lines: string[] = [];
  
  let i = 0;
  while (i < lineDiffs.length) {
    // Skip unchanged lines until we find a change
    let start = i;
    while (i < lineDiffs.length && lineDiffs[i].type === 'unchanged') {
      i++;
    }
    
    if (i >= lineDiffs.length) break;
    
    // Add context before
    const contextStart = Math.max(start, i - context);
    for (let j = contextStart; j < i; j++) {
      lines.push(`  ${lineDiffs[j].content}`);
    }
    
    // Add changes
    while (i < lineDiffs.length && lineDiffs[i].type !== 'unchanged') {
      const diff = lineDiffs[i];
      if (diff.type === 'remove') {
        lines.push(`- ${diff.content}`);
      } else if (diff.type === 'add') {
        lines.push(`+ ${diff.content}`);
      }
      i++;
    }
    
    // Add context after
    const contextEnd = Math.min(lineDiffs.length, i + context);
    for (let j = i; j < contextEnd; j++) {
      lines.push(`  ${lineDiffs[j].content}`);
    }
    i = contextEnd;
  }
  
  return lines.join('\n');
}

// Calculate diff statistics
export function calculateDiffStats(oldText: string, newText: string): {
  additions: number;
  deletions: number;
  unchanged: number;
  totalChanges: number;
} {
  const lineDiffs = computeLineDiff(oldText, newText);
  
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;
  
  for (const diff of lineDiffs) {
    if (diff.type === 'add') additions++;
    else if (diff.type === 'remove') deletions++;
    else unchanged++;
  }
  
  return {
    additions,
    deletions,
    unchanged,
    totalChanges: additions + deletions
  };
}

// Check if content has changes
export function hasChanges(oldText: string, newText: string): boolean {
  return oldText !== newText;
}
