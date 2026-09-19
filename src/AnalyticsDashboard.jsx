import { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, Eye, Globe2, LockKeyhole, LogOut, PlayCircle, RefreshCw, Users } from 'lucide-react'

const AUTH_STORAGE_KEY = 'ailing_analytics_authorization'
const SUMMARY_ENDPOINT = `${import.meta.env.BASE_URL}api/analytics/summary`

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
  return <tr><td className="px-5 py-10 text-center text-sm text-emerald-100/40" colSpan={colSpan}>暂无数据</td></tr>
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
    if (!username.trim() || !password) return
    onLogin(username.trim(), password)
  }

  return <main className="min-h-screen bg-[#08110c] px-5 py-12 text-white">
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center">
      <section className="w-full rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-9" aria-labelledby="analytics-login-title">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-[#122015]"><LockKeyhole size={22} aria-hidden="true" /></div>
        <p className="mb-2 text-xs font-semibold tracking-[0.24em] text-lime-300">PRIVATE ANALYTICS</p>
        <h1 id="analytics-login-title" className="m-0 text-3xl font-semibold tracking-tight">访问监控</h1>
        <p className="mt-3 text-sm leading-6 text-emerald-100/55">请输入环境变量中配置的监控账号和密码</p>
        <form className="mt-8 grid gap-5" onSubmit={submit}>
          <label className="grid gap-2 text-sm text-emerald-50/75">账号<input className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-lime-300/70 focus:ring-3 focus:ring-lime-300/10" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label>
          <label className="grid gap-2 text-sm text-emerald-50/75">密码<input className="w-full rounded-xl border border-white/12 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-lime-300/70 focus:ring-3 focus:ring-lime-300/10" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          {error && <p className="m-0 rounded-xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100" role="alert">{error}</p>}
          <button className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-lime-300 px-4 py-3 font-semibold text-[#122015] transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-55" disabled={loading || !username.trim() || !password} type="submit">{loading && <RefreshCw className="animate-spin" size={17} aria-hidden="true" />}{loading ? '正在验证' : '进入面板'}</button>
        </form>
      </section>
    </div>
  </main>
}

/**
 * 展示访问数据监控面板
 *
 * @return 监控面板页面
 */
export default function AnalyticsDashboard() {
  const [authorization, setAuthorization] = useState(() => window.sessionStorage.getItem(AUTH_STORAGE_KEY) || '')
  const [days, setDays] = useState(7)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(authorization))
  const [error, setError] = useState('')
  const [updatedAt, setUpdatedAt] = useState(null)

  const loadSummary = useCallback(async (auth = authorization, selectedDays = days) => {
    if (!auth) return false
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${SUMMARY_ENDPOINT}?days=${selectedDays}`, {
        headers: { Authorization: auth },
        cache: 'no-store',
      })

      if (response.status === 401) {
        window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
        setAuthorization('')
        setData(null)
        setError('账号或密码错误')
        return false
      }
      if (!response.ok) throw new Error(`数据加载失败 ${response.status}`)

      setData(await response.json())
      setUpdatedAt(new Date())
      return true
    } catch (requestError) {
      setError(requestError.message || '数据加载失败')
      return false
    } finally {
      setLoading(false)
    }
  }, [authorization, days])

  useEffect(() => {
    if (!authorization) return undefined
    loadSummary()
    const timer = window.setInterval(loadSummary, 60000)
    return () => window.clearInterval(timer)
  }, [authorization, days, loadSummary])

  const maxDailyViews = useMemo(() => Math.max(1, ...(data?.daily || []).map((item) => Number(item.views || 0))), [data])

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
    setData(null)
    setError('')
  }

  if (!authorization) return <LoginPanel onLogin={login} error={error} loading={loading} />

  const totals = data?.totals || {}

  return <main className="min-h-screen bg-[#08110c] px-4 py-8 text-white sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div><div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-lime-300"><Activity size={16} aria-hidden="true" />PORTFOLIO ANALYTICS</div><h1 className="m-0 text-3xl font-semibold tracking-tight md:text-4xl">访问监控面板</h1><p className="mt-2 text-sm text-emerald-100/50">{updatedAt ? `最近更新 ${updatedAt.toLocaleTimeString('zh-CN')}` : '正在读取统计数据'}</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-sm text-emerald-50/70">统计周期<select className="bg-transparent text-white outline-none" value={days} onChange={(event) => setDays(Number(event.target.value))}><option className="bg-[#122018]" value="1">今天</option><option className="bg-[#122018]" value="7">最近 7 天</option><option className="bg-[#122018]" value="30">最近 30 天</option><option className="bg-[#122018]" value="90">最近 90 天</option></select></label>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-emerald-50/70 transition hover:border-lime-300/40 hover:text-lime-300 disabled:opacity-50" type="button" aria-label="刷新数据" disabled={loading} onClick={() => loadSummary()}><RefreshCw className={loading ? 'animate-spin' : ''} size={17} /></button>
          <button className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-3 text-sm text-emerald-50/70 transition hover:border-white/20 hover:text-white" type="button" onClick={logout}><LogOut size={16} aria-hidden="true" />退出</button>
        </div>
      </header>

      {error && <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-sm text-red-100" role="alert"><span>{error}</span><button className="rounded-lg border border-red-100/20 px-3 py-1.5" type="button" onClick={() => loadSummary()}>重试</button></div>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="核心指标">
        <MetricCard label="页面访问 PV" value={totals.pageViews} icon={Eye} />
        <MetricCard label="独立访客 UV" value={totals.visitors} icon={Users} />
        <MetricCard label="独立 IP" value={totals.uniqueIps} icon={Globe2} />
        <MetricCard label="视频播放" value={totals.videoPlays} icon={PlayCircle} />
      </section>

      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-xl shadow-black/10" aria-labelledby="analytics-trend-title">
        <div className="mb-6 flex items-center justify-between"><div><p className="m-0 text-xs tracking-[0.18em] text-emerald-100/40">PAGE VIEW TREND</p><h2 id="analytics-trend-title" className="mb-0 mt-1 text-lg font-semibold">访问趋势</h2></div>{loading && <RefreshCw className="animate-spin text-lime-300" size={18} aria-label="正在刷新" />}</div>
        {data?.daily?.length ? <div className="flex h-52 items-end gap-2 overflow-x-auto pt-4">{data.daily.map((item) => <div className="flex h-full min-w-12 flex-1 flex-col items-center justify-end gap-2" key={item.day}><span className="text-xs font-semibold text-lime-200">{formatNumber(item.views)}</span><div className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-emerald-700 to-lime-300 transition-all" style={{ height: `${Math.max(8, Number(item.views || 0) / maxDailyViews * 100)}%` }} /><span className="whitespace-nowrap text-[10px] text-emerald-100/40">{String(item.day).slice(5, 10)}</span></div>)}</div> : <div className="py-16 text-center text-sm text-emerald-100/40">暂无趋势数据</div>}
      </section>

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055]"><h2 className="m-0 border-b border-white/8 px-5 py-4 text-lg font-semibold">页面访问排行</h2><div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead className="text-xs text-emerald-100/40"><tr><th className="px-5 py-3 font-medium">页面</th><th className="px-5 py-3 text-right font-medium">PV</th><th className="px-5 py-3 text-right font-medium">UV</th></tr></thead><tbody className="divide-y divide-white/6">{data?.pages?.length ? data.pages.map((item) => <tr className="text-emerald-50/75" key={item.path}><td className="max-w-72 truncate px-5 py-3.5 text-white" title={item.path}>{item.path}</td><td className="px-5 py-3.5 text-right">{formatNumber(item.views)}</td><td className="px-5 py-3.5 text-right">{formatNumber(item.visitors)}</td></tr>) : <EmptyRow colSpan={3} />}</tbody></table></div></article>
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055]"><h2 className="m-0 border-b border-white/8 px-5 py-4 text-lg font-semibold">视频播放排行</h2><div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm"><thead className="text-xs text-emerald-100/40"><tr><th className="px-5 py-3 font-medium">视频</th><th className="px-5 py-3 text-right font-medium">播放</th><th className="px-5 py-3 text-right font-medium">完成</th></tr></thead><tbody className="divide-y divide-white/6">{data?.videos?.length ? data.videos.map((item) => <tr className="text-emerald-50/75" key={item.videoId}><td className="max-w-72 truncate px-5 py-3.5 text-white" title={item.title || item.videoId}>{item.title || item.videoId}</td><td className="px-5 py-3.5 text-right">{formatNumber(item.plays)}</td><td className="px-5 py-3.5 text-right">{formatNumber(item.completions)}</td></tr>) : <EmptyRow colSpan={3} />}</tbody></table></div></article>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.055]" aria-labelledby="analytics-recent-title"><h2 id="analytics-recent-title" className="m-0 border-b border-white/8 px-5 py-4 text-lg font-semibold">最近访问 IP</h2><div className="overflow-x-auto"><table className="w-full min-w-3xl border-collapse text-left text-sm"><thead className="text-xs text-emerald-100/40"><tr><th className="px-5 py-3 font-medium">时间</th><th className="px-5 py-3 font-medium">IP 地址</th><th className="px-5 py-3 font-medium">页面</th><th className="px-5 py-3 font-medium">来源</th></tr></thead><tbody className="divide-y divide-white/6">{data?.recent?.length ? data.recent.map((item, index) => <tr className="text-emerald-50/70" key={`${item.visitedAt}-${item.ip}-${index}`}><td className="whitespace-nowrap px-5 py-3.5">{formatDateTime(item.visitedAt)}</td><td className="whitespace-nowrap px-5 py-3.5 font-mono text-lime-200">{item.ip || '-'}</td><td className="max-w-64 truncate px-5 py-3.5 text-white" title={item.path}>{item.path}</td><td className="max-w-72 truncate px-5 py-3.5" title={item.referrer || ''}>{item.referrer || '-'}</td></tr>) : <EmptyRow colSpan={4} />}</tbody></table></div></section>
    </div>
  </main>
}
