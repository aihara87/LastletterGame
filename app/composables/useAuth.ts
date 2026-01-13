export interface Admin {
  username: string
  isLoggedIn: boolean
}

export const useAuth = () => {
  // Use cookie for session management with 1 hour expiration
  const admin = useCookie<Admin>('admin_session', {
    maxAge: 3600, // 1 hour in seconds
    sameSite: 'lax',
    default: () => ({
      username: '',
      isLoggedIn: false
    })
  })

  // Default admin credentials (in production, use encrypted password)
  const DEFAULT_USERNAME = 'admin'
  const DEFAULT_PASSWORD = 'admin123'

  const login = (username: string, password: string): boolean => {
    if (username === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      admin.value = {
        username,
        isLoggedIn: true
      }
      return true
    }
    return false
  }

  const logout = () => {
    admin.value = {
      username: '',
      isLoggedIn: false
    }
    // Optional: clear cookie explicitly if needed, but setting value works
    // const cookie = useCookie('admin_session')
    // cookie.value = null 
  }

  const isAuthenticated = computed(() => admin.value.isLoggedIn)

  return {
    admin,
    login,
    logout,
    isAuthenticated
  }
}

