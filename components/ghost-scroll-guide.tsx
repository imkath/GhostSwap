'use client'

import { useEffect, useRef } from 'react'

export function GhostScrollGuide() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    progress: 0,
    ghostX: 0,
    ghostY: 0,
    targetX: 0,
    targetY: 0,
    time: 0,
    velocity: 0,
    lastProgress: 0,
    particles: [] as {
      x: number
      y: number
      vx: number
      vy: number
      life: number
      size: number
    }[],
    lastEmit: 0,
    trail: [] as { x: number; y: number; alpha: number }[],
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Hide on mobile
    if (window.innerWidth < 768) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let W = 0
    let H = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const getScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      return docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0
    }

    // Wandering path — the ghost explores the page
    // Each waypoint is a position on screen at a certain scroll %
    const getWaypoint = (t: number): { x: number; y: number } => {
      // Normalize t to 0-1
      const p = Math.max(0, Math.min(1, t))

      // Define waypoints as % of viewport (the ghost wanders across)
      const waypoints = [
        { t: 0.0, x: 0.85, y: 0.25 }, // Start: top right area
        { t: 0.08, x: 0.92, y: 0.4 }, // Drift right
        { t: 0.15, x: 0.78, y: 0.55 }, // Come left
        { t: 0.25, x: 0.12, y: 0.35 }, // Cross to left side
        { t: 0.35, x: 0.08, y: 0.6 }, // Stay left, go down
        { t: 0.45, x: 0.3, y: 0.75 }, // Wander center-left
        { t: 0.55, x: 0.88, y: 0.5 }, // Cross to right
        { t: 0.65, x: 0.92, y: 0.7 }, // Right side down
        { t: 0.75, x: 0.5, y: 0.45 }, // Back to center
        { t: 0.85, x: 0.15, y: 0.65 }, // Left again
        { t: 0.95, x: 0.5, y: 0.8 }, // Center bottom
        { t: 1.0, x: 0.85, y: 0.9 }, // End bottom right
      ]

      // Find surrounding waypoints
      let i = 0
      for (; i < waypoints.length - 1; i++) {
        if (p <= waypoints[i + 1]!.t) break
      }

      const wp1 = waypoints[i]!
      const wp2 = waypoints[Math.min(i + 1, waypoints.length - 1)]!
      const segT = wp2.t - wp1.t
      const localT = segT > 0 ? (p - wp1.t) / segT : 0

      // Smooth interpolation
      const ease = localT * localT * (3 - 2 * localT) // smoothstep

      return {
        x: (wp1.x + (wp2.x - wp1.x) * ease) * W,
        y: (wp1.y + (wp2.y - wp1.y) * ease) * H,
      }
    }

    const drawGhost = (
      x: number,
      y: number,
      size: number,
      alpha: number,
      time: number,
      vx: number
    ) => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(x, y)

      // Bob gently
      const bob = Math.sin(time * 2.5) * 2
      ctx.translate(0, bob)

      // Lean into movement direction
      const lean = Math.max(-0.15, Math.min(0.15, vx * 0.003))
      ctx.rotate(lean)

      const s = size

      // Outer glow
      ctx.shadowColor = 'rgba(129, 140, 248, 0.4)'
      ctx.shadowBlur = 20

      // Ghost body
      ctx.beginPath()
      ctx.moveTo(-s * 0.5, s * 0.15)
      ctx.bezierCurveTo(-s * 0.5, -s * 0.55, s * 0.5, -s * 0.55, s * 0.5, s * 0.15)
      ctx.lineTo(s * 0.5, s * 0.38)

      // Wavy bottom that animates
      const wave = time * 3
      ctx.bezierCurveTo(
        s * 0.35,
        s * 0.28 + Math.sin(wave) * s * 0.06,
        s * 0.2,
        s * 0.48 + Math.sin(wave + 1) * s * 0.05,
        s * 0.1,
        s * 0.33 + Math.sin(wave + 2) * s * 0.04
      )
      ctx.bezierCurveTo(
        0,
        s * 0.48 + Math.sin(wave + 3) * s * 0.05,
        -s * 0.1,
        s * 0.3 + Math.sin(wave + 4) * s * 0.04,
        -s * 0.2,
        s * 0.44 + Math.sin(wave + 5) * s * 0.05
      )
      ctx.bezierCurveTo(
        -s * 0.3,
        s * 0.3 + Math.sin(wave + 6) * s * 0.04,
        -s * 0.4,
        s * 0.46 + Math.sin(wave + 7) * s * 0.05,
        -s * 0.5,
        s * 0.38
      )
      ctx.closePath()

      // Semi-transparent fill
      const grad = ctx.createRadialGradient(0, -s * 0.1, 0, 0, 0, s * 0.6)
      grad.addColorStop(0, 'rgba(165, 180, 252, 0.85)')
      grad.addColorStop(0.6, 'rgba(129, 140, 248, 0.7)')
      grad.addColorStop(1, 'rgba(99, 102, 241, 0.5)')
      ctx.fillStyle = grad
      ctx.fill()

      ctx.shadowBlur = 0

      // Eyes — look in movement direction
      const eyeY = -s * 0.12
      const sp = s * 0.16
      const lookX = Math.max(-s * 0.03, Math.min(s * 0.03, vx * 0.004))

      // Eye whites
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.beginPath()
      ctx.ellipse(-sp, eyeY, s * 0.1, s * 0.08, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(sp, eyeY, s * 0.1, s * 0.08, 0, 0, Math.PI * 2)
      ctx.fill()

      // Pupils
      ctx.fillStyle = '#312e81'
      ctx.beginPath()
      ctx.arc(-sp + lookX, eyeY, s * 0.05, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(sp + lookX, eyeY, s * 0.05, 0, Math.PI * 2)
      ctx.fill()

      // Glints
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath()
      ctx.arc(-sp + lookX - s * 0.015, eyeY - s * 0.02, s * 0.02, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(sp + lookX - s * 0.015, eyeY - s * 0.02, s * 0.02, 0, Math.PI * 2)
      ctx.fill()

      // Subtle smile
      ctx.strokeStyle = 'rgba(49, 46, 129, 0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(0, eyeY + s * 0.12, s * 0.08, 0.1 * Math.PI, 0.9 * Math.PI)
      ctx.stroke()

      ctx.restore()
    }

    const frame = (ts: number) => {
      const s = stateRef.current
      s.time = ts / 1000

      const rawProgress = getScrollProgress()
      s.velocity = rawProgress - s.lastProgress
      s.lastProgress = rawProgress
      s.progress += (rawProgress - s.progress) * 0.06

      ctx.clearRect(0, 0, W, H)

      // Get target from path
      const target = getWaypoint(s.progress)
      s.targetX = target.x
      s.targetY = target.y

      // Smooth follow with spring-like easing
      const prevX = s.ghostX
      s.ghostX += (s.targetX - s.ghostX) * 0.04
      s.ghostY += (s.targetY - s.ghostY) * 0.04
      const vx = s.ghostX - prevX

      // Add wobble
      s.ghostX += Math.sin(s.time * 1.2) * 3
      s.ghostY += Math.sin(s.time * 0.9 + 1) * 2

      // Trail
      if (Math.abs(s.velocity) > 0.0003 || s.trail.length === 0) {
        s.trail.push({ x: s.ghostX, y: s.ghostY, alpha: 0.35 })
        if (s.trail.length > 60) s.trail.shift()
      }

      // Draw trail
      s.trail.forEach((tp, i) => {
        tp.alpha *= 0.97
        if (tp.alpha < 0.01) return

        const trailSize = 2 + (i / s.trail.length) * 2
        ctx.save()
        ctx.globalAlpha = tp.alpha * 0.5
        ctx.fillStyle = '#a5b4fc'
        ctx.shadowColor = '#818cf8'
        ctx.shadowBlur = 4
        ctx.beginPath()
        ctx.arc(tp.x, tp.y, trailSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Clean dead trail points
      s.trail = s.trail.filter((tp) => tp.alpha > 0.01)

      // Particles on scroll
      const isScrolling = Math.abs(s.velocity) > 0.0008
      if (isScrolling && s.time - s.lastEmit > 0.08) {
        s.lastEmit = s.time
        for (let i = 0; i < 2; i++) {
          s.particles.push({
            x: s.ghostX + (Math.random() - 0.5) * 12,
            y: s.ghostY + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -Math.random() * 0.8 - 0.3,
            life: 1,
            size: 1 + Math.random() * 2,
          })
        }
      }

      // Update & draw particles
      s.particles = s.particles.filter((p) => p.life > 0)
      s.particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.01 // float upward
        p.life -= 0.02

        ctx.save()
        ctx.globalAlpha = p.life * 0.4
        ctx.fillStyle = '#c7d2fe'
        ctx.shadowColor = '#818cf8'
        ctx.shadowBlur = 4
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Draw ghost
      drawGhost(s.ghostX, s.ghostY, 16, 0.75, s.time, vx)

      animId = requestAnimationFrame(frame)
    }

    // Initialize ghost position
    const initial = getWaypoint(getScrollProgress())
    stateRef.current.ghostX = initial.x
    stateRef.current.ghostY = initial.y

    animId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 hidden md:block"
      aria-hidden="true"
    />
  )
}
