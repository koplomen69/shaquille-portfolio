document.addEventListener('DOMContentLoaded', function() {
    // Check if the page has loaded and get the canvas element
    const canvas = document.getElementById('neuralNetworkBackground');
    if (!canvas) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Set background based on theme
    const isDarkMode = document.body.classList.contains('dark-mode');
    scene.background = new THREE.Color(isDarkMode ? 0x0a192f : 0xf0f8ff);

    // Network parameters
    const nodeCount = 60;
    const connectionDistance = 5;
    const nodes = [];
    const connections = [];
    const dataPackets = [];
    const nodeSize = 0.15;

    // Create nodes (neurons)
    const nodeGeometry = new THREE.SphereGeometry(nodeSize, 8, 8);
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00a2ff });
    
    for (let i = 0; i < nodeCount; i++) {
        const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
        
        // Random position within boundaries
        node.position.x = (Math.random() - 0.5) * 15;
        node.position.y = (Math.random() - 0.5) * 15;
        node.position.z = (Math.random() - 0.5) * 15;
        
        // Add velocity for animation
        node.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            ),
            connections: []
        };
        
        nodes.push(node);
        scene.add(node);
    }

    // Create connections between nearby nodes
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00d8ff,
        transparent: true, 
        opacity: 0.5 
    });
    
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            const distance = nodes[i].position.distanceTo(nodes[j].position);
            
            if (distance < connectionDistance) {
                const points = [nodes[i].position, nodes[j].position];
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(lineGeometry, lineMaterial);
                
                // Store the connection
                connections.push({
                    line: line,
                    nodeA: i,
                    nodeB: j,
                    active: false
                });
                
                // Save reference for the nodes
                nodes[i].userData.connections.push(j);
                nodes[j].userData.connections.push(i);
                
                scene.add(line);
            }
        }
    }

    // Create data packets
    const packetGeometry = new THREE.SphereGeometry(0.06, 6, 6);
    const packetMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff,
        transparent: true,
        opacity: 0.9
    });

    // Helper function to create data packets
    function createDataPacket() {
        if (dataPackets.length >= 30) return; // Limit number of packets
        
        // Choose a random connection
        const connectionIndex = Math.floor(Math.random() * connections.length);
        const connection = connections[connectionIndex];
        
        const packet = new THREE.Mesh(packetGeometry, packetMaterial);
        
        // Start at node A
        const nodeA = nodes[connection.nodeA];
        const nodeB = nodes[connection.nodeB];
        packet.position.copy(nodeA.position);
        
        // Add packet data
        packet.userData = {
            progress: 0,
            speed: 0.02 + Math.random() * 0.03, // Random speed
            sourceNode: connection.nodeA,
            targetNode: connection.nodeB,
            connectionIndex: connectionIndex
        };
        
        dataPackets.push(packet);
        scene.add(packet);
    }

    // Set camera position
    camera.position.z = 15;

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Handle theme changes
    document.getElementById('themeToggle').addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        scene.background = new THREE.Color(isDarkMode ? 0x0a192f : 0xf0f8ff);
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Move nodes according to their velocity
        nodes.forEach(node => {
            node.position.add(node.userData.velocity);
            
            // Contain nodes within boundaries
            if (Math.abs(node.position.x) > 7.5) {
                node.userData.velocity.x *= -1;
            }
            if (Math.abs(node.position.y) > 7.5) {
                node.userData.velocity.y *= -1;
            }
            if (Math.abs(node.position.z) > 7.5) {
                node.userData.velocity.z *= -1;
            }
        });
        
        // Update connection lines to follow nodes
        connections.forEach(connection => {
            const points = [
                nodes[connection.nodeA].position,
                nodes[connection.nodeB].position
            ];
            connection.line.geometry.setFromPoints(points);
            connection.line.geometry.verticesNeedUpdate = true;
        });
        
        // Update data packets
        dataPackets.forEach((packet, index) => {
            const sourceNode = nodes[packet.userData.sourceNode];
            const targetNode = nodes[packet.userData.targetNode];
            
            // Move along the path
            packet.userData.progress += packet.userData.speed;
            if (packet.userData.progress >= 1) {
                // Reached target node - make it pulse
                targetNode.scale.set(1.5, 1.5, 1.5);
                setTimeout(() => {
                    targetNode.scale.set(1, 1, 1);
                }, 200);
                
                // Remove this packet
                scene.remove(packet);
                dataPackets.splice(index, 1);
            } else {
                // Position packet along the connection line
                packet.position.lerpVectors(
                    sourceNode.position,
                    targetNode.position,
                    packet.userData.progress
                );
            }
        });
        
        // Randomly create new packets
        if (Math.random() < 0.05) {
            createDataPacket();
        }
        
        // Rotate camera slowly for dynamic effect
        camera.position.x = 15 * Math.sin(Date.now() * 0.0001);
        camera.position.z = 15 * Math.cos(Date.now() * 0.0001);
        camera.lookAt(scene.position);
        
        // Render scene
        renderer.render(scene, camera);
    }

    // Initial data packets
    for (let i = 0; i < 10; i++) {
        createDataPacket();
    }

    // Start animation
    animate();
});
