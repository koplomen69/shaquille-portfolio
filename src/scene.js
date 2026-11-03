import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import earthMap from "../planets/2k_earth_daymap.jpg"
import jupiterMap from "../planets/2k_jupiter.jpg"
import marsMap from "../planets/2k_mars.jpg"
import mercuryMap from "../planets/2k_mercury.jpg"
import moonMap from "../planets/2k_moon.jpg"
import neptuneMap from "../planets/2k_neptune.jpg"
import plutoMap from "../planets/2k_pluto.jpg"
import saturnMap from "../planets/2k_saturn.jpg"
import sunMap from "../planets/2k_sun.jpg"
import uranusMap from "../planets/2k_uranus.jpg"
import venusMap from "../planets/2k_venus_atmosphere.jpg"

/**
 * Real solar-system proportions with hybrid visual scaling:
 * - Orbital distances follow AU ratios (compressed with pow so outer planets stay in view)
 * - Planet radii keep relative order but are exaggerated for visibility
 * - Orbital speeds follow Keplerian period ratios
 */
const AU = [
  { name: "Mercury", au: 0.387, radiusKm: 2439.7, period: 87.97, texture: mercuryMap },
  { name: "Venus", au: 0.723, radiusKm: 6051.8, period: 224.7, texture: venusMap },
  { name: "Earth", au: 1.0, radiusKm: 6371, period: 365.25, texture: earthMap, hasMoon: true },
  { name: "Mars", au: 1.524, radiusKm: 3389.5, period: 686.98, texture: marsMap },
  { name: "Jupiter", au: 5.203, radiusKm: 69911, period: 4332.59, texture: jupiterMap },
  { name: "Saturn", au: 9.537, radiusKm: 58232, period: 10759.22, texture: saturnMap, hasRings: true },
  { name: "Uranus", au: 19.191, radiusKm: 25362, period: 30688.5, texture: uranusMap },
  { name: "Neptune", au: 30.069, radiusKm: 24622, period: 60182, texture: neptuneMap },
  { name: "Pluto", au: 39.482, radiusKm: 1188.3, period: 90560, texture: plutoMap },
]

const EARTH_KM = 6371
const SUN_KM = 695700

function orbitDistance(au) {
  // Compressed real AU spacing — Neptune stays reachable while Mercury/Venus stay separated
  return 7 + Math.pow(au, 0.62) * 14
}

function planetRadius(radiusKm) {
  // Exaggerated but ordered by real size (pow softens Jupiter/Saturn extremes)
  return Math.max(0.22, Math.pow(radiusKm / EARTH_KM, 0.42) * 0.72)
}

function sunRadius() {
  return Math.pow(SUN_KM / EARTH_KM, 0.28) * 1.15 // ~3.4 visual units — dominant but not overwhelming
}

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x03060c, 0)
  renderer.domElement.style.pointerEvents = "none"

  const scene = new THREE.Scene()
  const textureLoader = new THREE.TextureLoader()
  const loadTexture = (url) => textureLoader.load(url, undefined, undefined, (error) => {
    console.error(`Unable to load planet texture: ${url}`, error)
  })
  scene.fog = new THREE.FogExp2(0x03060c, 0.0045)

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 800)
  camera.position.set(0, 28, 52)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enablePan = true
  controls.enableRotate = true
  controls.rotateSpeed = 0.7
  controls.zoomSpeed = 1
  controls.panSpeed = 0.8
  controls.screenSpacePanning = true
  controls.minDistance = 8
  controls.maxDistance = 220
  controls.minPolarAngle = 0.05
  controls.maxPolarAngle = Math.PI - 0.05
  controls.target.set(0, 0, 0)
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.35
  controls.enabled = false

  // Lights
  scene.add(new THREE.AmbientLight(0x304060, 0.55))
  const sunLight = new THREE.PointLight(0xfff2c8, 2.8, 400, 1)
  sunLight.position.set(0, 0, 0)
  scene.add(sunLight)
  const rim = new THREE.DirectionalLight(0x4cd7f6, 0.25)
  rim.position.set(20, 30, 10)
  scene.add(rim)

  // Starfield
  const starCount = window.innerWidth < 768 ? 1800 : 4500
  const starPos = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount; i++) {
    const r = 80 + Math.random() * 280
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    starPos[i * 3 + 2] = r * Math.cos(phi)
  }
  const starGeo = new THREE.BufferGeometry()
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3))
  const stars = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.45,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  )
  scene.add(stars)

  // Sun
  const sunGroup = new THREE.Group()
  const sunR = sunRadius()
  const sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(sunR, 48, 48),
    new THREE.MeshBasicMaterial({ map: loadTexture(sunMap) }),
  )
  sunGroup.add(sunMesh)
  const sunGlow = new THREE.Mesh(
    new THREE.SphereGeometry(sunR * 1.35, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff9500,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    }),
  )
  sunGroup.add(sunGlow)
  const sunHalo = new THREE.Mesh(
    new THREE.SphereGeometry(sunR * 1.9, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff6a00,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    }),
  )
  sunGroup.add(sunHalo)
  scene.add(sunGroup)

  // Planets
  const planetBodies = []
  const labelEl = document.createElement("div")
  labelEl.id = "planet-label"
  labelEl.className = "planet-label"
  document.body.appendChild(labelEl)

  AU.forEach((def) => {
    const dist = orbitDistance(def.au)
    const size = planetRadius(def.radiusKm)

    // Orbit ring
    const orbitCurve = new THREE.EllipseCurve(0, 0, dist, dist, 0, Math.PI * 2, false, 0)
    const orbitPts = orbitCurve.getPoints(128).map((p) => new THREE.Vector3(p.x, 0, p.y))
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts)
    const orbitLine = new THREE.Line(
      orbitGeo,
      new THREE.LineBasicMaterial({
        color: 0x4edea3,
        transparent: true,
        opacity: 0.22,
      }),
    )
    scene.add(orbitLine)

    const pivot = new THREE.Object3D()
    scene.add(pivot)

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, 32, 32),
      new THREE.MeshStandardMaterial({
        map: loadTexture(def.texture),
        color: 0xffffff,
        emissive: 0x000000,
        emissiveIntensity: 0,
        roughness: 0.55,
        metalness: 0.15,
      }),
    )
    mesh.position.x = dist
    mesh.userData = {
      name: def.name,
      au: def.au,
      radiusKm: def.radiusKm,
      period: def.period,
      type: "planet",
    }
    pivot.add(mesh)

    // Soft point marker so distant planets stay findable
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(size * 0.15, 0.08), 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x9fe8cf }),
    )
    marker.position.y = size + 0.35
    mesh.add(marker)

    if (def.hasRings) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(size * 1.4, size * 2.35, 64),
        new THREE.MeshBasicMaterial({
          color: 0xd4c4a0,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.65,
        }),
      )
      ring.rotation.x = Math.PI / 2.15
      mesh.add(ring)
    }

    if (def.hasMoon) {
      const moonPivot = new THREE.Object3D()
      mesh.add(moonPivot)
      const moon = new THREE.Mesh(
        new THREE.SphereGeometry(size * 0.27, 16, 16),
        new THREE.MeshStandardMaterial({ map: loadTexture(moonMap), color: 0xffffff, roughness: 0.7 }),
      )
      moon.position.x = size * 2.2
      moonPivot.add(moon)
      planetBodies.push({
        pivot: moonPivot,
        mesh: moon,
        speed: (Math.PI * 2) / 27.3,
        spin: 0.02,
        isMoon: true,
      })
    }

    // Angular speed relative to Earth year (visual years compressed)
    const earthYearSec = 40
    const speed = ((Math.PI * 2) / def.period) * (365.25 / earthYearSec)

    planetBodies.push({
      pivot,
      mesh,
      speed,
      spin: 0.01 + Math.random() * 0.02,
      def,
      dist,
    })
  })

  // Asteroid belt between Mars (~1.5 AU) and Jupiter (~5.2 AU)
  const beltDist = orbitDistance(2.7)
  const beltCount = 400
  const beltPos = new Float32Array(beltCount * 3)
  for (let i = 0; i < beltCount; i++) {
    const a = Math.random() * Math.PI * 2
    const r = beltDist + (Math.random() - 0.5) * 3.5
    const y = (Math.random() - 0.5) * 0.6
    beltPos[i * 3] = Math.cos(a) * r
    beltPos[i * 3 + 1] = y
    beltPos[i * 3 + 2] = Math.sin(a) * r
  }
  const belt = new THREE.Points(
    new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(beltPos, 3)),
    new THREE.PointsMaterial({ color: 0x8a7a60, size: 0.12, transparent: true, opacity: 0.7 }),
  )
  scene.add(belt)

  // Interaction
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let interactive = false
  let focused = null

  function setInteractive(on) {
    interactive = on
    controls.enabled = on
    controls.autoRotate = !on
    renderer.domElement.style.pointerEvents = on ? "auto" : "none"
    canvas.classList.toggle("interactive", on)
    if (!on) {
      labelEl.classList.remove("show")
      focused = null
    }
  }

  function onPointerMove(e) {
    if (!interactive) return
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(
      planetBodies.filter((p) => !p.isMoon).map((p) => p.mesh),
      false,
    )
    if (hits.length) {
      const obj = hits[0].object
      const d = obj.userData
      labelEl.innerHTML = `<strong>${d.name}</strong><span>${d.au} AU · ⌀ ${(d.radiusKm * 2).toLocaleString()} km · ${Math.round(d.period)} d</span>`
      labelEl.style.left = `${e.clientX + 14}px`
      labelEl.style.top = `${e.clientY + 14}px`
      labelEl.classList.add("show")
      document.body.style.cursor = "pointer"
    } else {
      labelEl.classList.remove("show")
      document.body.style.cursor = interactive ? "grab" : ""
    }
  }

  function onPointerDown(e) {
    if (!interactive) return
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(
      planetBodies.filter((p) => !p.isMoon).map((p) => p.mesh),
      false,
    )
    if (hits.length) {
      focused = hits[0].object
      const world = new THREE.Vector3()
      focused.getWorldPosition(world)
      controls.target.lerp(world, 1)
      const offset = camera.position.clone().sub(controls.target).setLength(Math.max(focused.userData.au * 2, 4))
      camera.position.copy(controls.target).add(offset)
    }
  }

  function onDblClick() {
    if (!interactive) return
    focused = null
    controls.target.set(0, 0, 0)
    camera.position.set(0, 28, 52)
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true })
  renderer.domElement.addEventListener("pointerdown", onPointerDown)
  renderer.domElement.addEventListener("dblclick", onDblClick)

  let raf = 0
  const clock = new THREE.Clock()

  function animate() {
    raf = requestAnimationFrame(animate)
    const dt = clock.getDelta()
    const t = clock.elapsedTime

    sunMesh.rotation.y += 0.002
    sunGlow.scale.setScalar(1 + Math.sin(t * 1.5) * 0.03)

    planetBodies.forEach((body) => {
      body.pivot.rotation.y += body.speed * (dt || 0.016) * (body.isMoon ? 8 : 1)
      if (body.mesh) body.mesh.rotation.y += body.spin
    })

    belt.rotation.y += 0.0004
    stars.rotation.y += 0.00008

    if (focused) {
      const world = new THREE.Vector3()
      focused.getWorldPosition(world)
      controls.target.lerp(world, 0.08)
    }

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
    focusSun() {
      focused = null
      controls.target.set(0, 0, 0)
      camera.position.set(0, 28, 52)
    },
    destroy() {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", onResize)
      window.removeEventListener("pointermove", onPointerMove)
      controls.dispose()
      renderer.dispose()
      labelEl.remove()
    },
  }
}
