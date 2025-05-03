// Get the canvas element
const canvas = document.getElementById("bgCanvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Create a group to hold our objects
const group = new THREE.Group();
scene.add(group);

// Parameters for network-like structure
const nodeCount = 18;
const connectionCount = 25;
const nodeSize = 0.08;
const networkSize = 8;

// Colors
const lightModeColor = 0x1B2A41; // Dark navy for light mode
const darkModeColor = 0xFBF5F3;  // Off-white for dark mode
const darkModeHighlightColor = 0xCCC9DC; // Light lavender for dark mode highlights
const packetColor = 0x324a5f; // Slate blue for packets

// Create nodes
const nodes = [];
const nodeMaterial = new THREE.MeshBasicMaterial({
  color: lightModeColor,
  transparent: true,
  opacity: 0.8,
});
const nodeGeometry = new THREE.SphereGeometry(nodeSize, 16, 16);

// Create glow effect for nodes
function createGlowMaterial(color, size = 1.5) {
  return new THREE.PointsMaterial({
    color: color,
    transparent: true,
    opacity: 0.5,
    size: nodeSize * size,
    map: createGlowTexture(),
    blending: THREE.AdditiveBlending
  });
}

// Create a glow texture
function createGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

for (let i = 0; i < nodeCount; i++) {
  const angle1 = Math.random() * Math.PI * 2;
  const angle2 = Math.random() * Math.PI;
  const radius = networkSize * (0.3 + Math.random() * 0.7);
  const x = radius * Math.sin(angle2) * Math.cos(angle1);
  const y = radius * Math.sin(angle2) * Math.sin(angle1);
  const z = radius * Math.cos(angle2);
  const node = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
  node.position.set(x, y, z);
  node.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.007,
    (Math.random() - 0.5) * 0.007,
    (Math.random() - 0.5) * 0.007
  );
  node.pulseFactor = 0.5 + Math.random() * 0.5;
  node.pulseSpeed = 0.01 + Math.random() * 0.02;
  node.pulseOffset = Math.random() * Math.PI * 2;
  group.add(node);
  nodes.push(node);
  
  // Add glow effect for each node
  const glow = new THREE.Points(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)]), createGlowMaterial(lightModeColor));
  node.add(glow);
  node.glow = glow;
}

// Create connections and data packets
const connections = [];
const lineMaterial = new THREE.LineBasicMaterial({
  color: lightModeColor,
  transparent: true,
  opacity: 0.2,
});

// Data packet system
const dataPackets = [];
const packetGeometry = new THREE.SphereGeometry(nodeSize * 0.4, 8, 8);
const packetMaterial = new THREE.MeshBasicMaterial({
  color: packetColor,
  transparent: true,
  opacity: 0.8,
});

// Create a new data packet along a connection
function createDataPacket(connection) {
  const packet = new THREE.Mesh(packetGeometry, packetMaterial.clone());
  packet.connection = connection;
  packet.progress = 0; // 0 = start node, 1 = end node
  packet.speed = 0.005 + Math.random() * 0.01; // Random speed
  packet.active = true;
  
  // Position at the start node
  packet.position.copy(connection.nodeA.position);
  
  // Add glow effect for packet
  const glow = new THREE.Points(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0)]),
    createGlowMaterial(packetColor, 1.2)
  );
  packet.add(glow);
  
  group.add(packet);
  dataPackets.push(packet);
  
  return packet;
}

for (let i = 0; i < connectionCount; i++) {
  const geometry = new THREE.BufferGeometry();
  const nodeA = nodes[Math.floor(Math.random() * nodes.length)];
  let closestNodes = nodes
    .filter(node => node !== nodeA)
    .sort((a, b) => nodeA.position.distanceTo(a.position) - nodeA.position.distanceTo(b.position));
  const randIndex = Math.floor(Math.random() * Math.ceil(closestNodes.length / 2));
  const nodeB = closestNodes[randIndex];
  const points = [nodeA.position.clone(), nodeB.position.clone()];
  geometry.setFromPoints(points);
  const line = new THREE.Line(geometry, lineMaterial.clone());
  line.baseDistance = nodeA.position.distanceTo(nodeB.position);
  line.nodeA = nodeA;
  line.nodeB = nodeB;
  line.lastPacketTime = 0; // Time tracker for packet generation
  group.add(line);
  connections.push(line);
  
  // Create initial data packets on some connections
  if (Math.random() < 0.3) {
    createDataPacket(line);
  }
}

// Create particle cloud
const particleCount = 200;
const particles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleSizes = new Float32Array(particleCount);

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  const radius = networkSize * 2 + Math.random() * 10;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  particlePositions[i3 + 2] = radius * Math.cos(phi);
  particleSizes[i] = 0.05 + Math.random() * 0.08; // Increased base particle size
}

particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particles.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

const particleMaterial = new THREE.PointsMaterial({
  color: lightModeColor,
  size: 0.1,
  transparent: true,
  opacity: 0.3,
  sizeAttenuation: true,
  blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Add an interactive 3D cube
const cubeSize = 1.5;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
// Create cube materials with different colors for each face
const cubeMaterials = [
  new THREE.MeshBasicMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.7, wireframe: false }),
  new THREE.MeshBasicMaterial({ color: 0x4361ee, transparent: true, opacity: 0.7, wireframe: false }),
  new THREE.MeshBasicMaterial({ color: 0x3a0ca3, transparent: true, opacity: 0.7, wireframe: false }),
  new THREE.MeshBasicMaterial({ color: 0x3f37c9, transparent: true, opacity: 0.7, wireframe: false }),
  new THREE.MeshBasicMaterial({ color: 0x4895ef, transparent: true, opacity: 0.7, wireframe: false }),
  new THREE.MeshBasicMaterial({ color: 0x560bad, transparent: true, opacity: 0.7, wireframe: false }),
];

const interactiveCube = new THREE.Mesh(cubeGeometry, cubeMaterials);
interactiveCube.position.set(7, 2, -3); // Position it in the scene
interactiveCube.userData.isInteractive = true;
interactiveCube.userData.originalScale = new THREE.Vector3(1, 1, 1);
interactiveCube.userData.isExpanded = false;
interactiveCube.userData.rotationSpeed = { x: 0.005, y: 0.005, z: 0 };
interactiveCube.scale.set(0.01, 0.01, 0.01); // Start scaled down
group.add(interactiveCube);

// Create wireframe outline for the cube
const wireframeGeometry = new THREE.BoxGeometry(cubeSize + 0.1, cubeSize + 0.1, cubeSize + 0.1);
const wireframeMaterial = new THREE.MeshBasicMaterial({
  color: lightModeColor,
  wireframe: true,
  transparent: true,
  opacity: 0.3
});
const cubeWireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
interactiveCube.add(cubeWireframe);

// Add particles around the cube
const cubeParticlesCount = 50;
const cubeParticlesGeometry = new THREE.BufferGeometry();
const cubeParticlesPositions = new Float32Array(cubeParticlesCount * 3);

for (let i = 0; i < cubeParticlesCount; i++) {
  const i3 = i * 3;
  const radius = cubeSize * 1.5;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  cubeParticlesPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  cubeParticlesPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  cubeParticlesPositions[i3 + 2] = radius * Math.cos(phi);
}

cubeParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(cubeParticlesPositions, 3));
const cubeParticlesMaterial = new THREE.PointsMaterial({
  color: lightModeColor,
  size: 0.05,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending
});
const cubeParticles = new THREE.Points(cubeParticlesGeometry, cubeParticlesMaterial);
interactiveCube.add(cubeParticles);

// Add an interactive 3D pyramid
const pyramidSize = 1.5;
const pyramidGeometry = new THREE.ConeGeometry(pyramidSize, pyramidSize * 2, 4);
// Create pyramid materials with different colors for each face
const pyramidMaterials = [
  new THREE.MeshBasicMaterial({ color: 0xff6f61, transparent: true, opacity: 0.7, wireframe: false }),
  new THREE.MeshBasicMaterial({ color: 0xff9e80, transparent: true, opacity: 0.7, wireframe: false }),
  new THREE.MeshBasicMaterial({ color: 0xff3d00, transparent: true, opacity: 0.7, wireframe: false }),
  new THREE.MeshBasicMaterial({ color: 0xff5722, transparent: true, opacity: 0.7, wireframe: false }),
];

const interactivePyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterials);
interactivePyramid.position.set(-7, 2, -3); // Position it in the scene
interactivePyramid.userData.isInteractive = true;
interactivePyramid.userData.originalScale = new THREE.Vector3(1, 1, 1);
interactivePyramid.userData.isExpanded = false;
interactivePyramid.userData.rotationSpeed = { x: 0.005, y: 0.005, z: 0 };
interactivePyramid.scale.set(0.01, 0.01, 0.01); // Start scaled down
group.add(interactivePyramid);

// Create wireframe outline for the pyramid
const pyramidWireframeGeometry = new THREE.ConeGeometry(pyramidSize + 0.1, pyramidSize * 2 + 0.1, 4);
const pyramidWireframeMaterial = new THREE.MeshBasicMaterial({
  color: lightModeColor,
  wireframe: true,
  transparent: true,
  opacity: 0.3
});
const pyramidWireframe = new THREE.Mesh(pyramidWireframeGeometry, pyramidWireframeMaterial);
interactivePyramid.add(pyramidWireframe);

// Add particles around the pyramid
const pyramidParticlesCount = 50;
const pyramidParticlesGeometry = new THREE.BufferGeometry();
const pyramidParticlesPositions = new Float32Array(pyramidParticlesCount * 3);

for (let i = 0; i < pyramidParticlesCount; i++) {
  const i3 = i * 3;
  const radius = pyramidSize * 1.5;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  pyramidParticlesPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  pyramidParticlesPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  pyramidParticlesPositions[i3 + 2] = radius * Math.cos(phi);
}

pyramidParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(pyramidParticlesPositions, 3));
const pyramidParticlesMaterial = new THREE.PointsMaterial({
  color: lightModeColor,
  size: 0.05,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending
});
const pyramidParticles = new THREE.Points(pyramidParticlesGeometry, pyramidParticlesMaterial);
interactivePyramid.add(pyramidParticles);

// Add an interactive 3D polyhedral hexagonal shape
const polyHexSize = 1.5;
const polyHexGeometry = new THREE.IcosahedronGeometry(polyHexSize, 0); // Polyhedral shape
const polyHexMaterial = new THREE.MeshBasicMaterial({
  color: 0xffd700,
  transparent: true,
  opacity: 0.7,
  wireframe: false,
});
const interactivePolyHex = new THREE.Mesh(polyHexGeometry, polyHexMaterial);
interactivePolyHex.position.set(0, 2, -8); // Position it in the scene
interactivePolyHex.userData.isInteractive = true;
interactivePolyHex.userData.originalScale = new THREE.Vector3(1, 1, 1);
interactivePolyHex.userData.isExpanded = false;
interactivePolyHex.userData.rotationSpeed = { x: 0.005, y: 0.005, z: 0 };
interactivePolyHex.scale.set(0.01, 0.01, 0.01); // Start scaled down
group.add(interactivePolyHex);

// Create wireframe outline for the polyhedral hexagon
const polyHexWireframeGeometry = new THREE.IcosahedronGeometry(polyHexSize + 0.1, 0);
const polyHexWireframeMaterial = new THREE.MeshBasicMaterial({
  color: lightModeColor,
  wireframe: true,
  transparent: true,
  opacity: 0.3,
});
const polyHexWireframe = new THREE.Mesh(polyHexWireframeGeometry, polyHexWireframeMaterial);
interactivePolyHex.add(polyHexWireframe);

// Add particles around the polyhedral hexagon
const polyHexParticlesCount = 50;
const polyHexParticlesGeometry = new THREE.BufferGeometry();
const polyHexParticlesPositions = new Float32Array(polyHexParticlesCount * 3);

for (let i = 0; i < polyHexParticlesCount; i++) {
  const i3 = i * 3;
  const radius = polyHexSize * 1.5;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.random() * Math.PI;
  polyHexParticlesPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  polyHexParticlesPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  polyHexParticlesPositions[i3 + 2] = radius * Math.cos(phi);
}

polyHexParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(polyHexParticlesPositions, 3));
const polyHexParticlesMaterial = new THREE.PointsMaterial({
  color: lightModeColor,
  size: 0.05,
  transparent: true,
  opacity: 0.5,
  blending: THREE.AdditiveBlending,
});
const polyHexParticles = new THREE.Points(polyHexParticlesGeometry, polyHexParticlesMaterial);
interactivePolyHex.add(polyHexParticles);

// Raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let selectedObject = null;

// Update mouse position for raycasting
document.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  if (isDragging && selectedObject) {
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;
    
    selectedObject.rotation.y += deltaX * 0.01;
    selectedObject.rotation.x += deltaY * 0.01;
    
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
  }
});

// Mouse down event for interaction
document.addEventListener('mousedown', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([interactiveCube, interactivePyramid, interactivePolyHex], true); // Exclude older hexagon

  if (intersects.length > 0) {
    isDragging = true;
    selectedObject = intersects[0].object.parent; // Select the parent object (e.g., cube or pyramid)
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;

    document.body.style.cursor = 'grabbing';

    // Toggle expanded state on click
    selectedObject.userData.isExpanded = !selectedObject.userData.isExpanded;

    // Add a particle burst effect on click
    createParticleBurst(selectedObject.position.clone(), 50);

    // Add a little particle effect near the tiny person when an object is clicked
    const tinyPerson = document.querySelector('.tiny-person-container');
    if (tinyPerson) {
      const rect = tinyPerson.getBoundingClientRect();
      const personPosition = new THREE.Vector3(
        (rect.left / window.innerWidth) * 2 - 1,
        -((rect.top / window.innerHeight) * 2 - 1),
        0
      );
      personPosition.unproject(camera);
      createParticleBurst(personPosition, 20, 0.02, 0.5);
    }
  }
});

// Mouse up event
document.addEventListener('mouseup', () => {
  isDragging = false;
  document.body.style.cursor = 'default';
});

// Create a particle burst effect
function createParticleBurst(position, count, size = 0.05, initialOpacity = 1) {
  const burstGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const velocities = [];
  
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = position.x;
    positions[i3 + 1] = position.y;
    positions[i3 + 2] = position.z;
    
    velocities.push(
      new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      )
    );
  }
  
  burstGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  // Check if dark mode is active instead of using undefined isDarkMode variable
  const currentIsDarkMode = document.body.classList.contains('dark-mode');
  
  const burstMaterial = new THREE.PointsMaterial({
    color: currentIsDarkMode ? darkModeHighlightColor : lightModeColor,
    size: currentIsDarkMode ? size * 1.5 : size, // Larger in dark mode
    transparent: true,
    opacity: currentIsDarkMode ? initialOpacity * 1.2 : initialOpacity // More visible in dark mode
  });
  
  const burst = new THREE.Points(burstGeometry, burstMaterial);
  scene.add(burst);
  
  // Animate the burst particles
  const positionAttribute = burst.geometry.attributes.position;
  const positionArray = positionAttribute.array;
  
  function animateBurst() {
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positionArray[i3] += velocities[i].x;
      positionArray[i3 + 1] += velocities[i].y;
      positionArray[i3 + 2] += velocities[i].z;
      
      // Slow down particles
      velocities[i].multiplyScalar(0.98);
    }
    
    positionAttribute.needsUpdate = true;
    burst.material.opacity *= 0.98;
    
    if (burst.material.opacity > 0.01) {
      requestAnimationFrame(animateBurst);
    } else {
      scene.remove(burst);
      burst.geometry.dispose();
      burst.material.dispose();
    }
  }
  
  animateBurst();
}

// Camera position
camera.position.z = 15;

// Interaction variables
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
let scrollY = 0;

// Update colors based on theme
function updateColors(isDarkMode) {
    const newColor = isDarkMode ? darkModeColor : lightModeColor;
    const particleColor = isDarkMode ? darkModeHighlightColor : 0x324a5f; // Slate blue in light mode
    const newPacketColor = isDarkMode ? 0xCCC9DC : 0x324a5f; // Lavender in dark, slate blue in light
    
    nodes.forEach(node => {
        node.material.color.set(newColor);
        // Increase opacity in dark mode for better visibility
        node.material.opacity = isDarkMode ? 0.9 : 0.8;
        
        // Update node glow
        if (node.glow) {
            node.glow.material.color.set(newColor);
            node.glow.material.opacity = isDarkMode ? 0.8 : 0.5;
            node.glow.material.size = isDarkMode ? nodeSize * 2 : nodeSize * 1.5;
        }
    });
    
    connections.forEach(connection => {
        connection.material.color.set(newColor);
        // Increase connection opacity in dark mode
        connection.material.opacity = isDarkMode ? 0.35 : 0.2;
    });
    
    // Update data packets
    dataPackets.forEach(packet => {
        if (packet.active) {
            packet.material.color.set(newPacketColor);
            packet.material.opacity = isDarkMode ? 0.9 : 0.7;
            
            // Update packet glow
            if (packet.children.length > 0) {
                packet.children[0].material.color.set(newPacketColor);
                packet.children[0].material.opacity = isDarkMode ? 0.8 : 0.5;
            }
        }
    });
    
    // Set particles to brighter color in dark mode
    particleSystem.material.color.set(particleColor);
    // Make particles more visible in dark mode
    particleSystem.material.opacity = isDarkMode ? 0.6 : 0.3;
    particleSystem.material.size = isDarkMode ? 0.15 : 0.1;
    
    // Update cube materials with new colors
    for (let i = 0; i < cubeMaterials.length; i++) {
        if (isDarkMode) {
            cubeMaterials[i].color.set(0xFBF5F3); // Off-white in dark mode
        } else {
            if (i % 2 === 0) {
                cubeMaterials[i].color.set(0x0C1821); // Very dark blue in light mode
            } else {
                cubeMaterials[i].color.set(0x1B2A41); // Dark navy in light mode
            }
        }
    }
    
    // Update the cube frame and particles
    wireframeMaterial.color.set(newColor);
    wireframeMaterial.opacity = isDarkMode ? 0.6 : 0.3;
    
    cubeParticlesMaterial.color.set(particleColor);
    cubeParticlesMaterial.opacity = isDarkMode ? 0.8 : 0.5;
    cubeParticlesMaterial.size = isDarkMode ? 0.07 : 0.05;
    
    // Update pyramid materials
    for (let i = 0; i < pyramidMaterials.length; i++) {
        if (isDarkMode) {
            pyramidMaterials[i].color.set(0xCCC9DC); // Light lavender in dark mode
        } else {
            if (i % 2 === 0) {
                pyramidMaterials[i].color.set(0x0C1821); // Very dark blue in light mode
            } else {
                pyramidMaterials[i].color.set(0x1B2A41); // Dark navy in light mode
            }
        }
    }
    
    // Update pyramid wireframe and particles
    pyramidWireframeMaterial.color.set(newColor);
    pyramidWireframeMaterial.opacity = isDarkMode ? 0.6 : 0.3;
    
    pyramidParticlesMaterial.color.set(particleColor);
    pyramidParticlesMaterial.opacity = isDarkMode ? 0.8 : 0.5;
    pyramidParticlesMaterial.size = isDarkMode ? 0.07 : 0.05;
    
    // Update polyHex color
    if (isDarkMode) {
        polyHexMaterial.color.set(0xFBF5F3); // Off-white in dark mode
    } else {
        polyHexMaterial.color.set(0x1B2A41); // Dark navy in light mode
    }
    
    // Update polyHex wireframe and particles
    polyHexWireframeMaterial.color.set(newColor);
    polyHexWireframeMaterial.opacity = isDarkMode ? 0.6 : 0.3;
    
    polyHexParticlesMaterial.color.set(particleColor);
    polyHexParticlesMaterial.opacity = isDarkMode ? 0.8 : 0.5;
    polyHexParticlesMaterial.size = isDarkMode ? 0.07 : 0.05;
}

// Initialize theme
const initialIsDarkMode = document.body.classList.contains('dark-mode');
updateColors(initialIsDarkMode);

// Theme change listener
window.addEventListener('themeChange', (event) => {
  updateColors(event.detail.isDarkMode);
});

// Mouse movement
document.addEventListener('mousemove', (event) => {
  mouseX = (event.clientX - windowHalfX) / 100;
  mouseY = (event.clientY - windowHalfY) / 100;
});

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Scroll events
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

// Flag for initial animation
let initialAnimationComplete = false;
const initialScaleTarget = new THREE.Vector3(1, 1, 1);
const animationLerpFactor = 0.04; // Speed of the initial scaling animation

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  targetX = mouseX * 0.2;
  targetY = mouseY * 0.2;
  group.rotation.y += 0.001;
  group.rotation.x += 0.0005;
  group.position.y = -scrollY * 0.005;
  particleSystem.position.y = -scrollY * 0.002;
  const time = Date.now() * 0.001;
  const currentTime = Date.now();

  // Initial scaling animation for interactive objects
  if (!initialAnimationComplete) {
    interactiveCube.scale.lerp(initialScaleTarget, animationLerpFactor);
    interactivePyramid.scale.lerp(initialScaleTarget, animationLerpFactor);
    interactivePolyHex.scale.lerp(initialScaleTarget, animationLerpFactor);

    // Check if animation is close enough to complete
    if (interactiveCube.scale.distanceTo(initialScaleTarget) < 0.01) {
      interactiveCube.scale.copy(initialScaleTarget); // Snap to final scale
      interactivePyramid.scale.copy(initialScaleTarget);
      interactivePolyHex.scale.copy(initialScaleTarget);
      initialAnimationComplete = true;
    }
  }

  // Check for hover over the cube (only after initial animation)
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([interactiveCube, interactivePyramid, interactivePolyHex], true);

  let isHovering = false;
  if (initialAnimationComplete && intersects.length > 0 && !isDragging) {
    isHovering = true;
    document.body.style.cursor = 'pointer';
    const hoveredObject = intersects[0].object.parent; // Get the main object (Mesh)

    // Make the object "breathe" when hovered
    const pulseScale = 1.1 + Math.sin(time * 3) * 0.05;
    hoveredObject.scale.set(pulseScale, pulseScale, pulseScale);

    // Spin particles faster on hover
    if (hoveredObject === interactiveCube) {
      cubeParticles.rotation.y += 0.01;
      cubeParticles.rotation.x += 0.01;
    } else if (hoveredObject === interactivePyramid) {
      pyramidParticles.rotation.y += 0.01;
      pyramidParticles.rotation.x += 0.01;
    } else if (hoveredObject === interactivePolyHex) {
      polyHexParticles.rotation.y += 0.01;
      polyHexParticles.rotation.x += 0.01;
    }
  } else if (!isDragging) {
    document.body.style.cursor = 'default';
  }

  // Handle object animations (only if not hovering and initial animation is done)
  if (initialAnimationComplete && !isHovering && !isDragging) {
      // Handle cube animation based on expanded state
      if (interactiveCube.userData.isExpanded) {
        interactiveCube.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.05);
        cubeWireframe.material.opacity = 0.5;
        interactiveCube.rotation.x += interactiveCube.userData.rotationSpeed.x * 0.5;
        interactiveCube.rotation.y += interactiveCube.userData.rotationSpeed.y * 0.5;
      } else {
        interactiveCube.scale.lerp(interactiveCube.userData.originalScale, 0.05);
        cubeWireframe.material.opacity = 0.3;
        interactiveCube.rotation.x += interactiveCube.userData.rotationSpeed.x;
        interactiveCube.rotation.y += interactiveCube.userData.rotationSpeed.y;
      }

      // Handle pyramid animation based on expanded state
      if (interactivePyramid.userData.isExpanded) {
        interactivePyramid.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.05);
        pyramidWireframe.material.opacity = 0.5;
        interactivePyramid.rotation.x += interactivePyramid.userData.rotationSpeed.x * 0.5;
        interactivePyramid.rotation.y += interactivePyramid.userData.rotationSpeed.y * 0.5;
      } else {
        interactivePyramid.scale.lerp(interactivePyramid.userData.originalScale, 0.05);
        pyramidWireframe.material.opacity = 0.3;
        interactivePyramid.rotation.x += interactivePyramid.userData.rotationSpeed.x;
        interactivePyramid.rotation.y += interactivePyramid.userData.rotationSpeed.y;
      }

      // Handle polyhedral hexagon animation based on expanded state
      if (interactivePolyHex.userData.isExpanded) {
        interactivePolyHex.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.05);
        polyHexWireframe.material.opacity = 0.5;
        interactivePolyHex.rotation.x += interactivePolyHex.userData.rotationSpeed.x * 0.5;
        interactivePolyHex.rotation.y += interactivePolyHex.userData.rotationSpeed.y * 0.5;
      } else {
        interactivePolyHex.scale.lerp(interactivePolyHex.userData.originalScale, 0.05);
        polyHexWireframe.material.opacity = 0.3;
        interactivePolyHex.rotation.x += interactivePolyHex.userData.rotationSpeed.x;
        interactivePolyHex.rotation.y += interactivePolyHex.userData.rotationSpeed.y;
      }
  }

  // Rotate particles (only if not hovering or dragging)
  if (!isHovering && !isDragging) {
      cubeParticles.rotation.y += 0.002;
      cubeParticles.rotation.x += 0.001;
      pyramidParticles.rotation.y += 0.002;
      pyramidParticles.rotation.x += 0.001;
      polyHexParticles.rotation.y += 0.002;
      polyHexParticles.rotation.x += 0.001;
  }

  // Update nodes with glowing effect
  nodes.forEach(node => {
    node.position.add(node.velocity);
    const pulse = Math.sin(time * node.pulseSpeed + node.pulseOffset) * 0.2 + 0.8;
    node.scale.set(pulse, pulse, pulse);
    node.material.opacity = 0.5 + pulse * 0.2;
    
    // Update glow effect
    if (node.glow) {
      node.glow.material.opacity = 0.3 + pulse * 0.3;
    }
    
    const distance = node.position.length();
    if (distance > networkSize * 1.1) {
      node.velocity.addScaledVector(node.position, -0.001);
    }
    node.velocity.multiplyScalar(0.995);
    if (Math.random() > 0.95) {
      node.velocity.add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.002
      ));
    }
  });

  // Update connections with pulsing effect
  connections.forEach(connection => {
    const points = [connection.nodeA.position.clone(), connection.nodeB.position.clone()];
    connection.geometry.setFromPoints(points);
    const currentDistance = connection.nodeA.position.distanceTo(connection.nodeB.position);
    const ratio = Math.min(connection.baseDistance / currentDistance, 2.0);
    
    // Add pulsing effect to connections
    const pulseFactor = 0.05 + Math.sin(time * 2 + connection.nodeA.pulseOffset) * 0.05;
    connection.material.opacity = pulseFactor + ratio * 0.15;
    
    // Generate new data packets occasionally
    if (currentTime - connection.lastPacketTime > 3000 + Math.random() * 7000) { // Random interval between 3-10 seconds
      if (Math.random() < 0.4) { // 40% chance to generate a packet
        createDataPacket(connection);
        connection.lastPacketTime = currentTime;
      }
    }
  });

  // Update data packets
  dataPackets.forEach((packet, index) => {
    if (packet.active) {
      // Move packet along the connection
      packet.progress += packet.speed;
      
      if (packet.progress >= 1) {
        // Reached destination node
        packet.active = false;
        
        // Create a small burst effect when packet reaches a node
        const destNode = packet.connection.nodeB;
        destNode.scale.set(1.3, 1.3, 1.3); // Make node larger momentarily
        setTimeout(() => {
          if (destNode) destNode.scale.set(1, 1, 1);
        }, 300);
        
        // Increase node glow temporarily
        if (destNode.glow) {
          const originalSize = destNode.glow.material.size;
          destNode.glow.material.size = originalSize * 1.5;
          destNode.glow.material.opacity = 0.9;
          setTimeout(() => {
            if (destNode.glow) {
              destNode.glow.material.size = originalSize;
              destNode.glow.material.opacity = 0.5;
            }
          }, 300);
        }
        
        // Remove the packet after a short delay
        setTimeout(() => {
          if (packet && packet.parent) {
            group.remove(packet);
            // Remove from array
            const idx = dataPackets.indexOf(packet);
            if (idx > -1) dataPackets.splice(idx, 1);
          }
        }, 500);
        
        // 30% chance to create a new packet from the destination node
        if (Math.random() < 0.3) {
          // Find a random connection from the destination node
          const possibleConnections = connections.filter(conn => 
            conn.nodeA === packet.connection.nodeB || conn.nodeB === packet.connection.nodeB
          );
          
          if (possibleConnections.length > 0) {
            const newConnection = possibleConnections[Math.floor(Math.random() * possibleConnections.length)];
            // If the connection is in the wrong direction, we need to create a packet going the other way
            if (newConnection.nodeB === packet.connection.nodeB) {
              const reversedConn = {
                nodeA: newConnection.nodeB,
                nodeB: newConnection.nodeA,
                baseDistance: newConnection.baseDistance
              };
              createDataPacket(reversedConn);
            } else {
              createDataPacket(newConnection);
            }
          }
        }
      } else {
        // Update position along the path
        const startPos = packet.connection.nodeA.position;
        const endPos = packet.connection.nodeB.position;
        packet.position.lerpVectors(startPos, endPos, packet.progress);
        
        // Pulse the packet
        const pulseFactor = 0.8 + Math.sin(time * 10) * 0.2;
        packet.scale.set(pulseFactor, pulseFactor, pulseFactor);
        
        // Update packet glow
        if (packet.children.length > 0) {
          packet.children[0].material.opacity = 0.5 + Math.sin(time * 10) * 0.3;
        }
      }
    }
  });

  particleSystem.rotation.y += 0.0002;
  particleSystem.rotation.x += 0.0001;

  // Apply pulsing to particles to make them more visible
  const isDarkMode = document.body.classList.contains('dark-mode');
  if (isDarkMode) {
    // Make particles pulse more noticeably in dark mode
    const particlePulse = 0.8 + Math.sin(time * 0.5) * 0.2;
    particleSystem.material.size = particlePulse * 0.15;
    particleSystem.material.opacity = 0.5 + particlePulse * 0.1;
  }

  camera.position.x += (targetX - camera.position.x) * 0.03;
  camera.position.y += (-targetY - camera.position.y) * 0.03;
  camera.lookAt(scene.position);
  renderer.render(scene, camera);
}

animate();

