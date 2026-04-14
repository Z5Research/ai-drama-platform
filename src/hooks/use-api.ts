// API Hooks using React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
interface User {
  id: string
  email: string
  name?: string
  role?: string
  credits?: number
}

interface Project {
  id: string
  title: string
  description?: string
  status: string
  workflowStage: string
  createdAt: string
}

// Auth Hooks
export function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<{ success: boolean; user?: User }> => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) throw new Error('Unauthorized')
      return res.json()
    },
    staleTime: 5 * 60 * 1000, // 5分钟内不重新请求
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      if (!res.ok) throw new Error('Login failed')
      return res.json()
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(['auth', 'me'], data)
        queryClient.invalidateQueries({ queryKey: ['auth'] })
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

// Projects Hooks
export function useProjects(options?: { limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['projects', options],
    queryFn: async (): Promise<Project[]> => {
      const params = new URLSearchParams()
      if (options?.limit) params.set('limit', options.limit.toString())
      if (options?.status) params.set('status', options.status)
      
      const res = await fetch(`/api/projects?${params}`)
      if (!res.ok) throw new Error('Failed to fetch projects')
      const data = await res.json()
      return data.projects || []
    },
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async (): Promise<Project> => {
      const res = await fetch(`/api/projects/${id}`)
      if (!res.ok) throw new Error('Failed to fetch project')
      const data = await res.json()
      return data.project
    },
    enabled: !!id,
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (project: Partial<Project>) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      })
      if (!res.ok) throw new Error('Failed to create project')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Characters Hooks
export function useCharacters(projectId?: string) {
  return useQuery({
    queryKey: ['characters', projectId],
    queryFn: async () => {
      const params = projectId ? `?projectId=${projectId}` : ''
      const res = await fetch(`/api/characters${params}`)
      if (!res.ok) throw new Error('Failed to fetch characters')
      const data = await res.json()
      return data.characters || []
    },
  })
}

// Credits Hooks
export function useCredits() {
  return useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      const res = await fetch('/api/credits/stats')
      if (!res.ok) throw new Error('Failed to fetch credits')
      return res.json()
    },
    staleTime: 30 * 1000, // 30秒
  })
}

// Templates Hooks
export function useTemplates(category?: string) {
  return useQuery({
    queryKey: ['templates', category],
    queryFn: async () => {
      const params = category ? `?category=${category}` : ''
      const res = await fetch(`/api/templates${params}`)
      if (!res.ok) throw new Error('Failed to fetch templates')
      const data = await res.json()
      return data.templates || []
    },
    staleTime: 5 * 60 * 1000, // 5分钟
  })
}

// Admin Hooks
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    staleTime: 60 * 1000, // 1分钟
  })
}

export function useAdminUsers(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['admin', 'users', page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?page=${page}&limit=${limit}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json()
    },
  })
}
