"use client"

import { motion } from "framer-motion"
import { Heart, Shield, Zap } from "lucide-react"

export function AnimatedFeatures() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
        <motion.div
          className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 mb-4"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Heart className="w-5 h-5" />
        </motion.div>
        <h3 className="font-semibold text-slate-900 mb-2">Totalmente gratis</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          Sin costos ocultos, sin versiones premium. Funcionalidad completa para todos.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
        <motion.div
          className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4"
          animate={{
            scale: [1, 1.05, 1],
            y: [0, -3, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <Shield className="w-5 h-5" />
        </motion.div>
        <h3 className="font-semibold text-slate-900 mb-2">Tu privacidad importa</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          No vendemos ni compartimos tus datos. Tu información está segura.
        </p>
      </div>

      <div className="p-6 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
        <motion.div
          className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 mb-4"
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        >
          <Zap className="w-5 h-5" />
        </motion.div>
        <h3 className="font-semibold text-slate-900 mb-2">Sin spam</h3>
        <p className="text-slate-500 text-sm leading-relaxed">
          Solo notificaciones esenciales. Nada de correos innecesarios.
        </p>
      </div>
    </div>
  )
}
