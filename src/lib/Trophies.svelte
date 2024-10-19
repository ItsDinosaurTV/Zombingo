<script context="module" lang="ts">
	import Matter from 'matter-js';
	import { launchConfettiAtPosition } from './ConfettiLauncher.svelte';

	let engine: Matter.Engine;
	let world: Matter.World;
	let renderer: Matter.Render;
	let mouseConstraint: Matter.MouseConstraint;
	let walls: Matter.Body[];

	let currentOrientation = 0;

	function rotateCanvas() {
		const screenCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

		// Use screen.orientation.angle to get the current orientation
		const newOrientation = window.screen.orientation.angle;

		// Calculate the difference in orientation
		const orientationDifference = currentOrientation - newOrientation;
		currentOrientation = newOrientation; // Update the initial orientation

		const angleInRadians = (orientationDifference * Math.PI) / 180;

		// Only rotate dynamic bodies
		Matter.Composite.allBodies(world).forEach((body) => {
			if (!body.isStatic) {
				const newPosition = rotateAroundPoint(body.position, screenCenter, angleInRadians);

				Matter.Body.setPosition(body, newPosition);
				Matter.Body.setAngle(body, body.angle + angleInRadians);
				Matter.Sleeping.set(body, false); // Wake up the body
			}
		});
	}

	function resizeCanvas() {
		const width = window.outerWidth;
		const height = window.outerHeight;
		const thickness = 200;
		const buffer = 90;

		// Update Matter.js renderer's canvas size
		renderer.options.width = width;
		renderer.options.height = height;

		// Update the canvas style to match the new dimensions
		renderer.canvas.style.width = `${width}px`;
		renderer.canvas.style.height = `${height}px`;

		// Update renderer options to match the new screen dimensions
		renderer.canvas.width = width * window.devicePixelRatio;
		renderer.canvas.height = height * window.devicePixelRatio;

		// Reposition the walls to the edges of the new screen size
		Matter.Body.setPosition(walls[0], { x: width / 2, y: -buffer }); // Top wall
		Matter.Body.setPosition(walls[1], { x: width / 2, y: height + buffer }); // Bottom wall
		Matter.Body.setPosition(walls[2], { x: -buffer, y: height / 2 }); // Left wall
		Matter.Body.setPosition(walls[3], { x: width + buffer, y: height / 2 }); // Right wall

		// Directly update the size of the walls
		Matter.Body.setVertices(
			walls[0],
			Matter.Bodies.rectangle(width / 2, 0, width, thickness).vertices
		);
		Matter.Body.setVertices(
			walls[1],
			Matter.Bodies.rectangle(width / 2, height, width, thickness).vertices
		);
		Matter.Body.setVertices(
			walls[2],
			Matter.Bodies.rectangle(0, height / 2, thickness, height).vertices
		);
		Matter.Body.setVertices(
			walls[3],
			Matter.Bodies.rectangle(width, height / 2, thickness, height).vertices
		);
	}

	export function initPhysics(objectElement: HTMLElement) {
		// Initial orientation setting
		currentOrientation = window.screen.orientation.angle;

		// Create an engine
		engine = Matter.Engine.create({ enableSleeping: true });
		world = engine.world;

		// Create renderer
		renderer = Matter.Render.create({
			element: objectElement,
			engine: engine,
			options: {
				width: window.innerWidth,
				height: window.innerHeight,
				pixelRatio: window.devicePixelRatio,
				wireframes: false,
				background: 'transparent',
				showSleeping: false
			}
		});

		// Create walls
		const width = window.innerWidth;
		const height = window.innerHeight;
		const thickness = 200;
		const buffer = 90;

		const wallOptions = {
			friction: 0.5,
			frictionStatic: 0.7,
			frictionAir: 0,
			isStatic: true,
			render: {
				visible: false
			}
		};
		walls = [
			Matter.Bodies.rectangle(width / 2, -buffer, width, thickness, wallOptions),
			Matter.Bodies.rectangle(width / 2, height + buffer, width, thickness, wallOptions),
			Matter.Bodies.rectangle(-buffer, height / 2, thickness, height, wallOptions),
			Matter.Bodies.rectangle(width + buffer, height / 2, thickness, height, wallOptions)
		];

		// Add walls to the world
		Matter.World.add(world, walls);

		// Add mouse control
		const mouse = Matter.Mouse.create(objectElement);
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

			// Filter out static objects from clickedBodies
			const dynamicClickedBodies = clickedBodies.filter((body) => !body.isStatic);

			if (dynamicClickedBodies.length === 0) {
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
		window.addEventListener('orientationchange', rotateCanvas);

		// Add event listener for device motion (acceleration)
		window.addEventListener('devicemotion', handleDeviceMotion);

		// Add event listener for device orientation (tilt)
		//window.addEventListener('deviceorientation', handleDeviceOrientation);

		return () => {
			window.removeEventListener('resize', resizeCanvas);
			window.removeEventListener('orientationchange', rotateCanvas);

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

		// Create a new trapezoid using a polygon shape, why is it jagged who fuckin knows
		const trapezoidVertices: Matter.Vector[][] = [
			[
				{ x: -imageWidth * 2.5, y: -imageHeight * 2.5 }, // Bottom left
				{ x: imageWidth * 2.5, y: -imageHeight * 2.5 }, // Bottom right
				{ x: imageWidth * 1, y: imageHeight * 2.5 }, // Top right, narrower
				{ x: -imageWidth * 1, y: imageHeight * 2.5 } // Top left, narrower
			]
		];

		const spawnPoint = {
			x: randomInRange(0.4, 0.6) * window.innerWidth,
			y: randomInRange(0.4, 0.6) * window.innerHeight
		};

		// Add the trapezoid to the world
		const newTrapezoid = Matter.Bodies.fromVertices(spawnPoint.x, spawnPoint.y, trapezoidVertices, {
			render: {
				sprite: {
					texture: `/trophies/${chosenImage}.png`, // Use the chosen image name
					xScale: 2,
					yScale: 2
				}
			},
			angle: Math.random() * Math.PI * 2 // Random angle in radians
		});

		Matter.World.add(world, newTrapezoid); // Set a random angular velocity

		const angularVelocity = randomInRange(-0.1, 0.1);
		Matter.Body.setAngularVelocity(newTrapezoid, angularVelocity); // Set a random initial downward velocity (adjust values for desired speed)

		Matter.Body.setVelocity(newTrapezoid, { x: randomInRange(-10, 10), y: randomInRange(-10, 10) });

		launchConfettiAtPosition(spawnPoint.x / window.innerWidth, spawnPoint.y / window.innerHeight);

		return newTrapezoid;
	}

	export function destroyTrophy(rigidBody: Matter.Body) {
		const position = rigidBody.position;

		Matter.World.remove(world, rigidBody);

		// Only rotate dynamic bodies
		Matter.Composite.allBodies(world).forEach((body) => {
			if (!body.isStatic) {
				Matter.Sleeping.set(body, false); // Wake up the body
			}
		});

		launchConfettiAtPosition(position.x / window.innerWidth, position.y / window.innerHeight);
	}

	function handleDeviceMotion(event) {
		if (
			Math.abs(event.accelerationIncludingGravity.x) <= 1 ||
			Math.abs(event.accelerationIncludingGravity.y) <= 1
		) {
			return;
		}
		// Convert the angle from degrees to radians
		const angleInRadians = (currentOrientation * Math.PI) / 180;

		// Rotate the acceleration vector based on the current orientation
		const rotatedAcceleration = rotateVector(event.accelerationIncludingGravity, angleInRadians);

		// Loop through all bodies in the world and apply force
		Matter.Composite.allBodies(engine.world).forEach((body) => {
			// Apply a force proportional to the acceleration
			const forceX = rotatedAcceleration.x * -0.001; // Scale down the force for realism
			const forceY = rotatedAcceleration.y * 0.001; // Scale down the force for realism

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

	// utility
	function rotateVector(point: { x: number; y: number }, angleInRadians: number) {
		if (angleInRadians === 0) return point;

		// Rotate the vector
		const rotatedX = point.x * Math.cos(angleInRadians) - point.y * Math.sin(angleInRadians);
		const rotatedY = point.x * Math.sin(angleInRadians) + point.y * Math.cos(angleInRadians);

		return { x: rotatedX, y: rotatedY };
	}

	function randomInRange(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}

	function rotateAroundPoint(
		point: { x: number; y: number },
		center: { x: number; y: number },
		angleInRadians: number
	) {
		if (angleInRadians === 0) return point;

		// Calculate the current position relative to the point
		const relativePosition = {
			x: point.x - center.x,
			y: point.y - center.y
		};

		// Rotate the relative position
		const rotatedPosition = rotateVector(relativePosition, angleInRadians);

		// Calculate the new absolute position, flipped
		const newPosition = {
			x: rotatedPosition.x + center.y,
			y: rotatedPosition.y + center.x
		};

		return newPosition;
	}
</script>
