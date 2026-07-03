# Research: Core Auth & DB

## Decision 1: Frontend Data Fetching and Caching
- **Decision**: Use `@supabase/supabase-js` combined with `@tanstack/react-query` for data fetching and caching, replacing `src/data` mocks.
- **Rationale**: React Query provides powerful caching, automatic refetching, and integrates seamlessly with Supabase's promise-based client. It effectively manages server state, leaving Zustand for purely client-side global state (like UI toggles and local settings).
- **Alternatives considered**: `SWR` (similar, but React Query has a slightly more robust ecosystem for complex mutations), using `useEffect` + `Zustand` (reinventing the wheel for caching and loading states).

## Decision 2: Admin Operations & Service Role
- **Decision**: All admin operations (reassign prospects, update org_settings, edit catalog if not flagged) that require bypassing standard RLS or elevating privileges will be executed via Vercel Serverless Functions (`/api/...`) using the Supabase `service_role` key.
- **Rationale**: The constitution dictates no sensitive keys in the frontend. Using Vercel functions allows us to safely use the `service_role` key to perform administrative tasks while verifying the caller's JWT directly in the function.
- **Alternatives considered**: Supabase Edge Functions (Vercel Serverless is preferred as per the constitution / user prompt).

## Decision 3: Auth State Management
- **Decision**: Use Supabase's built-in session management with a Zustand store to reflect the current user session globally in the UI, and React Router for route guarding.
- **Rationale**: Simplifies route guards and conditional rendering without excessive prop drilling or context overhead. Zustand is already in the tech stack.
- **Alternatives considered**: React Context only (Zustand is explicitly in the constitution stack).
