import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowUpRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import './reference-home.css'

const navigation = [
  ['home', '首页', 'HOME'], ['experience', '个人经历', 'EXPERIENCE'],
  ['work', '个人作品', 'WORK'], ['about', '个人优势', 'ADVANTAGES'], ['contact', '联系我', 'CONTACT'],
]

export default function ReferenceHome({ works, portrait, imageWork }) {
  const railRef = useRef(null)
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const openerRef = useRef(null)
  const drag = useRef(null)
  const openTimer = useRef(null)
  const explored = useRef(false)
  const [active, setActive] = useState(null)
  const [opening, setOpening] = useState(null)
  const [section, setSection] = useState('home')
  const [edges, setEdges] = useState({ start: true, end: false })
  const cardRefs = useRef([])

  const handleCardTilt = (e, index) => {
    const card = cardRefs.current[index]
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.setProperty('--tilt-x', `${x * 14}deg`)
    card.style.setProperty('--tilt-y', `${-y * 14}deg`)
    card.style.setProperty('--glow-x', `${(x + 0.5) * 100}%`)
    card.style.setProperty('--glow-y', `${(y + 0.5) * 100}%`)
  }
  const handleCardTiltReset = (index) => {
    const card = cardRefs.current[index]
    if (!card) return
    card.style.setProperty('--tilt-x', '0deg')
    card.style.setProperty('--tilt-y', '0deg')
  }
  // Nine representative cards form a balanced, full-width home gallery.
  const cards = [
    works[9],
    { title: 'AI × 城市地标', label: 'IMAGE WORKS', poster: imageWork, href: `${import.meta.env.BASE_URL}works/image-works/` },
    works[3], ...works.slice(0, 3), ...works.slice(4, 6), works[7],
  ]

  useLayoutEffect(() => {
    // Center the three featured films together, without changing any card's size.
    const rail = railRef.current
    const center = () => {
      if (explored.current) return
      const priority = rail.querySelectorAll('[data-priority="true"]')
      const first = priority[0], last = priority[priority.length - 1]
      if (first && last) rail.scrollLeft = (first.offsetLeft + last.offsetLeft + last.offsetWidth) / 2 - rail.clientWidth / 2
    }
    const resize = new ResizeObserver(center)
    resize.observe(rail)
    center()
    return () => { resize.disconnect(); window.clearTimeout(openTimer.current) }
  }, [])

  const openWork = (event, work) => {
    if (work.href && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return
    event.preventDefault()
    if (openTimer.current) return
    openerRef.current = event.currentTarget
    setOpening(work.title)
    openTimer.current = window.setTimeout(() => {
      openTimer.current = null
      setOpening(null)
      if (work.href) window.location.assign(work.href)
      else setActive(work)
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 360)
  }

  useEffect(() => {
    const update = () => {
      const current = navigation.map(([id]) => document.getElementById(id))
        .filter(Boolean).filter(element => element.getBoundingClientRect().top <= 160)
        .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0]
      setSection(current?.id || 'home')
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    const rail = railRef.current
    const update = () => setEdges({ start: rail.scrollLeft <= 2, end: rail.scrollLeft >= rail.scrollWidth - rail.clientWidth - 2 })
    const wheel = event => {
      if (event.ctrlKey) return
      const unit = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? rail.clientWidth : 1
      const delta = (Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX) * unit
      const limit = rail.scrollWidth - rail.clientWidth
      if (!delta || limit <= 0 || (delta < 0 && rail.scrollLeft <= 0) || (delta > 0 && rail.scrollLeft >= limit - 1)) return
      event.preventDefault()
      explored.current = true
      rail.scrollLeft += delta
    }
    rail.addEventListener('wheel', wheel, { passive: false })
    rail.addEventListener('scroll', update, { passive: true })
    const resize = new ResizeObserver(update)
    resize.observe(rail)
    update()
    return () => { rail.removeEventListener('wheel', wheel); rail.removeEventListener('scroll', update); resize.disconnect() }
  }, [])

  useEffect(() => {
    if (!active) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const keydown = event => {
      if (event.key === 'Escape') setActive(null)
      if (event.key === 'Tab') {
        const nodes = [...dialogRef.current.querySelectorAll('button, video[controls], a[href]')]
        const first = nodes[0], last = nodes[nodes.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', keydown)
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', keydown); openerRef.current?.focus({ preventScroll: true }) }
  }, [active])

  const move = direction => {
    explored.current = true
    railRef.current.scrollBy({ left: direction * railRef.current.clientWidth * .7, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  const pointerDown = event => {
    if (!event.isPrimary || event.button !== 0) return
    explored.current = true
    drag.current = { x: event.clientX, y: event.clientY, scroll: railRef.current.scrollLeft, moved: false, pointer: event.pointerId }
  }
  const pointerMove = event => {
    const state = drag.current
    if (!state || state.pointer !== event.pointerId) return
    const x = event.clientX - state.x, y = event.clientY - state.y
    // Touch keeps natural vertical page scrolling. Mouse supports either drag axis.
    const delta = event.pointerType === 'touch' || Math.abs(x) >= Math.abs(y) ? x : y
    if (!state.moved && Math.abs(delta) < 7) return
    state.moved = true
    railRef.current.setPointerCapture(event.pointerId)
    railRef.current.scrollLeft = state.scroll - delta
  }
  const pointerEnd = event => {
    if (railRef.current.hasPointerCapture(event.pointerId)) railRef.current.releasePointerCapture(event.pointerId)
    if (drag.current) drag.current.pointer = null
  }

  return <>
    <header className="reference-header">
      <nav className="reference-nav" aria-label="主导航">
        {navigation.map(([id, chinese, english]) => <a key={id} href={`#${id}`} className={section === id ? 'is-current' : ''} aria-current={section === id ? 'location' : undefined}>
          <span>{chinese}</span><small>{english}</small>
        </a>)}
      </nav>
    </header>
    <section id="home" className="reference-home" aria-label="刘爱玲作品集首页">
      <div className="reference-hero">
        <div className="reference-copy">
          <p className="reference-hello">HELLO / 你好</p>
          <h1>我是刘爱玲</h1>
          <p className="reference-portfolio">PORTFOLIO</p>
          <h2>内容运营 / 营销策划</h2>
          <p className="reference-description">用影像讲故事，让内容被看见、被记住。</p>
          <div className="reference-actions">
            <a className="reference-primary" href="#home-works">查看我的作品 <ArrowUpRight size={16} /></a>
            <a className="reference-secondary" href="#about">个人优势</a>
          </div>
          <div className="reference-notes">
            <span>视频制作 × AI创作<br />品牌内容与传播</span>
            <span>重庆大学 · 艺术学硕士<br />内容策划 / 影像叙事</span>
          </div>
        </div>
        <div className="reference-portrait">
          <img src={portrait} alt="刘爱玲个人照片" fetchPriority="high" />
          <div className="reference-status"><b>NOW</b><span>内容运营 / 营销策划</span></div>
        </div>
      </div>
      <section id="home-works" className="reference-gallery" aria-label="首页精选作品">
        <div ref={railRef} className="reference-rail" tabIndex={0} aria-label="左右滑动浏览作品，也可使用上下滚轮" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onPointerLeave={event => { if (!event.buttons) drag.current = null }} onClickCapture={event => { if (drag.current?.moved) { event.preventDefault(); event.stopPropagation(); drag.current = null } }} onKeyDown={event => { if (event.target === event.currentTarget && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1) } }}>
          <div className="reference-track">
            {cards.map((work, index) => {
              const content = <><img src={work.poster} alt={`${work.title}封面`} draggable={false} loading={index < 8 ? 'eager' : 'lazy'} /><span className="reference-card-glow" aria-hidden="true" /><span className="reference-card-caption"><small>{work.label}</small><b>{work.title}</b><ArrowUpRight size={14} /></span></>
              const props = { className: `reference-card reference-card-${index + 1}${opening === work.title ? ' is-opening' : ''}`, 'aria-label': `查看${work.title}`, 'data-priority': index >= 3 && index <= 5, ref: el => cardRefs.current[index] = el, onPointerMove: e => handleCardTilt(e, index), onPointerLeave: () => handleCardTiltReset(index), onClick: event => openWork(event, work) }
              return work.href ? <a key={work.title} {...props} href={work.href} draggable={false}>{content}</a> : <button key={work.title} {...props} type="button">{content}</button>
            })}
          </div>
        </div>
        <div className="reference-gallery-tools"><span>SELECTED WORKS / 滚动探索</span><div><button type="button" aria-label="向左切换作品" disabled={edges.start} onClick={() => move(-1)}><ChevronLeft size={16} /></button><button type="button" aria-label="向右切换作品" disabled={edges.end} onClick={() => move(1)}><ChevronRight size={16} /></button></div></div>
      </section>
    </section>
    {active && <div className="reference-modal" onClick={event => { if (event.target === event.currentTarget) setActive(null) }}>
      <img className="reference-modal-background" src={active.poster} alt="" aria-hidden="true" />
      <section ref={dialogRef} className="reference-dialog" role="dialog" aria-modal="true" aria-labelledby="reference-dialog-title">
        <div className="reference-dialog-heading"><div><small>{active.label}</small><h2 id="reference-dialog-title">{active.title}</h2></div><button ref={closeRef} type="button" onClick={() => setActive(null)} aria-label="关闭作品，返回首页"><X size={22} /><span>返回首页</span></button></div>
        <video src={active.src} poster={active.poster} controls playsInline preload="metadata" />
        <p>{active.description}</p>
      </section>
    </div>}
  </>
}
