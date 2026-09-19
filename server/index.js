import crypto from 'node:crypto'
import express from 'express'
import geoip from 'geoip-lite'
import mysql from 'mysql2/promise'

const app = express()
const port = Number(process.env.PORT || 3000)
const databaseRetryDelay = 3000
const databaseRetryLimit = 20
const allowedEventTypes = new Set(['page_view', 'video_play', 'video_progress', 'video_complete', 'image_view'])

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
 * 规范化页面路径
 *
 * @param value 原始页面路径
 * @return 统一后的页面路径
 */
function normalizePagePath(value) {
  const path = cleanString(value, 500)
  if (!path || path === '/') return '/'
  return path.replace(/\/+$/, '') || '/'
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
      image_id VARCHAR(500) NOT NULL DEFAULT '',
      image_title VARCHAR(255) NOT NULL DEFAULT '',
      ip_address VARCHAR(45) NOT NULL DEFAULT '',
      user_agent VARCHAR(1000) NOT NULL DEFAULT '',
      device_type VARCHAR(32) NOT NULL DEFAULT '',
      device_brand VARCHAR(100) NOT NULL DEFAULT '',
      device_model VARCHAR(150) NOT NULL DEFAULT '',
      operating_system VARCHAR(100) NOT NULL DEFAULT '',
      browser VARCHAR(100) NOT NULL DEFAULT '',
      country VARCHAR(8) NOT NULL DEFAULT '',
      region VARCHAR(100) NOT NULL DEFAULT '',
      city VARCHAR(150) NOT NULL DEFAULT '',
      latitude DECIMAL(10, 7) NULL,
      longitude DECIMAL(10, 7) NULL,
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

  const [columns] = await pool.query(`
    SELECT COLUMN_NAME AS name
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'analytics_events'
  `)
  const existingColumns = new Set(columns.map((column) => column.name))
  const requiredColumns = {
    device_type: "VARCHAR(32) NOT NULL DEFAULT ''",
    device_brand: "VARCHAR(100) NOT NULL DEFAULT ''",
    device_model: "VARCHAR(150) NOT NULL DEFAULT ''",
    operating_system: "VARCHAR(100) NOT NULL DEFAULT ''",
    browser: "VARCHAR(100) NOT NULL DEFAULT ''",
    image_id: "VARCHAR(500) NOT NULL DEFAULT ''",
    image_title: "VARCHAR(255) NOT NULL DEFAULT ''",
    country: "VARCHAR(8) NOT NULL DEFAULT ''",
    region: "VARCHAR(100) NOT NULL DEFAULT ''",
    city: "VARCHAR(150) NOT NULL DEFAULT ''",
    latitude: 'DECIMAL(10, 7) NULL',
    longitude: 'DECIMAL(10, 7) NULL',
  }
  const missingColumns = Object.entries(requiredColumns).filter(([name]) => !existingColumns.has(name))

  if (missingColumns.length) {
    const additions = missingColumns.map(([name, definition]) => `ADD COLUMN \`${name}\` ${definition}`).join(', ')
    await pool.execute(`ALTER TABLE analytics_events ${additions}`)
  }
}

/**
 * 等待 MySQL TCP 服务完成启动
 *
 * @return 数据库就绪任务
 */
async function waitForDatabase() {
  for (let attempt = 1; attempt <= databaseRetryLimit; attempt += 1) {
    try {
      await ensureSchema()
      return
    } catch (error) {
      if (attempt === databaseRetryLimit) throw error
      console.warn(`Database unavailable retrying ${attempt}/${databaseRetryLimit}`)
      await new Promise((resolve) => setTimeout(resolve, databaseRetryDelay))
    }
  }
}

/**
 * 从 User-Agent 中解析服务端设备回退信息
 *
 * @param userAgent 浏览器 User-Agent
 * @return 设备信息
 */
function parseUserAgent(userAgent) {
  const isTablet = /iPad|Tablet/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent))
  const isMobile = /Mobile|iPhone|Android/i.test(userAgent)
  const androidModel = userAgent.match(/Android[^;]*;\s*(?:[a-z]{2}(?:[-_][A-Z]{2})?;\s*)?([^;)]+?)(?:\s+Build\/|;|\))/i)?.[1]?.trim() || ''
  const model = /iPhone/i.test(userAgent) ? 'iPhone' : /iPad/i.test(userAgent) ? 'iPad' : androidModel
  let brand = ''
  let operatingSystem = ''
  let browser = ''

  if (/iPhone|iPad|Macintosh/i.test(userAgent)) brand = 'Apple'
  else if (/Samsung|SM-/i.test(userAgent)) brand = 'Samsung'
  else if (/Huawei|HUAWEI/i.test(userAgent)) brand = 'Huawei'
  else if (/Honor|HONOR/i.test(userAgent)) brand = 'Honor'
  else if (/Xiaomi|Redmi|Mi\s/i.test(userAgent)) brand = 'Xiaomi'
  else if (/OPPO|CPH\d+/i.test(userAgent)) brand = 'OPPO'
  else if (/vivo/i.test(userAgent)) brand = 'vivo'
  else if (/OnePlus/i.test(userAgent)) brand = 'OnePlus'
  else if (/Pixel/i.test(userAgent)) brand = 'Google'

  if (/iPhone|iPad|iPod/i.test(userAgent)) operatingSystem = 'iOS'
  else if (/Android/i.test(userAgent)) operatingSystem = 'Android'
  else if (/Windows/i.test(userAgent)) operatingSystem = 'Windows'
  else if (/Macintosh|Mac OS/i.test(userAgent)) operatingSystem = 'macOS'
  else if (/Linux/i.test(userAgent)) operatingSystem = 'Linux'

  if (/Edg\//i.test(userAgent)) browser = 'Edge'
  else if (/OPR\//i.test(userAgent)) browser = 'Opera'
  else if (/CriOS|Chrome\//i.test(userAgent)) browser = 'Chrome'
  else if (/FxiOS|Firefox\//i.test(userAgent)) browser = 'Firefox'
  else if (/Safari\//i.test(userAgent)) browser = 'Safari'

  return {
    deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    deviceBrand: brand,
    deviceModel: model,
    operatingSystem,
    browser,
  }
}

/**
 * 使用本地 GeoIP 数据库解析 IP 地区
 *
 * @param ipAddress IP 地址
 * @return 地区信息
 */
function getIpLocation(ipAddress) {
  const location = geoip.lookup(ipAddress)
  return {
    country: cleanString(location?.country, 8),
    region: cleanString(location?.region, 100),
    city: cleanString(location?.city, 150),
    latitude: Number.isFinite(location?.ll?.[0]) ? location.ll[0] : null,
    longitude: Number.isFinite(location?.ll?.[1]) ? location.ll[1] : null,
  }
}

/**
 * 将浏览器事件转换为数据库记录
 *
 * @param event 浏览器事件
 * @param request HTTP 请求
 * @return 数据库记录
 */
function normalizeEvent(event, requestContext) {
  const occurredAt = new Date(event?.occurredAt)
  const validDate = Number.isNaN(occurredAt.getTime()) ? new Date() : occurredAt
  const fallbackDevice = parseUserAgent(requestContext.userAgent)

  return [
    cleanString(event?.eventId, 64),
    cleanString(event?.type, 32),
    cleanString(event?.visitorId, 64),
    cleanString(event?.sessionId, 64),
    normalizePagePath(event?.path),
    cleanString(event?.title, 255),
    cleanString(event?.referrer, 1000),
    cleanString(event?.videoId, 255),
    cleanString(event?.videoTitle, 255),
    Math.max(0, Math.round(Number(event?.currentTime) || 0)),
    Math.max(0, Math.round(Number(event?.duration) || 0)),
    Math.min(100, Math.max(0, Math.round(Number(event?.milestone) || 0))),
    cleanString(event?.imageId, 500),
    cleanString(event?.imageTitle, 255),
    requestContext.ipAddress,
    requestContext.userAgent,
    cleanString(event?.deviceType, 32) || fallbackDevice.deviceType,
    cleanString(event?.deviceBrand, 100) || fallbackDevice.deviceBrand,
    cleanString(event?.deviceModel, 150) || fallbackDevice.deviceModel,
    cleanString(event?.operatingSystem, 100) || fallbackDevice.operatingSystem,
    cleanString(event?.browser, 100) || fallbackDevice.browser,
    requestContext.location.country,
    requestContext.location.region,
    requestContext.location.city,
    requestContext.location.latitude,
    requestContext.location.longitude,
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
    const ipAddress = getClientIp(request)
    const requestContext = {
      ipAddress,
      userAgent: cleanString(request.headers['user-agent'], 1000),
      location: getIpLocation(ipAddress),
    }
    const values = validEvents.map((event) => normalizeEvent(event, requestContext))
    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')
    await pool.query(`
      INSERT IGNORE INTO analytics_events (
        event_id, event_type, visitor_id, session_id, page_path, page_title,
        referrer, video_id, video_title, video_current_time, video_duration,
        video_milestone, image_id, image_title, ip_address, user_agent, device_type, device_brand,
        device_model, operating_system, browser, country, region, city,
        latitude, longitude, campaign, occurred_at
      ) VALUES ${placeholders}
    `, values.flat())
    response.status(202).json({ ok: true, accepted: validEvents.length })
  } catch (error) {
    console.error('Failed to save analytics events', error)
    response.status(500).json({ ok: false })
  }
})

/**
 * 解析报表分页参数
 *
 * @param query 请求查询参数
 * @return 分页参数
 */
function getPagination(query) {
  const requestedPage = Number.parseInt(query.page, 10)
  const requestedPageSize = Number.parseInt(query.pageSize, 10)
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1
  const pageSize = [10, 20, 50].includes(requestedPageSize) ? requestedPageSize : 10
  return { page, pageSize, offset: (page - 1) * pageSize }
}

/**
 * 构建监控报表的公共查询条件
 *
 * @param query 请求查询参数
 * @return SQL 条件和绑定参数
 */
function buildAnalyticsFilters(query) {
  const requestedDays = Number.parseInt(query.days, 10)
  const days = Number.isFinite(requestedDays) ? Math.min(90, Math.max(1, requestedDays)) : 7
  const clauses = [`created_at >= DATE_SUB(NOW(), INTERVAL ${days} DAY)`]
  const params = []
  const filters = {
    ip: cleanString(query.ip, 45),
    path: cleanString(query.path, 500),
    device: cleanString(query.device, 150),
    location: cleanString(query.location, 150),
  }

  if (filters.ip) {
    clauses.push('ip_address LIKE ?')
    params.push(`%${filters.ip}%`)
  }
  if (filters.path) {
    clauses.push('page_path LIKE ?')
    params.push(`%${filters.path}%`)
  }
  if (filters.device) {
    clauses.push("CONCAT_WS(' ', device_type, device_brand, device_model, operating_system, browser) LIKE ?")
    params.push(`%${filters.device}%`)
  }
  if (filters.location) {
    clauses.push("CONCAT_WS(' ', country, region, city) LIKE ?")
    params.push(`%${filters.location}%`)
  }

  return { days, filters, clauses, params }
}

/**
 * 生成分页响应数据
 *
 * @param items 当前页数据
 * @param total 总记录数
 * @param page 当前页码
 * @param pageSize 每页条数
 * @return 分页响应
 */
function createPagedResult(items, total, page, pageSize) {
  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  }
}

app.get('/api/analytics/summary', requireAdmin, async (request, response) => {
  const { days, filters, clauses, params } = buildAnalyticsFilters(request.query)
  const where = clauses.join(' AND ')

  try {
    const [[totals], [daily]] = await Promise.all([
      pool.query(`
        SELECT
          SUM(event_type = 'page_view') AS pageViews,
          COUNT(DISTINCT IF(event_type = 'page_view', visitor_id, NULL)) AS visitors,
          COUNT(DISTINCT IF(event_type = 'page_view', ip_address, NULL)) AS uniqueIps,
          SUM(event_type = 'video_play') AS videoPlays
        FROM analytics_events
        WHERE ${where}
      `, params),
      pool.query(`
        SELECT DATE(created_at) AS day, SUM(event_type = 'page_view') AS views
        FROM analytics_events
        WHERE ${where}
        GROUP BY DATE(created_at)
        ORDER BY day ASC
      `, params),
    ])

    response.json({ days, filters, totals: totals[0] || {}, daily })
  } catch (error) {
    console.error('Failed to load analytics summary', error)
    response.status(500).json({ ok: false })
  }
})

app.get('/api/analytics/report', requireAdmin, async (request, response) => {
  const type = cleanString(request.query.type, 20)
  const { page, pageSize, offset } = getPagination(request.query)
  const { clauses, params } = buildAnalyticsFilters(request.query)
  const reportClauses = [...clauses]
  let countSql = ''
  let dataSql = ''

  if (type === 'pages') {
    reportClauses.push("event_type = 'page_view'")
    const where = reportClauses.join(' AND ')
    const normalizedPath = "CASE WHEN TRIM(page_path) = '/' THEN '/' ELSE COALESCE(NULLIF(TRIM(TRAILING '/' FROM TRIM(page_path)), ''), '/') END"
    countSql = `SELECT COUNT(DISTINCT ${normalizedPath}) AS total FROM analytics_events WHERE ${where}`
    dataSql = `
      SELECT ${normalizedPath} AS path, COUNT(*) AS views, COUNT(DISTINCT visitor_id) AS visitors
      FROM analytics_events WHERE ${where}
      GROUP BY ${normalizedPath} ORDER BY views DESC LIMIT ? OFFSET ?
    `
  } else if (type === 'videos') {
    reportClauses.push("event_type IN ('video_play', 'video_complete')", "video_id <> ''")
    const where = reportClauses.join(' AND ')
    countSql = `SELECT COUNT(DISTINCT video_id) AS total FROM analytics_events WHERE ${where}`
    dataSql = `
      SELECT video_id AS videoId, MAX(video_title) AS title,
        SUM(event_type = 'video_play') AS plays,
        SUM(event_type = 'video_complete') AS completions
      FROM analytics_events WHERE ${where}
      GROUP BY video_id ORDER BY plays DESC LIMIT ? OFFSET ?
    `
  } else if (type === 'recent') {
    reportClauses.push("event_type = 'page_view'")
    const where = reportClauses.join(' AND ')
    countSql = `SELECT COUNT(*) AS total FROM (
      SELECT DATE(created_at) AS visit_day, ip_address
      FROM analytics_events WHERE ${where}
      GROUP BY DATE(created_at), ip_address
    ) AS daily_ips`
    dataSql = `
      SELECT visitedAt, ip, path, referrer, deviceType, deviceBrand, deviceModel,
        operatingSystem, browser, country, region, city
      FROM (
        SELECT created_at AS visitedAt, ip_address AS ip, page_path AS path, referrer,
          device_type AS deviceType, device_brand AS deviceBrand, device_model AS deviceModel,
          operating_system AS operatingSystem, browser, country, region, city,
          ROW_NUMBER() OVER (
            PARTITION BY DATE(created_at), ip_address
            ORDER BY created_at DESC, id DESC
          ) AS rn
        FROM analytics_events WHERE ${where}
      ) AS daily_recent
      WHERE rn = 1
      ORDER BY visitedAt DESC LIMIT ? OFFSET ?
    `
  } else {
    response.status(400).json({ ok: false, message: 'Invalid report type' })
    return
  }

  try {
    const [[countRows], [items]] = await Promise.all([
      pool.query(countSql, params),
      pool.query(dataSql, [...params, pageSize, offset]),
    ])
    response.json(createPagedResult(items, Number(countRows[0]?.total || 0), page, pageSize))
  } catch (error) {
    console.error('Failed to load analytics report', error)
    response.status(500).json({ ok: false })
  }
})

app.get('/api/analytics/ip-visits', requireAdmin, async (request, response) => {
  const ip = cleanString(request.query.ip, 45)
  if (!ip) {
    response.status(400).json({ ok: false, message: 'IP is required' })
    return
  }

  const { page, pageSize, offset } = getPagination(request.query)
  const { clauses, params } = buildAnalyticsFilters({ ...request.query, ip: '' })
  const pageClauses = [...clauses, "event_type IN ('page_view', 'video_play', 'video_complete', 'image_view')", 'ip_address = ?']
  const pageParams = [...params, ip]
  const statsWhere = [...clauses, 'ip_address = ?'].join(' AND ')
  const statsParams = [...params, ip]
  const pageWhere = pageClauses.join(' AND ')

  try {
    const [[countRows], [items], [statsRows]] = await Promise.all([
      pool.query(`SELECT COUNT(*) AS total FROM analytics_events WHERE ${pageWhere}`, pageParams),
      pool.query(`
        SELECT created_at AS visitedAt, event_type AS activityType,
          page_path AS path, page_title AS pageTitle, video_id AS videoId,
          video_title AS videoTitle, image_id AS imageId, image_title AS imageTitle,
          device_type AS deviceType, device_brand AS deviceBrand, device_model AS deviceModel,
          operating_system AS operatingSystem, browser, country, region, city
        FROM analytics_events WHERE ${pageWhere}
        ORDER BY created_at DESC LIMIT ? OFFSET ?
      `, [...pageParams, pageSize, offset]),
      pool.query(`
        SELECT
          SUM(event_type = 'video_play') AS videoPlays,
          SUM(event_type = 'video_complete') AS videoCompletions
        FROM analytics_events WHERE ${statsWhere}
      `, statsParams),
    ])
    const stats = statsRows[0] || {}
    response.json({
      ip,
      stats: {
        videoPlays: Number(stats.videoPlays || 0),
        videoCompletions: Number(stats.videoCompletions || 0),
      },
      ...createPagedResult(items, Number(countRows[0]?.total || 0), page, pageSize),
    })
  } catch (error) {
    console.error('Failed to load IP visits', error)
    response.status(500).json({ ok: false })
  }
})

/**
 * 初始化数据库后启动分析服务
 *
 * @return 启动任务
 */
async function start() {
  await waitForDatabase()
  app.listen(port, '0.0.0.0', () => console.log(`Analytics API listening on ${port}`))
}

start().catch((error) => {
  console.error('Failed to start analytics API', error)
  process.exit(1)
})
