'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const PEOPLE = [
  { name: 'Ana', color: '#818cf8' },
  { name: 'Carlos', color: '#f472b6' },
  { name: 'Luna', color: '#34d399' },
  { name: 'Diego', color: '#fbbf24' },
  { name: 'Sofía', color: '#60a5fa' },
]

interface Connection {
  from: number
  to: number
  color: string
}

export function InteractiveDraw() {
  const [phase, setPhase] = useState<'idle' | 'shuffling' | 'revealing' | 'done'>('idle')
  const [assignments, setAssignments] = useState<number[]>([])
  const [revealedCount, setRevealedCount] = useState(0)
  const [connections, setConnections] = useState<Connection[]>([])
  const [shuffleOffset, setShuffleOffset] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const shuffleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const generateDerangement = useCallback((): number[] => {
    const n = PEOPLE.length
    for (let attempt = 0; attempt < 200; attempt++) {
      const perm = Array.from({ length: n }, (_, i) => i)
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[perm[i], perm[j]] = [perm[j]!, perm[i]!]
      }
      if (perm.every((v, i) => v !== i)) return perm
    }
    return [1, 2, 3, 4, 0]
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const startDraw = useCallback(() => {
    if (phase !== 'idle' && phase !== 'done') return

    setConnections([])
    setRevealedCount(0)
    setPhase('shuffling')

    const result = generateDerangement()
    setAssignments(result)

    // Shuffle animation — cycle positions rapidly then slow
    let count = 0
    shuffleIntervalRef.current = setInterval(() => {
      count++
      setShuffleOffset(count)

      if (count > 18) {
        if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current)
        setPhase('revealing')

        // Reveal connections one by one
        result.forEach((to, from) => {
          timeoutRef.current = setTimeout(
            () => {
              setConnections((prev) => [...prev, { from, to, color: PEOPLE[from]!.color }])
              setRevealedCount((prev) => prev + 1)
            },
            from * 400 + 200
          )
        })

        // Reset after all revealed
        timeoutRef.current = setTimeout(
          () => {
            setPhase('done')
            timeoutRef.current = setTimeout(() => {
              setPhase('idle')
              setConnections([])
              setRevealedCount(0)
            }, 3500)
          },
          PEOPLE.length * 400 + 800
        )
      }
    }, 80)
  }, [phase, generateDerangement])

  // Get position on a circle
  const getPosition = (index: number, total: number, radius: number) => {
    const angle = (index / total) * Math.PI * 2 - Math.PI / 2
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    }
  }

  const radius = 140
  const svgSize = radius * 2 + 100

  return (
    <div className="relative mx-auto w-full max-w-[420px] py-4" ref={containerRef}>
      {/* SVG for connections */}
      <div className="relative" style={{ width: svgSize, height: svgSize, margin: '0 auto' }}>
        <svg
          viewBox={`${-svgSize / 2} ${-svgSize / 2} ${svgSize} ${svgSize}`}
          className="absolute inset-0 h-full w-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {connections.map((conn, i) => (
              <linearGradient
                key={`grad-${i}`}
                id={`conn-grad-${i}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor={conn.color} stopOpacity="0.8" />
                <stop offset="100%" stopColor={PEOPLE[conn.to]!.color} stopOpacity="0.8" />
              </linearGradient>
            ))}
          </defs>

          {/* Connection lines */}
          <AnimatePresence>
            {connections.map((conn, i) => {
              const from = getPosition(conn.from, PEOPLE.length, radius)
              const to = getPosition(conn.to, PEOPLE.length, radius)

              // Curved path through center-ish
              const mx = (from.x + to.x) * 0.15
              const my = (from.y + to.y) * 0.15
              const path = `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`

              return (
                <motion.g key={`conn-${conn.from}-${conn.to}`}>
                  {/* Glow */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke={conn.color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.15"
                    filter="blur(4px)"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  {/* Main line */}
                  <motion.path
                    d={path}
                    fill="none"
                    stroke={`url(#conn-grad-${i})`}
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  {/* Arrow dot at end */}
                  <motion.circle
                    cx={to.x}
                    cy={to.y}
                    r="4"
                    fill={PEOPLE[conn.to]!.color}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.6 }}
                    transition={{ delay: 0.4, duration: 0.2 }}
                  />
                </motion.g>
              )
            })}
          </AnimatePresence>
        </svg>

        {/* Avatars in a circle */}
        {PEOPLE.map((person, i) => {
          const pos = getPosition(i, PEOPLE.length, radius)
          const isRevealed =
            phase === 'revealing' || phase === 'done'
              ? connections.some((c) => c.from === i || c.to === i)
              : false

          // During shuffle, show shuffled names
          const displayIdx = phase === 'shuffling' ? (i + shuffleOffset) % PEOPLE.length : i
          const displayPerson = phase === 'shuffling' ? PEOPLE[displayIdx]! : person

          return (
            <motion.div
              key={person.name}
              className="absolute flex flex-col items-center gap-1"
              style={{
                left: svgSize / 2 + pos.x,
                top: svgSize / 2 + pos.y,
                transform: 'translate(-50%, -50%)',
              }}
              animate={
                phase === 'shuffling'
                  ? { scale: [1, 1.05, 1], y: [0, -3, 0] }
                  : isRevealed
                    ? { scale: [1, 1.15, 1] }
                    : {}
              }
              transition={
                phase === 'shuffling' ? { duration: 0.15, repeat: Infinity } : { duration: 0.3 }
              }
            >
              <div
                className="relative flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition-shadow duration-300"
                style={{
                  backgroundColor: displayPerson.color,
                  boxShadow: isRevealed
                    ? `0 0 20px ${displayPerson.color}60, 0 4px 12px rgba(0,0,0,0.1)`
                    : '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {displayPerson.name[0]}
              </div>
              <span
                className="text-xs font-medium transition-colors duration-300"
                style={{
                  color: isRevealed ? displayPerson.color : '#64748b',
                }}
              >
                {displayPerson.name}
              </span>
            </motion.div>
          )
        })}

        {/* Center button */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ zIndex: 10 }}
        >
          <AnimatePresence mode="wait">
            {(phase === 'idle' || phase === 'done') && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={startDraw}
                  className="h-14 w-14 rounded-full bg-indigo-600 p-0 shadow-lg shadow-indigo-200/50 hover:bg-indigo-700 hover:shadow-indigo-300/50"
                  aria-label="Sortear"
                >
                  <Shuffle className="h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {phase === 'shuffling' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: 360 }}
                transition={{ rotate: { duration: 1, repeat: Infinity, ease: 'linear' } }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100"
              >
                <Shuffle className="h-5 w-5 text-indigo-600" />
              </motion.div>
            )}

            {phase === 'revealing' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50"
              >
                <span className="text-lg font-bold text-indigo-600">
                  {revealedCount}/{PEOPLE.length}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-2 text-center text-xs text-slate-400">
        {phase === 'idle' && 'Presiona para ver el sorteo en acción'}
        {phase === 'shuffling' && 'Mezclando...'}
        {phase === 'revealing' && 'Asignando amigos secretos...'}
        {phase === 'done' && 'Nadie se regala a sí mismo. Así de simple.'}
      </p>
    </div>
  )
}
