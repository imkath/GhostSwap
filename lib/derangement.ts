/**
 * The Ghost Algorithm - Generates a perfect derangement
 * A derangement is a permutation where no element appears in its original position
 * (i.e., no one is assigned to themselves)
 */
export function generateDerangement(participants: string[]): string[] | null {
  const n = participants.length
  if (n < 2) return null

  // Fisher-Yates shuffle with derangement check
  const shuffled = [...participants]

  for (let attempts = 0; attempts < 100; attempts++) {
    // Shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Check if it's a valid derangement
    let isDerangement = true
    for (let i = 0; i < n; i++) {
      if (shuffled[i] === participants[i]) {
        isDerangement = false
        break
      }
    }

    if (isDerangement) {
      return shuffled
    }
  }

  // Fallback: Use Sattolo's algorithm for guaranteed derangement
  const result = [...participants]
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * i) // Note: excludes i
    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}
