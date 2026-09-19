import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, ChevronLeft, ChevronRight, Eye, Globe2, LockKeyhole, LogOut, PlayCircle, RefreshCw, Search, Users, X } from 'lucide-react'

const AUTH_STORAGE_KEY = 'ailing_analytics_authorization'
const API_BASE = `${import.meta.env.BASE_URL}api/analytics`
const EMPTY_FILTERS = { ip: '', path: '', device: '', location: '' }
const REPORT_TABS = [
  { key: 'recent', label: '访问记录' },
  { key: 'pages', label: '页面排行' },
  { key: 'videos', label: '视频排行' },
]

/**
 * 格式化监控指标数值
 *
 * @param value 原始数值
 * @return 本地化数值
 */
function formatNumber(value) {
  return Number(value || 0).toLocaleString('zh-CN')
}

/**
 * 格式化访问时间
 *
 * @param value 原始时间
 * @return 本地化时间
 */
function formatDateTime(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleString('zh-CN')
}

/**
 * 生成支持 Unicode 凭证的 Basic Auth 请求头
 *
 * @param username 登录账号
 * @param password 登录密码
 * @return Basic Auth 请求头
 */
function createAuthorization(username, password) {
  const bytes = new TextEncoder().encode(`${username}:${password}`)
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return `Basic ${window.btoa(binary)}`
}

/**
 * 生成查询字符串
 *
 * @param values 查询参数
 * @return 查询字符串
 */
function createQuery(values) {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) params.set(key, String(value))
  })
  return params.toString()
}

/**
 * 展示单项核心指标
 *
 * @param label 指标名称
 * @param value 指标值
 * @param icon 指标图标
 * @return 指标卡片
 */
function MetricCard({ label, value, icon: Icon }) {
  return <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/10 backdrop-blur-sm">
    <div className="flex items-center justify-between text-sm text-emerald-100/55"><span>{label}</span><Icon size={18} aria-hidden="true" /></div>
    <strong className="mt-4 block text-3xl font-semibold tracking-tight text-white md:text-4xl">{formatNumber(value)}</strong>
  </article>
}

/**
 * 展示表格空数据状态
 *
 * @param colSpan 表格列数
 * @return 空数据行
 */
function EmptyRow({ colSpan }) {
  return <tr><td className="px-5 py-12 text-center text-sm text-emerald-100/40" colSpan={colSpan}>暂无数据</td></tr>
}

/**
 * 展示分页控制器
 *
 * @param pagination 分页信息
 * @param onChange 页码变更方法
 * @return 分页控制器
 */
function Pagination({ pagination, onChange }) {
  const current = pagination?.page || 1
  const totalPages = pagination?.totalPages || 1
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-5 py-4 text-sm text-emerald-100/55">
    <span>共 {formatNumber(pagination?.total)} 条，第 {current} / {totalPages} 页</span>
    <div className="flex items-center gap-2">
      <button className="flex h-9 items-center gap-1 rounded-lg border border-white/10 px-3 transition hover:border-lime-300/40 hover:text-lime-200 disabled:cursor-not-allowed disabled:opacity-35" type="button" disabled={current <= 1} onClick={() => onChange(current - 1)}><ChevronLeft size={15} />上一页</button>
      <button className="flex h-9 items-center gap-1 rounded-lg border border-white/10 px-3 transition hover:border-lime-300/40 hover:text-lime-200 disabled:cursor-not-allowed disabled:opacity-35" type="button" disabled={current >= totalPages} onClick={() => onChange(current + 1)}>下一页<ChevronRight size={15} /></button>
    </div>
  </div>
}

/**
 * 展示监控登录表单
 *
 * @param onLogin 登录处理函数
 * @param error 错误信息
 * @param loading 是否正在登录
 * @return 登录页面
 */
function LoginPanel({ onLogin, error, loading }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const submit = (event) => {
    event.preventDefault()
    if (username.trim() && password) onLogin(username.trim(), password)
  }

  return <main className="min-h-screen bg-[#08110c] px-5 py-12 text-white"><div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center"><section className="w-full rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-9" aria-labelledby="analytics-login-title">
    <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-[#122015]"><LockKeyhole size={22} aria-hidden="true" /></div>
    <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-lime-300">PRIVATE ANALYTICS</p><h1 id="analytics-login-title" className="m-0 text-3xl font-semibold tracking-tight">访问监控</h1><p className="mt-3 text-sm leading-6 text-emerald-100/55">请输入环境变量中配置的监控账号和密码</p>
    <form className="mt-8 grid gap-5" onSubmit={submit}>
      <label className="grid gap-2 text-sm text-emerald-50/75">账号<input className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-3 text-white outline-none focus:border-lime-300/70" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
      <label className="grid gap-2 text-sm text-emerald-50/75">密码<input className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-3 text-white outline-none focus:border-lime-300/70" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      {error && <p className="m-0 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}
      <button className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3 font-semibold text-[#122015] hover:bg-lime-200 disabled:opacity-55" disabled={loading || !username.trim() || !password} type="submit">{loading && <RefreshCw className="animate-spin" size={17} />}{loading ? '正在验证' : '进入面板'}</button>
    </form>
  </section></div></main>
}

/**
 * 展示访问报表内容
 *
 * @param type 报表类型
 * @param items 当前页数据
 * @param onOpenIp 打开 IP 明细的方法
 * @return 报表表格
 */
function ReportTable({ type, items, onOpenIp }) {
  if (type === 'pages') return <table className="w-full min-w-2xl border-collapse text-left text-sm"><thead className="text-xs text-emerald-100/40"><tr><th className="px-5 py-3 font-medium">页面</th><th className="px-5 py-3 text-right font-medium">PV</th><th className="px-5 py-3 text-right font-medium">UV</th></tr></thead><tbody className="divide-y divide-white/6">{items.length ? items.map((item) => <tr className="text-emerald-50/75" key={item.path}><td className="max-w-xl truncate px-5 py-3.5 text-white" title={item.path}>{item.path}</td><td className="px-5 py-3.5 text-right">{formatNumber(item.views)}</td><td className="px-5 py-3.5 text-right">{formatNumber(item.visitors)}</td></tr>) : <EmptyRow colSpan={3} />}</tbody></table>

  if (type === 'videos') return <table className="w-full min-w-2xl border-collapse text-left text-sm"><thead className="text-xs text-emerald-100/40"><tr><th className="px-5 py-3 font-medium">视频</th><th className="px-5 py-3 text-right font-medium">播放</th><th className="px-5 py-3 text-right font-medium">完成</th></tr></thead><tbody className="divide-y divide-white/6">{items.length ? items.map((item) => <tr className="text-emerald-50/75" key={item.videoId}><td className="max-w-xl truncate px-5 py-3.5 text-white" title={item.title || item.videoId}>{item.title || item.videoId}</td><td className="px-5 py-3.5 text-right">{formatNumber(item.plays)}</td><td className="px-5 py-3.5 text-right">{formatNumber(item.completions)}</td></tr>) : <EmptyRow colSpan={3} />}</tbody></table>

  return <table className="w-full min-w-6xl border-collapse text-left text-sm"><thead className="text-xs text-emerald-100/40"><tr><th className="px-5 py-3 font-medium">时间</th><th className="px-5 py-3 font-medium">IP 地址</th><th className="px-5 py-3 font-medium">地区</th><th className="px-5 py-3 font-medium">设备</th><th className="px-5 py-3 font-medium">页面</th><th className="px-5 py-3 font-medium">来源</th></tr></thead><tbody className="divide-y divide-white/6">{items.length ? items.map((item, index) => <tr className="text-emerald-50/70" key={`${item.visitedAt}-${item.ip}-${index}`}><td className="whitespace-nowrap px-5 py-3.5">{formatDateTime(item.visitedAt)}</td><td className="whitespace-nowrap px-5 py-3.5"><button className="font-mono text-lime-200 underline decoration-lime-300/30 underline-offset-4 hover:text-lime-100" type="button" onClick={() => onOpenIp(item.ip)}>{item.ip || '-'}</button></td><td className="whitespace-nowrap px-5 py-3.5">{[item.country, item.region, item.city].filter(Boolean).join(' / ') || '-'}</td><td className="whitespace-nowrap px-5 py-3.5">{[item.deviceBrand, item.deviceModel, item.operatingSystem, item.browser].filter(Boolean).join(' / ') || item.deviceType || '-'}</td><td className="max-w-64 truncate px-5 py-3.5 text-white" title={item.path}>{item.path}</td><td className="max-w-72 truncate px-5 py-3.5" title={item.referrer || ''}>{item.referrer || '-'}</td></tr>) : <EmptyRow colSpan={6} />}</tbody></table>
}

/**
 * 展示指定 IP 的访问明细
 *
 * @param detail IP 明细状态
 * @param onClose 关闭方法
 * @param onPageChange 页码变更方法
 * @return IP 明细侧边面板
 */
function IpDetailPanel({ detail, onClose, onPageChange }) {
  if (!detail) return null
  return <div className="fixed inset-0 z-50 flex justify-end bg-black/65 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="ip-detail-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside className="flex h-full w-full max-w-3xl flex-col border-l border-white/10 bg-[#0d1811] shadow-2xl shadow-black/50">
    <header className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-7"><div><p className="m-0 text-xs tracking-[0.18em] text-lime-300">IP VISIT DETAIL</p><h2 id="ip-detail-title" className="mb-0 mt-1 font-mono text-xl text-white">{detail.ip}</h2><p className="mb-0 mt-2 text-sm text-emerald-100/45">共访问 {formatNumber(detail.pagination?.total)} 次</p></div><button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-emerald-50/70 hover:text-white" type="button" aria-label="关闭" onClick={onClose}><X size={18} /></button></header>
    <div className="flex-1 overflow-auto">{detail.loading ? <div className="flex h-56 items-center justify-center"><RefreshCw className="animate-spin text-lime-300" size={22} /></div> : detail.error ? <p className="m-5 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{detail.error}</p> : <table className="w-full min-w-2xl border-collapse text-left text-sm"><thead className="sticky top-0 bg-[#0d1811] text-xs text-emerald-100/40"><tr><th className="px-5 py-3 font-medium">访问时间</th><th className="px-5 py-3 font-medium">访问页面</th><th className="px-5 py-3 font-medium">来源</th></tr></thead><tbody className="divide-y divide-white/6">{detail.items?.length ? detail.items.map((item, index) => <tr className="text-emerald-50/70" key={`${item.visitedAt}-${item.path}-${index}`}><td className="whitespace-nowrap px-5 py-3.5">{formatDateTime(item.visitedAt)}</td><td className="max-w-72 px-5 py-3.5 text-white"><span className="block truncate" title={item.path}>{item.path}</span>{item.title && <span className="mt-1 block truncate text-xs text-emerald-100/35">{item.title}</span>}</td><td className="max-w-64 truncate px-5 py-3.5" title={item.referrer || ''}>{item.referrer || '-'}</td></tr>) : <EmptyRow colSpan={3} />}</tbody></table>}</div>
    {!detail.loading && !detail.error && <Pagination pagination={detail.pagination} onChange={onPageChange} />}
  </aside></div>
}

/**
 * 展示访问数据监控面板
 *
 * @return 监控面板页面
 */
export default function AnalyticsDashboard() {
  const [authorization, setAuthorization] = useState(() => window.sessionStorage.getItem(AUTH_STORAGE_KEY) || '')
  const [days, setDays] = useState(7)
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [reportType, setReportType] = useState('recent')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [summary, setSummary] = useState(null)
  const [report, setReport] = useState({ items: [], pagination: null })
  const [loading, setLoading] = useState(Boolean(authorization))
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)
  const [ipDetail, setIpDetail] = useState(null)

  const handleUnauthorized = useCallback(() => {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setAuthorization('')
    setSummary(null)
    setReport({ items: [], pagination: null })
    setError('账号或密码错误')
  }, [])

  const loadDashboard = useCallback(async () => {
    if (!authorization) return
    setLoading(true)
    setError('')
    const common = { days, ...filters }
    try {
      const [summaryResponse, reportResponse] = await Promise.all([
        fetch(`${API_BASE}/summary?${createQuery(common)}`, { headers: { Authorization: authorization }, cache: 'no-store' }),
        fetch(`${API_BASE}/report?${createQuery({ ...common, type: reportType, page, pageSize })}`, { headers: { Authorization: authorization }, cache: 'no-store' }),
      ])
      if (summaryResponse.status === 401 || reportResponse.status === 401) {
        handleUnauthorized()
        return
      }
      if (!summaryResponse.ok || !reportResponse.ok) throw new Error('数据加载失败')
      const [nextSummary, nextReport] = await Promise.all([summaryResponse.json(), reportResponse.json()])
      setSummary(nextSummary)
      setReport(nextReport)
      setUpdatedAt(new Date())
    } catch (requestError) {
      setError(requestError.message || '数据加载失败')
    } finally {
      setLoading(false)
    }
  }, [authorization, days, filters, reportType, page, pageSize, handleUnauthorized])

  useEffect(() => {
    if (!authorization) return undefined
    loadDashboard()
    const timer = window.setInterval(loadDashboard, 60000)
    return () => window.clearInterval(timer)
  }, [authorization, loadDashboard])

  const loadIpVisits = useCallback(async (ip, nextPage = 1) => {
    if (!ip) return
    setIpDetail((current) => ({ ...(current || {}), ip, loading: true, error: '', items: [], pagination: current?.ip === ip ? current.pagination : null }))
    try {
      const query = createQuery({ days, ...filters, ip, page: nextPage, pageSize: 10 })
      const response = await fetch(`${API_BASE}/ip-visits?${query}`, { headers: { Authorization: authorization }, cache: 'no-store' })
      if (response.status === 401) {
        handleUnauthorized()
        setIpDetail(null)
        return
      }
      if (!response.ok) throw new Error('IP 访问明细加载失败')
      setIpDetail({ ...(await response.json()), loading: false, error: '' })
    } catch (requestError) {
      setIpDetail((current) => ({ ...current, loading: false, error: requestError.message || 'IP 访问明细加载失败' }))
    }
  }, [authorization, days, filters, handleUnauthorized])

  const maxDailyViews = useMemo(() => Math.max(1, ...(summary?.daily || []).map((item) => Number(item.views || 0))), [summary])

  const login = (username, password) => {
    const nextAuthorization = createAuthorization(username, password)
    setError('')
    setLoading(true)
    setAuthorization(nextAuthorization)
    window.sessionStorage.setItem(AUTH_STORAGE_KEY, nextAuthorization)
  }
  const logout = () => {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setAuthorization('')
    setSummary(null)
    setIpDetail(null)
    setError('')
  }
  const submitFilters = (event) => {
    event.preventDefault()
    setPage(1)
    setFilters({ ...draftFilters })
  }
  const resetFilters = () => {
    setDraftFilters(EMPTY_FILTERS)
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  if (!authorization) return <LoginPanel onLogin={login} error={error} loading={loading} />
  const totals = summary?.totals || {}

  return <main className="min-h-screen bg-[#08110c] px-4 py-8 text-white sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl">
    <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-lime-300"><Activity size={16} />PORTFOLIO ANALYTICS</div><h1 className="m-0 text-3xl font-semibold tracking-tight md:text-4xl">访问监控面板</h1><p className="mt-2 text-sm text-emerald-100/50">{updatedAt ? `最近更新 ${updatedAt.toLocaleTimeString('zh-CN')}` : '正在读取统计数据'}</p></div><div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-sm text-emerald-50/70">统计周期<select className="bg-transparent text-white outline-none" value={days} onChange={(event) => { setDays(Number(event.target.value)); setPage(1) }}><option className="bg-[#122018]" value="1">今天</option><option className="bg-[#122018]" value="7">最近 7 天</option><option className="bg-[#122018]" value="30">最近 30 天</option><option className="bg-[#122018]" value="90">最近 90 天</option></select></label>
      <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-emerald-50/70 hover:text-lime-300 disabled:opacity-50" type="button" aria-label="刷新数据" disabled={loading} onClick={loadDashboard}><RefreshCw className={loading ? 'animate-spin' : ''} size={17} /></button>
      <button className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 text-sm text-emerald-50/70 hover:text-white" type="button" onClick={logout}><LogOut size={16} />退出</button>
    </div></header>

    {error && <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-sm text-red-100" role="alert"><span>{error}</span><button className="rounded-lg border border-red-100/20 px-3 py-1.5" type="button" onClick={loadDashboard}>重试</button></div>}

    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="核心指标"><MetricCard label="页面访问 PV" value={totals.pageViews} icon={Eye} /><MetricCard label="独立访客 UV" value={totals.visitors} icon={Users} /><MetricCard label="独立 IP" value={totals.uniqueIps} icon={Globe2} /><MetricCard label="视频播放" value={totals.videoPlays} icon={PlayCircle} /></section>

    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/10" aria-labelledby="analytics-trend-title"><div className="mb-6 flex items-center justify-between"><div><p className="m-0 text-xs tracking-[0.18em] text-emerald-100/40">PAGE VIEW TREND</p><h2 id="analytics-trend-title" className="mb-0 mt-1 text-lg font-semibold">访问趋势</h2></div>{loading && <RefreshCw className="animate-spin text-lime-300" size={18} />}</div>{summary?.daily?.length ? <div className="flex h-52 items-end gap-2 overflow-x-auto pt-4">{summary.daily.map((item) => <div className="flex h-full min-w-12 flex-1 flex-col items-center justify-end gap-2" key={item.day}><span className="text-xs font-semibold text-lime-200">{formatNumber(item.views)}</span><div className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-emerald-700 to-lime-300" style={{ height: `${Math.max(8, Number(item.views || 0) / maxDailyViews * 100)}%` }} /><span className="whitespace-nowrap text-[10px] text-emerald-100/40">{String(item.day).slice(5, 10)}</span></div>)}</div> : <div className="py-16 text-center text-sm text-emerald-100/40">暂无趋势数据</div>}</section>

    <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055] shadow-xl shadow-black/10" aria-labelledby="analytics-data-title">
      <div className="border-b border-white/8 p-5"><div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"><div><p className="m-0 text-xs tracking-[0.18em] text-emerald-100/40">DATA EXPLORER</p><h2 id="analytics-data-title" className="mb-0 mt-1 text-lg font-semibold">访问数据查询</h2></div><form className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 xl:max-w-4xl xl:grid-cols-6" onSubmit={submitFilters}>
        <input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-emerald-100/25 focus:border-lime-300/50" placeholder="IP 地址" value={draftFilters.ip} onChange={(event) => setDraftFilters((value) => ({ ...value, ip: event.target.value }))} />
        <input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-emerald-100/25 focus:border-lime-300/50" placeholder="页面路径" value={draftFilters.path} onChange={(event) => setDraftFilters((value) => ({ ...value, path: event.target.value }))} />
        <input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-emerald-100/25 focus:border-lime-300/50" placeholder="设备/浏览器" value={draftFilters.device} onChange={(event) => setDraftFilters((value) => ({ ...value, device: event.target.value }))} />
        <input className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-emerald-100/25 focus:border-lime-300/50" placeholder="国家/地区/城市" value={draftFilters.location} onChange={(event) => setDraftFilters((value) => ({ ...value, location: event.target.value }))} />
        <button className="flex items-center justify-center gap-2 rounded-lg bg-lime-300 px-4 py-2 text-sm font-semibold text-[#122015] hover:bg-lime-200" type="submit"><Search size={15} />查询</button><button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-emerald-50/65 hover:text-white" type="button" onClick={resetFilters}>重置</button>
      </form></div></div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5"><div className="flex overflow-x-auto">{REPORT_TABS.map((tab) => <button className={`border-b-2 px-4 py-4 text-sm transition ${reportType === tab.key ? 'border-lime-300 text-lime-200' : 'border-transparent text-emerald-100/45 hover:text-white'}`} key={tab.key} type="button" onClick={() => { setReportType(tab.key); setPage(1) }}>{tab.label}</button>)}</div><label className="flex items-center gap-2 text-xs text-emerald-100/45">每页<select className="rounded-lg border border-white/10 bg-[#122018] px-2 py-1.5 text-sm text-white outline-none" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }}><option value="10">10 条</option><option value="20">20 条</option><option value="50">50 条</option></select></label></div>
      <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-55' : 'opacity-100'}`}><ReportTable type={reportType} items={report.items || []} onOpenIp={(ip) => loadIpVisits(ip, 1)} /></div><Pagination pagination={report.pagination} onChange={setPage} />
    </section>
  </div><IpDetailPanel detail={ipDetail} onClose={() => setIpDetail(null)} onPageChange={(nextPage) => loadIpVisits(ipDetail.ip, nextPage)} /></main>
}
