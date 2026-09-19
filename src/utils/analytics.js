const ANALYTICS_ENDPOINT = `${import.meta.env.BASE_URL}api/analytics/events`
const FLUSH_DELAY = 3000
const MAX_QUEUE_SIZE = 20
const VIDEO_MILESTONES = [25, 50, 75]

let initialized = false
let flushTimer = null
let queue = []

const videoStates = new WeakMap()

/**
 * 根据浏览器信息推断设备品牌
 *
 * @param userAgent 浏览器 User-Agent
 * @param model 浏览器提供的设备型号
 * @return 设备品牌
 */
function detectDeviceBrand(userAgent, model) {
  const value = `${model} ${userAgent}`
  if (/iPhone|iPad|Macintosh/i.test(value)) return 'Apple'
  if (/Samsung|SM-/i.test(value)) return 'Samsung'
  if (/Huawei|HUAWEI/i.test(value)) return 'Huawei'
  if (/Honor|HONOR/i.test(value)) return 'Honor'
  if (/Xiaomi|Redmi|Mi\s/i.test(value)) return 'Xiaomi'
  if (/OPPO|CPH\d+/i.test(value)) return 'OPPO'
  if (/vivo/i.test(value)) return 'vivo'
  if (/OnePlus/i.test(value)) return 'OnePlus'
  if (/Pixel/i.test(value)) return 'Google'
  return ''
}

/**
 * 从 User-Agent 中提取 Android 设备型号
 *
 * @param userAgent 浏览器 User-Agent
 * @return 设备型号
 */
function detectAndroidModel(userAgent) {
  const match = userAgent.match(/Android[^;]*;\s*(?:[a-z]{2}(?:[-_][A-Z]{2})?;\s*)?([^;)]+?)(?:\s+Build\/|;|\))/i)
  return match?.[1]?.trim() || ''
}

/**
 * 从浏览器信息中识别操作系统
 *
 * @param userAgent 浏览器 User-Agent
 * @param platform 浏览器平台
 * @return 操作系统
 */
function detectOperatingSystem(userAgent, platform) {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS'
  if (/Android/i.test(userAgent)) return 'Android'
  if (/Windows/i.test(userAgent) || /Win/i.test(platform)) return 'Windows'
  if (/Macintosh|Mac OS/i.test(userAgent) || /Mac/i.test(platform)) return 'macOS'
  if (/Linux/i.test(userAgent) || /Linux/i.test(platform)) return 'Linux'
  return platform || 'Unknown'
}

/**
 * 从 User-Agent 中识别浏览器
 *
 * @param userAgent 浏览器 User-Agent
 * @return 浏览器名称
 */
function detectBrowser(userAgent) {
  if (/Edg\//i.test(userAgent)) return 'Edge'
  if (/OPR\//i.test(userAgent)) return 'Opera'
  if (/CriOS|Chrome\//i.test(userAgent)) return 'Chrome'
  if (/FxiOS|Firefox\//i.test(userAgent)) return 'Firefox'
  if (/Safari\//i.test(userAgent)) return 'Safari'
  return 'Unknown'
}

/**
 * 收集浏览器允许提供的设备信息
 *
 * @return 设备信息
 */
async function collectDeviceContext() {
  const userAgent = navigator.userAgent || ''
  const userAgentData = navigator.userAgentData
  let hints = {}

  try {
    hints = userAgentData?.getHighEntropyValues
      ? await userAgentData.getHighEntropyValues(['model', 'platformVersion'])
      : {}
  } catch {
    hints = {}
  }

  const platform = hints.platform || userAgentData?.platform || navigator.platform || ''
  const isTablet = /iPad|Tablet/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent))
  const isMobile = Boolean(userAgentData?.mobile) || /Mobile|iPhone|Android/i.test(userAgent)
  const model = hints.model || (/iPhone/i.test(userAgent) ? 'iPhone' : /iPad/i.test(userAgent) ? 'iPad' : detectAndroidModel(userAgent))

  return {
    deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    deviceBrand: detectDeviceBrand(userAgent, model),
    deviceModel: model,
    operatingSystem: detectOperatingSystem(userAgent, platform),
    browser: detectBrowser(userAgent),
  }
}

const deviceContextPromise = collectDeviceContext()

/**
 * 生成浏览器侧匿名标识
 *
 * @return 匿名标识
 */
function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

/**
 * 从浏览器存储中读取或创建匿名标识
 *
 * @param storage 浏览器存储对象
 * @param key 存储键名
 * @return 匿名标识
 */
function getStoredId(storage, key) {
  try {
    const existing = storage.getItem(key)
    if (existing) return existing
    const id = createId()
    storage.setItem(key, id)
    return id
  } catch {
    return createId()
  }
}

/**
 * 获取当前访问来源参数
 *
 * @return 来源参数
 */
function getCampaign() {
  const params = new URLSearchParams(window.location.search)
  return {
    source: params.get('utm_source') || '',
    medium: params.get('utm_medium') || '',
    campaign: params.get('utm_campaign') || '',
  }
}

/**
 * 批量发送待处理的采集事件
 *
 * @param useBeacon 是否使用页面卸载上报
 * @return 上报任务
 */
async function flush(useBeacon = false) {
  if (!queue.length) return

  const events = queue.splice(0, MAX_QUEUE_SIZE)
  const body = JSON.stringify({ events })

  try {
    if (useBeacon && navigator.sendBeacon) {
      const accepted = navigator.sendBeacon(ANALYTICS_ENDPOINT, new Blob([body], { type: 'application/json' }))
      if (!accepted) queue = [...events, ...queue].slice(0, 100)
      return
    }

    const response = await fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })

    if (!response.ok) throw new Error(`Analytics request failed with ${response.status}`)
  } catch {
    queue = [...events, ...queue].slice(0, 100)
    return
  }

  if (queue.length) scheduleFlush()
}

/**
 * 延迟执行批量上报
 *
 * @return 无返回值
 */
function scheduleFlush() {
  if (flushTimer) return
  flushTimer = window.setTimeout(() => {
    flushTimer = null
    flush()
  }, FLUSH_DELAY)
}

/**
 * 将访问或播放事件加入上报队列
 *
 * @param type 事件类型
 * @param details 事件明细
 * @return 无返回值
 */
export async function trackEvent(type, details = {}) {
  const visitorId = getStoredId(window.localStorage, 'ailing_analytics_visitor')
  const sessionId = getStoredId(window.sessionStorage, 'ailing_analytics_session')
  const device = await deviceContextPromise

  queue.push({
    eventId: createId(),
    type,
    visitorId,
    sessionId,
    path: window.location.pathname,
    title: document.title,
    referrer: document.referrer,
    occurredAt: new Date().toISOString(),
    campaign: getCampaign(),
    ...device,
    ...details,
  })

  if (queue.length >= MAX_QUEUE_SIZE) flush()
  else scheduleFlush()
}

/**
 * 获取视频对应的稳定标识和标题
 *
 * @param video 视频元素
 * @return 视频描述信息
 */
function getVideoDetails(video) {
  const source = video.currentSrc || video.src || ''
  let videoId = source

  try {
    const pathname = new URL(source, window.location.origin).pathname
    videoId = pathname.split('/').filter(Boolean).pop() || pathname
  } catch {
    videoId = source
  }

  const container = video.closest('article, section') || video.parentElement
  const heading = container?.querySelector('h1, h2, h3, b')?.textContent?.trim()

  return {
    videoId: videoId.slice(0, 255),
    videoTitle: (video.getAttribute('aria-label') || heading || videoId).slice(0, 255),
    currentTime: Math.round(video.currentTime || 0),
    duration: Math.round(video.duration || 0),
  }
}

/**
 * 处理视频首次播放事件
 *
 * @param video 视频元素
 * @return 无返回值
 */
function handleVideoPlay(video) {
  const state = videoStates.get(video) || { started: false, milestones: new Set() }
  if (!state.started) {
    state.started = true
    trackEvent('video_play', getVideoDetails(video))
  }
  videoStates.set(video, state)
}

/**
 * 处理视频播放进度里程碑
 *
 * @param video 视频元素
 * @return 无返回值
 */
function handleVideoProgress(video) {
  if (!Number.isFinite(video.duration) || video.duration <= 0) return

  const state = videoStates.get(video) || { started: false, milestones: new Set() }
  const progress = video.currentTime / video.duration * 100

  VIDEO_MILESTONES.forEach((milestone) => {
    if (progress < milestone || state.milestones.has(milestone)) return
    state.milestones.add(milestone)
    trackEvent('video_progress', { ...getVideoDetails(video), milestone })
  })

  videoStates.set(video, state)
}

/**
 * 初始化全站页面与视频采集
 *
 * @return 无返回值
 */
export function initAnalytics() {
  if (initialized || typeof window === 'undefined') return
  if (window.location.pathname.replace(/\/+$/, '').endsWith('/analytics')) return
  initialized = true

  let lastPath = ''
  const trackPage = () => {
    const path = window.location.pathname
    if (path === lastPath) return
    lastPath = path
    trackEvent('page_view')
  }

  trackPage()
  window.addEventListener('popstate', trackPage)

  document.addEventListener('play', (event) => {
    if (event.target instanceof HTMLVideoElement) handleVideoPlay(event.target)
  }, true)

  document.addEventListener('timeupdate', (event) => {
    if (event.target instanceof HTMLVideoElement) handleVideoProgress(event.target)
  }, true)

  document.addEventListener('ended', (event) => {
    if (!(event.target instanceof HTMLVideoElement)) return
    trackEvent('video_complete', { ...getVideoDetails(event.target), milestone: 100 })
  }, true)

  window.addEventListener('pagehide', () => flush(true))
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush(true)
  })
}
