// 3D Background Animation using Three.js with Interactive Polygonal Shape

class ThreeBackground {
  constructor() {
    // Check for mobile devices and reduced motion preference
    this.isMobile = window.innerWidth <= 768;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (this.prefersReducedMotion) {
      console.log('Reduced motion preferred, skipping 3D background');
      return;
    }

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.canvas = null;
    this.objects = [];
    this.geometricShapes = null;
    this.mouse = { x: 0, y: 0 };
    this.windowHalf = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.colors = {
      primary: 0x6366f1,
      secondary: 0xf59e0b,
      accent: 0x10b981,
      white: 0xffffff,
      dark: 0x1f2937,
      polygon: 0x8b5cf6
    };
    this.isDarkMode = false;
    
    this.init();
  }

  init() {
    this.canvas = document.getElementById('three-canvas');
    if (!this.canvas) return;

    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.createObjects();
    this.setupEventListeners();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0xffffff, 1, 1000);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    this.camera.position.z = 500;
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
  }

  setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(200, 200, 200);
    this.scene.add(directionalLight);

    // Point light
    const pointLight = new THREE.PointLight(this.colors.primary, 1, 500);
    pointLight.position.set(0, 0, 0);
    this.scene.add(pointLight);
  }

  createObjects() {
    // Create floating geometric shapes
    this.createFloatingShapes();
    this.createParticleSystem();
    this.createWaveform();
    // Create interactive polygonal shape
    this.createInteractivePolygon();
  }

  createFloatingShapes() {
    const geometries = [
      new THREE.BoxGeometry(20, 20, 20),
      new THREE.SphereGeometry(12, 16, 16),
      new THREE.ConeGeometry(12, 25, 8),
      new THREE.OctahedronGeometry(15),
      new THREE.TetrahedronGeometry(18),
      new THREE.DodecahedronGeometry(14)
    ];

    const materials = [
      new THREE.MeshPhongMaterial({ 
        color: this.colors.primary, 
        transparent: true, 
        opacity: 0.2,  // Reduced from 0.7
        wireframe: false
      }),
      new THREE.MeshPhongMaterial({ 
        color: this.colors.secondary, 
        transparent: true, 
        opacity: 0.15,  // Reduced from 0.6
        wireframe: true
      }),
      new THREE.MeshPhongMaterial({ 
        color: this.colors.accent, 
        transparent: true, 
        opacity: 0.25,  // Reduced from 0.8
        wireframe: false
      })
    ];

    // Reduce object count on mobile for performance
    const objectCount = this.isMobile ? 8 : 15;
    
    // Create floating shapes
    for (let i = 0; i < objectCount; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = materials[Math.floor(Math.random() * materials.length)].clone();
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Random position
      mesh.position.x = (Math.random() - 0.5) * 1000;
      mesh.position.y = (Math.random() - 0.5) * 600;
      mesh.position.z = (Math.random() - 0.5) * 800;
      
      // Random rotation
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.rotation.z = Math.random() * Math.PI;
      
      // Random scale
      const scale = Math.random() * 0.5 + 0.5;
      mesh.scale.set(scale, scale, scale);
      
      // Store animation properties
      mesh.userData = {
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.01 + 0.005,
        floatRange: Math.random() * 50 + 25,
        originalY: mesh.position.y
      };
      
      this.objects.push(mesh);
      this.scene.add(mesh);
    }
  }

  createParticleSystem() {
    // Reduce particle count on mobile
    const particleCount = this.isMobile ? 50 : 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 2000;
      positions[i3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i3 + 2] = (Math.random() - 0.5) * 1000;
      
      // Color
      const color = new THREE.Color();
      if (Math.random() > 0.5) {
        color.setHex(this.colors.primary);
      } else {
        color.setHex(this.colors.accent);
      }
      
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: this.isMobile ? 2 : 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.2,  // Reduced from 0.6
      sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.userData = {
      rotationSpeed: 0.001
    };
    
    this.objects.push(particleSystem);
    this.scene.add(particleSystem);
  }

  createWaveform() {
    const geometry = new THREE.PlaneGeometry(800, 600, 50, 50);
    const material = new THREE.MeshPhongMaterial({
      color: this.colors.primary,
      transparent: true,
      opacity: 0.1,
      wireframe: true,
      side: THREE.DoubleSide
    });

    const wave = new THREE.Mesh(geometry, material);
    wave.position.z = -400;
    wave.rotation.x = -Math.PI / 6;
    
    wave.userData = {
      originalVertices: [...geometry.attributes.position.array],
      time: 0
    };
    
    this.objects.push(wave);
    this.scene.add(wave);
  }

  createInteractivePolygon() {
    // Create animated geometric pattern background instead of single polygon
    this.createAnimatedGeometricBackground();
  }

  createAnimatedGeometricBackground() {
    // Create multiple geometric shapes forming a pattern
    const shapes = [];
    const geometries = [
      new THREE.BoxGeometry(20, 20, 20),
      new THREE.OctahedronGeometry(15),
      new THREE.TetrahedronGeometry(12),
      new THREE.DodecahedronGeometry(10),
    ];

    // Create a grid-like pattern of shapes
    for (let x = -400; x <= 400; x += 200) {
      for (let y = -200; y <= 200; y += 200) {
        for (let z = -300; z <= -100; z += 100) {
          if (Math.random() > 0.7) { // Sparse pattern
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshPhongMaterial({
              color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
              transparent: true,
              opacity: 0.1,
              wireframe: Math.random() > 0.5
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(
              x + (Math.random() - 0.5) * 100,
              y + (Math.random() - 0.5) * 100,
              z + (Math.random() - 0.5) * 50
            );

            // Random rotation
            mesh.rotation.set(
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI
            );

            // Animation properties
            mesh.userData = {
              rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
              },
              floatSpeed: Math.random() * 0.5 + 0.3,
              floatRange: Math.random() * 20 + 10,
              originalY: mesh.position.y,
              originalColor: mesh.material.color.clone(),
              originalOpacity: mesh.material.opacity
            };

            shapes.push(mesh);
            this.objects.push(mesh);
            this.scene.add(mesh);
          }
        }
      }
    }

    this.geometricShapes = shapes;

    // Create flowing particle streams
    this.createParticleStreams();
  }

  createParticleStreams() {
    // Create flowing particle streams across the background
    const streamCount = 5;
    
    for (let i = 0; i < streamCount; i++) {
      const particleCount = 50;
      const particles = new Float32Array(particleCount * 3);
      
      for (let j = 0; j < particleCount; j++) {
        particles[j * 3] = (Math.random() - 0.5) * 1000;
        particles[j * 3 + 1] = (Math.random() - 0.5) * 600;
        particles[j * 3 + 2] = (Math.random() - 0.5) * 500;
      }
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));
      
      const material = new THREE.PointsMaterial({
        color: new THREE.Color().setHSL(i * 0.2, 0.8, 0.6),
        size: 2,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      
      const stream = new THREE.Points(geometry, material);
      
      stream.userData = {
        speed: Math.random() * 0.5 + 0.3,
        direction: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          Math.random() + 0.5
        ).normalize()
      };
      
      this.objects.push(stream);
      this.scene.add(stream);
    }
  }

  setupEventListeners() {
    // Mouse move for parallax effect
    document.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX - this.windowHalf.x) / this.windowHalf.x;
      this.mouse.y = (event.clientY - this.windowHalf.y) / this.windowHalf.y;
    });

    // Window resize
    window.addEventListener('resize', () => {
      this.onWindowResize();
    });

    // Theme change detection
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          this.updateTheme();
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Scroll parallax effect
    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;
      this.camera.position.y = scrollY * 0.1;
    });
  }

  updateTheme() {
    this.isDarkMode = document.body.classList.contains('dark-mode');
    
    // Update fog color
    const fogColor = this.isDarkMode ? 0x111827 : 0xffffff;
    this.scene.fog.color.setHex(fogColor);
    
    // Update object materials based on theme
    this.objects.forEach(obj => {
      if (obj.material) {
        if (obj.material.type === 'PointsMaterial') {
          obj.material.opacity = this.isDarkMode ? 0.25 : 0.2;  // Reduced values
        } else if (obj.material.wireframe) {
          obj.material.opacity = this.isDarkMode ? 0.2 : 0.15;  // Reduced values
        } else {
          obj.material.opacity = this.isDarkMode ? 0.3 : 0.25;  // Reduced values
        }
      }
    });

    // Update interactive polygon for theme
    if (this.geometricShapes) {
      this.geometricShapes.forEach(shape => {
        shape.material.opacity = this.isDarkMode ? 0.15 : 0.1;
      });
    }
  }

  onWindowResize() {
    this.windowHalf.x = window.innerWidth / 2;
    this.windowHalf.y = window.innerHeight / 2;
    
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.render();
  }

  render() {
    const time = Date.now() * 0.001;
    
    // Update geometric background
    this.updateInteractivePolygon();
    
    // Animate floating shapes
    this.objects.forEach((obj, index) => {
      if (obj.userData.rotationSpeed) {
        obj.rotation.x += obj.userData.rotationSpeed.x;
        obj.rotation.y += obj.userData.rotationSpeed.y;
        obj.rotation.z += obj.userData.rotationSpeed.z;
      }
      
      if (obj.userData.floatSpeed) {
        obj.position.y = obj.userData.originalY + 
          Math.sin(time * obj.userData.floatSpeed) * obj.userData.floatRange;
      }
      
      // Particle system rotation
      if (obj.userData.rotationSpeed && obj.type === 'Points') {
        obj.rotation.y += obj.userData.rotationSpeed;
      }
      
      // Wave animation
      if (obj.userData.originalVertices) {
        obj.userData.time += 0.02;
        const positions = obj.geometry.attributes.position.array;
        const originalVertices = obj.userData.originalVertices;
        
        for (let i = 0; i < positions.length; i += 3) {
          const x = originalVertices[i];
          const y = originalVertices[i + 1];
          
          positions[i + 2] = originalVertices[i + 2] + 
            Math.sin((x * 0.01) + (obj.userData.time)) * 20 +
            Math.sin((y * 0.01) + (obj.userData.time * 0.7)) * 15;
        }
        
        obj.geometry.attributes.position.needsUpdate = true;
      }
    });
    
    // Camera parallax based on mouse movement
    this.camera.position.x += (this.mouse.x * 50 - this.camera.position.x) * 0.05;
    this.camera.position.y += (-this.mouse.y * 50 - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.scene.position);
    
    this.renderer.render(this.scene, this.camera);
  }

  updateInteractivePolygon() {
    if (!this.geometricShapes) return;

    const time = Date.now() * 0.001;

    // Update geometric shapes
    this.geometricShapes.forEach((shape, index) => {
      // Rotation animation
      shape.rotation.x += shape.userData.rotationSpeed.x;
      shape.rotation.y += shape.userData.rotationSpeed.y;
      shape.rotation.z += shape.userData.rotationSpeed.z;

      // Floating animation
      shape.position.y = shape.userData.originalY + 
        Math.sin(time * shape.userData.floatSpeed + index) * shape.userData.floatRange;

      // Color cycling
      const hue = (time * 0.1 + index * 0.1) % 1;
      shape.material.color.setHSL(hue, 0.7, 0.6);

      // Subtle opacity animation
      shape.material.opacity = shape.userData.originalOpacity + 
        Math.sin(time * 0.5 + index) * 0.05;
    });

    // Update particle streams
    this.objects.forEach(obj => {
      if (obj.type === 'Points' && obj.userData.direction) {
        const positions = obj.geometry.attributes.position.array;
        const direction = obj.userData.direction;
        const speed = obj.userData.speed;

        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += direction.x * speed;
          positions[i + 1] += direction.y * speed;
          positions[i + 2] += direction.z * speed;

          // Reset particles that go too far
          if (positions[i + 2] > 300) {
            positions[i] = (Math.random() - 0.5) * 1000;
            positions[i + 1] = (Math.random() - 0.5) * 600;
            positions[i + 2] = -300;
          }
        }
        
        obj.geometry.attributes.position.needsUpdate = true;

        // Color animation for particles
        const hue = (time * 0.2) % 1;
        obj.material.color.setHSL(hue, 0.8, 0.6);
      }
    });
  }

  // Public method to add custom objects
  addCustomObject(mesh) {
    this.objects.push(mesh);
    this.scene.add(mesh);
  }

  // Public method to remove objects
  removeObject(mesh) {
    const index = this.objects.indexOf(mesh);
    if (index > -1) {
      this.objects.splice(index, 1);
      this.scene.remove(mesh);
    }
  }

  // Cleanup method
  destroy() {
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);
    
    // Dispose of geometries and materials
    this.objects.forEach(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(material => material.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    
    // Clear scene
    this.scene.clear();
    
    // Dispose renderer
    this.renderer.dispose();
  }
}

// Initialize 3D background when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check WebGL support
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // Wait a bit for other scripts to load
  setTimeout(() => {
    if (typeof THREE !== 'undefined' && isWebGLAvailable()) {
      try {
        window.threeBackground = new ThreeBackground();
      } catch (error) {
        console.warn('Failed to initialize 3D background:', error);
        // Add fallback CSS animation
        addFallbackAnimation();
      }
    } else {
      console.warn('Three.js not available or WebGL not supported, using fallback');
      addFallbackAnimation();
    }
  }, 500);

  // Fallback CSS animation for devices without WebGL support
  function addFallbackAnimation() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const fallbackBg = document.createElement('div');
    fallbackBg.className = 'fallback-bg';
    fallbackBg.innerHTML = `
      <div class="fallback-shape fallback-shape-1"></div>
      <div class="fallback-shape fallback-shape-2"></div>
      <div class="fallback-shape fallback-shape-3"></div>
      <div class="fallback-shape fallback-shape-4"></div>
      <div class="fallback-shape fallback-shape-5"></div>
    `;

    const styles = `
      .fallback-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        pointer-events: none;
        overflow: hidden;
      }
      
      .fallback-shape {
        position: absolute;
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(245, 158, 11, 0.1));
        filter: blur(2px);
      }
      
      .fallback-shape-1 {
        width: 100px;
        height: 100px;
        top: 20%;
        left: 10%;
        animation: fallbackFloat1 8s ease-in-out infinite;
      }
      
      .fallback-shape-2 {
        width: 80px;
        height: 80px;
        top: 60%;
        right: 20%;
        animation: fallbackFloat2 6s ease-in-out infinite;
      }
      
      .fallback-shape-3 {
        width: 60px;
        height: 60px;
        bottom: 30%;
        left: 20%;
        animation: fallbackFloat3 7s ease-in-out infinite;
      }
      
      .fallback-shape-4 {
        width: 120px;
        height: 120px;
        top: 30%;
        right: 10%;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(99, 102, 241, 0.1));
        animation: fallbackFloat4 9s ease-in-out infinite;
      }
      
      .fallback-shape-5 {
        width: 70px;
        height: 70px;
        top: 70%;
        left: 60%;
        animation: fallbackFloat5 5s ease-in-out infinite;
      }
      
      @keyframes fallbackFloat1 {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        33% { transform: translate(30px, -30px) rotate(120deg); }
        66% { transform: translate(-20px, 20px) rotate(240deg); }
      }
      
      @keyframes fallbackFloat2 {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        50% { transform: translate(-40px, -20px) rotate(180deg); }
      }
      
      @keyframes fallbackFloat3 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(25px, -25px) scale(1.2); }
      }
      
      @keyframes fallbackFloat4 {
        0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.1; }
        25% { transform: translate(20px, 20px) rotate(90deg); opacity: 0.2; }
        75% { transform: translate(-20px, -20px) rotate(270deg); opacity: 0.15; }
      }
      
      @keyframes fallbackFloat5 {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(-15px, -15px); }
        75% { transform: translate(15px, 15px); }
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    heroSection.appendChild(fallbackBg);
  }
});

// Export for potential use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThreeBackground;
}
