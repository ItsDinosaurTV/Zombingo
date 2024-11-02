<script context="module" lang="ts">
	import Matter from 'matter-js';
	import { randomInRange, rotateAroundPoint, rotateVector } from './utils/mathUtils';
	import { beforeUpdate } from 'svelte';
	import Page from '../routes/+page.svelte';

	let engine: Matter.Engine;
	let world: Matter.World;
	let renderer: Matter.Render;
	let mouseConstraint: Matter.MouseConstraint;
	let walls: Matter.Body[];

	let currentOrientation = 0;

	function clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(value, max));
	}

	function rotateCanvas(event: ScreenOrientation) {
		// Get the screen bounds
		const screenSize = { x: window.innerWidth, y: window.innerHeight };
		const screenCenter = { x: screenSize.x / 2, y: screenSize.y / 2 };

		// Use screen.orientation.angle to get the current orientation
		const newOrientation = window.screen.orientation.angle;
		// Calculate the difference in orientation
		let orientationDifference = (currentOrientation - newOrientation) % 360;
		if (orientationDifference < 0) {
			orientationDifference += 360;
		}
		currentOrientation = newOrientation; // Update the initial orientation

		const angleInRadians = (orientationDifference * Math.PI) / 180;

		const newSize = rotateVector(screenSize, angleInRadians);
		newSize.x = Math.abs(newSize.x);
		newSize.y = Math.abs(newSize.y);

		// Only rotate dynamic bodies
		Matter.Composite.allBodies(world).forEach((body) => {
			if (!body.isStatic) {
				const rotatedVelocity = rotateVector(body.velocity, angleInRadians);

				// Rotate position
				const newPosition = rotateAroundPoint(body.position, screenCenter, angleInRadians);

				if (newPosition.x < 0 || newPosition.x > newSize.x) {
					newPosition.x = newSize.x / 2;
					rotatedVelocity.x = 0;
				}

				if (newPosition.y < 0 || newPosition.y > newSize.y) {
					newPosition.y = newSize.y / 2;
					rotatedVelocity.y = 0;
				}

				// set position
				Matter.Body.setPosition(body, newPosition);

				// Rotate velocity
				Matter.Body.setVelocity(body, rotatedVelocity);

				// Rotate the angle
				Matter.Body.setAngle(body, body.angle + angleInRadians);

				// Wake up the body if it was asleep
				Matter.Sleeping.set(body, false);
			}
		});
	}

	function resizeCanvas(event) {
		const outerWidth = window.outerWidth;
		const outerHeight = window.outerHeight;

		// Update Matter.js renderer's canvas size
		renderer.options.width = outerWidth;
		renderer.options.height = outerHeight;

		// Update the canvas style to match the new dimensions
		renderer.canvas.style.width = `${outerWidth}px`;
		renderer.canvas.style.height = `${outerHeight}px`;

		// Update renderer options to match the new screen dimensions
		renderer.canvas.width = outerWidth * window.devicePixelRatio;
		renderer.canvas.height = outerHeight * window.devicePixelRatio;

		const screenWidth = window.innerWidth;
		const screenHeight = window.innerHeight;
		const thickness = 1000;
		const buffer = 490;

		// Reposition the walls to the edges of the new screen size
		Matter.Body.setPosition(walls[0], { x: screenWidth / 2, y: -buffer }); // Top wall
		Matter.Body.setPosition(walls[1], { x: screenWidth / 2, y: screenHeight + buffer }); // Bottom wall
		Matter.Body.setPosition(walls[2], { x: -buffer, y: screenHeight / 2 }); // Left wall
		Matter.Body.setPosition(walls[3], { x: screenWidth + buffer, y: screenHeight / 2 }); // Right wall

		// Directly update the size of the walls
		Matter.Body.setVertices(
			walls[0],
			Matter.Bodies.rectangle(screenWidth / 2, 0, screenWidth, thickness).vertices
		);
		Matter.Body.setVertices(
			walls[1],
			Matter.Bodies.rectangle(screenWidth / 2, screenHeight, screenWidth, thickness).vertices
		);
		Matter.Body.setVertices(
			walls[2],
			Matter.Bodies.rectangle(0, screenHeight / 2, thickness, screenHeight).vertices
		);
		Matter.Body.setVertices(
			walls[3],
			Matter.Bodies.rectangle(screenWidth, screenHeight / 2, thickness, screenHeight).vertices
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
		const thickness = 1000;
		const buffer = 490;

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

	export function spawnTrophy(point: { x: number; y: number }) {
		const imageWidth = 30; // Set this to the width of your PNG
		const imageHeight = 30; // Set this to the height of your PNG
		// Randomly pick a trophy image from the list

		const trophyImages = ['trophy1', 'trophy2', 'trophy3', 'trophy4', 'trophy5'];
		const randomIndex = Math.floor(Math.random() * trophyImages.length);
		const chosenImage = trophyImages[randomIndex]; // Generate a random x position between 0 and the window width minus the trophy's width

		// Create a new trapezoid using a polygon shape, why is it jagged who fuckin knows
		const trapezoidVertices: Matter.Vector[][] = [
			[
				{ x: -imageWidth * 1, y: -imageHeight * 1 }, // Bottom left
				{ x: imageWidth * 1, y: -imageHeight * 1 }, // Bottom right
				{ x: imageWidth * 0.25, y: imageHeight * 1 }, // Top right, narrower
				{ x: -imageWidth * 0.25, y: imageHeight * 1 } // Top left, narrower
			]
		];

		// Add the trapezoid to the world
		const newTrapezoid = Matter.Bodies.fromVertices(point.x, point.y, trapezoidVertices, {
			render: {
				sprite: {
					texture: `/trophies/${chosenImage}.png`, // Use the chosen image name
					xScale: 1,
					yScale: 1
				}
			},
			angle: Math.random() * Math.PI * 2, // Random angle in radians
			mass: 1
		});

		Matter.World.add(world, newTrapezoid); // Set a random angular velocity

		const angularVelocity = randomInRange(-0.1, 0.1);
		Matter.Body.setAngularVelocity(newTrapezoid, angularVelocity); // Set a random initial downward velocity (adjust values for desired speed)

		Matter.Body.setVelocity(newTrapezoid, {
			x: randomInRange(-10, 10),
			y: randomInRange(-0.02, -0.03) * window.innerHeight
		});

		return newTrapezoid;
	}

	export function destroyTrophy(rigidBody: Matter.Body) {
		Matter.World.remove(world, rigidBody);

		// Only rotate dynamic bodies
		Matter.Composite.allBodies(world).forEach((body) => {
			if (!body.isStatic) {
				Matter.Sleeping.set(body, false); // Wake up the body
			}
		});
	}

	function handleDeviceMotion(event: DeviceMotionEvent) {
		if (event.accelerationIncludingGravity == null) return;

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
			if (!body.isStatic) {
				// Apply a force proportional to the acceleration
				const forceX = rotatedAcceleration.x * -0.00025; // Scale down the force for realism
				const forceY = rotatedAcceleration.y * 0.00025; // Scale down the force for realism

				// Apply the force to the center of the body
				Matter.Body.applyForce(body, body.position, { x: forceX, y: forceY });
			}
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
