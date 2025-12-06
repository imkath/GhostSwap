'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, ShieldCheck, Palette, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const CONTACT_EMAIL = 'hello@kthcsk.me'

export function BusinessCTA() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(CONTACT_EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section
      className="border-t border-slate-200 bg-white py-20"
      aria-labelledby="business-cta-title"
    >
      <div className="container mx-auto max-w-4xl px-4 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-600">
          <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
          GhostSwap para Empresas
        </div>

        {/* Título */}
        <h2
          id="business-cta-title"
          className="mb-4 text-3xl font-bold tracking-tight text-slate-900"
        >
          ¿Te gustó la experiencia? <span className="text-indigo-600">Llévala a tu empresa.</span>
        </h2>

        {/* Descripción */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-600">
          Creamos una instancia privada vestida con tu marca. Ideal para equipos de RRHH que buscan
          organizar el intercambio de fin de año sin complicaciones.
        </p>

        {/* Features Grid */}
        <div className="mx-auto mb-10 grid max-w-3xl gap-6 text-left md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
              <Palette className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mb-1 font-semibold text-slate-900">Tu Branding</h3>
            <p className="text-sm leading-relaxed text-slate-500">
              Logo, colores y dominio personalizado para tu empresa.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mb-1 font-semibold text-slate-900">Acceso Seguro</h3>
            <p className="text-sm leading-relaxed text-slate-500">
              Solo empleados con correo corporativo pueden entrar.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <h3 className="mb-1 font-semibold text-slate-900">Soporte</h3>
            <p className="text-sm leading-relaxed text-slate-500">
              Te ayudamos con la configuración y gestión de grupos.
            </p>
          </div>
        </div>

        {/* Email + Copy Button */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-2 pr-2 pl-5 transition-colors hover:border-indigo-200 hover:bg-indigo-50/30">
          <span className="text-base font-medium text-slate-700 select-all">{CONTACT_EMAIL}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-8 w-[90px] justify-center gap-1.5 rounded-full bg-white text-sm shadow-sm hover:bg-slate-100"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="copied"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Copiado
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Escríbenos y te respondemos en menos de 24 horas
        </p>
      </div>
    </section>
  )
}
