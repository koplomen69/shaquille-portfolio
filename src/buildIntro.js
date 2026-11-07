const CURSOR_COUNT = 24
const MAX_ACTIVE_TARGETS = 18
const SCROLL_CHASE_SPEED = 340
const FRONTIER_TIMEOUT = 6000

const COLORS = [
  "#F24E1E",
  "#FF7262",
  "#A259FF",
  "#1ABCFE",
  "#0ACF83",
  "#FF9F45",
  "#FFC700",
  "#FF5C8A",
  "#7B61FF",
  "#00D1FF",
  "#FF6EC7",
  "#B68BFF",
  "#4ECDC4",
  "#FF8A5C",
  "#5B8DEF",
  "#F7C948",
  "#FF5C5C",
  "#2ECC71",
  "#9B5DE5",
  "#F15BB5",
  "#00BBF9",
  "#FD7E14",
  "#20BF6B",
  "#8854D0",
]

const NAMES = [
  "Ava",
  "Ben",
  "Cora",
  "Dex",
  "Ella",
  "Finn",
  "Gia",
  "Hugo",
  "Ivy",
  "Jax",
  "Kira",
  "Leo",
  "Mira",
  "Noa",
  "Otto",
  "Priya",
  "Quinn",
  "Rio",
  "Sana",
  "Theo",
  "Uma",
  "Vera",
  "Wes",
  "Yara",
]

const CURSOR_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2.5 19.5 11.2 12.8 12.4 10.2 20.5 7.4 18.9 9.9 12.1 3.4 10.7Z" fill="var(--cursor-color)" stroke="rgba(255,255,255,0.9)" stroke-width="1.4" stroke-linejoin="round"/></svg>`
const HELPER_OFFSETS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
]

const FINE_SELECTORS = [
  ".site-header .brand-mark",
  ".site-header .brand-text",
  ".site-header .nav-pill",
  ".site-header .header-actions",
  ".status-bar .pill",
  ".status-meta",
  ".section-head .eyebrow",
  ".section-head .section-title",
  ".section-head .section-desc",
  ".section-head a.label-mono",
  ".hero-kicker",
  ".hero-title",
  ".hero-bio",
  ".hero-actions",
  ".diag-head",
  ".terminal",
  ".meters",
  ".verified-chip",
  ".metric-label",
  ".metric-value",
  ".metric-note",
  ".card-title",
  ".card-sub",
  ".card-body",
  ".tags",
  ".inline-panel",
  ".mini-grid",
  ".exp-meta",
  ".exp-role",
  ".exp-org",
  ".exp-list",
  ".project-visual",
  ".project-org",
  ".project-title",
  ".project-desc",
  ".project-footer",
  ".cert-rows",
  ".node-tag",
  "#spot-title",
  "#spot-issuer",
  "#spot-detail",
  ".paper-actions",
  ".edu-grid .code-badge",
  ".edu-grid .card-title",
  ".edu-grid .card-body",
  ".contact-banner .eyebrow",
  ".contact-banner .section-title",
  ".contact-banner p",
  ".contact-actions",
  ".footer-grid > div",
  ".footer-bottom",
  ".project-footer",
  ".project-link",
  ".icon-tile",
  ".mini-cell",
  ".bench-bar",
  ".inline-panel .code-badge",
  ".paper-layout > div:first-child > .code-badge",
  ".edu-grid .eyebrow",
  ".cert-spotlight .code-badge",
  ".cert-row",
  ".exp-list li",
  ".terminal p",
  ".footer-grid .brand-mark",
  ".footer-grid .brand-name",
  ".footer-grid > div > .label-mono",
  ".footer-links",
  ".footer-bottom .code-badge",
  ".mobile-nav",
]

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function readableOn(hex) {
  const value = Number.parseInt(hex.slice(1), 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.62 ? "#17202a" : "#ffffff"
}

function assignWipe(el) {
  const directions = [
    { t: 0, r: 100, b: 0, l: 0 },
    { t: 0, r: 0, b: 0, l: 100 },
    { t: 100, r: 0, b: 0, l: 0 },
    { t: 0, r: 0, b: 100, l: 0 },
  ]
  const direction = directions[Math.floor(Math.random() * directions.length)]
  el.style.setProperty("--build-clip-t", `${direction.t}%`)
  el.style.setProperty("--build-clip-r", `${direction.r}%`)
  el.style.setProperty("--build-clip-b", `${direction.b}%`)
  el.style.setProperty("--build-clip-l", `${direction.l}%`)
}

function labelFor(el) {
  if (el.id) return el.id
  const section = el.closest("section")
  const sectionName = section
    ? section.id || section.className.match(/section-[\w-]+/)?.[0] || "section"
    : "page"
  const own = [...el.classList].find(
    (name) => !["reveal", "visible", "build-shell", "build-done"].includes(name),
  )
  return `${sectionName}.${own || "block"}`
}

export function startPortfolioBuildIntro({ revealNow } = {}) {
  const finishReveal =
    typeof revealNow === "function" ? revealNow : (el) => el.classList.add("visible")

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".reveal:not(.visible)").forEach(finishReveal)
    return Promise.resolve(false)
  }

  document.body.classList.add("build-active")
  const previousScrollBehavior = document.documentElement.style.scrollBehavior
  document.documentElement.style.scrollBehavior = "auto"

  const targets = []
  const seenTargets = new Set()

  function addTarget(el, kind, label) {
    if (!el || seenTargets.has(el)) return
    seenTargets.add(el)
    if (kind === "shell" || kind === "detail") el.classList.add("build-shell")
    if (kind !== "group") assignWipe(el)
    targets.push({
      el,
      kind,
      label: label || labelFor(el),
      status: "waiting",
      fixed:
        getComputedStyle(el).position === "fixed" || Boolean(el.closest(".site-header")),
      crew: [],
      selection: null,
      doneAt: 0,
    })
  }

  addTarget(document.querySelector(".site-header"), "shell", "chrome.header")
  document.querySelectorAll("main .section").forEach((section) => {
    addTarget(section, "shell")
  })
  addTarget(document.querySelector(".status-bar"), "shell", "hero.status-bar")
  document.querySelectorAll(".reveal, .diag-card").forEach((el) => {
    if (el.closest(".cert-list")) return
    if (!el.classList.contains("reveal")) el.classList.add("reveal")
    addTarget(el, "item")
  })
  addTarget(document.querySelector(".cert-list"), "group", "certifications.credential-list")

  FINE_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.closest(".cert-list")) return
      if (selector === ".tags" && el.closest(".project-footer")) return
      addTarget(el, "detail")
    })
  })

  addTarget(document.querySelector(".site-footer"), "shell", "chrome.footer")

  const solarToggleEl = document.getElementById("solar-toggle")
  if (solarToggleEl) {
    solarToggleEl.classList.add("build-shell")
    assignWipe(solarToggleEl)
  }

  targets.sort((a, b) => {
    const aTop = a.el.getBoundingClientRect().top + window.scrollY
    const bTop = b.el.getBoundingClientRect().top + window.scrollY
    return aTop - bTop
  })

  const layer = document.createElement("div")
  layer.className = "build-cursor-layer"
  layer.setAttribute("aria-hidden", "true")
  layer.innerHTML = `
    <div class="build-grid"></div>
    <div class="build-hud">
      <div class="build-hud-top">
        <span class="build-live"></span>
        <strong>PORTFOLIO_BUILD.fig</strong>
        <span class="build-count">${CURSOR_COUNT} collaborators</span>
      </div>
      <div class="build-progress"><span class="build-progress-fill"></span></div>
      <div class="build-status">INITIALIZING COLLABORATIVE CANVAS…</div>
    </div>
    <div class="build-cursors"></div>
  `
  document.body.append(layer)

  const cursorsEl = layer.querySelector(".build-cursors")
  const progressFill = layer.querySelector(".build-progress-fill")
  const statusEl = layer.querySelector(".build-status")
  const cursors = []

  for (let i = 0; i < CURSOR_COUNT; i += 1) {
    const cursorEl = document.createElement("div")
    cursorEl.className = "build-cursor"
    cursorEl.style.setProperty("--cursor-color", COLORS[i % COLORS.length])
    cursorEl.innerHTML = `
      <span class="build-cursor-tag">${NAMES[i % NAMES.length]}</span>
      ${CURSOR_SVG}
      <span class="build-cursor-dot"></span>
    `
    cursorEl.querySelector(".build-cursor-tag").style.color = readableOn(COLORS[i % COLORS.length])
    cursorsEl.append(cursorEl)

    const angle = (i / CURSOR_COUNT) * Math.PI * 2 + Math.random() * 0.4
    const radius = Math.max(window.innerWidth, window.innerHeight) * (0.72 + Math.random() * 0.25)
    cursors.push({
      id: i,
      el: cursorEl,
      name: NAMES[i % NAMES.length],
      color: COLORS[i % COLORS.length],
      x: window.innerWidth / 2 + Math.cos(angle) * radius,
      y: window.innerHeight / 2 + Math.sin(angle) * radius,
      job: null,
      fading: false,
      fadeStart: 0,
      exitAnchor: null,
      idleAnchor: null,
      idleNext: 0,
      speed: 2.6 + Math.random() * 1.8,
    })
  }

  const docHeight = document.documentElement.scrollHeight
  window.scrollTo(0, 0)
  const scrollDistance = Math.max(0, docHeight - window.innerHeight)
  const returnDuration = 1350
  const holdDuration = 420
  const returnFrom = scrollDistance

  let phase = "build"
  let buildProgress = 0
  let holdUntil = 0
  let returnStart = 0
  let rafId = 0
  let finished = false
  let solarTarget = null
  let exitMode = false
  let exitJobsAssigned = false
  let lastFrontier = null
  let frontierSince = 0
  let scrollVelocity = 0
  let lastScrollY = window.scrollY

  const blockScroll = (event) => event.preventDefault()
  const blockScrollKeys = (event) => {
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(event.key)) {
      event.preventDefault()
    }
  }
  window.addEventListener("wheel", blockScroll, { passive: false })
  window.addEventListener("touchmove", blockScroll, { passive: false })
  window.addEventListener("keydown", blockScrollKeys)

  function visibleRect(el) {
    const rect = el.getBoundingClientRect()
    const left = clamp(rect.left, 0, window.innerWidth)
    const top = clamp(rect.top, 0, window.innerHeight)
    const right = clamp(rect.right, 0, window.innerWidth)
    const bottom = clamp(rect.bottom, 0, window.innerHeight)
    if (right - left < 6 || bottom - top < 6) return null
    return { left, top, right, bottom, width: right - left, height: bottom - top }
  }

  function visibleEnough(target, rect) {
    const full = target.el.getBoundingClientRect()
    const needHeight = Math.min(150, full.height * 0.42)
    const needWidth = Math.min(260, full.width * 0.5)
    return rect.height >= needHeight && rect.width >= needWidth
  }

  function crewCountFor(target) {
    if (target.kind === "detail") {
      const rect = target.el.getBoundingClientRect()
      return rect.width * rect.height > 90000 ? 2 : 1
    }
    if (target.kind === "shell") {
      if (target.el.classList.contains("section")) return 3
      if (target.el.classList.contains("status-bar")) return 1
      return 3
    }
    const rect = target.el.getBoundingClientRect()
    const area = rect.width * rect.height
    if (area > 160000) return 3
    if (area > 50000) return 2
    return 1
  }

  function targetCenter(target) {
    const rect = target.el.getBoundingClientRect()
    return {
      x: clamp(rect.left + rect.width / 2, 0, window.innerWidth),
      y: clamp(rect.top + rect.height / 2, 0, window.innerHeight),
    }
  }

  function idleCursors(target) {
    return cursors
      .filter((cursor) => !cursor.job && !cursor.fading)
      .sort((a, b) => {
        if (!target) return a.id - b.id
        const center = targetCenter(target)
        const da = Math.hypot(a.x - center.x, a.y - center.y)
        const db = Math.hypot(b.x - center.x, b.y - center.y)
        return da - db
      })
  }

  function assignCrew(target, forcedCount = 0) {
    const desired = forcedCount || crewCountFor(target)
    const missing = desired - target.crew.length
    if (missing <= 0) return 0

    const center = targetCenter(target)
    const available = idleCursors(target).slice(0, missing)
    let assigned = 0
    const now = performance.now()

    available.forEach((cursor, index) => {
      const crewIndex = target.crew.length
      const role = crewIndex === 0 ? "leader" : "helper"
      const distance = Math.hypot(cursor.x - center.x, cursor.y - center.y)
      cursor.job = {
        target,
        type: "build",
        role,
        slot: role === "helper" ? crewIndex - 1 : 0,
        phase: "move",
        started: now,
        moveDeadline: now + Math.min(2200, 900 + distance * 1.1),
        dragStart: 0,
        dragDuration: 0,
        settleUntil: 0,
      }
      cursor.el.classList.add("is-working")
      target.crew.push(cursor)
      assigned += 1
      if (role === "leader" && target.status === "waiting") target.status = "active"
    })

    return assigned
  }

  function leaderPoints(rect) {
    const inset = Math.max(
      5,
      Math.min(16, rect.width * 0.055, rect.height * 0.08, rect.width / 2 - 4, rect.height / 2 - 4),
    )
    return {
      start: { x: rect.left + inset, y: rect.top + inset },
      end: { x: rect.right - inset, y: rect.bottom - inset },
    }
  }

  function ensureSelection(target, cursor) {
    if (target.selection) return target.selection
    const selection = document.createElement("div")
    selection.className = "build-selection"
    selection.style.setProperty("--selection-color", cursor.color)
    selection.innerHTML = `<span class="build-selection-label">${cursor.name} · ${target.label}</span>`
    selection.querySelector(".build-selection-label").style.color = readableOn(cursor.color)
    layer.append(selection)
    target.selection = selection
    requestAnimationFrame(() => selection.classList.add("is-active"))
    return selection
  }

  function updateSelection(target, rect, progress) {
    const selection = target.selection
    if (!selection) return
    selection.style.left = `${rect.left}px`
    selection.style.top = `${rect.top}px`
    selection.style.width = `${Math.max(2, rect.width * progress)}px`
    selection.style.height = `${Math.max(2, rect.height * progress)}px`
  }

  function spawnClick(x, y, color) {
    const click = document.createElement("span")
    click.className = "build-click"
    click.style.left = `${x}px`
    click.style.top = `${y}px`
    click.style.setProperty("--click-color", color)
    layer.append(click)
    window.setTimeout(() => click.remove(), 520)
  }

  function completeTarget(target, color = "#4edea3") {
    if (target.status === "done") return
    target.status = "done"
    target.doneAt = performance.now()

    if (target.kind === "item") {
      finishReveal(target.el)
    } else if (target.kind === "group") {
      target.el.querySelectorAll(".reveal").forEach(finishReveal)
    } else {
      target.el.classList.add("build-done")
    }

    const rect = visibleRect(target.el)
    if (rect) {
      spawnClick(rect.left + rect.width / 2, rect.top + rect.height / 2, color)
    }

    if (target.selection) {
      const selection = target.selection
      selection.classList.remove("is-active")
      selection.classList.add("is-done")
      window.setTimeout(() => selection.remove(), 460)
      target.selection = null
    }
  }

  function forceCompleteMissing() {
    targets.forEach((target) => {
      if (target.status === "done") return
      const rect = target.el.getBoundingClientRect()
      if (rect.bottom >= -140) return
      completeTarget(target)
      target.crew.forEach((cursor) => {
        cursor.job = null
        cursor.el.classList.remove("is-working")
      })
      target.crew = []
    })
  }

  function updateTargets() {
    let activeCount = targets.filter((target) => target.crew.length > 0 && target.status !== "done").length

    targets.forEach((target) => {
      if (target.status === "done") return
      const rect = target.el.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        completeTarget(target)
        target.crew.forEach((cursor) => {
          cursor.job = null
          cursor.el.classList.remove("is-working")
        })
        target.crew = []
        return
      }
      if (rect.bottom < -140) {
        completeTarget(target)
        target.crew.forEach((cursor) => {
          cursor.job = null
          cursor.el.classList.remove("is-working")
        })
        target.crew = []
        return
      }
      if (rect.top > window.innerHeight + 240) return

      const visible = visibleRect(target.el)
      if (!visible || !visibleEnough(target, visible) || target.crew.length > 0 || activeCount >= MAX_ACTIVE_TARGETS) {
        return
      }

      if (assignCrew(target) > 0) activeCount += 1
    })

    topUpCrews()
  }

  function topUpCrews() {
    for (let guard = 0; guard < CURSOR_COUNT; guard += 1) {
      if (!cursors.some((cursor) => !cursor.job && !cursor.fading)) break

      let best = null
      let bestArea = -1
      targets.forEach((target) => {
        if (target.status === "done" || target.crew.length === 0) return
        const maxCrew = target.kind === "detail" ? 3 : 4
        if (target.crew.length >= maxCrew) return
        const rect = visibleRect(target.el)
        if (!rect) return
        const area = rect.width * rect.height
        if (area > bestArea) {
          bestArea = area
          best = target
        }
      })

      if (!best) break
      const maxCrew = best.kind === "detail" ? 3 : 4
      if (assignCrew(best, maxCrew) === 0) break
    }
  }

  function helperPoint(rect, slot, cursor) {
    const [ox, oy] = HELPER_OFFSETS[slot % HELPER_OFFSETS.length]
    const jitterX = Math.sin(performance.now() * 0.002 + cursor.id * 1.7) * 5
    const jitterY = Math.cos(performance.now() * 0.0018 + cursor.id * 2.1) * 5
    const x = ox === 0
      ? rect.left + rect.width / 2
      : ox < 0
        ? rect.left - 18
        : rect.right + 18
    const y = oy === 0
      ? rect.top + rect.height / 2
      : oy < 0
        ? rect.top - 18
        : rect.bottom + 18
    return {
      x: clamp(x + jitterX, -30, window.innerWidth + 30),
      y: clamp(y + jitterY, -30, window.innerHeight + 30),
    }
  }

  function edgePoint(index) {
    const side = index % 4
    const t = ((index * 0.37) % 1 + 1) % 1
    const margin = 36
    if (side === 0) return { x: margin + t * (window.innerWidth - margin * 2), y: margin }
    if (side === 1) return { x: window.innerWidth - margin, y: margin + t * (window.innerHeight - margin * 2) }
    if (side === 2) return { x: margin + t * (window.innerWidth - margin * 2), y: window.innerHeight - margin }
    return { x: margin, y: margin + t * (window.innerHeight - margin * 2) }
  }

  function idlePoint(cursor, now) {
    if (!cursor.idleAnchor || now > cursor.idleNext) {
      cursor.idleAnchor = {
        x: 50 + Math.random() * (window.innerWidth - 100),
        y: 70 + Math.random() * (window.innerHeight - 140),
      }
      cursor.idleNext = now + 1800 + Math.random() * 2400
    }
    return {
      x: cursor.idleAnchor.x + Math.sin(now * 0.0009 + cursor.id * 1.3) * 14,
      y: cursor.idleAnchor.y + Math.cos(now * 0.0007 + cursor.id * 1.9) * 10,
    }
  }

  function releaseCursor(cursor) {
    cursor.job = null
    cursor.el.classList.remove("is-working")
  }

  function updateBuildJob(cursor, job, now) {
    const target = job.target
    const rect = visibleRect(target.el)
    if (target.status === "done" || !rect) {
      target.crew = target.crew.filter((member) => member !== cursor)
      releaseCursor(cursor)
      return null
    }

    if (job.role === "helper") {
      return helperPoint(rect, job.slot, cursor)
    }

    const { start, end } = leaderPoints(rect)

    if (job.phase === "move") {
      if (Math.hypot(cursor.x - start.x, cursor.y - start.y) < 18 || now > job.moveDeadline) {
        ensureSelection(target, cursor)
        job.phase = "drag"
        job.dragStart = now
        const isShell = target.kind === "shell"
        job.dragDuration = clamp(
          (rect.width + rect.height) / (isShell ? 4 : 2.2),
          isShell ? 280 : 360,
          isShell ? 620 : 820,
        )
      }
      return start
    }

    if (job.phase === "drag") {
      const raw = clamp((now - job.dragStart) / job.dragDuration, 0, 1)
      const progress = easeInOutCubic(raw)
      updateSelection(target, rect, progress)
      const x = start.x + (end.x - start.x) * progress
      const y = start.y + (end.y - start.y) * progress
      if (raw >= 1) {
        job.phase = "settle"
        job.settleUntil = now + 110
        updateSelection(target, rect, 1)
      }
      return { x, y }
    }

    updateSelection(target, rect, 1)
    if (now > job.settleUntil) {
      completeTarget(target, cursor.color)
      spawnClick(end.x, end.y, cursor.color)
      releaseCursor(cursor)
      return null
    }
    return end
  }

  function updateExitJob(cursor, job, now) {
    if (!cursor.exitAnchor) cursor.exitAnchor = edgePoint(cursor.id * 3 + Math.floor(now / 1000))
    const point = cursor.exitAnchor
    if (Math.hypot(cursor.x - point.x, cursor.y - point.y) < 24) {
      cursor.fading = true
      cursor.fadeStart = now + cursor.id * 8
    }
    return point
  }

  function updateCursor(cursor, now, dt) {
    let desired = null
    const isWorking = Boolean(cursor.job && !cursor.fading)

    if (cursor.fading) {
      const opacity = clamp(1 - (now - cursor.fadeStart) / 380, 0, 1)
      cursor.el.style.opacity = String(opacity)
      if (opacity <= 0) return
    } else if (cursor.job) {
      desired = cursor.job.type === "exit"
        ? updateExitJob(cursor, cursor.job, now)
        : updateBuildJob(cursor, cursor.job, now)
    }

    if (!cursor.fading && !desired) {
      if (exitMode) {
        desired = updateExitJob(cursor, { type: "exit" }, now)
      } else {
        desired = idlePoint(cursor, now)
      }
    }

    if (!desired) return

    if (isWorking && cursor.job?.type === "build" && !cursor.job.target.fixed) {
      desired.y = clamp(desired.y - scrollVelocity / (cursor.speed + 12), -40, window.innerHeight + 40)
    }

    const ease = 1 - Math.exp(-dt * (isWorking ? cursor.speed + 12 : cursor.speed))
    cursor.x += (desired.x - cursor.x) * ease
    cursor.y += (desired.y - cursor.y) * ease

    const jitter = isWorking ? 0.7 : 1.4
    const renderX = cursor.x + Math.sin(now * 0.0021 + cursor.id * 2.3) * jitter
    const renderY = cursor.y + Math.cos(now * 0.0017 + cursor.id * 1.1) * jitter
    cursor.el.style.transform = `translate3d(${renderX}px, ${renderY}px, 0)`
  }

  function currentStatusLabel() {
    const current = targets.find((target) => target.status !== "done")
    if (!current) return "ALL SYSTEMS BUILT"
    return `BUILDING ${current.label.toUpperCase()}`
  }

  function assignExitJobs() {
    exitMode = true
    cursors.forEach((cursor) => {
      if (cursor.job && cursor.job.type === "build") releaseCursor(cursor)
    })
    const solarToggle = document.getElementById("solar-toggle")
    if (solarToggle) {
      solarToggle.classList.add("build-shell")
      assignWipe(solarToggle)
      solarTarget = {
        el: solarToggle,
        kind: "shell",
        label: "chrome.publish",
        fixed: true,
        status: "waiting",
        crew: [],
        selection: null,
        doneAt: 0,
      }
      assignCrew(solarTarget, 6)
    }
    cursors.forEach((cursor) => {
      if (!cursor.job) cursor.job = { type: "exit" }
    })
  }

  function finishIntro() {
    if (finished) return
    finished = true
    cancelAnimationFrame(rafId)
    window.removeEventListener("wheel", blockScroll)
    window.removeEventListener("touchmove", blockScroll)
    window.removeEventListener("keydown", blockScrollKeys)

    targets.forEach((target) => {
      if (target.status !== "done") completeTarget(target)
    })
    if (solarTarget && solarTarget.status !== "done") completeTarget(solarTarget)

    document.querySelectorAll(".reveal:not(.visible)").forEach(finishReveal)
    document.querySelectorAll(".build-shell").forEach((el) => {
      el.classList.remove("build-shell", "build-done")
    })
    layer.remove()
    document.body.classList.remove("build-active")
    document.documentElement.style.scrollBehavior = previousScrollBehavior
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - (frame._last || now)) / 1000)
    frame._last = now

    if (phase === "build") {
      let frontier = targets.find((target) => target.status !== "done")

      if (frontier && frontier !== lastFrontier) {
        lastFrontier = frontier
        frontierSince = now
      }
      if (frontier && now - frontierSince > FRONTIER_TIMEOUT) {
        completeTarget(frontier)
        frontier = targets.find((target) => target.status !== "done")
        lastFrontier = frontier
        frontierSince = now
      }

      if (!frontier) {
        if (!exitJobsAssigned) {
          exitJobsAssigned = true
          assignExitJobs()
        }
        const finishY = Math.min(scrollDistance, window.scrollY + dt * 4000)
        window.scrollTo(0, finishY)
        if (finishY >= scrollDistance - 1) {
          phase = "hold"
          holdUntil = now + holdDuration
          progressFill.style.width = "100%"
        }
      } else {
        const rect = frontier.el.getBoundingClientRect()
        const desiredDelta = rect.top - window.innerHeight * 0.38
        const maxStep = SCROLL_CHASE_SPEED * dt
        window.scrollTo(
          0,
          clamp(window.scrollY + clamp(desiredDelta, -maxStep, maxStep), 0, scrollDistance),
        )
      }

      buildProgress = scrollDistance > 0 ? clamp(window.scrollY / scrollDistance, 0, 1) : 1
      progressFill.style.width = `${Math.round(buildProgress * 100)}%`
    } else if (phase === "hold") {
      progressFill.style.width = "100%"
      if (now >= holdUntil) {
        phase = "return"
        returnStart = now
        if (!exitJobsAssigned) assignExitJobs()
      }
    } else if (phase === "return") {
      const progress = clamp((now - returnStart) / returnDuration, 0, 1)
      window.scrollTo(0, returnFrom * (1 - easeInOutCubic(progress)))
      progressFill.style.width = "100%"
      if (progress >= 1) finishIntro()
    }

    const currentScrollY = window.scrollY
    scrollVelocity = dt > 0 ? (currentScrollY - lastScrollY) / dt : 0
    lastScrollY = currentScrollY

    statusEl.textContent = phase === "return" ? "RETURNING TO TOP — SITE READY" : currentStatusLabel()

    if (phase === "build" || phase === "hold") updateTargets()
    forceCompleteMissing()
    cursors.forEach((cursor) => updateCursor(cursor, now, dt))

    if (!finished) rafId = requestAnimationFrame(frame)
  }

  rafId = requestAnimationFrame(frame)
  return new Promise((resolve) => {
    const check = window.setInterval(() => {
      if (finished) {
        window.clearInterval(check)
        resolve(true)
      }
    }, 120)
  })
}
