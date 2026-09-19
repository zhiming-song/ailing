import crypto from 'node:crypto'
import express from 'express'
import mysql from 'mysql2/promise'

const app = express()
const port = Number(process.env.PORT || 3000)
const allowedEventTypes = new Set(['page_view', 'video_play', 'video_progress', 'video_complete'])

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'ailing-mysql',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'ailing_analytics',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
})

app.disable('x-powered-by')
app.use(express.json({ limit: '64kb', type: ['application/json', 'text/plain'] }))

/**
 * 限制字符串长度并过滤无效值
 *
 * @param value 原始值
 * @param maxLength 最大长度
 * @return 安全字符串
 */
function cleanString(value, maxLength) {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

/**
 * 从代理请求头中解析访客 IP
 *
 * @param request HTTP 请求
 * @return 访客 IP
 */
function getClientIp(request) {
  const forwarded = cleanString(request.headers['x-forwarded-for'], 512)
  const realIp = cleanString(request.headers['x-real-ip'], 45)
  const remoteIp = cleanString(request.socket.remoteAddress, 45)
  const ip = forwarded.split(',')[0]?.trim() || realIp || remoteIp
  return ip.replace(/^::ffff:/, '').slice(0, 45)
}

/**
 * 检查监控面板的 Basic Auth 凭证
 *
 * @param request HTTP 请求
 * @param response HTTP 响应
 * @param next 后续处理函数
 * @return 无返回值
 */
function requireAdmin(request, response, next) {
  const configuredUser = process.env.ANALYTICS_ADMIN_USER
  const configuredPassword = process.env.ANALYTICS_ADMIN_PASSWORD

  if (!configuredUser || !configuredPassword) {
    response.status(503).send('Analytics administrator credentials are not configured')
    return
  }

  const authorization = request.headers.authorization || ''
  const [scheme, encoded] = authorization.split(' ')
  let supplied = ''

  try {
    supplied = scheme === 'Basic' && encoded ? Buffer.from(encoded, 'base64').toString('utf8') : ''
  } catch {
    supplied = ''
  }

  const expected = `${configuredUser}:${configuredPassword}`
  const suppliedHash = crypto.createHash('sha256').update(supplied).digest()
  const expectedHash = crypto.createHash('sha256').update(expected).digest()

  if (!crypto.timingSafeEqual(suppliedHash, expectedHash)) {
    response.set('WWW-Authenticate', 'Basic realm="Ailing Analytics", charset="UTF-8"')
    response.status(401).send('Authentication required')
    return
  }

  next()
}

/**
 * 创建分析数据表
 *
 * @return 建表任务
 */
async function ensureSchema() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      event_id VARCHAR(64) NOT NULL,
      event_type VARCHAR(32) NOT NULL,
      visitor_id VARCHAR(64) NOT NULL,
      session_id VARCHAR(64) NOT NULL,
      page_path VARCHAR(500) NOT NULL,
      page_title VARCHAR(255) NOT NULL DEFAULT '',
      referrer VARCHAR(1000) NOT NULL DEFAULT '',
      video_id VARCHAR(255) NOT NULL DEFAULT '',
      video_title VARCHAR(255) NOT NULL DEFAULT '',
      video_current_time INT UNSIGNED NOT NULL DEFAULT 0,
      video_duration INT UNSIGNED NOT NULL DEFAULT 0,
      video_milestone TINYINT UNSIGNED NOT NULL DEFAULT 0,
      ip_address VARCHAR(45) NOT NULL DEFAULT '',
      user_agent VARCHAR(1000) NOT NULL DEFAULT '',
      campaign JSON NULL,
      occurred_at DATETIME(3) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uk_event_id (event_id),
      KEY idx_type_created_at (event_type, created_at),
      KEY idx_path_created_at (page_path(191), created_at),
      KEY idx_video_created_at (video_id(191), created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `)
}

/**
 * 将浏览器事件转换为数据库记录
 *
 * @param event 浏览器事件
 * @param request HTTP 请求
 * @return 数据库记录
 */
function normalizeEvent(event, request) {
  const occurredAt = new Date(event?.occurredAt)
  const validDate = Number.isNaN(occurredAt.getTime()) ? new Date() : occurredAt

  return [
    cleanString(event?.eventId, 64),
    cleanString(event?.type, 32),
    cleanString(event?.visitorId, 64),
    cleanString(event?.sessionId, 64),
    cleanString(event?.path, 500),
    cleanString(event?.title, 255),
    cleanString(event?.referrer, 1000),
    cleanString(event?.videoId, 255),
    cleanString(event?.videoTitle, 255),
    Math.max(0, Math.round(Number(event?.currentTime) || 0)),
    Math.max(0, Math.round(Number(event?.duration) || 0)),
    Math.min(100, Math.max(0, Math.round(Number(event?.milestone) || 0))),
    getClientIp(request),
    cleanString(request.headers['user-agent'], 1000),
    JSON.stringify(event?.campaign && typeof event.campaign === 'object' ? event.campaign : {}),
    validDate,
  ]
}

app.get('/api/health', async (_request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ ok: true })
  } catch {
    response.status(503).json({ ok: false })
  }
})

app.post('/api/analytics/events', async (request, response) => {
  const events = Array.isArray(request.body?.events) ? request.body.events.slice(0, 20) : []
  const validEvents = events.filter((event) => (
    allowedEventTypes.has(event?.type)
    && cleanString(event?.eventId, 64)
    && cleanString(event?.visitorId, 64)
    && cleanString(event?.sessionId, 64)
    && cleanString(event?.path, 500)
  ))

  if (!validEvents.length) {
    response.status(400).json({ ok: false, message: 'No valid events' })
    return
  }

  try {
    const values = validEvents.map((event) => normalizeEvent(event, request))
    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')
    await pool.query(`
      INSERT IGNORE INTO analytics_events (
        event_id, event_type, visitor_id, session_id, page_path, page_title,
        referrer, video_id, video_title, video_current_time, video_duration,
        video_milestone, ip_address, user_agent, campaign, occurred_at
      ) VALUES ${placeholders}
    `, values.flat())
    response.status(202).json({ ok: true, accepted: validEvents.length })
  } catch (error) {
    console.error('Failed to save analytics events', error)
    response.status(500).json({ ok: false })
  }
})

app.get('/api/analytics/summary', requireAdmin, async (request, response) => {
  const requestedDays = Number.parseInt(request.query.days, 10)
  const days = Number.isFinite(requestedDays) ? Math.min(90, Math.max(1, requestedDays)) : 7
  const range = `created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`

  try {
    const [[totals], [daily], [pages], [videos], [recent]] = await Promise.all([
      pool.query(`
        SELECT
          SUM(event_type = 'page_view') AS pageViews,
          COUNT(DISTINCT IF(event_type = 'page_view', visitor_id, NULL)) AS visitors,
          COUNT(DISTINCT IF(event_type = 'page_view', ip_address, NULL)) AS uniqueIps,
          SUM(event_type = 'video_play') AS videoPlays
        FROM analytics_events
        WHERE ${range}
      `),
      pool.query(`
        SELECT DATE(created_at) AS day, SUM(event_type = 'page_view') AS views
        FROM analytics_events
        WHERE ${range}
        GROUP BY DATE(created_at)
        ORDER BY day ASC
      `),
      pool.query(`
        SELECT page_path AS path, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS visitors
        FROM analytics_events
        WHERE ${range} AND event_type = 'page_view'
        GROUP BY page_path
        ORDER BY views DESC
        LIMIT 20
      `),
      pool.query(`
        SELECT
          video_id AS videoId,
          MAX(video_title) AS title,
          SUM(event_type = 'video_play') AS plays,
          SUM(event_type = 'video_complete') AS completions
        FROM analytics_events
        WHERE ${range} AND video_id <> ''
        GROUP BY video_id
        ORDER BY plays DESC
        LIMIT 20
      `),
      pool.query(`
        SELECT created_at AS visitedAt, ip_address AS ip, page_path AS path, referrer
        FROM analytics_events
        WHERE ${range} AND event_type = 'page_view'
        ORDER BY created_at DESC
        LIMIT 30
      `),
    ])

    response.json({ days, totals: totals[0] || {}, daily, pages, videos, recent })
  } catch (error) {
    console.error('Failed to load analytics summary', error)
    response.status(500).json({ ok: false })
  }
})

/**
 * 初始化数据库后启动分析服务
 *
 * @return 启动任务
 */
async function start() {
  await ensureSchema()
  app.listen(port, '0.0.0.0', () => console.log(`Analytics API listening on ${port}`))
}

start().catch((error) => {
  console.error('Failed to start analytics API', error)
  process.exit(1)
})
