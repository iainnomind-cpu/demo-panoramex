/**
 * NuevoProspectoModal.tsx — Panoramex CRM
 *
 * Full-featured form modal to create a new prospect and insert it
 * directly into the Supabase `prospects` table. RLS on the table
 * allows authenticated agents to insert; no service-role key needed.
 *
 * Fields: name, phone, tour_of_interest, desired_date, num_people,
 * origin_channel, assigned_to (admins only — non-admins are silently
 * assigned to themselves both on the frontend and enforced via a
 * BEFORE INSERT trigger on the backend).
 */

import React, { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui/Button'
import { Channel, CHANNEL_CONFIG } from '../../types'

interface NuevoProspectoModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormState {
  name: string
  phone: string
  tour_of_interest: string
  desired_date: string
  num_people: string
  origin_channel: Channel | ''
  assigned_to: string
}

const INITIAL_FORM: FormState = {
  name: '',
  phone: '',
  tour_of_interest: '',
  desired_date: '',
  num_people: '1',
  origin_channel: 'whatsapp',
  assigned_to: '',
}

/** Fetch agents list for the assigned_to dropdown (admin-only) */
function useAgents(enabled: boolean) {
  return useQuery({
    queryKey: ['agents'],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('id, full_name, role')
        .order('full_name')
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

/** Fetch tours list for the tour_of_interest dropdown */
function useTours() {
  return useQuery({
    queryKey: ['tours-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export const NuevoProspectoModal: React.FC<NuevoProspectoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const agent = useAuthStore((s) => s.agent)
  const queryClient = useQueryClient()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Role gate: only admins may assign a prospect to another agent.
  // Derived synchronously from the already-loaded authStore — no extra fetch.
  const isAdmin = agent?.role === 'admin'

  const { data: agents = [] } = useAgents(isAdmin)
  const { data: tours = [] } = useTours()

  const [form, setForm] = useState<FormState>({
    ...INITIAL_FORM,
    assigned_to: agent?.id ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Sync dialog open/close state with the native <dialog> element
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (isOpen) {
      if (!el.open) el.showModal()
      // Reset form each time modal opens
      setForm({ ...INITIAL_FORM, assigned_to: agent?.id ?? '' })
      setErrors({})
      setSubmitError(null)
      // Focus first input after paint
      requestAnimationFrame(() => firstInputRef.current?.focus())
    } else {
      if (el.open) el.close()
    }
  }, [isOpen, agent?.id])

  // Close on backdrop click (native dialog)
  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const handler = (e: MouseEvent) => {
      if (e.target === el) onClose()
    }
    el.addEventListener('click', handler)
    return () => el.removeEventListener('click', handler)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const { mutate: createProspect, isPending } = useMutation({
    mutationFn: async (payload: typeof form) => {
      // Non-admins: always assign to self, regardless of form state.
      // This mirrors the BEFORE INSERT trigger (00009_prospect_insert_assignment_guard.sql)
      // which raises an exception if a non-admin supplies a different UID.
      const effectiveAssignedTo = isAdmin
        ? (payload.assigned_to || null)
        : (agent?.id ?? null)

      const insertData = {
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        tour_of_interest: payload.tour_of_interest.trim() || null,
        desired_date: payload.desired_date || null,
        num_people: parseInt(payload.num_people, 10) || 1,
        origin_channel: payload.origin_channel || null,
        assigned_to: effectiveAssignedTo,
        status: 'nuevo',
        last_activity_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('prospects').insert(insertData)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
      onClose()
    },
    onError: (err) => {
      setSubmitError(err.message)
    },
  })

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.name.trim()) next.name = 'El nombre es obligatorio.'
    if (!form.phone.trim()) next.phone = 'El teléfono es obligatorio.'
    else if (!/^\+?[\d\s\-()]{7,20}$/.test(form.phone.trim()))
      next.phone = 'Formato de teléfono inválido.'
    if (!form.origin_channel) next.origin_channel = 'Selecciona un canal.'
    const n = parseInt(form.num_people, 10)
    if (isNaN(n) || n < 1) next.num_people = 'Mínimo 1 persona.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    if (!validate()) return
    createProspect(form)
  }

  const field = (name: keyof FormState) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [name]: e.target.value }))
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    },
  })

  const inputClass = (hasError?: string) =>
    `w-full rounded-md border py-2 px-3 text-sm text-on-surface bg-surface transition-colors focus:outline-none focus:ring-1 ${
      hasError
        ? 'border-error focus:border-error focus:ring-error'
        : 'border-outline-variant focus:border-primary focus:ring-primary'
    } placeholder:text-outline`

  return (
    // Wrapper prevents SSR issues; dialog is hidden until open
    <dialog
      ref={dialogRef}
      aria-labelledby="nuevo-prospecto-title"
      aria-modal="true"
      className="m-auto max-w-lg w-full rounded-2xl bg-surface p-0 shadow-modal border-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm animate-modal-in"
      style={{ maxHeight: '90dvh', overflow: 'auto' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant">
        <div>
          <h2
            id="nuevo-prospecto-title"
            className="text-xl font-bold text-on-surface"
          >
            Nuevo Prospecto
          </h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Completa los datos para registrar el prospecto.
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar modal"
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="np-name"
                className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5"
              >
                Nombre completo <span className="text-error">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="np-name"
                type="text"
                autoComplete="name"
                placeholder="María García López"
                maxLength={120}
                className={inputClass(errors.name)}
                {...field('name')}
              />
              {errors.name && (
                <p className="text-error text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="np-phone"
                className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5"
              >
                Teléfono <span className="text-error">*</span>
              </label>
              <input
                id="np-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+52 33 1234 5678"
                maxLength={25}
                className={inputClass(errors.phone)}
                {...field('phone')}
              />
              {errors.phone && (
                <p className="text-error text-xs mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Canal de origen */}
          <div>
            <label
              htmlFor="np-channel"
              className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5"
            >
              Canal de origen <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(Object.keys(CHANNEL_CONFIG) as Channel[]).map((ch) => {
                const cfg = CHANNEL_CONFIG[ch]
                const selected = form.origin_channel === ch
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, origin_channel: ch }))
                      if (errors.origin_channel)
                        setErrors((prev) => ({ ...prev, origin_channel: undefined }))
                    }}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      selected
                        ? 'border-primary bg-surface-container text-primary shadow-sm'
                        : 'border-outline-variant text-on-surface-variant hover:border-outline hover:bg-surface-container-low'
                    }`}
                    aria-pressed={selected}
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ color: selected ? cfg.color : undefined }}
                    >
                      {cfg.icon}
                    </span>
                    <span className="capitalize">{ch}</span>
                  </button>
                )
              })}
            </div>
            {errors.origin_channel && (
              <p className="text-error text-xs mt-1">{errors.origin_channel}</p>
            )}
          </div>

          {/* Tour de interés + Personas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label
                htmlFor="np-tour"
                className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5"
              >
                Tour de interés
              </label>
              <select
                id="np-tour"
                className={inputClass(errors.tour_of_interest)}
                value={form.tour_of_interest}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    tour_of_interest: e.target.value,
                  }))
                }
              >
                <option value="">— Sin tour específico —</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="np-pax"
                className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5"
              >
                Personas (pax)
              </label>
              <input
                id="np-pax"
                type="number"
                min={1}
                max={200}
                className={inputClass(errors.num_people)}
                {...field('num_people')}
              />
              {errors.num_people && (
                <p className="text-error text-xs mt-1">{errors.num_people}</p>
              )}
            </div>
          </div>

          {/* Fecha deseada + Asignado a */}
          {/* Grid is 2-col for admins (date + agent), full-width for agents (date only) */}
          <div className={`grid grid-cols-1 gap-4 ${isAdmin ? 'sm:grid-cols-2' : ''}`}>
            <div>
              <label
                htmlFor="np-date"
                className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5"
              >
                Fecha deseada
              </label>
              <input
                id="np-date"
                type="date"
                className={inputClass()}
                {...field('desired_date')}
              />
            </div>

            {/* Asignado a — only visible to admins */}
            {isAdmin && (
              <div>
                <label
                  htmlFor="np-agent"
                  className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5"
                >
                  Asignado a
                </label>
                <select
                  id="np-agent"
                  className={inputClass()}
                  value={form.assigned_to}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, assigned_to: e.target.value }))
                  }
                >
                  <option value="">— Sin asignar —</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name}
                      {a.id === agent?.id ? ' (Tú)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Server-level error */}
          {submitError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error"
            >
              <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-px">
                error
              </span>
              <span>{submitError}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            leftIcon={isPending ? undefined : 'person_add'}
          >
            {isPending ? 'Guardando...' : 'Crear Prospecto'}
          </Button>
        </div>
      </form>
    </dialog>
  )
}

export default NuevoProspectoModal
