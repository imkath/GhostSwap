import { describe, it, expect } from 'vitest'
import { generateDerangement, type ExclusionMap } from '../derangement'

describe('Derangement with Exclusions', () => {
  describe('Basic exclusion functionality', () => {
    it('should respect single exclusion', () => {
      const participants = ['A', 'B', 'C', 'D']
      const exclusions: ExclusionMap = new Map([
        ['A', new Set(['B'])]
      ])

      const result = generateDerangement(participants, exclusions)

      expect(result).not.toBeNull()
      if (result) {
        const aIndex = participants.indexOf('A')
        expect(result[aIndex]).not.toBe('B')
        expect(result[aIndex]).not.toBe('A')
      }
    })

    it('should respect multiple exclusions for one person', () => {
      const participants = ['A', 'B', 'C', 'D', 'E']
      const exclusions: ExclusionMap = new Map([
        ['A', new Set(['B', 'C'])]
      ])

      for (let i = 0; i < 50; i++) {
        const result = generateDerangement(participants, exclusions)
        expect(result).not.toBeNull()

        if (result) {
          const aIndex = participants.indexOf('A')
          expect(result[aIndex]).not.toBe('B')
          expect(result[aIndex]).not.toBe('C')
          expect(result[aIndex]).not.toBe('A')
          expect(['D', 'E']).toContain(result[aIndex])
        }
      }
    })

    it('should respect exclusions for multiple people', () => {
      const participants = ['A', 'B', 'C', 'D']
      const exclusions: ExclusionMap = new Map([
        ['A', new Set(['B'])],
        ['B', new Set(['A'])],
        ['C', new Set(['D'])],
      ])

      for (let i = 0; i < 50; i++) {
        const result = generateDerangement(participants, exclusions)
        expect(result).not.toBeNull()

        if (result) {
          expect(result[0]).not.toBe('B') // A cannot give to B
          expect(result[0]).not.toBe('A') // A cannot give to A
          expect(result[1]).not.toBe('A') // B cannot give to A
          expect(result[1]).not.toBe('B') // B cannot give to B
          expect(result[2]).not.toBe('D') // C cannot give to D
          expect(result[2]).not.toBe('C') // C cannot give to C
          expect(result[3]).not.toBe('D') // D cannot give to D
        }
      }
    })
  })

  describe('Couple exclusions (bidirectional)', () => {
    it('should handle couple exclusions', () => {
      const participants = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']

      // Alice and Bob are a couple (cannot give to each other)
      // Charlie and Diana are a couple
      const exclusions: ExclusionMap = new Map([
        ['Alice', new Set(['Bob'])],
        ['Bob', new Set(['Alice'])],
        ['Charlie', new Set(['Diana'])],
        ['Diana', new Set(['Charlie'])],
      ])

      for (let i = 0; i < 100; i++) {
        const result = generateDerangement(participants, exclusions)
        expect(result).not.toBeNull()

        if (result) {
          // Verify no self-assignment
          for (let j = 0; j < participants.length; j++) {
            expect(result[j]).not.toBe(participants[j])
          }

          // Verify couple restrictions
          const aliceIndex = participants.indexOf('Alice')
          const bobIndex = participants.indexOf('Bob')
          const charlieIndex = participants.indexOf('Charlie')
          const dianaIndex = participants.indexOf('Diana')

          expect(result[aliceIndex]).not.toBe('Bob')
          expect(result[bobIndex]).not.toBe('Alice')
          expect(result[charlieIndex]).not.toBe('Diana')
          expect(result[dianaIndex]).not.toBe('Charlie')

          // Verify bijection (everyone appears exactly once)
          expect(new Set(result).size).toBe(participants.length)
        }
      }
    })
  })

  describe('Edge cases with exclusions', () => {
    it('should return null for impossible constraints', () => {
      // A can only give to B, but B cannot receive (too constrained)
      const participants = ['A', 'B', 'C']
      const exclusions: ExclusionMap = new Map([
        ['A', new Set(['C'])], // A cannot give to C
        ['C', new Set(['B'])], // C cannot give to B
        ['B', new Set(['C'])], // B cannot give to C
      ])
      // This creates: A -> B, B -> ?, C -> A
      // But B can only give to A, and A is already taken by C
      // Actually this might still work: A -> B, B -> A? No, B->A would mean A gives and receives from B
      // Let's make it truly impossible

      const impossibleParticipants = ['A', 'B', 'C']
      const impossibleExclusions: ExclusionMap = new Map([
        ['A', new Set(['B', 'C'])], // A can give to no one
      ])

      const result = generateDerangement(impossibleParticipants, impossibleExclusions)
      expect(result).toBeNull()
    })

    it('should handle empty exclusions map', () => {
      const participants = ['A', 'B', 'C', 'D']
      const exclusions: ExclusionMap = new Map()

      const result = generateDerangement(participants, exclusions)
      expect(result).not.toBeNull()

      if (result) {
        // Should work like normal derangement
        for (let i = 0; i < participants.length; i++) {
          expect(result[i]).not.toBe(participants[i])
        }
      }
    })

    it('should handle undefined exclusions', () => {
      const participants = ['A', 'B', 'C', 'D']

      const result = generateDerangement(participants, undefined)
      expect(result).not.toBeNull()

      if (result) {
        // Should work like normal derangement
        for (let i = 0; i < participants.length; i++) {
          expect(result[i]).not.toBe(participants[i])
        }
      }
    })

    it('should handle large groups with many exclusions', () => {
      const participants = Array.from({ length: 20 }, (_, i) => `Person${i}`)

      // Create exclusions: each person cannot give to next 2 people (circular)
      const exclusions: ExclusionMap = new Map()
      for (let i = 0; i < participants.length; i++) {
        const excluded = new Set([
          participants[(i + 1) % participants.length],
          participants[(i + 2) % participants.length],
        ])
        exclusions.set(participants[i], excluded)
      }

      const result = generateDerangement(participants, exclusions)
      expect(result).not.toBeNull()

      if (result) {
        // Verify all exclusions are respected
        for (let i = 0; i < participants.length; i++) {
          const giverId = participants[i]
          const receiverId = result[i]

          // Cannot give to self
          expect(receiverId).not.toBe(giverId)

          // Cannot give to excluded people
          if (exclusions.has(giverId)) {
            expect(exclusions.get(giverId)!.has(receiverId)).toBe(false)
          }
        }

        // Verify bijection
        expect(new Set(result).size).toBe(participants.length)
      }
    })
  })

  describe('Complex real-world scenarios', () => {
    it('should handle family event with multiple couples', () => {
      const participants = [
        'Alice',   // with Bob
        'Bob',     // with Alice
        'Charlie', // with Diana
        'Diana',   // with Charlie
        'Eve',     // with Frank
        'Frank',   // with Eve
        'Grace',   // single
        'Henry',   // single
      ]

      const exclusions: ExclusionMap = new Map([
        ['Alice', new Set(['Bob'])],
        ['Bob', new Set(['Alice'])],
        ['Charlie', new Set(['Diana'])],
        ['Diana', new Set(['Charlie'])],
        ['Eve', new Set(['Frank'])],
        ['Frank', new Set(['Eve'])],
      ])

      for (let i = 0; i < 100; i++) {
        const result = generateDerangement(participants, exclusions)
        expect(result).not.toBeNull()

        if (result) {
          // Verify no self-assignment
          for (let j = 0; j < participants.length; j++) {
            expect(result[j]).not.toBe(participants[j])
          }

          // Verify all couple exclusions
          for (const [giver, excludedSet] of exclusions) {
            const giverIndex = participants.indexOf(giver)
            const receiver = result[giverIndex]
            expect(excludedSet.has(receiver)).toBe(false)
          }

          // Verify bijection
          expect(new Set(result).size).toBe(participants.length)
        }
      }
    })

    it('should handle office Secret Santa with manager exclusions', () => {
      const participants = ['Manager', 'Dev1', 'Dev2', 'Dev3', 'Intern1', 'Intern2']

      // Manager cannot give to interns (would be awkward)
      // Interns cannot give to manager (budget reasons)
      const exclusions: ExclusionMap = new Map([
        ['Manager', new Set(['Intern1', 'Intern2'])],
        ['Intern1', new Set(['Manager'])],
        ['Intern2', new Set(['Manager'])],
      ])

      for (let i = 0; i < 50; i++) {
        const result = generateDerangement(participants, exclusions)
        expect(result).not.toBeNull()

        if (result) {
          const managerIndex = participants.indexOf('Manager')
          expect(result[managerIndex]).not.toBe('Intern1')
          expect(result[managerIndex]).not.toBe('Intern2')

          const intern1Index = participants.indexOf('Intern1')
          const intern2Index = participants.indexOf('Intern2')
          expect(result[intern1Index]).not.toBe('Manager')
          expect(result[intern2Index]).not.toBe('Manager')
        }
      }
    })
  })

  describe('Performance with exclusions', () => {
    it('should handle exclusions efficiently', () => {
      const participants = Array.from({ length: 50 }, (_, i) => `P${i}`)

      // Create moderate exclusions: each person excludes 2 others
      const exclusions: ExclusionMap = new Map()
      for (let i = 0; i < participants.length; i++) {
        const excluded = new Set([
          participants[(i + 1) % participants.length],
          participants[(i + 3) % participants.length],
        ])
        exclusions.set(participants[i], excluded)
      }

      const startTime = Date.now()
      const result = generateDerangement(participants, exclusions)
      const elapsed = Date.now() - startTime

      expect(result).not.toBeNull()
      expect(elapsed).toBeLessThan(1000) // Should complete in less than 1 second
    })
  })

  describe('Statistical properties with exclusions', () => {
    it('should still provide fair distribution with exclusions', () => {
      const participants = ['A', 'B', 'C', 'D', 'E']
      const exclusions: ExclusionMap = new Map([
        ['A', new Set(['B'])], // A cannot give to B
      ])

      const receiverCounts = new Map<string, number>()
      participants.forEach(p => receiverCounts.set(p, 0))

      const iterations = 1000
      for (let i = 0; i < iterations; i++) {
        const result = generateDerangement(participants, exclusions)
        if (result) {
          result.forEach(receiver => {
            receiverCounts.set(receiver, receiverCounts.get(receiver)! + 1)
          })
        }
      }

      // Each person should receive approximately iterations times
      // Allow for statistical variance
      const expectedCount = iterations
      const tolerance = iterations * 0.3 // 30% tolerance

      for (const [person, count] of receiverCounts) {
        expect(count).toBeGreaterThan(expectedCount - tolerance)
        expect(count).toBeLessThan(expectedCount + tolerance)
      }
    })
  })
})
