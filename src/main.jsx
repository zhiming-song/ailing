import { StrictMode, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import ReferenceHome from './ReferenceHome'
import AnalyticsDashboard from './AnalyticsDashboard'
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import shipingImage from './assets/shiping.jpg'
import shortMovieImage from './assets/shortMovie.jpg'
import giftImage from './assets/gift.jpg'
import photoImage from './assets/photo.jpg'
import lanyardPortrait from './assets/about-lanyard-photo.png'
import homePortraitNeon from './assets/home-portrait-neon.png'
import lanyardReferenceStrip from './assets/lanyard-reference-strip.png'
import workLiveGiftImage from './assets/work-live-gift.jpg'
import workShortFilmImage from './assets/work-short-film.jpg'
import workShortVideoImage from './assets/work-short-video-cover-et5.png'
import workImageWorksImage from './assets/work-image-works.png'
import imageGray from './assets/image-works/gray.png'
import imageGoldOne from './assets/image-works/gold-1.png'
import imageGoldTwo from './assets/image-works/gold-2.png'
import imageWhiteOne from './assets/image-works/white-1.png'
import imageWhiteTwo from './assets/image-works/white-2.png'
import imageWhiteThree from './assets/image-works/white-3.png'
import imageRedOne from './assets/image-works/red-1.png'
import imageRedTwo from './assets/image-works/red-2.png'
import imageRedThree from './assets/image-works/red-3.png'
import imageGreenOne from './assets/image-works/green-1.png'
import imageGreenTwo from './assets/image-works/green-2.png'
import imageGreenThree from './assets/image-works/green-3.png'
import duocaiLogo from './assets/logo-duocai.png'
import momoLogo from './assets/logo-momo.png'
import yuanliLogo from './assets/logo-yuanli.png'
import nioLogo from './assets/logo-nio.png'
import wechatQr from './assets/wechat-qr.jpg'
import { initAnalytics } from './utils/analytics'
import './styles.css'
import './portfolio-theme.css'
import 'virtual:uno.css'

const experiences = [
  {
    date: '2026.02 — 2026.06',
    company: '蔚来汽车重庆区域公司 · 市场部',
    role: '区域传播实习生',
    logo: nioLogo,
    short: '参与新车上市整合传播，负责区域内容与活动传播闭环。',
    bullets: ['新车上市整合传播：参与蔚来 ES9 上市传播项目，负责区域传播节奏规划，并联动线上内容传播、重庆分会场意向用户邀约，推动意向客户到场率达 88%。', '品牌 Social 传播：负责官方账号及区域矩阵账号内容运营，围绕品牌传播节点制定选题与内容策划，并利用 AI 工具提升内容生产质量，单条最高播放量 15w+，留资量环比增长 74.25%。', 'KOL 内容共创：统筹 15+KOL 开展品牌内容合作，推进选题沟通、拍摄执行及内容上线，拓展区域传播渠道，累计曝光 80w+，推动区域曝光排名由后段提升至中游，阶段性位列同组区域公司第二名。'],
  },
  {
    date: '2025.10 — 2026.01',
    company: '北京陌陌科技有限公司 · 事业部',
    role: '整合营销实习生',
    logo: momoLogo,
    short: '负责节目整合传播与直播礼物、音乐短片项目协同。',
    bullets: ['节目整合传播：独立负责 3 档 S 级节目全周期传播，围绕预热、上线及长尾阶段制定传播节奏与内容策略，统筹站内外内容分发及外部写手合作，结合节目热点策划话题内容，持续提升节目讨论度，站内外累计曝光 50w+，ROI 同比增长 69.33%。', '内容项目策划：全流程推进直播礼物及音乐短片等项目，覆盖创意策划、需求提报、制作协同及上线交付。推动直播礼物完成设计上线，单场直播最高消费 30 个+，并参与音乐短片《舍得》全流程制作，实现站内曝光 20w+。'],
  },
  {
    date: '2025.07 — 2025.09',
    company: '北京猿力科技有限公司 · 工具应用部',
    role: '内容营销实习生',
    logo: yuanliLogo,
    short: '围绕活动传播与专家 IP，参与内容策划和账号增长。',
    bullets: ['活动整合传播：参与 8 场平台商业化快闪活动，围绕活动节点策划线上预热、现场内容及后续传播，联动线上内容分发与线下活动场景，单场活动全平台累计曝光 23w+，单场活动 ROI 最高环比增长 766.43%。', '内容策略与增长：参与知识类专家 IP 内容定位及选题体系搭建，结合专家人设、用户内容需求及平台热点规划内容方向与发布节奏，并基于播放、互动及用户反馈持续复盘优化选题策略，推动账号涨粉 8000+，单条视频最高曝光量 5w+。'],
  },
  {
    date: '2023.02 — 2023.04',
    company: '贵州多彩新媒股份有限公司',
    role: '节目制作实习生',
    logo: duocaiLogo,
    short: '参与教育类节目与宣传片内容制作，完成节目 20+ 期。',
    bullets: ['参与教育类节目与宣传片的内容制作，负责选题策划与拍摄现场协调。', '协同现场执行、素材整理和后期沟通，推动节目从策划到播出的完整落地。'],
  },
]

const advantages = [
  { tag: 'AI制作', icon: '✨', points: ['将抽象想法快速转化为可执行的视觉方案', '具备文字、图片与视频的多模态内容整合能力', '通过快速测试不同创意方向，降低内容试错成本'] },
  { tag: '社媒运营', icon: '📱', points: ['熟悉不同平台的内容机制与用户表达习惯', '根据内容目标调整标题、结构、节奏与传播方式', '重视用户反馈与内容复盘，持续优化账号表达风格'] },
  { tag: '活动策划', icon: '🎉', points: ['从目标出发拆解活动流程与关键节点', '具备资源统筹、沟通推进与现场应变能力', '将一次性活动沉淀为可复用的执行流程与内容资产'] },
]

const workItems = {
  '长视频': [
    { title: '品牌长片 / 新车上市整合传播', meta: 'Campaign · 2026', tone: 'rose' },
    { title: '节目内容策划与全周期传播', meta: 'Content strategy · 2025', tone: 'moss' },
  ],
  '短视频': [
    { title: '品牌节点短视频内容', meta: '15w+ 单条播放', tone: 'ink' },
    { title: '专家 IP 账号选题体系', meta: '涨粉 8000+', tone: 'sand' },
  ],
  '直播礼物': [
    { title: '直播礼物创意与上线', meta: '站内曝光 20w+', tone: 'rose' },
    { title: '音乐短片项目协同', meta: 'Project management', tone: 'moss' },
  ],
  '图片作品': [
    { title: '线下活动视觉记录', meta: 'Event visual', tone: 'sand' },
    { title: '品牌社交内容视觉', meta: 'Social creative', tone: 'ink' },
  ],
}

const featuredProjects = [
  { slug: 'live-gift', label: '直播礼物', english: 'LIVE GIFT', image: workLiveGiftImage, tone: 'violet', title: '直播礼物创意与上线', meta: '北京陌陌科技有限公司 · 整合营销实习生', description: '围绕直播礼物与音乐短片项目，参与创意策划、需求提报、制作协同和上线交付，推动项目完成从概念到落地的完整闭环。', details: ['负责直播礼物项目的创意方案整理与需求沟通。', '协同制作、运营与设计团队推进上线交付。', '单项目实现站内曝光 20w+。'] },
  { slug: 'short-film', label: '短片', english: 'SHORT FILM', image: workShortFilmImage, tone: 'ink', title: '《高得》音乐短片', meta: 'MOMO MUSIC · 内容制作', description: '以音乐短片为载体，参与内容制作与现场协同，将人物、空间与情绪组织成具有传播记忆点的视觉内容。', details: ['参与音乐短片的内容制作与现场协调。', '协同拍摄现场、素材管理与后期沟通。', '完成从选题到成片的内容制作流程。'] },
  { slug: 'short-video', label: '短视频', english: 'SHORT VIDEO', image: workShortVideoImage, tone: 'blue', title: '蔚来 ES8 内容传播', meta: '蔚来汽车重庆区域公司 · 区域传播实习生', description: '围绕新车上市与区域传播节点，完成短视频选题、现场拍摄和社交媒体内容策划，让产品信息转化为更易被看见和分享的内容。', details: ['负责区域账号选题与短视频内容策划。', '参与新车上市整合传播与线下活动内容记录。', '单条内容最高播放量 15w+。'] },
  { slug: 'image-works', label: '图片作品', english: 'IMAGE WORKS', image: workImageWorksImage, tone: 'rose', title: '城市与品牌视觉记录', meta: 'Visual archive · Social creative', description: '通过城市、产品与现场视觉记录，整理具有统一氛围和传播识别度的图片素材，为品牌内容提供可延展的视觉基础。', details: ['完成品牌活动与产品场景的视觉记录。', '根据传播主题筛选、整理与组合图片素材。', '将现场信息转译为社交媒体可使用的视觉内容。'] },
]

const catalogProjects = [
  { slug: 'live-gift', number: '01', title: '直播礼物', english: 'LIVE GIFT', image: workLiveGiftImage },
  { slug: 'short-video', number: '02', title: '短视频', english: 'SHORT VIDEO', image: workShortVideoImage },
  { slug: 'short-film', number: '03', title: '短片', english: 'SHORT FILM', image: workShortFilmImage },
  { slug: 'image-works', number: '04', title: '图片作品', english: 'IMAGE WORKS', image: workImageWorksImage },
]

function handlePortfolioBack(event) {
  event.preventDefault()
  window.history.replaceState(null, '', `${import.meta.env.BASE_URL}#work`)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

const imageWorksImages = [
  { src: imageGray, colors: ['#293d73', '#e6a5be', '#081e49'] },
  { src: imageGoldOne, colors: ['#d9b251', '#b8e2e9', '#344d32'] },
  { src: imageGoldTwo, colors: ['#f3a64c', '#f8d29b', '#624528'] },
  { src: imageWhiteOne, colors: ['#6bb8e8', '#dceff7', '#4c815c'] },
  { src: imageWhiteTwo, colors: ['#ecf0e8', '#82909c', '#302d32'] },
  { src: imageWhiteThree, colors: ['#d8e7f7', '#7bb5ee', '#5d6572'] },
  { src: imageRedOne, colors: ['#a53d39', '#f0b26a', '#343944'] },
  { src: imageRedTwo, colors: ['#bd4935', '#f0c49d', '#423332'] },
  { src: imageRedThree, colors: ['#c95729', '#ffd169', '#69412d'] },
  { src: imageGreenOne, colors: ['#0f4734', '#a2b173', '#1d2929'] },
  { src: imageGreenTwo, colors: ['#245d39', '#b6cc55', '#6d7055'] },
  { src: imageGreenThree, colors: ['#314a2e', '#f4ad61', '#5e4936'] },
]

function MediaPlaceholder({ label = 'IMAGE / VIDEO PLACEHOLDER', className = '' }) {
  return <div className={`media-placeholder ${className}`}><span>{label}</span><i /></div>
}

function SpecularHeroButton({ children, onClick, variant = 'light' }) {
  const buttonRef = useRef(null)

  useEffect(() => {
    const button = buttonRef.current
    if (!button || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    let frame = 0
    let lastTime = performance.now()
    let idleAngle = 125
    let angle = idleAngle
    let pointerAngle = idleAngle
    let proximity = 0

    const handlePointerMove = (event) => {
      const rect = button.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distanceX = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right)
      const distanceY = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom)
      const distance = Math.hypot(distanceX, distanceY)
      const rawProximity = Math.max(0, 1 - distance / 220)

      proximity = rawProximity * rawProximity * (3 - 2 * rawProximity)
      pointerAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180 / Math.PI + 90
      button.style.setProperty('--spec-x', `${Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100))}%`)
      button.style.setProperty('--spec-y', `${Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100))}%`)
    }

    const animate = (now) => {
      const delta = Math.min((now - lastTime) / 1000, .05)
      lastTime = now
      idleAngle = (idleAngle + delta * 28) % 360
      const targetAngle = proximity > .02 ? pointerAngle : idleAngle
      const difference = ((targetAngle - angle + 540) % 360) - 180

      angle += difference * (1 - Math.exp(-delta * 7))
      button.style.setProperty('--spec-angle', `${angle}deg`)
      button.style.setProperty('--spec-intensity', String(.42 + proximity * .58))
      frame = requestAnimationFrame(animate)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    frame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return <button ref={buttonRef} type="button" className={`hero-pill specular-hero-button specular-hero-button-${variant}`} onClick={onClick}>
    <span className="specular-hero-button-glare" aria-hidden="true" />
    <span className="specular-hero-button-label">{children}</span>
  </button>
}

function CardSpreadGallery({ projects }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const center = (projects.length - 1) / 2

  return <div className={`card-spread-gallery ${activeIndex !== null ? 'is-expanded' : ''}`} role="region" aria-label="个人作品卡片展开画廊" onPointerLeave={() => setActiveIndex(null)}>
    <div className="card-spread-gallery-hint" aria-hidden="true">HOVER TO SPREAD</div>
    <div className="card-spread-gallery-deck">
      {projects.map((project, index) => {
        const distanceFromCenter = index - center
        const distanceFromActive = activeIndex === null ? 0 : index - activeIndex
        const push = activeIndex === null || distanceFromActive === 0 ? 0 : Math.sign(distanceFromActive) * Math.max(28, 92 - Math.abs(distanceFromActive) * 22)
        const angle = distanceFromCenter * 11 + (activeIndex === null || distanceFromActive === 0 ? 0 : Math.sign(distanceFromActive) * 3.5)
        const verticalOffset = activeIndex === index ? -48 : Math.abs(distanceFromActive) === 1 ? -9 : 0

        return <a className={`card-spread-gallery-card ${activeIndex === index ? 'is-active' : ''}`} href={`${import.meta.env.BASE_URL}works/${project.slug}/`} key={project.slug} onPointerEnter={() => setActiveIndex(index)} onFocus={() => setActiveIndex(index)} onBlur={() => setActiveIndex(null)} style={{ '--spread-x': `${distanceFromCenter * 165 + push}px`, '--spread-angle': `${angle}deg`, '--spread-y': `${verticalOffset}px`, '--spread-z': activeIndex === index ? 10 : Math.round(5 - Math.abs(distanceFromCenter)) + (project.slug === 'short-film' ? 1 : 0) }}>
          <img src={project.image} alt={`${project.title}封面图`} />
          <span className="card-spread-gallery-card-shade" aria-hidden="true" />
          <span className="card-spread-gallery-card-meta"><small>{project.number} / {project.english}</small><b>{project.title}</b><i>查看作品 <ArrowUpRight size={14} /></i></span>
        </a>
      })}
    </div>
    <div className="card-spread-gallery-pagination" aria-label="作品数量">{projects.map((project, index) => <span className={activeIndex === index ? 'is-active' : ''} key={project.slug}>0{index + 1}</span>)}</div>
  </div>
}

function LanyardAboutCard() {
  const [pose, setPose] = useState({ x: 0, y: 0, tilt: 0, turn: 0 })

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 2
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * 2
    setPose({ x: x * 30, y: y * 12, tilt: x * 7.5, turn: x * 10 })
  }

  const poseStyle = { '--lanyard-x': `${pose.x}px`, '--lanyard-y': `${pose.y}px`, '--lanyard-tilt': `${pose.tilt}deg`, '--lanyard-turn': `${pose.turn}deg`, '--strap-x': `${pose.x * .18}px`, '--strap-tilt': `${pose.tilt * .36}deg` }

  return <aside className="about-id about-lanyard" aria-label="刘爱玲个人挂绳卡片" style={poseStyle} onPointerMove={handlePointerMove} onPointerLeave={() => setPose({ x: 0, y: 0, tilt: 0, turn: 0 })}>
    <img className="about-lanyard-reference-strip" src={lanyardReferenceStrip} alt="" aria-hidden="true" />
    <div className="about-lanyard-card" role="img" aria-label="跟随鼠标摆动的刘爱玲个人照片卡片">
      <span className="about-lanyard-card-face about-lanyard-card-front"><img src={lanyardPortrait} alt="刘爱玲证件照" /></span>
    </div>
  </aside>
}

function ImageWorksCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const dragStart = useRef(null)
  const carouselRef = useRef(null)
  const activeImage = imageWorksImages[activeIndex]
  const itemCount = imageWorksImages.length

  const moveTo = (index) => setActiveIndex((index + itemCount) % itemCount)
  const getOffset = (index) => {
    const direct = index - activeIndex
    const wrapped = direct > itemCount / 2 ? direct - itemCount : direct < -itemCount / 2 ? direct + itemCount : direct
    return wrapped
  }

  const handlePointerDown = (event) => {
    dragStart.current = event.clientX
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerUp = (event) => {
    if (dragStart.current === null) return
    const distance = event.clientX - dragStart.current
    dragStart.current = null
    if (Math.abs(distance) > 34) moveTo(activeIndex + (distance < 0 ? 1 : -1))
  }

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return undefined
    const onWheel = (event) => {
      if (Math.abs(event.deltaX) + Math.abs(event.deltaY) < 12) return
      event.preventDefault()
      const direction = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      moveTo(activeIndex + (direction > 0 ? 1 : -1))
    }
    carousel.addEventListener('wheel', onWheel, { passive: false })
    return () => carousel.removeEventListener('wheel', onWheel)
  }, [activeIndex])

  return <main className="image-works-page" style={{ '--image-color-a': activeImage.colors[0], '--image-color-b': activeImage.colors[1], '--image-color-c': activeImage.colors[2] }}>
    <header className="site-header detail-header image-works-header"><a className="detail-back" href={`${import.meta.env.BASE_URL}#work`} onClick={handlePortfolioBack}><ArrowDownRight size={15} /> 返回作品集</a><span className="detail-index">PROJECT / 04</span></header>
    <div className="image-works-gradient image-works-gradient-one" aria-hidden="true" />
    <div className="image-works-gradient image-works-gradient-two" aria-hidden="true" />
    <p className="image-works-intro">以 AI 重构城市地标，让新车上市成为一场可被看见的城市叙事。</p>
    <section ref={carouselRef} className="image-works-carousel" tabIndex="0" aria-label="图片作品画廊" onKeyDown={(event) => { if (event.key === 'ArrowLeft') moveTo(activeIndex - 1); if (event.key === 'ArrowRight') moveTo(activeIndex + 1) }} onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { dragStart.current = null }}>
      <div className="image-works-stage">
        {imageWorksImages.map((image, index) => {
          const offset = getOffset(index)
          const visible = Math.abs(offset) <= 2
          return <button type="button" className={`image-works-card image-works-card-${offset} ${offset === 0 ? 'is-active' : ''}`} key={image.src} tabIndex={visible ? 0 : -1} aria-label={`查看第 ${index + 1} 张图片`} onClick={() => offset !== 0 && moveTo(index)} style={{ '--card-offset': offset, '--card-distance': Math.abs(offset), '--card-z': 10 - Math.abs(offset) }}>
            <img src={image.src} alt="" draggable="false" />
          </button>
        })}
      </div>
      <div className="image-works-controls" aria-label="图片切换按钮">
        <button type="button" aria-label="上一张图片" onPointerDown={(event) => event.stopPropagation()} onClick={() => moveTo(activeIndex - 1)}><ChevronLeft size={24} /></button>
        <button type="button" aria-label="下一张图片" onPointerDown={(event) => event.stopPropagation()} onClick={() => moveTo(activeIndex + 1)}><ChevronRight size={24} /></button>
      </div>
    </section>
  </main>
}

const shortFilmVideos = [
  { title: '音乐短片', label: 'SHORT FILM', src: `${import.meta.env.BASE_URL}videos/shede.m4v`, poster: `${import.meta.env.BASE_URL}videos/shede-poster.png`, description: '以陌陌官方歌曲《舍得》为情绪线索，拍摄一段关于“舍”与“得”的音乐短片。故事在靠近与放下之间展开，让歌曲里的情感纠葛落到更具体的人物关系中。' },
  { title: '招生宣传片', label: 'PROMOTIONAL FILM', src: `${import.meta.env.BASE_URL}videos/dreamers.m4v`, poster: `${import.meta.env.BASE_URL}videos/dreamers-poster.png`, description: '根据真实校友经历改编，从一个人的成长选择切入，讲述贵州经贸职院学子一路向前的过程。影片以小见大，让招生宣传不止介绍校园，也呈现学校的人文温度与成长陪伴。' },
  //{ title: '企业宣传片', label: 'CORPORATE FILM', src: `${import.meta.env.BASE_URL}videos/corporate.m4v`, poster: `${import.meta.env.BASE_URL}videos/corporate-poster.png`, description: '从业务场景、服务内容与团队协作出发，梳理公司的核心能力。用清晰、有节奏的画面，让观众快速理解企业正在做什么，以及能为客户带来什么。' },
]

const shortVideoVideos = [
  { title: 'AI全系车色', label: 'SHORT VIDEO', src: `${import.meta.env.BASE_URL}videos/short-video/ai-colors.mp4`, poster: `${import.meta.env.BASE_URL}videos/short-video/ai-colors-poster.png`, description: '围绕新车上市，用 AI + 城市地标的形式提升每一种车色的辨识度，全网曝光量 15 万。' },
  { title: '主播样片', label: 'SHORT VIDEO', src: `${import.meta.env.BASE_URL}videos/short-video/host-sample.mp4`, poster: `${import.meta.env.BASE_URL}videos/short-video/host-sample-poster.png`, description: '“人生潇洒肆意游，开台 ES8 解你愁”，通过朗朗上口的押韵口播与产品特色结合，增加视频的可看性，全网曝光量 5 万+。' },
  { title: '雪山狐狸', label: 'SHORT VIDEO', src: `${import.meta.env.BASE_URL}videos/short-video/snow-fox.mp4`, poster: `${import.meta.env.BASE_URL}videos/short-video/snow-fox-poster.png`, description: '结合“雪山狐狸”热点，将雪地、狐狸与产品信息放进同一段内容里。先用热点画面吸引停留，再通过场景和文案自然带出产品卖点。' },
  { title: '混剪预热', label: 'SHORT VIDEO', src: `${import.meta.env.BASE_URL}videos/short-video/journey-west.mov`, poster: `${import.meta.env.BASE_URL}videos/short-video/journey-west-poster.png`, description: '根据节目受众选择《西游记》这一熟悉入口，将经典桥段与节目内容重新拼接。观众先因熟悉感产生兴趣，再通过有趣混剪了解节目信息。' },
  { title: '飞驰人生转场', label: 'SHORT VIDEO', src: `${import.meta.env.BASE_URL}videos/short-video/pegasus-transition.mp4`, poster: `${import.meta.env.BASE_URL}videos/short-video/pegasus-transition-poster.png`, description: '从《飞驰人生》的经典名场面中提取速度感与情绪节奏，用熟悉的电影记忆连接本地城市，让内容更有代入感，全网曝光量 7 万+。' },
  { title: '果蝇恋爱', label: 'SHORT VIDEO', src: `${import.meta.env.BASE_URL}videos/short-video/fruit-fly-love.mp4`, poster: `${import.meta.env.BASE_URL}videos/short-video/fruit-fly-love-poster.png`, description: '把果蝇的生物话题放进节日里的“恋爱现场”，用拟人化的小剧情讲冷知识。让原本有距离感的科学内容变成轻松、好笑又值得转发的话题。' },
]

const homepageWorks = [
  { ...shortFilmVideos[0], poster: workShortFilmImage, description: '以人物与情绪为线索的音乐短片内容制作。' },
  { ...shortVideoVideos[0], title: 'AI × 全系车色', description: '围绕新车上市与 AI 影像完成的车型内容表达。' },
  { ...shortFilmVideos[1], description: '以真实人物与品牌故事为核心的宣传片协作。' },
  { ...shortVideoVideos[1], description: '镜头表现与人物表达结合的主播样片。' },
  { ...shortVideoVideos[2], description: '用奇幻叙事和节奏剪辑构建短视频氛围。' },
  { ...shortVideoVideos[3], description: '围绕节目节点完成的预热与混剪内容。' },
  { ...shortFilmVideos[2], description: '企业品牌叙事与宣传片内容协同。' },
  { ...shortVideoVideos[4], poster: workShortVideoImage, description: '以动势转场强化节奏与观看记忆点。' },
  { ...shortVideoVideos[5], description: '轻量化剧情表达与社交内容剪辑。' },
  { title: '直播礼物', label: 'LIVE GIFT', src: `${import.meta.env.BASE_URL}videos/cloud-dream.mp4`, poster: workLiveGiftImage, description: '直播礼物视觉创意与动态效果设计。' },
]

function DepthVideoCarousel({ videos, title, eyebrow, projectNumber, pageClass = '' }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [playingIndex, setPlayingIndex] = useState(null)
  const [playback, setPlayback] = useState(() => videos.map(() => ({ currentTime: 0, duration: 0 })))
  const dragStart = useRef(null)
  const videoRefs = useRef([])
  const wheelLocked = useRef(false)
  const count = videos.length

  const moveTo = (index) => {
    videoRefs.current.forEach((video) => video?.pause())
    setPlayingIndex(null)
    setActiveIndex((index + count) % count)
  }

  const getOffset = (index) => {
    let offset = index - activeIndex
    if (offset > count / 2) offset -= count
    if (offset < -count / 2) offset += count
    return offset
  }

  const formatTime = (value) => {
    if (!Number.isFinite(value) || value < 0) return '00:00'
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const updatePlayback = (index, values) => {
    setPlayback((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...values } : item))
  }

  const seekTo = (index, value) => {
    const video = videoRefs.current[index]
    if (!video) return
    const currentTime = Number(value)
    video.currentTime = currentTime
    updatePlayback(index, { currentTime })
  }

  const toggleVideoPlayback = (index) => {
    const video = videoRefs.current[index]
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
  }

  useEffect(() => {
    const handleSpaceToggle = (event) => {
      if (event.code !== 'Space' || event.repeat) return
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName))) return
      event.preventDefault()
      toggleVideoPlayback(activeIndex)
    }
    window.addEventListener('keydown', handleSpaceToggle)
    return () => window.removeEventListener('keydown', handleSpaceToggle)
  }, [activeIndex])

  const handlePointerDown = (event) => {
    dragStart.current = { x: event.clientX, y: event.clientY }
  }

  const handlePointerUp = (event) => {
    if (!dragStart.current) return
    const dx = event.clientX - dragStart.current.x
    const dy = event.clientY - dragStart.current.y
    dragStart.current = null
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return
    moveTo(activeIndex + (dx < 0 ? 1 : -1))
  }

  const handleWheel = (event) => {
    if (wheelLocked.current || Math.abs(event.deltaY) < 10) return
    event.preventDefault()
    wheelLocked.current = true
    moveTo(activeIndex + (event.deltaY > 0 ? 1 : -1))
    window.setTimeout(() => { wheelLocked.current = false }, 620)
  }

  return <main className={`short-film-page ${pageClass}`}>
    <header className="site-header detail-header"><a className="detail-back" href={`${import.meta.env.BASE_URL}#work`} onClick={handlePortfolioBack}><ArrowDownRight size={15} /> 返回作品集</a><span className="detail-index">PROJECT / {projectNumber}</span></header>
<section className={`short-film-depth section-shell ${videos.length === 2 ? 'short-film-depth-two-cards' : ''}`} tabIndex="0" aria-label={`${title}三维视频轮播`} onKeyDown={(event) => { if (event.key === 'ArrowLeft') moveTo(activeIndex - 1); if (event.key === 'ArrowRight') moveTo(activeIndex + 1) }} onWheel={handleWheel}>      <div className="short-film-depth-heading"><div><p>{eyebrow}</p></div><span>DRAG · SCROLL · ARROW KEYS</span></div>
      <div className="short-film-depth-stage" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerCancel={() => { dragStart.current = null }}>
        {videos.map((film, index) => {
          const offset = getOffset(index)
          const isActive = offset === 0
          const depth = Math.abs(offset)
          const direction = Math.sign(offset)
          const timing = playback[index]
          const layerStyle = { '--depth-layer': depth, '--depth-x': `${direction * Math.min(46, 27 + depth * 7)}vw`, '--depth-y': `${20 + depth * 11}px`, '--depth-z': `${-165 - depth * 100}px`, '--depth-rotate': `${direction * -(15 + depth * 3)}deg`, '--depth-scale': Math.max(.58, .86 - depth * .08), '--depth-opacity': Math.max(.08, .5 - depth * .12) }
          return <article className={`short-film-depth-card ${isActive ? 'is-active' : offset < 0 ? 'is-before' : 'is-after'}`} key={film.src} aria-hidden={!isActive} onClick={() => { if (!isActive) moveTo(index) }} style={layerStyle}>
            <div className="short-film-depth-video">
              <video ref={(node) => { videoRefs.current[index] = node }} src={film.src} poster={film.poster} preload="metadata" playsInline onClick={(event) => { if (!isActive) return; event.stopPropagation(); toggleVideoPlayback(index) }} onLoadedMetadata={(event) => updatePlayback(index, { duration: event.currentTarget.duration })} onTimeUpdate={(event) => updatePlayback(index, { currentTime: event.currentTarget.currentTime })} onPlay={() => { setPlayingIndex(index); videoRefs.current.forEach((video, videoIndex) => { if (videoIndex !== index) video?.pause() }) }} onPause={() => setPlayingIndex((playing) => playing === index ? null : playing)} onEnded={() => setPlayingIndex(null)} />
              {isActive && playingIndex !== index && <button type="button" className="short-film-depth-play" aria-label={`播放${film.title}`} onClick={(event) => { event.stopPropagation(); toggleVideoPlayback(index) }}><Play size={28} fill="currentColor" /></button>}
              {isActive && <div className="short-film-depth-progress" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}><time>{formatTime(timing.currentTime)}</time><input aria-label={`调整${film.title}播放进度`} type="range" min="0" max={timing.duration || 0} step="0.01" value={Math.min(timing.currentTime, timing.duration || 0)} style={{ '--video-progress': timing.duration ? `${timing.currentTime / timing.duration * 100}%` : '0%' }} onInput={(event) => seekTo(index, event.currentTarget.value)} onChange={(event) => seekTo(index, event.currentTarget.value)} /><time>{formatTime(timing.duration)}</time></div>}
              {!isActive && <span aria-hidden="true" />}
            </div>
            <footer className={film.description ? 'has-description' : ''}><div><small>{film.label}</small><b>{film.title}</b>{film.description && <p>{film.description}</p>}</div><em>0{index + 1}</em></footer>
          </article>
        })}
      </div>
      <div className="short-film-depth-controls"><button type="button" aria-label="上一个视频" onClick={() => moveTo(activeIndex - 1)}><ChevronLeft size={21} /></button><span><b>0{activeIndex + 1}</b> / 0{count}</span><button type="button" aria-label="下一个视频" onClick={() => moveTo(activeIndex + 1)}><ChevronRight size={21} /></button></div>
    </section>
  </main>
}

function ShortFilmDepthCarousel() {
  return <DepthVideoCarousel videos={shortFilmVideos} title="短片" eyebrow="SHORT FILM / DEPTH CAROUSEL" projectNumber="03" />
}

function ShortVideoDepthCarousel() {
  return <DepthVideoCarousel videos={shortVideoVideos} title="短视频" eyebrow="SHORT VIDEO / DEPTH CAROUSEL" projectNumber="02" pageClass="short-video-page" />
}

function LiveGiftCinema() {
  const videoRef = useRef(null)
  const playerRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const videoSource = `${import.meta.env.BASE_URL}videos/cloud-dream.mp4`
  const posterSource = `${import.meta.env.BASE_URL}videos/cloud-dream-poster.png`
  const backdropSource = `${import.meta.env.BASE_URL}images/live-gift-backdrop.png`

  const formatTime = (value) => {
    if (!Number.isFinite(value)) return '00:00'
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  const togglePlayback = async () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) await video.play()
    else video.pause()
  }

  const handlePlay = () => {
    setPlaying(true)
  }

  const handlePause = () => {
    setPlaying(false)
  }

  const seekTo = (value) => {
    const nextTime = Number(value)
    if (!videoRef.current) return
    videoRef.current.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const handlePointerMove = (event) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - .5
    const y = (event.clientY - bounds.top) / bounds.height - .5
    event.currentTarget.style.setProperty('--gift-tilt-x', `${y * -3.2}deg`)
    event.currentTarget.style.setProperty('--gift-tilt-y', `${x * 4.2}deg`)
    event.currentTarget.style.setProperty('--gift-shift-x', `${x * 9}px`)
    event.currentTarget.style.setProperty('--gift-shift-y', `${y * 7}px`)
  }

  const resetPointer = (event) => {
    event.currentTarget.style.setProperty('--gift-tilt-x', '0deg')
    event.currentTarget.style.setProperty('--gift-tilt-y', '0deg')
    event.currentTarget.style.setProperty('--gift-shift-x', '0px')
    event.currentTarget.style.setProperty('--gift-shift-y', '0px')
  }

  useEffect(() => {
    const handleSpaceToggle = (event) => {
      if (event.code !== 'Space' || event.repeat) return
      const target = event.target
      if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(target.tagName))) return
      event.preventDefault()
      togglePlayback()
    }
    window.addEventListener('keydown', handleSpaceToggle)
    return () => window.removeEventListener('keydown', handleSpaceToggle)
  }, [])

  return <main className="live-gift-cinema" style={{ '--gift-progress': duration ? `${currentTime / duration * 100}%` : '0%' }} tabIndex="0">
    <img className="live-gift-backdrop" src={backdropSource} alt="" aria-hidden="true" />
    <img className="live-gift-backdrop-focus" src={backdropSource} alt="" aria-hidden="true" />
    <div className="live-gift-backdrop-shade" aria-hidden="true" />
    <header className="live-gift-cinema-header"><a href={`${import.meta.env.BASE_URL}#work`} onClick={handlePortfolioBack}><ArrowDownRight size={14} /> 返回作品集</a><span>PROJECT / 01</span></header>
    <section className="live-gift-stage" aria-label="云上星梦直播礼物视频作品">
      <div className="live-gift-title-rail"><span className="live-gift-rail-label">LIVE GIFT</span><i aria-hidden="true" /><article className="live-gift-info-card"><small>01 / LIVE GIFT</small><h1>云上星梦</h1><div className="live-gift-info-tags"><span>直播赛事</span><span>礼物特效</span><span>梦幻应援</span></div><p>为直播赛事打造的专属礼物特效。以云海、星光与舞台为视觉核心，让一次送礼化为主播与观众共同参与的梦幻应援时刻。</p></article></div>
      <div ref={playerRef} className={`live-gift-player ${playing ? 'is-playing' : ''}`} onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
        <video ref={videoRef} src={videoSource} poster={posterSource} preload="metadata" playsInline muted={muted} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onPlay={handlePlay} onPause={handlePause} onEnded={handlePause} onClick={togglePlayback} />
        <button type="button" className="live-gift-play" aria-label={playing ? '暂停云上星梦' : '播放云上星梦'} onClick={togglePlayback}>{playing ? <Pause size={28} fill="currentColor" /> : <Play size={30} fill="currentColor" />}</button>
        <div className="live-gift-player-tools">
          <button type="button" aria-label={muted ? '打开声音' : '关闭声音'} onClick={() => setMuted((value) => !value)}>{muted ? <VolumeX size={17} /> : <Volume2 size={17} />}</button>
          <button type="button" aria-label="全屏播放" onClick={() => playerRef.current?.requestFullscreen?.()}><Maximize2 size={16} /></button>
        </div>
      </div>
      <aside className="live-gift-time-rail" aria-label="视频播放进度">
        <time>{formatTime(currentTime)}</time>
        <input aria-label="调整播放进度" type="range" min="0" max={duration || 0} step="0.01" value={Math.min(currentTime, duration || 0)} onInput={(event) => seekTo(event.currentTarget.value)} onChange={(event) => seekTo(event.currentTarget.value)} />
        <time>{formatTime(duration)}</time>
      </aside>
      <div className="live-gift-mobile-progress"><span>{formatTime(currentTime)}</span><input aria-label="调整播放进度" type="range" min="0" max={duration || 0} step="0.01" value={Math.min(currentTime, duration || 0)} onInput={(event) => seekTo(event.currentTarget.value)} onChange={(event) => seekTo(event.currentTarget.value)} /><span>{formatTime(duration)}</span></div>
    </section>
  </main>
}

function WorkDetailPage({ project }) {
  if (project.slug === 'image-works') return <ImageWorksCarousel />
  if (project.slug === 'short-video') return <ShortVideoDepthCarousel />
  if (project.slug === 'short-film') return <ShortFilmDepthCarousel />
  if (project.slug === 'live-gift') return <LiveGiftCinema />
  return <main className={`project-detail-page project-detail-${project.tone}`}>
    <header className="site-header detail-header"><a className="detail-back" href={`${import.meta.env.BASE_URL}#work`} onClick={handlePortfolioBack}><ArrowDownRight size={15} /> 返回作品集</a><span className="detail-index">PROJECT / {String(featuredProjects.indexOf(project) + 1).padStart(2, '0')}</span></header>
    <section className="project-detail-hero section-shell"><div className="project-detail-copy"><p className="eyebrow">{project.english}</p><p className="project-detail-title">{project.title}</p><p className="project-detail-description">{project.description}</p><div className="project-detail-meta">{project.meta}</div></div><div className="project-detail-image"><img src={project.image} alt={project.title} /></div></section>
    <section className="project-detail-body section-shell"><div className="detail-section-label">01 / PROJECT NOTES</div><div className="project-detail-notes"><h2>把内容<br /><i>做成可以被记住的画面。</i></h2><div>{project.details.map((detail) => <p key={detail}>{detail}</p>)}</div></div></section>
  </main>
}

function MotionPortfolioHero({ scrollTo }) {
  const heroRef = useRef(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const element = heroRef.current
      if (!element) return
      const range = Math.max(1, element.offsetHeight - window.innerHeight)
      setProgress(Math.max(0, Math.min(1, -element.getBoundingClientRect().top / range)))
    }
    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)
    return () => { window.removeEventListener('scroll', updateProgress); window.removeEventListener('resize', updateProgress) }
  }, [])

  const spread = Math.min(1, progress * 2.35)
  const center = (featuredProjects.length - 1) / 2

  return <section ref={heroRef} className="motion-portfolio-hero" style={{ '--hero-progress': progress }}>
    <div className="motion-portfolio-sticky">
      <div className="motion-portfolio-copy">
        <p className="eyebrow">LIU AILING / CONTENT OPERATOR</p>
        <h1>让内容<br /><i>被看见。</i></h1>
        <p className="motion-portfolio-subtitle">以影像、叙事与传播，把每一个想法变成有记忆点的作品。</p>
        <div className="motion-portfolio-actions"><button type="button" onClick={() => scrollTo('work')}>浏览作品 <ArrowUpRight size={15} /></button><button type="button" onClick={() => scrollTo('about')}>个人优势 <ArrowUpRight size={15} /></button></div>
      </div>
      <div className="motion-portfolio-stage" aria-label="首页精选作品">
        <div className="motion-portfolio-stage-label"><span>SELECTED WORK</span><span>SCROLL TO EXPLORE</span></div>
        {featuredProjects.map((project, index) => {
          const offset = index - center
          const x = offset * 174 * spread
          const y = (Math.abs(offset) * 17 - 8) * spread + (1 - spread) * 20
          const rotate = offset * 8.5 * spread + (1 - spread) * (index - 1.5) * 2
          const scale = .72 + spread * .28
          const opacity = index === 1 || spread > .14 ? 1 : .2 + spread * .8
          return <a className={`motion-portfolio-card motion-portfolio-card-${index + 1}`} href={`${import.meta.env.BASE_URL}works/${project.slug}/`} key={project.slug} style={{ '--card-x': `${x}px`, '--card-y': `${y}px`, '--card-rotate': `${rotate}deg`, '--card-scale': scale, '--card-opacity': opacity, '--card-depth': 10 - Math.abs(offset) }}>
            <img src={project.image} alt={`${project.label}作品封面`} />
            <span className="motion-portfolio-card-shade" aria-hidden="true" />
            <span className="motion-portfolio-card-meta"><small>0{index + 1} / {project.english}</small><b>{project.label}</b><i>查看作品 <ArrowUpRight size={14} /></i></span>
          </a>
        })}
      </div>
      <div className="motion-portfolio-scroll"><span>SCROLL</span><i aria-hidden="true" /></div>
    </div>
  </section>
}

function ModalWorksHome() {
  const [activeWork, setActiveWork] = useState(null)
  const [playing, setPlaying] = useState(false)
  const viewportRef = useRef(null)
  const videoRef = useRef(null)
  const drag = useRef({ active: false, startX: 0, startY: 0, scrollLeft: 0, moved: false })

  useEffect(() => {
    if (!activeWork) return undefined
    const closeOnEscape = (event) => { if (event.key === 'Escape') setActiveWork(null) }
    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', closeOnEscape); document.body.style.overflow = '' }
  }, [activeWork])

  useEffect(() => {
    videoRef.current?.pause()
    setPlaying(false)
  }, [activeWork])

  const openWork = (work) => { if (drag.current.moved) { drag.current.moved = false; return }; setActiveWork(work) }
  const handlePointerDown = (event) => {
    const viewport = viewportRef.current
    if (!viewport) return
    drag.current = { active: true, startX: event.clientX, startY: event.clientY, scrollLeft: viewport.scrollLeft, moved: false }
    viewport.setPointerCapture?.(event.pointerId)
  }
  const handlePointerMove = (event) => {
    const viewport = viewportRef.current
    if (!viewport || !drag.current.active) return
    const distanceX = event.clientX - drag.current.startX
    const distanceY = event.clientY - drag.current.startY
    const distance = Math.abs(distanceY) > Math.abs(distanceX) ? distanceY : distanceX
    if (Math.abs(distance) > 6) drag.current.moved = true
    viewport.scrollLeft = drag.current.scrollLeft - distance
  }
  const handlePointerUp = () => { drag.current.active = false }
  const moveGallery = (direction) => viewportRef.current?.scrollBy({ left: direction * viewportRef.current.clientWidth * .86, behavior: 'smooth' })

  return <main className="modal-works-home">
    <section className="modal-works-intro section-shell">
      <div><p className="eyebrow">LIU AILING / CONTENT OPERATOR</p><h1>把作品<br /><i>放到眼前。</i></h1><p className="modal-works-description">视频、叙事与传播的现场记录。拖动卡片，打开每一个作品。</p></div>
      <div className="modal-works-intro-note"><span>SELECTED WORKS</span><b>10 PROJECTS</b><small>DRAG TO EXPLORE</small></div>
    </section>
    <section className="modal-works-gallery section-shell" aria-label="精选作品">
      <div className="modal-works-gallery-head"><span>SELECTED WORK / 2023—2026</span><span>01—10</span></div>
      <div className="modal-works-viewport-wrap"><button type="button" className="modal-works-arrow modal-works-arrow-left" aria-label="向左切换作品" onClick={() => moveGallery(-1)}><ChevronLeft size={20} /></button><div ref={viewportRef} className="modal-works-viewport" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
        <div className="modal-works-track">{homepageWorks.map((work, index) => <button type="button" className="modal-work-card" key={`${work.title}-${index}`} onClick={() => openWork(work)}>
          <span className="modal-work-card-image"><img src={work.poster} alt={`${work.title}封面`} /></span><span className="modal-work-card-shade" aria-hidden="true" /><span className="modal-work-card-meta"><small>0{index + 1} / {work.label}</small><b>{work.title}</b><i>{work.description}</i><em>OPEN <ArrowUpRight size={14} /></em></span>
        </button>)}</div>
      </div><button type="button" className="modal-works-arrow modal-works-arrow-right" aria-label="向右切换作品" onClick={() => moveGallery(1)}><ChevronRight size={20} /></button></div>
      <div className="modal-works-gallery-foot"><span>← DRAG →</span><div className="modal-works-progress"><i /></div><span>CLICK TO VIEW</span></div>
    </section>
    {activeWork && <div className="modal-work-backdrop" role="presentation" onClick={() => setActiveWork(null)}><section className="modal-work-dialog" role="dialog" aria-modal="true" aria-label={`${activeWork.title}作品详情`} onClick={(event) => event.stopPropagation()}>
      <div className="modal-work-dialog-bg" style={{ backgroundImage: `url(${activeWork.poster})` }} aria-hidden="true" /><button type="button" className="modal-work-close" aria-label="关闭作品详情" onClick={() => setActiveWork(null)}>×</button>
      <div className="modal-work-dialog-content"><div className="modal-work-player"><video ref={videoRef} src={activeWork.src} poster={activeWork.poster} controls playsInline preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} /><button type="button" className={`modal-work-play ${playing ? 'is-playing' : ''}`} aria-label="播放作品" onClick={() => videoRef.current?.play()}><Play size={30} fill="currentColor" /></button></div><div className="modal-work-dialog-copy"><small>{activeWork.label}</small><h2>{activeWork.title}</h2><p>{activeWork.description}</p><span>ESC / CLICK OUTSIDE TO CLOSE</span></div></div>
    </section></div>}
  </main>
}

function PortfolioApp() {
  const [activeTab, setActiveTab] = useState('长视频')
  const [heroOffset, setHeroOffset] = useState({ x: 0, y: 0 })
  const [activeSkill, setActiveSkill] = useState('')
  const [selectedContactTags, setSelectedContactTags] = useState([])
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname)

  useEffect(() => {
    const handleRouteChange = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  useLayoutEffect(() => {
    if (window.location.hash !== '#work') return undefined
    const workSection = document.getElementById('work')
    if (!workSection) return undefined
    const root = document.documentElement
    const previousScrollBehavior = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    window.scrollTo(0, workSection.offsetTop)
    root.style.scrollBehavior = previousScrollBehavior
    return undefined
  }, [currentPath])

  useEffect(() => {
    const items = [...document.querySelectorAll('.experience-item')]
    if (!items.length || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-visible', entry.isIntersecting))
    }, { rootMargin: '-12% 0px -34% 0px', threshold: 0.08 })
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])
useEffect(() => {
    const stickyIntro = document.querySelector('.experience-sticky-intro')
    const finalNode = document.querySelector('.experience-item-4 .experience-node')
    const experience = stickyIntro?.closest('.experience')
    if (!stickyIntro || !finalNode || !experience) return undefined

    let released = false

    // 最后一个节点进入屏幕时释放固定，并保留标题原来的占位高度。
    const updateStickyRelease = () => {
      const shouldRelease = finalNode.getBoundingClientRect().top <= window.innerHeight
      if (shouldRelease === released) return

      released = shouldRelease
      if (shouldRelease) {
        const experienceRect = experience.getBoundingClientRect()
        const introRect = stickyIntro.getBoundingClientRect()
        const basePaddingTop = getComputedStyle(experience).paddingTop
        experience.style.setProperty('--experience-base-padding-top', basePaddingTop)
        experience.style.setProperty('--experience-sticky-height', `${stickyIntro.offsetHeight}px`)
        stickyIntro.style.setProperty('--experience-sticky-release-top', `${introRect.top - experienceRect.top}px`)
        stickyIntro.style.setProperty('--experience-sticky-release-left', `${introRect.left - experienceRect.left}px`)
        stickyIntro.style.setProperty('--experience-sticky-release-right', `${experienceRect.right - introRect.right}px`)
        experience.classList.add('is-sticky-released')
        stickyIntro.classList.add('is-released')
      } else {
        stickyIntro.classList.remove('is-released')
        stickyIntro.style.removeProperty('--experience-sticky-release-top')
        stickyIntro.style.removeProperty('--experience-sticky-release-left')
        stickyIntro.style.removeProperty('--experience-sticky-release-right')
        experience.classList.remove('is-sticky-released')
      }
    }

    const syncStickyRelease = () => updateStickyRelease()

    syncStickyRelease()
    window.addEventListener('scroll', updateStickyRelease, { passive: true })
    window.addEventListener('resize', syncStickyRelease)
    return () => {
      window.removeEventListener('scroll', updateStickyRelease)
      window.removeEventListener('resize', syncStickyRelease)
      stickyIntro.classList.remove('is-released')
      stickyIntro.style.removeProperty('--experience-sticky-release-top')
      stickyIntro.style.removeProperty('--experience-sticky-release-left')
      stickyIntro.style.removeProperty('--experience-sticky-release-right')
      experience.classList.remove('is-sticky-released')
      experience.style.removeProperty('--experience-base-padding-top')
      experience.style.removeProperty('--experience-sticky-height')
    }
  }, []) 
 const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const detailSlug = currentPath.split('/').filter(Boolean).pop()
  const detailProject = featuredProjects.find((project) => project.slug === detailSlug)
  if (detailProject) return <WorkDetailPage project={detailProject} />

  return (
    <main>
      <ReferenceHome works={homepageWorks} portrait={homePortraitNeon} imageWork={imageGray} />

      <section id="experience" className="experience section-shell">
        <div className="experience-sticky-intro">
          <div className="section-label">01 / EXPERIENCE</div>
          <p className="experience-sticky-kicker">THE JOURNEY / 个人经历</p>
        </div>
        <div className="experience-journey-heading">
          <h2>Personal <i>Experience</i></h2>
          <span>每一段经历，都在成为现在的我。</span>
        </div>
        <div className="experience-timeline">
          <div className="experience-timeline-line" aria-hidden="true" />
          {experiences.map((item, index) => <article className={`experience-item experience-item-${index + 1}`} key={item.date}>
            <div className="experience-node" aria-hidden="true"><span>0{index + 1}</span></div>
            <div className={`experience-card experience-card-${index + 1}`} onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const x = ((event.clientX - rect.left) / rect.width - .5) * 9; const y = ((event.clientY - rect.top) / rect.height - .5) * 7; event.currentTarget.style.setProperty('--card-x', `${x}px`); event.currentTarget.style.setProperty('--card-y', `${y}px`) }} onMouseLeave={(event) => { event.currentTarget.style.setProperty('--card-x', '0px'); event.currentTarget.style.setProperty('--card-y', '0px') }}>
              <div className="experience-card-top"><em>{item.date}</em></div>
              <h3 className="experience-company-trigger" tabIndex="0">{item.company}</h3>
              <div className="experience-logo" aria-hidden="true"><img src={item.logo} alt="" /></div>
              <p className="role">{item.role}</p>
              <div className="experience-card-copy">{item.bullets.map((bullet) => <p key={bullet}>{bullet}</p>)}</div>
            </div>
          </article>)}
        </div>
      </section>

      <section id="work" className="work section-shell">
        <div className="section-label">02 / SELECTED WORK</div>
        <div className="work-page-heading">
          <p>THE CREATIVE ARCHIVE / 个人作品</p>
          <h2>Personal <i>Works</i></h2>
          <span>用作品记录每一次创意与表达。</span>
        </div>
        <CardSpreadGallery projects={catalogProjects} />
      </section>

      <section id="about" className="about about-page section-shell">
        <div className="section-label">03 / ADVANTAGES</div>
        <div className="advantages-heading">
          <p>STRENGTHS / 个人优势</p>
          <h2>Advantages</h2>
          <span>用数据与创意，让内容被看见、被记住。</span>
        </div>
        <div className="advantages-grid">
          {advantages.map((item, index) => (
            <div className={`advantage-card advantage-card-${index + 1}`} key={item.tag} onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const x = ((event.clientX - rect.left) / rect.width - .5) * 6; const y = ((event.clientY - rect.top) / rect.height - .5) * 4; event.currentTarget.style.setProperty('--card-x', `${x}px`); event.currentTarget.style.setProperty('--card-y', `${y}px`) }} onMouseLeave={(event) => { event.currentTarget.style.setProperty('--card-x', '0px'); event.currentTarget.style.setProperty('--card-y', '0px') }}>
              <span className="advantage-card-index">0{index + 1} / CORE</span>
              <span className="advantage-icon" aria-hidden="true">{item.icon}</span>
              <h3>{item.tag}</h3>
              <ul>{item.points.map((point) => <li key={point}>{point}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="contact contact-page section-shell">
        <div className="contact-bg-word" aria-hidden="true">LET’S BUILD</div>
        <div className="section-label">05 / CONTACT</div>
        <div className="contact-layout">
          <div className="contact-left-rail">
            <div className="contact-content">
              <p className="eyebrow">LET’S TALK</p>
              <h2>下一段经历，也许可以<br />一起创造。</h2>
              <div className="contact-tags" aria-label="擅长方向">
                {['内容运营', '品牌传播', '整合营销', '社媒运营', 'KOL 共创', 'AI 内容创作'].map((tag) => {
                  const isSelected = selectedContactTags.includes(tag)
                  return <button key={tag} type="button" className={isSelected ? 'is-selected' : ''} aria-pressed={isSelected} onClick={() => setSelectedContactTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])}>{tag}</button>
                })}
              </div>
              <div className="contact-direct-line"><a href="mailto:1914902866@qq.com"><span className="contact-mail-icon" aria-hidden="true">📮</span>1914902866@qq.com</a></div>
            </div>
          </div>
          <aside className="contact-connect-card" aria-label="微信联系二维码">
            <div className="contact-qr-frame"><img src={wechatQr} alt="微信二维码，扫码添加我为好友" /></div>
            <div className="contact-connect-copy"><strong>扫码联系我</strong></div>
          </aside>
          <div className="contact-ambient" aria-hidden="true" />
        </div>
        <div className="contact-footer"><span>LIU AILING / CONTENT OPERATOR</span><span>OPEN TO WORK</span><span>© 2026</span></div>
      </section>
    </main>
  )
}

/**
 * 根据当前路径选择作品集或隐藏监控页面
 *
 * @return 当前路由页面
 */
function App() {
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'
  const analyticsPath = `${import.meta.env.BASE_URL}analytics`.replace(/\/+$/, '')

  if (currentPath === analyticsPath || currentPath === '/analytics') return <AnalyticsDashboard />
  return <PortfolioApp />
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
initAnalytics()
