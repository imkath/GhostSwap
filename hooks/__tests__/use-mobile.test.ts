import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '../use-mobile'

describe('useIsMobile', () => {
  const originalMatchMedia = window.matchMedia
  const originalInnerWidth = window.innerWidth

  let mediaQueryListeners: ((e: MediaQueryListEvent) => void)[] = []

  beforeEach(() => {
    mediaQueryListeners = []

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_event: string, listener: (e: MediaQueryListEvent) => void) => {
          mediaQueryListeners.push(listener)
        }),
        removeEventListener: vi.fn((_event: string, listener: (e: MediaQueryListEvent) => void) => {
          mediaQueryListeners = mediaQueryListeners.filter(l => l !== listener)
        }),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    })
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth,
    })
  })

  it('returns false for desktop width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true for mobile width', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 500,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('returns false at exactly 768px (breakpoint)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 768,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true at 767px (just below breakpoint)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 767,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('updates when window is resized', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 500,
      })

      mediaQueryListeners.forEach(listener => {
        listener({ matches: true } as MediaQueryListEvent)
      })
    })

    expect(result.current).toBe(true)
  })

  it('cleans up event listener on unmount', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    })

    const { unmount } = renderHook(() => useIsMobile())

    expect(mediaQueryListeners.length).toBe(1)

    unmount()

    // Listener should be removed
    expect(mediaQueryListeners.length).toBe(0)
  })
})
