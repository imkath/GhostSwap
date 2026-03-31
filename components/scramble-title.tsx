'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

const TARGET = 'Amigo Secreto'
const LETTERS = TARGET.split('')

function derangement(): number[] {
  const n = LETTERS.length
  for (let attempt = 0; attempt < 200; attempt++) {
    const perm = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[perm[i], perm[j]] = [perm[j]!, perm[i]!]
    }
    if (perm.every((v, i) => LETTERS[i] === ' ' || v !== i)) return perm
  }
  return Array.from({ length: n }, (_, i) => (i + 3) % n)
}

export function ScrambleTitle() {
  const containerRef = useRef<HTMLSpanElement>(null)
  const slotsRef = useRef<(HTMLSpanElement | null)[]>([])
  const charsRef = useRef<(HTMLSpanElement | null)[]>([])
  const [ready, setReady] = useState(false)
  const [shuffled, setShuffled] = useState(true)
  const orderRef = useRef<number[]>(derangement())
  const hasRun = useRef(false)

  // Measure slot positions and position characters
  const positionChars = useCallback(() => {
    const slots = slotsRef.current
    const chars = charsRef.current
    const container = containerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const order = orderRef.current

    // Position each character at its assigned slot
    LETTERS.forEach((_, charIdx) => {
      const charEl = chars[charIdx]
      if (!charEl || LETTERS[charIdx] === ' ') return

      // This character should be in slot order[charIdx] (when shuffled)
      // or in slot charIdx (when resolved)
      const targetSlot = shuffled ? order.indexOf(charIdx) : charIdx
      const slotEl = slots[targetSlot]
      if (!slotEl) return

      const slotRect = slotEl.getBoundingClientRect()
      const x = slotRect.left - containerRect.left

      charEl.style.transition = shuffled
        ? 'none'
        : `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${charIdx * 30}ms, opacity 0.3s`
      charEl.style.transform = `translateX(${x}px)`
      charEl.style.opacity = shuffled ? '0.55' : '1'
    })
  }, [shuffled])

  useEffect(() => {
    // Measure initial positions
    requestAnimationFrame(() => {
      setReady(true)
      positionChars()
    })
  }, [positionChars])

  useEffect(() => {
    if (!ready || hasRun.current) return
    hasRun.current = true

    // After a pause, resolve
    const timer = setTimeout(() => {
      setShuffled(false)
    }, 900)

    return () => clearTimeout(timer)
  }, [ready])

  useEffect(() => {
    if (ready) positionChars()
  }, [shuffled, ready, positionChars])

  // Re-measure on resize
  useEffect(() => {
    const onResize = () => positionChars()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [positionChars])

  return (
    <span
      ref={containerRef}
      className="relative inline-block text-indigo-600"
      aria-label="Amigo Secreto"
    >
      {/* Invisible slots that define the natural text layout */}
      {LETTERS.map((letter, i) => (
        <span
          key={`slot-${i}`}
          ref={(el) => {
            slotsRef.current[i] = el
          }}
          className="invisible"
          aria-hidden="true"
        >
          {letter}
        </span>
      ))}

      {/* Animated characters positioned absolutely over slots */}
      {LETTERS.map((letter, i) => {
        if (letter === ' ') return null
        return (
          <span
            key={`char-${i}`}
            ref={(el) => {
              charsRef.current[i] = el
            }}
            className="absolute top-0 left-0"
            style={{
              willChange: 'transform',
              opacity: ready ? undefined : 0,
            }}
            aria-hidden="true"
          >
            {letter}
          </span>
        )
      })}
    </span>
  )
}
