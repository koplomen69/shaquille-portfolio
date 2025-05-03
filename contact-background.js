// 3D Mini Ecosystem for Portfolio Background - Enhanced Interactive Version

// Initialize Three.js scene
const scene = new THREE.Scene();
const canvas = document.getElementById('backgroundCanvas');
const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas, 
    antialias: true,
    alpha: true 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

// Mouse position tracking for interactivity
const mouse = new THREE.Vector2();
const targetMouse = new THREE.Vector2();
let mouseSpeed = 0;
let lastMouseX = 0;
let lastMouseY = 0;

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Add a spotlight that follows mouse position
const spotlight = new THREE.SpotLight(0xaaccff, 0.8, 50, Math.PI / 6, 0.5, 1);
spotlight.position.set(0, 0, 30);
scene.add(spotlight);

// Function to determine if we're in dark mode
function isDarkMode() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
}

// Using our color palette: 0x000000, 0x0C1821, 0x1B2A41, 0x324a5f, 0xCCC9DC, 0xFBF5F3

// Particle system (representing skills/technologies) - Enhanced
class ParticleSystem {
    constructor(count) {
        this.particles = new THREE.Group();
        this.count = count;
        this.createParticles();
        scene.add(this.particles);
        
        // Add a trail effect
        this.trails = [];
        this.createTrails(Math.floor(count * 0.2)); // 20% of particles have trails
    }

    createParticles() {
        const geometry = new THREE.SphereGeometry(0.15, 6, 6); // Smaller, less detailed particles
        
        for (let i = 0; i < this.count; i++) {
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(0.7, 0.7, 0.9),
                transparent: true,
                opacity: 0.5,
                shininess: 50
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            // Random position in a sphere - more concentrated
            const radius = 20 + Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
            particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
            particle.position.z = radius * Math.cos(phi);
            
            // Store original position
            particle.userData.originalPosition = particle.position.clone();
            
            // Enhanced movement values
            particle.userData.speed = 0.005 + Math.random() * 0.02;
            particle.userData.amplitude = 0.3 + Math.random() * 0.7;
            particle.userData.phase = Math.random() * Math.PI * 2;
            particle.userData.attractionStrength = 0.005 + Math.random() * 0.01;
            particle.userData.repulsionRadius = 10 + Math.random() * 5;
            
            this.particles.add(particle);
        }
    }
    
    createTrails(count) {
        // Select random particles to have trails
        const particleIndices = [];
        while (particleIndices.length < count) {
            const idx = Math.floor(Math.random() * this.particles.children.length);
            if (!particleIndices.includes(idx)) {
                particleIndices.push(idx);
            }
        }
        
        // Create trail for each selected particle
        particleIndices.forEach(idx => {
            const particle = this.particles.children[idx];
            const trail = this.createTrail(particle);
            this.trails.push(trail);
            scene.add(trail);
        });
    }
    
    createTrail(particle) {
        // Create trail line
        const points = [];
        for (let i = 0; i < 10; i++) {
            points.push(particle.position.clone());
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x88aaff,
            transparent: true,
            opacity: 0.3
        });
        
        const trail = new THREE.Line(geometry, material);
        trail.userData.particle = particle;
        trail.userData.points = points;
        trail.frustumCulled = false;
        
        return trail;
    }

    update(time, delta) {
        this.particles.children.forEach(particle => {
            const { originalPosition, speed, amplitude, phase, attractionStrength, repulsionRadius } = particle.userData;
            
            // Enhanced oscillation with more varied movement
            particle.position.x = originalPosition.x + Math.sin(time * speed * 1.1 + phase) * amplitude;
            particle.position.y = originalPosition.y + Math.cos(time * speed * 0.9 + phase) * amplitude;
            particle.position.z = originalPosition.z + Math.sin(time * speed * 0.7 + phase + Math.PI/3) * amplitude;
            
            // Interactive: attract particles to mouse position
            if (mouseSpeed > 0.05) {
                const mouseVector = new THREE.Vector3(mouse.x * 30, mouse.y * 30, 0);
                const distanceToMouse = particle.position.distanceTo(mouseVector);
                
                if (distanceToMouse < repulsionRadius) {
                    // Push particles away from fast mouse movements
                    const repulsionForce = (1 - distanceToMouse / repulsionRadius) * mouseSpeed * 0.5;
                    const direction = new THREE.Vector3()
                        .subVectors(particle.position, mouseVector)
                        .normalize();
                    
                    particle.position.add(direction.multiplyScalar(repulsionForce));
                }
            } else {
                // Gently pull particles toward mouse on slow movements
                const mouseVector = new THREE.Vector3(mouse.x * 30, mouse.y * 30, 0);
                const distanceToMouse = particle.position.distanceTo(mouseVector);
                
                if (distanceToMouse < 15) {
                    const attractionForce = attractionStrength * (1 - mouseSpeed * 10);
                    const direction = new THREE.Vector3()
                        .subVectors(mouseVector, particle.position)
                        .normalize();
                    
                    particle.position.add(direction.multiplyScalar(attractionForce));
                }
            }
            
            // Add subtle rotation to each particle
            particle.rotation.x += delta * speed * 0.5;
            particle.rotation.y += delta * speed * 0.3;
        });
        
        // Update trails
        this.updateTrails();
    }
    
    updateTrails() {
        this.trails.forEach(trail => {
            const { particle, points } = trail.userData;
            
            // Shift points forward
            points.pop();
            points.unshift(particle.position.clone());
            
            // Update trail geometry
            trail.geometry.setFromPoints(points);
            trail.geometry.attributes.position.needsUpdate = true;
            
            // Fade trail points
            for (let i = 0; i < points.length; i++) {
                const alpha = 1 - i / points.length;
                if (trail.geometry.attributes.color === undefined) {
                    const colors = new Float32Array(points.length * 3);
                    trail.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                }
                
                trail.geometry.attributes.color.setXYZ(i, alpha, alpha, alpha);
            }
            trail.geometry.attributes.color.needsUpdate = true;
        });
    }

    updateColors() {
        const darkMode = isDarkMode();
        this.particles.children.forEach(particle => {
            if (darkMode) {
                particle.material.color.set(0xFBF5F3); // Off-white in dark mode
                particle.material.opacity = 0.6;
                particle.material.emissive = new THREE.Color(0x1B2A41); // Dark navy in dark mode
            } else {
                particle.material.color.set(0x1B2A41); // Dark navy in light mode
                particle.material.opacity = 0.4;
                particle.material.emissive = new THREE.Color(0x324a5f); // Slate blue in light mode
            }
        });
        
        this.trails.forEach(trail => {
            if (darkMode) {
                trail.material.color.set(0xCCC9DC); // Light lavender in dark mode
                trail.material.opacity = 0.3;
            } else {
                trail.material.color.set(0x324a5f); // Slate blue in light mode
                trail.material.opacity = 0.2;
            }
        });
    }
}

// Connection lines - Enhanced
class ConnectionSystem {
    constructor(particleSystem, maxConnections) {
        this.particleSystem = particleSystem;
        this.maxConnections = maxConnections;
        this.connectionLines = new THREE.Group();
        this.connections = [];
        this.createConnections();
        scene.add(this.connectionLines);
        
        // Added for interactive connections
        this.dynamicConnections = [];
        this.maxDynamicConnections = 10;
        this.createDynamicConnections();
    }

    createConnections() {
        const particles = this.particleSystem.particles.children;
        
        for (let i = 0; i < particles.length; i++) {
            // Reduce connections per particle
            const connections = Math.floor(Math.random() * 2) + 1;  // 1-2 connections per particle
            
            for (let j = 0; j < connections && this.connections.length < this.maxConnections; j++) {
                // Connect to nearest particles for more natural network
                let shortestDist = Infinity;
                let closestParticle = null;
                
                for (let k = 0; k < particles.length; k++) {
                    if (k === i) continue;
                    const dist = particles[i].position.distanceTo(particles[k].position);
                    if (dist < shortestDist) {
                        shortestDist = dist;
                        closestParticle = particles[k];
                    }
                }
                
                // Only create connections if particles are close enough
                if (closestParticle && shortestDist < 15) {
                    const source = particles[i];
                    const target = closestParticle;
                    
                    // Create line geometry
                    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
                        source.position,
                        target.position
                    ]);
                    
                    // Create line material - thinner, more subtle
                    const lineMaterial = new THREE.LineBasicMaterial({
                        color: 0x8888ff,
                        transparent: true,
                        opacity: 0.15
                    });
                    
                    const line = new THREE.Line(lineGeometry, lineMaterial);
                    line.userData.source = source;
                    line.userData.target = target;
                    line.userData.maxDist = 15; // Maximum distance before fading
                    
                    this.connectionLines.add(line);
                    this.connections.push(line);
                }
            }
        }
    }
    
    createDynamicConnections() {
        // These connections will form dynamically based on proximity and mouse position
        for (let i = 0; i < this.maxDynamicConnections; i++) {
            const lineGeometry = new THREE.BufferGeometry();
            const lineMaterial = new THREE.LineBasicMaterial({
                color: 0xaaddff,
                transparent: true,
                opacity: 0
            });
            
            const line = new THREE.Line(lineGeometry, lineMaterial);
            line.visible = false;
            
            this.connectionLines.add(line);
            this.dynamicConnections.push(line);
        }
    }

    update() {
        // Update existing connections
        this.connections.forEach(line => {
            const { source, target, maxDist } = line.userData;
            
            // Update line vertices to match particle positions
            const points = [source.position, target.position];
            line.geometry.setFromPoints(points);
            line.geometry.attributes.position.needsUpdate = true;
            
            // Adjust opacity based on distance
            const distance = source.position.distanceTo(target.position);
            line.material.opacity = Math.max(0, 0.3 * (1 - distance / maxDist));
        });
        
        // Update dynamic connections based on mouse position
        this.updateDynamicConnections();
    }
    
    updateDynamicConnections() {
        const mouseVector = new THREE.Vector3(mouse.x * 30, mouse.y * 30, 0);
        const particles = this.particleSystem.particles.children;
        
        // Find closest particles to mouse position
        const closestParticles = [];
        particles.forEach(particle => {
            const dist = particle.position.distanceTo(mouseVector);
            if (dist < 15) {
                closestParticles.push({
                    particle: particle,
                    distance: dist
                });
            }
        });
        
        // Sort by distance
        closestParticles.sort((a, b) => a.distance - b.distance);
        
        // Use up to maxDynamicConnections closest particles
        const selectedParticles = closestParticles.slice(0, this.maxDynamicConnections);
        
        // Update dynamic connections
        this.dynamicConnections.forEach((line, i) => {
            if (i < selectedParticles.length) {
                const particle = selectedParticles[i].particle;
                const points = [mouseVector, particle.position];
                
                line.geometry.setFromPoints(points);
                line.geometry.attributes.position.needsUpdate = true;
                line.visible = true;
                
                // Adjust opacity based on distance and mouse speed
                const opacity = Math.max(0.1, Math.min(0.4, (1 - selectedParticles[i].distance / 15)));
                line.material.opacity = opacity * (1 + mouseSpeed * 3);
            } else {
                line.visible = false;
            }
        });
    }

    updateColors() {
        const darkMode = isDarkMode();
        this.connections.forEach(line => {
            if (darkMode) {
                line.material.color.set(0xCCC9DC); // Light lavender in dark mode
            } else {
                line.material.color.set(0x1B2A41); // Dark navy in light mode
            }
        });
        
        this.dynamicConnections.forEach(line => {
            if (darkMode) {
                line.material.color.set(0xFBF5F3); // Off-white in dark mode
            } else {
                line.material.color.set(0x324a5f); // Slate blue in light mode
            }
        });
    }
}

// Central Structure - Enhanced with more animation
class CentralStructure {
    constructor() {
        this.createStructure();
        scene.add(this.group);
    }

    createStructure() {
        this.group = new THREE.Group();
        
        // Core sphere - with more details
        const coreGeometry = new THREE.IcosahedronGeometry(2, 2);
        const coreMaterial = new THREE.MeshPhongMaterial({
            color: 0x3377ff,
            emissive: 0x112244,
            shininess: 90,
            transparent: true,
            opacity: 0.7
        });
        this.core = new THREE.Mesh(coreGeometry, coreMaterial);
        this.group.add(this.core);
        
        // Inner pulsing light
        const glowGeometry = new THREE.SphereGeometry(1.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x66ccff,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.group.add(this.glow);
        
        // Outer wireframe - more detailed
        const wireGeometry = new THREE.IcosahedronGeometry(2.8, 2);
        const wireMaterial = new THREE.MeshBasicMaterial({
            color: 0x88aaff,
            wireframe: true,
            transparent: true,
            opacity: 0.2
        });
        this.wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
        this.group.add(this.wireframe);
        
        // Add orbiting elements - two rings for more liveliness
        this.satellites = new THREE.Group();
        this.group.add(this.satellites);
        
        // Create two satellite rings with minimal elements
        this.createSatelliteRing(4, 6, new THREE.Vector3(0, 1, 0.5).normalize());
        this.createSatelliteRing(5, 4, new THREE.Vector3(0.7, 0.3, 0).normalize());
    }
    
    createSatelliteRing(radius, count, axis) {
        const ringGroup = new THREE.Group();
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            
            // Create more varied satellites
            let geometry;
            if (i % 3 === 0) {
                geometry = new THREE.TetrahedronGeometry(0.3, 0);
            } else if (i % 3 === 1) {
                geometry = new THREE.OctahedronGeometry(0.25, 0);
            } else {
                geometry = new THREE.SphereGeometry(0.3, 8, 8);
            }
            
            const material = new THREE.MeshPhongMaterial({
                color: 0x44aaff,
                emissive: 0x112233,
                shininess: 70,
                transparent: true,
                opacity: 0.7
            });
            
            const satellite = new THREE.Mesh(geometry, material);
            
            // Position around ring
            satellite.position.set(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );
            
            // Store original position and animation properties
            satellite.userData.angle = angle;
            satellite.userData.radius = radius;
            satellite.userData.speed = 0.2 + Math.random() * 0.3;
            satellite.userData.pulseSpeed = 0.3 + Math.random() * 0.5;
            satellite.userData.orbitRadius = 0.3 + Math.random() * 0.4;
            
            ringGroup.add(satellite);
        }
        
        // Rotate ring to align with provided axis
        ringGroup.lookAt(axis);
        ringGroup.userData.rotationAxis = axis;
        ringGroup.userData.rotationSpeed = 0.2 + Math.random() * 0.3;
        
        this.satellites.add(ringGroup);
    }

    update(time, delta) {
        // Interactive: orient toward mouse
        this.group.rotation.x += (mouse.y * 0.1 - this.group.rotation.x) * delta;
        this.group.rotation.y += (mouse.x * 0.1 - this.group.rotation.y) * delta;
        
        // Core pulsing and rotation - more lively
        const pulseFreq = 0.5;
        const baseScale = 1 + Math.sin(time * pulseFreq) * 0.05;
        this.core.scale.set(baseScale, baseScale, baseScale);
        this.core.rotation.y += delta * 0.1;
        this.core.rotation.z += delta * 0.05;
        
        // Glow pulsing effect - inverted to core for interesting effect
        const glowScale = 1 + Math.sin(time * pulseFreq + Math.PI) * 0.2;
        this.glow.scale.set(glowScale, glowScale, glowScale);
        this.glow.material.opacity = 0.1 + Math.abs(Math.sin(time * pulseFreq)) * 0.15;
        
        // Wireframe breathes and rotates independently
        const wireScale = 1 + Math.sin(time * pulseFreq * 0.7 + Math.PI/2) * 0.08;
        this.wireframe.scale.set(wireScale, wireScale, wireScale);
        this.wireframe.rotation.y -= delta * 0.07;
        this.wireframe.rotation.x += delta * 0.05;
        
        // Animate satellites - more varied movement
        this.satellites.children.forEach(ring => {
            // Rotate each ring with its own speed but also respond to mouse movement
            const rotationSpeedModifier = 1 + mouseSpeed * 3;
            ring.rotation.z += delta * ring.userData.rotationSpeed * rotationSpeedModifier;
            
            // Add a bit of wobble to the ring
            ring.rotation.x = Math.sin(time * 0.3) * 0.05;
            
            // Animate individual satellites - more varied movements
            ring.children.forEach(satellite => {
                const { speed, pulseSpeed, orbitRadius } = satellite.userData;
                
                // More pronounced pulsate satellite size
                const satScale = 1 + 0.2 * Math.sin(time * pulseSpeed);
                satellite.scale.set(satScale, satScale, satScale);
                
                // More complex orbit pattern
                const radius = satellite.userData.radius;
                const angle = satellite.userData.angle + time * speed;
                
                // Add more pronounced vertical oscillation
                const verticalOffset = Math.sin(time * pulseSpeed + angle) * orbitRadius;
                // Add a secondary horizontal oscillation
                const horizontalOffset = Math.cos(time * pulseSpeed * 0.7 + angle) * orbitRadius * 0.5;
                
                satellite.position.set(
                    Math.cos(angle) * radius + horizontalOffset,
                    Math.sin(angle) * radius + verticalOffset,
                    satellite.position.z
                );
                
                // Rotate the satellites themselves
                satellite.rotation.x += delta * speed * 0.5;
                satellite.rotation.y += delta * speed * 0.7;
                
                // Make satellites glow when near mouse
                const mouseVector = new THREE.Vector3(mouse.x * 30, mouse.y * 30, 0);
                const worldPos = new THREE.Vector3();
                satellite.getWorldPosition(worldPos);
                const distToMouse = worldPos.distanceTo(mouseVector);
                
                if (distToMouse < 5) {
                    const intensity = 1 - distToMouse / 5;
                    satellite.material.emissive.setRGB(
                        0.1 + intensity * 0.2,
                        0.2 + intensity * 0.3,
                        0.4 + intensity * 0.5
                    );
                    satellite.material.opacity = 0.7 + intensity * 0.3;
                } else {
                    satellite.material.emissive.set(0x112233);
                    satellite.material.opacity = 0.7;
                }
            });
        });
    }
    
    updateColors() {
        const darkMode = isDarkMode();
        if (darkMode) {
            this.core.material.color.set(0xFBF5F3); // Off-white in dark mode
            this.core.material.emissive.set(0x1B2A41); // Dark navy in dark mode
            this.wireframe.material.color.set(0xCCC9DC); // Light lavender in dark mode
            this.glow.material.color.set(0xFBF5F3); // Off-white in dark mode
            
            // Update satellites color for dark mode
            this.satellites.children.forEach(ring => {
                ring.children.forEach(satellite => {
                    satellite.material.color.set(0xFBF5F3); // Off-white in dark mode
                    satellite.material.emissive.set(0x324a5f); // Slate blue in dark mode
                });
            });
        } else {
            this.core.material.color.set(0x0C1821); // Very dark blue in light mode
            this.core.material.emissive.set(0x324a5f); // Slate blue in light mode
            this.wireframe.material.color.set(0x1B2A41); // Dark navy in light mode
            this.glow.material.color.set(0x324a5f); // Slate blue in light mode
            
            // Update satellites color for light mode
            this.satellites.children.forEach(ring => {
                ring.children.forEach(satellite => {
                    satellite.material.color.set(0x1B2A41); // Dark navy in light mode
                    satellite.material.emissive.set(0x324a5f); // Slate blue in light mode
                });
            });
        }
    }
}

// New class for interactive flying polyhedrons
class FlyingPolyObjects {
    constructor(count) {
        this.objects = new THREE.Group();
        this.count = count;
        this.polyObjects = [];
        this.createObjects();
        scene.add(this.objects);
    }
    
    createObjects() {
        // Different types of polyhedron geometries
        const geometryTypes = [
            new THREE.TetrahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.DodecahedronGeometry(1, 0),
            new THREE.IcosahedronGeometry(1, 0)
        ];

        for (let i = 0; i < this.count; i++) {
            // Randomly select a geometry type
            const geometryType = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
            
            // Create a clone of the geometry to avoid reference issues
            const geometry = geometryType.clone();
            
            // Create unique material with random color tint
            const hue = Math.random();
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color().setHSL(hue, 0.6, 0.7),
                shininess: 70,
                transparent: true,
                opacity: 0.7,
                side: THREE.DoubleSide,
                flatShading: true
            });
            
            const polyObj = new THREE.Mesh(geometry, material);
            
            // Set random position in a wider area
            const distance = 15 + Math.random() * 25;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            polyObj.position.x = distance * Math.sin(phi) * Math.cos(theta);
            polyObj.position.y = distance * Math.sin(phi) * Math.sin(theta);
            polyObj.position.z = distance * Math.cos(phi);
            
            // Random scale
            const scale = 0.3 + Math.random() * 0.3;
            polyObj.scale.set(scale, scale, scale);
            
            // Set random rotation
            polyObj.rotation.x = Math.random() * Math.PI * 2;
            polyObj.rotation.y = Math.random() * Math.PI * 2;
            polyObj.rotation.z = Math.random() * Math.PI * 2;
            
            // Flight properties
            polyObj.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.05,
                    (Math.random() - 0.5) * 0.05
                ),
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.02
                },
                interacted: false,
                clickTime: 0,
                originalColor: material.color.clone(),
                hue: hue,
                mass: 1 + Math.random() * 2 // For physics interactions
            };
            
            // Add glow effect to some objects
            if (Math.random() > 0.7) {
                this.addGlowEffect(polyObj);
            }
            
            this.objects.add(polyObj);
            this.polyObjects.push(polyObj);
        }
    }
    
    addGlowEffect(polyObj) {
        // Create a slightly larger clone with emissive material for glow effect
        const glowGeometry = polyObj.geometry.clone();
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: polyObj.material.color.clone().multiplyScalar(1.5),
            transparent: true,
            opacity: 0.4,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.scale.multiplyScalar(1.1);
        polyObj.add(glowMesh);
        polyObj.userData.glowMesh = glowMesh;
        polyObj.userData.hasGlow = true;
    }
    
    update(time, delta) {
        this.polyObjects.forEach(obj => {
            // Move according to velocity
            obj.position.add(obj.userData.velocity.clone().multiplyScalar(delta * 60));
            
            // Rotate object
            obj.rotation.x += obj.userData.rotationSpeed.x * delta * 60;
            obj.rotation.y += obj.userData.rotationSpeed.y * delta * 60;
            obj.rotation.z += obj.userData.rotationSpeed.z * delta * 60;
            
            // Boundaries check - wrap around if too far
            const maxDist = 40;
            if (obj.position.length() > maxDist) {
                // Reset position to opposite side but closer to center
                obj.position.negate().multiplyScalar(0.7);
                
                // Small change in trajectory
                obj.userData.velocity.x += (Math.random() - 0.5) * 0.01;
                obj.userData.velocity.y += (Math.random() - 0.5) * 0.01;
                obj.userData.velocity.z += (Math.random() - 0.5) * 0.01;
                
                // Normalize velocity to maintain consistent speed
                obj.userData.velocity.normalize().multiplyScalar(0.05 * Math.random() + 0.02);
            }
            
            // Mouse interaction - repulsion or attraction
            const mouseVector = new THREE.Vector3(mouse.x * 30, mouse.y * 30, 0);
            const distanceToMouse = obj.position.distanceTo(mouseVector);
            
            if (distanceToMouse < 8) {
                // Direction vector from mouse to object
                const repelDir = new THREE.Vector3().subVectors(obj.position, mouseVector).normalize();
                
                // Strength based on distance and mouse speed
                const strength = (1 - distanceToMouse / 8) * 0.003 * (1 + mouseSpeed * 10);
                
                // Apply force
                obj.userData.velocity.add(repelDir.multiplyScalar(strength / obj.userData.mass));
                
                // Highlight object when mouse is near
                obj.material.emissive = new THREE.Color().setHSL(
                    obj.userData.hue,
                    0.8,
                    0.2 + (1 - distanceToMouse / 8) * 0.3
                );
            } else {
                // Reset emissive when mouse is far away
                obj.material.emissive.set(0x000000);
            }
            
            // Limit maximum velocity
            const maxVel = 0.2;
            if (obj.userData.velocity.length() > maxVel) {
                obj.userData.velocity.normalize().multiplyScalar(maxVel);
            }
            
            // Apply slight drag to slow objects down over time
            obj.userData.velocity.multiplyScalar(0.99);
            
            // Animation for clicked objects
            if (obj.userData.interacted) {
                const timeSinceClick = time - obj.userData.clickTime;
                
                if (timeSinceClick < 2) {
                    // Pulse effect
                    const pulseScale = 1 + Math.sin(timeSinceClick * Math.PI * 2) * 0.1;
                    obj.scale.setScalar(obj.userData.baseScale * pulseScale);
                    
                    // Color animation
                    const colorPhase = (timeSinceClick * 2) % 1;
                    obj.material.color.setHSL((obj.userData.hue + colorPhase) % 1, 0.8, 0.7);
                    
                    // Glow animation if object has glow
                    if (obj.userData.hasGlow) {
                        obj.userData.glowMesh.material.opacity = 0.4 + Math.sin(timeSinceClick * Math.PI * 4) * 0.2;
                        obj.userData.glowMesh.scale.setScalar(1.1 + Math.sin(timeSinceClick * Math.PI * 2) * 0.1);
                        obj.userData.glowMesh.material.color.setHSL((obj.userData.hue + colorPhase) % 1, 0.9, 0.8);
                    }
                } else if (timeSinceClick < 3) {
                    // Fade back to normal
                    const t = (timeSinceClick - 2);
                    obj.scale.setScalar(obj.userData.baseScale);
                    obj.material.color.lerp(obj.userData.originalColor, t);
                    
                    if (obj.userData.hasGlow) {
                        obj.userData.glowMesh.material.opacity = 0.4;
                        obj.userData.glowMesh.scale.setScalar(1.1);
                        obj.userData.glowMesh.material.color.lerp(
                            obj.userData.originalColor.clone().multiplyScalar(1.5), t
                        );
                    }
                } else {
                    // Reset interaction state
                    obj.userData.interacted = false;
                }
            }
        });
    }
    
    objectClicked(raycaster) {
        const intersects = raycaster.intersectObjects(this.polyObjects);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            
            // Store current scale before animation
            clickedObject.userData.baseScale = clickedObject.scale.x;
            clickedObject.userData.interacted = true;
            clickedObject.userData.clickTime = clock.getElapsedTime();
            
            // Apply impulse in random direction
            const impulse = new THREE.Vector3(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            );
            
            clickedObject.userData.velocity.add(impulse);
            
            return true;
        }
        
        return false;
    }
    
    updateColors() {
        const darkMode = isDarkMode();
        
        this.polyObjects.forEach(obj => {
            if (darkMode) {
                // Use our color palette in dark mode
                obj.material.color.set(0xCCC9DC); // Light lavender in dark mode
            } else {
                // Use our color palette in light mode
                obj.material.color.set(0x1B2A41); // Dark navy in light mode
            }
            
            // Store updated original color
            obj.userData.originalColor = obj.material.color.clone();
            
            // Update glow if present
            if (obj.userData.hasGlow) {
                if (darkMode) {
                    obj.userData.glowMesh.material.color = new THREE.Color(0xFBF5F3); // Off-white in dark mode
                } else {
                    obj.userData.glowMesh.material.color = new THREE.Color(0x324a5f); // Slate blue in light mode
                }
            }
        });
    }
}

// Create ecosystem elements - adjusted for more dynamic feel
const particleSystem = new ParticleSystem(60); // Slightly more particles for liveliness
const connectionSystem = new ConnectionSystem(particleSystem, 50); // More connections
const centralStructure = new CentralStructure(); // Enhanced central structure
const flyingPolyObjects = new FlyingPolyObjects(15); // New flying polyhedron objects

// Setup raycaster for object interaction
const raycaster = new THREE.Raycaster();

// Event listeners for interactivity
window.addEventListener('mousemove', (event) => {
    // Convert mouse position to normalized device coordinates
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Calculate mouse speed
    const dx = event.clientX - lastMouseX;
    const dy = event.clientY - lastMouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    mouseSpeed = Math.min(1, distance / 30);
    
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    
    // Update spotlight position
    spotlight.target.position.set(targetMouse.x * 30, targetMouse.y * 30, 0);
    spotlight.target.updateMatrixWorld();
});

// Enhanced Mouse click effect - creates a ripple or interacts with objects
canvas.addEventListener('click', (event) => {
    // Update raycaster with mouse position
    raycaster.setFromCamera(new THREE.Vector2(targetMouse.x, targetMouse.y), camera);
    
    // Check if we clicked on a poly object
    if (!flyingPolyObjects.objectClicked(raycaster)) {
        // If not, create a ripple effect
        createRippleEffect(event.clientX, event.clientY);
    }
});

// Create a ripple effect at the click position
function createRippleEffect(x, y) {
    // Convert screen position to 3D position
    const clickX = (x / window.innerWidth) * 2 - 1;
    const clickY = -(y / window.innerHeight) * 2 + 1;
    const clickPos = new THREE.Vector3(clickX * 30, clickY * 30, 0);
    
    // Create ripple ring
    const ringGeometry = new THREE.RingGeometry(0.1, 0.3, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: isDarkMode() ? 0xFBF5F3 : 0x1B2A41,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(clickPos);
    ring.lookAt(camera.position);
    
    ring.userData.creationTime = clock.getElapsedTime();
    ring.userData.duration = 1.2; // 1.2 seconds animation
    ring.userData.maxSize = 10;
    
    scene.add(ring);
    
    // Add to animation list
    ripples.push(ring);
}

// Array to store active ripples
const ripples = [];

// Function to update ripples
function updateRipples(time) {
    for (let i = ripples.length - 1; i >= 0; i--) {
        const ring = ripples[i];
        const age = time - ring.userData.creationTime;
        
        if (age > ring.userData.duration) {
            // Remove old ripples
            scene.remove(ring);
            ripples.splice(i, 1);
            continue;
        }
        
        // Expand and fade out
        const progress = age / ring.userData.duration;
        const scale = progress * ring.userData.maxSize;
        ring.scale.set(scale, scale, scale);
        ring.material.opacity = 0.8 * (1 - progress);
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Listen for theme changes
document.addEventListener('DOMContentLoaded', () => {
    updateEcosystemColors();
    
    // Listen for clicks on the theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        setTimeout(updateEcosystemColors, 50); // Small delay to ensure theme has changed
    });
});

function updateEcosystemColors() {
    particleSystem.updateColors();
    connectionSystem.updateColors();
    centralStructure.updateColors();
    flyingPolyObjects.updateColors(); // Update colors of flying objects
    
    // Update spotlight color
    spotlight.color.set(isDarkMode() ? 0xFBF5F3 : 0x324a5f);
}

// Smooth mouse movement
function updateMousePosition() {
    mouse.x += (targetMouse.x - mouse.x) * 0.1;
    mouse.y += (targetMouse.y - mouse.y) * 0.1;
    
    // Slowly reduce mouse speed
    mouseSpeed *= 0.95;
    
    // Update spotlight position to follow mouse smoothly
    spotlight.position.set(mouse.x * 10, mouse.y * 10, 30);
}

// Animation loop - enhanced for smoother transitions
let clock = new THREE.Clock();
let lastTime = 0;
function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    const delta = Math.min(0.1, time - lastTime); // Limit delta to avoid jumps
    lastTime = time;
    
    // Update mouse position with smooth interpolation
    updateMousePosition();
    
    // Update all components with delta time for smoother animations
    particleSystem.update(time, delta);
    connectionSystem.update();
    centralStructure.update(time, delta);
    flyingPolyObjects.update(time, delta); // Update flying poly objects
    updateRipples(time);
    
    // Rotate entire scene very slowly for subtle movement
    scene.rotation.y += delta * 0.01; // Slower base rotation for more subtlety
    
    // Add a gentle camera motion
    camera.position.x = Math.sin(time * 0.1) * 1.5;
    camera.position.y = Math.cos(time * 0.15) * 1.0;
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
}

animate();
