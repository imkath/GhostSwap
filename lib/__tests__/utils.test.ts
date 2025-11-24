import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn (class names utility)', () => {
  it('merges simple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('handles array of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('handles object syntax', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('handles mixed inputs', () => {
    expect(cn('foo', ['bar', 'baz'], { qux: true })).toBe('foo bar baz qux')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
  })
})
