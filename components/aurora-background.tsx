"use client"

import { motion } from "framer-motion"

export function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Orb 1 - Indigo */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-indigo-500 opacity-60 blur-[50px]"
        style={{ top: "-10%", left: "10%" }}
        animate={{
          x: [0, 70, -40, 30, 0],
          y: [0, -50, 40, -20, 0],
          scale: [1, 1.15, 0.9, 1.05, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orb 2 - Violet */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-violet-400 opacity-55 blur-[50px]"
        style={{ top: "20%", right: "5%" }}
        animate={{
          x: [0, -80, 50, -30, 0],
          y: [0, 60, -40, 20, 0],
          scale: [1, 0.85, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* Orb 3 - Blue */}
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full bg-blue-300 opacity-50 blur-[50px]"
        style={{ bottom: "10%", left: "30%" }}
        animate={{
          x: [0, 60, -70, 40, 0],
          y: [0, -45, 55, -30, 0],
          scale: [1, 1.2, 0.85, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  )
}
