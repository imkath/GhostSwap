"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Wallet } from "lucide-react"

interface GroupInfoCardProps {
  budget: number | null
  exchangeDate: string | null
}

export function GroupInfoCard({ budget, exchangeDate }: GroupInfoCardProps) {
  if (!budget && !exchangeDate) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long"
    })
  }

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Budget */}
          {budget && (
            <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm">
              <div className="inline-flex p-2.5 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                <Wallet className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-slate-900">${budget}</p>
              <p className="text-xs text-slate-500 mt-1">Presupuesto</p>
            </div>
          )}

          {/* Date */}
          {exchangeDate && (
            <div className="text-center p-4 rounded-xl bg-white/60 backdrop-blur-sm">
              <div className="inline-flex p-2.5 rounded-full bg-rose-100 text-rose-600 mb-2">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-lg font-bold text-slate-900 capitalize">
                {formatDate(exchangeDate)}
              </p>
              {getDaysUntil(exchangeDate) >= 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  {getDaysUntil(exchangeDate) === 0
                    ? "¡Es hoy!"
                    : getDaysUntil(exchangeDate) === 1
                    ? "Mañana"
                    : `En ${getDaysUntil(exchangeDate)} días`}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
