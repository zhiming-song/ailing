import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDownRight, ArrowUpRight, BriefcaseBusiness, ChevronRight, Mail, Menu, Phone, Play, Sparkles, X } from 'lucide-react'
import './styles.css'

const experiences = [
  {
    date: '2026.02 — 2026.06',
    company: '蔚来汽车重庆区域公司 · 市场部',
    role: '区域传播实习生',
    bullets: ['参与新车上市整合传播，负责区域传播节奏规划、线上内容传播与线下活动闭环，单场曝光约 88%。', '负责官方账号及区域矩阵内容运营，围绕品牌传播节点制定选题与内容策划，单条最高播放量 15w+。', '统筹 15+ KOL 开展品牌内容合作，累计曝光 80w+，推动区域曝光排名由后段提升至中游。'],
  },
  {
    date: '2025.10 — 2026.01',
    company: '北京陌陌科技有限公司 · 事业部',
    role: '整合营销实习生',
    bullets: ['独立负责 3 档 S 级节目全周期传播，围绕预热、上线及长尾阶段制定传播节奏与内容策略。', '全流程推进直播礼物及音乐短片等项目，覆盖创意策划、需求提报、制作协同及上线交付，单项目站内曝光 20w+。'],
  },
  {
    date: '2025.07 — 2025.09',
    company: '北京慕力科技有限公司 · 工具应用部',
    role: '内容营销实习生',
    bullets: ['参与 8 场平台商业化快闪活动，负责活动节点策划、现场内容及后续传播协同，累计曝光 23w+。', '参与知识类专家 IP 内容定位及选题体系搭建，推动账号涨粉 8000+。'],
  },
  {
    date: '2023.02 — 2023.04',
    company: '贵州多彩新媒体股份有限公司',
    role: '节目制作实习生',
    bullets: ['参与教育类节目与宣传片的内容制作，负责选题策划、拍摄现场协调，完成节目 20+ 期。'],
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

function MediaPlaceholder({ label = 'IMAGE / VIDEO PLACEHOLDER', className = '' }) {
  return <div className={`media-placeholder ${className}`}><span>{label}</span><i /></div>
}

function App() {
  const [activeTab, setActiveTab] = useState('长视频')
  const [menuOpen, setMenuOpen] = useState(false)
  const [heroOffset, setHeroOffset] = useState({ x: 0, y: 0 })

  const scrollTo = (id) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <main>
      <header className="site-header">
        <button className="menu-button" aria-label="打开菜单" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <button className="wordmark" onClick={() => scrollTo('top')}>LA<span> / PORTFOLIO</span></button>
        <nav className={menuOpen ? 'is-open' : ''}>
          <button onClick={() => scrollTo('about')}>关于我</button>
          <button onClick={() => scrollTo('experience')}>个人经历</button>
          <button onClick={() => scrollTo('work')}>个人作品</button>
        </nav>
        <button className="avatar-button" onClick={() => scrollTo('about')} aria-label="查看关于我"><img src="/media/avatar-full.png" alt="刘爱玲头像" /></button>
      </header>

      <section id="top" className="hero section-shell" onMouseMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setHeroOffset({ x: ((event.clientX - rect.left) / rect.width - .5) * 14, y: ((event.clientY - rect.top) / rect.height - .5) * 10 }) }} onMouseLeave={() => setHeroOffset({ x: 0, y: 0 })}>
        <div className="hero-wash" />
        <div className="hero-grid" />
        <div className="hero-foreground" style={{ '--mx': `${heroOffset.x}px`, '--my': `${heroOffset.y}px` }}>
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
          <div className="hero-floating-card card-one">CONTENT<br /><b>WITH INTENT</b></div>
          <div className="hero-floating-card card-two"><span>01</span><Sparkles size={14} /></div>
          <div className="hero-note">MOVE TO EXPLORE <span>↓</span></div>
          <div className="hero-stamp"><Sparkles size={17} /><span>OPEN<br />TO WORK</span></div>
        </div>
        <div className="project-orbit" aria-label="项目作品入口">
          {[['长视频', 'work-video', '/src/assets/shiping.jpg'], ['短视频', 'work-short', '/src/assets/shortMovie.jpg'], ['直播礼物', 'work-live', '/src/assets/gift.jpg'], ['图片作品', 'work-image', '/src/assets/photo.jpg']].map(([label, id, image], index) => <button key={id} className={`project-orbit-item orbit-${index + 1}`} onClick={() => { setActiveTab(label); scrollTo('work') }}><span className="orbit-image"><img src={image} alt="" /></span><small>{label}</small></button>)}
        </div>
      </section>

      <section id="about" className="about section-shell">
        <div className="section-label">01 / ABOUT</div>
        <div className="about-content">
          <div className="about-portrait"><MediaPlaceholder label="PORTRAIT / PLACEHOLDER" /><div className="portrait-caption">YOUR PHOTO<br />GOES HERE</div></div>
          <div className="about-copy">
            <p className="eyebrow">HELLO, I'M AILING</p>
            <h2>内容不是<br /><span>填充物，</span><br />是品牌和人的<br /><strong>相遇现场。</strong></h2>
            <p className="body-copy">广播电视编导专业背景，拥有品牌传播、社交媒体运营、整合营销与视频内容制作经验。擅长从 0 到 1 搭建内容，亦能在快节奏项目中把控细节与交付。</p>
            <div className="contact-lines"><a href="tel:18286653241"><Phone size={15} /> 182 8665 3241</a><a href="mailto:1914902866@qq.com"><Mail size={15} /> 1914902866@qq.com</a></div>
          </div>
        </div>
      </section>

      <section id="experience" className="experience section-shell">
        <div className="section-label">02 / EXPERIENCE</div>
        <div className="experience-heading"><h2>把每一次<br /><i>传播机会</i>，做成<br />有效的内容。</h2><p>EDUCATION<br /><b>2024.09 — 2027.06</b><br />重庆大学 · 艺术学 硕士<br /><br /><b>2019.09 — 2023.05</b><br />西北民族大学 · 广播电视编导</p></div>
        <div className="timeline">{experiences.map((item) => <article className="experience-row" key={item.date}><div className="experience-meta"><span>{item.date}</span><BriefcaseBusiness size={17} /></div><div><h3>{item.company}</h3><p className="role">{item.role}</p>{item.bullets.map((bullet) => <p className="bullet" key={bullet}>{bullet}</p>)}</div><ChevronRight className="row-arrow" size={20} /></article>)}</div>
      </section>

      <section id="work" className="work section-shell">
        <div className="section-label">03 / SELECTED WORK</div>
        <div className="work-heading"><h2>一些<br /><i>我做过的事。</i></h2><p>选择一个分类<br />探索我的内容实践</p></div>
        <div className="work-tabs">{Object.keys(workItems).map((tab, index) => <button className={activeTab === tab ? 'active' : ''} key={tab} onClick={() => setActiveTab(tab)}><span>0{index + 1}</span>{tab}</button>)}</div>
        <div className="work-grid">{workItems[activeTab].map((item, index) => <article className={`work-card ${item.tone}`} key={item.title}><MediaPlaceholder label="MEDIA / PLACEHOLDER" /><div className="work-card-overlay"><span>{item.meta}</span><h3>{item.title}</h3><button aria-label={`查看${item.title}`}><Play size={15} fill="currentColor" /></button></div><span className="card-index">0{index + 1}</span></article>)}</div>
      </section>

      <section id="contact" className="contact section-shell"><div className="contact-bg-word">HELLO</div><div className="section-label">04 / CONTACT</div><div className="contact-content"><p className="eyebrow">HAVE A PROJECT IN MIND?</p><h2>来聊聊<br /><i>你的下一条内容。</i></h2><a className="contact-button" href="mailto:1914902866@qq.com">GET IN TOUCH <ArrowUpRight size={20} /></a></div><div className="contact-footer"><span>LIU AILING / CONTENT OPERATOR</span><span>重庆 · 北京 · OPEN TO WORK</span><span>© 2026</span></div></section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
