<script context="module">
	import Matter from 'matter-js';
	import { launchConfettiAtPosition } from './ConfettiLauncher.svelte';

	function randomInRange(min, max) {
		return Math.random() * (max - min) + min;
	}

	let engine;
	let world;
	let renderer;
	let mouseConstraint;

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
		renderer = Matter.Render.create({
			element: objectElement,
			engine: engine,
			options: {
				width: window.innerWidth,
				height: window.innerHeight,
				wireframes: false,
				background: 'transparent'
			}
		});

		// Create walls
		const wallOptions = {
			friction: 0.5,
			frictionStatic: 0.7,
			frictionAir: 0,
			isStatic: true,
			render: {
				visible: false
			}
		};
		const walls = [
			Matter.Bodies.rectangle(window.innerWidth / 2, -100, window.innerWidth, 200, wallOptions),
			Matter.Bodies.rectangle(
				window.innerWidth / 2,
				window.innerHeight + 100,
				window.innerWidth,
				200,
				wallOptions
			),
			Matter.Bodies.rectangle(-100, window.innerHeight / 2, 200, window.innerHeight, wallOptions),
			Matter.Bodies.rectangle(
				window.innerWidth + 100,
				window.innerHeight / 2,
				200,
				window.innerHeight,
				wallOptions
			)
		];

		// Add walls to the world
		Matter.World.add(world, walls);

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

			// get bodies clicked on
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
					const clickEvent = new MouseEvent('click', {
						view: window,
						bubbles: true,
						cancelable: true,
						clientX: mousePosition.x,
						clientY: mousePosition.y
					});
					underlyingElement.dispatchEvent(clickEvent);

					/*
					launchConfettiAtPosition(
						mousePosition.x / window.innerWidth,
						mousePosition.y / window.innerHeight
					);
          */
				} else {
				}
			}
		});

		// Run the engine and renderer
		// Create and run the runner
		const runner = Matter.Runner.create();
		Matter.Runner.run(runner, engine);
		Matter.Render.run(renderer);

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
		const imageWidth = 20; // Set this to the width of your PNG
		const imageHeight = 20; // Set this to the height of your PNG
		// Randomly pick a trophy image from the list

		const trophyImages = ['trophy1', 'trophy2', 'trophy3', 'trophy4', 'trophy5'];
		const randomIndex = Math.floor(Math.random() * trophyImages.length);
		const chosenImage = trophyImages[randomIndex]; // Generate a random x position between 0 and the window width minus the trophy's width

		const x = randomInRange(0.25, 0.75) * window.innerWidth;
		const y = 0.1 * window.innerHeight; // Start near the top of the screen
		// Define trapezoid vertices

		const trapezoidVertices = [
			{ x: -imageWidth * 2.5, y: -imageHeight * 2.5 }, // Bottom left
			{ x: imageWidth * 2.5, y: -imageHeight * 2.5 }, // Bottom right
			{ x: imageWidth * 1, y: imageHeight * 2.5 }, // Top right, narrower
			{ x: -imageWidth * 1, y: imageHeight * 2.5 } // Top left, narrower
		]; // Create a new trapezoid using a polygon shape

		let newTrapezoid = Matter.Bodies.fromVertices(x, y, trapezoidVertices, {
			render: {
				sprite: {
					texture: `/trophies/${chosenImage}.png`, // Use the chosen image name
					xScale: 2,
					yScale: 2,
					textureFilter: 'nearest'
				}
			},
			angle: Math.random() * Math.PI * 2 // Random angle in radians
		}); // Add the trapezoid to the world

		Matter.World.add(world, newTrapezoid); // Set a random angular velocity

		const angularVelocity = randomInRange(-0.1, 0.1);
		Matter.Body.setAngularVelocity(newTrapezoid, angularVelocity); // Set a random initial downward velocity (adjust values for desired speed)

		Matter.Body.setVelocity(newTrapezoid, { x: randomInRange(-10, 10), y: randomInRange(10, 15) });

		launchConfettiAtPosition(x / window.innerWidth, y / window.innerHeight);

		return newTrapezoid;
	}

	export function destroyTrophy(rigidbody) {
		const position = rigidbody.position;

		Matter.World.remove(world, rigidbody);

		launchConfettiAtPosition(position.x / window.innerWidth, position.y / window.innerHeight);
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
