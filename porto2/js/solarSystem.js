// Solar System Implementation in Three.js

// Configuration and constants
const SCALE_FACTOR = 0.00000001; // Scale down the universe to fit in screen
const ORBIT_SCALE = 0.0000001;
const TIME_SCALE = 0.1; // Increase to speed up animations

// Astronomical data for celestial bodies
const celestialBodies = {
    sun: {
        radius: 696340 * SCALE_FACTOR,
        texture: 'textures/sun.jpg',
        emissive: true,
        rotationPeriod: 24.47, // days
        info: "The Sun is the star at the center of our Solar System, a nearly perfect sphere of hot plasma."
    },
    mercury: {
        radius: 2440 * SCALE_FACTOR,
        texture: 'textures/mercury.jpg',
        orbitRadius: 57.9e6 * ORBIT_SCALE,
        orbitPeriod: 88, // days
        rotationPeriod: 58.6, // days
        info: "Mercury is the smallest and innermost planet in the Solar System."
    },
    venus: {
        radius: 6052 * SCALE_FACTOR,
        texture: 'textures/venus.jpg',
        orbitRadius: 108.2e6 * ORBIT_SCALE,
        orbitPeriod: 225, // days
        rotationPeriod: -243, // days (retrograde)
        info: "Venus is the second planet from the Sun and the hottest planet in our solar system."
    },
    earth: {
        radius: 6371 * SCALE_FACTOR,
        texture: 'textures/earth.jpg',
        bumpMap: 'textures/earth_bump.jpg',
        specularMap: 'textures/earth_specular.jpg',
        orbitRadius: 149.6e6 * ORBIT_SCALE,
        orbitPeriod: 365.25, // days
        rotationPeriod: 1, // days
        moons: [{
            name: 'moon',
            radius: 1737 * SCALE_FACTOR,
            texture: 'textures/moon.jpg',
            orbitRadius: 384400 * ORBIT_SCALE * 5,
            orbitPeriod: 27.3, // days
            rotationPeriod: 27.3, // days (tidally locked)
            info: "The Moon is Earth's only natural satellite."
        }],
        info: "Earth is the third planet from the Sun and the only astronomical object known to harbor life."
    },
    mars: {
        radius: 3390 * SCALE_FACTOR,
        texture: 'textures/mars.jpg',
        orbitRadius: 227.9e6 * ORBIT_SCALE,
        orbitPeriod: 687, // days
        rotationPeriod: 1.03, // days
        moons: [
            {
                name: 'phobos',
                radius: 11 * SCALE_FACTOR * 10,
                texture: 'textures/phobos.jpg',
                orbitRadius: 9376 * ORBIT_SCALE * 5,
                orbitPeriod: 0.32, // days
                info: "Phobos is the innermost and larger of the two natural satellites of Mars."
            },
            {
                name: 'deimos',
                radius: 6 * SCALE_FACTOR * 10,
                texture: 'textures/deimos.jpg',
                orbitRadius: 23463 * ORBIT_SCALE * 5,
                orbitPeriod: 1.26, // days
                info: "Deimos is the smaller and outermost of the two natural satellites of Mars."
            }
        ],
        info: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System."
    },
    jupiter: {
        radius: 69911 * SCALE_FACTOR,
        texture: 'textures/jupiter.jpg',
        orbitRadius: 778.5e6 * ORBIT_SCALE,
        orbitPeriod: 4332, // days
        rotationPeriod: 0.41, // days
        moons: [
            {
                name: 'io',
                radius: 1822 * SCALE_FACTOR * 3,
                texture: 'textures/io.jpg',
                orbitRadius: 421700 * ORBIT_SCALE * 2,
                orbitPeriod: 1.77, // days
                info: "Io is the innermost of the four Galilean moons of Jupiter and is known for its volcanic activity."
            },
            {
                name: 'europa',
                radius: 1561 * SCALE_FACTOR * 3,
                texture: 'textures/europa.jpg',
                orbitRadius: 670900 * ORBIT_SCALE * 2,
                orbitPeriod: 3.55, // days
                info: "Europa is the smallest of the four Galilean moons and is believed to have an ocean beneath its icy surface."
            },
            {
                name: 'ganymede',
                radius: 2634 * SCALE_FACTOR * 3,
                texture: 'textures/ganymede.jpg',
                orbitRadius: 1070400 * ORBIT_SCALE * 2,
                orbitPeriod: 7.15, // days
                info: "Ganymede is the largest moon of Jupiter and in the Solar System."
            },
            {
                name: 'callisto',
                radius: 2410 * SCALE_FACTOR * 3,
                texture: 'textures/callisto.jpg',
                orbitRadius: 1882700 * ORBIT_SCALE * 2,
                orbitPeriod: 16.69, // days
                info: "Callisto is the second-largest moon of Jupiter and has the oldest surface of any object in the Solar System."
            }
        ],
        info: "Jupiter is the fifth planet from the Sun and the largest in the Solar System."
    },
    saturn: {
        radius: 58232 * SCALE_FACTOR,
        texture: 'textures/saturn.jpg',
        orbitRadius: 1434e6 * ORBIT_SCALE,
        orbitPeriod: 10759, // days
        rotationPeriod: 0.44, // days
        ring: {
            innerRadius: 70000 * SCALE_FACTOR,
            outerRadius: 140000 * SCALE_FACTOR,
            texture: 'textures/saturn_ring.png'
        },
        moons: [
            {
                name: 'titan',
                radius: 2575 * SCALE_FACTOR * 3,
                texture: 'textures/titan.jpg',
                orbitRadius: 1221870 * ORBIT_SCALE * 2,
                orbitPeriod: 15.95, // days
                info: "Titan is Saturn's largest moon and the second-largest natural satellite in the Solar System."
            },
            {
                name: 'enceladus',
                radius: 252 * SCALE_FACTOR * 5,
                texture: 'textures/enceladus.jpg',
                orbitRadius: 238020 * ORBIT_SCALE * 2,
                orbitPeriod: 1.37, // days
                info: "Enceladus is the sixth-largest moon of Saturn known for its active geysers."
            }
        ],
        info: "Saturn is the sixth planet from the Sun and is known for its extensive ring system."
    },
    uranus: {
        radius: 25362 * SCALE_FACTOR,
        texture: 'textures/uranus.jpg',
        orbitRadius: 2871e6 * ORBIT_SCALE,
        orbitPeriod: 30688, // days
        rotationPeriod: -0.72, // days (retrograde)
        tilt: 97.8, // degrees - Uranus has an extreme axial tilt
        moons: [
            {
                name: 'titania',
                radius: 788 * SCALE_FACTOR * 5,
                texture: 'textures/titania.jpg',
                orbitRadius: 435910 * ORBIT_SCALE * 2,
                orbitPeriod: 8.71, // days
                info: "Titania is the largest moon of Uranus and the eighth largest moon in the Solar System."
            }
        ],
        info: "Uranus is the seventh planet from the Sun and has the third-largest planetary radius in the Solar System."
    },
    neptune: {
        radius: 24622 * SCALE_FACTOR,
        texture: 'textures/neptune.jpg',
        orbitRadius: 4495e6 * ORBIT_SCALE,
        orbitPeriod: 60195, // days
        rotationPeriod: 0.67, // days
        moons: [
            {
                name: 'triton',
                radius: 1353 * SCALE_FACTOR * 5,
                texture: 'textures/triton.jpg',
                orbitRadius: 354759 * ORBIT_SCALE * 2,
                orbitPeriod: 5.88, // retrograde
                info: "Triton is the largest natural satellite of Neptune and the only large moon in the Solar System with a retrograde orbit."
            }
        ],
        info: "Neptune is the eighth and farthest known Solar planet from the Sun and has the strongest winds of any planet in the Solar System."
    }
};

// Constellation data
const constellations = [
    {
        name: "Orion",
        stars: [
            // Star positions in normalized coordinates
            [0.2, 0.5, -0.8], [0.25, 0.45, -0.8], [0.3, 0.55, -0.8], [0.15, 0.6, -0.8],
            [0.1, 0.65, -0.8], [0.2, 0.7, -0.8], [0.3, 0.7, -0.8]
        ],
        lines: [
            // Lines connecting stars
            [0, 1], [1, 2], [0, 3], [3, 4], [3, 5], [3, 6]
        ],
        position: [0, 0, -0.9],
        labelPosition: [0.23, 0.55, -0.85]
    },
    {
        name: "Ursa Major",
        stars: [
            [-0.6, 0.6, -0.7], [-0.5, 0.65, -0.7], [-0.4, 0.7, -0.7], [-0.3, 0.65, -0.7],
            [-0.3, 0.55, -0.7], [-0.4, 0.5, -0.7], [-0.5, 0.55, -0.7]
        ],
        lines: [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]
        ],
        position: [0, 0, -0.8],
        labelPosition: [-0.45, 0.6, -0.75]
    },
    {
        name: "Cassiopeia",
        stars: [
            [0.5, 0.7, -0.7], [0.6, 0.75, -0.7], [0.7, 0.7, -0.7], [0.8, 0.75, -0.7], [0.9, 0.7, -0.7]
        ],
        lines: [
            [0, 1], [1, 2], [2, 3], [3, 4]
        ],
        position: [0, 0, -0.8],
        labelPosition: [0.7, 0.8, -0.75]
    }
];

// Main Application
let scene, camera, renderer, composer, controls;
let sun, planets = {}, objectClickables = [];
let infoPanel, showingInfo = false;
let starField, asteroidBelt, kuiperBelt;
let orbitLines = [], labels = [], constellationGroup;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let clock = new THREE.Clock();
let loadingManager, textureLoader;
let showOrbits = true, showLabels = true;

// Initialize the 3D environment
function init() {
    setupLoadingManager();
    setupScene();
    setupLights();
    createSkybox();
    createStarfield();
    createCelestialBodies();
    createAsteroidBelt();
    createKuiperBelt();
    createConstellations();
    setupEventListeners();
    
    animate();
}

// Setup loading manager with progress tracking
function setupLoadingManager() {
    const progressBar = document.getElementById('progress');
    const loadingStatus = document.getElementById('loading-status');
    const loadingScreen = document.getElementById('loading-screen');
    
    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(url, loaded, total) {
        const progress = (loaded / total) * 100;
        progressBar.style.width = `${progress}%`;
        loadingStatus.textContent = `Loading: ${url.split('/').pop()}`;
    };
    
    loadingManager.onLoad = function() {
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    };
    
    textureLoader = new THREE.TextureLoader(loadingManager);
}

// Setup three.js scene, camera, renderer
function setupScene() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100000);
    camera.position.set(0, 100, 300);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 3000;
    
    // Setup post-processing for bloom effect
    setupPostProcessing();
    
    // Setup info panel
    infoPanel = document.getElementById('info-panel');
}

// Setup post-processing effects
function setupPostProcessing() {
    const renderScene = new THREE.RenderPass(scene, camera);
    
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,    // strength
        0.4,    // radius
        0.85    // threshold
    );
    
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
}

// Add lights to the scene
function setupLights() {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);
}

// Create the skybox
function createSkybox() {
    const skyboxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
    const skyboxMaterials = [];
    
    const skyboxTextures = [
        'textures/skybox/right.jpg',  // right
        'textures/skybox/left.jpg',   // left
        'textures/skybox/top.jpg',    // top
        'textures/skybox/bottom.jpg', // bottom
        'textures/skybox/front.jpg',  // front
        'textures/skybox/back.jpg'    // back
    ];
    
    for (let i = 0; i < 6; i++) {
        const texture = textureLoader.load(skyboxTextures[i]);
        skyboxMaterials.push(new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide
        }));
    }
    
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
    scene.add(skybox);
}

// Create a dynamic starfield
function createStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 10000;
    
    const positions = new Float32Array(starsCount * 3);
    const sizes = new Float32Array(starsCount);
    const colors = new Float32Array(starsCount * 3);
    
    for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        // Random positions within a sphere
        const radius = 5000;
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Random star sizes
        sizes[i] = 2 * Math.random() + 0.5;
        
        // Star colors (mostly white, some blue, red, yellow)
        const colorChoice = Math.random();
        if (colorChoice < 0.7) {
            // White
            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 1.0;
        } else if (colorChoice < 0.8) {
            // Blue
            colors[i3] = 0.5;
            colors[i3 + 1] = 0.7;
            colors[i3 + 2] = 1.0;
        } else if (colorChoice < 0.9) {
            // Yellow
            colors[i3] = 1.0;
            colors[i3 + 1] = 1.0;
            colors[i3 + 2] = 0.7;
        } else {
            // Red
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.3;
            colors[i3 + 2] = 0.3;
        }
    }
    
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const starsMaterial = new THREE.PointsMaterial({
        size: 2,
        vertexColors: true,
        transparent: true
    });
    
    starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);
}

// Create the sun, planets and their moons
function createCelestialBodies() {
    // Create the sun
    const sunGeometry = new THREE.SphereGeometry(celestialBodies.sun.radius, 64, 64);
    const sunTexture = textureLoader.load(celestialBodies.sun.texture);
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: sunTexture,
        emissive: new THREE.Color(0xffff00),
        emissiveIntensity: 1.0
    });
    
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.name = 'sun';
    sun.userData = { info: celestialBodies.sun.info };
    scene.add(sun);
    
    // Add point light at the sun's position
    const sunLight = new THREE.PointLight(0xffffff, 1.7, 0, 2);
    sun.add(sunLight);
    
    // Add lens flare effect for the sun
    addLensFlare(sun.position);
    
    // Create text label for the sun
    createLabel("Sun", sun, 1.3);
    
    // Make sun clickable for info
    objectClickables.push(sun);
    
    // Create planets
    for (const planetName in celestialBodies) {
        if (planetName === 'sun') continue; // Skip sun as it's already created
        
        createPlanet(planetName);
    }
}

// Create an individual planet with its moons and orbit
function createPlanet(planetName) {
    const planetData = celestialBodies[planetName];
    
    // Create orbit line
    const orbitGeometry = new THREE.RingGeometry(
        planetData.orbitRadius, 
        planetData.orbitRadius + 0.1, 
        128
    );
    const orbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x444444, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
    });
    const orbitLine = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbitLine.rotation.x = Math.PI / 2;
    scene.add(orbitLine);
    orbitLines.push(orbitLine);
    
    // Create planet
    const planetGeometry = new THREE.SphereGeometry(
        planetData.radius, 
        32, 
        32
    );
    
    const planetTexture = textureLoader.load(planetData.texture);
    const planetMaterialOptions = {
        map: planetTexture,
        roughness: 1.0
    };
    
    // Add normal/bump map if available
    if (planetData.bumpMap) {
        planetMaterialOptions.bumpMap = textureLoader.load(planetData.bumpMap);
        planetMaterialOptions.bumpScale = 0.1;
    }
    
    // Add specular map if available
    if (planetData.specularMap) {
        planetMaterialOptions.specularMap = textureLoader.load(planetData.specularMap);
    }
    
    const planetMaterial = new THREE.MeshStandardMaterial(planetMaterialOptions);
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    
    // Create planet group to handle orbit
    const planetGroup = new THREE.Group();
    scene.add(planetGroup);
    planetGroup.add(planet);
    
    // Position planet on its orbit
    planet.position.x = planetData.orbitRadius;
    
    // Apply tilt if specified
    if (planetData.tilt) {
        planet.rotation.z = THREE.MathUtils.degToRad(planetData.tilt);
    }
    
    // Store planet data
    planet.name = planetName;
    planet.userData = { 
        info: planetData.info,
        orbitRadius: planetData.orbitRadius,
        orbitPeriod: planetData.orbitPeriod,
        rotationPeriod: planetData.rotationPeriod
    };
    planets[planetName] = {
        object: planet,
        group: planetGroup
    };
    
    // Create text label for the planet
    createLabel(planetName.charAt(0).toUpperCase() + planetName.slice(1), planet, 1.5);
    
    // Make planet clickable for info
    objectClickables.push(planet);
    
    // Add rings for planets that have them (e.g., Saturn)
    if (planetData.ring) {
        addRings(planet, planetData.ring);
    }
    
    // Add moons if the planet has any
    if (planetData.moons) {
        planetData.moons.forEach(moonData => {
            createMoon(planet, moonData);
        });
    }
}

// Create a moon orbiting around a planet
function createMoon(planet, moonData) {
    // Create moon orbit
    const moonOrbitGeometry = new THREE.RingGeometry(
        moonData.orbitRadius, 
        moonData.orbitRadius + 0.1, 
        64
    );
    const moonOrbitMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x444444, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
    });
    const moonOrbit = new THREE.Mesh(moonOrbitGeometry, moonOrbitMaterial);
    moonOrbit.rotation.x = Math.PI / 2;
    planet.add(moonOrbit);
    orbitLines.push(moonOrbit);
    
    // Create moon
    const moonGeometry = new THREE.SphereGeometry(moonData.radius, 16, 16);
    const moonTexture = textureLoader.load(moonData.texture);
    const moonMaterial = new THREE.MeshStandardMaterial({
        map: moonTexture,
        roughness: 1.0
    });
    
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    
    // Create moon group for orbit
    const moonGroup = new THREE.Group();
    planet.add(moonGroup);
    moonGroup.add(moon);
    
    // Position moon on its orbit
    moon.position.x = moonData.orbitRadius;
    
    // Store moon data
    moon.name = moonData.name;
    moon.userData = {
        info: moonData.info,
        orbitRadius: moonData.orbitRadius,
        orbitPeriod: moonData.orbitPeriod,
        rotationPeriod: moonData.rotationPeriod || moonData.orbitPeriod // If not specified, assume tidally locked
    };
    
    // Create text label for the moon
    createLabel(moonData.name.charAt(0).toUpperCase() + moonData.name.slice(1), moon, 1.5);
    
    // Make moon clickable for info
    objectClickables.push(moon);
}

// Add rings to a planet (e.g., Saturn)
function addRings(planet, ringData) {
    const ringGeometry = new THREE.RingGeometry(
        ringData.innerRadius,
        ringData.outerRadius,
        64
    );
    
    const ringTexture = textureLoader.load(ringData.texture);
    const ringMaterial = new THREE.MeshBasicMaterial({
        map: ringTexture,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    planet.add(ring);
}

// Create the asteroid belt between Mars and Jupiter
function createAsteroidBelt() {
    const asteroidCount = 2000;
    const minRadius = (celestialBodies.mars.orbitRadius + celestialBodies.jupiter.orbitRadius) / 2.5;
    const maxRadius = (celestialBodies.mars.orbitRadius + celestialBodies.jupiter.orbitRadius) / 1.8;
    const asteroidMinSize = 0.02;
    const asteroidMaxSize = 0.2;
    
    const asteroidGroup = new THREE.Group();
    scene.add(asteroidGroup);
    
    // Create a few different geometries for variety
    const geometries = [
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.TetrahedronGeometry(1, 0),
        new THREE.OctahedronGeometry(1, 0)
    ];
    
    // Create a few different textures/materials for variety
    const materials = [
        new THREE.MeshStandardMaterial({ 
            color: 0x888888, 
            roughness: 1.0 
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0x777777, 
            roughness: 0.9 
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0x999999, 
            roughness: 1.0 
        })
    ];
    
    for (let i = 0; i < asteroidCount; i++) {
        // Random angle, distance, and elevation for asteroid position
        const angle = Math.random() * Math.PI * 2;
        const distance = minRadius + Math.random() * (maxRadius - minRadius);
        const elevation = (Math.random() - 0.5) * (maxRadius - minRadius) * 0.1;
        
        // Random scale
        const scale = asteroidMinSize + Math.random() * (asteroidMaxSize - asteroidMinSize);
        
        // Create asteroid with random geometry and material
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = materials[Math.floor(Math.random() * materials.length)];
        
        const asteroid = new THREE.Mesh(geometry, material);
        
        // Position the asteroid
        asteroid.position.x = Math.cos(angle) * distance;
        asteroid.position.z = Math.sin(angle) * distance;
        asteroid.position.y = elevation;
        
        // Scale and rotate randomly
        asteroid.scale.set(scale, scale, scale);
        asteroid.rotation.x = Math.random() * Math.PI * 2;
        asteroid.rotation.y = Math.random() * Math.PI * 2;
        asteroid.rotation.z = Math.random() * Math.PI * 2;
        
        // Store orbital data for animation
        asteroid.userData = {
            orbitAngle: angle,
            orbitRadius: distance,
            orbitSpeed: 0.005 / (distance / minRadius) * (Math.random() * 0.5 + 0.75),
            rotationSpeed: (Math.random() - 0.5) * 0.05
        };
        
        asteroidGroup.add(asteroid);
    }
    
    asteroidBelt = asteroidGroup;
    
    // Create asteroid belt label
    const asteroidBeltLabel = document.createElement('div');
    asteroidBeltLabel.className = 'constellation-label';
    asteroidBeltLabel.textContent = 'Asteroid Belt';
    
    const asteroidBeltObject = new THREE.Object3D();
    asteroidBeltObject.position.set((minRadius + maxRadius) / 2, 0, 0);
    scene.add(asteroidBeltObject);
    
    const asteroidLabelSprite = new THREE.CSS2DObject(asteroidBeltLabel);
    asteroidLabelSprite.position.set(0, 20, 0);
    asteroidBeltObject.add(asteroidLabelSprite);
    labels.push(asteroidLabelSprite);
}

// Create Kuiper belt objects beyond Neptune
function createKuiperBelt() {
    const kuiperCount = 1000;
    const minRadius = celestialBodies.neptune.orbitRadius * 1.3;
    const maxRadius = celestialBodies.neptune.orbitRadius * 2;
    const minSize = 0.05;
    const maxSize = 0.3;
    
    const kuiperGroup = new THREE.Group();
    scene.add(kuiperGroup);
    
    const geometries = [
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.SphereGeometry(1, 8, 8)
    ];
    
    const materials = [
        new THREE.MeshStandardMaterial({ 
            color: 0x666666, 
            roughness: 1.0 
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0x555555, 
            roughness: 1.0 
        }),
        new THREE.MeshStandardMaterial({ 
            color: 0x777777, 
            roughness: 0.9 
        })
    ];
    
    for (let i = 0; i < kuiperCount; i++) {
        // Random position in a thick disk/torus shape
        const angle = Math.random() * Math.PI * 2;
        const distance = minRadius + Math.random() * (maxRadius - minRadius);
        const elevation = (Math.random() - 0.5) * (maxRadius - minRadius) * 0.2;
        
        // Random scale
        const scale = minSize + Math.random() * (maxSize - minSize);
        
        // Create KBO with random geometry and material
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = materials[Math.floor(Math.random() * materials.length)];
        
        const kbo = new THREE.Mesh(geometry, material);
        
        // Position the KBO
        kbo.position.x = Math.cos(angle) * distance;
        kbo.position.z = Math.sin(angle) * distance;
        kbo.position.y = elevation;
        
        // Scale and rotate
        kbo.scale.set(scale, scale, scale);
        kbo.rotation.x = Math.random() * Math.PI * 2;
        kbo.rotation.y = Math.random() * Math.PI * 2;
        kbo.rotation.z = Math.random() * Math.PI * 2;
        
        // Store orbital data for animation
        kbo.userData = {
            orbitAngle: angle,
            orbitRadius: distance,
            orbitSpeed: 0.001 / (distance / minRadius) * (Math.random() * 0.5 + 0.75),
            rotationSpeed: (Math.random() - 0.5) * 0.03
        };
        
        kuiperGroup.add(kbo);
    }
    
    kuiperBelt = kuiperGroup;
    
    // Create Kuiper belt label
    const kuiperBeltLabel = document.createElement('div');
    kuiperBeltLabel.className = 'constellation-label';
    kuiperBeltLabel.textContent = 'Kuiper Belt';
    
    const kuiperBeltObject = new THREE.Object3D();
    kuiperBeltObject.position.set((minRadius + maxRadius) / 2, 0, 0);
    scene.add(kuiperBeltObject);
    
    const kuiperLabelSprite = new THREE.CSS2DObject(kuiperBeltLabel);
    kuiperLabelSprite.position.set(0, 40, 0);
    kuiperBeltObject.add(kuiperLabelSprite);
    labels.push(kuiperLabelSprite);
}

// Create constellations on the skybox
function createConstellations() {
    constellationGroup = new THREE.Group();
    scene.add(constellationGroup);
    
    constellations.forEach(constellation => {
        // Create stars
        const starsGroup = new THREE.Group();
        const starGeometry = new THREE.SphereGeometry(0.5, 8, 8);
        const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        
        // Scale and move constellation to position
        starsGroup.position.set(
            constellation.position[0] * 4000,
            constellation.position[1] * 4000,
            constellation.position[2] * 4000
        );
        
        // Create stars at the defined positions
        constellation.stars.forEach((starPos, index) => {
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.set(
                starPos[0] * 4000,
                starPos[1] * 4000,
                starPos[2] * 4000
            );
            starsGroup.add(star);
        });
        
        // Create lines connecting stars
        constellation.lines.forEach(line => {
            const start = constellation.stars[line[0]];
            const end = constellation.stars[line[1]];
            
            const lineMaterial = new THREE.LineBasicMaterial({ 
                color: 0x88aaff,
                transparent: true,
                opacity: 0.5
            });
            
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(start[0] * 4000, start[1] * 4000, start[2] * 4000),
                new THREE.Vector3(end[0] * 4000, end[1] * 4000, end[2] * 4000)
            ]);
            
            const line3D = new THREE.Line(lineGeometry, lineMaterial);
            starsGroup.add(line3D);
        });
        
        constellationGroup.add(starsGroup);
        
        // Add constellation label
        const constellationLabel = document.createElement('div');
        constellationLabel.className = 'constellation-label';
        constellationLabel.textContent = constellation.name;
        
        const labelPos = constellation.labelPosition;
        const labelObject = new THREE.Object3D();
        labelObject.position.set(
            labelPos[0] * 4000,
            labelPos[1] * 4000,
            labelPos[2] * 4000
        );
        constellationGroup.add(labelObject);
        
        const labelSprite = new THREE.CSS2DObject(constellationLabel);
        labelObject.add(labelSprite);
        labels.push(labelSprite);
    });
}

// Create a text label for a celestial body
function createLabel(text, parent, scale = 1) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'constellation-label';
    labelDiv.textContent = text;
    
    const labelObject = new THREE.CSS2DObject(labelDiv);
    labelObject.position.set(0, parent.geometry.parameters.radius * scale, 0);
    parent.add(labelObject);
    labels.push(labelObject);
}

// Add a lens flare effect to the sun
function addLensFlare(position) {
    // In real implementation, you'd need to create a lens flare effect
    // Here we'll use a simple sprite as a placeholder
    const textureFlare = textureLoader.load('textures/lensflare.png');
    const flareSpriteMaterial = new THREE.SpriteMaterial({
        map: textureFlare,
        color: 0xffffff,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    const flareSprite = new THREE.Sprite(flareSpriteMaterial);
    flareSprite.scale.set(30, 30, 1);
    flareSprite.position.copy(position);
    scene.add(flareSprite);
}

// Set up event listeners for user interaction
function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', onWindowResize);
    
    // Mouse click for object selection
    document.addEventListener('click', onDocumentClick);
    
    // UI controls
    document.getElementById('reset-camera').addEventListener('click', resetCamera);
    document.getElementById('toggle-orbits').addEventListener('change', function(e) {
        showOrbits = e.target.checked;
        orbitLines.forEach(orbit => {
            orbit.visible = showOrbits;
        });
    });
    
    document.getElementById('toggle-labels').addEventListener('change', function(e) {
        showLabels = e.target.checked;
        labels.forEach(label => {
            label.visible = showLabels;
        });
    });
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse clicks for object selection
function onDocumentClick(event) {
    // Get normalized mouse coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Cast ray to find intersecting objects
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objectClickables);
    
    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;
        focusOnObject(selectedObject);
        showInfo(selectedObject);
    } else {
        hideInfo();
    }
}

// Focus camera on selected object
function focusOnObject(object) {
    const targetPosition = new THREE.Vector3();
    object.getWorldPosition(targetPosition);
    
    // Animate camera movement
    const startPosition = camera.position.clone();
    const duration = 1000; // ms
    const startTime = Date.now();
    
    const zoomDistance = object.geometry.parameters.radius * 10;
    const endPosition = targetPosition.clone().add(
        new THREE.Vector3(zoomDistance, zoomDistance/2, zoomDistance)
    );
    
    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(startPosition, endPosition, easeProgress);
        controls.target.lerpVectors(
            controls.target, 
            targetPosition,
            easeProgress
        );
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        }
    }
    
    animateCamera();
}

// Reset camera to default position
function resetCamera() {
    const duration = 1000;
    const startTime = Date.now();
    const startPosition = camera.position.clone();
    const endPosition = new THREE.Vector3(0, 100, 300);
    const startTarget = controls.target.clone();
    const endTarget = new THREE.Vector3(0, 0, 0);
    
    function animateReset() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        camera.position.lerpVectors(startPosition, endPosition, easeProgress);
        controls.target.lerpVectors(startTarget, endTarget, easeProgress);
        controls.update();
        
        if (progress < 1) {
            requestAnimationFrame(animateReset);
        }
    }
    
    animateReset();
    hideInfo();
}

// Show information panel for selected object
function showInfo(object) {
    const name = object.name.charAt(0).toUpperCase() + object.name.slice(1);
    let infoHtml = `<h3>${name}</h3>`;
    
    if (object.userData.info) {
        infoHtml += `<p>${object.userData.info}</p>`;
    }
    
    if (object.userData.orbitPeriod) {
        infoHtml += `<p>Orbit Period: ${object.userData.orbitPeriod} Earth days</p>`;
    }
    
    if (object.userData.rotationPeriod) {
        const rotationPeriod = Math.abs(object.userData.rotationPeriod);
        const direction = object.userData.rotationPeriod < 0 ? ' (retrograde)' : '';
        infoHtml += `<p>Rotation Period: ${rotationPeriod} Earth days${direction}</p>`;
    }
    
    infoPanel.innerHTML = infoHtml;
    infoPanel.style.display = 'block';
    showingInfo = true;
}

// Hide information panel
function hideInfo() {
    if (showingInfo) {
        infoPanel.style.display = 'none';
        showingInfo = false;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta() * TIME_SCALE;
    
    // Animate planets
    for (const planetName in planets) {
        const planet = planets[planetName].object;
        const planetGroup = planets[planetName].group;
        const planetData = celestialBodies[planetName];
        
        // Planet rotation
        if (planetData.rotationPeriod) {
            // Convert rotation period to rotation speed in radians per frame
            const rotationSpeed = (2 * Math.PI / planetData.rotationPeriod) * deltaTime;
            planet.rotation.y += rotationSpeed;
        }
        
        // Planet orbit
        if (planetData.orbitPeriod) {
            // Convert orbit period to orbital speed in radians per frame
            const orbitSpeed = (2 * Math.PI / planetData.orbitPeriod) * deltaTime;
            planetGroup.rotation.y += orbitSpeed;
        }
        
        // Animate moons if present
        if (planetData.moons) {
            planet.children.forEach(child => {
                if (child instanceof THREE.Group) {
                    // This is a moon group
                    const moonObj = child.children[0];
                    if (moonObj && moonObj.userData.orbitPeriod) {
                        // Moon orbit
                        const moonOrbitSpeed = (2 * Math.PI / moonObj.userData.orbitPeriod) * deltaTime;
                        child.rotation.y += moonOrbitSpeed;
                        
                        // Moon rotation
                        if (moonObj.userData.rotationPeriod) {
                            const moonRotationSpeed = (2 * Math.PI / moonObj.userData.rotationPeriod) * deltaTime;
                            moonObj.rotation.y += moonRotationSpeed;
                        }
                    }
                }
            });
        }
    }
    
    // Animate the sun's rotation
    if (sun) {
        const sunRotationSpeed = (2 * Math.PI / celestialBodies.sun.rotationPeriod) * deltaTime;
        sun.rotation.y += sunRotationSpeed;
    }
    
    // Animate the asteroid belt
    if (asteroidBelt) {
        asteroidBelt.children.forEach(asteroid => {
            // Update the asteroid's orbital position
            asteroid.userData.orbitAngle += asteroid.userData.orbitSpeed * deltaTime;
            asteroid.position.x = Math.cos(asteroid.userData.orbitAngle) * asteroid.userData.orbitRadius;
            asteroid.position.z = Math.sin(asteroid.userData.orbitAngle) * asteroid.userData.orbitRadius;
            
            // Rotate the asteroid
            asteroid.rotation.x += asteroid.userData.rotationSpeed * deltaTime;
            asteroid.rotation.y += asteroid.userData.rotationSpeed * 0.7 * deltaTime;
        });
    }
    
    // Animate the Kuiper belt
    if (kuiperBelt) {
        kuiperBelt.children.forEach(kbo => {
            kbo.userData.orbitAngle += kbo.userData.orbitSpeed * deltaTime;
            kbo.position.x = Math.cos(kbo.userData.orbitAngle) * kbo.userData.orbitRadius;
            kbo.position.z = Math.sin(kbo.userData.orbitAngle) * kbo.userData.orbitRadius;
            kbo.rotation.x += kbo.userData.rotationSpeed * deltaTime;
            kbo.rotation.y += kbo.userData.rotationSpeed * 0.5 * deltaTime;
        });
    }
    
    // Star twinkling effect
    if (starField && starField.geometry.attributes.size) {
        const sizes = starField.geometry.attributes.size;
        for (let i = 0; i < sizes.count; i++) {
            const pulseFactor = Math.sin(i + Date.now() * 0.001) * 0.1 + 1.0;
            sizes.array[i] *= pulseFactor;
            sizes.array[i] = Math.max(0.5, Math.min(sizes.array[i], 3));
        }
        sizes.needsUpdate = true;
    }
    
    // Update controls
    controls.update();
    
    // Render scene with post-processing
    composer.render();
}

// Initialize the application when the window loads
window.onload = init;
