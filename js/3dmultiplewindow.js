import WindowManager from './WindowManager.js'

const t = THREE;
let camera, scene, renderer, world;
let near, far;
let pixR = window.devicePixelRatio ? window.devicePixelRatio : 1;
let icosahedrons = [];
let glowMeshes = [];
let sceneOffsetTarget = {x: 0, y: 0};
let sceneOffset = {x: 0, y: 0};

let today = new Date();
today.setHours(0);
today.setMinutes(0);
today.setSeconds(0);
today.setMilliseconds(0);
today = today.getTime();

let internalTime = getTime();
let windowManager;
let initialized = false;

// get time in seconds since beginning of the day (so that all windows use the same time)
function getTime ()
{
	return (new Date().getTime() - today) / 1000.0;
}


if (new URLSearchParams(window.location.search).get("clear"))
{
	localStorage.clear();
}
else
{	
	// this code is essential to circumvent that some browsers preload the content of some pages before you actually hit the url
	document.addEventListener("visibilitychange", () => 
	{
		if (document.visibilityState != 'hidden' && !initialized)
		{
			init();
		}
	});

	window.onload = () => {
		if (document.visibilityState != 'hidden')
		{
			init();
		}
	};

	function init ()
	{
		initialized = true;

		// add a short timeout because window.offsetX reports wrong values before a short period 
		setTimeout(() => {
			setupScene();
			setupWindowManager();
			resize();
			updateWindowShape(false);
			render();
			window.addEventListener('resize', resize);
		}, 500)	
	}

	function setupScene ()
	{
		camera = new t.OrthographicCamera(0, 0, window.innerWidth, window.innerHeight, -10000, 10000);
		
		camera.position.z = 2.5;
		near = camera.position.z - .5;
		far = camera.position.z + 0.5;

		scene = new t.Scene();
		scene.background = new t.Color(0.0);
		scene.add( camera );

		// Add ambient light for better visibility
		const ambientLight = new t.AmbientLight(0x404040, 0.5);
		scene.add(ambientLight);

		// Add point light for additional lighting effects
		const pointLight = new t.PointLight(0xffffff, 0.5);
		pointLight.position.set(0, 0, 100);
		scene.add(pointLight);

		renderer = new t.WebGLRenderer({antialias: true, depthBuffer: true});
		renderer.setPixelRatio(pixR);
	    
	  	world = new t.Object3D();
		scene.add(world);

		renderer.domElement.setAttribute("id", "scene");
		document.body.appendChild( renderer.domElement );
	}

	function setupWindowManager ()
	{
		windowManager = new WindowManager();
		windowManager.setWinShapeChangeCallback(updateWindowShape);
		windowManager.setWinChangeCallback(windowsUpdated);

		// here you can add your custom metadata to each windows instance
		let metaData = {foo: "bar"};

		// this will init the windowmanager and add this window to the centralised pool of windows
		windowManager.init(metaData);

		// call update windows initially (it will later be called by the win change callback)
		windowsUpdated();
	}

	function windowsUpdated ()
	{
		updateNumberOfIcosahedrons();
	}

	function updateNumberOfIcosahedrons ()
	{
		let wins = windowManager.getWindows();

		// remove all icosahedrons and glow meshes
		icosahedrons.forEach((ico) => {
			world.remove(ico);
		})
		glowMeshes.forEach((glow) => {
			world.remove(glow);
		})

		icosahedrons = [];
		glowMeshes = [];

		// add new icosahedrons based on the current window setup
		for (let i = 0; i < wins.length; i++)
		{
			let win = wins[i];

			let c = new t.Color();
			c.setHSL(i * .1, 1.0, .5);

			let radius = 50 + i * 25;
			
			// Create main icosahedron with emissive material for glow
			let icoGeometry = new t.IcosahedronGeometry(radius, 1);
			let icoMaterial = new t.MeshPhongMaterial({
				color: c,
				emissive: c,
				emissiveIntensity: 0.4,
				shininess: 100,
				specular: 0xffffff,
				wireframe: false
			});
			
			let icosahedron = new t.Mesh(icoGeometry, icoMaterial);
			icosahedron.position.x = win.shape.x + (win.shape.w * .5);
			icosahedron.position.y = win.shape.y + (win.shape.h * .5);

			// Create outer glow mesh
			let glowGeometry = new t.IcosahedronGeometry(radius * 1.3, 1);
			let glowMaterial = new t.MeshBasicMaterial({
				color: c,
				transparent: true,
				opacity: 0.15,
				side: t.BackSide
			});
			
			let glowMesh = new t.Mesh(glowGeometry, glowMaterial);
			glowMesh.position.x = icosahedron.position.x;
			glowMesh.position.y = icosahedron.position.y;

			// Add wireframe overlay for additional detail
			let wireframeGeometry = new t.IcosahedronGeometry(radius * 1.05, 1);
			let wireframeMaterial = new t.MeshBasicMaterial({
				color: 0xffffff,
				wireframe: true,
				transparent: true,
				opacity: 0.3
			});
			let wireframeMesh = new t.Mesh(wireframeGeometry, wireframeMaterial);
			
			// Group the meshes
			icosahedron.add(wireframeMesh);

			world.add(glowMesh);
			world.add(icosahedron);
			icosahedrons.push(icosahedron);
			glowMeshes.push(glowMesh);
		}
	}

	function updateWindowShape (easing = true)
	{
		// storing the actual offset in a proxy that we update against in the render function
		sceneOffsetTarget = {x: -window.screenX, y: -window.screenY};
		if (!easing) sceneOffset = sceneOffsetTarget;
	}


	function render ()
	{
		let t = getTime();

		windowManager.update();


		// calculate the new position based on the delta between current offset and new offset times a falloff value (to create the nice smoothing effect)
		let falloff = .05;
		sceneOffset.x = sceneOffset.x + ((sceneOffsetTarget.x - sceneOffset.x) * falloff);
		sceneOffset.y = sceneOffset.y + ((sceneOffsetTarget.y - sceneOffset.y) * falloff);

		// set the world position to the offset
		world.position.x = sceneOffset.x;
		world.position.y = sceneOffset.y;

		let wins = windowManager.getWindows();


		// loop through all our icosahedrons and update their positions based on current window positions
		for (let i = 0; i < icosahedrons.length; i++)
		{
			let icosahedron = icosahedrons[i];
			let glowMesh = glowMeshes[i];
			let win = wins[i];
			let _t = t;// + i * .2;

			let posTarget = {x: win.shape.x + (win.shape.w * .5), y: win.shape.y + (win.shape.h * .5)}

			// Update icosahedron position with smooth animation
			icosahedron.position.x = icosahedron.position.x + (posTarget.x - icosahedron.position.x) * falloff;
			icosahedron.position.y = icosahedron.position.y + (posTarget.y - icosahedron.position.y) * falloff;
			
			// Rotate icosahedron
			icosahedron.rotation.x = _t * .5;
			icosahedron.rotation.y = _t * .3;
			icosahedron.rotation.z = _t * .2;

			// Update glow mesh position to follow icosahedron
			glowMesh.position.x = icosahedron.position.x;
			glowMesh.position.y = icosahedron.position.y;
			
			// Rotate glow mesh in opposite direction for effect
			glowMesh.rotation.x = -_t * .3;
			glowMesh.rotation.y = -_t * .5;
			glowMesh.rotation.z = -_t * .4;

			// Pulse the glow effect
			let pulseIntensity = Math.sin(_t * 2) * 0.1 + 0.15;
			glowMesh.material.opacity = pulseIntensity;
			
			// Pulse emissive intensity
			icosahedron.material.emissiveIntensity = Math.sin(_t * 3) * 0.2 + 0.4;
		};

		renderer.render(scene, camera);
		requestAnimationFrame(render);
	}


	// resize the renderer to fit the window size
	function resize ()
	{
		let width = window.innerWidth;
		let height = window.innerHeight
		
		camera = new t.OrthographicCamera(0, width, 0, height, -10000, 10000);
		camera.updateProjectionMatrix();
		renderer.setSize( width, height );
	}
}