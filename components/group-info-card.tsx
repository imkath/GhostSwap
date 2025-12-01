'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Wallet, Hash, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface GroupInfoCardProps {
  budget: number | null
  currency?: string
  exchangeDate: string | null
  inviteCode?: string
}

export function GroupInfoCard({
  budget,
  currency = 'CLP',
  exchangeDate,
  inviteCode,
}: GroupInfoCardProps) {
  const [codeCopied, setCodeCopied] = useState(false)

  if (!budget && !exchangeDate && !inviteCode) return null

  const handleCopyCode = async () => {
    if (!inviteCode) return
    try {
      await navigator.clipboard.writeText(inviteCode)
      setCodeCopied(true)
      toast.success('Código copiado')
      setTimeout(() => setCodeCopied(false), 2000)
    } catch {
      toast.error('Error al copiar')
    }
  }

  // Parse date string as local date to avoid timezone issues
  // "2024-12-24" should be Dec 24, not Dec 23 due to UTC conversion
  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const formatDate = (dateString: string) => {
    const date = parseLocalDate(dateString)
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  }

  const getDaysUntil = (dateString: string) => {
    const date = parseLocalDate(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatCurrency = (amount: number, currencyCode: string) => {
    // Map currency codes to their symbols
    const currencySymbols: Record<string, string> = {
      CLP: '$',
      USD: 'US$',
      EUR: '€',
      MXN: 'MX$',
      ARS: 'AR$',
      COP: 'COL$',
      PEN: 'S/',
      BRL: 'R$',
      GBP: '£',
    }

    const symbol = currencySymbols[currencyCode] || currencyCode

    // Format number with locale-specific separators
    const formattedAmount = amount.toLocaleString('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

    return `${symbol}${formattedAmount}`
  }

  const getCurrencyFlag = (currencyCode: string) => {
    const currencyFlags: Record<string, string> = {
      CLP: '🇨🇱',
      USD: '🇺🇸',
      EUR: '🇪🇺',
      MXN: '🇲🇽',
      ARS: '🇦🇷',
      COP: '🇨🇴',
      PEN: '🇵🇪',
      BRL: '🇧🇷',
      GBP: '🇬🇧',
    }
    return currencyFlags[currencyCode] || '💰'
  }

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Budget */}
          {budget && (
            <div className="rounded-xl bg-white/60 p-4 text-center backdrop-blur-sm">
              <div className="mb-2 inline-flex rounded-full bg-emerald-100 p-2.5 text-emerald-600">
                <Wallet className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {formatCurrency(budget, currency)}
              </p>
              <p className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-500">
                <span>{getCurrencyFlag(currency)}</span>
                <span>Presupuesto</span>
              </p>
            </div>
          )}

          {/* Date */}
          {exchangeDate && (
            <div className="rounded-xl bg-white/60 p-4 text-center backdrop-blur-sm">
              <div className="mb-2 inline-flex rounded-full bg-rose-100 p-2.5 text-rose-600">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="text-lg font-bold text-slate-900 capitalize">
                {formatDate(exchangeDate)}
              </p>
              {getDaysUntil(exchangeDate) >= 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  {getDaysUntil(exchangeDate) === 0
                    ? '¡Es hoy!'
                    : getDaysUntil(exchangeDate) === 1
                      ? 'Mañana'
                      : `En ${getDaysUntil(exchangeDate)} días`}
                </p>
              )}
            </div>
          )}

          {/* Invite Code */}
          {inviteCode && (
            <div
              className="cursor-pointer rounded-xl bg-white/60 p-4 text-center backdrop-blur-sm transition-colors hover:bg-white/80"
              onClick={handleCopyCode}
              title="Clic para copiar código"
            >
              <div className="mb-2 inline-flex rounded-full bg-indigo-100 p-2.5 text-indigo-600">
                <Hash className="h-5 w-5" />
              </div>
              <p className="flex items-center justify-center gap-1 font-mono text-lg font-bold text-slate-900">
                {inviteCode}
                {codeCopied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4 text-slate-400" />
                )}
              </p>
              <p className="mt-1 text-xs text-slate-500">Código de invitación</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
