import { describe, it, expect } from 'vitest'
import { generateDerangement } from '../derangement'

describe('generateDerangement', () => {
  describe('edge cases', () => {
    it('returns null for empty array', () => {
      expect(generateDerangement([])).toBeNull()
    })

    it('returns null for single participant', () => {
      expect(generateDerangement(['A'])).toBeNull()
    })

    it('handles 2 participants correctly', () => {
      const result = generateDerangement(['A', 'B'])
      expect(result).not.toBeNull()
      expect(result).toHaveLength(2)
      // In a derangement of 2 elements, they must swap positions
      expect(result![0]).toBe('B')
      expect(result![1]).toBe('A')
    })
  })

  describe('derangement properties', () => {
    it('no participant is assigned to themselves', () => {
      const participants = ['A', 'B', 'C', 'D', 'E']

      // Run multiple times to account for randomness
      for (let i = 0; i < 100; i++) {
        const result = generateDerangement(participants)
        expect(result).not.toBeNull()

        for (let j = 0; j < participants.length; j++) {
          expect(result![j]).not.toBe(participants[j])
        }
      }
    })

    it('contains all original participants', () => {
      const participants = ['A', 'B', 'C', 'D', 'E']
      const result = generateDerangement(participants)

      expect(result).not.toBeNull()
      expect(result!.sort()).toEqual(participants.sort())
    })

    it('maintains correct length', () => {
      const participants = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
      const result = generateDerangement(participants)

      expect(result).toHaveLength(participants.length)
    })

    it('works with 3 participants (minimum for draw)', () => {
      const participants = ['A', 'B', 'C']

      for (let i = 0; i < 50; i++) {
        const result = generateDerangement(participants)
        expect(result).not.toBeNull()

        for (let j = 0; j < participants.length; j++) {
          expect(result![j]).not.toBe(participants[j])
        }
      }
    })
  })

  describe('with UUIDs (realistic scenario)', () => {
    it('works with UUID strings', () => {
      const participants = [
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
        '123e4567-e89b-12d3-a456-426614174002',
        '123e4567-e89b-12d3-a456-426614174003',
      ]

      const result = generateDerangement(participants)
      expect(result).not.toBeNull()

      for (let i = 0; i < participants.length; i++) {
        expect(result![i]).not.toBe(participants[i])
      }
    })
  })

  describe('large groups', () => {
    it('handles 20 participants', () => {
      const participants = Array.from({ length: 20 }, (_, i) => `P${i}`)
      const result = generateDerangement(participants)

      expect(result).not.toBeNull()
      expect(result).toHaveLength(20)

      for (let i = 0; i < participants.length; i++) {
        expect(result![i]).not.toBe(participants[i])
      }
    })

    it('handles 100 participants', () => {
      const participants = Array.from({ length: 100 }, (_, i) => `P${i}`)
      const result = generateDerangement(participants)

      expect(result).not.toBeNull()
      expect(result).toHaveLength(100)

      for (let i = 0; i < participants.length; i++) {
        expect(result![i]).not.toBe(participants[i])
      }
    })
  })

  describe('randomness', () => {
    it('produces different results on multiple calls', () => {
      const participants = ['A', 'B', 'C', 'D', 'E', 'F']
      const results = new Set<string>()

      for (let i = 0; i < 50; i++) {
        const result = generateDerangement(participants)
        results.add(JSON.stringify(result))
      }

      // Should have more than 1 unique result
      expect(results.size).toBeGreaterThan(1)
    })
  })
})
