// 缓存系统 - 简化实现

// 内存缓存
class SimpleCache {
  private cache: Map<string, { value: any; expiry: number }> = new Map()
  
  get(key: string): any {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
  
  set(key: string, value: any, ttl: number = 300) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl * 1000,
    })
  }
  
  delete(key: string) {
    this.cache.delete(key)
  }
  
  clear() {
    this.cache.clear()
  }
}

const memoryCache = new SimpleCache()

// 缓存键前缀
const CACHE_PREFIX = 'zw:'

// 获取缓存
export async function getCache<T>(key: string): Promise<T | null> {
  const fullKey = CACHE_PREFIX + key
  return memoryCache.get(fullKey) as T | null
}

// 设置缓存
export async function setCache(
  key: string,
  value: any,
  ttl: number = 300 // 秒
): Promise<void> {
  const fullKey = CACHE_PREFIX + key
  memoryCache.set(fullKey, value, ttl)
}

// 删除缓存
export async function deleteCache(key: string): Promise<void> {
  const fullKey = CACHE_PREFIX + key
  memoryCache.delete(fullKey)
}

// 批量删除缓存（按模式）
export async function deleteCachePattern(pattern: string): Promise<void> {
  memoryCache.clear()
}

// API响应缓存装饰器
export function cached(ttl: number = 300) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${propertyKey}:${JSON.stringify(args)}`
      const cached = await getCache(cacheKey)
      
      if (cached !== null) {
        return cached
      }
      
      const result = await originalMethod.apply(this, args)
      await setCache(cacheKey, result, ttl)
      
      return result
    }
    
    return descriptor
  }
}

// ISR (Incremental Static Regeneration) 配置
export const ISR_CONFIG = {
  // 首页 - 10分钟重新验证
  home: { revalidate: 600 },
  // 模板列表 - 5分钟
  templates: { revalidate: 300 },
  // 模板详情 - 15分钟
  templateDetail: { revalidate: 900 },
  // 用户作品 - 不缓存（动态）
  userProjects: { revalidate: 0 },
}

// 预生成静态页面
export async function revalidatePath(path: string): Promise<void> {
  console.log(`Revalidating path: ${path}`)
}
