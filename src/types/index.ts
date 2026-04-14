// 全局类型定义

export interface User {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: 'user' | 'vip' | 'admin'
  status: 'active' | 'suspended' | 'deleted'
  credits: number
  totalCredits: number
  vipLevel: number
  vipExpiredAt: Date | null
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
}

export interface Project {
  id: string
  userId: string
  title: string
  description: string | null
  coverImage: string | null
  status: 'draft' | 'active' | 'completed' | 'archived'
  visibility: 'private' | 'public'
  aiModel: string
  viewCount: number
  likeCount: number
  createdAt: Date
  updatedAt: Date
  scripts?: Script[]
  characters?: Character[]
  _count?: {
    scripts: number
    characters: number
  }
}

export interface Script {
  id: string
  projectId: string
  userId: string
  title: string
  content: string
  genre: string | null
  style: string | null
  isAiGenerated: boolean
  aiModel: string | null
  prompt: string | null
  creditsCost: number
  version: number
  parentScriptId: string | null
  isShared: boolean
  shareCode: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Character {
  id: string
  projectId: string | null
  userId: string
  name: string
  description: string | null
  aliases: string | null
  profileData: string | null
  traits: string | null
  introduction: string | null
  voiceId: string | null
  voiceType: string | null
  customVoiceUrl: string | null
  isGlobal: boolean
  sourceGlobalCharacterId: string | null
  createdAt: Date
  updatedAt: Date
  appearances?: CharacterAppearance[]
}

export interface CharacterAppearance {
  id: string
  characterId: string
  appearanceIndex: number
  changeReason: string
  description: string | null
  descriptions: string | null
  imageUrl: string | null
  imageUrls: string | null
  selectedIndex: number
  previousImageUrl: string | null
  previousImageUrls: string | null
  previousDescription: string | null
  previousDescriptions: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Template {
  id: string
  creatorId: string
  name: string
  description: string | null
  category: 'script' | 'character' | 'scene' | 'style'
  tags: string[]
  content: string
  thumbnail: string | null
  isFree: boolean
  price: number
  creditsCost: number
  useCount: number
  likeCount: number
  status: 'draft' | 'active' | 'deprecated'
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
  isFavorited?: boolean
}

export interface CreditLog {
  id: string
  userId: string
  amount: number
  balance: number
  type: 'recharge' | 'consume' | 'gift' | 'refund' | 'expire' | 'vip_bonus'
  source: string | null
  sourceId: string | null
  description: string | null
  packageType: string | null
  expiredAt: Date | null
  createdAt: Date
}

export interface Payment {
  id: string
  userId: string
  orderNo: string
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: 'wechat' | 'alipay'
  transactionId: string | null
  prepaidId: string | null
  packageId: string | null
  packageType: string | null
  creditsAmount: number | null
  paidAt: Date | null
  refundedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  key: string
  prefix: string
  permissions: string[]
  rateLimit: number
  lastUsedAt: Date | null
  usageCount: number
  expiresAt: Date | null
  status: 'active' | 'revoked' | 'expired'
  createdAt: Date
}

export interface CreditPackage {
  id: string
  name: string
  credits: number
  price: number
  bonus: number
  validity: number
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// AI 相关
export interface AIModel {
  id: string
  name: string
  provider: string
  type: 'text' | 'image' | 'video'
  price: number
  maxTokens?: number
}

export interface AIGenerationResult {
  content: string
  inputTokens: number
  outputTokens: number
  credits: number
  model: string
  latency: number
}

// 表单类型
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  name: string
}

export interface ProjectForm {
  title: string
  description?: string
  aiModel?: string
  visibility?: 'private' | 'public'
}

export interface ScriptForm {
  title: string
  content: string
  genre?: string
  style?: string
}

export interface PaymentForm {
  amount: number
  paymentMethod: 'wechat' | 'alipay'
  packageId?: string
}

// ==================== 分镜系统 ====================

export interface Episode {
  id: string
  projectId: string
  episodeNumber: number
  title: string | null
  description: string | null
  novelText: string | null
  audioUrl: string | null
  srtContent: string | null
  speakerVoices: string | null
  status: 'draft' | 'processing' | 'completed'
  createdAt: Date
  updatedAt: Date
  clips?: Clip[]
  storyboards?: Storyboard[]
  project?: Project
}

export interface Clip {
  id: string
  episodeId: string
  clipNumber: number
  content: string
  summary: string | null
  screenplay: string | null
  startTime: number | null
  endTime: number | null
  duration: number | null
  location: string | null
  characters: string | null
  props: string | null
  createdAt: Date
  updatedAt: Date
  storyboard?: Storyboard
  episode?: Episode
}

export interface Storyboard {
  id: string
  episodeId: string
  clipId: string
  panelCount: number
  previewUrl: string | null
  photographyPlan: string | null
  createdAt: Date
  updatedAt: Date
  panels?: Panel[]
  clip?: Clip
  episode?: Episode
}

export interface Panel {
  id: string
  storyboardId: string
  panelIndex: number
  panelNumber: number | null
  shotType: string | null
  cameraMove: string | null
  description: string | null
  location: string | null
  characters: string | null
  props: string | null
  srtSegment: string | null
  srtStart: number | null
  srtEnd: number | null
  duration: number | null
  imagePrompt: string | null
  imageUrl: string | null
  imageStatus: 'pending' | 'processing' | 'completed' | 'failed'
  candidateUrls: string | null
  videoPrompt: string | null
  videoUrl: string | null
  videoStatus: 'pending' | 'processing' | 'completed' | 'failed'
  firstLastFramePrompt: string | null
  videoGenerationMode: 'normal' | 'firstlastframe' | null
  lipSyncTaskId: string | null
  lipSyncVideoUrl: string | null
  lipSyncStatus: 'pending' | 'processing' | 'completed' | 'failed' | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  storyboard?: Storyboard
}
