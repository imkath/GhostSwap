import { describe, it, expect } from 'vitest'
import { generateDerangement } from '../derangement'

describe('generateDerangement stress tests', () => {
  it('consistently handles 2 participants across 1000 runs', () => {
    const participants = ['A', 'B']

    for (let i = 0; i < 1000; i++) {
      const result = generateDerangement(participants)
      expect(result).not.toBeNull()
      expect(result![0]).toBe('B')
      expect(result![1]).toBe('A')
    }
  })

  it('never assigns anyone to themselves across 1000 runs with 5 participants', () => {
    const participants = ['A', 'B', 'C', 'D', 'E']

    for (let i = 0; i < 1000; i++) {
      const result = generateDerangement(participants)
      expect(result).not.toBeNull()

      for (let j = 0; j < participants.length; j++) {
        expect(result![j]).not.toBe(participants[j])
      }
    }
  })

  it('never assigns anyone to themselves across 500 runs with 3 participants', () => {
    const participants = ['A', 'B', 'C']

    for (let i = 0; i < 500; i++) {
      const result = generateDerangement(participants)
      expect(result).not.toBeNull()

      for (let j = 0; j < participants.length; j++) {
        expect(result![j]).not.toBe(participants[j])
      }
    }
  })
})
