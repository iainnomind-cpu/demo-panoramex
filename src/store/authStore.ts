/**
 * authStore.ts — Panoramex CRM
 *
 * Zustand store for Supabase Auth session state.
 * Holds the current user session and the enriched agent profile
 * (including role and can_edit_catalog flag from the agents table).
 *
 * Session is initialised via initAuth() called once in main.tsx.
 * The onAuthStateChange listener keeps the store in sync with
 * Supabase Auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED).
 */

import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type AgentRow = Database['public']['Tables']['agents']['Row']

interface AuthState {
  /** Raw Supabase Auth session (null = unauthenticated) */
  session: Session | null
  /** Supabase Auth user object */
  user: User | null
  /** Enriched agent profile from the agents table */
  agent: AgentRow | null
  /** True while the initial session check is in progress */
  loading: boolean

  // Actions
  setSession: (session: Session | null) => void
  setAgent: (agent: AgentRow | null) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  agent: null,
  loading: true,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),

  setAgent: (agent) => set({ agent }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, agent: null })
  },
}))

/**
 * Fetches the agent profile from the agents table for the given user ID.
 * Called after a successful auth event to enrich the store with role data.
 */
async function fetchAndSetAgent(userId: string): Promise<void> {
  const { data, error } = await supabase
    .from('agents')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[AuthStore] Failed to fetch agent profile:', error.message)
    useAuthStore.getState().setAgent(null)
    return
  }

  useAuthStore.getState().setAgent(data)
}

/**
 * initAuth — Initialises the auth state from the existing session
 * and registers a listener for subsequent auth changes.
 *
 * Must be called ONCE at application startup (in main.tsx).
 * Returns the Subscription so it can be cleaned up if needed.
 */
export function initAuth() {
  // 1. Check for an existing session (e.g. page refresh)
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session)
    if (session?.user) {
      fetchAndSetAgent(session.user.id).finally(() => {
        useAuthStore.setState({ loading: false })
      })
    } else {
      useAuthStore.setState({ loading: false })
    }
  })

  // 2. Subscribe to future auth events
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      useAuthStore.getState().setSession(session)
      if (session?.user) {
        fetchAndSetAgent(session.user.id)
      } else {
        useAuthStore.getState().setAgent(null)
      }
    }
  )

  return subscription
}
