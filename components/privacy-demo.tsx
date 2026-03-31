'use client'

import { useEffect, useRef, useState } from 'react'

interface Card {
  x: number
  y: number
  w: number
  h: number
  name: string
  match: string
  color: string
  revealed: boolean
  blurAmount: number
  targetBlur: number
  shakeX: number
  shakeY: number
  lockAlpha: number
}

export function PrivacyDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const mouseRef = useRef({ x: -999, y: -999 })

  const [activeUser, setActiveUser] = useState(0) // Which user perspective (0 = admin/spy, 1-3 = participants)

  const stateRef = useRef({
    cards: [] as Card[],
    time: 0,
    activeUser: 0,
    eyeX: -999,
    eyeY: -999,
    eyeTargetX: -999,
    eyeTargetY: -999,
  })

  useEffect(() => {
    stateRef.current.activeUser = activeUser
  }, [activeUser])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0

    const PEOPLE = [
      { name: 'Ana', match: 'Diego', color: '#818cf8' },
      { name: 'Carlos', match: 'Luna', color: '#f472b6' },
      { name: 'Luna', match: 'Ana', color: '#34d399' },
      { name: 'Diego', match: 'Carlos', color: '#fbbf24' },
    ]

    const buildCards = () => {
      const cardW = Math.min(W * 0.2, 110)
      const cardH = cardW * 1.35
      const gap = W * 0.04
      const totalW = PEOPLE.length * cardW + (PEOPLE.length - 1) * gap
      const startX = (W - totalW) / 2
      const startY = (H - cardH) / 2

      stateRef.current.cards = PEOPLE.map((p, i) => ({
        x: startX + i * (cardW + gap),
        y: startY,
        w: cardW,
        h: cardH,
        name: p.name,
        match: p.match,
        color: p.color,
        revealed: false,
        blurAmount: 0,
        targetBlur: 0,
        shakeX: 0,
        shakeY: 0,
        lockAlpha: 0,
      }))
    }

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
      buildCards()
    }

    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    const onMouseLeave = () => {
      mouseRef.current.x = -999
      mouseRef.current.y = -999
    }

    container.addEventListener('mousemove', onMouseMove)
    container.addEventListener('mouseleave', onMouseLeave)

    const drawEye = (cx: number, cy: number, size: number, lookX: number, lookY: number) => {
      // Eye white
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx, cy, size, size * 0.65, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1.5
      ctx.fill()
      ctx.stroke()

      // Iris
      const dx = lookX - cx
      const dy = lookY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const maxDist = size * 0.3
      const irisR = size * 0.38
      const irisX = cx + (dist > 0 ? (dx / dist) * Math.min(dist, maxDist) : 0)
      const irisY = cy + (dist > 0 ? (dy / dist) * Math.min(dist, maxDist) : 0)

      ctx.beginPath()
      ctx.arc(irisX, irisY, irisR, 0, Math.PI * 2)
      ctx.fillStyle = '#334155'
      ctx.fill()

      // Pupil
      ctx.beginPath()
      ctx.arc(irisX, irisY, irisR * 0.45, 0, Math.PI * 2)
      ctx.fillStyle = '#0f172a'
      ctx.fill()

      // Glint
      ctx.beginPath()
      ctx.arc(irisX - irisR * 0.2, irisY - irisR * 0.25, irisR * 0.18, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.fill()

      ctx.restore()
    }

    const drawCard = (card: Card, isOwner: boolean, t: number) => {
      ctx.save()

      const cx = card.x + card.w / 2 + card.shakeX
      const cy = card.y + card.h / 2 + card.shakeY

      // Card shadow
      ctx.shadowColor = 'rgba(0,0,0,0.08)'
      ctx.shadowBlur = 12
      ctx.shadowOffsetY = 4

      // Card body
      const r = 10
      ctx.beginPath()
      ctx.roundRect(card.x + card.shakeX, card.y + card.shakeY, card.w, card.h, r)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.strokeStyle = isOwner ? card.color : '#e2e8f0'
      ctx.lineWidth = isOwner ? 2 : 1
      ctx.stroke()

      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      // Color accent top
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(card.x + card.shakeX, card.y + card.shakeY, card.w, r * 2, [r, r, 0, 0])
      ctx.clip()
      ctx.fillStyle = card.color
      ctx.fillRect(card.x + card.shakeX, card.y + card.shakeY, card.w, 6)
      ctx.restore()

      // Avatar circle
      const avatarY = card.y + card.shakeY + card.h * 0.3
      const avatarR = Math.min(card.w * 0.18, 16)
      ctx.beginPath()
      ctx.arc(cx, avatarY, avatarR, 0, Math.PI * 2)
      ctx.fillStyle = card.color
      ctx.fill()

      // Initial
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${avatarR}px Inter, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(card.name[0]!, cx, avatarY + 1)

      // Name
      ctx.fillStyle = '#1e293b'
      ctx.font = `600 ${Math.max(11, card.w * 0.11)}px Inter, system-ui, sans-serif`
      ctx.fillText(card.name, cx, avatarY + avatarR + 16)

      // "Le regala a:" label
      const matchY = card.y + card.shakeY + card.h * 0.62
      ctx.fillStyle = '#94a3b8'
      ctx.font = `400 ${Math.max(9, card.w * 0.085)}px Inter, system-ui, sans-serif`
      ctx.fillText('Le regala a:', cx, matchY)

      // Match name - this is what gets hidden
      const matchNameY = matchY + 18

      if (isOwner) {
        // Visible with glow
        ctx.fillStyle = card.color
        ctx.font = `700 ${Math.max(13, card.w * 0.13)}px Inter, system-ui, sans-serif`
        ctx.fillText(card.match, cx, matchNameY)
      } else {
        // Blurred / hidden
        const blur = card.blurAmount

        if (blur > 0.1) {
          // Draw pixelated/distorted text
          ctx.save()
          ctx.globalAlpha = Math.max(0.15, 1 - blur)
          ctx.filter = `blur(${blur * 8}px)`
          ctx.fillStyle = '#94a3b8'
          ctx.font = `700 ${Math.max(13, card.w * 0.13)}px Inter, system-ui, sans-serif`
          ctx.fillText(card.match, cx, matchNameY)
          ctx.restore()

          // Lock icon
          if (card.lockAlpha > 0.05) {
            ctx.save()
            ctx.globalAlpha = card.lockAlpha

            const lockSize = Math.max(12, card.w * 0.12)
            const lockX = cx
            const lockY = matchNameY

            // Lock body
            ctx.fillStyle = '#ef4444'
            ctx.beginPath()
            ctx.roundRect(lockX - lockSize / 2, lockY - lockSize * 0.3, lockSize, lockSize * 0.7, 3)
            ctx.fill()

            // Lock shackle
            ctx.strokeStyle = '#ef4444'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(lockX, lockY - lockSize * 0.3, lockSize * 0.3, Math.PI, 0)
            ctx.stroke()

            ctx.restore()
          }
        } else {
          ctx.fillStyle = '#cbd5e1'
          ctx.font = `700 ${Math.max(13, card.w * 0.13)}px Inter, system-ui, sans-serif`
          ctx.fillText('• • • •', cx, matchNameY)
        }
      }

      // RLS badge at bottom
      if (!isOwner && card.blurAmount > 0.5) {
        ctx.save()
        ctx.globalAlpha = card.blurAmount
        const badgeY = card.y + card.shakeY + card.h - 18
        ctx.fillStyle = '#fef2f2'
        ctx.beginPath()
        ctx.roundRect(cx - 28, badgeY - 8, 56, 16, 8)
        ctx.fill()
        ctx.fillStyle = '#ef4444'
        ctx.font = `600 ${Math.max(8, card.w * 0.07)}px Inter, system-ui, sans-serif`
        ctx.fillText('RLS', cx, badgeY)
        ctx.restore()
      }

      ctx.restore()
    }

    const frame = (ts: number) => {
      const s = stateRef.current
      s.time = ts / 1000

      ctx.clearRect(0, 0, W, H)

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const isSpyMode = s.activeUser === 0

      // Smooth eye tracking
      s.eyeTargetX = mx > 0 ? mx : W / 2
      s.eyeTargetY = my > 0 ? my : H * 0.3
      s.eyeX += (s.eyeTargetX - s.eyeX) * 0.08
      s.eyeY += (s.eyeTargetY - s.eyeY) * 0.08

      // Update cards
      s.cards.forEach((card, i) => {
        const isOwner = s.activeUser === i + 1

        if (isSpyMode) {
          // Admin/spy mode: eye follows cursor, cards react
          const cardCX = card.x + card.w / 2
          const cardCY = card.y + card.h / 2
          const dist = Math.sqrt((mx - cardCX) ** 2 + (my - cardCY) ** 2)
          const proximity = Math.max(0, 1 - dist / (W * 0.25))

          card.targetBlur = mx > 0 ? proximity : 0
          card.blurAmount += (card.targetBlur - card.blurAmount) * 0.08

          // Shake when eye is close
          if (card.blurAmount > 0.3) {
            const intensity = card.blurAmount * 2
            card.shakeX = Math.sin(s.time * 20 + i * 2) * intensity
            card.shakeY = Math.cos(s.time * 25 + i * 3) * intensity * 0.6
          } else {
            card.shakeX *= 0.9
            card.shakeY *= 0.9
          }

          card.lockAlpha += ((card.blurAmount > 0.6 ? 1 : 0) - card.lockAlpha) * 0.1
        } else {
          // Participant view
          card.targetBlur = isOwner ? 0 : 1
          card.blurAmount += (card.targetBlur - card.blurAmount) * 0.06
          card.lockAlpha += ((isOwner ? 0 : 1) - card.lockAlpha) * 0.06
          card.shakeX *= 0.9
          card.shakeY *= 0.9
        }

        drawCard(card, isOwner, s.time)
      })

      // Draw spy eye in spy mode
      if (isSpyMode && mx > 0) {
        const eyeSize = 18
        drawEye(s.eyeX, s.eyeY - 30, eyeSize, mx, my)

        // "Espiando..." label
        ctx.save()
        ctx.globalAlpha = 0.6
        ctx.fillStyle = '#ef4444'
        ctx.font = '500 11px Inter, system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Espiando...', s.eyeX, s.eyeY - 30 + eyeSize + 14)
        ctx.restore()
      }

      // Instructions
      ctx.save()
      ctx.fillStyle = '#94a3b8'
      ctx.font = '500 12px Inter, system-ui, sans-serif'
      ctx.textAlign = 'center'
      if (isSpyMode) {
        ctx.fillText('Mueve el cursor para espiar — las cartas se protegen solas', W / 2, H - 16)
      } else {
        const name = PEOPLE[s.activeUser - 1]?.name
        ctx.fillText(`Vista de ${name}: solo puedes ver tu asignación`, W / 2, H - 16)
      }
      ctx.restore()

      animRef.current = requestAnimationFrame(frame)
    }

    animRef.current = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', onMouseMove)
      container.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <div className="mx-auto w-full max-w-[620px]">
      {/* Perspective switcher */}
      <div className="mb-3 flex items-center justify-center gap-2">
        <button
          onClick={() => setActiveUser(0)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
            activeUser === 0
              ? 'bg-red-100 text-red-700 ring-1 ring-red-200'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          👁 Espía
        </button>
        {['Ana', 'Carlos', 'Luna', 'Diego'].map((name, i) => (
          <button
            key={name}
            onClick={() => setActiveUser(i + 1)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              activeUser === i + 1
                ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80"
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
    </div>
  )
}
