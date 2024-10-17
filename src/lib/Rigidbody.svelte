<script context="module">
	import Matter from 'matter-js';

	let engine;
	let world;
	let render;
	let mouseConstraint;

	// Store all the boxes in an array
	let boxes = [];

	function resizeCanvas() {
		Matter.Render.setPixelRatio(render, window.devicePixelRatio);
		Matter.Render.lookAt(render, {
			min: { x: 0, y: 0 },
			max: { x: window.innerWidth, y: window.innerHeight }
		});
	}

	export function initPhysics(objectElement) {
		// Create an engine
		engine = Matter.Engine.create();
		world = engine.world;

		// Create renderer
		render = Matter.Render.create({
			element: objectElement,
			engine: engine,
			options: {
				width: window.innerWidth,
				height: window.innerHeight,
				wireframes: false,
				background: 'transparent'
			}
		});

		// Create an invisible wall
		const wallOptions = {
			isStatic: true,
			render: {
				visible: false // Makes the wall invisible
			}
		};
		let wallTop = Matter.Bodies.rectangle(
			window.innerWidth / 2,
			0,
			window.innerWidth,
			20,
			wallOptions
		);
		let wallBottom = Matter.Bodies.rectangle(
			window.innerWidth / 2,
			window.innerHeight,
			window.innerWidth,
			20,
			wallOptions
		);
		let wallLeft = Matter.Bodies.rectangle(
			0,
			window.innerHeight / 2,
			20,
			window.innerHeight,
			wallOptions
		);
		let wallRight = Matter.Bodies.rectangle(
			window.innerWidth,
			window.innerHeight / 2,
			20,
			window.innerHeight,
			wallOptions
		);

		// Add objects to the world
		Matter.World.add(world, [wallTop, wallBottom, wallLeft, wallRight]);

		// Add mouse control
		let mouse = Matter.Mouse.create(objectElement);
		mouseConstraint = Matter.MouseConstraint.create(engine, {
			mouse: mouse,
			constraint: {
				render: { visible: false }
			}
		});

		Matter.World.add(world, mouseConstraint);

		// yo i hate this
		Matter.Events.on(mouseConstraint, 'mousedown', function (event) {
			// Get mouse coordinates
			const mousePosition = event.mouse.position;
			const clickedBodies = Matter.Query.point(world.bodies, mousePosition);

			if (clickedBodies.length === 0) {
				// Temporarily disable pointer events on objectElement to "see through" it
				objectElement.style.pointerEvents = 'none';

				// Get the element below the objectElement at the mouse position
				const underlyingElement = document.elementFromPoint(mousePosition.x, mousePosition.y);

				// Restore pointer events on objectElement
				objectElement.style.pointerEvents = 'auto';

				// Log or interact with the element below
				if (underlyingElement) {
					console.log('Clicked element below objectElement:', underlyingElement);
					// Optionally, trigger a click event on the element below
					const clickEvent = new MouseEvent('click', {
						view: window,
						bubbles: true,
						cancelable: true,
						clientX: mousePosition.x,
						clientY: mousePosition.y
					});
					underlyingElement.dispatchEvent(clickEvent);
				}
			}
		});

		// Run the engine and renderer
		Matter.Engine.run(engine);
		Matter.Render.run(render);

		// Start the engine update loop using requestAnimationFrame
		const update = () => {
			Matter.Engine.update(engine, 1000 / 60); // Update the engine at 60 FPS
			requestAnimationFrame(update); // Continue the update loop
		};

		update(); // Start the loop

		// Resize canvas and bodies on window resize
		window.addEventListener('resize', resizeCanvas);

		// Add event listener for device motion (acceleration)
		window.addEventListener('devicemotion', handleDeviceMotion);

		// Add event listener for device orientation (tilt)
		//window.addEventListener('deviceorientation', handleDeviceOrientation);

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			window.removeEventListener('devicemotion', handleDeviceMotion);
			//window.removeEventListener('deviceorientation', handleDeviceOrientation);
		};
	}

	export function spawnTrophy() {
		const imageWidth = 15; // Set this to the width of your PNG
		const imageHeight = 24; // Set this to the height of your PNG

		// Handle click to add new boxes

		const x = window.innerWidth / 2;
		const y = 50; // Start near the top of the screen

		// Create a new box at the center top position
		let newBox = Matter.Bodies.rectangle(x, y, imageWidth * 5, imageHeight * 5, {
			render: {
				sprite: {
					texture: '/trophies/trophy.png',
					xScale: 0.5,
					yScale: 0.5,
					textureFilter: 'nearest'
				}
			}
		});

		// Add the box to the world and the array
		boxes.push(newBox);
		Matter.World.add(world, newBox);
	}

	function handleDeviceMotion(event) {
		// Get acceleration along x and y axis
		const accelerationX = event.accelerationIncludingGravity.x;
		const accelerationY = event.accelerationIncludingGravity.y;

		// Loop through all bodies in the world and apply force
		Matter.Composite.allBodies(engine.world).forEach((body) => {
			// Apply a force proportional to the acceleration
			const forceX = accelerationX * -0.001; // Scale down the force for realism
			const forceY = accelerationY * 0.001; // Scale down the force for realism

			// Apply the force to the center of the body
			Matter.Body.applyForce(body, body.position, { x: forceX, y: forceY });
		});
	}

	// Handle device orientation (tilt)
	function handleDeviceOrientation(event) {
		// Get orientation angles
		const beta = event.beta; // tilt front-back [-180, 180]
		const gamma = event.gamma; // tilt left-right [-90, 90]

		// Use gamma to affect horizontal gravity and beta to affect vertical gravity
		engine.world.gravity.x = gamma / 90; // Normalize to [-1, 1]
		engine.world.gravity.y = beta / 180; // Normalize to [-1, 1]
	}
</script>
