export type AuthUser = {
  id: string
  email: string
  role: 'student' | 'instructor' | 'admin'
  is_active?: boolean
  profile?: {
    first_name: string
    last_name: string
    avatar_url: string | null
    bio?: string | null
    phone?: string | null
  } | null
}
