import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { reducer } from '../use-toast'
import type { ToasterToast } from '../use-toast'

/**
 * El reducer es lógica pura: dado un estado y una acción, produce un estado
 * nuevo. Se testea sin montar componentes porque las reglas que importan
 * (límite de toasts, inmutabilidad, cierre selectivo) viven acá y no en el DOM.
 */

const makeToast = (id: string, extra: Partial<ToasterToast> = {}): ToasterToast => ({
  id,
  title: `Toast ${id}`,
  open: true,
  ...extra,
})

describe('reducer de use-toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('ADD_TOAST', () => {
    it('agrega un toast a un estado vacío', () => {
      const state = reducer({ toasts: [] }, { type: 'ADD_TOAST', toast: makeToast('1') })

      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].id).toBe('1')
    })

    it('respeta el límite de un toast visible descartando el más antiguo', () => {
      // TOAST_LIMIT es 1: al llegar uno nuevo, el anterior debe desaparecer.
      const conUno = reducer({ toasts: [] }, { type: 'ADD_TOAST', toast: makeToast('viejo') })
      const conDos = reducer(conUno, { type: 'ADD_TOAST', toast: makeToast('nuevo') })

      expect(conDos.toasts).toHaveLength(1)
      expect(conDos.toasts[0].id).toBe('nuevo')
    })

    it('coloca el toast más reciente al inicio de la lista', () => {
      const state = reducer(
        { toasts: [makeToast('anterior')] },
        { type: 'ADD_TOAST', toast: makeToast('reciente') }
      )

      expect(state.toasts[0].id).toBe('reciente')
    })

    it('no muta el estado recibido', () => {
      const original = { toasts: [] as ToasterToast[] }
      reducer(original, { type: 'ADD_TOAST', toast: makeToast('1') })

      expect(original.toasts).toHaveLength(0)
    })
  })

  describe('UPDATE_TOAST', () => {
    it('modifica solo el toast que coincide por id', () => {
      const inicial = { toasts: [makeToast('a'), makeToast('b')] }

      const state = reducer(inicial, {
        type: 'UPDATE_TOAST',
        toast: { id: 'a', title: 'Título nuevo' },
      })

      expect(state.toasts.find((t) => t.id === 'a')?.title).toBe('Título nuevo')
      expect(state.toasts.find((t) => t.id === 'b')?.title).toBe('Toast b')
    })

    it('conserva los campos que la actualización no menciona', () => {
      const inicial = { toasts: [makeToast('a', { description: 'original' })] }

      const state = reducer(inicial, {
        type: 'UPDATE_TOAST',
        toast: { id: 'a', title: 'Otro título' },
      })

      expect(state.toasts[0].description).toBe('original')
    })

    it('deja el estado intacto si el id no existe', () => {
      const inicial = { toasts: [makeToast('a')] }

      const state = reducer(inicial, {
        type: 'UPDATE_TOAST',
        toast: { id: 'inexistente', title: 'X' },
      })

      expect(state.toasts[0].title).toBe('Toast a')
    })
  })

  describe('DISMISS_TOAST', () => {
    it('marca como cerrado solo el toast indicado', () => {
      const inicial = { toasts: [makeToast('a'), makeToast('b')] }

      const state = reducer(inicial, { type: 'DISMISS_TOAST', toastId: 'a' })

      expect(state.toasts.find((t) => t.id === 'a')?.open).toBe(false)
      expect(state.toasts.find((t) => t.id === 'b')?.open).toBe(true)
    })

    it('cierra todos los toasts cuando no se pasa un id', () => {
      const inicial = { toasts: [makeToast('a'), makeToast('b')] }

      const state = reducer(inicial, { type: 'DISMISS_TOAST', toastId: undefined })

      expect(state.toasts.every((t) => t.open === false)).toBe(true)
    })

    it('cierra el toast pero no lo elimina de la lista', () => {
      // La distinción importa: cerrar dispara la animación de salida,
      // eliminar lo quita del DOM. Son dos acciones distintas.
      const inicial = { toasts: [makeToast('a')] }

      const state = reducer(inicial, { type: 'DISMISS_TOAST', toastId: 'a' })

      expect(state.toasts).toHaveLength(1)
    })
  })

  describe('REMOVE_TOAST', () => {
    it('elimina el toast indicado', () => {
      const inicial = { toasts: [makeToast('a'), makeToast('b')] }

      const state = reducer(inicial, { type: 'REMOVE_TOAST', toastId: 'a' })

      expect(state.toasts).toHaveLength(1)
      expect(state.toasts[0].id).toBe('b')
    })

    it('vacía la lista completa cuando no se pasa un id', () => {
      const inicial = { toasts: [makeToast('a'), makeToast('b')] }

      const state = reducer(inicial, { type: 'REMOVE_TOAST', toastId: undefined })

      expect(state.toasts).toEqual([])
    })

    it('no falla al eliminar un id que no existe', () => {
      const inicial = { toasts: [makeToast('a')] }

      const state = reducer(inicial, { type: 'REMOVE_TOAST', toastId: 'fantasma' })

      expect(state.toasts).toHaveLength(1)
    })
  })
})
