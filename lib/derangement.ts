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
