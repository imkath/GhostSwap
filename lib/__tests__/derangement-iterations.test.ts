// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { generateDerangement, type ExclusionMap } from '../derangement'

describe('Derangement iteration tests with various group sizes', () => {
  const ITERATIONS = 500

  const verifyDerangement = (
    participants: string[],
    result: string[] | null,
    exclusions?: ExclusionMap
  ): void => {
    expect(result).not.toBeNull()
    if (!result) return

    // Verify no self-assignment
    for (let i = 0; i < participants.length; i++) {
      expect(result[i]).not.toBe(participants[i])
    }

    // Verify exclusions are respected
    if (exclusions) {
      for (let i = 0; i < participants.length; i++) {
        const giver = participants[i]
        const receiver = result[i]
        const excluded = exclusions.get(giver)
        if (excluded) {
          expect(excluded.has(receiver)).toBe(false)
        }
      }
    }

    // Verify bijection (everyone gives and receives exactly once)
    expect(new Set(result).size).toBe(participants.length)
  }

  describe('Group of 6 with couple exclusions', () => {
    const participants = ['Alice', 'Bob', 'Carlos', 'Diana', 'Eve', 'Frank']
    const exclusions: ExclusionMap = new Map([
      ['Alice', new Set(['Bob'])],
      ['Bob', new Set(['Alice'])],
      ['Carlos', new Set(['Diana'])],
      ['Diana', new Set(['Carlos'])],
    ])

    it(`should work correctly across ${ITERATIONS} iterations`, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const result = generateDerangement(participants, exclusions)
        verifyDerangement(participants, result, exclusions)
      }
    })
  })

  describe('Group of 10 with complex exclusions', () => {
    const participants = [
      'Person1',
      'Person2',
      'Person3',
      'Person4',
      'Person5',
      'Person6',
      'Person7',
      'Person8',
      'Person9',
      'Person10',
    ]

    // 3 couples + some additional restrictions
    const exclusions: ExclusionMap = new Map([
      ['Person1', new Set(['Person2'])],
      ['Person2', new Set(['Person1'])],
      ['Person3', new Set(['Person4'])],
      ['Person4', new Set(['Person3'])],
      ['Person5', new Set(['Person6'])],
      ['Person6', new Set(['Person5'])],
      ['Person7', new Set(['Person8', 'Person9'])], // Person7 excludes 2 people
      ['Person10', new Set(['Person1', 'Person2'])], // Person10 excludes a couple
    ])

    it(`should work correctly across ${ITERATIONS} iterations`, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const result = generateDerangement(participants, exclusions)
        verifyDerangement(participants, result, exclusions)
      }
    })
  })

  describe('Group of 15 with circular exclusions', () => {
    const participants = Array.from({ length: 15 }, (_, i) => `Member${i + 1}`)

    // Each person excludes the next person (circular)
    const exclusions: ExclusionMap = new Map()
    for (let i = 0; i < participants.length; i++) {
      const next = participants[(i + 1) % participants.length]
      exclusions.set(participants[i], new Set([next]))
    }

    it(`should work correctly across ${ITERATIONS} iterations`, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const result = generateDerangement(participants, exclusions)
        verifyDerangement(participants, result, exclusions)
      }
    })
  })

  describe('Group of 20 with heavy exclusions', () => {
    const participants = Array.from({ length: 20 }, (_, i) => `User${i + 1}`)

    // Each person excludes 3 others
    const exclusions: ExclusionMap = new Map()
    for (let i = 0; i < participants.length; i++) {
      const excluded = new Set([
        participants[(i + 1) % participants.length],
        participants[(i + 2) % participants.length],
        participants[(i + 3) % participants.length],
      ])
      exclusions.set(participants[i], excluded)
    }

    it(`should work correctly across ${ITERATIONS} iterations`, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const result = generateDerangement(participants, exclusions)
        verifyDerangement(participants, result, exclusions)
      }
    })
  })

  describe('Group of 30 with moderate exclusions', () => {
    const participants = Array.from({ length: 30 }, (_, i) => `P${i + 1}`)

    // 10 couples
    const exclusions: ExclusionMap = new Map()
    for (let i = 0; i < 20; i += 2) {
      exclusions.set(participants[i], new Set([participants[i + 1]]))
      exclusions.set(participants[i + 1], new Set([participants[i]]))
    }

    it(`should work correctly across ${ITERATIONS} iterations`, () => {
      for (let i = 0; i < ITERATIONS; i++) {
        const result = generateDerangement(participants, exclusions)
        verifyDerangement(participants, result, exclusions)
      }
    })
  })

  describe('Edge cases', () => {
    it('should return null for group of 3 where one person excludes all others', () => {
      const participants = ['A', 'B', 'C']
      const exclusions: ExclusionMap = new Map([['A', new Set(['B', 'C'])]])

      const result = generateDerangement(participants, exclusions)
      expect(result).toBeNull()
    })

    it('should work with group of 4 where each excludes one person', () => {
      const participants = ['A', 'B', 'C', 'D']
      const exclusions: ExclusionMap = new Map([
        ['A', new Set(['B'])],
        ['B', new Set(['C'])],
        ['C', new Set(['D'])],
        ['D', new Set(['A'])],
      ])

      for (let i = 0; i < ITERATIONS; i++) {
        const result = generateDerangement(participants, exclusions)
        verifyDerangement(participants, result, exclusions)
      }
    })

    it('should return null for group of 4 with truly impossible exclusions', () => {
      const participants = ['A', 'B', 'C', 'D']
      // Each person can only give to one specific person, creating a cycle conflict
      // A -> D only, B -> A only, C -> B only, D -> C only
      // But this creates: A->D, D->C, C->B, B->A which IS valid
      // Let's make it truly impossible: A can give to no one
      const exclusions: ExclusionMap = new Map([
        ['A', new Set(['B', 'C', 'D'])], // A cannot give to anyone except self (impossible)
      ])

      const result = generateDerangement(participants, exclusions)
      expect(result).toBeNull()
    })

    it('should handle 50 participants with 25 couples', () => {
      const participants = Array.from({ length: 50 }, (_, i) => `P${i}`)
      const exclusions: ExclusionMap = new Map()

      // 25 couples
      for (let i = 0; i < 50; i += 2) {
        exclusions.set(participants[i], new Set([participants[i + 1]]))
        exclusions.set(participants[i + 1], new Set([participants[i]]))
      }

      for (let i = 0; i < 100; i++) {
        const result = generateDerangement(participants, exclusions)
        verifyDerangement(participants, result, exclusions)
      }
    })
  })

  describe('Performance benchmarks', () => {
    it('should complete 100 iterations for 100 participants in under 5 seconds', () => {
      const participants = Array.from({ length: 100 }, (_, i) => `User${i}`)

      // 20 couples
      const exclusions: ExclusionMap = new Map()
      for (let i = 0; i < 40; i += 2) {
        exclusions.set(participants[i], new Set([participants[i + 1]]))
        exclusions.set(participants[i + 1], new Set([participants[i]]))
      }

      const start = Date.now()

      for (let i = 0; i < 100; i++) {
        const result = generateDerangement(participants, exclusions)
        verifyDerangement(participants, result, exclusions)
      }

      const elapsed = Date.now() - start
      expect(elapsed).toBeLessThan(5000)
      console.log(`100 iterations with 100 participants: ${elapsed}ms`)
    })
  })
})
