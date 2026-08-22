import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDownRight, ArrowUpRight, Mail, Paperclip, Phone, Play, Sparkles } from 'lucide-react'
import shipingImage from './assets/shiping.jpg'
import shortMovieImage from './assets/shortMovie.jpg'
import giftImage from './assets/gift.jpg'
import photoImage from './assets/photo.jpg'
import aboutPhoto from './assets/about-id-photo.jpg'
import workLiveGiftImage from './assets/work-live-gift.jpg'
import workShortFilmImage from './assets/work-short-film.jpg'
import workShortVideoImage from './assets/work-short-video.jpg'
import workImageWorksImage from './assets/work-image-works.png'
import duocaiLogo from './assets/logo-duocai.png'
import momoLogo from './assets/logo-momo.png'
import yuanliLogo from './assets/logo-yuanli.png'
import nioLogo from './assets/logo-nio.png'
import './styles.css'

const experiences = [
  {
    date: '2023.02 — 2023.04',
    company: '贵州多彩新媒股份有限公司',
    role: '节目制作实习生',
    logo: duocaiLogo,
    short: '参与教育类节目与宣传片内容制作，完成节目 20+ 期。',
    bullets: ['参与教育类节目与宣传片的内容制作，负责选题策划与拍摄现场协调。', '协同现场执行、素材整理和后期沟通，推动节目从策划到播出的完整落地。'],
  },
  {
    date: '2025.07 — 2025.09',
    company: '北京猿力科技有限公司 · 工具应用部',
    role: '内容营销实习生',
    logo: yuanliLogo,
    short: '围绕活动传播与专家 IP，参与内容策划和账号增长。',
    bullets: ['参与 8 场平台商业化快闪活动，负责活动节点策划、现场内容及后续传播协同，累计曝光 23w+。', '参与知识类专家 IP 内容定位及选题体系搭建，推动账号涨粉 8000+。'],
  },
  {
    date: '2025.10 — 2026.01',
    company: '北京陌陌科技有限公司 · 事业部',
    role: '整合营销实习生',
    logo: momoLogo,
    short: '负责节目整合传播与直播礼物、音乐短片项目协同。',
    bullets: ['独立负责 3 档 S 级节目全周期传播，围绕预热、上线及长尾阶段制定传播节奏与内容策略。', '全流程推进直播礼物及音乐短片等项目，覆盖创意策划、需求提报、制作协同及上线交付，单项目站内曝光 20w+。'],
  },
  {
    date: '2026.02 — 2026.06',
    company: '蔚来汽车重庆区域公司 · 市场部',
    role: '区域传播实习生',
    logo: nioLogo,
    short: '参与新车上市整合传播，负责区域内容与活动传播闭环。',
    bullets: ['参与新车上市整合传播，负责区域传播节奏规划、线上内容传播与线下活动闭环，单场曝光约 88%。', '负责官方账号及区域矩阵内容运营，围绕品牌传播节点制定选题与内容策划，单条最高播放量 15w+。', '统筹 15+ KOL 开展品牌内容合作，累计曝光 80w+，推动区域曝光排名由后段提升至中游。'],
  },
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
  { slug: 'short-film', number: '02', title: '短片', english: 'SHORT FILM', image: workShortFilmImage },
  { slug: 'short-video', number: '03', title: '短视频', english: 'SHORT VIDEO', image: workShortVideoImage },
  { slug: 'image-works', number: '04', title: '图片作品', english: 'IMAGE WORKS', image: workImageWorksImage },
]

function MediaPlaceholder({ label = 'IMAGE / VIDEO PLACEHOLDER', className = '' }) {
  return <div className={`media-placeholder ${className}`}><span>{label}</span><i /></div>
}

function WorkDetailPage({ project }) {
  const base = import.meta.env.BASE_URL
  return <main className={`project-detail-page project-detail-${project.tone}`}>
    <header className="site-header detail-header"><a className="detail-back" href={`${base}#work`}><ArrowDownRight size={15} /> 返回作品集</a><span className="detail-index">PROJECT / {String(featuredProjects.indexOf(project) + 1).padStart(2, '0')}</span></header>
    <section className="project-detail-hero section-shell"><div className="project-detail-copy"><p className="eyebrow">{project.english}</p><h1>{project.label}</h1><p className="project-detail-title">{project.title}</p><p className="project-detail-description">{project.description}</p><div className="project-detail-meta">{project.meta}</div></div><div className="project-detail-image"><img src={project.image} alt={project.title} /></div></section>
    <section className="project-detail-body section-shell"><div className="detail-section-label">01 / PROJECT NOTES</div><div className="project-detail-notes"><h2>把内容<br /><i>做成可以被记住的画面。</i></h2><div>{project.details.map((detail) => <p key={detail}>{detail}</p>)}</div></div></section>
  </main>
}

function App() {
  const [activeTab, setActiveTab] = useState('长视频')
  const [heroOffset, setHeroOffset] = useState({ x: 0, y: 0 })
  const [helloActive, setHelloActive] = useState(false)
  const [activeSkill, setActiveSkill] = useState('')
  const [activeExperience, setActiveExperience] = useState(null)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const detailSlug = window.location.pathname.split('/').filter(Boolean).pop()
  const detailProject = featuredProjects.find((project) => project.slug === detailSlug)
  if (detailProject) return <WorkDetailPage project={detailProject} />

  return (
    <main>
      <header className="site-header">
        <nav className="site-nav">
          <button onClick={() => scrollTo('about')}>关于我</button>
          <button onClick={() => scrollTo('experience')}>个人经历</button>
          <button onClick={() => scrollTo('work')}>个人作品</button>
        </nav>
        <button className="avatar-button" onClick={() => scrollTo('about')} aria-label="查看关于我"><img src={`${import.meta.env.BASE_URL}media/avatar-full.png`} alt="刘爱玲头像" /></button>
      </header>

      <section id="top" className="hero section-shell" onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setHeroOffset({ x: ((event.clientX - rect.left) / rect.width - .5) * 14, y: ((event.clientY - rect.top) / rect.height - .5) * 10 }) }} onMouseLeave={() => setHeroOffset({ x: 0, y: 0 })}>
        <div className="hero-wash" />
        <div className="hero-grid" />
        <div className="hero-foreground" style={{ '--mx': `${heroOffset.x}px`, '--my': `${heroOffset.y}px` }}>
          <div className="hero-glass-panel" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow">WELCOME TO MY PORTFOLIO</p>
            <h1>刘爱玲</h1>
            <p className="hero-role">内容运营 · CONTENT OPERATOR</p>
            <p className="hero-intro">把复杂的传播目标，变成有人愿意看、愿意分享的内容。</p>
            <div className="hero-actions">
              <button className="hero-pill hero-pill-light" onClick={() => scrollTo('experience')}>个人经历 <ArrowUpRight size={15} /></button>
              <button className="hero-pill hero-pill-dark" onClick={() => scrollTo('work')}>个人作品 <ArrowUpRight size={15} /></button>
            </div>
          </div>
        </div>
        <div className="project-orbit" aria-label="项目作品入口">
          {featuredProjects.map((project, index) => <button key={project.slug} className={`project-orbit-item orbit-${index + 1}`} onClick={() => { window.location.href = `${import.meta.env.BASE_URL}works/${project.slug}/` }}><span className="orbit-image"><img src={project.image} alt="" /></span><small>{project.label}</small></button>)}
        </div>
      </section>

      <section id="about" className="about about-page section-shell">
        <div className="section-label">01 / ABOUT ME</div>
        <div className="about-layout">
          <aside className="about-id" aria-label="刘爱玲个人照片工牌">
            <div className="id-clip" />
            <div className="id-card">
              <div className="id-photo-frame"><img src={aboutPhoto} alt="刘爱玲个人照片" /><button type="button" className={`id-bubble ${helloActive ? 'is-active' : ''}`} onClick={() => setHelloActive((active) => !active)} aria-pressed={helloActive}><span>hello!</span><Sparkles size={13} /></button></div>
              <span className="id-shape id-shape-one" /><span className="id-shape id-shape-two" /><span className="id-shape id-shape-three" />
            </div>
          </aside>
          <div className="about-panel">
            <div className="about-intro-box"><span className="about-kicker">A LITTLE ABOUT ME</span><p>我是刘爱玲，一名内容运营，擅长视频制作、品牌传播与社交媒体内容策划。</p></div>
            <div className="about-contact-line"><a href="tel:18286653241"><Phone size={14} /> 182 8665 3241</a><a href="mailto:1914902866@qq.com"><Mail size={14} /> 1914902866@qq.com</a></div>
            <div className="about-info-grid">
              <div className="about-info-block education-block"><h3>EDUCATION</h3><article><span className="info-dot" /><div><b>重庆大学</b><small>艺术学 · 硕士</small><em>2024.09 — 2027.06</em></div></article><article><span className="info-dot" /><div><b>西北民族大学</b><small>广播电视编导 · 学士</small><em>2019.09 — 2023.05</em></div></article></div>
              <div className="about-info-block skills-block"><h3>SKILLS</h3><div className="skill-tags">{['视频制作', '用户画像', '数据分析', '热点捕捉', '英语六级', '剪映', '即梦', '可画'].map((skill) => <button type="button" className={`skill-tag ${activeSkill === skill ? 'is-active' : ''}`} key={skill} onClick={() => setActiveSkill((current) => current === skill ? '' : skill)} aria-pressed={activeSkill === skill}>{skill}</button>)}</div></div>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className="experience section-shell">
        <div className="section-label">02 / EXPERIENCE</div>
        <div className="experience-clothesline"><div className="experience-rope" aria-hidden="true" />{experiences.map((item, index) => <button type="button" className={`experience-photo-frame experience-photo-frame-${index + 1} ${activeExperience === index ? 'is-active' : ''}`} key={item.date} onClick={() => setActiveExperience(activeExperience === index ? null : index)} aria-expanded={activeExperience === index} onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); const x = ((event.clientX - rect.left) / rect.width - .5) * 8; const y = ((event.clientY - rect.top) / rect.height - .5) * 6; event.currentTarget.style.setProperty('--frame-x', `${x}px`); event.currentTarget.style.setProperty('--frame-y', `${y}px`) }} onMouseLeave={(event) => { event.currentTarget.style.setProperty('--frame-x', '0px'); event.currentTarget.style.setProperty('--frame-y', '0px') }}><span className="experience-clothespin" aria-hidden="true" /><span className="experience-frame-paper"><span className="experience-frame-date">{item.date}</span><span className="experience-frame-photo"><img src={item.logo} alt={`${item.company} Logo`} /></span><span className="experience-frame-company">{item.company}</span><span className="experience-frame-role">{item.role}</span><span className="experience-frame-summary">{item.short}</span></span></button>)}</div>
        {activeExperience !== null && <div className="experience-detail-popover"><div><span className="eyebrow">EXPERIENCE 0{activeExperience + 1}</span><h3>{experiences[activeExperience].company}</h3><p className="experience-detail-role">{experiences[activeExperience].role} · {experiences[activeExperience].date}</p></div><div className="experience-detail-bullets">{experiences[activeExperience].bullets.map((bullet) => <p key={bullet}>{bullet}</p>)}</div><button type="button" onClick={() => setActiveExperience(null)} aria-label="关闭经历详情">×</button></div>}
      </section>

      <section id="work" className="work section-shell">
        <div className="section-label">03 / SELECTED WORK</div>
        <div className="work-board">
          <div className="work-board-header"><p>CONTENTS <span>›››</span></p><small>WORK TABLE / 04 PROJECTS</small></div>
          <div className="work-board-shelf shelf-one" aria-hidden="true" /><div className="work-board-shelf shelf-two" aria-hidden="true" /><div className="work-board-tool tool-pencil" aria-hidden="true" /><div className="work-board-tool tool-ruler" aria-hidden="true" />
          <div className="work-papers">{catalogProjects.map((project, index) => <a className={`work-paper work-paper-${index + 1}`} href={`${import.meta.env.BASE_URL}works/${project.slug}/`} key={project.slug}>
            <div className="work-paper-clip" aria-hidden="true"><Paperclip size={42} strokeWidth={3} /></div>
            <div className="work-paper-holes" aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <div className="work-paper-fold" aria-hidden="true" />
            <div className="work-paper-inner"><div className="work-paper-kicker">{project.number} / {project.english}</div><div className="work-paper-image"><img src={project.image} alt={`${project.title}封面图`} /></div><div className="work-paper-meta"><span>PROJECT {project.number}</span><h3>{project.number} {project.title}</h3><p>{project.english}</p></div></div>
          </a>)}</div>
        </div>
      </section>

      <section id="contact" className="contact section-shell"><div className="contact-bg-word">HELLO</div><div className="section-label">04 / CONTACT</div><div className="contact-content"><p className="eyebrow">HAVE A PROJECT IN MIND?</p><h2>来聊聊<br /><i>你的下一条内容。</i></h2><a className="contact-button" href="mailto:1914902866@qq.com">GET IN TOUCH <ArrowUpRight size={20} /></a></div><div className="contact-footer"><span>LIU AILING / CONTENT OPERATOR</span><span>重庆 · 北京 · OPEN TO WORK</span><span>© 2026</span></div></section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
