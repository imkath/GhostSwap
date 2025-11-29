"use client"

import { motion } from "framer-motion"

export function SectionAurora() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true" role="presentation">
      {/* Violet orb - top right */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-violet-400 opacity-30 blur-[80px]"
        animate={{
          x: [0, 50, -30, 20, 0],
          y: [0, -40, 30, -20, 0],
          scale: [1, 1.1, 0.95, 1.05, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ top: "10%", right: "5%" }}
      />

      {/* Blue orb - center */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-blue-400 opacity-25 blur-[80px]"
        animate={{
          x: [0, -60, 40, -20, 0],
          y: [0, 30, -50, 40, 0],
          scale: [1, 0.9, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{ top: "40%", left: "40%" }}
      />

      {/* Indigo orb - bottom left */}
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full bg-indigo-400 opacity-25 blur-[80px]"
        animate={{
          x: [0, 70, -40, 30, 0],
          y: [0, -30, 60, -40, 0],
          scale: [1, 1.05, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        style={{ bottom: "10%", left: "10%" }}
      />
    </div>
  )
}
