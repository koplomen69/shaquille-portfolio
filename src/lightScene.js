import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"

/**
 * Light-mode scene inspired by BlueYard's minimal aesthetic:
 * a serene particle "horizon" — a drifting wave field of ink-colored dots
 * with sparse accent particles, flowing contour lines, soft glow orbs,
 * and ambient dust, all on a warm paper background.
 */

const INK = new THREE.Color(0x23211c)
const ACCENTS = [0x2563eb, 0x0d9488, 0xb45309].map((c) => new THREE.Color(c))
const DUST_COLOR = new THREE.Color(0xc9c4b8)
const LINE_COLOR = new THREE.Color(0xa9a294)

function waveY(x, z, t) {
  return (
    Math.sin(x * 0.16 + t * 0.5) * 1.6 +
    Math.sin(z * 0.28 + t * 0.35) * 0.9 +
    Math.sin((x + z) * 0.08 + t * 0.22) * 1.2
  )
}

function makeGlowTexture() {
  const c = document.createElement("canvas")
  c.width = c.height = 256
  const ctx = c.getContext("2d")
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  g.addColorStop(0, "rgba(255,255,255,1)")
  g.addColorStop(0.35, "rgba(255,255,255,0.45)")
  g.addColorStop(1, "rgba(255,255,255,0)")
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function createLightScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.pointerEvents = "none"

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0xf4f2ec, 0.011)

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400)
  camera.position.set(0, 9, 30)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enablePan = true
  controls.enableRotate = true
  controls.rotateSpeed = 0.6
  controls.zoomSpeed = 0.9
  controls.panSpeed = 0.8
  controls.screenSpacePanning = true
  controls.minDistance = 8
  controls.maxDistance = 140
  controls.minPolarAngle = 0.08
  controls.maxPolarAngle = Math.PI - 0.08
  controls.target.set(0, 0, -2)
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.28
  controls.enabled = false

  // --- Particle wave field ---
  const COLS = 150
  const ROWS = 52
  const count = COLS * ROWS
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const baseX = new Float32Array(count)
  const baseZ = new Float32Array(count)
  const phase = new Float32Array(count)

  let idx = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = -48 + (c / (COLS - 1)) * 96
      const z = -30 + (r / (ROWS - 1)) * 60
      baseX[idx] = x
      baseZ[idx] = z
      phase[idx] = Math.random() * Math.PI * 2
      positions[idx * 3] = x
      positions[idx * 3 + 1] = waveY(x, z, 0)
      positions[idx * 3 + 2] = z

      const roll = Math.random()
      const col = roll < 0.84 ? INK : ACCENTS[Math.floor(Math.random() * ACCENTS.length)]
      colors[idx * 3] = col.r
      colors[idx * 3 + 1] = col.g
      colors[idx * 3 + 2] = col.b
      idx++
    }
  }

  const waveGeo = new THREE.BufferGeometry()
  waveGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
  waveGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  const wave = new THREE.Points(
    waveGeo,
    new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  )
  scene.add(wave)

  // --- Flowing contour lines ---
  const lines = []
  const LINE_COUNT = 7
  for (let i = 0; i < LINE_COUNT; i++) {
    const zBase = -26 + i * 8.6
    const segs = 160
    const pts = new Float32Array(segs * 3)
    for (let s = 0; s < segs; s++) {
      const x = -50 + (s / (segs - 1)) * 100
      pts[s * 3] = x
      pts[s * 3 + 1] = waveY(x, zBase, 0) + 0.4 + i * 0.12
      pts[s * 3 + 2] = zBase + Math.sin(x * 0.05 + i) * 1.5
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(pts, 3))
    const accent = i === LINE_COUNT - 2
    const line = new THREE.Line(
      geo,
      new THREE.LineBasicMaterial({
        color: accent ? 0x2563eb : LINE_COLOR.getHex(),
        transparent: true,
        opacity: accent ? 0.5 : 0.4,
      }),
    )
    scene.add(line)
    lines.push({ line, zBase, segs })
  }

  // --- Soft glow orbs (BlueYard-style minimal accents) ---
  const glowTex = makeGlowTexture()
  const orbs = [
    { x: -26, y: 6, z: -18, scale: 20, color: 0x93c5fd, opacity: 0.5, speed: 0.12 },
    { x: 24, y: 3, z: -10, scale: 15, color: 0x99f6e4, opacity: 0.45, speed: 0.09 },
    { x: -8, y: 10, z: -26, scale: 26, color: 0xfde68a, opacity: 0.3, speed: 0.07 },
    { x: 30, y: 9, z: 6, scale: 13, color: 0xbfdbfe, opacity: 0.55, speed: 0.14 },
  ]
  orbs.forEach((o) => {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: o.color,
        transparent: true,
        opacity: o.opacity,
        depthWrite: false,
      }),
    )
    sprite.position.set(o.x, o.y, o.z)
    sprite.scale.setScalar(o.scale)
    sprite.userData = o
    scene.add(sprite)
  })

  // --- Ambient dust ---
  const DUST = 700
  const dustPos = new Float32Array(DUST * 3)
  const dustSpeed = new Float32Array(DUST)
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 110
    dustPos[i * 3 + 1] = -6 + Math.random() * 16
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 70
    dustSpeed[i] = 0.12 + Math.random() * 0.3
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3))
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({
      color: DUST_COLOR,
      size: 0.09,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  )
  scene.add(dust)

  // --- Interaction ---
  let interactive = false
  let active = true

  function setInteractive(on) {
    interactive = on
    controls.enabled = on
    controls.autoRotate = !on
    renderer.domElement.style.pointerEvents = on ? "auto" : "none"
    canvas.classList.toggle("interactive", on)
    if (on) document.body.style.cursor = "grab"
    else document.body.style.cursor = ""
  }

  function onDblClick() {
    if (!interactive) return
    controls.target.set(0, 0, -2)
    camera.position.set(0, 9, 30)
  }
  renderer.domElement.addEventListener("dblclick", onDblClick)

  let raf = 0
  const clock = new THREE.Clock()

  function animate() {
    raf = requestAnimationFrame(animate)
    const dt = clock.getDelta()
    if (!active) return
    const t = clock.elapsedTime

    const pos = waveGeo.attributes.position.array
    for (let i = 0; i < count; i++) {
      const j = i * 3
      pos[j + 1] =
        waveY(baseX[i], baseZ[i], t + phase[i] * 0.15) + Math.sin(t * 0.4 + phase[i]) * 0.25
    }
    waveGeo.attributes.position.needsUpdate = true
    wave.rotation.y = t * 0.008

    lines.forEach(({ line, zBase, segs }) => {
      const lp = line.geometry.attributes.position.array
      for (let s = 0; s < segs; s++) {
        const x = -50 + (s / (segs - 1)) * 100
        const j = s * 3
        lp[j] = x
        lp[j + 1] = waveY(x, zBase, t * 0.9) + 0.4
        lp[j + 2] = zBase + Math.sin(x * 0.05 + t * 0.1) * 1.5
      }
      line.geometry.attributes.position.needsUpdate = true
    })

    scene.children.forEach((child) => {
      if (child.isSprite && child.userData.scale) {
        child.position.y = child.userData.y + Math.sin(t * child.userData.speed + child.userData.x) * 1.2
        child.material.opacity = child.userData.opacity * (0.85 + Math.sin(t * 0.5 + child.userData.z) * 0.15)
      }
    })

    for (let i = 0; i < DUST; i++) {
      const j = i * 3
      dustPos[j + 1] += dustSpeed[i] * (dt || 0.016)
      if (dustPos[j + 1] > 10) dustPos[j + 1] = -6
    }
    dustGeo.attributes.position.needsUpdate = true

    controls.update()
    renderer.render(scene, camera)
  }

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
  window.addEventListener("resize", onResize)
  animate()

  return {
    setInteractive,
    setActive(v) {
      active = v
      if (v) onResize()
    },
    resetView() {
      controls.target.set(0, 0, -2)
      camera.position.set(0, 9, 30)
    },
    destroy() {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      renderer.domElement.removeEventListener("dblclick", onDblClick)
      controls.dispose()
      renderer.dispose()
      glowTex.dispose()
    },
  }
}
