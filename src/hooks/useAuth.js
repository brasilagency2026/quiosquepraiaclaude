import { useQuery } from 'convex/react'
import { useUser } from '@clerk/clerk-react'
import { api } from '../../convex/_generated/api'

// Auth par PIN pour les funcionários
export function useAuthPIN() {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('praiapp_pin_token')
    : null
  const session = useQuery(
    api.pinAuth.verificarSession,
    token ? { token } : 'skip'
  )
  return {
    session,
    isLoading: session === undefined,
    isAuth: session !== null && session !== undefined,
    logout: () => {
      localStorage.removeItem('praiapp_pin_token')
      window.location.href = '/scan'
    }
  }
}

// Auth Clerk pour gestor
export function useAuthGestor() {
  const { user, isLoaded, isSignedIn } = useUser()
  return { user, isLoaded, isSignedIn }
}

// Savoir si on est super admin (Clerk)
export function useIsSuperAdmin() {
  const { user, isLoaded } = useUser()
  const SUPER_ADMIN_IDS = (import.meta.env.VITE_SUPER_ADMIN_ID || '').split(',')
  return {
    isLoaded,
    isSuperAdmin: isLoaded && user && SUPER_ADMIN_IDS.includes(user.id)
  }
}
