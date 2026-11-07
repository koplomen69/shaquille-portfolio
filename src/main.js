import "./styles.css"
import { createScene } from "./scene.js"
import { createLightScene } from "./lightScene.js"
import { startPortfolioBuildIntro } from "./buildIntro.js"
import {
  profile,
  metrics,
  competencies,
  experience,
  projects,
  certifications,
  education,
  hki,
  paper,
} from "./data.js"

const app = document.getElementById("app")
const canvas = document.getElementById("webgl-bg")
const lightCanvas = document.createElement("canvas")
lightCanvas.id = "webgl-bg-light"
canvas.before(lightCanvas)

const THEME_KEY = "portfolio-theme"
let theme = localStorage.getItem(THEME_KEY) || "dark"

const solarScene = createScene(canvas)
const lightScene = createLightScene(lightCanvas)
solarScene.setActive(theme !== "light")
lightScene.setActive(theme === "light")
let activeScene = theme === "light" ? lightScene : solarScene
const buildIntroEnabled =
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  new URLSearchParams(window.location.search).get("intro") !== "0"

function applyTheme(next) {
  theme = next
  document.documentElement.dataset.theme = theme
  localStorage.setItem(THEME_KEY, theme)
  solarScene.setActive(theme !== "light")
  lightScene.setActive(theme === "light")
  activeScene = theme === "light" ? lightScene : solarScene
  activeScene.setInteractive(exploreMode)
  syncExploreUI()
  const themeIcon = document.querySelector("#theme-toggle .material-symbols-outlined")
  if (themeIcon) themeIcon.textContent = theme === "light" ? "dark_mode" : "light_mode"
}

const spotlight = certifications.find((c) => c.spotlight) || certifications[0]
const certList = certifications

function icon(name) {
  return `<span class="material-symbols-outlined" aria-hidden="true">${name}</span>`
}

function renderCompetencyPanel(item) {
  if (item.panel === "benchmark") {
    return `
      <div class="inline-panel">
        <div class="meter-label label-mono" style="font-size:12px;margin-bottom:8px">
          <span>Model Inference Benchmark (YOLOv8 Edge)</span>
          <span style="color:var(--primary);font-weight:700">32.4 FPS • 96.2% mAP</span>
        </div>
        <div class="bench-bar">
          <span style="width:78%;background:var(--primary)" title="Precision"></span>
          <span style="width:18%;background:var(--secondary)" title="Recall"></span>
          <span style="width:4%;background:var(--surface-bright)" title="Overhead"></span>
        </div>
        <div class="code-badge" style="display:flex;justify-content:space-between;margin-top:6px;color:var(--on-surface-variant)">
          <span>Precision: 94.8%</span>
          <span>Recall: 92.1%</span>
          <span>Edge Overhead: 14ms</span>
        </div>
      </div>`
  }
  if (item.panel === "telemetry") {
    return `
      <div class="inline-panel code-badge" style="display:flex;justify-content:space-between;align-items:center;color:var(--on-surface-variant)">
        <span style="display:inline-flex;align-items:center;gap:6px">${icon("sensors")} ESP32 Telemetry Loop</span>
        <span style="color:var(--secondary);font-weight:700">100Hz Calibration</span>
      </div>`
  }
  if (item.panel === "erp") {
    return `
      <div class="mini-grid">
        <div class="mini-cell">
          <div class="label-mono" style="color:var(--tertiary);font-weight:700">SAP BC400</div>
          <p class="code-badge" style="color:var(--on-surface-variant);margin-top:4px">ABAP Workbench Speaker</p>
        </div>
        <div class="mini-cell">
          <div class="label-mono" style="color:var(--tertiary);font-weight:700">DAMA • COBIT</div>
          <p class="code-badge" style="color:var(--on-surface-variant);margin-top:4px">Framework Practice</p>
        </div>
      </div>`
  }
  return `
    <div class="inline-panel" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
      <span class="code-badge" style="display:inline-flex;align-items:center;gap:6px;color:var(--on-surface-variant)">
        ${icon("verified")} Kominfo Batu City Smart City Portal • REST Interoperability
      </span>
      <span class="tag primary code-badge" style="flex-shrink:0">LIVE GOV</span>
    </div>`
}

app.innerHTML = `
  <button type="button" class="solar-toggle" id="solar-toggle" aria-pressed="false" title="Hide content to explore the solar system">
    ${icon("public")}
    <span id="solar-toggle-label">Explore Solar System</span>
  </button>
  <div class="solar-hint code-badge" id="solar-hint">
    Drag anywhere to rotate · Scroll or pinch to zoom · Tap a planet for details · Double-click to reset
  </div>

  <header class="site-header porto-content" id="site-header">
    <div class="container header-inner">
      <a class="brand" href="#top">
        <div class="brand-mark">SR</div>
        <div class="brand-text">
          <span class="brand-name">${profile.shortName}</span>
          <span class="brand-role code-badge">IS Engineer • AI/IoT</span>
        </div>
      </a>
      <nav class="nav-pill label-mono" id="main-nav">
        <a href="#about" class="active">About</a>
        <a href="#experience">Experience</a>
        <a href="#projects">Projects &amp; R&amp;D</a>
        <a href="#certifications">Certifications</a>
        <a href="#academic">Academic &amp; HKI</a>
      </nav>
      <div class="header-actions">
        <button class="icon-btn" id="theme-toggle" type="button" title="Toggle light / dark mode" aria-label="Toggle light or dark mode">
          ${icon(theme === "light" ? "dark_mode" : "light_mode")}
        </button>
        <a class="btn btn-ghost label-mono contact-btn-desktop" href="#contact">Contact</a>
        <a class="btn btn-primary label-mono" href="${profile.cvPath}" download>Download CV</a>
        <button class="mobile-toggle" id="menu-btn" aria-label="Open menu">${icon("menu")}</button>
      </div>
    </div>
    <nav class="mobile-nav" id="mobile-nav">
      <a href="#about">About</a>
      <a href="#experience">Experience</a>
      <a href="#projects">Projects &amp; R&amp;D</a>
      <a href="#certifications">Certifications</a>
      <a href="#academic">Academic &amp; HKI</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <main id="top" class="porto-content">
    <section class="section hero" id="about">
      <div class="container">
        <div class="status-bar">
          <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
            <span class="pill code-badge" style="color:var(--primary)">
              <span class="dot ping"></span>
              SYS_STATUS: READY FOR HIGH-IMPACT ROLES
            </span>
            <span class="pill pill-muted code-badge hidden-sm">
              ${icon("pin_drop")} ${profile.location}
            </span>
          </div>
          <div class="status-meta label-mono">
            <span>GPA: ${profile.gpa} / 4.00 (${profile.credits} CREDITS)</span>
            <span>•</span>
            <span style="color:var(--tertiary)">${profile.university}</span>
          </div>
        </div>

        <div class="hero-grid">
          <div class="hero-copy reveal">
            <div class="hero-kicker label-mono">
              ${icon("terminal")}
              <span>${profile.title}</span>
            </div>
            <h1 class="hero-title font-display">
              Shaquille<br />
              <span class="accent">Rayhannizam</span> Wibisono
            </h1>
            <p class="hero-bio">
              Bridging mission-critical enterprise systems
              (<strong>(SAP S/4HANA &amp; ABAP)</strong> with applied deep learning
              <span class="em-primary">(YOLOv8 &amp; Gemma 12B)</span> and real-time hardware telemetry
              <span class="em-secondary">(ESP32 &amp; Sensor IoT)</span>. Delivering high-reliability
              architectures from government smart cities to autonomous livestock engineering.
            </p>
            <div class="hero-actions">
              <a class="btn btn-primary btn-lg label-mono" href="#projects">
                ${icon("terminal")} EXPLORE DEPLOYMENTS
              </a>
              <button class="btn btn-ghost btn-lg label-mono" id="copy-email" type="button">
                ${icon("content_copy")} COPY DIRECT EMAIL
              </button>
              <div style="display:flex;gap:8px">
                <a class="icon-btn" href="${profile.github}" target="_blank" rel="noreferrer" title="GitHub">${icon("code")}</a>
                <a class="icon-btn" href="${profile.linkedin}" target="_blank" rel="noreferrer" title="LinkedIn">${icon("share")}</a>
              </div>
            </div>
          </div>

          <div class="diag-card reveal">
            <div class="diag-head">
              <div style="display:flex;align-items:center;gap:8px">
                <span class="dot"></span>
                <span class="code-badge">SYS_DIAGNOSTICS • ACTIVE</span>
              </div>
              <span class="code-badge" style="color:var(--secondary)">ID: SRW-2025</span>
            </div>
            <div class="terminal">
              <p class="ok">&gt; init core_specializations</p>
              <p>&gt; load YOLOv8_custom_dataset [OK]</p>
              <p>&gt; mount ESP32_HX711_telemetry [ACTIVE]</p>
              <p>&gt; verify SAP_BC400_credentials [PASSED]</p>
              <p class="info">&gt; peer_sync: JMM_SINTA_Journal [PUBLISHED]</p>
            </div>
            <div class="meters">
              <div>
                <div class="meter-label label-mono" style="font-size:12px">
                  <span>Degree Completion (${profile.credits} SKS)</span>
                  <span style="color:var(--primary);font-weight:700">100%</span>
                </div>
                <div class="meter-track"><div class="meter-fill primary" data-width="100%"></div></div>
              </div>
              <div>
                <div class="meter-label label-mono" style="font-size:12px">
                  <span>Academic Standing Index</span>
                  <span style="color:var(--secondary);font-weight:700">${profile.gpa} / 4.00</span>
                </div>
                <div class="meter-track"><div class="meter-fill secondary" data-width="90.75%"></div></div>
              </div>
              <div>
                <div class="meter-label label-mono" style="font-size:12px">
                  <span>English Proficiency (TOEIC / EPrT)</span>
                  <span style="color:var(--tertiary);font-weight:700">${profile.toeic} / ${profile.eprt}</span>
                </div>
                <div class="meter-track"><div class="meter-fill tertiary" data-width="77%"></div></div>
              </div>
            </div>
            <div class="verified-chip">
              <div class="left">
                ${icon("verified")}
                <div>
                  <div class="label-mono" style="font-size:13px">Ternakpark R&amp;D MBKM</div>
                  <div class="code-badge" style="color:var(--on-surface-variant)">Cert: 0257/Sertif-TP/03.VI/2025</div>
                </div>
              </div>
              <span class="badge code-badge">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-muted" style="padding-block:1.5rem">
      <div class="container">
        <div class="metrics-grid">
          ${metrics
            .map(
              (m) => `
            <div class="metric-card reveal">
              <div class="metric-label code-badge" style="color:var(--${m.color === "tertiary" ? "tertiary" : m.color === "secondary" ? "secondary" : "primary"})">
                ${icon(m.icon)} ${m.label}
              </div>
              <div class="metric-value">${m.value}<span>${m.suffix}</span></div>
              <p class="metric-note">${m.note}</p>
            </div>`,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section" id="competencies">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <div class="eyebrow label-mono">${icon("grid_view")} SYSTEM ARCHITECTURE • DOMAIN MATRIX</div>
            <h2 class="section-title">Engineered Competencies &amp; Research Focus</h2>
          </div>
          <p class="section-desc">
            A synthesis of hardware telemetry, generative neural models, and SAP enterprise-grade governance.
          </p>
        </div>
        <div class="bento">
          ${competencies
            .map(
              (c) => `
            <article class="glass-card ${c.span} reveal">
              <div>
                <div class="card-top">
                  <div class="card-identity">
                    <div class="icon-tile ${c.tone}">${icon(c.icon)}</div>
                    <div>
                      <h3 class="card-title">${c.title}</h3>
                      <span class="card-sub ${c.tone} code-badge">${c.subtitle}</span>
                    </div>
                  </div>
                  <span class="node-tag code-badge" style="color:var(--${c.tone === "fixed" ? "primary-fixed" : c.tone})">${c.node}</span>
                </div>
                <p class="card-body">${c.body}</p>
                ${renderCompetencyPanel(c)}
              </div>
              <div class="tags">
                ${c.tags.map((t) => `<span class="tag ${c.tone} code-badge">${t}</span>`).join("")}
              </div>
            </article>`,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section section-muted" id="experience">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <div class="eyebrow primary label-mono">${icon("work_history")} CAREER TELEMETRY • FIELD DEPLOYMENTS</div>
            <h2 class="section-title">Professional Experience</h2>
          </div>
          <p class="section-desc">From agro-IoT R&amp;D and community GIS research to municipal smart-city APIs.</p>
        </div>
        <div class="timeline">
          ${experience
            .map(
              (e) => `
            <article class="exp-card reveal">
              <div class="exp-meta label-mono">${e.period}</div>
              <div>
                <h3 class="exp-role">${e.role}</h3>
                <p class="exp-org code-badge">${e.org}</p>
                <ul class="exp-list">
                  ${e.points.map((p) => `<li>${p}</li>`).join("")}
                </ul>
              </div>
            </article>`,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section" id="projects">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <div class="eyebrow primary label-mono">${icon("featured_play_list")} PRODUCTION DEPLOYMENTS • R&amp;D HIGHLIGHTS</div>
            <h2 class="section-title">Engineered Systems in Production</h2>
          </div>
          <a class="label-mono" style="color:var(--secondary);display:inline-flex;align-items:center;gap:6px" href="#certifications">
            VIEW CREDENTIALS ${icon("arrow_forward")}
          </a>
        </div>
        <div class="projects-grid projects-grid-dense">
          ${projects
            .map(
              (p) => `
            <article class="project-card reveal">
              <div>
                <div class="project-visual has-image">
                  <img src="./projects/${p.visual}" alt="${p.title}" loading="lazy" tabindex="0" role="button" aria-label="View ${p.title} larger" />
                  <span class="overlay-label code-badge" style="color:var(--primary)">${p.label}</span>
                </div>
                <p class="project-org code-badge">${p.org}</p>
                <h3 class="project-title">${p.title}</h3>
                <p class="project-desc">${p.desc}</p>
              </div>
              <div class="project-footer">
                <div class="tags">
                  ${p.tags.map((t) => `<span class="tag ${t.tone} code-badge">${t.text}</span>`).join("")}
                </div>
                <a class="project-link label-mono" href="${p.href}" ${p.external ? 'target="_blank" rel="noreferrer"' : ""}>
                  <span>${p.linkLabel}</span>
                  ${icon("arrow_outward")}
                </a>
              </div>
            </article>`,
            )
            .join("")}
        </div>
      </div>
    </section>

    <section class="section section-muted" id="paper">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <div class="eyebrow label-mono">${icon("science")} SCIENTIFIC PUBLICATION</div>
            <h2 class="section-title">Research Paper</h2>
          </div>
        </div>
        <article class="glass-card paper-card reveal">
          <div class="paper-layout">
            <div>
              <div class="code-badge" style="color:var(--secondary);margin-bottom:8px">${paper.venue}</div>
              <h3 class="card-title" style="font-size:22px;margin-bottom:8px">${paper.title}</h3>
              <p class="code-badge" style="color:var(--on-surface-variant);margin-bottom:12px">${paper.authors}</p>
              <p class="card-body">${paper.highlight}</p>
              <div class="tags" style="margin-top:12px">
                <span class="tag primary code-badge">Accuracy 86.1%</span>
                <span class="tag secondary code-badge">F1 85.8%</span>
                <span class="tag tertiary code-badge">1,100 samples</span>
                <span class="tag muted code-badge">7 directorates</span>
              </div>
            </div>
            <div class="paper-actions">
              <a class="btn btn-primary btn-lg label-mono" href="${paper.path}" target="_blank" rel="noreferrer">
                ${icon("picture_as_pdf")} Open Paper PDF
              </a>
              <a class="btn btn-ghost btn-lg label-mono" href="${paper.path}" download>
                ${icon("download")} Download PDF
              </a>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="section" id="certifications">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <div class="eyebrow label-mono">${icon("workspace_premium")} VERIFIED CREDENTIALS • COMPETENCY PROOF</div>
            <h2 class="section-title">Certifications &amp; Credentials</h2>
          </div>
          <p class="section-desc">Microsoft, Dicoding, SAP, Udemy, Ternakpark MBKM, BPS, and language proficiency.</p>
        </div>
        <div class="certs-layout">
          <div class="cert-spotlight reveal" id="cert-spotlight">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px">
              <div style="display:flex;align-items:center;gap:12px">
                ${icon("verified")}
                <div>
                  <span class="code-badge" style="color:var(--primary);text-transform:uppercase">OFFICIAL CREDENTIAL</span>
                  <h3 class="card-title" id="spot-title" style="font-size:22px">${spotlight.title}</h3>
                </div>
              </div>
              <span class="node-tag code-badge" id="spot-validity">${spotlight.validity}</span>
            </div>
            <p class="code-badge" id="spot-issuer" style="color:var(--on-surface-variant);margin-bottom:8px">${spotlight.issuer}</p>
            <p class="code-badge" id="spot-detail" style="color:var(--secondary)">${spotlight.detail}</p>
            <div class="cert-rows" id="spot-rows">
              ${(spotlight.rows || [["Detail", spotlight.detail]])
                .map(
                  ([k, v]) => `
                <div class="cert-row label-mono" style="font-size:12px">
                  <span>${k}</span>
                  <strong>${v}</strong>
                </div>`,
                )
                .join("")}
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
              <span class="code-badge" style="color:var(--outline);display:inline-flex;align-items:center;gap:6px">
                <span class="dot"></span> VERIFIED PORTFOLIO RECORD
              </span>
            </div>
          </div>
          <div class="cert-list" id="cert-list">
            ${certList
              .map(
                (c, i) => `
              <button class="cert-item reveal ${i === 0 ? "active" : ""}" type="button" data-cert="${c.id}">
                <div class="cert-item-left">
                  <span style="color:var(--${c.tone === "fixed" ? "primary-fixed" : c.tone})">${icon(c.icon)}</span>
                  <div>
                    <div class="cert-item-title">${c.title}</div>
                    <div class="cert-item-sub code-badge">${c.issuer}</div>
                  </div>
                </div>
                <span class="validity ${c.tone} code-badge">${c.validity}</span>
              </button>`,
              )
              .join("")}
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="academic">
      <div class="container">
        <div class="section-head reveal">
          <div>
            <div class="eyebrow primary label-mono">${icon("school")} EDUCATION • INTELLECTUAL PROPERTY</div>
            <h2 class="section-title">Academic Path &amp; HKI</h2>
          </div>
        </div>
        <div class="edu-grid">
          ${education
            .map(
              (e) => `
            <article class="glass-card reveal">
              <div>
                <div class="code-badge" style="color:var(--secondary);margin-bottom:8px">${e.period}</div>
                <h3 class="card-title" style="font-size:20px">${e.school}</h3>
                <p class="card-body" style="margin:8px 0">${e.program}</p>
                <p class="code-badge" style="color:var(--on-surface-variant)">${e.note}</p>
              </div>
            </article>`,
            )
            .join("")}
          <article class="glass-card hki-card reveal" style="grid-column:1/-1">
            <div>
              <div class="eyebrow label-mono" style="margin-bottom:8px">${icon("gavel")} HKI — COPYRIGHT RECORD</div>
              <h3 class="card-title" style="font-size:22px">${hki.name}</h3>
              <p class="card-body">${hki.title}</p>
              <div class="cert-rows" style="margin:0">
                <div class="cert-row label-mono" style="font-size:12px"><span>Application No.</span><strong>${hki.appNo}</strong></div>
                <div class="cert-row label-mono" style="font-size:12px"><span>Registration No.</span><strong>${hki.regNo}</strong></div>
                <div class="cert-row label-mono" style="font-size:12px"><span>First Publication</span><strong>${hki.date}</strong></div>
                <div class="cert-row label-mono" style="font-size:12px"><span>Copyright Holder</span><strong>${hki.holder}</strong></div>
                <div class="cert-row label-mono" style="font-size:12px"><span>Protection</span><strong>${hki.protection}</strong></div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section" id="contact" style="background:var(--surface-lowest);border-top:1px solid rgba(60,74,66,0.3)">
      <div class="container">
        <div class="contact-banner reveal">
          <div style="max-width:36rem;position:relative;z-index:1">
            <div class="eyebrow primary label-mono">
              <span class="dot ping"></span>
              DIRECT TELEMETRY CONNECTION • AVAILABLE IMMEDIATELY
            </div>
            <h2 class="section-title" style="margin:8px 0">Initiate Collaboration or Architecture Inquiry</h2>
            <p style="color:var(--on-surface-variant)">
              Whether for enterprise ERP solutions, edge AI pipelines, or academic systems research — reach out directly.
            </p>
          </div>
          <div class="contact-actions">
            <button class="btn btn-primary btn-lg label-mono" id="copy-email-cta" type="button">
              ${icon("mail")} ${profile.email}
            </button>
            <a class="btn btn-ghost btn-lg label-mono" href="${profile.phoneHref}">
              ${icon("call")} ${profile.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="site-footer porto-content">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <div class="brand-mark">SR</div>
            <span class="brand-name">${profile.name}</span>
          </div>
          <p style="color:var(--on-surface-variant);max-width:28rem;margin-bottom:12px">
            Information Systems specialist spanning AI, IoT embedded research, and enterprise systems architecture.
          </p>
          <div class="tags">
            <span class="tag secondary code-badge">SAP S/4HANA</span>
            <span class="tag primary code-badge">Edge AI • IoT</span>
            <span class="tag tertiary code-badge">Cloud Infrastructure</span>
          </div>
        </div>
        <div>
          <div class="label-mono" style="margin-bottom:10px;text-transform:uppercase;letter-spacing:0.08em">Telemetry &amp; Comms</div>
          <div class="footer-links code-badge">
            <span style="display:inline-flex;align-items:center;gap:6px;color:var(--on-surface-variant)">${icon("mail")} ${profile.email}</span>
            <span style="display:inline-flex;align-items:center;gap:6px;color:var(--on-surface-variant)">${icon("call")} ${profile.phone}</span>
            <span style="display:inline-flex;align-items:center;gap:6px;color:var(--on-surface-variant)">${icon("location_on")} Batu, East Java, ID</span>
          </div>
        </div>
        <div>
          <div class="label-mono" style="margin-bottom:10px;text-transform:uppercase;letter-spacing:0.08em">Network Nodes</div>
          <div class="footer-links label-mono">
            <a href="${profile.github}" target="_blank" rel="noreferrer">${icon("terminal")} GitHub Profile</a>
            <a href="${profile.linkedin}" target="_blank" rel="noreferrer">${icon("link")} LinkedIn Network</a>
            <a href="#academic">${icon("verified")} HKI &amp; Intellectual Property</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <div>© ${new Date().getFullYear()} Shaquille Rayhannizam Wibisono. System Architecture • All Rights Reserved.</div>
        <div class="code-badge" style="color:var(--outline);display:inline-flex;align-items:center;gap:6px">
          <span class="dot" style="animation:ping 1.6s infinite"></span>
          NODE ID: SRW-SYS-01 • 200 OK
        </div>
      </div>
    </div>
  </footer>

  <div class="toast" id="toast" role="status">Email copied to clipboard</div>
  <div class="image-modal" id="image-modal" role="dialog" aria-modal="true" aria-label="Project image preview" hidden>
    <button class="image-modal-close" id="image-modal-close" type="button" aria-label="Close image preview">${icon("close")}</button>
    <figure class="image-modal-content">
      <img id="image-modal-preview" alt="" />
      <figcaption id="image-modal-caption"></figcaption>
    </figure>
  </div>
`

if (buildIntroEnabled) {
  startPortfolioBuildIntro({ revealNow })
}

// Interactions
const toast = document.getElementById("toast")
function showToast(msg) {
  toast.textContent = msg
  toast.classList.add("show")
  clearTimeout(showToast._t)
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200)
}

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email)
    showToast(`Copied: ${profile.email}`)
  } catch {
    showToast(profile.email)
  }
}

document.getElementById("copy-email")?.addEventListener("click", copyEmail)
document.getElementById("copy-email-cta")?.addEventListener("click", copyEmail)

const imageModal = document.getElementById("image-modal")
const imageModalPreview = document.getElementById("image-modal-preview")
const imageModalCaption = document.getElementById("image-modal-caption")
const imageModalClose = document.getElementById("image-modal-close")

function closeImageModal() {
  imageModal.hidden = true
  document.body.classList.remove("modal-open")
  imageModalPreview.removeAttribute("src")
}

function openImageModal(image) {
  imageModalPreview.src = image.currentSrc || image.src
  imageModalPreview.alt = image.alt
  imageModalCaption.textContent = image.alt
  imageModal.hidden = false
  document.body.classList.add("modal-open")
  imageModalClose.focus()
}

document.querySelectorAll(".project-visual.has-image img").forEach((image) => {
  image.addEventListener("click", () => openImageModal(image))
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openImageModal(image)
    }
  })
})
imageModalClose.addEventListener("click", closeImageModal)
imageModalClose.addEventListener("pointerup", (event) => {
  event.preventDefault()
  closeImageModal()
})
imageModal.addEventListener("click", (event) => {
  if (event.target === imageModal) closeImageModal()
})
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !imageModal.hidden) closeImageModal()
})

// Explore mode — hide portfolio UI so users can interact with the 3D scene
const solarToggle = document.getElementById("solar-toggle")
const solarToggleLabel = document.getElementById("solar-toggle-label")
const solarHint = document.getElementById("solar-hint")
let exploreMode = false

function syncExploreUI() {
  const isSolar = theme === "dark"
  solarToggleLabel.textContent = exploreMode
    ? "Show Portfolio"
    : isSolar
      ? "Explore Solar System"
      : "Explore Horizon"
  solarToggle.querySelector(".material-symbols-outlined").textContent = exploreMode
    ? "layers"
    : isSolar
      ? "public"
      : "waves"
  solarHint.textContent = isSolar
    ? "Drag anywhere to rotate · Scroll or pinch to zoom · Tap a planet for details · Double-click to reset"
    : "Drag anywhere to orbit · Scroll or pinch to zoom · Double-click to reset"
}
solarToggle?.addEventListener("click", () => {
  exploreMode = !exploreMode
  document.body.classList.toggle("explore-mode", exploreMode)
  solarToggle.setAttribute("aria-pressed", String(exploreMode))
  syncExploreUI()
  activeScene.setInteractive(exploreMode)
  if (!exploreMode) activeScene.resetView()
  showToast(
    exploreMode
      ? theme === "light"
        ? "Horizon unlocked — drag to explore"
        : "Solar system unlocked — drag to explore"
      : "Portfolio content restored",
  )
})

document.getElementById("theme-toggle")?.addEventListener("click", () => {
  applyTheme(theme === "light" ? "dark" : "light")
  showToast(theme === "light" ? "Dark mode — solar system active" : "Light mode — horizon active")
})
syncExploreUI()

const menuBtn = document.getElementById("menu-btn")
const mobileNav = document.getElementById("mobile-nav")
menuBtn?.addEventListener("click", () => {
  const open = mobileNav.classList.toggle("open")
  menuBtn.setAttribute("aria-expanded", String(open))
  menuBtn.innerHTML = open ? icon("close") : icon("menu")
})
mobileNav?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    mobileNav.classList.remove("open")
    menuBtn.setAttribute("aria-expanded", "false")
    menuBtn.innerHTML = icon("menu")
  })
})

// Cert spotlight switching
const certById = Object.fromEntries(certifications.map((c) => [c.id, c]))
document.getElementById("cert-list")?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-cert]")
  if (!btn) return
  const cert = certById[btn.dataset.cert]
  if (!cert) return
  document.querySelectorAll(".cert-item").forEach((el) => el.classList.remove("active"))
  btn.classList.add("active")
  document.getElementById("spot-title").textContent = cert.title
  document.getElementById("spot-issuer").textContent = cert.issuer
  document.getElementById("spot-detail").textContent = cert.detail
  document.getElementById("spot-validity").textContent = cert.validity
  const rows = cert.rows || [
    ["Issuer", cert.issuer],
    ["Detail", cert.detail],
    ["Validity", cert.validity],
  ]
  document.getElementById("spot-rows").innerHTML = rows
    .map(
      ([k, v]) => `
      <div class="cert-row label-mono" style="font-size:12px">
        <span>${k}</span>
        <strong>${v}</strong>
      </div>`,
    )
    .join("")
})

// Scroll reveal + meter animation
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !document.body.classList.contains("build-active")) {
        revealNow(entry.target)
        revealObserver.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.08, rootMargin: "0px 0px -20px 0px" },
)

function revealNow(el) {
  el.classList.add("visible")
  el.querySelectorAll(".meter-fill").forEach((fill) => {
    fill.style.width = fill.dataset.width || "0%"
  })
}

document.querySelectorAll(".reveal, .diag-card").forEach((el) => {
  el.classList.add("reveal")
  const rect = el.getBoundingClientRect()
  const inView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0
  if (inView && !document.body.classList.contains("build-active")) {
    revealNow(el)
  } else {
    revealObserver.observe(el)
  }
})

// Active nav highlighting
const sections = ["about", "experience", "projects", "certifications", "academic", "contact"]
const navLinks = document.querySelectorAll("#main-nav a")
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const id = entry.target.id
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`)
      })
    })
  },
  { rootMargin: "-40% 0px -50% 0px", threshold: 0 },
)
sections.forEach((id) => {
  const el = document.getElementById(id)
  if (el) sectionObserver.observe(el)
})
