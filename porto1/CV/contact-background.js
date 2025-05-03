// Initialize the 3D scene for contact page
const canvas = document.getElementById('backgroundCanvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add subtle ambient lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// Create particles system
const particlesCount = 500;
const particles = new THREE.BufferGeometry();
const particleMaterial = new THREE.PointsMaterial({
  color: 0x3498db,
  size: 0.4,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

// Create particle positions with z-depth for better 3D effect
const particlePositions = new Float32Array(particlesCount * 3);
const particleVelocities = [];

for (let i = 0; i < particlesCount; i++) {
  const i3 = i * 3;
  // Create a grid-like formation for particles
  particlePositions[i3] = (Math.random() - 0.5) * 50;
  particlePositions[i3 + 1] = (Math.random() - 0.5) * 50;
  particlePositions[i3 + 2] = (Math.random() - 0.5) * 30;
  
  // Store velocity for animation
  particleVelocities.push({
    x: (Math.random() - 0.5) * 0.05,
    y: (Math.random() - 0.5) * 0.05,
    z: (Math.random() - 0.5) * 0.05
  });
}

particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Set camera position
camera.position.z = 30;

// Mouse position tracking for interactivity
const mouse = { x: 0, y: 0 };
document.addEventListener('mousemove', (event) => {
  // Convert mouse position to normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Subtle camera movement
  camera.position.x += (mouse.x * 5 - camera.position.x) * 0.03;
  camera.position.y += (mouse.y * 5 - camera.position.y) * 0.03;
  camera.lookAt(scene.position);
});

// Create connection lines between nearby particles
function createConnectionLines() {
  // Remove old lines
  scene.children.forEach(child => {
    if (child.isLine) scene.remove(child);
  });
  
  // Get current positions
  const positions = particles.attributes.position.array;
  
  // Check distances and create lines
  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    const p1 = {
      x: positions[i3],
      y: positions[i3 + 1],
      z: positions[i3 + 2]
    };
    
    for (let j = i + 1; j < particlesCount; j++) {
      const j3 = j * 3;
      const p2 = {
        x: positions[j3],
        y: positions[j3 + 1],
        z: positions[j3 + 2]
      };
      
      // Calculate distance
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      const dz = p1.z - p2.z;
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
      
      // Connect nearby particles
      if (distance < 5) {
        // Calculate opacity based on distance
        const opacity = 1 - distance / 5;
        
        // Create line
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = new Float32Array([
          p1.x, p1.y, p1.z,
          p2.x, p2.y, p2.z
        ]);
        lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0x3498db,
          transparent: true,
          opacity: opacity * 0.15
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        line.isLine = true; // Mark as line for easy removal
        scene.add(line);
      }
    }
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update particle positions
  const positions = particles.attributes.position.array;
  
  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    
    // Move particles
    positions[i3] += particleVelocities[i].x;
    positions[i3 + 1] += particleVelocities[i].y;
    positions[i3 + 2] += particleVelocities[i].z;
    
    // Boundary check
    if (Math.abs(positions[i3]) > 25) particleVelocities[i].x *= -1;
    if (Math.abs(positions[i3 + 1]) > 25) particleVelocities[i].y *= -1;
    if (Math.abs(positions[i3 + 2]) > 15) particleVelocities[i].z *= -1;
  }
  
  particles.attributes.position.needsUpdate = true;
  
  // Update connection lines every 10 frames to improve performance
  if (Math.floor(Math.random() * 10) === 0) {
    createConnectionLines();
  }
  
  // Rotate particle system very subtly
  particleSystem.rotation.y += 0.0005;
  
  renderer.render(scene, camera);
}

// Start animation
animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add touch support for mobile
document.addEventListener('touchmove', (event) => {
  if (event.touches.length > 0) {
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  }
}, { passive: true });
