'use client'

import { useEffect, useRef } from 'react'

export function GhostScrollGuide() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef({
    progress: 0,
    ghostScreenY: 0,
    time: 0,
    particles: [] as {
      x: number
      y: number
      vx: number
      vy: number
      life: number
      size: number
    }[],
    lastEmit: 0,
    velocity: 0,
    lastProgress: 0,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Hide on mobile — too narrow
    const mql = window.matchMedia('(min-width: 768px)')
    if (!mql.matches) {
      canvas.style.display = 'none'
      const onChange = () => {
        canvas.style.display = mql.matches ? 'block' : 'none'
      }
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    const CW = 44 // canvas width
    let CH = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      CH = window.innerHeight
      canvas.width = CW * dpr
      canvas.height = CH * dpr
      canvas.style.width = CW + 'px'
      canvas.style.height = CH + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const getScrollProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      return docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0
    }

    // Gentle wave for path
    const getPathX = (t: number) => {
      return CW / 2 + Math.sin(t * Math.PI * 4) * 6 + Math.sin(t * Math.PI * 1.5) * 3
    }

    const drawGhost = (x: number, y: number, size: number, alpha: number, time: number) => {
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(x, y)

      const bob = Math.sin(time * 3) * 1.5
      ctx.translate(0, bob)
      ctx.rotate(Math.sin(time * 2) * 0.06)

      const s = size

      // Glow
      ctx.shadowColor = '#818cf8'
      ctx.shadowBlur = 14

      // Ghost body
      ctx.beginPath()
      ctx.moveTo(-s * 0.5, s * 0.15)
      ctx.bezierCurveTo(-s * 0.5, -s * 0.55, s * 0.5, -s * 0.55, s * 0.5, s * 0.15)
      ctx.lineTo(s * 0.5, s * 0.4)
      ctx.bezierCurveTo(s * 0.35, s * 0.25, s * 0.2, s * 0.5, s * 0.1, s * 0.35)
      ctx.bezierCurveTo(0, s * 0.5, -0.1 * s, s * 0.3, -s * 0.2, s * 0.45)
      ctx.bezierCurveTo(-s * 0.3, s * 0.3, -s * 0.4, s * 0.5, -s * 0.5, s * 0.4)
      ctx.closePath()

      const grad = ctx.createLinearGradient(0, -s * 0.5, 0, s * 0.5)
      grad.addColorStop(0, 'rgba(129, 140, 248, 0.92)')
      grad.addColorStop(1, 'rgba(99, 102, 241, 0.72)')
      ctx.fillStyle = grad
      ctx.fill()

      ctx.shadowBlur = 0

      // Eyes
      const eyeY = -s * 0.1
      const sp = s * 0.17
      ctx.fillStyle = '#1e1b4b'
      ctx.beginPath()
      ctx.arc(-sp, eyeY, s * 0.07, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(sp, eyeY, s * 0.07, 0, Math.PI * 2)
      ctx.fill()

      // Glints
      ctx.fillStyle = 'rgba(255,255,255,0.85)'
      ctx.beginPath()
      ctx.arc(-sp - s * 0.02, eyeY - s * 0.025, s * 0.025, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(sp - s * 0.02, eyeY - s * 0.025, s * 0.025, 0, Math.PI * 2)
      ctx.fill()

      // Cheeks
      ctx.globalAlpha = alpha * 0.25
      ctx.fillStyle = '#f472b6'
      ctx.beginPath()
      ctx.arc(-sp - s * 0.07, eyeY + s * 0.07, s * 0.05, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(sp + s * 0.07, eyeY + s * 0.07, s * 0.05, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const frame = (ts: number) => {
      const s = stateRef.current
      s.time = ts / 1000

      const rawProgress = getScrollProgress()
      s.velocity = rawProgress - s.lastProgress
      s.lastProgress = rawProgress
      s.progress += (rawProgress - s.progress) * 0.1

      ctx.clearRect(0, 0, CW, CH)

      // Ghost position on screen (fixed viewport)
      const margin = 56
      const targetY = margin + s.progress * (CH - margin * 2)
      s.ghostScreenY += (targetY - s.ghostScreenY) * 0.07

      const ghostX = getPathX(s.progress)

      // Draw trail line (dotted, fading up)
      const trailLengthPx = Math.min(s.ghostScreenY - margin, 200)
      if (trailLengthPx > 10) {
        const steps = Math.floor(trailLengthPx / 3)
        for (let i = 0; i < steps; i++) {
          const frac = i / steps
          const ty = s.ghostScreenY - frac * trailLengthPx
          const tProgress = s.progress - frac * (trailLengthPx / (CH - margin * 2))
          const tx = getPathX(Math.max(0, tProgress))
          const alpha = (1 - frac) * 0.35

          ctx.beginPath()
          ctx.arc(tx, ty, 1.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`
          ctx.fill()
        }

        // Bright glow near head
        const glowSteps = Math.min(25, steps)
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(ghostX, s.ghostScreenY)
        for (let i = 0; i < glowSteps; i++) {
          const frac = i / glowSteps
          const ty = s.ghostScreenY - frac * Math.min(60, trailLengthPx)
          const tProgress = s.progress - frac * (60 / (CH - margin * 2))
          const tx = getPathX(Math.max(0, tProgress))
          ctx.lineTo(tx, ty)
        }
        ctx.strokeStyle = 'rgba(129, 140, 248, 0.2)'
        ctx.lineWidth = 3
        ctx.shadowColor = '#818cf8'
        ctx.shadowBlur = 8
        ctx.stroke()
        ctx.restore()
      }

      // Particles — emit when scrolling
      const isScrolling = Math.abs(s.velocity) > 0.001
      if (isScrolling && s.time - s.lastEmit > 0.05) {
        s.lastEmit = s.time
        const count = Math.min(3, Math.ceil(Math.abs(s.velocity) * 200))
        for (let i = 0; i < count; i++) {
          s.particles.push({
            x: ghostX + (Math.random() - 0.5) * 8,
            y: s.ghostScreenY + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.4 - Math.sign(s.velocity) * 0.3,
            life: 1,
            size: 1 + Math.random() * 1.5,
          })
        }
      }

      // Update & draw particles
      s.particles = s.particles.filter((p) => p.life > 0)
      s.particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.025

        ctx.save()
        ctx.globalAlpha = p.life * 0.5
        ctx.fillStyle = '#a5b4fc'
        ctx.shadowColor = '#818cf8'
        ctx.shadowBlur = 3
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Draw ghost
      drawGhost(ghostX, s.ghostScreenY, 11, 0.85, s.time)

      // Progress dots at quartiles
      ;[0.25, 0.5, 0.75].forEach((pct) => {
        const dotY = margin + pct * (CH - margin * 2)
        const passed = s.progress > pct - 0.02

        ctx.save()
        ctx.beginPath()
        ctx.arc(CW / 2, dotY, passed ? 3 : 2, 0, Math.PI * 2)
        ctx.fillStyle = passed ? 'rgba(129, 140, 248, 0.5)' : 'rgba(148, 163, 184, 0.15)'
        if (passed) {
          ctx.shadowColor = '#818cf8'
          ctx.shadowBlur = 6
        }
        ctx.fill()
        ctx.restore()
      })

      animId = requestAnimationFrame(frame)
    }

    animId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed top-0 left-0 z-50 hidden md:block"
      aria-hidden="true"
    />
  )
}
