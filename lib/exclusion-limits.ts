/**
 * Exclusion limits logic
 *
 * For a valid derangement (secret santa assignment) to be possible:
 * - Each person must be able to give to at least 1 other person
 * - Each person must be able to receive from at least 1 other person
 *
 * With N participants:
 * - Each person can potentially give to N-1 people (everyone except themselves)
 * - Maximum exclusions per person as giver: N-2 (must have at least 1 valid recipient)
 * - Maximum exclusions per person as receiver: N-2 (must be able to receive from at least 1 person)
 *
 * For bidirectional exclusions (A↔B), we count both directions.
 * Total maximum exclusions depends on the constraint that the assignment graph
 * must have a valid Hamiltonian cycle.
 */

import { isDerangementPossible, type ExclusionMap } from './derangement'

export interface ExclusionCount {
  asGiver: Map<string, number> // How many people each person can't give to
  asReceiver: Map<string, number> // How many people can't give to each person
}

/**
 * Calculate the maximum number of total exclusions allowed for N participants.
 *
 * This is a conservative limit based on ensuring each person has enough options.
 * For N participants:
 * - Each person must be able to give to at least 1 person
 * - Each person must be able to receive from at least 1 person
 * - Maximum exclusions per person (in either direction) = N - 2
 * - Total maximum = floor(N * (N-2) / 2) for bidirectional pairs
 */
export function calculateMaxExclusions(participantCount: number): number {
  if (participantCount < 3) return 0

  // For N people, if we're doing bidirectional exclusions (pairs),
  // the maximum number of pairs is limited by ensuring everyone
  // can still give to at least 1 person and receive from at least 1.
  //
  // Conservative formula: floor((N-2) * N / 4)
  // This allows for roughly (N-2)/2 bidirectional exclusions per person on average
  //
  // Examples:
  // - 3 participants: max 0 bidirectional pairs (0 exclusions total)
  // - 4 participants: max 1 bidirectional pair (2 exclusions total)
  // - 5 participants: max 3 bidirectional pairs (6 exclusions total)
  // - 6 participants: max 6 bidirectional pairs (12 exclusions total)
  // - 8 participants: max 12 bidirectional pairs (24 exclusions total)
  // - 10 participants: max 20 bidirectional pairs (40 exclusions total)

  const maxBidirectionalPairs = Math.floor(((participantCount - 2) * participantCount) / 4)
  return maxBidirectionalPairs * 2 // Each pair = 2 exclusions
}

/**
 * Calculate how many exclusions each person has as giver and receiver
 */
export function countExclusionsPerPerson(
  exclusions: Array<{ giver_id: string; excluded_receiver_id: string }>,
  participantIds: string[]
): ExclusionCount {
  const asGiver = new Map<string, number>()
  const asReceiver = new Map<string, number>()

  // Initialize all participants with 0
  for (const id of participantIds) {
    asGiver.set(id, 0)
    asReceiver.set(id, 0)
  }

  // Count exclusions
  for (const exclusion of exclusions) {
    asGiver.set(exclusion.giver_id, (asGiver.get(exclusion.giver_id) || 0) + 1)
    asReceiver.set(
      exclusion.excluded_receiver_id,
      (asReceiver.get(exclusion.excluded_receiver_id) || 0) + 1
    )
  }

  return { asGiver, asReceiver }
}

/**
 * Check if adding a new exclusion would exceed limits
 *
 * @returns Object with canAdd boolean and reason if not allowed
 */
export function canAddExclusion(
  giverId: string,
  excludedReceiverId: string,
  currentExclusions: Array<{ giver_id: string; excluded_receiver_id: string }>,
  participantIds: string[]
): {
  canAdd: boolean
  reason?: string
  remainingTotal: number
  remainingForGiver: number
  remainingForReceiver: number
} {
  const n = participantIds.length

  if (n < 3) {
    return {
      canAdd: false,
      reason: 'Se necesitan al menos 3 participantes para usar restricciones',
      remainingTotal: 0,
      remainingForGiver: 0,
      remainingForReceiver: 0,
    }
  }

  const maxPerPerson = n - 2 // Maximum exclusions where this person is the giver OR the excluded receiver
  const maxTotal = calculateMaxExclusions(n)

  const counts = countExclusionsPerPerson(currentExclusions, participantIds)

  const giverCount = counts.asGiver.get(giverId) || 0
  const receiverCount = counts.asReceiver.get(excludedReceiverId) || 0
  const totalCount = currentExclusions.length

  const remainingForGiver = maxPerPerson - giverCount - 1
  const remainingForReceiver = maxPerPerson - receiverCount - 1
  const remainingTotal = maxTotal - totalCount - 1

  // Check total limit
  if (totalCount >= maxTotal) {
    return {
      canAdd: false,
      reason: `Se alcanzó el límite máximo de ${maxTotal} restricciones para ${n} participantes`,
      remainingTotal: 0,
      remainingForGiver: Math.max(0, maxPerPerson - giverCount),
      remainingForReceiver: Math.max(0, maxPerPerson - receiverCount),
    }
  }

  // Check per-person limit as giver
  if (giverCount >= maxPerPerson) {
    return {
      canAdd: false,
      reason: `${getPersonName()} ya tiene el máximo de ${maxPerPerson} restricciones como regalador`,
      remainingTotal: Math.max(0, remainingTotal + 1),
      remainingForGiver: 0,
      remainingForReceiver: Math.max(0, maxPerPerson - receiverCount),
    }
  }

  // Check per-person limit as receiver
  if (receiverCount >= maxPerPerson) {
    return {
      canAdd: false,
      reason: `${getPersonName()} ya tiene el máximo de ${maxPerPerson} restricciones como receptor excluido`,
      remainingTotal: Math.max(0, remainingTotal + 1),
      remainingForGiver: Math.max(0, maxPerPerson - giverCount),
      remainingForReceiver: 0,
    }
  }

  // Final check: simulate if the draw would still be possible with this new exclusion
  const simulatedExclusions: ExclusionMap = new Map()
  for (const exc of currentExclusions) {
    if (!simulatedExclusions.has(exc.giver_id)) {
      simulatedExclusions.set(exc.giver_id, new Set())
    }
    simulatedExclusions.get(exc.giver_id)!.add(exc.excluded_receiver_id)
  }
  // Add the new exclusion
  if (!simulatedExclusions.has(giverId)) {
    simulatedExclusions.set(giverId, new Set())
  }
  simulatedExclusions.get(giverId)!.add(excludedReceiverId)

  // Check if a valid derangement is still possible
  if (!isDerangementPossible(participantIds, simulatedExclusions)) {
    return {
      canAdd: false,
      reason: 'Esta restricción haría imposible realizar el sorteo',
      remainingTotal: Math.max(0, remainingTotal + 1),
      remainingForGiver: Math.max(0, maxPerPerson - giverCount),
      remainingForReceiver: Math.max(0, maxPerPerson - receiverCount),
    }
  }

  return {
    canAdd: true,
    remainingTotal: Math.max(0, remainingTotal),
    remainingForGiver: Math.max(0, remainingForGiver),
    remainingForReceiver: Math.max(0, remainingForReceiver),
  }
}

// Helper placeholder - in real usage, the UI will have access to names
function getPersonName(): string {
  return 'Esta persona'
}

/**
 * Get summary of exclusion limits for display
 */
export function getExclusionLimitsSummary(
  currentExclusions: Array<{ giver_id: string; excluded_receiver_id: string }>,
  participantCount: number
): {
  current: number
  max: number
  remaining: number
  maxPerPerson: number
} {
  const max = calculateMaxExclusions(participantCount)
  const current = currentExclusions.length

  return {
    current,
    max,
    remaining: Math.max(0, max - current),
    maxPerPerson: Math.max(0, participantCount - 2),
  }
}
