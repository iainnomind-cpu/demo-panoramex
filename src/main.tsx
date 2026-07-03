import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { initAuth } from './store/authStore'

// Initialise Supabase Auth session listener once at app startup
initAuth()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes — suitable for CRM data that
      // doesn't change every second but should stay reasonably up to date.
      staleTime: 5 * 60 * 1000,
      // Retry failed queries up to 3 times with exponential back-off.
      retry: 3,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
