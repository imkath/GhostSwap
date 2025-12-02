/**
 * Exclusion map type: Maps giver ID to set of excluded receiver IDs
 */
export type ExclusionMap = Map<string, Set<string>>

/**
 * The Ghost Algorithm - Generates a perfect derangement with optional exclusions
 * A derangement is a permutation where no element appears in its original position
 * (i.e., no one is assigned to themselves)
 *
 * @param participants - Array of participant IDs
 * @param exclusions - Optional map of giver ID -> Set of excluded receiver IDs
 * @returns Array of receiver IDs in same order as participants, or null if impossible
 */
export function generateDerangement(
  participants: string[],
  exclusions?: ExclusionMap
): string[] | null {
  const n = participants.length
  if (n < 2) return null

  // Helper function to check if assignment is valid
  const isValidAssignment = (giverIndex: number, receiverId: string): boolean => {
    const giverId = participants[giverIndex]
    // Cannot assign to self
    if (giverId === receiverId) return false
    // Check exclusions
    if (exclusions?.has(giverId) && exclusions.get(giverId)!.has(receiverId)) {
      return false
    }
    return true
  }

  // Helper function to check if current permutation is valid
  const isValidDerangement = (shuffled: string[]): boolean => {
    for (let i = 0; i < n; i++) {
      if (!isValidAssignment(i, shuffled[i])) {
        return false
      }
    }
    return true
  }

  // Try Fisher-Yates shuffle with validation
  const shuffled = [...participants]

  for (let attempts = 0; attempts < 200; attempts++) {
    // Shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    if (isValidDerangement(shuffled)) {
      return shuffled
    }
  }

  // Fallback: Try backtracking algorithm for constrained derangement
  const result = backtrackingDerangement(participants, exclusions)
  if (result) return result

  // If backtracking fails, the constraints are impossible to satisfy
  return null
}

/**
 * Backtracking algorithm to find a valid derangement with exclusions
 * This is more thorough but slower than random shuffle
 */
function backtrackingDerangement(
  participants: string[],
  exclusions?: ExclusionMap
): string[] | null {
  const n = participants.length
  const result: string[] = []
  const used = new Set<string>()

  const isValidChoice = (giverIndex: number, receiverId: string): boolean => {
    const giverId = participants[giverIndex]
    // Cannot assign to self
    if (giverId === receiverId) return false
    // Cannot use same receiver twice
    if (used.has(receiverId)) return false
    // Check exclusions
    if (exclusions?.has(giverId) && exclusions.get(giverId)!.has(receiverId)) {
      return false
    }
    return true
  }

  const backtrack = (index: number): boolean => {
    // Base case: all assignments made
    if (index === n) return true

    // Try each participant as receiver
    // Shuffle order to get random result
    const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5)

    for (const candidate of shuffledParticipants) {
      if (isValidChoice(index, candidate)) {
        result[index] = candidate
        used.add(candidate)

        if (backtrack(index + 1)) {
          return true
        }

        // Backtrack
        result.pop()
        used.delete(candidate)
      }
    }

    return false
  }

  // Try backtracking with timeout (max 1000ms)
  const startTime = Date.now()
  const maxTime = 1000

  const success = backtrack(0)
  const elapsed = Date.now() - startTime

  if (elapsed > maxTime) {
    console.warn(`Backtracking took ${elapsed}ms, may be too constrained`)
    return null
  }

  return success ? result : null
}

/**
 * Check if a valid derangement is possible with given exclusions
 * Uses Hopcroft-Karp algorithm to find maximum bipartite matching
 * This is O(E√V) which handles 100+ participants efficiently
 */
export function isDerangementPossible(participants: string[], exclusions?: ExclusionMap): boolean {
  const n = participants.length
  if (n < 2) return false

  // Quick check: each person must be able to give to at least 1 person
  // and receive from at least 1 person
  for (const participant of participants) {
    const excludedReceivers = exclusions?.get(participant) || new Set()
    let canGiveTo = 0
    for (const other of participants) {
      if (other !== participant && !excludedReceivers.has(other)) {
        canGiveTo++
      }
    }
    if (canGiveTo === 0) return false

    let canReceiveFrom = 0
    for (const other of participants) {
      if (other !== participant) {
        const otherExcluded = exclusions?.get(other) || new Set()
        if (!otherExcluded.has(participant)) {
          canReceiveFrom++
        }
      }
    }
    if (canReceiveFrom === 0) return false
  }

  // Use Hopcroft-Karp to check if perfect matching exists
  return hopcroftKarpHasPerfectMatching(participants, exclusions)
}

/**
 * Hopcroft-Karp algorithm to check if a perfect bipartite matching exists
 *
 * Models the problem as:
 * - Left side: givers (participants as givers)
 * - Right side: receivers (participants as receivers)
 * - Edge exists if giver can give to receiver (not self, not excluded)
 *
 * A perfect matching means everyone gives to exactly one person
 * and everyone receives from exactly one person.
 *
 * Time complexity: O(E√V) where E = edges, V = vertices
 * For n participants with few exclusions: O(n² × √n)
 */
function hopcroftKarpHasPerfectMatching(
  participants: string[],
  exclusions?: ExclusionMap
): boolean {
  const n = participants.length

  // Map participant IDs to indices for efficient lookup
  const idToIndex = new Map<string, number>()
  participants.forEach((id, idx) => idToIndex.set(id, idx))

  // Build adjacency list: adj[giver] = [valid receivers]
  const adj: number[][] = Array.from({ length: n }, () => [])

  for (let giver = 0; giver < n; giver++) {
    const giverId = participants[giver]
    const excludedSet = exclusions?.get(giverId) || new Set<string>()

    for (let receiver = 0; receiver < n; receiver++) {
      const receiverId = participants[receiver]
      // Can give if: not self AND not excluded
      if (giver !== receiver && !excludedSet.has(receiverId)) {
        adj[giver].push(receiver)
      }
    }
  }

  // matchL[giver] = receiver matched to this giver (-1 if unmatched)
  // matchR[receiver] = giver matched to this receiver (-1 if unmatched)
  const matchL: number[] = Array(n).fill(-1)
  const matchR: number[] = Array(n).fill(-1)

  // dist[giver] = distance in BFS (used for layered graph)
  const dist: number[] = Array(n).fill(0)

  const INF = Number.MAX_SAFE_INTEGER

  // BFS to build layered graph of augmenting paths
  function bfs(): boolean {
    const queue: number[] = []

    for (let giver = 0; giver < n; giver++) {
      if (matchL[giver] === -1) {
        dist[giver] = 0
        queue.push(giver)
      } else {
        dist[giver] = INF
      }
    }

    let found = false
    let head = 0

    while (head < queue.length) {
      const giver = queue[head++]

      for (const receiver of adj[giver]) {
        const otherGiver = matchR[receiver]

        if (otherGiver === -1) {
          // Found augmenting path to unmatched receiver
          found = true
        } else if (dist[otherGiver] === INF) {
          // Extend path through matched edge
          dist[otherGiver] = dist[giver] + 1
          queue.push(otherGiver)
        }
      }
    }

    return found
  }

  // DFS to find augmenting path and augment matching
  function dfs(giver: number): boolean {
    for (const receiver of adj[giver]) {
      const otherGiver = matchR[receiver]

      if (otherGiver === -1 || (dist[otherGiver] === dist[giver] + 1 && dfs(otherGiver))) {
        // Augment: swap matching
        matchL[giver] = receiver
        matchR[receiver] = giver
        return true
      }
    }

    dist[giver] = INF // Mark as visited in this phase
    return false
  }

  // Main Hopcroft-Karp loop
  let matching = 0

  while (bfs()) {
    for (let giver = 0; giver < n; giver++) {
      if (matchL[giver] === -1 && dfs(giver)) {
        matching++
      }
    }
  }

  // Perfect matching exists if we matched all n participants
  return matching === n
}
