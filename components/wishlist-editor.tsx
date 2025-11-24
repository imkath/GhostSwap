"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LinkIcon, Save, Loader2, Check, ExternalLink, Trash2 } from "lucide-react"
import type { WishlistItem } from "@/lib/types"
import { cn } from "@/lib/utils"

interface WishlistEditorProps {
  groupId: string
  initialItems?: WishlistItem[]
  onSave?: () => void
}

interface LocalWishlistItem {
  id: string
  description: string
  url: string
}

export function WishlistEditor({ groupId, initialItems = [], onSave }: WishlistEditorProps) {
  const [items, setItems] = useState<LocalWishlistItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState("")

  // Initialize items from props or create empty slots
  useEffect(() => {
    if (initialItems.length > 0) {
      const mappedItems = initialItems.map((item, index) => ({
        id: item.id || `item-${index}`,
        description: item.description || "",
        url: item.url || ""
      }))
      // Pad to 5 items
      while (mappedItems.length < 5) {
        mappedItems.push({
          id: `new-${mappedItems.length}`,
          description: "",
          url: ""
        })
      }
      setItems(mappedItems.slice(0, 5))
    } else {
      setItems([
        { id: "new-0", description: "", url: "" },
        { id: "new-1", description: "", url: "" },
        { id: "new-2", description: "", url: "" },
        { id: "new-3", description: "", url: "" },
        { id: "new-4", description: "", url: "" },
      ])
    }
  }, [initialItems])

  const handleItemChange = (id: string, field: keyof LocalWishlistItem, value: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleClearItem = (id: string) => {
    setItems(items.map((item) =>
      item.id === id ? { ...item, description: "", url: "" } : item
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")

    // Validate: at least check for empty descriptions on items with URLs
    const invalidItems = items.filter(item => item.url && !item.description.trim())
    if (invalidItems.length > 0) {
      setError("Los artículos con URL deben tener una descripción")
      setIsSaving(false)
      return
    }

    try {
      const res = await fetch(`/api/groups/${groupId}/wishlist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items
            .filter(item => item.description.trim())
            .map(item => ({
              description: item.description.trim(),
              url: item.url.trim() || null
            }))
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Error al guardar la lista")
        return
      }

      setLastSaved(new Date())
      if (onSave) {
        onSave()
      }
    } catch {
      setError("Error de conexión")
    } finally {
      setIsSaving(false)
    }
  }

  const isValidUrl = (url?: string) => {
    if (!url || !url.trim()) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const filledItemsCount = items.filter(item => item.description.trim()).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">Mi Lista de Deseos</h3>
          <p className="text-sm text-slate-500">
            Agrega hasta 5 artículos para ayudar a tu Amigo Secreto. ¡Sé específico!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {filledItemsCount}/5 artículos
          </span>
          {lastSaved && (
            <span className="text-xs text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
              <Check className="w-3 h-3" /> Guardado
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group relative grid gap-2 p-4 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all"
          >
            <span className="absolute -left-2 -top-2 w-6 h-6 rounded-full bg-white text-xs flex items-center justify-center border border-slate-200 text-slate-500 font-mono shadow-sm">
              {index + 1}
            </span>

            <div className="grid md:grid-cols-[1fr,1fr] gap-3">
              <div className="space-y-1">
                <Label htmlFor={`desc-${item.id}`} className="sr-only">
                  Descripción
                </Label>
                <Input
                  id={`desc-${item.id}`}
                  placeholder="¿Qué te gustaría? (ej: Mouse Inalámbrico)"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                  className="bg-white border-slate-200 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Label htmlFor={`url-${item.id}`} className="sr-only">
                    URL
                  </Label>
                  <div className="relative">
                    <LinkIcon
                      className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                        isValidUrl(item.url) ? "text-emerald-500" : "text-slate-400",
                      )}
                    />
                    <Input
                      id={`url-${item.id}`}
                      placeholder="https://... (Opcional)"
                      value={item.url}
                      onChange={(e) => handleItemChange(item.id, "url", e.target.value)}
                      className={cn(
                        "pl-9 bg-white pr-9 border-slate-200 focus-visible:ring-indigo-500",
                        isValidUrl(item.url) &&
                          "border-emerald-500/50 focus-visible:ring-emerald-500/50 bg-emerald-50/10",
                      )}
                    />
                    {isValidUrl(item.url) && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
                {(item.description || item.url) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleClearItem(item.id)}
                    className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
