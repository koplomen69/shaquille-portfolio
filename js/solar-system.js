function ensureCssColor(c) {
  if (!c) return c;
  c = String(c).trim();
  if (/^[0-9a-fA-F]{3}$/.test(c) || /^[0-9a-fA-F]{6}$/.test(c)) return '#' + c;
  return c;
}

function loadTexturePromise(url) {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    loader.load(url, texture => resolve(texture), undefined, err => reject(err));
  });
}


class SolarSystem {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvas = null;
    this.animationId = null;

    this.sun = null;
    this.planets = [];
    this.asteroidBelt = null;
    this.stars = null;
    this.constellationLines = [];

    this.textureLoader = new THREE.TextureLoader();
    this.textures = {};
    this.texturesLoaded = false;

    this.controls = {
      rotationSpeed: 0.2, // Initial rotation speed (0x to 10x)
      timeScale: 0.5, // Initial time scale (0.1x to 100x)
      isPaused: false,
      showTrails: true,
      showLabels: false,
      showOrbits: true,
      cameraAutoRotate: true,
      focusedPlanet: null
    };

    this.time = 0;
    this.lastTime = performance.now();
    this.cameraControls = null;
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
    this.cameraDistance = 60;
    this.cameraAngle = Math.PI / 2; // Initial camera angle
    this.cameraVerticalAngle = Math.PI / 3; // Initial camera vertical angle

    this.isMouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;

    this.uiElement = null;

    this.planetData = {
      mercury: {
        name: 'Mercury',
        radius: 0.2439 * 3,
        distance: 0.387 * 30,
        speed: 4.149,
        color: 0x8C6239,
        trailColor: 0x8C6239,
        inclination: 7.0,
        eccentricity: 0.206,
        rotationPeriod: 58.646 * 3600,
        texture: 'planets/2k_mercury.jpg'
      },
      venus: {
        name: 'Venus',
        radius: 0.6052 * 2,
        distance: 0.723 * 30,
        speed: 1.626,
        color: 0xFF6B47,
        trailColor: 0xFF6B47,
        inclination: 3.4,
        eccentricity: 0.007,
        rotationPeriod: -243.018 * 3600,
        texture: 'planets/2k_venus_atmosphere.jpg'
      },
      earth: {
        name: 'Earth',
        radius: 0.6371 * 2,
        distance: 1.000 * 30,
        speed: 1.000,
        color: 0x4A90E2,
        trailColor: 0x4A90E2,
        inclination: 0.0,
        eccentricity: 0.017,
        rotationPeriod: 24 * 3600,
        hasMoon: true,
        texture: 'planets/2k_earth_daymap.jpg',
      },
      mars: {
        name: 'Mars',
        radius: 0.3390 * 2,
        distance: 1.524 * 30,
        speed: 0.532,
        color: 0xCD5C5C,
        trailColor: 0xCD5C5C,
        inclination: 1.9,
        eccentricity: 0.094,
        rotationPeriod: 24.622 * 3600,
        texture: 'planets/2k_mars.jpg'
      },
      jupiter: {
        name: 'Jupiter',
        radius: 5.9911,
        distance: 5.203 * 30,
        speed: 0.084,
        color: 0xD8CA9D,
        trailColor: 0xD8CA9D,
        inclination: 1.3,
        eccentricity: 0.049,
        rotationPeriod: 9.925 * 3600,
        texture: 'planets/2k_jupiter.jpg'
      },
      saturn: {
        name: 'Saturn',
        radius: 4.8232,
        distance: 9.539 * 30,
        speed: 0.034,
        color: 0xFAD5A5,
        trailColor: 0xFAD5A5,
        inclination: 2.5,
        eccentricity: 0.057,
        rotationPeriod: 10.656 * 3600,
        hasRings: true,
        texture: 'planets/2k_saturn.jpg',
        ringTexture: 'planets/2k_saturn_ring_alpha.png'
      },
      uranus: {
        name: 'Uranus',
        radius: 2.5362,
        distance: 19.191 * 30,
        speed: 0.012,
        color: 0x4FD0E7,
        trailColor: 0x4FD0E7,
        inclination: 0.8,
        eccentricity: 0.046,
        rotationPeriod: -17.24 * 3600,
        texture: 'planets/2k_uranus.jpg'
      },
      neptune: {
        name: 'Neptune',
        radius: 2.4622,
        distance: 30.069 * 30,
        speed: 0.006,
        color: 0x4B70DD,
        trailColor: 0x4B70DD,
        inclination: 1.8,
        eccentricity: 0.011,
        rotationPeriod: 16.11 * 3600,
        texture: 'planets/2k_neptune.jpg'
      },
      pluto: {
        name: 'Pluto',
        radius: 0.1188 * 4,
        distance: 39.482 * 30,
        speed: 0.004,
        color: 0xD3C7A1,
        trailColor: 0xD3C7A1,
        inclination: 17.2,
        eccentricity: 0.249,
        rotationPeriod: 6.387 * 24 * 3600,
        texture: 'planets/2k_pluto.jpg'
      }
    };

    this.texturePaths = {
      sun: 'planets/2k_sun.jpg',
      moon: 'planets/2k_moon.jpg',
      saturnRing: 'planets/2k_saturn_ring_alpha.png',
      pluto: 'planets/2k_pluto.jpg',
      earthClouds: 'planets/earth_clouds.png'
    };

    this.starCatalog = [
      { name: 'Betelgeuse', ra: 5.9195, dec: 7.4071, mag: 0.45, color: 0xffaaaa },
      { name: 'Rigel', ra: 5.2423, dec: -8.2016, mag: 0.18, color: 0xaabbff },
      { name: 'Bellatrix', ra: 5.4188, dec: 6.3497, mag: 1.64, color: 0xffffff },
      { name: 'Mintaka', ra: 5.5334, dec: -0.2991, mag: 2.25, color: 0xaabbff },
      { name: 'Alnilam', ra: 5.6036, dec: -1.2019, mag: 1.69, color: 0xaabbff },
      { name: 'Alnitak', ra: 5.6793, dec: -1.9426, mag: 1.74, color: 0xaabbff },
      { name: 'Saiph', ra: 5.7955, dec: -9.6697, mag: 2.07, color: 0xaabbff },
      { name: 'Alkaid', ra: 13.7924, dec: 49.3133, mag: 1.85, color: 0xffffff },
      { name: 'Mizar', ra: 13.3988, dec: 54.9254, mag: 2.23, color: 0xffffff },
      { name: 'Alioth', ra: 12.9001, dec: 55.9598, mag: 1.76, color: 0xffffff },
      { name: 'Megrez', ra: 12.2570, dec: 57.0320, mag: 3.32, color: 0xffffff },
      { name: 'Phecda', ra: 11.8969, dec: 53.6948, mag: 2.41, color: 0xffffff },
      { name: 'Merak', ra: 11.0307, dec: 56.3824, mag: 2.34, color: 0xffffff },
      { name: 'Dubhe', ra: 11.0622, dec: 61.7510, mag: 1.81, color: 0xffeeaa },
      { name: 'Antares', ra: 16.4901, dec: -26.4320, mag: 1.06, color: 0xffaaaa },
      { name: 'Shaula', ra: 17.5602, dec: -37.1038, mag: 1.62, color: 0xaabbff },
      { name: 'Dschubba', ra: 16.0055, dec: -22.6167, mag: 2.29, color: 0xaabbff },
      { name: 'Sargas', ra: 17.7005, dec: -42.9981, mag: 1.86, color: 0xffeeaa },
      { name: 'Schedar', ra: 0.6751, dec: 56.5371, mag: 2.24, color: 0xffeeaa },
      { name: 'Caph', ra: 0.1520, dec: 59.1497, mag: 2.28, color: 0xffffff },
      { name: 'Tsih', ra: 0.9566, dec: 60.7161, mag: 2.51, color: 0xaabbff },
      { name: 'Ruchbah', ra: 1.4289, dec: 60.2353, mag: 2.68, color: 0xffffff },
      { name: 'Segin', ra: 1.9042, dec: 63.6701, mag: 3.35, color: 0xffffff },
      { name: 'Deneb', ra: 20.6905, dec: 45.2803, mag: 1.25, color: 0xffffff },
      { name: 'Albireo', ra: 19.5110, dec: 27.9597, mag: 3.05, color: 0xffeeaa },
      { name: 'Sadr', ra: 20.3705, dec: 40.2567, mag: 2.23, color: 0xffffff },
      { name: 'Sirius', ra: 6.7525, dec: -16.7161, mag: -1.46, color: 0xffffff },
      { name: 'Canopus', ra: 6.3992, dec: -52.6957, mag: -0.74, color: 0xffffff },
      { name: 'Arcturus', ra: 14.2612, dec: 19.1824, mag: -0.05, color: 0xffeeaa },
      { name: 'Vega', ra: 18.6156, dec: 38.7837, mag: 0.03, color: 0xaabbff },
      { name: 'Capella', ra: 5.2782, dec: 45.9980, mag: 0.08, color: 0xffeeaa },
      { name: 'Procyon', ra: 7.6550, dec: 5.2247, mag: 0.34, color: 0xffffff },
      { name: 'Altair', ra: 19.8464, dec: 8.8683, mag: 0.77, color: 0xffffff },
      { name: 'Aldebaran', ra: 4.5987, dec: 16.5093, mag: 0.87, color: 0xffaaaa },
      { name: 'Spica', ra: 13.4199, dec: -11.1613, mag: 0.98, color: 0xaabbff },
      { name: 'Pollux', ra: 7.7553, dec: 28.0262, mag: 1.16, color: 0xffeeaa },
      { name: 'Regulus', ra: 10.1395, dec: 11.9672, mag: 1.36, color: 0xaabbff },
      { name: 'Fomalhaut', ra: 22.9608, dec: -29.6222, mag: 1.16, color: 0xffffff },
      { name: 'Achernar', ra: 1.6286, dec: -57.2367, mag: 0.45, color: 0xaabbff },
      { name: 'Betelgeuse', ra: 5.9195, dec: 7.4071, mag: 0.45, color: 0xffaaaa },
      { name: 'Polaris', ra: 2.5303, dec: 89.2641, mag: 1.97, color: 0xffeeaa },
      { name: 'Castor', ra: 7.5767, dec: 31.8883, mag: 1.58, color: 0xffffff },
      { name: 'Mirfak', ra: 3.4054, dec: 49.8612, mag: 1.79, color: 0xffeeaa },
      { name: 'Wezen', ra: 7.1397, dec: -26.3933, mag: 1.83, color: 0xffeeaa },
      { name: 'Alphard', ra: 9.4598, dec: -8.6586, mag: 2.00, color: 0xffeeaa },
      { name: 'Hamal', ra: 2.1198, dec: 23.4624, mag: 2.01, color: 0xffeeaa },
      { name: 'Diphda', ra: 0.7265, dec: -17.9866, mag: 2.04, color: 0xffeeaa },
      { name: 'Mirach', ra: 1.1623, dec: 35.6206, mag: 2.07, color: 0xffaaaa },
      { name: 'Almach', ra: 2.0648, dec: 42.3297, mag: 2.10, color: 0xffeeaa },
      { name: 'Adhara', ra: 6.9771, dec: -28.9721, mag: 1.50, color: 0xaabbff }
    ];

    this.constellationData = [
      { name: 'Orion Belt', indices: [3, 4, 5] },
      { name: 'Orion Body', indices: [0, 2, 6, 1] },
      { name: 'Big Dipper', indices: [13, 12, 11, 10, 9, 8, 7] },
      { name: 'Scorpius', indices: [14, 16, 15, 17] },
      { name: 'Cassiopeia', indices: [19, 20, 21, 22, 23] },
      { name: 'Cygnus', indices: [24, 25, 26] }
    ];

    this.init();
  }

  init() {
    console.log('🚀 Initializing Solar System...');
    this.canvas = document.getElementById('solar-system-canvas');
    if (!this.canvas) {
      console.error('❌ Canvas element not found!');
      return false;
    }

    try {
      this.setupThreeJS();
      this.setupUI();
      console.log('✅ Three.js and UI setup complete');

      this.loadTextures(() => {
        console.log('✅ Textures loaded, creating solar system...');
        this.createSolarSystem();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        console.log('✅ Solar system fully initialized');
      });

      window.solarSystem = this;
      return true;
    } catch (error) {
      console.error('❌ Solar system initialization failed:', error);
      return false;
    }
  }

  loadTextures(callback) {
    console.log('Loading planetary textures...');
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingText = document.getElementById('loadingText');
    const progressBar = document.getElementById('progressBar');

    const textureList = [];
    let loadedCount = 0;

    const basePath = window.location.href.replace(/\/[^\/]*$/, '/');

    textureList.push({ path: this.getAbsolutePath(this.texturePaths.sun), name: 'sun', fallbackColor: 0xFDB813 });
    textureList.push({ path: this.getAbsolutePath(this.texturePaths.moon), name: 'moon', fallbackColor: 0x888888 });
    textureList.push({ path: this.getAbsolutePath(this.texturePaths.saturnRing), name: 'saturnRing', fallbackColor: 0xFAD5A5 });
    textureList.push({ path: this.getAbsolutePath(this.texturePaths.pluto), name: 'pluto', fallbackColor: 0xD3C7A1 });
    textureList.push({ path: this.getAbsolutePath(this.texturePaths.earthClouds), name: 'earthClouds', fallbackColor: 0xFFFFFF });

    Object.keys(this.planetData).forEach(planetName => {
      const data = this.planetData[planetName];
      if (data.texture) {
        textureList.push({ path: this.getAbsolutePath(data.texture), name: data.name.toLowerCase(), fallbackColor: data.color });
      }
      if (data.ringTexture) {
        textureList.push({ path: this.getAbsolutePath(data.ringTexture), name: data.name.toLowerCase() + 'Ring', fallbackColor: data.color });
      }
      if (data.cloudTexture) {
        textureList.push({ path: this.getAbsolutePath(data.cloudTexture), name: data.name.toLowerCase() + 'Clouds', fallbackColor: 0xFFFFFF });
      }
    });

    const totalTextures = textureList.length;
    console.log('Textures to load:', textureList.map(t => `${t.name}: ${t.path}`));

    const updateProgress = () => {
      const progress = (loadedCount / totalTextures) * 100;
      if (progressBar) progressBar.style.width = progress + '%';
      if (loadingText) loadingText.textContent = `Loading textures... ${Math.round(progress)}%`;
    };

    updateProgress();

    const texturePromises = textureList.map(({ path, name, fallbackColor }) => {
      return new Promise((resolve) => {
        const loadStrategies = [
          () => this.loadTextureWithStrategy(path, 'absoluteUrl'),
          () => this.loadTextureWithStrategy(path, 'crossOrigin'),
          () => this.loadTextureWithStrategy(path.replace(/^\//, './'), 'relative'),
          () => Promise.resolve(this.createFallbackTexture(name, fallbackColor))
        ];

        const tryNextStrategy = (strategyIndex = 0) => {
          if (strategyIndex >= loadStrategies.length) {
            console.warn(`All loading strategies failed for ${name}, using fallback`);
            const fallbackTexture = this.createFallbackTexture(name, fallbackColor);
            this.textures[name] = fallbackTexture;
            loadedCount++;
            updateProgress();
            resolve(fallbackTexture);
            return;
          }

          loadStrategies[strategyIndex]()
            .then((texture) => {
              if (texture) {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
                this.textures[name] = texture;
                loadedCount++;
                updateProgress();
                console.log(`✓ Loaded texture: ${name} (strategy ${strategyIndex + 1})`);
                resolve(texture);
              } else {
                tryNextStrategy(strategyIndex + 1);
              }
            })
            .catch(() => {
              tryNextStrategy(strategyIndex + 1);
            });
        };

        tryNextStrategy();
      });
    });

    Promise.all(texturePromises)
      .then(() => {
        console.log(`Texture loading complete: ${textureList.length}/${textureList.length} loaded`);
        this.texturesLoaded = true;
        if (loadingText) loadingText.textContent = 'Initializing solar system...';
        setTimeout(() => { if (loadingScreen) loadingScreen.classList.add('hidden'); callback(); }, 1000);
      })
      .catch((error) => {
        console.warn('Texture loading failed:', error);
        this.texturesLoaded = true;
        if (loadingScreen) loadingScreen.classList.add('hidden');
        callback();
      });
  }

  getAbsolutePath(relativePath) {
    if (relativePath.startsWith('http') || relativePath.startsWith('//')) return relativePath;
    const basePath = window.location.href.replace(/\/[^\/]*$/, '/');
    return basePath + relativePath.replace(/^\//, '');
  }

  loadTextureWithStrategy(path, strategy) {
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader();
      switch (strategy) {
        case 'crossOrigin': loader.crossOrigin = 'anonymous'; break;
      }
      const timeout = setTimeout(() => reject(new Error('Texture loading timeout')), 10000);
      loader.load(path, (texture) => {
        clearTimeout(timeout);
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        resolve(texture);
      }, null, (error) => { clearTimeout(timeout); reject(error); });
    });
  }

  createFallbackTexture(name, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    if (name.includes('sun')) {
      gradient.addColorStop(stop, ensureCssColor(colorValue));

    } else {
      const hexColor = '#' + color.toString(16).padStart(6, '0');
      gradient.addColorStop(0, hexColor); gradient.addColorStop(1, new THREE.Color(color).multiplyScalar(0.6).getHexString());
    }
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 512);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping;
    console.log(`✓ Created fallback texture for ${name}`);
    return texture;
  }

  setupThreeJS() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
    this.camera.position.set(0, 200, 600);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: window.devicePixelRatio < 2, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      this.renderer.shadowMap.enabled = false;
      this.renderer.antialias = false;
    } else {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    this.ambientLight = new THREE.AmbientLight(0x000000, 0.3);
    this.scene.add(this.ambientLight);

    this.sunLight = new THREE.PointLight(0xffffee, 3.5, 4500);
    this.sunLight.position.set(0, 0, 0);
    this.dirLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    this.dirLight1.position.set(50, 50, 50);
    this.scene.add(this.dirLight1);
    this.dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    this.dirLight2.position.set(-50, 30, -50);
    this.scene.add(this.dirLight2);
    this.rimLight = new THREE.DirectionalLight(0x000000, 0.2);
    this.rimLight.position.set(0, 100, 0);
    this.scene.add(this.rimLight);

    if (!isMobile) {
      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.width = 2048;
      this.sunLight.shadow.mapSize.height = 2048;
    }

    this.scene.add(this.sunLight);

    const gl = this.renderer.getContext();
    console.log('WebGL Context:', gl ? 'Initialized' : 'Failed');
  }

  setupUI() {
    this.uiElement = document.createElement('div');
    this.uiElement.style.position = 'absolute';
    this.uiElement.style.top = '10px';
    this.uiElement.style.left = '10px';
    this.uiElement.style.color = 'white';
    this.uiElement.style.fontFamily = 'Arial, sans-serif';
    this.uiElement.style.fontSize = '14px';
    this.uiElement.style.background = 'rgba(0, 0, 0, 0.5)';
    this.uiElement.style.padding = '10px';
    this.uiElement.style.borderRadius = '5px';
    document.body.appendChild(this.uiElement);

    this.updateUI();
  }

  updateUI() {
    this.uiElement.innerHTML = `
      <div>Controls:</div>
      <div>Paused: ${this.controls.isPaused ? 'Yes' : 'No'} (Space)</div>
      <div>Trails: ${this.controls.showTrails ? 'On' : 'Off'} (T)</div>
      <div>Labels: ${this.controls.showLabels ? 'On' : 'Off'} (L)</div>
      <div>Orbits & Constellations: ${this.controls.showOrbits ? 'On' : 'Off'} (O)</div>
      <div>Focus: ${this.controls.focusedPlanet ? this.controls.focusedPlanet.data.name : 'None'} (1-9)</div>
      <div>Camera Auto-Rotate: ${this.controls.cameraAutoRotate ? 'On' : 'Off'} (A)</div>
      <div>Camera Vertical Angle: ${(this.cameraVerticalAngle * 180 / Math.PI).toFixed(1)}° (Mouse Y)</div>
      <div>Camera Distance: <input type="number" value="${this.cameraDistance}" id="cameraDistanceInput" style="width: 80px; margin-top: 5px;"></div>
      <div style="margin-top: 10px;">
        Rotation Speed: <span id="rotationSpeedValue">${this.controls.rotationSpeed.toFixed(1)}x</span><br>
        <input type="range" id="rotationSpeedSlider" min="0" max="10" step="0.1" value="${this.controls.rotationSpeed}" style="width: 150px;">
      </div>
      <div style="margin-top: 10px;">
        Time Scale: <span id="timeScaleValue">${this.controls.timeScale.toFixed(1)}x</span><br>
        <input type="range" id="timeScaleSlider" min="0" max="2" step="0.01" value="${Math.log10(this.controls.timeScale / 0.1)}" style="width: 150px;">
      </div>
      <div style="margin-top: 10px;">Reset Camera: (R)</div>
    `;

    const distanceInput = document.getElementById('cameraDistanceInput');
    if (distanceInput) {
      distanceInput.addEventListener('change', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
          this.setCameraDistance(value);
        }
      });
    }

    const rotationSpeedSlider = document.getElementById('rotationSpeedSlider');
    if (rotationSpeedSlider) {
      rotationSpeedSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        this.setRotationSpeed(value);
        document.getElementById('rotationSpeedValue').textContent = `${value.toFixed(1)}x`;
      });
    }

    const timeScaleSlider = document.getElementById('timeScaleSlider');
    if (timeScaleSlider) {
      timeScaleSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        const scale = 0.1 * Math.pow(10, value); // Logarithmic scale: 0.1 to 100
        this.setTimeScale(scale);
        document.getElementById('timeScaleValue').textContent = `${scale.toFixed(1)}x`;
      });
    }
  }

  setCameraDistance(distance) {
    this.cameraDistance = Math.max(0.1, distance);
    this.updateUI();
  }

  setRotationSpeed(speed) {
    this.controls.rotationSpeed = Math.max(0, Math.min(10, speed));
    this.updateUI();
  }

  setTimeScale(scale) {
    this.controls.timeScale = Math.max(0.1, Math.min(100, scale));
    this.updateUI();
  }

  createSolarSystem() {
    this.createStarField();
    this.createConstellationLines();
    this.createSun();
    this.createPlanets();
    this.createAsteroidBelt();
  }

  createStarField() {
    this.starGroup = new THREE.Group();
    this.scene.add(this.starGroup);

    const catalogStarCount = this.starCatalog.length;
    const catalogStarGeometry = new THREE.BufferGeometry();
    const catalogPositions = new Float32Array(catalogStarCount * 3);
    const catalogColors = new Float32Array(catalogStarCount * 3);
    const catalogSizes = new Float32Array(catalogStarCount);
    const radius = 10000;

    this.starCatalog.forEach((star, i) => {
      const i3 = i * 3;
      const raRad = star.ra * (Math.PI / 12);
      const decRad = star.dec * (Math.PI / 180);
      const theta = raRad;
      const phi = Math.PI / 2 - decRad;
      catalogPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      catalogPositions[i3 + 1] = radius * Math.cos(phi);
      catalogPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      catalogSizes[i] = Math.max(8, 16 - star.mag * 2);
      const color = new THREE.Color(star.color);
      catalogColors[i3] = color.r;
      catalogColors[i3 + 1] = color.g;
      catalogColors[i3 + 2] = color.b;
    });

    catalogStarGeometry.setAttribute('position', new THREE.BufferAttribute(catalogPositions, 3));
    catalogStarGeometry.setAttribute('color', new THREE.BufferAttribute(catalogColors, 3));
    catalogStarGeometry.setAttribute('size', new THREE.BufferAttribute(catalogSizes, 1));

    const catalogStarMaterial = new THREE.PointsMaterial({
      size: 45,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: false,
      depthWrite: false
    });

    this.catalogStars = new THREE.Points(catalogStarGeometry, catalogStarMaterial);
    this.starGroup.add(this.catalogStars);

    const randomStarCount = 40000;
    const randomStarGeometry = new THREE.BufferGeometry();
    const randomPositions = new Float32Array(randomStarCount * 3);
    const randomColors = new Float32Array(randomStarCount * 3);
    const randomSizes = new Float32Array(randomStarCount);

    for (let i = 0; i < randomStarCount; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      randomPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      randomPositions[i3 + 1] = radius * Math.cos(phi);
      randomPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      randomSizes[i] = 1 + Math.random() * 2;
      const color = new THREE.Color().setHSL(Math.random(), 0.2, 0.7);
      randomColors[i3] = color.r;
      randomColors[i3 + 1] = color.g;
      randomColors[i3 + 2] = color.b;
    }

    randomStarGeometry.setAttribute('position', new THREE.BufferAttribute(randomPositions, 3));
    randomStarGeometry.setAttribute('color', new THREE.BufferAttribute(randomColors, 3));
    randomStarGeometry.setAttribute('size', new THREE.BufferAttribute(randomSizes, 3));

    const randomStarMaterial = new THREE.PointsMaterial({
      size: 2,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: false,
      map: this.createStarTexture(),
      depthWrite: false
    });

    this.stars = new THREE.Points(randomStarGeometry, randomStarMaterial);
    this.starGroup.add(this.stars);

    console.log('Star field created with', catalogStarCount, 'cataloged stars and', randomStarCount, 'random stars at radius', radius);

    for (let i = 0; i < Math.min(5, this.starCatalog.length); i++) {
      const geometry = new THREE.SphereGeometry(10, 16, 16);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(catalogPositions[i * 3], catalogPositions[i * 3 + 1], catalogPositions[i * 3 + 2]);
      this.starGroup.add(sphere);
      console.log(`Debug sphere for ${this.starCatalog[i].name} at`, sphere.position);
    }
  }

  createStarTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }

  updateDynamicStarField() {
    if (this.starGroup) {
      // Ensure starGroup has no rotation
      this.starGroup.rotation.set(0, 0, 0);
      if (this.catalogStars) {
        const catalogSizes = this.catalogStars.geometry.attributes.size.array;
        for (let i = 0; i < this.starCatalog.length; i++) {
          catalogSizes[i] = Math.max(8, 16 - this.starCatalog[i].mag * 2) + Math.sin(this.time * 0.002 + i) * 2;
        }
        this.catalogStars.geometry.attributes.size.needsUpdate = true;
      }
      if (this.stars) {
        const randomSizes = this.stars.geometry.attributes.size.array;
        for (let i = 0; i < randomSizes.length; i++) {
          randomSizes[i] = 1 + Math.random() * 2 + Math.sin(this.time * 0.003 + i) * 0.5;
        }
        this.stars.geometry.attributes.size.needsUpdate = true;
      }
      console.log('Starfield rotation:', this.starGroup.rotation.y, 'Catalog star size:', this.catalogStars ? this.catalogStars.geometry.attributes.size.array[0] : 'N/A');
    }
  }

  createConstellationLines() {
    const radius = 10000;
    this.constellationLines = [];
    this.constellationData.forEach(constellation => {
      const points = [];
      constellation.indices.forEach(index => {
        const star = this.starCatalog[index];
        const raRad = star.ra * (Math.PI / 12);
        const decRad = star.dec * (Math.PI / 180);
        const theta = raRad;
        const phi = Math.PI / 2 - decRad;
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);
        points.push(new THREE.Vector3(x, y, z));
      });

      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.3
      });

      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.visible = this.controls.showOrbits;
      this.starGroup.add(line);
      this.constellationLines.push(line);
    });
    console.log('Created', this.constellationLines.length, 'constellation lines in starGroup');
  }

  createSun() {
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    let sunMaterial = new THREE.MeshBasicMaterial({
      map: this.textures.sun || null,
      emissive: 0xffcc00,
      emissiveIntensity: 0.4,
      transparent: false,
      side: THREE.FrontSide,
      color: this.textures.sun ? null : 0xFDB813
    });
    this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
    this.sun.castShadow = false;
    this.sun.receiveShadow = false;
    this.sun.userData = { name: 'Sun' };
    this.scene.add(this.sun);
  }

  createPlanets() {
    Object.keys(this.planetData).forEach(planetName => {
      console.log(`Creating planet: ${planetName}`);
      const data = this.planetData[planetName];
      const planet = this.createPlanet(data);
      if (planet) {
        this.planets.push(planet);
        this.scene.add(planet.group);
        if (this.controls.showTrails) {
          this.createPlanetTrail(planet);
        }
        if (this.controls.showLabels) {
          this.createPlanetLabel(planet);
        }
        if (this.controls.showOrbits) {
          this.createOrbitLine(planet);
        }
      }
    });
  }

  createPlanet(data) {
    const group = new THREE.Group();
    const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
    let material = new THREE.MeshPhongMaterial({
      map: this.textures[data.name.toLowerCase()] || null,
      color: this.textures[data.name.toLowerCase()] ? null : data.color,
      shininess: data.name === 'Earth' ? 120 : 50,
      specular: 0x333333,
      transparent: false,
      side: THREE.FrontSide
    });
    const planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.receiveShadow = true;
    planet.userData = { name: data.name, data: data };
    group.add(planet);

    if (data.hasMoon) {
      const moonGroup = new THREE.Group();
      const moonGeometry = new THREE.SphereGeometry(0.1737, 32, 32);
      let moonMaterial = new THREE.MeshPhongMaterial({
        map: this.textures.moon || null,
        color: this.textures.moon ? null : 0x888888,
        shininess: 20,
        transparent: false
      });
      const moon = new THREE.Mesh(moonGeometry, moonMaterial);
      moon.castShadow = true;
      moon.receiveShadow = true;
      moon.userData = { name: 'Moon', parent: 'Earth' };
      moonGroup.add(moon);
      moonGroup.position.set(0.3844 * 10, 0, 0);
      group.add(moonGroup);
      group.moonGroup = moonGroup;
      if (this.controls.showLabels) {
        this.createPlanetLabel({ group: moonGroup, data: { name: 'Moon' } });
      }
    }

    if (data.hasRings) {
      const lod = new THREE.LOD();
      const levels = [
        { distance: 200, innerRadius: data.radius * 1.2, outerRadius: data.radius * 2.5, segments: 64 },
        { distance: 1000, innerRadius: data.radius * 1.2, outerRadius: data.radius * 2.5, segments: 32 }
      ];

      levels.forEach(level => {
        const ringGeometry = new THREE.RingGeometry(level.innerRadius, level.outerRadius, level.segments);
        let ringMaterial = new THREE.MeshPhongMaterial({
          map: this.textures[data.name.toLowerCase() + 'Ring'] || null,
          color: this.textures[data.name.toLowerCase() + 'Ring'] ? null : 0xdddddd,
          transparent: false,
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        lod.addLevel(ringMesh, level.distance);
      });

      lod.rotation.x = Math.PI / 2;
      group.add(lod);
      group.rings = lod;
    }

    if (data.hasClouds) {
      const cloudGeometry = new THREE.SphereGeometry(data.radius * 1.01, 64, 64);
      const cloudMaterial = new THREE.MeshPhongMaterial({
        map: this.textures[data.name.toLowerCase() + 'Clouds'] || null,
        transparent: false,
        side: THREE.FrontSide
      });
      const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
      group.add(clouds);
      group.clouds = clouds;
    }

    return {
      group,
      planet,
      data,
      angle: Math.random() * Math.PI * 2,
      orbitSpeed: (2 * Math.PI) / (365.25 / data.speed * 86400) * 10000,
      rotationSpeed: ((2 * Math.PI) / data.rotationPeriod) * 1000, // Scaled for visibility
      trail: []
    };
  }

  createPlanetTrail(planetObj) {
    const trailLength = 2000;
    const trailGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(trailLength * 3);
    const colors = new Float32Array(trailLength * 3);
    const sizes = new Float32Array(trailLength);

    for (let i = 0; i < trailLength; i++) {
      const i3 = i * 3;
      positions[i3] = positions[i3 + 1] = positions[i3 + 2] = 0;
      const color = new THREE.Color(planetObj.data.trailColor);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      sizes[i] = 0.05;
    }

    trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    trailGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    trailGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const trailMaterial = new THREE.PointsMaterial({
      size: 0.08,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });

    const trail = new THREE.Points(trailGeometry, trailMaterial);
    this.scene.add(trail);
    planetObj.trailObject = trail;
  }

  createPlanetLabel(planetObj) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(planetObj.data.name, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.01
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(20, 5, 1);
    sprite.position.set(0, planetObj.data.radius * 1.5, 0);
    planetObj.group.add(sprite);
    planetObj.label = sprite;
  }

  createOrbitLine(planetObj) {
    const data = planetObj.data;
    const segments = 128;
    const points = [];

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const a = data.distance;
      const e = data.eccentricity;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      const y = z * Math.sin(data.inclination * Math.PI / 180);
      points.push(new THREE.Vector3(x, y, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: data.trailColor,
      transparent: true,
      opacity: 0.18
    });

    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    this.scene.add(orbitLine);
    planetObj.orbitLine = orbitLine;
  }

  createAsteroidBelt() {
    const asteroidCount = 1000;
    const asteroidGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(asteroidCount * 3);
    const sizes = new Float32Array(asteroidCount);

    for (let i = 0; i < asteroidCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = (2.1 + Math.random() * 1.3) * 30;
      const inclination = (Math.random() - 0.5) * 0.2;
      const eccentricity = Math.random() * 0.1;
      const semiMajorAxis = radius * (1 - eccentricity * eccentricity) / (1 + eccentricity * Math.cos(angle));
      positions[i3] = semiMajorAxis * Math.cos(angle);
      positions[i3 + 1] = semiMajorAxis * Math.sin(angle) * Math.sin(inclination);
      positions[i3 + 2] = semiMajorAxis * Math.sin(angle) * Math.cos(inclination);
      sizes[i] = Math.random() * 0.3 + 0.1;
    }

    asteroidGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    asteroidGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const asteroidMaterial = new THREE.PointsMaterial({
      color: 0x999999,
      size: 0.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8
    });

    this.asteroidBelt = new THREE.Points(asteroidGeometry, asteroidMaterial);
    this.scene.add(this.asteroidBelt);
  }

  setupControls() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.isMouseDown = true;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      document.body.style.cursor = 'grabbing';
    });
    document.addEventListener('mouseup', () => {
      this.isMouseDown = false;
      document.body.style.cursor = 'default';
      this.updateUI();
    });
    document.addEventListener('mousemove', (e) => {
      if (!this.isMouseDown) return;
      const deltaX = e.clientX - this.mouseX;
      const deltaY = e.clientY - this.mouseY;
      if (deltaX !== 0 || deltaY !== 0) {
        this.controls.cameraAutoRotate = false;
        this.cameraAngle += deltaX * 0.002;
        this.cameraVerticalAngle = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraVerticalAngle - deltaY * 0.02));
        this.updateUI();
      }
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraDistance = Math.max(0.1, this.cameraDistance + e.deltaY * 0.1);
      this.updateUI();
    });
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (e.touches.length === 1) {
        this.isMouseDown = true;
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      }
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.isMouseDown && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.mouseX;
        const deltaY = e.touches[0].clientY - this.mouseY;
        if (deltaX !== 0 || deltaY !== 0) {
          this.controls.cameraAutoRotate = false;
          this.cameraAngle += deltaX * 0.002;
          this.cameraVerticalAngle = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraVerticalAngle - deltaY * 0.002));
          this.updateUI();
        }
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
      }
    });
    this.canvas.addEventListener('touchend', () => {
      this.isMouseDown = false;
      this.updateUI();
    });
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          this.togglePause();
          this.updateUI();
          break;
        case 'r': case 'R':
          this.resetCamera();
          this.controls.focusedPlanet = null;
          this.updateUI();
          break;
        case 't': case 'T':
          this.toggleTrails();
          this.updateUI();
          break;
        case 'l': case 'L':
          this.toggleLabels();
          this.updateUI();
          break;
        case 'o': case 'O':
          this.toggleOrbits();
          this.updateUI();
          break;
        case 'a': case 'A':
          this.controls.cameraAutoRotate = !this.controls.cameraAutoRotate;
          this.updateUI();
          break;
        case '1': case '2': case '3': case '4': case '5': case '6': case '7': case '8': case '9':
          const index = parseInt(e.key) - 1;
          if (index < this.planets.length) {
            this.controls.focusedPlanet = this.planets[index];
            this.updateUI();
          }
          break;
      }
    });
  }

  updateCamera() {
    if (this.controls.focusedPlanet) {
      const planetPos = this.controls.focusedPlanet.group.position;
      this.cameraTarget.copy(planetPos);
      const distance = this.cameraDistance * 0.1;
      const x = planetPos.x + distance * Math.cos(this.cameraAngle);
      const z = planetPos.z + distance * Math.sin(this.cameraAngle);
      const y = planetPos.y + distance * 0.3;
      this.camera.position.set(x, y, z);
      this.camera.lookAt(planetPos);
    } else {
      if (!this.controls.isPaused && this.controls.cameraAutoRotate) {
        this.cameraAngle += 0.0001 * this.controls.timeScale * this.controls.rotationSpeed;
      }
      const x = this.cameraDistance * Math.sin(this.cameraVerticalAngle) * Math.cos(this.cameraAngle);
      const y = this.cameraDistance * Math.cos(this.cameraVerticalAngle);
      const z = this.cameraDistance * Math.sin(this.cameraVerticalAngle) * Math.sin(this.cameraAngle);
      this.camera.position.set(x, y, z);
      this.camera.lookAt(this.cameraTarget);
    }
    console.log('Camera position:', this.camera.position, 'Camera angle:', this.cameraAngle, 'Vertical angle:', this.cameraVerticalAngle * 180 / Math.PI, 'degrees', 'Auto-rotate:', this.controls.cameraAutoRotate);
  }

  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    if (!this.controls.isPaused) {
      this.time += deltaTime * this.controls.timeScale * this.controls.rotationSpeed;
      this.updatePlanets();
      this.updateSun();
      this.updateAsteroidBelt();
      this.updateDynamicStarField();
    }
    this.updateCamera();
    this.renderer.render(this.scene, this.camera);
    console.log('Animation frame, deltaTime:', deltaTime, 'time:', this.time);
  }

  updatePlanets() {
    this.planets.forEach(planetObj => {
      const { data, group, planet } = planetObj;

      planetObj.angle += planetObj.orbitSpeed * this.controls.timeScale * this.controls.rotationSpeed;

      const a = data.distance;
      const e = data.eccentricity;
      const theta = planetObj.angle;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      const y = z * Math.sin(data.inclination * Math.PI / 180);
      group.position.set(x, y, z);

      planet.rotation.y += planetObj.rotationSpeed * this.controls.timeScale * this.controls.rotationSpeed;

      console.log(`Planet ${data.name} position:`, group.position, 'rotation.y:', planet.rotation.y);

      if (this.controls.showTrails && planetObj.trailObject) {
        const trailLength = 2000;
        planetObj.trail.push(group.position.clone());
        if (planetObj.trail.length > trailLength) {
          planetObj.trail.shift();
        }
        const positions = planetObj.trailObject.geometry.attributes.position.array;
        const colors = planetObj.trailObject.geometry.attributes.color.array;
        for (let i = 0; i < planetObj.trail.length; i++) {
          const i3 = i * 3;
          positions[i3] = planetObj.trail[i].x;
          positions[i3 + 1] = planetObj.trail[i].y;
          positions[i3 + 2] = planetObj.trail[i].z;
          const color = new THREE.Color(planetObj.data.trailColor);
          const opacity = i / trailLength;
          colors[i3] = color.r * opacity;
          colors[i3 + 1] = color.g * opacity;
          colors[i3 + 2] = color.b * opacity;
        }
        planetObj.trailObject.geometry.attributes.position.needsUpdate = true;
        planetObj.trailObject.geometry.attributes.color.needsUpdate = true;
      }

      if (this.controls.showLabels && planetObj.label) {
        planetObj.label.lookAt(this.camera.position);
      }

      if (data.hasMoon && group.moonGroup) {
        const moonAngle = this.time * 0.01;
        group.moonGroup.position.set(0.3844 * 10 * Math.cos(moonAngle), 0, 0.3844 * 10 * Math.sin(moonAngle));
        group.moonGroup.rotation.y += 0.01;
        if (group.moonGroup.children[0] && group.moonGroup.children[0].isSprite) {
          group.moonGroup.children[0].lookAt(this.camera.position);
        }
      }

      if (data.hasRings && group.rings) {
        group.rings.rotation.z += 0.001 * this.controls.timeScale * this.controls.rotationSpeed;
      }

      if (data.hasClouds && group.clouds) {
        group.clouds.rotation.y += 0.002 * this.controls.timeScale * this.controls.rotationSpeed;
      }
    });
  }

  updateSun() {
    this.sun.rotation.y += 0.002 * this.controls.timeScale * this.controls.rotationSpeed;
    const pulse = 1 + Math.sin(this.time * 0.001) * 0.03;
    this.sun.scale.setScalar(pulse);
    if (this.sunLight) {
      this.sunLight.intensity = 3.5 + Math.sin(this.time * 0.001) * 0.3;
    }
  }

  updateAsteroidBelt() {
    if (this.asteroidBelt) {
      this.asteroidBelt.rotation.y += 0.0005 * this.controls.timeScale * this.controls.rotationSpeed;
    }
  }

  togglePause() {
    this.controls.isPaused = !this.controls.isPaused;
    this.updateUI();
  }

  resetCamera() {
    this.cameraDistance = 600;
    this.cameraAngle = Math.PI / 2; // Reset to initial angle
    this.cameraVerticalAngle = Math.PI / 3; // Reset to initial vertical angle
    this.cameraTarget.set(0, 0, 0);
    this.controls.focusedPlanet = null;
    this.controls.cameraAutoRotate = true;
    this.updateUI();
  }

  toggleTrails() {
    this.controls.showTrails = !this.controls.showTrails;
    if (this.controls.showTrails) {
      this.planets.forEach(planet => this.createPlanetTrail(planet));
    } else {
      this.planets.forEach(planet => {
        if (planet.trailObject) {
          this.scene.remove(planet.trailObject);
          planet.trailObject.geometry.dispose();
          planet.trailObject.material.dispose();
          planet.trailObject = null;
          planet.trail = [];
        }
      });
    }
    this.updateUI();
  }

  toggleLabels() {
    this.controls.showLabels = !this.controls.showLabels;
    this.planets.forEach(planet => {
      if (this.controls.showLabels && !planet.label) {
        this.createPlanetLabel(planet);
        if (planet.data.hasMoon && planet.group.moonGroup && !planet.group.moonGroup.children[0].isSprite) {
          this.createPlanetLabel({ group: planet.group.moonGroup, data: { name: 'Moon' } });
        }
      } else if (!this.controls.showLabels && planet.label) {
        planet.group.remove(planet.label);
        planet.label.material.map.dispose();
        planet.label.material.dispose();
        planet.label = null;
        if (planet.data.hasMoon && planet.group.moonGroup && planet.group.moonGroup.children[0].isSprite) {
          const moonLabel = planet.group.moonGroup.children[0];
          planet.group.moonGroup.remove(moonLabel);
          moonLabel.material.map.dispose();
          moonLabel.material.dispose();
        }
      }
    });
    this.updateUI();
  }

  toggleOrbits() {
    this.controls.showOrbits = !this.controls.showOrbits;
    this.planets.forEach(planet => {
      if (this.controls.showOrbits && !planet.orbitLine) {
        this.createOrbitLine(planet);
      } else if (!this.controls.showOrbits && planet.orbitLine) {
        this.scene.remove(planet.orbitLine);
        planet.orbitLine.geometry.dispose();
        planet.orbitLine.material.dispose();
        planet.orbitLine = null;
      }
    });
    this.constellationLines.forEach(line => {
      line.visible = this.controls.showOrbits;
    });
    this.updateUI();
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.renderer) this.renderer.dispose();
    if (this.uiElement) document.body.removeChild(this.uiElement);
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) object.material.forEach(material => material.dispose());
        else if (object.material.map) object.material.map.dispose();
        object.material.dispose();
      }
    });
    if (this.starGroup) this.scene.remove(this.starGroup);
    this.starGroup = null;
    this.catalogStars = null;
    this.stars = null;
    this.constellationLines = [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('🌍 DOM loaded, starting solar system initialization...');
  setTimeout(() => {
    try {
      const solarSystem = new SolarSystem();
      if (!solarSystem.canvas) {
        console.error('❌ Solar system initialization failed - no canvas');
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) loadingScreen.classList.add('hidden');
      }
    } catch (error) {
      console.error('❌ Critical error during solar system initialization:', error);
      const loadingScreen = document.getElementById('loadingScreen');
      if (loadingScreen) loadingScreen.classList.add('hidden');
    }
  }, 100);
});
