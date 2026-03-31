'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const NAMES = ['Ana', 'Carlos', 'Luna', 'Diego', 'Sofía', 'Mateo']
const COLORS = ['#818cf8', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#f87171']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  color: string
  size: number
}

export function InteractiveDraw() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const stateRef = useRef({
    phase: 'idle' as 'idle' | 'shuffling' | 'connecting' | 'done',
    time: 0,
    shuffleStart: 0,
    connectStart: 0,
    assignments: [] as number[],
    particles: [] as Particle[],
    hovered: false,
  })

  const [phase, setPhase] = useState<'idle' | 'shuffling' | 'connecting' | 'done'>('idle')

  const generateDerangement = useCallback((): number[] => {
    const n = NAMES.length
    for (let attempt = 0; attempt < 200; attempt++) {
      const perm = Array.from({ length: n }, (_, i) => i)
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[perm[i], perm[j]] = [perm[j]!, perm[i]!]
      }
      if (perm.every((v, i) => v !== i)) return perm
    }
    return [1, 2, 3, 4, 5, 0]
  }, [])

  const startDraw = useCallback(() => {
    const s = stateRef.current
    if (s.phase !== 'idle' && s.phase !== 'done') return
    s.phase = 'shuffling'
    s.shuffleStart = s.time
    s.assignments = generateDerangement()
    s.particles = []
    setPhase('shuffling')
  }, [generateDerangement])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = rect.width
      H = rect.height
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const getPositions = (side: 'left' | 'right') => {
      const cx = side === 'left' ? W * 0.22 : W * 0.78
      const startY = H * 0.15
      const gap = (H * 0.7) / (NAMES.length - 1)
      return NAMES.map((_, i) => ({ x: cx, y: startY + i * gap }))
    }

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
    const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

    const drawAvatar = (
      x: number,
      y: number,
      name: string,
      color: string,
      radius: number,
      alpha: number,
      glow: boolean
    ) => {
      ctx.save()
      ctx.globalAlpha = alpha

      if (glow) {
        ctx.shadowColor = color
        ctx.shadowBlur = 16
      }

      // Circle
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      // Initial letter
      ctx.shadowBlur = 0
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${radius * 0.9}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(name[0]!, x, y + 1)

      // Name below
      ctx.fillStyle = '#64748b'
      ctx.font = `500 ${Math.max(10, radius * 0.55)}px Inter, system-ui, sans-serif`
      ctx.fillText(name, x, y + radius + 14)

      ctx.restore()
    }

    const drawConnection = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      color: string,
      progress: number,
      alpha: number
    ) => {
      if (progress <= 0) return

      ctx.save()
      ctx.globalAlpha = alpha

      // Bezier curve
      const cpx1 = x1 + (x2 - x1) * 0.4
      const cpy1 = y1
      const cpx2 = x1 + (x2 - x1) * 0.6
      const cpy2 = y2

      // Draw partial path
      ctx.beginPath()
      ctx.moveTo(x1, y1)

      const steps = Math.floor(progress * 60)
      for (let i = 0; i <= steps; i++) {
        const t = i / 60
        const u = 1 - t
        const px = u * u * u * x1 + 3 * u * u * t * cpx1 + 3 * u * t * t * cpx2 + t * t * t * x2
        const py = u * u * u * y1 + 3 * u * u * t * cpy1 + 3 * u * t * t * cpy2 + t * t * t * y2
        ctx.lineTo(px, py)
      }

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.shadowColor = color
      ctx.shadowBlur = 8
      ctx.stroke()

      // Arrow at tip if fully drawn
      if (progress > 0.95) {
        const t = 0.98
        const u = 1 - t
        const tipX = u * u * u * x1 + 3 * u * u * t * cpx1 + 3 * u * t * t * cpx2 + t * t * t * x2
        const tipY = u * u * u * y1 + 3 * u * u * t * cpy1 + 3 * u * t * t * cpy2 + t * t * t * y2
        const t2 = 0.95
        const u2 = 1 - t2
        const prevX =
          u2 * u2 * u2 * x1 + 3 * u2 * u2 * t2 * cpx1 + 3 * u2 * t2 * t2 * cpx2 + t2 * t2 * t2 * x2
        const prevY =
          u2 * u2 * u2 * y1 + 3 * u2 * u2 * t2 * cpy1 + 3 * u2 * t2 * t2 * cpy2 + t2 * t2 * t2 * y2
        const angle = Math.atan2(tipY - prevY, tipX - prevX)
        const arrowSize = 8

        ctx.beginPath()
        ctx.moveTo(tipX, tipY)
        ctx.lineTo(
          tipX - arrowSize * Math.cos(angle - Math.PI / 6),
          tipY - arrowSize * Math.sin(angle - Math.PI / 6)
        )
        ctx.moveTo(tipX, tipY)
        ctx.lineTo(
          tipX - arrowSize * Math.cos(angle + Math.PI / 6),
          tipY - arrowSize * Math.sin(angle + Math.PI / 6)
        )
        ctx.stroke()
      }

      ctx.restore()
    }

    const spawnParticles = (x: number, y: number, color: string, count: number) => {
      const s = stateRef.current
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1 + Math.random() * 3
        s.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color,
          size: 2 + Math.random() * 3,
        })
      }
    }

    const frame = (ts: number) => {
      const s = stateRef.current
      s.time = ts / 1000

      ctx.clearRect(0, 0, W, H)

      const leftPos = getPositions('left')
      const rightPos = getPositions('right')

      const radius = Math.min(W * 0.04, 22)

      // Column labels
      ctx.save()
      ctx.fillStyle = '#94a3b8'
      ctx.font = `600 ${Math.max(10, radius * 0.5)}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillText('Quien regala', leftPos[0]!.x, leftPos[0]!.y - radius - 20)
      ctx.fillText('Quien recibe', rightPos[0]!.x, rightPos[0]!.y - radius - 20)
      ctx.restore()

      if (s.phase === 'idle') {
        // Draw avatars with subtle float
        leftPos.forEach((p, i) => {
          const floatY = Math.sin(s.time * 1.5 + i * 0.8) * 2
          drawAvatar(p.x, p.y + floatY, NAMES[i]!, COLORS[i]!, radius, 1, false)
        })
        rightPos.forEach((p, i) => {
          const floatY = Math.sin(s.time * 1.5 + i * 0.8 + Math.PI) * 2
          drawAvatar(p.x, p.y + floatY, NAMES[i]!, COLORS[i]!, radius, 1, false)
        })

        // Pulsing hint
        if (!s.hovered) {
          const pulse = 0.4 + Math.sin(s.time * 2) * 0.15
          ctx.save()
          ctx.fillStyle = `rgba(99, 102, 241, ${pulse})`
          ctx.font = '500 13px Inter, system-ui, sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('Haz clic para sortear', W / 2, H * 0.92)
          ctx.restore()
        }
      }

      if (s.phase === 'shuffling') {
        const elapsed = s.time - s.shuffleStart
        const shuffleDuration = 1.8

        // Left side stays
        leftPos.forEach((p, i) => {
          drawAvatar(p.x, p.y, NAMES[i]!, COLORS[i]!, radius, 1, false)
        })

        // Right side: names shuffle visually
        if (elapsed < shuffleDuration) {
          const speed = Math.max(0.05, 1 - elapsed / shuffleDuration)
          const cycleTime = 0.08 + (1 - speed) * 0.15
          const offset = Math.floor(elapsed / cycleTime) % NAMES.length

          rightPos.forEach((p, i) => {
            const shuffledIdx = (i + offset) % NAMES.length
            const floatY = Math.sin(elapsed * 8 + i) * 4 * speed
            drawAvatar(
              p.x,
              p.y + floatY,
              NAMES[shuffledIdx]!,
              COLORS[shuffledIdx]!,
              radius,
              1,
              false
            )
          })
        } else {
          // Settle into final positions
          const settleT = Math.min(1, (elapsed - shuffleDuration) / 0.4)
          const eased = easeOut(settleT)

          rightPos.forEach((p, i) => {
            const targetIdx = s.assignments[i]!
            const floatY = (1 - eased) * Math.sin(elapsed * 8 + i) * 2
            drawAvatar(
              p.x,
              p.y + floatY,
              NAMES[targetIdx]!,
              COLORS[targetIdx]!,
              radius,
              1,
              settleT > 0.8
            )
          })

          if (settleT >= 1) {
            s.phase = 'connecting'
            s.connectStart = s.time
            setPhase('connecting')
          }
        }
      }

      if (s.phase === 'connecting' || s.phase === 'done') {
        const elapsed = s.time - s.connectStart
        const stagger = 0.3
        const lineDuration = 0.6

        leftPos.forEach((p, i) => {
          drawAvatar(p.x, p.y, NAMES[i]!, COLORS[i]!, radius, 1, true)
        })

        rightPos.forEach((p, i) => {
          const targetIdx = s.assignments[i]!
          drawAvatar(p.x, p.y, NAMES[targetIdx]!, COLORS[targetIdx]!, radius, 1, true)
        })

        // Draw connections with staggered animation
        let allDone = true
        leftPos.forEach((lp, i) => {
          const targetIdx = s.assignments[i]!
          const rp = rightPos[targetIdx]!
          const lineElapsed = elapsed - i * stagger
          const progress = Math.min(1, Math.max(0, lineElapsed / lineDuration))
          const easedProgress = easeInOut(progress)

          if (progress < 1) allDone = false

          drawConnection(lp.x + radius, lp.y, rp.x - radius, rp.y, COLORS[i]!, easedProgress, 0.8)

          // Spawn particles when connection completes
          if (progress >= 0.99 && progress < 1.01 && lineElapsed < lineDuration + 0.02) {
            spawnParticles(rp.x - radius, rp.y, COLORS[i]!, 12)
          }
        })

        if (allDone && s.phase === 'connecting') {
          s.phase = 'done'
          setPhase('done')
          // Reset after a pause
          setTimeout(() => {
            s.phase = 'idle'
            s.particles = []
            setPhase('idle')
          }, 4000)
        }
      }

      // Update & draw particles
      s.particles = s.particles.filter((p) => p.life > 0)
      s.particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.vx *= 0.98
        p.life -= 0.02
        ctx.save()
        ctx.globalAlpha = p.life
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      animRef.current = requestAnimationFrame(frame)
    }

    animRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-[16/10] w-full max-w-[560px] cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm select-none"
      onClick={startDraw}
      onMouseEnter={() => {
        stateRef.current.hovered = true
      }}
      onMouseLeave={() => {
        stateRef.current.hovered = false
      }}
      role="button"
      aria-label="Iniciar sorteo de demostración"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') startDraw()
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
