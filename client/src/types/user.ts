export type UserRole = 'student' | 'instructor' | 'admin'

export type AppUser = {
  user_id: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
  profile: {
    first_name: string
    last_name: string
    avatar_url: string | null
    bio?: string | null
    phone?: string | null
  } | null
}

export type UpdateUserPayload = {
  email?: string
  role?: UserRole
  is_active?: boolean
  first_name?: string
  last_name?: string
  avatar_url?: string
  bio?: string
  phone?: string
}
