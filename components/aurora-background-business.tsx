'use client'

import { motion } from 'framer-motion'

type Variant = 1 | 2 | 3

interface OrbPosition {
  top?: string
  bottom?: string
  left?: string
  right?: string
  color: string
}

interface AuroraBackgroundBusinessProps {
  variant?: Variant
}

const variants: Record<Variant, { orb1: OrbPosition; orb2: OrbPosition; orb3: OrbPosition }> = {
  1: {
    orb1: { top: '-20%', left: '0%', color: 'bg-blue-700' },
    orb2: { top: '25%', right: '-5%', color: 'bg-blue-500' },
    orb3: { bottom: '0%', left: '30%', color: 'bg-blue-600' },
  },
  2: {
    orb1: { top: '10%', right: '-10%', color: 'bg-blue-600' },
    orb2: { bottom: '-15%', left: '10%', color: 'bg-blue-700' },
    orb3: { top: '-10%', left: '50%', color: 'bg-blue-500' },
  },
  3: {
    orb1: { bottom: '-20%', right: '20%', color: 'bg-blue-700' },
    orb2: { top: '-15%', left: '-5%', color: 'bg-blue-600' },
    orb3: { top: '40%', right: '-10%', color: 'bg-blue-500' },
  },
}

export function AuroraBackgroundBusiness({ variant = 1 }: AuroraBackgroundBusinessProps) {
  const v = variants[variant]

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
      role="presentation"
    >
      {/* Orb 1 */}
      <motion.div
        className={`absolute h-[700px] w-[700px] rounded-full ${v.orb1.color} opacity-50 blur-[60px]`}
        style={{ top: v.orb1.top, left: v.orb1.left, right: v.orb1.right, bottom: v.orb1.bottom }}
        animate={{
          x: [0, 40, -20, 20, 0],
          y: [0, -30, 20, -10, 0],
          scale: [1, 1.05, 0.95, 1.02, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Orb 2 */}
      <motion.div
        className={`absolute h-[550px] w-[550px] rounded-full ${v.orb2.color} opacity-45 blur-[60px]`}
        style={{ top: v.orb2.top, left: v.orb2.left, right: v.orb2.right, bottom: v.orb2.bottom }}
        animate={{
          x: [0, -50, 30, -20, 0],
          y: [0, 40, -30, 15, 0],
          scale: [1, 0.92, 1.08, 0.98, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Orb 3 */}
      <motion.div
        className={`absolute h-[500px] w-[500px] rounded-full ${v.orb3.color} opacity-40 blur-[60px]`}
        style={{ top: v.orb3.top, left: v.orb3.left, right: v.orb3.right, bottom: v.orb3.bottom }}
        animate={{
          x: [0, 35, -45, 25, 0],
          y: [0, -25, 35, -15, 0],
          scale: [1, 1.1, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
      />
    </div>
  )
}
