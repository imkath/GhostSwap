"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LinkIcon, Save, Loader2, Check, ExternalLink, Trash2, Sparkles, Laptop, BookOpen, Shirt, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { toast } from "sonner"

interface WishlistEditorProps {
  groupId: string
  memberId: string
  initialItems?: Array<{ description: string; url?: string }>
  onSave?: () => void
}

interface LocalWishlistItem {
  id: string
  description: string
  url: string
}

// Configuración de cada slot con placeholder, icono y categoría
const wishlistSlots = [
  {
    placeholder: "Ej: Unos audífonos bluetooth o accesorios para mi setup...",
    icon: Laptop,
    category: "Tech/Hobby"
  },
  {
    placeholder: "Ej: El último libro de Stephen King o una novela gráfica...",
    icon: BookOpen,
    category: "Libros/Cultura"
  },
  {
    placeholder: "Ej: Una polera negra talla M o calcetines divertidos...",
    icon: Shirt,
    category: "Ropa/Estilo"
  },
  {
    placeholder: "Ej: Una planta para mi escritorio o una vela aromática...",
    icon: Coffee,
    category: "Decoración/Casa"
  },
  {
    placeholder: "Ej: ¡Sorpréndeme! Me gustan los chocolates amargos...",
    icon: Sparkles,
    category: "Comodín"
  }
]

export function WishlistEditor({ groupId, memberId, initialItems = [], onSave }: WishlistEditorProps) {
  const [items, setItems] = useState<LocalWishlistItem[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState("")

  // Initialize items from props or create empty slots
  useEffect(() => {
    if (initialItems.length > 0) {
      const mappedItems = initialItems.map((item, index) => ({
        id: `item-${index}`,
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
      const supabase = createClient()

      const wishlistData = items
        .filter(item => item.description.trim())
        .map(item => ({
          description: item.description.trim(),
          url: item.url.trim() || undefined
        }))

      const { error: updateError } = await supabase
        .from('members')
        .update({ wishlist: wishlistData })
        .eq('id', memberId)

      if (updateError) {
        setError(updateError.message)
        return
      }

      setLastSaved(new Date())
      toast.success("Lista de deseos guardada", {
        icon: <Sparkles className="w-4 h-4" />,
      })
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
            Agrega hasta 5 deseos para inspirar a tu Amigo Secreto
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {filledItemsCount}/5
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
        {items.map((item, index) => {
          const slot = wishlistSlots[index]
          const SlotIcon = slot.icon

          return (
            <div
              key={item.id}
              className="group relative p-4 rounded-xl bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <div className="space-y-3">
                {/* Input principal con icono */}
                <div className="relative flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                    <SlotIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`desc-${item.id}`} className="sr-only">
                      Descripción
                    </Label>
                    <Input
                      id={`desc-${item.id}`}
                      placeholder={slot.placeholder}
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                      className="bg-white border-slate-200 focus-visible:ring-indigo-500 h-10"
                    />
                  </div>
                  {(item.description || item.url) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleClearItem(item.id)}
                      className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Input de URL secundario */}
                <div className="pl-11">
                  <div className="relative">
                    <Label htmlFor={`url-${item.id}`} className="sr-only">
                      URL
                    </Label>
                    <div className="relative">
                      <LinkIcon
                        className={cn(
                          "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors",
                          isValidUrl(item.url) ? "text-emerald-500" : "text-slate-300",
                        )}
                      />
                      <Input
                        id={`url-${item.id}`}
                        placeholder="Pegar enlace (opcional)"
                        value={item.url}
                        onChange={(e) => handleItemChange(item.id, "url", e.target.value)}
                        className={cn(
                          "pl-9 pr-9 h-8 text-sm bg-white/80 border-slate-200 focus-visible:ring-indigo-500 placeholder:text-slate-400",
                          isValidUrl(item.url) &&
                            "border-emerald-500/50 focus-visible:ring-emerald-500/50 bg-emerald-50/30",
                        )}
                      />
                      {isValidUrl(item.url) && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
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
              Guardar Lista
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
