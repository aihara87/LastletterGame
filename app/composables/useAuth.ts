export interface Admin {
  username: string
  isLoggedIn: boolean
}

export const useAuth = () => {
  const admin = useState<Admin>('admin', () => ({
    username: '',
    isLoggedIn: false
  }))

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
  }

  const isAuthenticated = computed(() => admin.value.isLoggedIn)

  return {
    admin,
    login,
    logout,
    isAuthenticated
  }
}
