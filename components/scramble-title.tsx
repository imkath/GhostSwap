'use client'

import { useEffect, useRef, useState } from 'react'

const TARGET = 'Amigo Secreto'
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

export function ScrambleTitle() {
  const [display, setDisplay] = useState(TARGET)
  const [resolved, setResolved] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const letters = TARGET.split('')
    const locked = new Array(letters.length).fill(false)
    let frame = 0
    const totalFrames = 45 // ~1.5s at 30fps
    const staggerPerChar = 3 // frames between each char locking

    const interval = setInterval(() => {
      frame++

      const result = letters.map((char, i) => {
        if (char === ' ') return ' '
        if (locked[i]) return char

        // Each character locks in sequence with stagger
        const lockFrame = 8 + i * staggerPerChar
        if (frame >= lockFrame) {
          locked[i] = true
          return char
        }

        // Random character while not locked
        return CHARS[Math.floor(Math.random() * CHARS.length)]!
      })

      setDisplay(result.join(''))

      if (locked.every(Boolean)) {
        clearInterval(interval)
        setResolved(true)
      }
    }, 33)

    return () => clearInterval(interval)
  }, [])

  // Split display into characters for individual styling
  const spaceIdx = TARGET.indexOf(' ')

  return (
    <span className="text-indigo-600">
      {display.split('').map((char, i) => {
        const isLocked = resolved || char === TARGET[i]
        const isSpace = i === spaceIdx

        if (isSpace) return <span key={i}> </span>

        return (
          <span
            key={i}
            className="inline-block transition-all duration-150"
            style={{
              opacity: isLocked ? 1 : 0.6,
              filter: isLocked ? 'none' : 'blur(0.5px)',
              transform: isLocked ? 'none' : `translateY(${Math.sin(i * 2) * 1}px)`,
              fontFamily: isLocked ? 'inherit' : 'monospace',
            }}
          >
            {char}
          </span>
        )
      })}
    </span>
  )
}
