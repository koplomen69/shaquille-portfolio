// 3D Solar System Animation with Mathematical & Polygeometrical Elements

let scene, camera, renderer, stars = [];
let planets = [], orbits = [], mathObjects = [];
let isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || document.body.classList.contains('dark-mode');
let raycaster, mouse, selectedObject = null, hoveredObject = null;
let controls; // For orbit controls

// Get theme colors from CSS variables
function getThemeColors() {
    const getColor = (varName) => {
        const color = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        return color.startsWith('#') ? parseInt(color.substring(1), 16) : 0x000000;
    };

    return {
        light: {
            background: 0xFBF5F3,
            stars: 0x1B2A41,
            orbits: 0x324a5f, 
            mathObjects: 0x1B2A41,
            sun: 0xff9500, // Keep the original orange sun color
            planets: [0x0C1821, 0x1B2A41, 0x324a5f, 0x324a5f, 0x1B2A41]
        },
        dark: {
            background: 0x000000,
            stars: 0xFBF5F3, 
            orbits: 0xCCC9DC,
            mathObjects: 0xCCC9DC,
            sun: 0xff9500, // Keep the original orange sun color
            planets: [0x212529, 0xf8f9fa, 0xFBF5F3, 0x000000, 0x212529]
        }
    };
}

// Try to get colors from CSS, fallback to default if not available
const colors = getThemeColors() || {
    light: {
        background: 0xf8f9fa,
        stars: 0x333333,
        orbits: 0x212529,
        mathObjects: 0x303045,
        sun: 0xff9500,
        planets: [0x4cc9f0, 0x3a86ff, 0x8338ec, 0xff006e, 0xfb5607]
    },
    dark: {
        background: 0x121212,
        stars: 0xffffff,
        orbits: 0x4cc9f0,
        mathObjects: 0x72deff,
        sun: 0xff9500,
        planets: [0x4cc9f0, 0x3a86ff, 0x8338ec, 0xff006e, 0xfb5607]
    }
};

function init() {
    // Create and setup the scene
    scene = new THREE.Scene();
    
    // Set background color based on theme but with transparency
    const bgColor = new THREE.Color(isDarkMode ? colors.dark.background : colors.light.background);
    scene.background = bgColor;
    
    // Setup camera with perspective
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 30);
    camera.lookAt(0, 0, 0);
    
    // Check if we're on the experience page and adjust camera accordingly
    const isExperiencePage = window.location.pathname.includes('experience.html');
    if (isExperiencePage) {
        // Move camera further away on experience page for less visual interference
        camera.position.set(0, 25, 50);
        camera.lookAt(0, 0, 0);
    }
    
    // Ensure the canvas exists, or create it if it doesn't
    let canvas = document.getElementById('solarSystemCanvas');
    if (!canvas) {
        console.log('Creating solarSystemCanvas element');
        canvas = document.createElement('canvas');
        canvas.id = 'solarSystemCanvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);
    }
    
    // Setup renderer with better quality
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true // Allow transparency
    });
    
    // Set clear color with transparency
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit for performance
    
    // Setup for interactivity
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Add OrbitControls for interactivity if available
    if (typeof THREE.OrbitControls !== 'undefined') {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controls.enablePan = false;
        controls.minDistance = 20;
        controls.maxDistance = 60;
    }
    
    // Create lights with better quality
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1.2);
    pointLight.position.set(0, 0, 0); // Position at sun
    scene.add(pointLight);
    
    // Create the solar system
    createSolarSystem();
    
    // Create mathematical elements
    createMathElements();
    
    // Create stars
    createStars();
    
    // Create the starfield as the background
    createStarfield();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Add event listeners for interactivity
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onMouseClick);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    
    // Start the animation loop
    animate();
}

function createSolarSystem() {
    // Create the Sun with low-poly geometric design
    const sunGeometry = new THREE.IcosahedronGeometry(3, 1); // Lower detail for more visible facets
    const sunMaterial = new THREE.MeshStandardMaterial({ 
        color: colors[isDarkMode ? 'dark' : 'light'].sun,
        emissive: colors[isDarkMode ? 'dark' : 'light'].sun,
        emissiveIntensity: 0.8,
        roughness: 0.5,
        metalness: 0.3,
        flatShading: true, // Enable flat shading for polygonal look
        wireframe: false
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData.type = 'sun';
    sun.userData.description = 'The Sun - Center of our solar system';
    scene.add(sun);
    
    // Add wireframe overlay to sun for added geometric effect
    const sunWireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(sunGeometry),
        new THREE.LineBasicMaterial({ 
            color: 0xffffff, 
            transparent: true, 
            opacity: 0.2,
            linewidth: 1
        })
    );
    sun.add(sunWireframe);
    
    // Create sun glow effect
    const sunGlow = new THREE.PointLight(colors[isDarkMode ? 'dark' : 'light'].sun, 2, 100, 1.5);
    sun.add(sunGlow);
    
    // Add a subtle halo around the sun
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4wIHDSc3s6ZdnwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAABs0lEQVRYw+2XO07DQBCGv13bSUgIJCiUdJFoKJCoOQJnoOIInIKKa3ACKrh0NBQgWiSKREIkJM7L3h0KnIeJncQJBUj8zWqfM/vN7OzOLvyrGIB3eR9kLGTMCrGz3/VjgCJwd4nnDXB//eLgsd2KAXqXcJwA9e2DladbCzsXRKkR3qQBSlMGgCmD1PQ3T9Rg4J57SLAM7ADl9OWuoLcFFBRsNhESKIC98BZgCfgAGsAutbdnpi3nxUODkzKwK/QnQEPQ9UxYGgmWnzxuapI97C5pEYhZiM4QgMgSmAUJs0C0AKJ4uH8eoP/VXDcwkdOGixuQdg/wHB0hY0B/vD7j+9/1vQPyvXhLtmON8NqSquv7gNlpt1qO32dVJpIm1TFgPTHpJ601KWs1F7+aseWbEjc1CTO6hqNrxo27ZNykk/neQNQgcHs2btrJ+TFAJ3NzXk1COE1HSOVnyBQyZQApO8bdfQYMXUHIk4BTgJQxsPm5mdTVKUB1bCQdonbCYcoAcpmiHIoBdDpA3YaBOCXID4FIGaC/8TTS7b9PGZAXoX/xdpxpAMXxwGRm3sfJjwE+ASVj8giYPkg8AAAAAElFTkSuQmCC'),
        color: colors[isDarkMode ? 'dark' : 'light'].sun,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.7
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(15, 15, 1);
    sun.add(sprite);
    
    // Create planets with orbits using polygeometry
    const planetColors = colors[isDarkMode ? 'dark' : 'light'].planets;
    
    // Different polygon types for planets to add variety
    const planetGeometries = [
        (size) => new THREE.IcosahedronGeometry(size, 0), // 20 faces
        (size) => new THREE.DodecahedronGeometry(size, 0), // 12 faces
        (size) => new THREE.OctahedronGeometry(size, 0), // 8 faces
        (size) => new THREE.TetrahedronGeometry(size), // 4 faces
        (size) => new THREE.IcosahedronGeometry(size, 1) // Subdivided icosahedron
    ];
    
    for (let i = 0; i < 5; i++) {
        // Create planet
        const size = 0.8 + Math.random() * 1.2;
        const distance = 7 + i * 5;
        const speed = 0.003 / (i * 0.2 + 1); // Slightly slower for smoothness
        
        // Select a polygon geometry type for this planet
        const geometryCreator = planetGeometries[i % planetGeometries.length];
        const planetGeometry = geometryCreator(size);
        
        // Use better materials for planets with flat shading for polygonal appearance
        const planetMaterial = new THREE.MeshStandardMaterial({ 
            color: planetColors[i],
            emissive: planetColors[i],
            emissiveIntensity: 0.1,
            roughness: 0.7,
            metalness: 0.3,
            flatShading: true // Enable flat shading for the polygon look
        });
        
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        planet.position.x = distance;
        planet.userData.type = 'planet';
        planet.userData.index = i;
        planet.userData.description = `Planet ${i+1} - Distance from sun: ${distance} units`;
        
        // Add wireframe overlay to enhance geometric appearance
        const wireframe = new THREE.LineSegments(
            new THREE.WireframeGeometry(planetGeometry),
            new THREE.LineBasicMaterial({ 
                color: 0xffffff, 
                transparent: true, 
                opacity: 0.2,
                linewidth: 1
            })
        );
        planet.add(wireframe);
        
        // Add unique features to planets
        if (i % 2 === 0) {
            // Add rings to some planets - make rings also polygonal
            const ringGeometry = new THREE.TorusGeometry(size * 1.5, 0.2, 8, 16); // Fewer segments for polygonal look
            const ringMaterial = new THREE.MeshBasicMaterial({ 
                color: planetColors[(i+2) % planetColors.length],
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide,
                wireframe: Math.random() > 0.5 // Randomly make some rings wireframe
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planet.add(ring);
        } else if (i % 3 === 0) {
            // Add moons to some planets - also with polygonal geometry
            const moonSize = size * 0.3;
            const moonGeometry = new THREE.TetrahedronGeometry(moonSize); // Tetrahedron for moons
            const moonMaterial = new THREE.MeshStandardMaterial({
                color: planetColors[(i+1) % planetColors.length],
                roughness: 0.8,
                metalness: 0.2,
                flatShading: true
            });
            const moon = new THREE.Mesh(moonGeometry, moonMaterial);
            moon.position.set(size * 2, 0, 0);
            
            // Add wireframe to moon
            const moonWireframe = new THREE.LineSegments(
                new THREE.WireframeGeometry(moonGeometry),
                new THREE.LineBasicMaterial({ 
                    color: 0xffffff, 
                    transparent: true, 
                    opacity: 0.3
                })
            );
            moon.add(moonWireframe);
            
            // Create a container for the moon's orbit
            const moonOrbit = new THREE.Object3D();
            moonOrbit.add(moon);
            planet.add(moonOrbit);
            
            // Store moon's rotation data
            planet.userData.moon = {
                orbit: moonOrbit,
                speed: 0.03
            };
        }
        
        // Create orbital container
        const orbitContainer = new THREE.Object3D();
        orbitContainer.add(planet);
        scene.add(orbitContainer);
        
        // Create visible orbit path - make it polygonal too
        const orbitSegments = 32; // Fewer segments for a more geometric look
        const orbitGeometry = new THREE.RingGeometry(distance - 0.05, distance + 0.05, orbitSegments);
        const orbitMaterial = new THREE.MeshBasicMaterial({ 
            color: colors[isDarkMode ? 'dark' : 'light'].orbits,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);
        
        planets.push({ 
            mesh: orbitContainer, 
            planet: planet,
            speed: speed,
            originalSpeed: speed,
            distance: distance,
            highlighted: false
        });
        orbits.push(orbit);
    }
}

function createMathElements() {
    // Mathematical objects using polyhedron geometries
    const mathShapes = [
        new THREE.IcosahedronGeometry(1, 0), // Platonic solid: Icosahedron
        new THREE.TetrahedronGeometry(1),    // Platonic solid: Tetrahedron
        new THREE.OctahedronGeometry(1),     // Platonic solid: Octahedron
        new THREE.DodecahedronGeometry(1)    // Platonic solid: Dodecahedron
    ];
    
    // Create mathematical formulas as 3D objects
    for (let i = 0; i < 8; i++) {
        const distance = 25 + Math.random() * 30;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 30;
        
        // Select random shape
        const shapeIndex = Math.floor(Math.random() * mathShapes.length);
        
        // Create object with wireframe
        const mathObjectGeometry = mathShapes[shapeIndex];
        const mathObjectMaterial = new THREE.MeshBasicMaterial({ 
            color: colors[isDarkMode ? 'dark' : 'light'].mathObjects,
            wireframe: true,
            transparent: true,
            opacity: 0.6
        });
        
        const mathObject = new THREE.Mesh(mathObjectGeometry, mathObjectMaterial);
        mathObject.position.set(
            Math.cos(angle) * distance,
            height,
            Math.sin(angle) * distance
        );
        
        // Add rotation properties
        mathObject.userData = {
            type: 'mathObject',
            index: i,
            rotationSpeed: {
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            },
            originalScale: 1,
            originalOpacity: 0.6,
            description: `Mathematical Object: ${['Icosahedron', 'Tetrahedron', 'Octahedron', 'Dodecahedron'][shapeIndex]}`
        };
        
        scene.add(mathObject);
        mathObjects.push(mathObject);
    }
}

function createStars() {
    // Create a group for stars with better distribution
    const starGroup = new THREE.Group();
    
    // Create stars as particles with adaptive size
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: colors[isDarkMode ? 'dark' : 'light'].stars,
        size: 0.08,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });
    
    // Reduce the number of stars for experience page
    const isExperiencePage = window.location.pathname.includes('experience.html');
    const starCount = isExperiencePage ? 1000 : 2000;
    
    // Generate star positions with better distribution
    const starsVertices = [];
    const starSizes = [];
    for (let i = 0; i < starCount; i++) {
        // Use spherical distribution for stars
        const radius = 100 + Math.random() * 100; // Distance from center
        const theta = Math.random() * Math.PI * 2; // Horizontal angle
        const phi = Math.acos(2 * Math.random() - 1); // Vertical angle
        
        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
        starsVertices.push(x, y, z);
        
        // Vary star sizes slightly
        starSizes.push(0.05 + Math.random() * 0.1);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
    
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    starGroup.add(starField);
    scene.add(starGroup);
    
    stars.push(starGroup);
}

function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff, // Bright white stars
        size: 1.5, // Increase star size for better visibility
        sizeAttenuation: true, // Make stars appear smaller in the distance
        transparent: true,
        opacity: 0.8 // Slightly transparent for a softer look
    });

    const starCount = 2000; // Increase the number of stars for a denser starfield
    const positions = [];

    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 2000; // Spread stars across a large area
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        positions.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars); // Add the starfield to the scene
}

// Interaction event handlers
function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    checkIntersection();
}

function onMouseClick(event) {
    // Handle clicks on objects
    if (hoveredObject) {
        if (selectedObject === hoveredObject) {
            // Deselect if already selected
            resetSelectedObject();
            selectedObject = null;
        } else {
            // Select new object
            if (selectedObject) resetSelectedObject();
            selectedObject = hoveredObject;
            highlightSelectedObject();
            
            // Show object info (you can implement a tooltip here)
            console.log(selectedObject.userData.description);
        }
    }
}

function onTouchStart(event) {
    event.preventDefault();
    
    // Convert touch to mouse position
    if (event.touches.length > 0) {
        mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
        
        checkIntersection();
        
        // Handle touch like a click
        if (hoveredObject) {
            if (selectedObject === hoveredObject) {
                resetSelectedObject();
                selectedObject = null;
            } else {
                if (selectedObject) resetSelectedObject();
                selectedObject = hoveredObject;
                highlightSelectedObject();
            }
        }
    }
}

function checkIntersection() {
    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);
    
    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Reset previous hover state
    if (hoveredObject && hoveredObject !== selectedObject) {
        resetHoveredObject();
    }
    
    hoveredObject = null;
    
    // Check for new hover
    if (intersects.length > 0) {
        // Find the first interactive object
        for (let i = 0; i < intersects.length; i++) {
            let object = intersects[i].object;
            
            // Find the parent object with userData
            while (object && !object.userData.type) {
                object = object.parent;
            }
            
            if (object && object.userData.type) {
                hoveredObject = object;
                if (hoveredObject !== selectedObject) {
                    highlightHoveredObject();
                }
                break;
            }
        }
    }
    
    // Update cursor style
    document.body.style.cursor = hoveredObject ? 'pointer' : 'default';
}

function highlightHoveredObject() {
    if (!hoveredObject) return;
    
    if (hoveredObject.userData.type === 'planet') {
        // Find the planet's index to get the correct planet object
        for (const planetObj of planets) {
            if (planetObj.planet === hoveredObject) {
                // Scale up slightly
                hoveredObject.scale.set(1.1, 1.1, 1.1);
                // Speed up rotation
                planetObj.speed = planetObj.originalSpeed * 2;
                break;
            }
        }
    } else if (hoveredObject.userData.type === 'mathObject') {
        // Scale up
        hoveredObject.scale.set(1.3, 1.3, 1.3);
        // Increase opacity
        hoveredObject.material.opacity = 0.9;
    } else if (hoveredObject.userData.type === 'sun') {
        // Make sun pulse
        hoveredObject.userData.pulsing = true;
    }
}

function resetHoveredObject() {
    if (!hoveredObject) return;
    
    if (hoveredObject.userData.type === 'planet') {
        // Reset scale
        hoveredObject.scale.set(1, 1, 1);
        // Reset speed
        for (const planetObj of planets) {
            if (planetObj.planet === hoveredObject) {
                planetObj.speed = planetObj.originalSpeed;
                break;
            }
        }
    } else if (hoveredObject.userData.type === 'mathObject') {
        // Reset scale
        hoveredObject.scale.set(1, 1, 1);
        // Reset opacity
        hoveredObject.material.opacity = 0.6;
    } else if (hoveredObject.userData.type === 'sun') {
        // Stop pulsing
        hoveredObject.userData.pulsing = false;
    }
}

// Update the highlightSelectedObject function to enhance wireframe when selected
function highlightSelectedObject() {
    if (!selectedObject) return;
    
    if (selectedObject.userData.type === 'planet') {
        // More dramatic scale up
        selectedObject.scale.set(1.2, 1.2, 1.2);
        
        // Enhance wireframe visibility when selected
        selectedObject.children.forEach(child => {
            if (child instanceof THREE.LineSegments) {
                child.material.opacity = 0.8;
                child.material.color.set(0xffffff);
            }
        });
        
        // Highlight the orbit
        for (let i = 0; i < planets.length; i++) {
            if (planets[i].planet === selectedObject) {
                orbits[i].material.opacity = 0.8;
                orbits[i].material.color.set(0xffffff);
                planets[i].highlighted = true;
                break;
            }
        }
    } else if (selectedObject.userData.type === 'mathObject') {
        // Make it larger and fully visible
        selectedObject.scale.set(1.5, 1.5, 1.5);
        selectedObject.material.opacity = 1;
        selectedObject.material.color.set(0xffffff);
    } else if (selectedObject.userData.type === 'sun') {
        // Make sun extra bright
        selectedObject.material.emissiveIntensity = 1.2;
        
        // Enhance wireframe visibility when selected
        selectedObject.children.forEach(child => {
            if (child instanceof THREE.LineSegments) {
                child.material.opacity = 0.8;
                child.material.color.set(0xffffff);
            }
        });
    }
}

// Update the resetSelectedObject function to reset wireframe opacity
function resetSelectedObject() {
    if (!selectedObject) return;
    
    if (selectedObject.userData.type === 'planet') {
        selectedObject.scale.set(1, 1, 1);
        
        // Reset wireframe
        selectedObject.children.forEach(child => {
            if (child instanceof THREE.LineSegments) {
                child.material.opacity = 0.2;
                child.material.color.set(0xffffff);
            }
        });
        
        // Reset orbit highlight
        for (let i = 0; i < planets.length; i++) {
            if (planets[i].planet === selectedObject) {
                orbits[i].material.opacity = 0.2;
                orbits[i].material.color.set(colors[isDarkMode ? 'dark' : 'light'].orbits);
                planets[i].highlighted = false;
                break;
            }
        }
    } else if (selectedObject.userData.type === 'mathObject') {
        selectedObject.scale.set(1, 1, 1);
        selectedObject.material.opacity = 0.6;
        selectedObject.material.color.set(colors[isDarkMode ? 'dark' : 'light'].mathObjects);
    } else if (selectedObject.userData.type === 'sun') {
        selectedObject.material.emissiveIntensity = 0.8;
        
        // Reset wireframe
        selectedObject.children.forEach(child => {
            if (child instanceof THREE.LineSegments) {
                child.material.opacity = 0.2;
                child.material.color.set(0xffffff);
            }
        });
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update orbit controls if available
    if (controls) controls.update();
    
    // Sun pulsing effect when hovered
    scene.children.forEach(obj => {
        if (obj.userData.type === 'sun' && obj.userData.pulsing) {
            const pulseFactor = 1 + 0.05 * Math.sin(Date.now() * 0.003);
            obj.scale.set(pulseFactor, pulseFactor, pulseFactor);
        }
    });
    
    // Adjust animation speed based on page
    const isExperiencePage = window.location.pathname.includes('experience.html');
    const speedFactor = isExperiencePage ? 0.7 : 1.0; // Slower on experience page
    
    // Rotate planets around the sun with smoother animation
    planets.forEach(planetObj => {
        // Rotate orbit with adjusted speed
        planetObj.mesh.rotation.y += planetObj.speed * speedFactor;
        
        // Rotate planet itself with adjusted speed
        planetObj.planet.rotation.y += 0.01 * speedFactor;
        
        // Animate moon if present
        if (planetObj.planet.userData.moon) {
            planetObj.planet.userData.moon.orbit.rotation.y += planetObj.planet.userData.moon.speed;
        }
        
        // Add slight wobble to highlighted planets
        if (planetObj.highlighted) {
            planetObj.planet.rotation.z = Math.sin(Date.now() * 0.001) * 0.1;
        } else {
            planetObj.planet.rotation.z = 0;
        }
    });
    
    // Rotate mathematical objects with smoother animation
    mathObjects.forEach(obj => {
        obj.rotation.x += obj.userData.rotationSpeed.x;
        obj.rotation.y += obj.userData.rotationSpeed.y;
        obj.rotation.z += obj.userData.rotationSpeed.z;
    });
    
    // Only perform camera movement if not using orbit controls
    if (!controls) {
        // Smoother camera movement
        const time = Date.now() * 0.00005;
        const isExperiencePage = window.location.pathname.includes('experience.html');
        const radius = isExperiencePage ? 50 : 40; // Larger orbit for experience page
        
        camera.position.x = Math.cos(time) * radius;
        camera.position.z = Math.sin(time) * radius;
        camera.position.y = 15 + Math.sin(time * 1.5) * (isExperiencePage ? 3 : 5); // Less vertical movement
        camera.lookAt(0, 0, 0);
    }
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    if (!camera || !renderer) return; // Guard clause
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Function to update solar system theme colors
window.updateSolarSystemTheme = function(darkMode) {
    isDarkMode = darkMode;
    
    // Get updated theme colors
    const updatedColors = getThemeColors();
    if (updatedColors) {
        Object.assign(colors, updatedColors);
    }
    
    // Update scene background
    scene.background = new THREE.Color(isDarkMode ? colors.dark.background : colors.light.background);
    
    // Update sun
    scene.children.forEach(obj => {
        if (obj.userData.type === 'sun') {
            obj.material.emissive.set(colors[isDarkMode ? 'dark' : 'light'].sun);
            // Update sun light
            obj.children.forEach(child => {
                if (child instanceof THREE.PointLight) {
                    child.color.set(colors[isDarkMode ? 'dark' : 'light'].sun);
                }
                if (child instanceof THREE.Sprite) {
                    child.material.color.set(colors[isDarkMode ? 'dark' : 'light'].sun);
                }
            });
        }
    });
    
    // Update orbits
    orbits.forEach((orbit, index) => {
        if (!planets[index].highlighted) {
            orbit.material.color.set(colors[isDarkMode ? 'dark' : 'light'].orbits);
        }
    });
    
    // Update planets
    planets.forEach((planetObj, index) => {
        const planetColor = colors[isDarkMode ? 'dark' : 'light'].planets[index % colors[isDarkMode ? 'dark' : 'light'].planets.length];
        planetObj.planet.material.color.set(planetColor);
        planetObj.planet.material.emissive.set(planetColor);
    });
    
    // Update mathematical objects
    mathObjects.forEach(obj => {
        if (obj !== selectedObject) {
            obj.material.color.set(colors[isDarkMode ? 'dark' : 'light'].mathObjects);
        }
    });
    
    // Update stars
    stars.forEach(starGroup => {
        starGroup.children.forEach(starField => {
            starField.material.color.set(colors[isDarkMode ? 'dark' : 'light'].stars);
        });
    });
};

// Ensure initialization happens when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if theme has already been set
    isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Small delay to ensure DOM is fully loaded
    setTimeout(() => {
        init();
    }, 100);
});

// Handle window visibility changes (fixes issues when switching tabs)
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible' && renderer) {
        // Resize and rerender when coming back to the page
        onWindowResize();
    }
});

(function() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    let stars = [];
    const STAR_COUNT = window.innerWidth > 768 ? 250 : 120; // Increase the star count for a denser starfield
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function randomBetween(a, b) {
        return a + Math.random() * (b - a);
    }

    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: randomBetween(1, 2.5), // Increase the star size for better visibility
                baseAlpha: randomBetween(0.7, 1), // Increase base brightness
                twinkleSpeed: randomBetween(0.002, 0.006), // Adjust twinkle speed
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, width, height);
        for (let star of stars) {
            const twinkle = Math.sin(Date.now() * star.twinkleSpeed + star.twinklePhase) * 0.5 + 0.7; // Enhance twinkle effect
            ctx.globalAlpha = star.baseAlpha * twinkle;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
            ctx.fillStyle = "#fff"; // Bright white stars
            ctx.shadowColor = "#fff";
            ctx.shadowBlur = 10; // Increase glow for stars
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    function animate() {
        drawStars();
        requestAnimationFrame(animate);
    }

    function init() {
        resize();
        createStars();
        animate();
    }

    window.addEventListener('resize', () => {
        resize();
        createStars();
    });

    document.addEventListener('DOMContentLoaded', init);
})();
