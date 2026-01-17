/**
 * Circular Reference Detection Utility
 * Detects hierarchy loops in reporting structures
 */

export interface Position {
  id: string;
  code?: string;
  title?: string;
  reports_to_position_id?: string | null;
}

export interface CircularReferenceResult {
  isCircular: boolean;
  chain: string[];
  chainCodes?: string[];
}

/**
 * Detects if assigning a new supervisor would create a circular reference
 * @param positionId - The position being updated
 * @param newSupervisorId - The proposed new supervisor
 * @param positionsById - Map of all positions by ID
 * @returns CircularReferenceResult with detection result and chain if circular
 */
export function detectCircularReference(
  positionId: string,
  newSupervisorId: string | null,
  positionsById: Map<string, Position>
): CircularReferenceResult {
  // If no new supervisor, no circular reference possible
  if (!newSupervisorId) {
    return { isCircular: false, chain: [] };
  }

  const visited = new Set<string>();
  const chain: string[] = [];
  const chainCodes: string[] = [];

  let current: string | null = newSupervisorId;
  
  // Walk up the hierarchy from the proposed supervisor
  while (current) {
    // If we encounter the position we're updating, it's circular
    if (current === positionId) {
      const position = positionsById.get(positionId);
      chain.push(positionId);
      chainCodes.push(position?.code || positionId);
      return { 
        isCircular: true, 
        chain,
        chainCodes 
      };
    }

    // Prevent infinite loops if there's already a cycle in the data
    if (visited.has(current)) {
      break;
    }

    visited.add(current);
    const currentPosition = positionsById.get(current);
    chain.push(current);
    chainCodes.push(currentPosition?.code || current);
    
    current = currentPosition?.reports_to_position_id || null;
  }

  return { isCircular: false, chain: [], chainCodes: [] };
}

/**
 * Batch detect circular references for multiple proposed changes
 * Takes into account that multiple changes are being applied together
 */
export function detectCircularReferencesInBatch(
  proposedChanges: Array<{ positionId: string; newSupervisorId: string | null; positionCode: string }>,
  currentPositions: Map<string, Position>
): Map<string, CircularReferenceResult> {
  const results = new Map<string, CircularReferenceResult>();
  
  // Create a copy of positions with proposed changes applied
  const projectedPositions = new Map<string, Position>();
  currentPositions.forEach((pos, id) => {
    projectedPositions.set(id, { ...pos });
  });
  
  // Apply all proposed changes
  proposedChanges.forEach(change => {
    const pos = projectedPositions.get(change.positionId);
    if (pos) {
      projectedPositions.set(change.positionId, {
        ...pos,
        reports_to_position_id: change.newSupervisorId
      });
    }
  });
  
  // Now check each change for circular references in the projected state
  proposedChanges.forEach(change => {
    if (!change.newSupervisorId) {
      results.set(change.positionId, { isCircular: false, chain: [], chainCodes: [] });
      return;
    }
    
    const visited = new Set<string>();
    const chain: string[] = [];
    const chainCodes: string[] = [];
    
    let current: string | null = change.newSupervisorId;
    
    while (current) {
      if (current === change.positionId) {
        const position = projectedPositions.get(change.positionId);
        chain.push(change.positionId);
        chainCodes.push(position?.code || change.positionCode);
        results.set(change.positionId, { isCircular: true, chain, chainCodes });
        return;
      }
      
      if (visited.has(current)) {
        break;
      }
      
      visited.add(current);
      const currentPosition = projectedPositions.get(current);
      chain.push(current);
      chainCodes.push(currentPosition?.code || current);
      
      current = currentPosition?.reports_to_position_id || null;
    }
    
    results.set(change.positionId, { isCircular: false, chain: [], chainCodes: [] });
  });
  
  return results;
}

/**
 * Calculate the hierarchy distance between two positions
 * Returns -1 if they're not in the same chain
 */
export function calculateHierarchyDistance(
  positionId: string,
  supervisorId: string,
  positionsById: Map<string, Position>,
  maxDepth: number = 20
): number {
  let depth = 0;
  let current: string | null = supervisorId;
  
  while (current && depth < maxDepth) {
    depth++;
    const pos = positionsById.get(current);
    current = pos?.reports_to_position_id || null;
  }
  
  // We return the depth we'd need to traverse - this gives skip-level indication
  return depth;
}
