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
const lightModeColor = 0x212529;
const darkModeColor = 0x4cc9f0;
const darkModeHighlightColor = 0x72deff; // Brighter color for dark mode particles

// Create nodes
const nodes = [];
const nodeMaterial = new THREE.MeshBasicMaterial({
  color: lightModeColor,
  transparent: true,
  opacity: 0.8,
});
const nodeGeometry = new THREE.SphereGeometry(nodeSize, 16, 16);

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
}

// Create connections
const connections = [];
const lineMaterial = new THREE.LineBasicMaterial({
  color: lightModeColor,
  transparent: true,
  opacity: 0.2,
});

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
  group.add(line);
  connections.push(line);
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
  const particleColor = isDarkMode ? darkModeHighlightColor : lightModeColor; // Brighter for dark mode
  
  nodes.forEach(node => {
    node.material.color.set(newColor);
    // Increase opacity in dark mode for better visibility
    node.material.opacity = isDarkMode ? 0.9 : 0.8;
  });
  
  connections.forEach(connection => {
    connection.material.color.set(newColor);
    // Increase connection opacity in dark mode
    connection.material.opacity = isDarkMode ? 0.35 : 0.2;
  });
  
  // Set particles to brighter color in dark mode
  particleSystem.material.color.set(particleColor);
  // Make particles more visible in dark mode
  particleSystem.material.opacity = isDarkMode ? 0.6 : 0.3;
  particleSystem.material.size = isDarkMode ? 0.15 : 0.1;
  
  // Update the cube frame and particles
  wireframeMaterial.color.set(newColor);
  wireframeMaterial.opacity = isDarkMode ? 0.6 : 0.3;
  
  cubeParticlesMaterial.color.set(particleColor);
  cubeParticlesMaterial.opacity = isDarkMode ? 0.8 : 0.5;
  cubeParticlesMaterial.size = isDarkMode ? 0.07 : 0.05;
  
  // Update pyramid wireframe and particles
  pyramidWireframeMaterial.color.set(newColor);
  pyramidWireframeMaterial.opacity = isDarkMode ? 0.6 : 0.3;
  
  pyramidParticlesMaterial.color.set(particleColor);
  pyramidParticlesMaterial.opacity = isDarkMode ? 0.8 : 0.5;
  pyramidParticlesMaterial.size = isDarkMode ? 0.07 : 0.05;
  
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
  
  // Check for hover over the cube
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects([interactiveCube, interactivePyramid, interactivePolyHex], true); // Exclude older hexagon
  
  if (intersects.length > 0 && !isDragging) {
    document.body.style.cursor = 'pointer';
    // Make the cube "breathe" when hovered
    const pulseScale = 1.1 + Math.sin(time * 3) * 0.05;
    intersects[0].object.scale.set(pulseScale, pulseScale, pulseScale);
    
    // Spin cube particles faster on hover
    if (intersects[0].object === interactiveCube) {
      cubeParticles.rotation.y += 0.01;
      cubeParticles.rotation.x += 0.01;
    } else if (intersects[0].object === interactivePyramid) {
      pyramidParticles.rotation.y += 0.01;
      pyramidParticles.rotation.x += 0.01;
    } else if (intersects[0].object === interactivePolyHex) {
      polyHexParticles.rotation.y += 0.01;
      polyHexParticles.rotation.x += 0.01;
    }
  } else if (!isDragging) {
    document.body.style.cursor = 'default';
    
    // Handle cube animation based on expanded state
    if (interactiveCube.userData.isExpanded) {
      interactiveCube.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.05);
      cubeWireframe.material.opacity = 0.5;
      
      // Rotate expanded cube slowly
      interactiveCube.rotation.x += interactiveCube.userData.rotationSpeed.x * 0.5;
      interactiveCube.rotation.y += interactiveCube.userData.rotationSpeed.y * 0.5;
    } else {
      interactiveCube.scale.lerp(interactiveCube.userData.originalScale, 0.05);
      cubeWireframe.material.opacity = 0.3;
      
      // Rotate normal cube
      interactiveCube.rotation.x += interactiveCube.userData.rotationSpeed.x;
      interactiveCube.rotation.y += interactiveCube.userData.rotationSpeed.y;
    }
    
    // Handle pyramid animation based on expanded state
    if (interactivePyramid.userData.isExpanded) {
      interactivePyramid.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.05);
      pyramidWireframe.material.opacity = 0.5;
      
      // Rotate expanded pyramid slowly
      interactivePyramid.rotation.x += interactivePyramid.userData.rotationSpeed.x * 0.5;
      interactivePyramid.rotation.y += interactivePyramid.userData.rotationSpeed.y * 0.5;
    } else {
      interactivePyramid.scale.lerp(interactivePyramid.userData.originalScale, 0.05);
      pyramidWireframe.material.opacity = 0.3;
      
      // Rotate normal pyramid
      interactivePyramid.rotation.x += interactivePyramid.userData.rotationSpeed.x;
      interactivePyramid.rotation.y += interactivePyramid.userData.rotationSpeed.y;
    }
    
    // Handle polyhedral hexagon animation based on expanded state
    if (interactivePolyHex.userData.isExpanded) {
      interactivePolyHex.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.05);
      polyHexWireframe.material.opacity = 0.5;

      // Rotate expanded polyhedral hexagon slowly
      interactivePolyHex.rotation.x += interactivePolyHex.userData.rotationSpeed.x * 0.5;
      interactivePolyHex.rotation.y += interactivePolyHex.userData.rotationSpeed.y * 0.5;
    } else {
      interactivePolyHex.scale.lerp(interactivePolyHex.userData.originalScale, 0.05);
      polyHexWireframe.material.opacity = 0.3;

      // Rotate normal polyhedral hexagon
      interactivePolyHex.rotation.x += interactivePolyHex.userData.rotationSpeed.x;
      interactivePolyHex.rotation.y += interactivePolyHex.userData.rotationSpeed.y;
    }

    // Normal speed for cube particles
    cubeParticles.rotation.y += 0.002;
    cubeParticles.rotation.x += 0.001;
    
    // Normal speed for pyramid particles
    pyramidParticles.rotation.y += 0.002;
    pyramidParticles.rotation.x += 0.001;

    // Normal speed for polyhedral hexagon particles
    polyHexParticles.rotation.y += 0.002;
    polyHexParticles.rotation.x += 0.001;
  }
  
  // Rotate cube particles
  cubeParticles.rotation.y += 0.002;
  
  // Rotate pyramid particles
  pyramidParticles.rotation.y += 0.002;

  // Rotate polyhedral hexagon particles
  polyHexParticles.rotation.y += 0.002;

  nodes.forEach(node => {
    node.position.add(node.velocity);
    const pulse = Math.sin(time * node.pulseSpeed + node.pulseOffset) * 0.2 + 0.8;
    node.scale.set(pulse, pulse, pulse);
    node.material.opacity = 0.5 + pulse * 0.2;
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

  connections.forEach(line => {
    const points = [line.nodeA.position.clone(), line.nodeB.position.clone()];
    line.geometry.setFromPoints(points);
    const currentDistance = line.nodeA.position.distanceTo(line.nodeB.position);
    const ratio = Math.min(line.baseDistance / currentDistance, 2.0);
    line.material.opacity = 0.05 + ratio * 0.15;
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

