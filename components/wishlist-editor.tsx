'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  LinkIcon,
  Save,
  Loader2,
  Check,
  ExternalLink,
  Trash2,
  Sparkles,
  Laptop,
  BookOpen,
  Shirt,
  Coffee,
  Plus,
  Gift,
  Heart,
  Music,
  Gamepad2,
  Home,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { toast } from 'sonner'

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

// Configuración de cada slot con placeholder, icono y categoría (hasta 10)
const wishlistSlots = [
  {
    placeholder: 'Ej: Unos audífonos bluetooth o accesorios para mi setup...',
    icon: Laptop,
    category: 'Tech/Hobby',
  },
  {
    placeholder: 'Ej: El último libro de Stephen King o una novela gráfica...',
    icon: BookOpen,
    category: 'Libros/Cultura',
  },
  {
    placeholder: 'Ej: Una polera negra talla M o calcetines divertidos...',
    icon: Shirt,
    category: 'Ropa/Estilo',
  },
  {
    placeholder: 'Ej: Una planta para mi escritorio o una vela aromática...',
    icon: Home,
    category: 'Decoración/Casa',
  },
  {
    placeholder: 'Ej: ¡Sorpréndeme! Me gustan los chocolates amargos...',
    icon: Sparkles,
    category: 'Comodín',
  },
  {
    placeholder: 'Ej: Entradas para un concierto o vinilos de mi banda favorita...',
    icon: Music,
    category: 'Música/Eventos',
  },
  {
    placeholder: 'Ej: Un juego de mesa o videojuego que quiero probar...',
    icon: Gamepad2,
    category: 'Gaming/Ocio',
  },
  {
    placeholder: 'Ej: Productos de skincare o accesorios de autocuidado...',
    icon: Heart,
    category: 'Autocuidado',
  },
  {
    placeholder: 'Ej: Una taza térmica o un set de café especial...',
    icon: Coffee,
    category: 'Café/Té',
  },
  {
    placeholder: 'Ej: Cualquier cosa que te inspire, ¡me encanta lo inesperado!...',
    icon: Gift,
    category: 'Sorpresa',
  },
]

const MAX_WISHLIST_ITEMS = 10
const DEFAULT_VISIBLE_ITEMS = 5

export function WishlistEditor({ memberId, initialItems = [], onSave }: WishlistEditorProps) {
  const [items, setItems] = useState<LocalWishlistItem[]>([])
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_ITEMS)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState('')

  // Initialize items from props or create empty slots
  useEffect(() => {
    if (initialItems.length > 0) {
      const mappedItems = initialItems.map((item, index) => ({
        id: `item-${index}`,
        description: item.description || '',
        url: item.url || '',
      }))
      // Pad to default visible items
      while (mappedItems.length < DEFAULT_VISIBLE_ITEMS) {
        mappedItems.push({
          id: `new-${mappedItems.length}`,
          description: '',
          url: '',
        })
      }
      setItems(mappedItems.slice(0, MAX_WISHLIST_ITEMS))
      // Set visible count based on how many items have content
      const filledCount = mappedItems.filter((item) => item.description.trim()).length
      setVisibleCount(Math.max(DEFAULT_VISIBLE_ITEMS, Math.min(filledCount, MAX_WISHLIST_ITEMS)))
    } else {
      // Create default visible items
      const defaultItems = Array.from({ length: DEFAULT_VISIBLE_ITEMS }, (_, i) => ({
        id: `new-${i}`,
        description: '',
        url: '',
      }))
      setItems(defaultItems)
    }
  }, [initialItems])

  // Extract URL from text that might contain extra words
  const extractUrl = (text: string): string => {
    const urlPattern =
      /https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}[^\s]*/gi
    const matches = text.match(urlPattern)
    if (matches && matches.length > 0) {
      let url = matches[0]
      // Remove trailing punctuation that's not part of URL
      url = url.replace(/[.,;:!?)>\]]+$/, '')
      return url
    }
    return text
  }

  const handleItemChange = (id: string, field: keyof LocalWishlistItem, value: string) => {
    // If changing URL field, extract the URL from text that might contain extra words
    const processedValue = field === 'url' ? extractUrl(value) : value
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: processedValue } : item)))
  }

  const handleClearItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, description: '', url: '' } : item)))
  }

  const handleAddMoreItems = () => {
    const newVisibleCount = Math.min(visibleCount + 1, MAX_WISHLIST_ITEMS)
    setVisibleCount(newVisibleCount)

    // If we need more items in the array, add them
    if (items.length < newVisibleCount) {
      const newItems = [...items]
      while (newItems.length < newVisibleCount) {
        newItems.push({
          id: `new-${newItems.length}`,
          description: '',
          url: '',
        })
      }
      setItems(newItems)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')

    // Validate: at least check for empty descriptions on items with URLs
    const invalidItems = items.filter((item) => item.url && !item.description.trim())
    if (invalidItems.length > 0) {
      setError('Los artículos con URL deben tener una descripción')
      setIsSaving(false)
      return
    }

    try {
      const supabase = createClient()

      const wishlistData = items
        .filter((item) => item.description.trim())
        .map((item) => ({
          description: item.description.trim(),
          url: item.url.trim() || undefined,
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
      toast.success('Lista de deseos guardada', {
        icon: <Sparkles className="h-4 w-4" />,
      })

      // Adjust visible count to match filled items (minimum 5)
      const filledCount = items.filter((item) => item.description.trim()).length
      const newVisibleCount = Math.max(DEFAULT_VISIBLE_ITEMS, filledCount)
      setVisibleCount(newVisibleCount)

      if (onSave) {
        onSave()
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setIsSaving(false)
    }
  }

  const isValidUrl = (url?: string) => {
    if (!url || !url.trim()) return false
    try {
      // Add https:// if missing for validation
      const urlToCheck = url.startsWith('http') ? url : `https://${url}`
      new URL(urlToCheck)
      return true
    } catch {
      return false
    }
  }

  const normalizeUrl = (url: string) => {
    return url.startsWith('http') ? url : `https://${url}`
  }

  const filledItemsCount = items.filter((item) => item.description.trim()).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">Mi Lista de Deseos</h3>
          <p className="text-sm text-slate-500">
            Agrega hasta 10 deseos para inspirar a tu Amigo Secreto
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{filledItemsCount}/10</span>
          {lastSaved && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-600">
              <Check className="h-3 w-3" /> Guardado
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {items.slice(0, visibleCount).map((item, index) => {
          const slot = wishlistSlots[index]
          const SlotIcon = slot.icon

          return (
            <div
              key={item.id}
              className="group relative rounded-xl bg-slate-50 p-4 transition-all duration-200 hover:bg-white hover:shadow-md"
            >
              <div className="space-y-3">
                {/* Input principal con icono */}
                <div className="relative flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition-colors group-hover:text-indigo-500">
                    <SlotIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`desc-${item.id}`} className="sr-only">
                      Descripción
                    </Label>
                    <Input
                      id={`desc-${item.id}`}
                      placeholder={slot.placeholder}
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="h-10 border-slate-200 bg-white focus-visible:ring-indigo-500"
                    />
                  </div>
                  {(item.description || item.url) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleClearItem(item.id)}
                      className="h-8 w-8 flex-shrink-0 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
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
                          'absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 transition-colors',
                          isValidUrl(item.url) ? 'text-emerald-500' : 'text-slate-300'
                        )}
                      />
                      <Input
                        id={`url-${item.id}`}
                        placeholder="Pegar enlace (opcional)"
                        value={item.url}
                        onChange={(e) => handleItemChange(item.id, 'url', e.target.value)}
                        className={cn(
                          'h-8 border-slate-200 bg-white/80 pr-9 pl-9 text-sm placeholder:text-slate-400 focus-visible:ring-indigo-500',
                          isValidUrl(item.url) &&
                            'border-emerald-500/50 bg-emerald-50/30 focus-visible:ring-emerald-500/50'
                        )}
                      />
                      {isValidUrl(item.url) && (
                        <a
                          href={normalizeUrl(item.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute top-1/2 right-3 z-10 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Botón para agregar más items */}
        {visibleCount < MAX_WISHLIST_ITEMS && (
          <button
            type="button"
            onClick={handleAddMoreItems}
            className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-500 transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm transition-colors group-hover:text-indigo-500">
              <Plus className="h-4 w-4" />
            </div>
            <span className="font-medium">Agregar otro deseo</span>
          </button>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Guardar Lista
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
