// Zustand 全局状态管理
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Project, Template, CreditPackage } from '@/types'

// ==================== 用户状态 ====================
interface UserState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  updateCredits: (credits: number) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),
      
      updateCredits: (credits) => set((state) => ({
        user: state.user ? { ...state.user, credits } : null
      })),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// ==================== 项目状态 ====================
interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean
  
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (id: string, data: Partial<Project>) => void
  removeProject: (id: string) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  
  setProjects: (projects) => set({ projects }),
  
  setCurrentProject: (currentProject) => set({ currentProject }),
  
  addProject: (project) => set((state) => ({
    projects: [project, ...state.projects]
  })),
  
  updateProject: (id, data) => set((state) => ({
    projects: state.projects.map((p) => 
      p.id === id ? { ...p, ...data } : p
    ),
    currentProject: state.currentProject?.id === id 
      ? { ...state.currentProject, ...data }
      : state.currentProject
  })),
  
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject
  })),
}))

// ==================== UI 状态 ====================
interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  showNewUserGuide: boolean
  currentStep: number
  
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
  setShowNewUserGuide: (show: boolean) => void
  setCurrentStep: (step: number) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      showNewUserGuide: false,
      currentStep: 0,
      
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      
      setTheme: (theme) => set({ theme }),
      
      setShowNewUserGuide: (showNewUserGuide) => set({ showNewUserGuide }),
      
      setCurrentStep: (currentStep) => set({ currentStep }),
    }),
    {
      name: 'ui-storage',
    }
  )
)

// ==================== 支付状态 ====================
interface PaymentState {
  selectedPackage: CreditPackage | null
  paymentMethod: 'wechat' | 'alipay'
  orderNo: string | null
  qrCode: string | null
  
  setSelectedPackage: (pkg: CreditPackage | null) => void
  setPaymentMethod: (method: 'wechat' | 'alipay') => void
  setOrderInfo: (orderNo: string, qrCode: string) => void
  clearOrder: () => void
}

export const usePaymentStore = create<PaymentState>((set) => ({
  selectedPackage: null,
  paymentMethod: 'wechat',
  orderNo: null,
  qrCode: null,
  
  setSelectedPackage: (selectedPackage) => set({ selectedPackage }),
  
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  
  setOrderInfo: (orderNo, qrCode) => set({ orderNo, qrCode }),
  
  clearOrder: () => set({ 
    selectedPackage: null, 
    orderNo: null, 
    qrCode: null 
  }),
}))

// ==================== AI 生成状态 ====================
interface AIGenerationState {
  isGenerating: boolean
  progress: number
  error: string | null
  
  startGeneration: () => void
  updateProgress: (progress: number) => void
  setError: (error: string | null) => void
  finishGeneration: () => void
}

export const useAIGenerationStore = create<AIGenerationState>((set) => ({
  isGenerating: false,
  progress: 0,
  error: null,
  
  startGeneration: () => set({ 
    isGenerating: true, 
    progress: 0, 
    error: null 
  }),
  
  updateProgress: (progress) => set({ progress }),
  
  setError: (error) => set({ error, isGenerating: false }),
  
  finishGeneration: () => set({ 
    isGenerating: false, 
    progress: 100 
  }),
}))

// ==================== 模板状态 ====================
interface TemplateState {
  templates: Template[]
  featuredTemplates: Template[]
  selectedCategory: string
  
  setTemplates: (templates: Template[]) => void
  setFeaturedTemplates: (templates: Template[]) => void
  setSelectedCategory: (category: string) => void
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  featuredTemplates: [],
  selectedCategory: 'all',
  
  setTemplates: (templates) => set({ templates }),
  
  setFeaturedTemplates: (featuredTemplates) => set({ featuredTemplates }),
  
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
}))
