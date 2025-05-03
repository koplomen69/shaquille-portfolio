// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a4a70); // Deep blue underwater color
scene.fog = new THREE.FogExp2(0x0a4a70, 0.02);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 20);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxDistance = 50;

// Lighting
const ambientLight = new THREE.AmbientLight(0x6688cc, 0.5); // Soft blue ambient light
scene.add(ambientLight);

// Directional light for sun rays
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 50, 0);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// Point lights for local illumination
const pointLight1 = new THREE.PointLight(0x88ccff, 1, 30);
pointLight1.position.set(15, 10, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x8888ff, 1, 30);
pointLight2.position.set(-15, 10, -10);
scene.add(pointLight2);

// Ocean floor with caustics texture
const textureLoader = new THREE.TextureLoader();
let causticsTexture, sandTexture;

try {
    causticsTexture = textureLoader.load('textures/caustics.jpg', function() {
        causticsTexture.wrapS = THREE.RepeatWrapping;
        causticsTexture.wrapT = THREE.RepeatWrapping;
        console.log('Caustics texture loaded successfully');
    }, undefined, function(err) {
        console.error('Error loading caustics texture:', err);
    });
    
    sandTexture = textureLoader.load('textures/sand.jpg', function() {
        sandTexture.wrapS = THREE.RepeatWrapping;
        sandTexture.wrapT = THREE.RepeatWrapping;
        sandTexture.repeat.set(10, 10);
        console.log('Sand texture loaded successfully');
    }, undefined, function(err) {
        console.error('Error loading sand texture:', err);
    });
} catch(e) {
    console.error('Error in texture loading:', e);
    // Provide fallback colors if textures fail to load
    causticsTexture = null;
    sandTexture = null;
}

const floorGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xd9c2a5,
    map: sandTexture || null,
    roughness: 0.8,
    metalness: 0.2
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Water surface - Updated to use modern BufferGeometry
const waterGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
const waterMaterial = new THREE.MeshPhongMaterial({
    color: 0x55aaff,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
});
const waterSurface = new THREE.Mesh(waterGeometry, waterMaterial);
waterSurface.rotation.x = -Math.PI / 2;
waterSurface.position.y = 30;
scene.add(waterSurface);

// Get water vertices for animation - compatible with BufferGeometry
const waterPositions = waterGeometry.attributes.position;

// Create sun rays
function createSunRays() {
    const rayGroup = new THREE.Group();
    
    for (let i = 0; i < 20; i++) {
        const rayGeometry = new THREE.CylinderGeometry(0.1, 0.1, 60, 8);
        const rayMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2 + Math.random() * 0.1
        });
        
        const ray = new THREE.Mesh(rayGeometry, rayMaterial);
        ray.position.set(
            (Math.random() - 0.5) * 80,
            0,
            (Math.random() - 0.5) * 80
        );
        ray.scale.x = ray.scale.z = 0.1 + Math.random() * 0.3;
        rayGroup.add(ray);
    }
    
    rayGroup.position.y = 0;
    scene.add(rayGroup);
    return rayGroup;
}

const sunRays = createSunRays();

// Load coral and marine life models
const modelLoader = new THREE.GLTFLoader();
const models = {
    // Using basic geometric shapes for testing if models aren't available
    hardCoral: { path: 'models/hard_coral.glb', instances: 15, scale: 1.5, fallback: createCoralFallback },
    softCoral: { path: 'models/soft_coral.glb', instances: 15, scale: 1.5, fallback: createCoralFallback },
    seaAnemone: { path: 'models/sea_anemone.glb', instances: 8, scale: 1.2, fallback: createAnemoneFallback },
    seaweed: { path: 'models/seaweed.glb', instances: 25, scale: 2.0, fallback: createSeaweedFallback },
    clownfish: { path: 'models/clownfish.glb', instances: 10, scale: 0.8, fallback: createFishFallback },
    tang: { path: 'models/tang.glb', instances: 8, scale: 0.9, fallback: createFishFallback },
    butterflyfish: { path: 'models/butterflyfish.glb', instances: 12, scale: 0.7, fallback: createFishFallback },
    seaTurtle: { path: 'models/sea_turtle.glb', instances: 2, scale: 2.0, fallback: createTurtleFallback },
    seaUrchin: { path: 'models/sea_urchin.glb', instances: 10, scale: 0.8, fallback: createUrchinFallback },
    starfish: { path: 'models/starfish.glb', instances: 8, scale: 1.0, fallback: createStarfishFallback }
};

// Fallback object creation functions
function createCoralFallback() {
    const geometry = new THREE.ConeGeometry(1, 2, 8);
    const material = new THREE.MeshPhongMaterial({ color: 0xff7700 });
    return new THREE.Mesh(geometry, material);
}

function createAnemoneFallback() {
    const group = new THREE.Group();
    const baseGeometry = new THREE.CylinderGeometry(0.5, 1, 1, 16);
    const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x8866ff });
    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    group.add(base);
    
    // Add tentacles
    for (let i = 0; i < 12; i++) {
        const tentacleGeometry = new THREE.CylinderGeometry(0.1, 0.05, 1.5, 8);
        const tentacleMaterial = new THREE.MeshPhongMaterial({ color: 0xaa88ff });
        const tentacle = new THREE.Mesh(tentacleGeometry, tentacleMaterial);
        tentacle.position.y = 1;
        tentacle.position.x = Math.sin(i / 12 * Math.PI * 2) * 0.7;
        tentacle.position.z = Math.cos(i / 12 * Math.PI * 2) * 0.7;
        tentacle.rotation.x = Math.PI/6;
        tentacle.rotation.z = -Math.sin(i / 12 * Math.PI * 2) * Math.PI/6;
        group.add(tentacle);
    }
    
    return group;
}

function createSeaweedFallback() {
    const group = new THREE.Group();
    const segments = 5 + Math.floor(Math.random() * 3);
    let y = 0;
    
    for (let i = 0; i < segments; i++) {
        const height = 0.8 + Math.random() * 0.4;
        const geometry = new THREE.CylinderGeometry(0.1, 0.15, height, 8);
        const material = new THREE.MeshPhongMaterial({ color: 0x00cc44 });
        const segment = new THREE.Mesh(geometry, material);
        segment.position.y = y + height/2;
        y += height;
        group.add(segment);
    }
    
    return group;
}

function createFishFallback() {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 16);
    bodyGeometry.rotateZ(Math.PI / 2);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: Math.random() > 0.5 ? 0xff8800 : 0x0088ff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Tail
    const tailGeometry = new THREE.PlaneGeometry(1, 0.8);
    const tailMaterial = new THREE.MeshPhongMaterial({ 
        color: bodyMaterial.color, 
        side: THREE.DoubleSide 
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.x = -0.8;
    group.add(tail);
    
    return group;
}

function createTurtleFallback() {
    const group = new THREE.Group();
    
    // Shell
    const shellGeometry = new THREE.SphereGeometry(1, 16, 12, 0, Math.PI * 2, 0, Math.PI/2);
    const shellMaterial = new THREE.MeshPhongMaterial({ color: 0x008844 });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    shell.rotation.x = Math.PI;
    group.add(shell);
    
    // Head and limbs
    const headGeometry = new THREE.SphereGeometry(0.3);
    const limbMaterial = new THREE.MeshPhongMaterial({ color: 0x006622 });
    const head = new THREE.Mesh(headGeometry, limbMaterial);
    head.position.z = 1;
    group.add(head);
    
    // Flippers
    for (let i = 0; i < 4; i++) {
        const flipperGeometry = new THREE.PlaneGeometry(0.8, 0.3);
        const flipper = new THREE.Mesh(flipperGeometry, limbMaterial);
        const angle = i * Math.PI/2;
        flipper.position.x = Math.sin(angle) * 0.8;
        flipper.position.z = Math.cos(angle) * 0.8;
        flipper.rotation.x = Math.PI/2;
        flipper.rotation.z = -angle;
        group.add(flipper);
    }
    
    return group;
}

function createUrchinFallback() {
    const group = new THREE.Group();
    
    // Body
    const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x442200 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);
    
    // Spikes
    for (let i = 0; i < 30; i++) {
        const spikeGeometry = new THREE.CylinderGeometry(0.02, 0.001, 0.7);
        const spikeMaterial = new THREE.MeshPhongMaterial({ color: 0x221100 });
        const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
        
        // Distribute spikes around sphere
        const phi = Math.acos(-1 + (2 * i) / 30);
        const theta = Math.sqrt(30 * Math.PI) * phi;
        
        spike.position.x = 0.5 * Math.sin(phi) * Math.cos(theta);
        spike.position.y = 0.5 * Math.sin(phi) * Math.sin(theta);
        spike.position.z = 0.5 * Math.cos(phi);
        
        // Orient spikes outward
        spike.lookAt(0, 0, 0);
        spike.rotateX(Math.PI/2);
        
        group.add(spike);
    }
    
    return group;
}

function createStarfishFallback() {
    const group = new THREE.Group();
    
    // Create a 5-pointed star
    const points = [];
    for (let i = 0; i < 10; i++) {
        const angle = Math.PI * 2 * i / 10;
        const radius = i % 2 === 0 ? 1 : 0.5;
        points.push(new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius));
    }
    
    const starShape = new THREE.Shape(points);
    const geometry = new THREE.ExtrudeGeometry(starShape, {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelSegments: 3
    });
    
    const material = new THREE.MeshPhongMaterial({ color: 0xff4400 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.scale.set(0.5, 0.5, 0.5);
    group.add(mesh);
    
    return group;
}

const loadingManager = new THREE.LoadingManager(
    // onLoad
    () => {
        console.log('All assets loaded successfully');
        document.getElementById('loading').style.display = 'none';
    },
    // onProgress
    (url, itemsLoaded, itemsTotal) => {
        const progress = (itemsLoaded / itemsTotal * 100).toFixed(0);
        document.getElementById('loading').textContent = `Loading underwater world... ${progress}%`;
    },
    // onError
    (url) => {
        console.error('Error loading:', url);
    }
);

// Set the loading manager for texture loader
textureLoader.manager = loadingManager;

// Arrays to track animated objects
const swayingElements = [];
const swimmingFish = [];
const schoolingFish = {
    clownfish: { group: new THREE.Group(), velocity: new THREE.Vector3(0.02, 0, 0.03), center: new THREE.Vector3(10, 10, 0) },
    tang: { group: new THREE.Group(), velocity: new THREE.Vector3(-0.03, 0, 0.02), center: new THREE.Vector3(-5, 15, 10) },
    butterflyfish: { group: new THREE.Group(), velocity: new THREE.Vector3(0.02, 0, -0.02), center: new THREE.Vector3(0, 8, -15) }
};

// Add schooling fish groups to scene
for (const type in schoolingFish) {
    scene.add(schoolingFish[type].group);
}

// Load and place models
function loadModel(modelType, info) {
    try {
        modelLoader.load(
            info.path, 
            function(gltf) {
                console.log(`Successfully loaded model: ${modelType}`);
                createInstances(modelType, info, gltf.scene);
            }, 
            undefined, 
            function(error) {
                console.error(`Error loading model ${modelType}:`, error);
                console.log(`Using fallback for ${modelType}`);
                // Use fallback geometry if model fails to load
                if (info.fallback) {
                    createInstances(modelType, info, null, true);
                }
            }
        );
    } catch (e) {
        console.error(`Exception loading model ${modelType}:`, e);
        // Use fallback on exception
        if (info.fallback) {
            createInstances(modelType, info, null, true);
        }
    }
}

function createInstances(modelType, info, originalModel, useFallback = false) {
    for (let i = 0; i < info.instances; i++) {
        let model;
        
        if (useFallback) {
            model = info.fallback();
        } else {
            model = originalModel.clone();
        }
        
        model.scale.set(info.scale, info.scale, info.scale);
        model.traverse(function(child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        // Position based on model type
        let x, y, z;
        
        if (['clownfish', 'tang', 'butterflyfish'].includes(modelType)) {
            // Fish positioning and schools
            x = (Math.random() - 0.5) * 10;
            y = 5 + Math.random() * 20;
            z = (Math.random() - 0.5) * 10;
            
            model.position.set(x, y, z);
            model.userData = {
                speed: 0.02 + Math.random() * 0.05,
                rotationSpeed: 0.01 + Math.random() * 0.02,
                direction: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
                type: modelType
            };
            
            swimmingFish.push(model);
            schoolingFish[modelType].group.add(model);
        }
        else if (modelType === 'seaTurtle') {
            // Sea turtle positioning
            x = (Math.random() - 0.5) * 60;
            y = 10 + Math.random() * 15;
            z = (Math.random() - 0.5) * 60;
            
            model.position.set(x, y, z);
            model.userData = {
                speed: 0.01 + Math.random() * 0.02,
                rotationSpeed: 0.005,
                direction: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
                type: modelType
            };
            
            swimmingFish.push(model);
            scene.add(model);
        }
        else if (modelType === 'seaweed') {
            // Seaweed positioning
            x = (Math.random() - 0.5) * 80;
            y = 0;
            z = (Math.random() - 0.5) * 80;
            
            model.position.set(x, y, z);
            model.userData = {
                swayAmount: 0.1 + Math.random() * 0.2,
                swaySpeed: 0.5 + Math.random() * 1.5
            };
            
            swayingElements.push(model);
            scene.add(model);
        }
        else {
            // Coral and other static elements
            x = (Math.random() - 0.5) * 80;
            y = 0;
            z = (Math.random() - 0.5) * 80;
            
            model.position.set(x, y, z);
            
            if (['softCoral', 'seaAnemone'].includes(modelType)) {
                model.userData = {
                    swayAmount: 0.05 + Math.random() * 0.1,
                    swaySpeed: 0.2 + Math.random() * 0.5
                };
                swayingElements.push(model);
            }
            
            scene.add(model);
        }
    }
}

// Load all models
for (const modelType in models) {
    loadModel(modelType, models[modelType]);
}

// Water caustics animation
let causticIndex = 0;
const causticFrames = [];

// Try to load caustic textures with error handling
function loadCausticTextures() {
    try {
        for (let i = 1; i <= 32; i++) {
            const path = `textures/caustics/${i.toString().padStart(2, '0')}.jpg`;
            const causticFrame = textureLoader.load(
                path,
                function() {
                    console.log(`Loaded caustic frame ${i}`);
                },
                undefined,
                function(error) {
                    console.error(`Failed to load caustic frame ${i}:`, error);
                }
            );
            causticFrame.wrapS = causticFrame.wrapT = THREE.RepeatWrapping;
            causticFrame.repeat.set(5, 5);
            causticFrames.push(causticFrame);
        }
    } catch(e) {
        console.error('Error loading caustic textures:', e);
    }
}

loadCausticTextures();

// Update caustic animation
function updateCaustics() {
    if (causticFrames.length > 0) {
        causticIndex = (causticIndex + 1) % causticFrames.length;
        floorMaterial.emissiveMap = causticFrames[causticIndex];
        floorMaterial.emissive.set(0xffffff);
        floorMaterial.emissiveIntensity = 0.3;
        floorMaterial.needsUpdate = true;
    }
}

// Time tracking
const clock = new THREE.Clock();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    
    // Update controls
    controls.update();
    
    // Water surface animation - updated for BufferGeometry
    if (waterPositions) {
        const time = Date.now();
        for (let i = 0; i < waterPositions.count; i++) {
            const z = Math.sin((i / 5) + (time / 500)) * 0.5;
            waterPositions.setZ(i, z);
        }
        waterPositions.needsUpdate = true;
    }
    
    // Update caustics every few frames
    if (Math.floor(Date.now() / 100) % 3 === 0) {
        updateCaustics();
    }
    
    // Animate swaying elements (seaweed, soft coral, anemones)
    swayingElements.forEach(element => {
        const time = Date.now() * 0.001;
        const { swayAmount, swaySpeed } = element.userData;
        element.rotation.x = Math.sin(time * swaySpeed) * swayAmount * 0.2;
        element.rotation.z = Math.sin(time * swaySpeed * 1.1) * swayAmount;
    });
    
    // Animate individual fish
    swimmingFish.forEach(fish => {
        const { speed, rotationSpeed, direction, type } = fish.userData;
        
        // Move fish
        fish.position.x += direction.x * speed;
        fish.position.y += direction.y * speed * 0.3;
        fish.position.z += direction.z * speed;
        
        // Rotate fish toward movement direction
        const targetRotation = Math.atan2(direction.x, direction.z);
        fish.rotation.y = targetRotation;
        
        // Check boundaries and change direction if needed
        if (
            Math.abs(fish.position.x) > 40 ||
            fish.position.y < 2 ||
            fish.position.y > 25 ||
            Math.abs(fish.position.z) > 40 ||
            Math.random() < 0.005
        ) {
            // Create new random direction
            direction.set(Math.random() - 0.5, (Math.random() - 0.5) * 0.5, Math.random() - 0.5);
            direction.normalize();
        }
    });
    
    // Animate schooling fish
    for (const type in schoolingFish) {
        const school = schoolingFish[type];
        
        // Move school center
        school.center.add(school.velocity);
        
        // Change direction if out of bounds
        if (Math.abs(school.center.x) > 30 || Math.abs(school.center.z) > 30) {
            school.velocity.x *= -1;
            school.velocity.z *= -1;
        }
        
        // Occasionally change direction slightly
        if (Math.random() < 0.01) {
            school.velocity.x += (Math.random() - 0.5) * 0.01;
            school.velocity.z += (Math.random() - 0.5) * 0.01;
            school.velocity.normalize().multiplyScalar(0.03);
        }
    }
    
    renderer.render(scene, camera);
}

// Add error handling around animation loop
try {
    animate();
    console.log("Animation loop started successfully");
} catch (e) {
    console.error("Error in animation loop:", e);
    document.getElementById('loading').textContent = "Error loading animation. Check console for details.";
    document.getElementById('loading').style.color = "red";
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Log initialization success
console.log("Underwater scene initialized");
